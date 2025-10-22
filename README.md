# ChainFiles 🔗💾
> Bringing digital commerce onchain with instant, low-fee payments for creators worldwide

**Mission:** Enable any creator to sell digital content instantly using blockchain payments — no setup, no middlemen, no waiting.

---

## 🎯 The Problem

Over **1 billion creators** face barriers to selling digital products:

- Platforms like TikTok Shop don’t allow digital files (a gap for templates, guides, presets, etc.)
- Traditional tools require business accounts, monthly fees, and multi-day settlement
- Payment processors charge 3 %+ fees and delay payouts 3–7 days
- Complex checkout flows cause creators to lose impulse-driven buyers

**Result:** A massive untapped market for simple, direct digital sales.

---

## 💡 The Solution: x402 + Base

**ChainFiles** lets creators go from upload → share → paid in under a minute.

- **Upload → Set Price → Share Link** = 60 seconds to market  
- **Pay → Download instantly** = zero friction for buyers  
- Built on **Base** with < $0.01 fees  
- Powered by **x402** — a pay-per-download HTTP payment standard  

**Goal:** Make blockchain payments feel as seamless as any web checkout.

---

## 🔧 Architecture Overview

**Core stack**
- Base blockchain (USDC on Base Sepolia for MVP)
- x402 protocol for payment-gated file access  
- OnchainKit Smart Wallet for easy onboarding  
- Next.js 15 + TypeScript front-end  
- Secure file delivery via signed URLs (auto-expire after download)

**Flow**

- Creator: Upload → Set Price → Get link
- Buyer: Click → Pay (USDC) → Auto-unlock download
- Base: Confirms tx → ChainFiles releases file

---

## ✨ Key Innovations

- **x402 Protocol on Base** — pay-per-resource without custom contracts  
- **Wallet-abstracted UX** — users can pay with Smart Wallets, no crypto knowledge needed  
- **Instant settlement** — funds arrive in seconds, globally accessible  
- **Open standard** — architecture designed for other apps to adopt x402

---

## 🎬 Target Market

Starting with **TikTok creators**:
- 1 B+ active users  
- High demand for educational and creative digital products  
- Viral distribution potential: one creator’s success can onboard thousands  

**Use cases:** workout PDFs, Lightroom presets, digital course files, music sample packs.  
**Expansion path:** TikTok → Instagram → YouTube → wider creator economy.

---

## 🧱 Current Status (MVP)

- ✅ File upload and secure delivery  
- ✅ Base testnet payments (USDC / x402)  
- ✅ Smart Wallet integration via OnchainKit  
- ✅ Basenames ready  
- 🔄 UI polish and UX refinements in progress  

**Live demo:** https://chainfiles.app  
**Repo:** This open-source repository

---

## 🚀 Impact

**Short-term:**  
- 1-minute digital sales setup  
- Near instant wallet-to-wallet settlement  

**Long-term:**  
- Gateway for mainstream creators to join onchain commerce  
- Establish x402 as a new open digital-commerce standard  
- Contribute to Base’s mission of a billion users onchain  

---

*Built for the future of creator commerce* ✨
