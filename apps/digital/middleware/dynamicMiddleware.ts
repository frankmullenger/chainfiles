/**
 * Dynamic Middleware - Custom implementation with database pricing
 */

import { NextRequest, NextResponse } from 'next/server';
import { exact } from 'x402/schemes';
// @ts-ignore - x402/shared exists but TypeScript can't find types
import { getPaywallHtml, toJsonSafe } from 'x402/shared';
import { useFacilitator } from 'x402/verify';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  console.log('\n🟢 ============ DYNAMIC MIDDLEWARE ============');
  console.log('🟢 URL:', request.url);
  console.log('🟢 Method:', request.method);

  const productId = pathname.split('/').pop();
  console.log('🟢 Product ID:', productId);

  // Log headers early
  const paymentHeaderEarly = request.headers.get('X-PAYMENT');
  const acceptEarly = request.headers.get('Accept');
  const userAgentEarly = request.headers.get('User-Agent');

  console.log('🟢 Initial Headers:');
  console.log('  - Accept:', acceptEarly);
  console.log('  - User-Agent:', userAgentEarly?.substring(0, 50));
  console.log('  - X-PAYMENT present?', !!paymentHeaderEarly);

  // Fetch product data from internal API
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
  console.log('💰 Price (cents):', product.price);
  console.log('👛 Seller wallet:', product.sellerWallet);

  // Convert cents to USDC units (6 decimals)
  const priceInUSDCUnits = product.price * 10000;
  console.log('💰 Price (USDC units):', priceInUSDCUnits);

  // Build dynamic payment requirements from database
  const paymentRequirements = {
    scheme: 'exact' as const,
    network: 'base-sepolia' as const,
    maxAmountRequired: priceInUSDCUnits.toString(),
    resource: `${request.nextUrl.protocol}//${request.nextUrl.host}${pathname}`,
    description: `Download ${product.title}`,
    mimeType: 'application/json',
    payTo: product.sellerWallet as `0x${string}`,
    maxTimeoutSeconds: 300,
    asset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
    extra: {
      name: 'USDC',
      version: '2'
    }
  };

  // Check if payment header is present
  const paymentHeader = request.headers.get('X-PAYMENT');
  console.log('💳 Payment header present?', !!paymentHeader);

  if (!paymentHeader) {
    // No payment yet - determine what to return
    const accept = request.headers.get('Accept');
    const userAgent = request.headers.get('User-Agent');

    console.log('📋 Accept header:', accept);
    console.log('📋 User-Agent:', userAgent?.substring(0, 50) + '...');

    // Browser request - return HTML paywall
    if (accept?.includes('text/html') && userAgent?.includes('Mozilla')) {
      console.log('💳 No payment - returning HTML paywall');

      // Convert cents to dollars for display
      const priceInDollars = product.price / 100;

      // Generate HTML paywall with database pricing
      const html = getPaywallHtml({
        amount: priceInDollars,
        paymentRequirements: toJsonSafe([paymentRequirements]),
        currentUrl: request.url,
        testnet: true, // Base Sepolia
        appName: 'Digi Downloads',
        appLogo: undefined,
        cdpClientKey: process.env.CDP_CLIENT_KEY,
        sessionTokenEndpoint: undefined
      });

      return new NextResponse(html, {
        status: 402,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // API/non-browser request - return JSON
    console.log('💳 No payment header - returning JSON 402');
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
  console.log('💳 Payment header length:', paymentHeader.length);
  console.log(
    '💳 Payment header preview:',
    paymentHeader.substring(0, 50) + '...'
  );

  // Decode payment from header
  let decodedPayment: any;
  try {
    console.log('🔧 Attempting to decode payment...');
    console.log('🔍 Using exact.evm.decodePayment()');
    decodedPayment = exact.evm.decodePayment(paymentHeader);
    console.log('✅ Payment decoded successfully');
    console.log('📦 Decoded payment structure:');
    console.log('  - x402Version:', decodedPayment.x402Version);
    console.log('  - scheme:', decodedPayment.scheme);
    console.log('  - network:', decodedPayment.network);
    console.log(
      '  - payload.authorization.from:',
      decodedPayment.payload?.authorization?.from
    );
    console.log(
      '  - payload.authorization.to:',
      decodedPayment.payload?.authorization?.to
    );
    console.log(
      '  - payload.authorization.value:',
      decodedPayment.payload?.authorization?.value
    );
    console.log(
      '  - payload.signature length:',
      decodedPayment.payload?.signature?.length
    );
  } catch (error) {
    console.log('❌ Failed to decode payment');
    console.log(
      '❌ Error details:',
      error instanceof Error ? error.message : String(error)
    );
    return new NextResponse(
      JSON.stringify({
        x402Version: 1,
        error: 'Invalid payment format',
        accepts: [paymentRequirements]
      }),
      { status: 402, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Verify payment using x402 facilitator
  try {
    console.log('🔧 Initializing facilitator');

    const { verify, settle } = useFacilitator({
      url: 'https://x402.org/facilitator'
    });
    console.log(
      '🔧 Facilitator initialized with URL: https://x402.org/facilitator'
    );

    console.log('🔍 Payment requirements for verification:');
    console.log('  - scheme:', paymentRequirements.scheme);
    console.log('  - network:', paymentRequirements.network);
    console.log(
      '  - maxAmountRequired:',
      paymentRequirements.maxAmountRequired
    );
    console.log('  - payTo:', paymentRequirements.payTo);
    console.log('  - asset:', paymentRequirements.asset);
    console.log('  - extra:', JSON.stringify(paymentRequirements.extra));

    console.log('🔍 Calling facilitator.verify()...');
    const verification = await verify(decodedPayment, paymentRequirements);
    console.log(
      '✅ Verification returned:',
      JSON.stringify(verification, null, 2)
    );

    if (!verification.isValid) {
      console.log('❌ Verification failed:', verification.invalidReason);
      console.log('❌ Payer:', verification.payer);
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
    console.log('👤 Verified payer:', verification.payer);

    // Let request through to API route
    console.log('🔄 Creating NextResponse.next()');
    const response = NextResponse.next();

    // Settle payment (move money on blockchain)
    console.log('💸 Calling facilitator.settle()...');
    const settlement = await settle(decodedPayment, paymentRequirements);
    console.log('💸 Settlement returned:', JSON.stringify(settlement, null, 2));

    if (settlement.success) {
      console.log('✅ Settlement successful!');
      console.log('📝 Transaction hash:', settlement.transaction);
      console.log('🌐 Network:', settlement.network);
      console.log('👤 Payer:', settlement.payer);

      // Add transaction hash to response headers
      const paymentResponse = {
        success: true,
        transaction: settlement.transaction,
        network: settlement.network,
        payer: settlement.payer
      };
      console.log(
        '📤 Adding X-PAYMENT-RESPONSE header:',
        JSON.stringify(paymentResponse)
      );

      response.headers.set(
        'X-PAYMENT-RESPONSE',
        Buffer.from(JSON.stringify(paymentResponse)).toString('base64')
      );

      console.log('💾 TODO: Store transaction in database');
    } else {
      console.log('⚠️ Settlement returned success: false');
      console.log('⚠️ Settlement error:', settlement);
    }

    console.log('🟢 ============ END DYNAMIC ============\n');
    return response;
  } catch (error) {
    console.log('❌ Error in verification/settlement:');
    console.log('❌ Error type:', error?.constructor?.name);
    console.log(
      '❌ Error message:',
      error instanceof Error ? error.message : String(error)
    );
    console.log(
      '❌ Error stack:',
      error instanceof Error ? error.stack : 'No stack'
    );
    return new NextResponse(
      JSON.stringify({
        x402Version: 1,
        error:
          error instanceof Error ? error.message : 'Payment processing failed',
        accepts: [paymentRequirements]
      }),
      { status: 402, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const config = {
  matcher: ['/api/download/dynamic/:path*']
};
