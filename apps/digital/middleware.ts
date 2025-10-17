import { NextRequest, NextResponse } from 'next/server';
import { paymentMiddleware } from 'x402-next';

console.log('🔧 Middleware file loading...');
console.log(
  '📍 Wallet address:',
  process.env.NEXT_PUBLIC_SELLER_WALLET_ADDRESS
);

// Configure the payment middleware with glob pattern (not Next.js param syntax!)
// x402-next uses glob patterns like '/api/download/*' NOT '/api/download/:id'
const routeConfig = {
  '/api/download/*': {
    // Glob pattern matches ALL download routes
    price: '$0.01',
    network: 'base-sepolia' as const,
    config: {
      description: 'Digital download - payment required',
      outputSchema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          productId: { type: 'string' }
        }
      }
    }
  }
};

console.log('📋 Route configuration:', JSON.stringify(routeConfig, null, 2));

const x402Middleware = paymentMiddleware(
  (process.env.NEXT_PUBLIC_SELLER_WALLET_ADDRESS ||
    '0x0000000000000000000000000000000000000000') as `0x${string}`,
  routeConfig,
  {
    url: 'https://x402.org/facilitator' // for testnet
  }
);

console.log('✅ Middleware configured with glob pattern: /api/download/*');

// Wrap the x402 middleware with logging to debug
export async function middleware(request: NextRequest) {
  console.log('\n🔥 ============ MIDDLEWARE INTERCEPTED ============');
  console.log('🔥 Full URL:', request.url);
  console.log('🔥 Pathname:', request.nextUrl.pathname);
  console.log('🔥 Method:', request.method);

  // Check for payment headers
  const paymentHeader =
    request.headers.get('X-Payment') || request.headers.get('x-payment');
  const paymentProofHeader =
    request.headers.get('X-Payment-Proof') ||
    request.headers.get('x-payment-proof');
  console.log('🔥 Has X-Payment header?', !!paymentHeader);
  console.log('🔥 Has X-Payment-Proof header?', !!paymentProofHeader);

  if (paymentHeader) {
    console.log(
      '🔥 Payment header value (first 50 chars):',
      paymentHeader.substring(0, 50)
    );
  }

  // Call the x402 middleware
  console.log('🔥 Calling x402Middleware...');
  const response = await x402Middleware(request);

  console.log('🔥 x402Middleware returned status:', response?.status);
  console.log(
    '🔥 Response headers:',
    Object.fromEntries(response?.headers.entries() || [])
  );

  if (response?.status === 402) {
    console.log('✅ 402 PAYMENT REQUIRED - This is correct!');
    const acceptPayment =
      response.headers.get('X-Accept-Payment') ||
      response.headers.get('x-accept-payment');
    if (acceptPayment) {
      console.log('💳 Payment instructions found in header');
      console.log('💳 Full payment data:', acceptPayment);
    } else {
      console.log('⚠️  No X-Accept-Payment header found in 402 response!');
      console.log(
        '⚠️  Available headers:',
        Array.from(response.headers.keys())
      );
    }
  } else if (response?.status === 200) {
    console.log(
      '⚠️  200 SUCCESS - Payment was verified OR route not protected!'
    );
  }

  console.log('🔥 ============ END MIDDLEWARE ============\n');
  return response;
}

// Configure which paths the middleware should run on
// Note: Next.js 15 uses specific matcher syntax
// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    '/api/download/:path*'
    // Alternative patterns to try:
    // '/api/download/(.*)',
  ]
};
