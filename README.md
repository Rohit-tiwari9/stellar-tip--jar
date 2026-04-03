# ✦ Stellar Tip Jar

<div align="center">

![Stellar](https://img.shields.io/badge/Stellar-Testnet-7B66FF?style=for-the-badge&logo=stellar&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Level](https://img.shields.io/badge/Level%201-White%20Belt-white?style=for-the-badge)

**A production-ready, beginner-friendly Stellar testnet Tip Jar dApp**

Send XLM tips instantly · No backend · No build tools · Just open and ship

[Live Demo](#-deployment) · [Quick Start](#-quick-start) · [How It Works](#-application-flow) · [Checklist](#-white-belt-level-1-checklist)

</div>

---

## 📖 Table of Contents

- [Project Description](#-project-description)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Application Flow](#-application-flow)
  - [Freighter Detection Flow](#1-freighter-detection-flow)
  - [Wallet Connection Flow](#2-wallet-connection-flow)
  - [Transaction Flow](#3-transaction-flow)
  - [Error Handling Flow](#4-error-handling-flow)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Freighter Wallet Setup](#-freighter-wallet-setup)
- [Get Test XLM](#-get-test-xlm-faucet)
- [Screenshots](#-screenshots)
- [Development Standards](#-development-standards)
- [Bug Fixes Applied](#-bug-fixes-applied)
- [Deployment](#-deployment)
- [White Belt Checklist](#-white-belt-level-1-checklist)
- [Resources](#-stellar-testnet-resources)
- [License](#-license)

---

## 🌟 Project Description

**Stellar Tip Jar** is a Level 1 White Belt decentralized application (dApp) built on the **Stellar testnet**. It enables anyone with a Freighter wallet to send XLM tips to a predefined tip jar address — directly from the browser, with zero backend infrastructure.

This project demonstrates the **complete fundamentals of Stellar Web3 development**:

- Detecting and connecting a browser wallet extension (Freighter)
- Reading live blockchain data (XLM balance via Horizon API)
- Building, signing, and submitting Stellar transactions
- Displaying real-time transaction feedback to the user
- Handling all error states gracefully with human-readable messages

The entire app is **pure HTML + CSS + JavaScript** loaded via CDN. No Node.js, no npm, no Webpack — just clone and serve.

> **Tip Jar Address:** `GC5HWVXWVVDDTHOFGGJBVEYQQ4GOHJ63T3ZN3NT3MJLR2IVTQLJ7ZDP5`
>here it is : https://rohit-tiwari9.github.io/stellar-tip--jar/

---

## ✨ Features

| Feature | Description |
|---|---|
| 🦊 **Freighter Wallet Connect** | Async polling detection supports both Freighter v1 (legacy) and v2+ API |
| 🔌 **Wallet Disconnect** | Clears all local state; informs user Freighter has no programmatic logout |
| 🔄 **Auto Session Restore** | Silently reconnects if user already granted permission in a previous visit |
| 💰 **Live XLM Balance** | Fetched from Horizon Testnet API on connect and after every transaction |
| 📤 **Send XLM Tips** | Preset amounts (1 / 5 / 10 / 25 XLM) plus fully custom amount input |
| 📝 **Optional Memo** | Add a 28-character message to any transaction |
| ✅ **Transaction Success State** | Green feedback with hash link to Stellar Expert Explorer |
| ❌ **Transaction Failure State** | Red feedback with plain-English error parsed from Horizon result codes |
| 📱 **Real QR Code** | Scannable QR via qrcode.js encoding a Stellar payment URI |
| 📋 **Copy Address** | One-click copy for both the tip jar address and your connected wallet address |
| 📜 **Transaction History** | Last 5 payments from the connected wallet with Explorer links |
| 📱 **Mobile Responsive** | Works on phones, tablets, and desktops |
| 🎨 **Dark Cosmic UI** | Animated star field, amber + blue palette, Cabinet Grotesk + DM Mono |

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [Stellar SDK](https://github.com/stellar/js-stellar-sdk) | `12.3.0` | Transaction building, Horizon API client |
| [Freighter API](https://docs.freighter.app/) | injected by extension | Wallet detection and transaction signing |
| [qrcode.js](https://github.com/davidshimjs/qrcodejs) | `1.0.0` | Real scannable QR code generation |
| [Horizon Testnet](https://horizon-testnet.stellar.org) | — | Balance fetch, payment history, tx submission |
| [Stellar Expert](https://stellar.expert/explorer/testnet) | — | Transaction Explorer deep-links |
| [Google Fonts](https://fonts.google.com) | — | Cabinet Grotesk (display), DM Mono (code) |
| Vanilla JS / HTML5 / CSS3 | ES2022 | Zero-dependency frontend logic |

> **No npm. No build step. No backend.** Every dependency loads via CDN.

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     STELLAR TIP JAR dApp                        │
│                    (Pure Static Frontend)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────┐    ┌──────────────┐    ┌─────────────────────┐  │
│   │index.html│    │   style.css  │    │       app.js        │  │
│   │  Layout  │◄───│  Dark Cosmic │    │  All Business Logic │  │
│   │  UI / UX │    │     Theme    │    │  Wallet · Tx · API  │  │
│   └────┬─────┘    └──────────────┘    └──────────┬──────────┘  │
│        │                                         │             │
│        └──────────────── Renders ────────────────┘             │
│                                                                 │
│                    CDN Scripts (loaded in HTML)                 │
│         ┌──────────────────┬──────────────────────┐            │
│         │  stellar-sdk.js  │   qrcode.min.js       │            │
│         │  (StellarSdk)    │   (QRCode class)      │            │
│         └──────────────────┴──────────────────────┘            │
│                                                                 │
│                    Browser Extension                            │
│         ┌──────────────────────────────────────────┐           │
│         │         Freighter Extension               │           │
│         │   window.freighter    (v2+ API)           │           │
│         │   window.freighterApi (v1 legacy API)     │           │
│         └──────────────────────────────────────────┘           │
│                                                                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │  HTTPS Calls (no CORS issues)
         ┌─────────────┼─────────────────────────┐
         ▼             ▼                         ▼
┌──────────────┐  ┌──────────┐   ┌──────────────────────────┐
│ Horizon API  │  │Friendbot │   │  Stellar Expert Explorer  │
│ Testnet      │  │ Faucet   │   │  (tx hash deep-links)     │
│              │  │          │   │                           │
│ /accounts    │  │ ?addr=G..|   │  /tx/{hash}               │
│ /payments    │  │          │   │                           │
│ /fee_stats   │  └──────────┘   └──────────────────────────┘
└──────────────┘
```

---

## 🔄 Application Flow

### 1. Freighter Detection Flow

> **The #1 bug in most Stellar dApps:** Browser extensions inject their `window` API asynchronously — often 100–800ms after `DOMContentLoaded`. A single synchronous check always fails, causing a false "not installed" error even when Freighter IS running.

```
Page Load → DOMContentLoaded fires
                │
                ▼
        detectFreighter() starts
        [Async polling loop — 16 attempts × 250ms = 4 seconds max]
                │
    ┌───────────┴────────────────────────────────────────────────┐
    │  Attempt 1 (t = 0ms)                                       │
    │    Check window.freighter    → undefined (not yet injected)│
    │    Check window.freighterApi → undefined (not yet injected)│
    │    sleep(250ms)                                            │
    │                                                            │
    │  Attempt 2 (t = 250ms)                                     │
    │    Check window.freighter    → FOUND ✅                    │
    │         │                                                  │
    └─────────┼──────────────────────────────────────────────────┘
              │
              ▼
    state.api = window.freighter
    state.freighterFound = true
              │
              ▼
    attemptAutoRestore()
      isConnected() → true? ──YES──► resolvePublicKey()
                      NO  ──────────► wait for user action
                                         │
                             ┌───────────┘
                             ▼
                   onWalletConnected(address)
                   [UI updates, balance fetch]

    [If ALL 16 attempts fail]
              │
              ▼
    installNotice → display: flex  ← only shown NOW
    setStatus("not-installed")
    [Zero false positives]
```

---

### 2. Wallet Connection Flow

```
User clicks "Connect Wallet"
              │
              ▼
    state.freighterFound?
    NO  ──► showToast("Install Freighter")
            window.open("freighter.app")
            return
    YES ──► continue
              │
              ▼
    state.busy = true  (prevent double-click race)
    walletBtnLabel → "Connecting…"
              │
              ▼
    ┌── requestAccess() ─────────────────────────────────────┐
    │   Opens Freighter permission popup (first time only)   │
    │   Resolves instantly if already permitted              │
    │   Returns { error } if user denies → throw             │
    └────────────────────────────────────────────────────────┘
              │
              ▼
    ┌── resolvePublicKey() ──────────────────────────────────┐
    │   Try getAddress()   → { address: "G..." }  (v2+ API)  │
    │   Try getPublicKey() → "G..." or { publicKey } (v1)    │
    │   Normalize → plain string "G..."                      │
    │   Validate  → starts with G, length 56, base32 chars   │
    └────────────────────────────────────────────────────────┘
              │
    FAIL ─────┤──► friendlyConnectError(msg)
              │    showToast(msg, "error")
              │    setStatus("disconnected")
              │
    SUCCESS ──┤
              ▼
    onWalletConnected(address)
      ├── state.walletAddress = address
      ├── setStatus("connected")         → green dot + pulse
      ├── renderInfoBar(address)         → show info bar
      ├── fetchBalance()                 → load XLM balance
      ├── loadHistory()                  → load last 5 txs
      └── document.getElementById("historyCard").show
```

---

### 3. Transaction Flow

```
User selects amount → clicks "Send X XLM Tip"
              │
              ▼
    ┌── Pre-flight Validation ───────────────────────────────┐
    │  1. Wallet connected?          NO → "Connect wallet"   │
    │  2. Amount > 0 selected?       NO → "Select amount"    │
    │  3. TIP_JAR_ADDRESS valid?     NO → "Invalid address"  │
    │  4. Not tipping yourself?      NO → "Cannot tip self"  │
    │  5. Balance ≥ amount + 1 XLM?  NO → "Insufficient"     │
    └────────────────────────────────────────────────────────┘
              │ All checks pass
              ▼
    state.busy = true
    sendBtn.disabled = true
    showTxFeedback("loading", "Building transaction…")
              │
              ▼
    horizonServer.loadAccount(walletAddress)
    → Fetches current sequence number (prevents replay attacks)
              │
              ▼
    horizonServer.loadAccount(TIP_JAR_ADDRESS)
    → Confirms destination exists on testnet
              │
              ▼
    horizonServer.fetchBaseFee()
    → Gets current network fee (prevents tx_insufficient_fee)
              │
              ▼
    ┌── Build Transaction ───────────────────────────────────┐
    │  new TransactionBuilder(sourceAccount, {               │
    │    fee: baseFee,                                       │
    │    networkPassphrase: Networks.TESTNET                 │
    │  })                                                    │
    │  .addOperation(Operation.payment({                     │
    │    destination: TIP_JAR_ADDRESS,                       │
    │    asset: Asset.native(),         ← XLM (Lumens)      │
    │    amount: "5.0000000"            ← 7 decimal places   │
    │  }))                                                   │
    │  .addMemo(Memo.text("Thank you")) ← if memo provided   │
    │  .setTimeout(180)                 ← 3 min expiry       │
    │  .build()                                              │
    └────────────────────────────────────────────────────────┘
              │
              ▼
    showTxFeedback("loading", "Waiting for Freighter to sign…")
              │
              ▼
    ┌── Sign via Freighter (NEVER exposes private key) ──────┐
    │  state.api.signTransaction(xdr, {                      │
    │    networkPassphrase: Networks.TESTNET,                │
    │    network: "TESTNET"                                  │
    │  })                                                    │
    │                                                        │
    │  Freighter popup opens → user confirms or cancels      │
    │                                                        │
    │  v1 response: signedXdr (plain string)                 │
    │  v2 response: { signedTxXdr: "..." }                   │
    │  Normalize: result?.signedTxXdr ?? result              │
    └────────────────────────────────────────────────────────┘
              │
    CANCELLED ┤──► "Transaction was cancelled in Freighter."
              │
    SIGNED ───┤
              ▼
    showTxFeedback("loading", "Submitting to Stellar testnet…")
              │
              ▼
    TransactionBuilder.fromXDR(signedXdr, NETWORK_PASS)
    horizonServer.submitTransaction(signedTx)
              │
    ┌─────────┴─────────────────────────────────────┐
    │                                               │
    FAIL                                          SUCCESS
    │                                               │
    ▼                                               ▼
parseHorizonError(err)              response.hash → txHash
showTxFeedback("error", msg)        showTxFeedback("success",
                                      "Tip sent! Explorer: txHash")
                                    fetchBalance()   ← auto-refresh
                                    loadHistory()    ← update list
                                    Reset UI state
```

---

### 4. Error Handling Flow

```
Any Error thrown or caught
              │
              ▼
    parseHorizonError(err)
              │
    Does err.response.data.extras.result_codes exist?
              │
              YES ──────────────────────────────────────────────┐
              │                                                 │
              │  operations[] codes:                           │
              │    "op_underfunded"      → "Insufficient XLM"  │
              │    "op_no_destination"   → "Destination not    │
              │                            found on testnet"   │
              │    "op_bad_auth"         → "Auth failed.       │
              │                            Reconnect wallet"   │
              │    "op_no_source_account"→ "Source not found.  │
              │                            Fund with Faucet"   │
              │    "op_line_full"        → "Destination full"   │
              │                                                 │
              │  transaction codes:                             │
              │    "tx_bad_seq"          → "Sequence error.    │
              │                            Please retry"       │
              │    "tx_insufficient_fee" → "Fee too low"       │
              │                                                 │
              │  fallback: join op codes with ", "             │
              └────────────────────────────────────────────────┘
              │
              NO ───────────────────────────────────────────────┐
              │                                                 │
              │  err.message pattern matching:                  │
              │    /declined|rejected|cancel/ → "Cancelled"    │
              │    /locked|unlock/           → "Unlock first"  │
              │    /network|fetch/           → "Network error" │
              │    fallback                  → err.message      │
              └────────────────────────────────────────────────┘
              │
              ▼
    showTxFeedback("error", humanReadableMessage)
    state.busy = false
    refreshSendButton() → re-enable
```

---

## 📁 Project Structure

```
stellar-tip-jar/
│
├── index.html          # App shell
│   ├── <nav>           # Sticky top nav with brand + wallet button
│   ├── #infoBar        # Address + balance + network (hidden until connect)
│   ├── #installNotice  # Freighter install prompt (hidden until needed)
│   ├── .tip-jar        # QR code + address side-by-side layout
│   ├── .tip-section    # Amount buttons + custom input + memo + send button
│   ├── #txFeedback     # Loading / success / error feedback area
│   ├── #historyCard    # Last 5 transactions (hidden until connect)
│   └── .how-grid       # 3-step "How it works" section
│
├── style.css           # Design system
│   ├── :root           # CSS custom properties (colors, radii, fonts)
│   ├── #bgCanvas       # Animated star background styling
│   ├── .topnav         # Navigation with blur backdrop
│   ├── .info-bar       # Wallet info strip
│   ├── .tip-jar        # QR + address flex layout
│   ├── .tip-grid       # 4-column amount button grid
│   ├── .send-btn       # Animated CTA button with shimmer effect
│   ├── .tx-feedback    # Loading / success / error states
│   ├── .hist-item      # Transaction history row
│   └── @media          # Mobile breakpoints (640px, 380px)
│
├── app.js              # All application logic
│   ├── CONFIG          # TIP_JAR_ADDRESS + CFG constants
│   ├── state           # Single state object (api, address, balance, etc)
│   ├── detectFreighter()      # Async polling detection (FIX 1)
│   ├── attemptAutoRestore()   # Session restore on page load
│   ├── connectWallet()        # requestAccess → resolve → connect (FIX 2)
│   ├── resolvePublicKey()     # v1 + v2 API normalization (FIX 3)
│   ├── disconnectWallet()     # State clear + UI reset (FIX 4)
│   ├── fetchBalance()         # Horizon loadAccount → XLM balance
│   ├── selectAmount()         # Button highlight + preview update
│   ├── sendTip()              # Full tx: validate→build→sign→submit
│   ├── loadHistory()          # Last 5 payments from Horizon
│   ├── generateQRCode()       # qrcode.js real QR (FIX 5)
│   ├── parseHorizonError()    # result_codes → plain English (FIX 7)
│   ├── showTxFeedback()       # loading/success/error UI state
│   ├── showToast()            # Auto-dismiss notification
│   └── startBackgroundAnimation()  # Canvas star field RAF loop
│
└── README.md           # This file
```

---

## ⚡ Quick Start

> **⚠️ Important:** Freighter requires pages served over **HTTP or HTTPS**.  
> Opening `index.html` as `file://` **blocks** the extension injection.  
> Use any local server — it takes under 10 seconds to set up.

### Step 1 — Clone

```bash
git clone https://github.com/YOUR_USERNAME/stellar-tip-jar.git
cd stellar-tip-jar
```

### Step 2 — Serve locally

```bash
# Option A — Node.js (recommended, zero install)
npx serve .
# → http://localhost:3000

# Option B — Python 3 (built-in, no install)
python3 -m http.server 8080
# → http://localhost:8080

# Option C — VS Code Live Server
# Right-click index.html → "Open with Live Server"

# Option D — Node http-server
npx http-server . -p 8080 --cors
# → http://localhost:8080
```

### Step 3 — Open

```
http://localhost:3000
```

### Step 4 — Connect Freighter and tip!

---

## 🦊 Freighter Wallet Setup

Freighter is the official Stellar browser wallet extension.

### Install

| Browser | Link |
|---|---|
| Chrome / Brave | [Chrome Web Store](https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk) |
| Firefox | [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/freighter/) |
| Official site | [freighter.app](https://www.freighter.app/) |

### Switch to Testnet (Required)

```
1. Click the Freighter icon in your browser toolbar
2. Create a new wallet (or import existing with seed phrase)
3. Click the gear icon (⚙) — Settings
4. Select Preferences
5. Under Network → choose Test Net
6. Confirm the "TEST NET" badge appears in Freighter's header
```

> **Important:** The dApp ONLY works on Testnet. Do NOT send real XLM here.

### Connect to the dApp

```
1. Open http://localhost:3000
2. Click "Connect Wallet" (top-right)
3. Freighter popup appears → click "Connect"
4. Info bar appears with your address + balance
```

---

## 🪣 Get Test XLM (Faucet)

Your testnet wallet starts with 0 XLM. Fund it for free:

### Method 1 — Friendbot URL (fastest)

```
https://friendbot.stellar.org/?addr=YOUR_G_ADDRESS
```

Paste your public key from Freighter. You receive **10,000 test XLM** instantly.

### Method 2 — Stellar Laboratory

1. Visit [laboratory.stellar.org/#account-creator?network=test](https://laboratory.stellar.org/#account-creator?network=test)
2. Paste your public key
3. Click **Get test network lumens**

### Method 3 — curl (terminal)

```bash
curl "https://friendbot.stellar.org/?addr=GYOUR_ADDRESS_HERE"
```

---

## 📸 Screenshots

### ① Wallet Connected State

The sticky nav shows a green pulsing status dot with "Connected" label. The info bar slides in below the nav, displaying:
- Your wallet address (truncated: `GBPLVN…6VKWC5`) with a copy button
- Live balance (e.g., `9,998.50 XLM`) with a refresh button
- Network badge: `Testnet`

The Connect Wallet button changes to "Disconnect" with a red border.

---

### ② Balance Displayed

Balance is fetched from:
```
GET https://horizon-testnet.stellar.org/accounts/{address}
```

The `native` balance entry is extracted and displayed as:
```
9,998.5000 XLM
```

The balance auto-refreshes after every successful tip transaction.

---

### ③ Successful Transaction

After a tip is sent and confirmed by Horizon, a green feedback box appears:

```
✦ Tip of 5 XLM sent successfully!
View on Stellar Explorer: a4f8c21d3b9e0f7c… ↗
```

The hash is a clickable link opening `stellar.expert/explorer/testnet/tx/{hash}`.

---

### ④ Transaction Failure

If something goes wrong, a red feedback box appears with a plain-English message:

```
❌ Insufficient XLM balance.
```

Instead of raw Horizon error codes like `op_underfunded`, the dApp translates all known codes to human-readable text.

---

### ⑤ QR Code

A real, scannable QR code is generated by qrcode.js encoding:
```
web+stellar:pay?destination=GC5HWVXWVVDDTHOFGGJBVEYQQ4GOHJ63T3ZN3NT3MJLR2IVTQLJ7ZDP5&memo=Tip&memo_type=MEMO_TEXT
```

The full address is displayed beside the QR with a Copy button.

---

## 🧪 Development Standards

### UI Setup

The interface uses semantic HTML5 with a sticky navigation, canvas-based animated star background, and CSS custom properties for the complete design system.

**Key CSS patterns:**
```css
:root {
  --accent:     #f0a500;   /* amber gold — primary interactive color */
  --blue:       #4f9eff;   /* stellar blue — addresses, links */
  --green:      #3ecf8e;   /* success states, connected status */
  --red:        #f45b5b;   /* error states, disconnect button */
}
```

### Wallet Integration

```javascript
/* DETECTION — Async polling (eliminates false-positive bug) */
async function detectFreighter() {
  for (let i = 1; i <= 16; i++) {
    if (window.freighter?.isConnected)    { state.api = window.freighter;    break; }
    if (window.freighterApi?.isConnected) { state.api = window.freighterApi; break; }
    await sleep(250);
  }
  // Only show "not installed" notice AFTER full loop completes
}

/* CONNECTION — Correct 3-step sequence */
async function connectWallet() {
  await state.api.requestAccess();          // 1. Get permission (popup)
  const address = await resolvePublicKey(); // 2. Normalize v1/v2 response
  await onWalletConnected(address);         // 3. Update UI + fetch data
}

/* PUBLIC KEY — Handles both API versions */
async function resolvePublicKey() {
  if (state.api.getAddress) {
    const r = await state.api.getAddress();
    return r?.address ?? r;        // v2: { address: "G..." }
  }
  const r = await state.api.getPublicKey();
  return r?.publicKey ?? r;        // v1: "G..." or { publicKey: "G..." }
}
```

### Balance Fetch

```javascript
async function fetchBalance() {
  const account = await horizonServer.loadAccount(state.walletAddress);
  const native  = account.balances.find(b => b.asset_type === "native");
  state.balance = native ? parseFloat(native.balance) : 0;
  document.getElementById("infoBalance").textContent =
    state.balance.toLocaleString("en-US", { minimumFractionDigits: 2 }) + " XLM";
}
```

### Transaction Logic

```javascript
/* Build → Sign → Submit pattern */
async function sendTip() {
  const sourceAccount = await horizonServer.loadAccount(state.walletAddress);
  const baseFee       = await horizonServer.fetchBaseFee();

  const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee:               baseFee.toString(),
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(StellarSdk.Operation.payment({
      destination: TIP_JAR_ADDRESS,
      asset:       StellarSdk.Asset.native(),
      amount:      parseFloat(amount).toFixed(7),
    }))
    .addMemo(StellarSdk.Memo.text(memo))
    .setTimeout(180)
    .build();

  const signResult  = await state.api.signTransaction(tx.toXDR(), { network: "TESTNET" });
  const signedXdr   = signResult?.signedTxXdr ?? signResult;
  const signedTx    = StellarSdk.TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
  const response    = await horizonServer.submitTransaction(signedTx);
  // response.hash → show in success feedback
}
```

### Error Handling

```javascript
function parseHorizonError(err) {
  const codes = err?.response?.data?.extras?.result_codes;
  if (codes) {
    const ops = codes.operations || [];
    if (ops.includes("op_underfunded"))       return "Insufficient XLM balance.";
    if (ops.includes("op_no_destination"))    return "Destination not found on testnet.";
    if (ops.includes("op_bad_auth"))          return "Authorization failed. Reconnect wallet.";
    if (ops.includes("op_no_source_account")) return "Source account not found.";
    if (codes.transaction === "tx_bad_seq")   return "Sequence error. Please retry.";
  }
  const msg = err?.message || "";
  if (/declined|rejected|cancel/i.test(msg)) return "Cancelled in Freighter.";
  return msg || "Unknown error. See console.";
}
```

---

## 🐛 Bug Fixes Applied

All critical issues from prior versions are resolved in this build:

| # | Bug | Root Cause | Fix Applied |
|---|-----|-----------|-------------|
| 1 | False "Freighter Not Detected" error | `window.freighterApi` checked synchronously before extension injects | Async polling loop: 16 × 250ms; `installNotice` only shown after all retries fail |
| 2 | Wallet connect fails silently | `getPublicKey()` called without `requestAccess()` first | Enforced correct order: `isConnected → requestAccess → resolvePublicKey` |
| 3 | Public key is `undefined` | Only Freighter v1 response shape handled | `resolvePublicKey()` tries `getAddress()` (v2), then `getPublicKey()` (v1), normalizes both |
| 4 | Wrong tip jar address | Placeholder address used in config | Updated to `GC5HWVXWVVDDTHOFGGJBVEYQQ4GOHJ63T3ZN3NT3MJLR2IVTQLJ7ZDP5` |
| 5 | QR code not scannable | Fake canvas grid pattern (not a real QR code) | Real QR via qrcode.js, encoding Stellar payment URI |
| 6 | Error banner always visible on load | Alert div shown eagerly before detection completes | `installNotice` starts `display:none`; JS shows it only after full polling loop fails |
| 7 | Raw Horizon error codes shown to users | No error parsing in tx submit handler | `parseHorizonError()` maps all known `result_codes` to plain English |

---

## 🚀 Deployment

This is a **fully static site** — no server, no database, no build step required.

### GitHub Pages (free, permanent URL)

```bash
# Push your code
git add .
git commit -m "feat: stellar tip jar — white belt level 1"
git push origin main

# Enable GitHub Pages:
# Repo → Settings → Pages → Source: main branch / root

# Your live URL:
# https://YOUR_USERNAME.github.io/stellar-tip-jar
```

### Vercel (instant, zero config)

```bash
npx vercel --prod
# Detects static site automatically
# Live at: https://stellar-tip-jar-xxx.vercel.app
```

### Netlify

```bash
# CLI
npx netlify deploy --prod --dir .

# Or drag the project folder to:
# https://app.netlify.com/drop
```

### Cloudflare Pages

```bash
# Connect GitHub repo in Cloudflare Pages dashboard
# Build command: (none)
# Output directory: /  (root)
# Deploy — done.
```

---

## ✅ White Belt Level 1 Checklist

### 1. Wallet Setup
- [x] Freighter wallet configured and documented
- [x] Stellar Testnet — not Mainnet

### 2. Wallet Connection
- [x] Connect wallet (`connectWallet()` — `requestAccess → resolvePublicKey → onWalletConnected`)
- [x] Disconnect wallet (`disconnectWallet()` — full state clear + UI reset)
- [x] Auto-reconnect on page reload (`attemptAutoRestore()`)
- [x] Freighter v1 legacy API supported (`window.freighterApi`)
- [x] Freighter v2+ API supported (`window.freighter`)

### 3. Balance Handling
- [x] XLM balance fetched from Horizon Testnet API
- [x] Balance displayed clearly in UI info bar
- [x] Balance auto-refreshes after every transaction
- [x] Manual refresh button available
- [x] Unfunded accounts handled gracefully (404 → "Use Faucet" message)

### 4. Transaction Flow
- [x] XLM payment transaction built with Stellar SDK v12
- [x] Transaction signed via Freighter (private key never exposed)
- [x] Transaction submitted to Horizon Testnet
- [x] **Success state:** green box + amount + Explorer hash link
- [x] **Failure state:** red box + plain-English error from `result_codes`
- [x] Transaction hash links to `stellar.expert/explorer/testnet/tx/{hash}`
- [x] Pre-flight validation: balance, address validity, self-tip check
- [x] Loading spinner + status text during each async step

### 5. Development Standards
- [x] Semantic HTML5 markup with accessible structure
- [x] Responsive CSS using custom properties design system
- [x] Modular JavaScript with clear single responsibility per function
- [x] Comprehensive error handling for all async operations
- [x] No backend required — fully static
- [x] No build tools required — CDN-only dependencies
- [x] Real QR code via qrcode.js
- [x] Transaction history (last 5 payments)
- [x] Copy-to-clipboard for both wallet and tip jar addresses

### README Requirements
- [x] Project description
- [x] Setup instructions (local development)
- [x] Architecture diagram
- [x] All four application flow charts (detection, connection, transaction, error)
- [x] Screenshot descriptions (wallet connected, balance, tx success, tx failure, QR)
- [x] Development standards with code examples
- [x] Bug fixes table
- [x] Deployment guide (GitHub Pages, Vercel, Netlify, Cloudflare)
- [x] White Belt checklist

---

## 📋 Stellar Testnet Resources

| Resource | URL |
|---|---|
| Horizon Testnet API | https://horizon-testnet.stellar.org |
| Stellar Expert Explorer | https://stellar.expert/explorer/testnet |
| Friendbot Faucet | https://friendbot.stellar.org |
| Stellar Laboratory | https://laboratory.stellar.org |
| Stellar SDK Docs | https://stellar.github.io/js-stellar-sdk |
| Freighter Extension | https://www.freighter.app |
| Freighter API Docs | https://docs.freighter.app |
| Stellar Developers Portal | https://developers.stellar.org |
| Stellar Discord | https://discord.gg/stellar |

---

## 📜 License

```
MIT License

Copyright (c) 2025 Stellar Tip Jar Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

---

<div align="center">

**Built with ✦ for the Stellar Developer Community · White Belt Level 1**

[⬆ Back to Top](#-stellar-tip-jar)

</div>
