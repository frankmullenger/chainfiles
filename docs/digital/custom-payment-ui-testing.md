# Custom Payment UI - Testing Guide

## What We Built

A custom payment button that:
- ✅ Works with dynamic middleware (database pricing)
- ✅ Connects wallet via window.ethereum
- ✅ Signs EIP-3009 payment authorization
- ✅ Encodes payment to X-PAYMENT header
- ✅ Submits to `/api/download/dynamic/[id]`
- ✅ Shows clear visual feedback at each step
- ✅ Displays transaction hash on success

## How to Test

### Prerequisites

1. **MetaMask or Coinbase Wallet** installed
2. **Base Sepolia network** added to wallet
3. **Testnet USDC** in your wallet
   - Get from [Coinbase Faucet](https://portal.cdp.coinbase.com/products/faucet)
4. **Dev server running**: `pnpm --filter digital dev`

### Step-by-Step Testing

1. **Navigate to Product Page**
   ```
   http://localhost:3005/download/[your-product-id]
   ```

2. **Observe the UI**
   - Product information (purple section)
   - **NEW: Purchase button** (green section) - Uses dynamic pricing from DB
   - Static test button (blue section) - Hardcoded $0.01
   - Middleware test buttons (bottom) - For API testing

3. **Click "🔒 Purchase & Download ($29.99)"**
   
4. **Flow:**
   
   **Step 1: Fetching requirements**
   - Button shows: "Fetching payment info..."
   - Makes request to `/api/download/dynamic/[id]`
   - Gets 402 response with payment requirements
   
   **Step 2: Connecting wallet**
   - Button shows: "Connecting wallet..."
   - Prompts MetaMask to connect
   - You'll see MetaMask popup asking for permission
   
   **Step 3: Signing payment**
   - Button shows: "Waiting for signature..."
   - MetaMask shows signature request
   - **Important:** This is OFF-CHAIN, no gas fees!
   - Amount shown: "10000" (raw USDC units for $0.01) or "29990000" for $29.99
   
   **Step 4: Processing**
   - Button shows: "Processing payment..."
   - Submits signed payment to middleware
   - Middleware verifies signature
   - Facilitator settles on blockchain
   
   **Step 5: Success!**
   - Button shows: "✅ Payment Successful!"
   - Green success box appears with:
     - Transaction hash
     - Link to Base Sepolia explorer
     - Download button

5. **Check Terminal Output**
   ```
   🟢 ============ DYNAMIC MIDDLEWARE ============
   🟢 Product ID: [id]
   📦 Product: [title]
   💰 Price: [price] USDC units
   💳 Payment header received, verifying...
   ✅ Payment decoded successfully
   🔍 Calling facilitator verify...
   ✅ Verification successful!
   💸 Settling payment...
   ✅ Settlement successful!
   📝 Transaction: 0x...
   🟢 ============ END DYNAMIC ============
   ```

6. **Verify Transaction**
   - Click the transaction hash link
   - Opens Base Sepolia Explorer
   - Should show USDC transfer
   - From: Your wallet
   - To: Seller wallet (from database)
   - Amount: $29.99 (or whatever price you set)

## Key Differences from Static Paywall

### Static (x402's built-in):
- ❌ Redirects to paywall page
- ❌ Hardcoded $0.01 price
- ❌ Hardcoded seller wallet from env
- ✅ Full x402 UI with OnchainKit

### Custom (our new button):
- ✅ Stays on product page
- ✅ Real price from database
- ✅ Real seller wallet from database
- ✅ Custom UI that matches our design
- ✅ Full control over UX

## Expected Behavior

### Success Case:
1. Button changes through states clearly
2. MetaMask prompts appear at right times
3. Payment processes within 5-10 seconds
4. Transaction hash displayed
5. Download button appears

### Error Cases:

**No Wallet:**
- Error: "No Ethereum wallet detected..."
- Solution: Install MetaMask

**Insufficient USDC:**
- Error: Transaction fails in MetaMask
- Solution: Get testnet USDC from faucet

**User Rejects Signature:**
- Error: "Payment failed: User denied..."
- Solution: Try again, approve signature

**Network Wrong:**
- Error: May fail silently or show wrong amounts
- Solution: Switch wallet to Base Sepolia

## Debugging Tips

### Check Console Logs:
Open browser DevTools (F12) → Console tab

You'll see detailed logs:
```
🔐 Step 1: Fetching payment requirements...
📋 Payment requirements: {...}
👛 Step 2: Checking wallet connection...
✅ Wallet connected: 0x...
✍️ Step 3: Requesting signature...
✅ Signature obtained
🔄 Step 4: Processing payment...
📤 Step 5: Submitting payment...
✅ Transaction hash: 0x...
✅ Payment successful: {...}
```

### Check Terminal:
Monitor server logs for middleware activity

### Check MetaMask:
- Activity tab shows signature request
- Should say "Signature Request" not "Transaction"
- No gas fee should be shown

## Testing Different Scenarios

### Test 1: Lower Price
1. Edit product in database: Set price to 100 cents ($1.00)
2. Reload page
3. Button should show: "Purchase & Download ($1.00)"
4. Complete payment
5. Verify transaction shows $1.00 transfer

### Test 2: Different Seller Wallet
1. Edit product in database: Change sellerWallet
2. Reload page
3. Complete payment
4. Verify transaction goes to NEW wallet address

### Test 3: Multiple Purchases
1. Complete one purchase
2. Reload page
3. Try purchasing again
4. Should work (no authentication/tracking yet)

## What's Next

### Phase 2: File Downloads
After this works:
1. Generate signed download tokens after payment
2. Store payments in DownloadToken table
3. Create `/api/download/file/[token]` endpoint
4. Stream actual files from `uploads/` folder
5. Implement 24-hour expiry window

### Phase 3: Improvements
- Better error messages
- Retry logic
- Loading spinners
- Payment confirmation modal
- Download history
- Receipt generation

## Known Limitations

### Current State:
- ✅ Payment flow works end-to-end
- ✅ Real database pricing
- ✅ Real seller wallets
- ❌ Downloads are just JSON response (not actual files)
- ❌ No payment tracking in database
- ❌ No 24-hour download window
- ❌ No download tokens

These will be addressed in Phase 2!

## Success Criteria

You'll know it's working when:
- ✅ Button states change clearly
- ✅ MetaMask prompts at right times
- ✅ No errors in console
- ✅ Transaction appears on Base Sepolia explorer
- ✅ Correct amount and addresses in transaction
- ✅ Terminal shows successful middleware flow
- ✅ Download button appears (even if download is just JSON for now)

## Files Changed

**New:**
- `apps/digital/app/download/[id]/purchase-button.tsx` - Custom payment UI
- `apps/digital/types/ethereum.d.ts` - Type declarations
- `apps/digital/docs/custom-payment-ui-testing.md` - This guide

**Modified:**
- `apps/digital/app/download/[id]/page.tsx` - Added purchase button integration

## Timeline

- ✅ Component built
- ⏳ Testing (you are here)
- ❌ Phase 2: File downloads
- ❌ Phase 3: Polish

Ready to test! 🚀
