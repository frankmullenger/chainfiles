import { NextRequest, NextResponse } from 'next/server';
import { paymentMiddleware } from 'x402-next';

// Import x402 utilities for dynamic middleware (only used in /api/digital/download/*)
// Using dynamic imports to avoid TypeScript resolution issues at build time
let x402Utils: {
  exact: any;
  useFacilitator: any;
} | null = null;

async function getX402Utils() {
  if (!x402Utils) {
    // Import x402 utility functions for custom middleware
    const { exact } = await import('x402/schemes');
    const { useFacilitator } = await import('x402/verify');
    x402Utils = { exact, useFacilitator };
  }
  return x402Utils;
}

console.log('🔧 Middleware file loading...');
console.log(
  '📍 Wallet address:',
  process.env.NEXT_PUBLIC_SELLER_WALLET_ADDRESS
);

// ============================================================================
// OPTION A: Static x402-next middleware (original working version)
// Routes: /api/download/static/* - for testing with hardcoded price/wallet
// ============================================================================
const routeConfig = {
  '/api/download/static/*': {
    price: '$0.01',
    network: 'base-sepolia' as const,
    config: {
      description: 'Digital download - payment required (static test)',
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

console.log('📋 Static route config:', JSON.stringify(routeConfig, null, 2));

const x402StaticMiddleware = paymentMiddleware(
  (process.env.NEXT_PUBLIC_SELLER_WALLET_ADDRESS ||
    '0x0000000000000000000000000000000000000000') as `0x${string}`,
  routeConfig,
  {
    url: 'https://x402.org/facilitator'
  },
  // Enable built-in paywall UI
  {
    appName: 'Digi Downloads',
    appLogo: undefined, // Optional - could add logo later
    cdpClientKey: process.env.CDP_CLIENT_KEY, // Optional - for onramp functionality
    sessionTokenEndpoint: undefined // Optional - for session token API
  }
);

console.log(
  '✅ Static middleware configured with paywall: /api/download/static/*'
);

// ============================================================================
// OPTION B: Dynamic custom middleware (new PoC version)
// Routes: /api/download/dynamic/* - for dynamic price/wallet from database
// ============================================================================
console.log('✅ Dynamic middleware configured: /api/download/dynamic/*');

// Main middleware router
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Route A: Static test middleware (original working version)
  if (pathname.startsWith('/api/download/static/')) {
    console.log('\n🔵 ============ STATIC MIDDLEWARE ============');
    console.log('🔵 URL:', request.url);
    console.log('🔵 Using: x402-next paymentMiddleware (static)');

    const response = await x402StaticMiddleware(request);

    console.log('🔵 Status:', response?.status);
    console.log('🔵 ============ END STATIC ============\n');

    return response;
  }

  // Route B: Dynamic custom middleware (new PoC)
  if (pathname.startsWith('/api/download/dynamic/')) {
    console.log('\n🟢 ============ DYNAMIC MIDDLEWARE ============');
    console.log('🟢 URL:', request.url);
    console.log('🟢 Using: Custom dynamic middleware with internal API fetch');

    const productId = pathname.split('/').pop();
    console.log('🟢 Product ID:', productId);

    // Fetch product data from internal API (Edge runtime can't use Prisma)
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const productApiUrl = `${baseUrl}/api/internal/product/${productId}`;

    console.log('🟢 Fetching product from:', productApiUrl);

    const productResponse = await fetch(productApiUrl);

    if (!productResponse.ok) {
      console.log('❌ Product not found or error:', productResponse.status);
      return new NextResponse('Product not found', { status: 404 });
    }

    const { product } = await productResponse.json();

    console.log('📦 Product:', product.title);
    console.log('💰 Price:', product.price, 'USDC units');
    console.log('👛 Seller wallet:', product.sellerWallet);

    // Build dynamic payment requirements from database
    const paymentRequirements = {
      scheme: 'exact' as const,
      network: 'base-sepolia' as const,
      maxAmountRequired: product.price.toString(),
      resource: `${request.nextUrl.protocol}//${request.nextUrl.host}${pathname}`,
      description: `Download ${product.title}`,
      mimeType: 'application/json',
      payTo: product.sellerWallet as `0x${string}`,
      maxTimeoutSeconds: 300,
      asset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
      outputSchema: {
        input: {
          type: 'http' as const,
          method: 'GET' as const,
          discoverable: true
        },
        output: {
          type: 'object' as const,
          properties: {
            message: { type: 'string' as const },
            productId: { type: 'string' as const }
          }
        }
      },
      extra: {
        name: 'USDC',
        version: '2'
      }
    };

    const paymentHeader = request.headers.get('X-PAYMENT');

    // No payment? Return 402 with dynamic requirements
    if (!paymentHeader) {
      console.log('💳 No payment header - returning 402');
      return new NextResponse(
        JSON.stringify({
          x402Version: 1,
          error: 'X-PAYMENT header is required',
          accepts: [paymentRequirements]
        }),
        {
          status: 402,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('💳 Payment header received, verifying...');

    // Decode payment using x402 utilities
    let decodedPayment;
    try {
      const { exact } = await getX402Utils();
      decodedPayment = exact.evm.decodePayment(paymentHeader);
      decodedPayment.x402Version = 1;
      console.log('✅ Payment decoded successfully');
    } catch (error) {
      console.log('❌ Payment decode failed:', error);
      return new NextResponse(
        JSON.stringify({
          x402Version: 1,
          error: 'Invalid payment',
          accepts: [paymentRequirements]
        }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify payment using x402 facilitator
    try {
      const { useFacilitator } = await getX402Utils();
      const { verify, settle } = useFacilitator({
        url: 'https://x402.org/facilitator'
      });

      console.log('🔍 Calling facilitator verify...');
      const verification = await verify(decodedPayment, paymentRequirements);

      if (!verification.isValid) {
        console.log('❌ Verification failed:', verification.invalidReason);
        return new NextResponse(
          JSON.stringify({
            x402Version: 1,
            error: verification.invalidReason,
            accepts: [paymentRequirements],
            payer: verification.payer
          }),
          { status: 402, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Verification successful!');
      console.log('👤 Payer:', verification.payer);

      // Let request through to API route
      const response = NextResponse.next();

      // Settle payment (move money on blockchain)
      console.log('💸 Settling payment...');
      const settlement = await settle(decodedPayment, paymentRequirements);

      if (settlement.success) {
        console.log('✅ Settlement successful!');
        console.log('📝 Transaction:', settlement.transaction);

        // Add transaction hash to response headers
        response.headers.set(
          'X-PAYMENT-RESPONSE',
          Buffer.from(
            JSON.stringify({
              success: true,
              transaction: settlement.transaction,
              network: settlement.network,
              payer: settlement.payer
            })
          ).toString('base64')
        );

        // TODO: Store settlement in database via internal API
        // (Edge runtime can't use Prisma directly)
        console.log('💾 Transaction hash:', settlement.transaction);
      }

      console.log('🟢 ============ END DYNAMIC ============\n');
      return response;
    } catch (error) {
      console.log('❌ Settlement failed:', error);
      return new NextResponse(
        JSON.stringify({
          x402Version: 1,
          error: error instanceof Error ? error.message : 'Settlement failed',
          accepts: [paymentRequirements]
        }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // No matching route - pass through
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/api/download/static/:path*', // Static test route
    '/api/download/dynamic/:path*' // Dynamic PoC route
  ]
};
