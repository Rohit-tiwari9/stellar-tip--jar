/**
 * STELLAR TIP JAR · app.js

"use strict";

/* ── CONFIGURATION ──────────────────────────────────────── */
const CONFIG = {
  HORIZON_URL:    "https://horizon-testnet.stellar.org",
  NETWORK_PASS:   StellarSdk.Networks.TESTNET,
  FRIENDBOT_URL:  "https://friendbot.stellar.org",
  EXPLORER_BASE:  "https://stellar.expert/explorer/testnet",

  // The tip jar's destination wallet (replace with your own G... address)
  TIP_JAR_ADDR:   "GC5HWVXWVVDDTHOFGGJBVEYQQ4GOHJ63T3ZN3NT3MJLR2IVTQLJ7ZDP5",

  DETECT_RETRIES: 10,    // how many times to probe for Freighter
  DETECT_DELAY:   300,   // ms between probes
};

/* ── STATE ──────────────────────────────────────────────── */
const state = {
  freighter:        null,   // resolved Freighter API object
  freighterFound:   false,
  walletAddress:    null,
  balance:          null,
  selectedAmount:   null,
  busy:             false,
};

/* ── STELLAR HORIZON SERVER ─────────────────────────────── */
const server = new StellarSdk.Horizon.Server(CONFIG.HORIZON_URL);

/* ── DOM READY ──────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", async () => {
  drawBackground();
  renderQR(CONFIG.TIP_JAR_ADDR);
  displayJarAddress();
  await detectFreighter();
});

/* ══════════════════════════════════════════════════════════
   FIX 1 · FREIGHTER DETECTION
   Freighter injects itself asynchronously after page load.
   We must POLL window for the extension object rather than
   checking once synchronously at DOMContentLoaded.
   Supports both old API (window.freighterApi) and new API
   (window.freighter) introduced in Freighter v2.
   ══════════════════════════════════════════════════════════ */
async function detectFreighter() {
  for (let i = 0; i < CONFIG.DETECT_RETRIES; i++) {
    // New Freighter v2+ API shape
    if (window.freighter && typeof window.freighter.isConnected === "function") {
      state.freighter    = window.freighter;
      state.freighterFound = true;
      console.log("✅ Freighter v2 detected (window.freighter)");
      await tryAutoReconnect();
      return;
    }
    // Legacy Freighter API shape (still common)
    if (window.freighterApi && typeof window.freighterApi.isConnected === "function") {
      state.freighter    = window.freighterApi;
      state.freighterFound = true;
      console.log("✅ Freighter (legacy) detected (window.freighterApi)");
      await tryAutoReconnect();
      return;
    }
    await sleep(CONFIG.DETECT_DELAY);
  }

  // Not found after all retries
  console.warn("⚠️ Freighter not detected after", CONFIG.DETECT_RETRIES, "probes");
  document.getElementById("freighterAlert").style.display = "flex";
  updateStatus("not-installed");
}

/* ══════════════════════════════════════════════════════════
   FIX 2 · AUTO-RECONNECT on page load
   If the user already granted access in a previous session,
   silently restore the wallet without prompting again.
   ══════════════════════════════════════════════════════════ */
async function tryAutoReconnect() {
  try {
    const connected = await state.freighter.isConnected();
    // isConnected() returns { isConnected: bool } OR plain bool depending on version
    const isConn = connected?.isConnected ?? connected;
    if (!isConn) return;

    const addr = await resolveAddress();
    if (addr) {
      await onConnected(addr);
      console.log("🔄 Auto-reconnected:", addr);
    }
  } catch (e) {
    console.log("Auto-reconnect skipped:", e.message);
  }
}

/* ══════════════════════════════════════════════════════════
   FIX 2 + FIX 3 · WALLET CONNECT FLOW
   Correct sequence: isConnected → requestAccess → getAddress.
   requestAccess() opens the popup. On subsequent calls it
   just resolves if already granted (no repeated popup).
   ══════════════════════════════════════════════════════════ */
async function connectWallet() {
  if (!state.freighterFound) {
    showToast("Freighter wallet not found. Please install it.", "error");
    window.open("https://www.freighter.app/", "_blank", "noopener");
    return;
  }
  if (state.busy) return;
  state.busy = true;
  setWalletBtnLoading(true);

  try {
    // Step 1 — request permission (opens Freighter popup if needed)
    // FIX: must call requestAccess before getPublicKey/getAddress
    if (typeof state.freighter.requestAccess === "function") {
      const accessResult = await state.freighter.requestAccess();
      if (accessResult?.error) throw new Error(accessResult.error);
    }

    // Step 2 — resolve the public key
    const addr = await resolveAddress();
    if (!addr) throw new Error("Could not retrieve wallet address. Please unlock Freighter.");

    await onConnected(addr);
  } catch (err) {
    console.error("Connect error:", err);
    const msg = userFriendlyConnectError(err.message);
    showToast(msg, "error");
    updateStatus("disconnected");
  } finally {
    state.busy = false;
    setWalletBtnLoading(false);
  }
}

/* ══════════════════════════════════════════════════════════
   FIX 3 · PUBLIC KEY RESOLUTION
   Freighter v1 returns a string from getPublicKey().
   Freighter v2 returns { address: "G..." } from getAddress().
   We handle BOTH shapes in one function.
   ══════════════════════════════════════════════════════════ */
async function resolveAddress() {
  // Try new API first
  if (typeof state.freighter.getAddress === "function") {
    const result = await state.freighter.getAddress();
    if (result?.error) throw new Error(result.error);
    const addr = result?.address || result;
    if (typeof addr === "string" && addr.startsWith("G")) return addr;
  }
  // Fallback to legacy API
  if (typeof state.freighter.getPublicKey === "function") {
    const result = await state.freighter.getPublicKey();
    if (result?.error) throw new Error(result.error);
    const addr = result?.publicKey || result;
    if (typeof addr === "string" && addr.startsWith("G")) return addr;
  }
  return null;
}

/* ── ON CONNECTED ───────────────────────────────────────── */
async function onConnected(address) {
  state.walletAddress = address;
  updateStatus("connected");
  showInfoBar(address);
  updateSendButton();
  await fetchBalance();
  await loadHistory();
  showToast("Wallet connected! ✦", "success");
  document.getElementById("historyCard").style.display = "block";
}

/* ══════════════════════════════════════════════════════════
   FIX 4 · DISCONNECT
   Freighter has no programmatic logout. Best practice is to
   clear all local state and update UI. User must disconnect
   manually inside Freighter extension for a full reset.
   ══════════════════════════════════════════════════════════ */
function disconnectWallet() {
  state.walletAddress  = null;
  state.balance        = null;
  state.selectedAmount = null;

  document.getElementById("infoBar").style.display    = "none";
  document.getElementById("historyCard").style.display = "none";
  clearTxFeedback();
  updateStatus("disconnected");
  updateSendButton();
  showToast("Wallet disconnected", "info");
  console.log("🔌 Wallet state cleared");
}

/* ── WALLET BUTTON HANDLER ──────────────────────────────── */
function handleWalletButton() {
  if (state.walletAddress) {
    disconnectWallet();
  } else {
    connectWallet();
  }
}

/* ── STATUS UI ──────────────────────────────────────────── */
function updateStatus(status) {
  const dot  = document.getElementById("statusDot");
  const text = document.getElementById("statusText");
  const btn  = document.getElementById("walletBtn");
  const label = document.getElementById("walletBtnLabel");

  dot.classList.remove("connected");

  switch (status) {
    case "connected":
      dot.classList.add("connected");
      text.textContent  = "Connected";
      btn.classList.add("connected");
      label.textContent = "Disconnect";
      break;
    case "not-installed":
      text.textContent = "Not Installed";
      btn.classList.remove("connected");
      label.textContent = "Install Freighter";
      break;
    default: // disconnected
      text.textContent = "Not Connected";
      btn.classList.remove("connected");
      label.textContent = "Connect Wallet";
  }
}

function setWalletBtnLoading(loading) {
  const label = document.getElementById("walletBtnLabel");
  label.textContent = loading ? "Connecting…" : (state.walletAddress ? "Disconnect" : "Connect Wallet");
  document.getElementById("walletBtn").disabled = loading;
}

function showInfoBar(address) {
  const bar = document.getElementById("infoBar");
  bar.style.display = "flex";
  document.getElementById("infoAddress").textContent =
    address.slice(0, 8) + "…" + address.slice(-6);
  document.getElementById("infoAddress").title = address;
  document.getElementById("infoBalance").textContent = "Loading…";
}

/* ══════════════════════════════════════════════════════════
   FIX 5 · BALANCE FETCH WITH PROPER ERROR HANDLING
   ══════════════════════════════════════════════════════════ */
async function fetchBalance() {
  if (!state.walletAddress) return;

  document.getElementById("infoBalance").textContent = "Syncing…";

  try {
    const account = await server.loadAccount(state.walletAddress);
    const native  = account.balances.find(b => b.asset_type === "native");
    state.balance = native ? parseFloat(native.balance) : 0;

    const fmt = state.balance.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
    document.getElementById("infoBalance").textContent = `${fmt} XLM`;

  } catch (err) {
    if (err?.response?.status === 404) {
      document.getElementById("infoBalance").textContent = "Unfunded";
      showToast("Account not funded. Use Friendbot to add test XLM.", "error");
    } else {
      document.getElementById("infoBalance").textContent = "Error";
      console.error("Balance fetch error:", err);
    }
  }
}

/* ── TIP AMOUNT SELECTION ───────────────────────────────── */
function selectAmount(amount) {
  state.selectedAmount = amount;
  document.getElementById("customAmt").value = "";
  highlightTipBtn(amount);
  showSelectedAmount(amount);
  updateSendButton();
}

function onCustomInput(val) {
  const amount = parseFloat(val);
  state.selectedAmount = amount > 0 ? amount : null;
  // Clear preset button highlights
  document.querySelectorAll(".tip-btn").forEach(b => b.classList.remove("selected"));
  showSelectedAmount(state.selectedAmount);
  updateSendButton();
}

function highlightTipBtn(amount) {
  document.querySelectorAll(".tip-btn").forEach(b => {
    b.classList.toggle("selected", parseFloat(b.dataset.amount) === amount);
  });
}

function showSelectedAmount(amount) {
  const row = document.getElementById("selectedRow");
  if (amount && amount > 0) {
    row.style.display = "flex";
    document.getElementById("selectedAmt").textContent = amount;
  } else {
    row.style.display = "none";
  }
}

function updateSendButton() {
  const btn  = document.getElementById("sendBtn");
  const text = document.getElementById("sendBtnContent");
  const connected = !!state.walletAddress;
  const hasAmt    = state.selectedAmount && state.selectedAmount > 0;

  if (!connected) {
    btn.disabled = true;
    text.innerHTML = `<svg class="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Connect Wallet to Tip`;
    return;
  }
  if (!hasAmt) {
    btn.disabled = true;
    text.innerHTML = `<svg class="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Select an Amount`;
    return;
  }
  btn.disabled = false;
  text.innerHTML = `<svg class="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send ${state.selectedAmount} XLM Tip`;
}

/* ══════════════════════════════════════════════════════════
   FIX 5 + FIX 6 · SEND TIP — FULL TRANSACTION FLOW
   Builds TX with Stellar SDK, signs with Freighter,
   submits to Horizon testnet. Full error handling.
   ══════════════════════════════════════════════════════════ */
async function sendTip() {
  if (!state.walletAddress)  return showToast("Connect wallet first.", "error");
  if (!state.selectedAmount) return showToast("Select an amount.", "error");
  if (state.busy)            return;

  const amount      = state.selectedAmount;
  const destination = CONFIG.TIP_JAR_ADDR;
  const memo        = document.getElementById("memoInput").value.trim().slice(0, 28);

  /* ── Pre-flight validation ── */
  if (!isValidStellarAddress(destination)) {
    return showFeedback("error", "❌ Invalid tip jar address configured.");
  }
  if (state.walletAddress === destination) {
    return showFeedback("error", "❌ Cannot tip yourself.");
  }
  if (state.balance !== null && amount > state.balance - 1) {
    return showFeedback("error",
      `❌ Insufficient balance. You have ${state.balance?.toFixed(4) ?? "?"} XLM (min 1 XLM reserve required).`
    );
  }

  state.busy = true;
  document.getElementById("sendBtn").disabled = true;
  showFeedback("loading", "Building transaction…");

  try {
    /* Step 1 — Load source account sequence */
    let sourceAccount;
    try {
      sourceAccount = await server.loadAccount(state.walletAddress);
    } catch (e) {
      if (e?.response?.status === 404)
        throw new Error("Your account is not funded. Use Friendbot to add test XLM first.");
      throw e;
    }

    /* Step 2 — Check destination exists */
    try {
      await server.loadAccount(destination);
    } catch (e) {
      if (e?.response?.status === 404)
        throw new Error("Destination account does not exist on testnet.");
    }

    /* Step 3 — Build transaction */
    showFeedback("loading", "Waiting for Freighter signature…");
    let txBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee:               (await server.fetchBaseFee()).toString(),
      networkPassphrase: CONFIG.NETWORK_PASS,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination,
          asset:  StellarSdk.Asset.native(),
          amount: String(parseFloat(amount).toFixed(7)),
        })
      )
      .setTimeout(120);

    if (memo) {
      txBuilder = txBuilder.addMemo(StellarSdk.Memo.text(memo));
    }

    const transaction = txBuilder.build();
    const xdr         = transaction.toXDR();

    /* Step 4 — Sign with Freighter (FIX 3: handle both API shapes) */
    let signedXdr;
    if (typeof state.freighter.signTransaction === "function") {
      // Works for both legacy and v2 — pass networkPassphrase for safety
      const signResult = await state.freighter.signTransaction(xdr, {
        networkPassphrase: CONFIG.NETWORK_PASS,
        network:           "TESTNET",
      });
      if (signResult?.error) throw new Error(signResult.error);
      // FIX 3: v2 returns { signedTxXdr }, legacy returns the XDR string directly
      signedXdr = signResult?.signedTxXdr ?? signResult;
    } else {
      throw new Error("Freighter signTransaction not available.");
    }

    if (!signedXdr || typeof signedXdr !== "string") {
      throw new Error("Invalid signature received from Freighter.");
    }

    /* Step 5 — Submit to Horizon */
    showFeedback("loading", "Submitting to Stellar testnet…");
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, CONFIG.NETWORK_PASS);
    const response = await server.submitTransaction(signedTx);

    /* Step 6 — Success */
    const hash     = response.hash;
    const explorerUrl = `${CONFIG.EXPLORER_BASE}/tx/${hash}`;
    showFeedback("success",
      `✦ Tip of ${amount} XLM sent successfully!<br/>` +
      `<a class="tx-hash-link" href="${explorerUrl}" target="_blank" rel="noopener">` +
      `View on Explorer: ${hash.slice(0, 24)}… ↗</a>`
    );
    showToast(`${amount} XLM tip sent! ♥`, "success");

    /* Reset UI */
    state.selectedAmount = null;
    document.getElementById("customAmt").value = "";
    document.getElementById("memoInput").value = "";
    document.querySelectorAll(".tip-btn").forEach(b => b.classList.remove("selected"));
    showSelectedAmount(null);

    await fetchBalance();
    await loadHistory();

  } catch (err) {
    console.error("Send tip error:", err);
    showFeedback("error", "❌ " + parseHorizonError(err));
  } finally {
    state.busy = false;
    updateSendButton();
  }
}

/* ══════════════════════════════════════════════════════════
   FIX 5 · HORIZON ERROR PARSER
   Extracts human-readable messages from Horizon result_codes
   ══════════════════════════════════════════════════════════ */
function parseHorizonError(err) {
  try {
    const extras = err?.response?.data?.extras?.result_codes;
    if (extras) {
      const ops = extras.operations || [];
      const tx  = extras.transaction;
      if (ops.includes("op_underfunded"))      return "Insufficient XLM balance.";
      if (ops.includes("op_no_destination"))   return "Destination account not found. It may not be funded yet.";
      if (ops.includes("op_bad_auth"))         return "Authentication failed. Please reconnect wallet.";
      if (ops.includes("op_no_source_account"))return "Source account not found on testnet.";
      if (ops.includes("op_line_full"))        return "Destination account cannot receive more XLM.";
      if (tx === "tx_bad_seq")                 return "Sequence error. Please retry the transaction.";
      if (tx === "tx_insufficient_fee")        return "Transaction fee too low. Try again.";
      if (ops.length > 0)                      return `Operation failed: ${ops.join(", ")}`;
      if (tx)                                  return `Transaction failed: ${tx}`;
    }
  } catch (_) {}

  if (err?.message?.includes("User declined"))   return "Transaction was rejected in Freighter.";
  if (err?.message?.includes("rejected"))        return "Transaction was rejected in Freighter.";
  if (err?.message?.includes("Network request")) return "Network error. Check your connection.";
  return err?.message || "Unknown error. Check console for details.";
}

function userFriendlyConnectError(msg = "") {
  if (msg.includes("User declined") || msg.includes("rejected"))
    return "Connection rejected in Freighter. Try again.";
  if (msg.includes("not unlocked") || msg.includes("locked"))
    return "Freighter is locked. Please unlock it and retry.";
  if (msg.includes("not installed"))
    return "Freighter not installed. Install it at freighter.app.";
  return "Connection failed: " + msg;
}

/* ── TRANSACTION HISTORY ────────────────────────────────── */
async function loadHistory() {
  if (!state.walletAddress) return;
  const list = document.getElementById("historyList");
  list.innerHTML = `<div class="history-empty">Loading…</div>`;

  try {
    const payments = await server.payments()
      .forAccount(state.walletAddress)
      .limit(10).order("desc").call();

    const txs = payments.records.filter(p => p.type === "payment").slice(0, 5);
    if (txs.length === 0) {
      list.innerHTML = `<div class="history-empty">No transactions yet.</div>`;
      return;
    }

    list.innerHTML = "";
    txs.forEach(tx => {
      const isOut = tx.from === state.walletAddress;
      const peer  = isOut ? tx.to : tx.from;
      const date  = new Date(tx.created_at).toLocaleDateString("en-US", {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      });
      const sign = isOut ? "−" : "+";
      const cls  = isOut ? "out" : "in";
      const amt  = parseFloat(tx.amount).toFixed(4);
      const hash = tx.transaction_hash;

      const el = document.createElement("div");
      el.className = "history-item";
      el.innerHTML = `
        <div class="hist-left">
          <span class="hist-amt ${cls}">${sign}${amt} XLM</span>
          <span class="hist-peer">${isOut ? "To" : "From"}: ${peer.slice(0,10)}…${peer.slice(-6)}</span>
          <a class="hist-link" href="${CONFIG.EXPLORER_BASE}/tx/${hash}" target="_blank" rel="noopener">
            ${hash.slice(0,18)}… ↗
          </a>
        </div>
        <div class="hist-right">
          <span class="hist-date">${date}</span>
          <span class="hist-badge">Success</span>
        </div>`;
      list.appendChild(el);
    });

  } catch (err) {
    if (err?.response?.status === 404) {
      list.innerHTML = `<div class="history-empty">Account not funded yet. Use Friendbot to get test XLM.</div>`;
    } else {
      list.innerHTML = `<div class="history-empty">Could not load transactions.</div>`;
      console.error("History error:", err);
    }
  }
}

/* ── QR CODE (canvas-based, no library needed) ──────────── */
function renderQR(address) {
  // We generate a simple visual QR placeholder using canvas grid pattern.
  // For production, swap in qrcode.js or similar.
  const canvas = document.getElementById("qrCanvas");
  const ctx    = canvas.getContext("2d");
  const size   = canvas.width; // 160

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // Use address chars to create a deterministic pattern
  const cells  = 21;
  const cell   = Math.floor(size / cells);
  const chars  = address.split("").map(c => c.charCodeAt(0));

  ctx.fillStyle = "#000000";

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const idx = (r * cells + c) % chars.length;
      const val = (chars[idx] + r * 7 + c * 13) % 3;
      // Always-dark finder pattern corners
      const inCorner =
        (r < 7 && c < 7) ||
        (r < 7 && c >= cells - 7) ||
        (r >= cells - 7 && c < 7);

      if (inCorner || val === 0) {
        ctx.fillRect(c * cell + 2, r * cell + 2, cell - 1, cell - 1);
      }
    }
  }

  // Finder pattern borders (white inside corners)
  [[0,0],[0,cells-7],[cells-7,0]].forEach(([dr,dc]) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect((dc+1)*cell+2, (dr+1)*cell+2, 5*cell-2, 5*cell-2);
    ctx.fillStyle = "#000000";
    ctx.fillRect((dc+2)*cell+2, (dr+2)*cell+2, 3*cell-2, 3*cell-2);
  });

  // Center timing mark
  ctx.fillStyle = "#000000";
  for (let i = 8; i < cells-8; i += 2) {
    ctx.fillRect(i*cell+2, 6*cell+2, cell-1, cell-1);
    ctx.fillRect(6*cell+2, i*cell+2, cell-1, cell-1);
  }
}

/* ── JAR ADDRESS DISPLAY ────────────────────────────────── */
function displayJarAddress() {
  document.getElementById("jarAddrDisplay").textContent = CONFIG.TIP_JAR_ADDR;
  document.getElementById("jarAddrDisplay").title       = CONFIG.TIP_JAR_ADDR;
}

/* ── COPY HELPERS ───────────────────────────────────────── */
function copyAddress() {
  if (!state.walletAddress) return;
  navigator.clipboard.writeText(state.walletAddress)
    .then(() => showToast("Wallet address copied!", "success"))
    .catch(() => showToast("Copy failed.", "error"));
}

function copyJarAddress() {
  navigator.clipboard.writeText(CONFIG.TIP_JAR_ADDR)
    .then(() => showToast("Tip jar address copied!", "success"))
    .catch(() => showToast("Copy failed.", "error"));
}

/* ── ADDRESS VALIDATION ─────────────────────────────────── */
function isValidStellarAddress(addr) {
  return typeof addr === "string"
    && addr.startsWith("G")
    && addr.length === 56
    && /^[A-Z2-7]+$/.test(addr);
}

/* ── TX FEEDBACK ────────────────────────────────────────── */
function showFeedback(type, html) {
  const el = document.getElementById("txFeedback");
  el.style.display = "block";
  el.className     = `tx-feedback ${type}`;
  if (type === "loading") {
    el.innerHTML = `<div class="spinner"></div><span>${html}</span>`;
  } else {
    el.innerHTML = html;
  }
}

function clearTxFeedback() {
  const el = document.getElementById("txFeedback");
  el.style.display = "none";
  el.innerHTML     = "";
}

/* ── TOAST ──────────────────────────────────────────────── */
let toastTimer;
function showToast(msg, type = "") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className   = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}

/* ── BACKGROUND CANVAS ──────────────────────────────────── */
function drawBackground() {
  const canvas = document.getElementById("bgCanvas");
  const ctx    = canvas.getContext("2d");

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const stars = Array.from({ length: 120 }, () => ({
    x:   Math.random() * canvas.width,
    y:   Math.random() * canvas.height,
    r:   Math.random() * 1.5 + 0.3,
    op:  Math.random() * 0.6 + 0.1,
    spd: Math.random() * 0.003 + 0.001,
    t:   Math.random() * Math.PI * 2,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.t += s.spd;
      const alpha = s.op * (0.5 + 0.5 * Math.sin(s.t));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    });
    // Subtle nebula gradients
    const g1 = ctx.createRadialGradient(
      canvas.width * 0.2, canvas.height * 0.3, 0,
      canvas.width * 0.2, canvas.height * 0.3, 300
    );
    g1.addColorStop(0, "rgba(240,165,0,0.04)");
    g1.addColorStop(1, "transparent");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const g2 = ctx.createRadialGradient(
      canvas.width * 0.8, canvas.height * 0.7, 0,
      canvas.width * 0.8, canvas.height * 0.7, 280
    );
    g2.addColorStop(0, "rgba(79,158,255,0.04)");
    g2.addColorStop(1, "transparent");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    requestAnimationFrame(draw);
  }
  draw();
}

/* ── UTILITY ────────────────────────────────────────────── */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
