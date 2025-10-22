/**
 * Static Middleware - Uses x402-next paymentMiddleware with hardcoded config
 */

import { NextRequest } from 'next/server';
import { paymentMiddleware } from 'x402-next';

// Static route configuration with hardcoded price
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
          productSlug: { type: 'string' }
        }
      }
    }
  }
};

// Create the x402-next middleware instance
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
    appLogo: undefined,
    cdpClientKey: process.env.CDP_CLIENT_KEY,
    sessionTokenEndpoint: undefined
  }
);

export async function middleware(request: NextRequest) {
  console.log('\n🔵 ============ STATIC MIDDLEWARE ============');
  console.log('🔵 URL:', request.url);
  console.log('🔵 Method:', request.method);

  // Log all relevant headers
  const paymentHeader = request.headers.get('X-PAYMENT');
  const accept = request.headers.get('Accept');
  const userAgent = request.headers.get('User-Agent');

  console.log('🔵 Headers:');
  console.log('  - Accept:', accept);
  console.log('  - User-Agent:', userAgent?.substring(0, 50));
  console.log('  - X-PAYMENT present?', !!paymentHeader);
  if (paymentHeader) {
    console.log('  - X-PAYMENT length:', paymentHeader.length);
    console.log(
      '  - X-PAYMENT preview:',
      paymentHeader.substring(0, 50) + '...'
    );
  }

  console.log('🔵 Calling x402-next paymentMiddleware...');
  const response = await x402StaticMiddleware(request);

  console.log('🔵 Response:');
  console.log('  - Status:', response?.status);
  console.log('  - Content-Type:', response?.headers.get('Content-Type'));
  console.log(
    '  - X-PAYMENT-RESPONSE present?',
    !!response?.headers.get('X-PAYMENT-RESPONSE')
  );
  console.log('🔵 ============ END STATIC ============\n');

  return response;
}

export const config = {
  matcher: ['/api/download/static/:path*']
};
