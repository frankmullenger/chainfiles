# 🔗 ChainFiles — Instant Onchain Commerce for Creators  

> Sell digital files globally in seconds, powered by Base and x402.

**Mission:**  
Enable any creator to sell digital content instantly using blockchain payments — no setup, no gatekeepers, no waiting.

---

## 🎯 The Problem

Over **1 billion creators** face barriers to selling digital products:

- Major platforms (e.g. TikTok Shop) do not support digital product sales  
- Traditional creator marketplaces take **10–30 %** in fees  
- Stripe / PayPal charge **3 %+** and delay payouts for days  

**Result:** a massive gap for simple, direct digital sales.

---

## 💡 The Solution — x402 + Base

**ChainFiles** lets creators go from *upload → share → paid* in under a minute.

- **Upload → Set Price → Share Link** — < 60 seconds to market  
- **Pay → Download Instantly** — no account creation, no delays  
- Built on **Base** for low-cost, fast, global payments  
- Uses **x402**, an onchain pay-per-resource HTTP standard  

**Goal:** make blockchain payments feel as seamless as Stripe or PayPal — but open, instant, and borderless.

---

## 🧩 Architecture Overview

**Stack**
- 🧱 Base Sepolia (USDC payments on Base)  
- ⚙️ x402 SDK for payment-gated downloads  
- 💼 Coinbase / Base Wallet integration via OnchainKit  
- 🌐 Next.js 15 + TypeScript frontend  
- ☁️ Secure, signed download URLs (auto-expire)

```
Buyer (Coinbase / Base Wallet)
   │  pays USDC via x402
   ▼
ChainFiles App ── verifies tx ──► unlocks file
   │
   ▼
Creator wallet receives USDC instantly


[Planned next step → Gasless UX]
   • Add Paymaster (ERC-4337) to sponsor gas for new users
   • Buyer signs → Paymaster covers gas → seamless checkout


[Planned next step → Payout Automation]
   • x402 recipient = Splitter Contract (USDC)
       ├──► Platform fee (X % with flat-fee minimum)
       └──► Creator payout
   • Backend auto-calls `distribute()` right after payment


[Planned next step → Storage Evolution]
   • Move files to cloud storage with signed URLs
   • Explore encrypted IPFS / Arweave for decentralized unlocks
```

---

## 🧱 Current Status (MVP)

✅ Live at [chainfiles.app](https://chainfiles.app)  
✅ Base Sepolia onchain payments (USDC / x402)  
✅ Secure file uploads + instant delivery  
✅ Coinbase Wallet integration (desktop + mobile)  
✅ Open-source repo with onchain proof  
🔄 UI/UX polish and documentation in progress  

**Example onchain tx:** [BaseScan link](https://sepolia.basescan.org/tx/0x31421de925953f362f4d417c0710949e20ebd771439a040e5c15c9b3d867151c)  
**GitHub repo:** [this repository](https://github.com/frankmullenger/chainfiles)  

---

## 🧠 Technical Focus (What Works vs Next Step)

| Area | Current Alpha | Next Step |
|------|----------------|-----------|
| Payments | x402 (USDC on Base Sepolia) | Deploy onchain splitter (auto fee + payout) |
| Wallet UX | Coinbase / Base Wallet connect | Add Paymaster for gasless UX |
| Identity | Wallet-based login and address display | Integrate Base Names and creator profiles |
| File Storage | Files served via Node API using 24-hr expiring download tokens (file path never exposed) | Move to cloud storage with signed URLs, then explore decentralised file storage options |
| Pricing & Plans | No platform fee currently | Introduce percentage-based fee (e.g. 5 %) and optional Pro tier with dashboards, analytics, and lower fees |
| File Types | PDF, images (JPG, PNG, WebP), TXT files up to 10MB | Support more file types (audio, video, docs) and larger uploads |
| Pricing Options | Single fixed price per product | Add discount codes and promotional pricing (Pro tier feature) |
| Content Moderation | Manual review possible | Better file reporting and takedown systems |
| Terms of Use | Basic guidelines | ToS, Privacy, Content and Acceptable Use policy pages |

---

## ⚡ Impact

**Short-term:**  
- 1-minute setup for digital sales  
- Instant, global wallet-to-wallet payouts  

**Long-term:**  
- Bridge mainstream creators into onchain commerce  
- Establish **x402** as an open micropayment standard  
- Support Base’s mission of a **billion users onchain**

---

## 🧪 Submission Proof

- ✅ Built on **Base (Sepolia)**  
- ✅ Public demo + repo  
- ✅ Real onchain transaction proof (BaseScan)  
- ✅ 1-minute product demo video  
- ✅ Clear target customer: small / independent creators  
- ✅ Focused MVP testing x402’s value proposition  

---

*Built for the future of creator commerce — fast, open, and onchain.* ✨  

---

**Quick links:**  
🔗 [Demo Site](https://chainfiles.app)  
🎥 [Demo Video (link TBD)]  
📊 [Example BaseScan Tx](https://sepolia.basescan.org/tx/0x31421de925953f362f4d417c0710949e20ebd771439a040e5c15c9b3d867151c)  
📘 [Docs](https://github.com/frankmullenger/chainfiles/tree/main/docs/digital)

---
