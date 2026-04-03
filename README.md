# ✦ Stellar Mini Pay
### All-in-One Stellar Testnet dApp · White Belt Level 1

![Stellar Mini Pay Banner](screenshots/banner.png)

A production-ready, beginner-friendly Stellar testnet dApp built with pure HTML, CSS, and JavaScript. No backend required — just open and go.

---

## 🚀 Features

| Feature | Description |
|---|---|
| **Wallet Connect** | Connect / disconnect Freighter wallet with one click |
| **Balance Check** | Live XLM balance fetched from Horizon Testnet API |
| **Send XLM** | Send XLM to any Stellar testnet address with memo support |
| **Tip Jar** | Quick 1 / 5 / 10 XLM donation buttons + custom amount |
| **Transaction History** | Last 5 transactions with hash, amount, date, and Explorer links |
| **Testnet Faucet** | Fund any account with 10,000 XLM via Friendbot in one click |
| **Split Bill Calculator** | Divide a bill among N people, then send your share instantly |
| **Error Handling** | Wallet not connected · Invalid address · Insufficient balance · Tx failed |

---

## 📸 Screenshots

### Wallet Connected State
> Wallet address displayed in the header bar with live XLM balance pill.

### Balance Displayed
> The Balance tab shows your full XLM balance with account stats.

### Successful Testnet Transaction
> Green success banner with clickable transaction hash link to Stellar Expert Explorer.

### Tip Jar Payment
> Three preset tip buttons (1, 5, 10 XLM) plus custom amount input.

---

## 🛠 Tech Stack

- **HTML5 / CSS3 / Vanilla JavaScript** — zero build tools required
- **[Stellar SDK v12](https://github.com/stellar/js-stellar-sdk)** — transaction building
- **[Freighter API](https://docs.freighter.app/)** — wallet signing
- **[Horizon Testnet](https://horizon-testnet.stellar.org)** — blockchain data
- **[Friendbot](https://friendbot.stellar.org)** — testnet faucet
- **[Stellar Expert](https://stellar.expert)** — transaction explorer links

---

## ⚡ Quick Start

### Option 1: Open Directly (No Install)

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/stellar-mini-pay.git
cd stellar-mini-pay

# Open in your browser — no server needed for basic viewing
open index.html
```

> **Note:** Freighter wallet requires the page to be served over HTTP (not `file://`). Use Option 2 for full functionality.

### Option 2: Local Dev Server (Recommended)

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/stellar-mini-pay.git
cd stellar-mini-pay

# Serve with any static server:
npx serve .
# OR
python3 -m http.server 8080
# OR
npx live-server
```

Then open: **http://localhost:8080**

---

## 🦊 Freighter Wallet Setup

1. Install the [Freighter Browser Extension](https://www.freighter.app/)
2. Create or import a wallet
3. Switch network to **Testnet** (Settings → Preferences → Network)
4. Fund your wallet using the **Faucet tab** in the app (10,000 XLM, free)

---

## 📁 Project Structure

```
stellar-mini-pay/
│
├── index.html      # Main app shell — all tabs, layout, modals
├── style.css       # Dark cosmic UI — Space Mono + Syne fonts
├── app.js          # All logic: wallet, balance, tx, history, faucet
├── README.md       # This file
└── screenshots/    # UI screenshots for docs
```

---

## 🌐 Deployment

This is a static site — deploy anywhere for free:

### Vercel
```bash
npx vercel --prod
```

### Netlify
```bash
npx netlify deploy --prod --dir .
```

### GitHub Pages
1. Push to GitHub
2. Go to Settings → Pages → Source: main branch / root
3. Your app is live at `https://USERNAME.github.io/stellar-mini-pay`

---

## ✅ White Belt Submission Checklist

- [x] Freighter wallet connect / disconnect
- [x] XLM balance fetched and displayed
- [x] Send XLM transaction on testnet
- [x] Success/failure state shown to user
- [x] Transaction hash displayed with Explorer link
- [x] Tip Jar (1, 5, 10 XLM + custom)
- [x] Transaction history (last 5)
- [x] Testnet faucet (Friendbot integration)
- [x] Split bill calculator + send
- [x] Error handling (all edge cases)
- [x] Mobile responsive
- [x] No backend required
- [x] Public GitHub repository
- [x] README with screenshots + setup instructions

---

## 🔐 Security Notes

- **Testnet only** — no real funds are used
- Private keys never leave Freighter — signing is done in the extension
- All transactions are visible on Stellar Testnet Explorer

---

## 📜 License

MIT License — free to use, fork, and build upon.

---

Built with ✦ for the Stellar Developer Community
