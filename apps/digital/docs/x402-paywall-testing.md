# x402 Built-in Paywall Testing Guide

## Overview

We've enabled the built-in x402 paywall on our static middleware to test the full payment flow end-to-end. This uses x402-next's out-of-the-box payment UI with OnchainKit integration.

## What We Enabled

In `apps/digital/middleware.ts`:

```typescript
const x402StaticMiddleware = paymentMiddleware(
  process.env.NEXT_PUBLIC_SELLER_WALLET_ADDRESS,
  routeConfig,
  { url: 'https://x402.org/facilitator' },
  // Paywall config
  {
    appName: 'Digi Downloads',
    appLogo: undefined,
    cdpClientKey: process.env.CDP_CLIENT_KEY,
    sessionTokenEndpoint: undefined
  }
);
```

## How to Test

### Step 1: Prerequisites

1. **Testnet USDC**: You need Base Sepolia testnet USDC
   - Get Sepolia ETH from [Coinbase Faucet](https://portal.cdp.coinbase.com/products/faucet)
   - Swap for USDC on Base Sepolia testnet

2. **Wallet**: Install Coinbase Wallet or MetaMask
   - Switch to Base Sepolia network
   - Ensure you have some testnet USDC (even $0.01 worth)

3. **Dev Server Running**: `pnpm --filter digital dev`

### Step 2: Navigate to Test Page

1. Go to `http://localhost:3003/download/[product-id]`
2. You'll see the product information page
3. Click the green "🔒 Purchase & Download ($0.01)" button

### Step 3: Experience the Paywall

When you click the button, you'll be redirected to `/api/download/static/[id]` which will:

1. **Detect browser request** (has `Accept: text/html` header)
2. **Return x402 paywall HTML** instead of JSON 402
3. **Show interactive UI** with:
   - Product info (price, seller wallet)
   - "Connect Wallet" button
   - OnchainKit wallet connection flow

### Step 4: Complete Payment

1. **Connect Wallet**: Click connect and approve in wallet extension
2. **Review Payment**: See the $0.01 USDC payment request
3. **Sign Authorization**: Approve the EIP-3009 transfer authorization
4. **Automatic Retry**: Paywall automatically retries request with `X-PAYMENT` header
5. **Middleware Verifies**: Server verifies signature via facilitator
6. **Middleware Settles**: Server submits transaction to blockchain
7. **Download**: If successful, you get the file/response

## What Happens Behind the Scenes

```
Browser → GET /api/download/static/[id]
  ↓
Middleware: No X-PAYMENT header, Accept: text/html
  ↓
Return HTML Paywall (not JSON 402)
  ↓
User Connects Wallet → Signs USDC Authorization
  ↓
Paywall JavaScript: Retry with X-PAYMENT header
  ↓
Middleware: Decode payment → Verify → Settle → Let through
  ↓
API Route: Return success response
  ↓
Browser: Download file
```

## Current Limitations

### Static Pricing Only
- This test uses hardcoded $0.01 price
- Seller wallet comes from environment variable
- **Not** using database product info

### Next Step: Dynamic Middleware
Once we understand how the paywall works, we'll:
1. Extract the payment signing logic
2. Build custom payment UI on our download page
3. Wire it to `/api/download/dynamic/[id]` with real DB pricing

## Troubleshooting

### "No USDC Balance"
- Get testnet USDC from Base Sepolia faucet
- Check wallet is on Base Sepolia network

### "Payment Failed"
- Check terminal logs for middleware errors
- Verify `NEXT_PUBLIC_SELLER_WALLET_ADDRESS` is set in `.env`
- Ensure wallet signature was approved

### "Transaction Pending"
- Base Sepolia blocks are ~2 seconds
- Facilitator handles gas payment automatically
- Check [Base Sepolia Explorer](https://sepolia.basescan.org/)

## Learning Goals

By testing this flow, we learn:

1. ✅ How x402 paywall detects browsers vs API clients
2. ✅ How OnchainKit wallet connection works
3. ✅ How EIP-3009 `transferWithAuthorization` signing works
4. ✅ How middleware verifies and settles payments
5. ✅ What the full user experience feels like

Then we can apply these learnings to build our custom UI for dynamic pricing!

## Files Modified

- `apps/digital/middleware.ts` - Added paywall config to static middleware
- `apps/digital/app/download/[id]/page.tsx` - Added "Purchase & Download" button
- `docs/architecture/x402-paywall-testing.md` - This guide

## Related Documentation

- [x402 Dual Middleware](./x402-dual-middleware.md) - Overview of static vs dynamic approaches
- [x402 Paywall Flow Explained](./x402-paywall-flow-explained.md) - Detailed breakdown of the payment flow
- [x402 Protocol](https://www.x402.org/) - Official protocol documentation
- [OnchainKit](https://onchainkit.xyz/) - Coinbase's Web3 UI toolkit
