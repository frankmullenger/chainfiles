# x402 Paywall Flow - Detailed Explanation

## What You Just Experienced

You successfully completed the full x402 payment flow! Here's exactly what happened behind the scenes.

## The Two-Request Flow

### Request 1: Browser Navigation (No Payment)

**What you did:** Clicked "Purchase & Download ($0.01)" button

**What happened:**

```
Browser → GET /api/download/static/[id]
Headers: 
  Accept: text/html
  User-Agent: Mozilla/5.0...
  X-PAYMENT: (not present)
```

**Middleware logic (x402-next source, lines 176-202):**

```javascript
if (!paymentHeader) {
  const accept = request.headers.get("Accept");
  if (accept?.includes("text/html")) {
    const userAgent = request.headers.get("User-Agent");
    if (userAgent?.includes("Mozilla")) {
      // Browser detected! Return HTML paywall instead of JSON
      const html = getPaywallHtml({
        amount: displayAmount,
        paymentRequirements: toJsonSafe(paymentRequirements),
        currentUrl: request.url,
        testnet: network === "base-sepolia",
        cdpClientKey: paywall?.cdpClientKey,
        appLogo: paywall?.appLogo,
        appName: paywall?.appName,
        sessionTokenEndpoint: paywall?.sessionTokenEndpoint
      });
      return new NextResponse(html, {
        status: 402,
        headers: { "Content-Type": "text/html" }
      });
    }
  }
  // Non-browser clients get JSON 402
}
```

**Result:** You saw an HTML page with:
- App name: "Digi Downloads"
- Price: $0.01
- "Connect Wallet" button
- OnchainKit UI components

### Request 2: After Payment (Automatic Retry)

**What you did:** Connected MetaMask → Signed USDC authorization

**What the paywall JavaScript did:**

```javascript
// Pseudocode from x402's paywall HTML
const payment = {
  x402Version: 1,
  scheme: "exact",
  network: "base-sepolia",
  payload: {
    signature: "0x3c0dbc646f1d0103...",
    authorization: {
      from: "0x900a07B8...",
      to: "0x900a07B8...", // Your seller wallet
      value: "10000", // $0.01 in USDC units (6 decimals)
      validAfter: "1760671024",
      validBefore: "1760671924",
      nonce: "0x91d49260..."
    }
  }
};

// Encode to base64
const encodedPayment = btoa(JSON.stringify(payment));

// Retry original request with payment
fetch("/api/download/static/[id]", {
  headers: {
    "X-PAYMENT": encodedPayment,
    "Accept": "*/*" // Note: NOT text/html anymore!
  }
});
```

**Middleware logic:**

```javascript
// Now paymentHeader exists!
let decodedPayment = exact.evm.decodePayment(paymentHeader);

// Verify signature via facilitator
const verification = await verify(decodedPayment, paymentRequirements);
if (!verification.isValid) {
  return 402; // Payment invalid
}

// Settle on blockchain (facilitator pays gas)
const settlement = await settle(decodedPayment, paymentRequirements);
if (settlement.success) {
  response.headers.set("X-PAYMENT-RESPONSE", base64encode({
    success: true,
    transaction: "0x8fef5889f0b7c0fd...",
    network: "base-sepolia",
    payer: "0x900a07B8..."
  }));
}

// Let request through to API route
return NextResponse.next();
```

**Your API route received:**

```
Headers:
  x-payment: eyJ4NDAyVmVyc2lvbiI6MSwic2NoZW1lIjoiZXhhY3QiLCJuZXR3b3JrIjoiYmFzZS1zZXBvbGlhIiwicGF5bG9hZCI6eyJzaWduYXR1cmUiOiIweDNjMGRiYzY0NmYxZDAxMDNmNTczYzkwMmNkNzg0MzIzZGIwOTI2NWE4ZDljOGY4MTI2MmFiNjc5YzFiM2EzYmQ1YjBmNjZhNDE4MjMxODc4ZTgxYjMwMDkzMDI4MWM2ZWNkNjU4YmEzZTQwYWI5YTc1YTI3M2M1MzMyN2NmZjdmMWMiLCJhdXRob3JpemF0aW9uIjp7ImZyb20iOiIweDkwMGEwN0I4MjMyMzM5ODk1NDA4MjJjQTg2NTE5MDI3Q0NBRDcyMWQiLCJ0byI6IjB4OTAwYTA3QjgyMzIzMzk4OTU0MDgyMmNBODY1MTkwMjdDQ0FENzIxZCIsInZhbHVlIjoiMTAwMDAiLCJ2YWxpZEFmdGVyIjoiMTc2MDY3MTAyNCIsInZhbGlkQmVmb3JlIjoiMTc2MDY3MTkyNCIsIm5vbmNlIjoiMHg5MWQ0OTI2MGM4NGY1MGFhZTVhM2JmZjVhOWU3YTYyMDllNmZmMWVjMTliYzBkYzJmM2U0YmI1YjMwMDg3NzgyIn19fQ==
  
  x-payment-response: eyJzdWNjZXNzIjp0cnVlLCJ0cmFuc2FjdGlvbiI6IjB4OGZlZjU4ODlmMGI3YzBmZDA5OTkyMDU2YjRkY2UxMjE5YWVkMTAxMDNjMTUyZDQxYTA1Y2IyMjMxZDUzNGJjNiIsIm5ldHdvcmsiOiJiYXNlLXNlcG9saWEiLCJwYXllciI6IjB4OTAwYTA3QjgyMzIzMzk4OTU0MDgyMmNBODY1MTkwMjdDQ0FENzIxZCJ9
```

**Decoded X-PAYMENT-RESPONSE:**

```json
{
  "success": true,
  "transaction": "0x8fef5889f0b7c0fd099920566b4dce1219aed10103c152d41a05cb2231d534bc6",
  "network": "base-sepolia",
  "payer": "0x900a07B823233989540822cA86519027CCAD721d"
}
```

**Result:** Your API route returned a file download (now fixed!)

## Why You Saw a Blob URL

**Before the fix:**
- Your API route returned JSON: `{"message": "Download successful!..."}`
- Browser displayed JSON as blob URL

**After the fix:**
- API route returns actual file with `Content-Disposition: attachment`
- Browser triggers download: `digital-download-[id].txt`

## The HTML Paywall Source

The paywall HTML comes from `x402/shared` package's `getPaywallHtml()` function. It includes:

1. **OnchainKit wallet connection** - Coinbase's wallet UI
2. **Payment signing logic** - EIP-3009 `transferWithAuthorization`
3. **Automatic retry** - Resubmits request with `X-PAYMENT` header
4. **Error handling** - Shows validation errors

You can find it in: `node_modules/x402/dist/shared/paywall.html`

## Key Takeaways

### 1. Browser Detection
- `Accept: text/html` + `User-Agent: Mozilla` → HTML paywall
- `Accept: application/json` → JSON 402 response

### 2. Two Requests
- **First:** No payment → Paywall UI
- **Second:** With payment → File download

### 3. Middleware Adds Headers
- `X-PAYMENT` (request) - Contains signed authorization
- `X-PAYMENT-RESPONSE` (response) - Contains transaction hash

### 4. File Downloads
- Must return `Content-Disposition: attachment`
- Must set proper `Content-Type`
- Browser triggers download automatically

## Enhanced Logging

I've added detailed logging to the static API route. Now you'll see:

```
🎯 ========== STATIC API ROUTE ==========
🎯 Product ID: f9086331-c8ea-4544-af0f-19a5871590f6
📦 All Headers: { ... }

💳 Payment Response Header Found!
💳 Decoded payment details: { ... }
✅ Transaction Hash: 0x8fef5889f0b7c0fd...
🌐 Network: base-sepolia
👤 Payer: 0x900a07B8...

✅ Payment verified and settled! Serving file download...
📄 Preparing file download...
📄 File size: 234 bytes
🎯 ========== END STATIC API ROUTE ==========
```

## Next Steps

Now that you understand the flow:

1. ✅ **Learned:** How x402 paywall works
2. ✅ **Learned:** Two-request pattern (paywall → payment → download)
3. ✅ **Learned:** File download response format

**Next:** Apply this to dynamic middleware with custom UI

We can now build our own payment UI that:
- Shows product price from database (not hardcoded $0.01)
- Uses seller wallet from database (not env variable)
- Stays on the product page (no redirect to paywall)
- Has our own styling and branding

## Viewing the Transaction

Check your transaction on Base Sepolia:
```
https://sepolia.basescan.org/tx/0x8fef5889f0b7c0fd099920566b4dce1219aed10103c152d41a05cb2231d534bc6
```

You should see:
- USDC transfer: 0.01 USDC
- From: Your wallet
- To: Seller wallet (from env)
- Submitted by: Facilitator (paid gas)
