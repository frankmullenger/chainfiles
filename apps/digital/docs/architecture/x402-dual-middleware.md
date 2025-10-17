# x402 Payment Middleware - Dual Implementation

This document explains the two middleware approaches implemented side-by-side for testing and comparison.

## Overview

We have **two parallel implementations** of x402 payment middleware:

1. **Static Middleware** (Option A) - Uses `x402-next` package as-is
2. **Dynamic Middleware** (Option B) - Custom implementation with database queries

Both are active and can be tested independently!

---

## Option A: Static Middleware (Baseline)

### Route Pattern
```
/api/download/static/*
```

### Configuration
- **Price**: Hardcoded `$0.01` (10,000 USDC units)
- **Wallet**: From `NEXT_PUBLIC_SELLER_WALLET_ADDRESS` environment variable
- **Network**: Base Sepolia testnet

### Implementation
Uses `paymentMiddleware()` from `x402-next` package directly:

```typescript
const x402StaticMiddleware = paymentMiddleware(
  '0x900a07B823233989540822cA86519027CCAD721d',
  {
    '/api/download/*': {
      price: '$0.01',
      network: 'base-sepolia'
    }
  }
);
```

### Test It
```bash
# Get payment requirements
curl http://localhost:3005/api/download/test-spike-123

# Or visit in browser:
http://localhost:3005/download/test-spike-123
```

### Pros
✅ Uses official package  
✅ Battle-tested code  
✅ Minimal custom code  

### Cons
❌ Static price - can't change per product  
❌ Static wallet - all payments go to one address  
❌ Can't query database for product details  

---

## Option B: Dynamic Middleware (New PoC)

### Route Pattern
```
/api/download/dynamic/*
```

### Configuration
- **Price**: Queried from `DigitalProduct` table per product
- **Wallet**: Queried from `DigitalProduct.sellerWallet` per product
- **Network**: Base Sepolia testnet

### Implementation
Custom middleware that:
1. Extracts product ID from URL
2. **Fetches product details from internal API** (Edge runtime can't use Prisma)
3. Builds payment requirements dynamically
4. Uses x402 utilities (`verify` and `settle` functions)
5. Returns payment-protected response

```typescript
// Fetch product from internal API
const productResponse = await fetch(`${baseUrl}/api/internal/product/${productId}`);
const { product } = await productResponse.json();

// Build dynamic requirements
const paymentRequirements = {
  maxAmountRequired: product.price.toString(),    // ← From DB!
  payTo: product.sellerWallet,                    // ← From DB!
  // ...
};

// Use x402 utilities
const { verify, settle } = useFacilitator();
await verify(decodedPayment, paymentRequirements);
await settle(decodedPayment, paymentRequirements);
```

**Important**: Next.js middleware runs in Edge Runtime, which doesn't support Prisma. So we fetch product data via an internal API route (`/api/internal/product/[id]`) that runs in Node.js runtime.

### Test It
First, create a product:
```bash
# Visit upload page
http://localhost:3005/digital/upload

# Or use API directly (if you have the endpoint)
```

Then test the dynamic download:
```bash
curl http://localhost:3005/api/digital/download/YOUR-PRODUCT-ID
```

### Pros
✅ Dynamic pricing per product  
✅ Different seller wallets per product  
✅ Stores payment proof in database  
✅ Uses x402's verify/settle functions (same as official package)  
✅ Perfect for marketplace use case  

### Cons
❌ More custom code to maintain  
❌ Need to ensure database queries don't slow down middleware  

---

## How Payment Flow Works (Both Options)

### 1. First Request (No Payment)
```
Client → /api/download/id
         ↓
Middleware intercepts
         ↓
No X-PAYMENT header found
         ↓
Return 402 with payment requirements
```

Response:
```json
{
  "x402Version": 1,
  "error": "X-PAYMENT header is required",
  "accepts": [{
    "scheme": "exact",
    "network": "base-sepolia",
    "maxAmountRequired": "10000",  // $0.01 or from database
    "payTo": "0x900a07...",        // Static or from database
    "asset": "0x036CbD...",        // USDC token address
    "maxTimeoutSeconds": 300
  }]
}
```

### 2. Client Creates Payment
```
Client wallet signs authorization (EIP-3009)
         ↓
Creates X-PAYMENT header with signature
```

### 3. Second Request (With Payment)
```
Client → /api/download/id
         Headers: X-PAYMENT: <base64-encoded-signature>
         ↓
Middleware intercepts
         ↓
Decode payment header
         ↓
Call facilitator.verify() - checks signature & funds
         ↓
✅ Valid? Continue to API route
         ↓
Call facilitator.settle() - moves money on blockchain
         ↓
Add X-PAYMENT-RESPONSE header with transaction hash
         ↓
Return 200 with file/data
```

---

## Comparison Table

| Feature | Static (Option A) | Dynamic (Option B) |
|---------|------------------|-------------------|
| **Route** | `/api/download/*` | `/api/digital/download/*` |
| **Price Source** | Hardcoded `$0.01` | Database query |
| **Wallet Source** | Environment variable | Database query |
| **Implementation** | Official `paymentMiddleware()` | Custom with x402 utilities |
| **Database Access** | ❌ No | ✅ Yes |
| **Use Case** | Testing, simple apps | Marketplace, multi-seller |
| **Verification** | ✅ x402-next | ✅ x402/verify |
| **Settlement** | ✅ x402-next | ✅ x402/verify |
| **Transaction Storage** | ❌ No | ✅ Yes (DownloadToken table) |

---

## What We're Using From x402

Both implementations use x402's core functions:

### Static Middleware Uses:
- `paymentMiddleware()` - All-in-one wrapper
  - Internally calls `verify()` and `settle()`

### Dynamic Middleware Uses:
- `exact.evm.decodePayment()` - Parse payment header
- `useFacilitator().verify()` - Verify payment signature & funds
- `useFacilitator().settle()` - Submit blockchain transaction

**Key Insight**: The dynamic middleware uses the **exact same verification and settlement logic** as the static middleware. We're just calling the functions directly instead of through the wrapper, which allows us to inject database queries before building payment requirements.

---

## Testing Both Approaches

### Test Static Middleware
```bash
# Terminal 1: Run dev server
pnpm --filter digital dev

# Terminal 2: Test static route
curl http://localhost:3005/api/download/test-spike-123

# Should return 402 with $0.01 payment requirement
```

### Test Dynamic Middleware
```bash
# Terminal 1: Run dev server  
pnpm --filter digital dev

# Terminal 2: Create a product first (use upload UI)
# Visit: http://localhost:3005/digital/upload
# Note the product ID from the success page

# Terminal 3: Test dynamic route with real product ID
curl http://localhost:3005/api/digital/download/PRODUCT-ID-HERE

# Should return 402 with price from database
```

---

## Which One Should We Use?

### Use **Static Middleware** if:
- All products have the same price
- Single seller (your wallet)
- Simple use case
- Want minimal custom code

### Use **Dynamic Middleware** if:
- Different prices per product ✅ **Our use case!**
- Multiple sellers with their own wallets ✅ **Our use case!**
- Need to store payment proofs in database ✅ **Our use case!**
- Building a marketplace

**For Digi Downloads MVP**: We should use **Dynamic Middleware** because we need per-product pricing and per-seller wallets.

---

## Next Steps

1. ✅ Both implementations working side-by-side
2. ⏳ Test dynamic middleware with real product
3. ⏳ Add client-side payment UI (OnchainKit)
4. ⏳ Add actual file serving after payment
5. ⏳ Production error handling
6. ⏳ Gas optimization (batch settlements?)

---

## Files Modified

```
apps/digital/
├── middleware.ts              # Both static and dynamic middleware
├── app/
│   └── api/
│       ├── download/[id]/route.ts          # Static test endpoint
│       └── digital/download/[id]/route.ts  # Dynamic endpoint
└── docs/
    └── architecture/
        └── x402-dual-middleware.md         # This file
```
