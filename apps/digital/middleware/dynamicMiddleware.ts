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

  // Log headers early (matching static format)
  const paymentHeader = request.headers.get('X-PAYMENT');
  const accept = request.headers.get('Accept');
  const userAgent = request.headers.get('User-Agent');

  console.log('🟢 Headers:');
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

  // Fetch product data from internal API
  const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
  const productApiUrl = `${baseUrl}/api/internal/product/${productId}`;

  const productResponse = await fetch(productApiUrl);

  if (!productResponse.ok) {
    console.log('❌ Product not found:', productResponse.status);
    return new NextResponse('Product not found', { status: 404 });
  }

  const { product } = await productResponse.json();
  console.log(
    '📦 Product loaded:',
    product.title,
    `$${(product.price / 100).toFixed(2)}`
  );

  // Convert cents to USDC units (6 decimals)
  const priceInUSDCUnits = product.price * 10000;

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

  // Check if payment header is present (already logged above)
  console.log('💳 Calling dynamic payment logic...');

  if (!paymentHeader) {
    // No payment yet - determine what to return based on Accept header

    // Browser request - return HTML paywall
    if (accept?.includes('text/html') && userAgent?.includes('Mozilla')) {
      console.log('🌐 No payment - returning HTML paywall');

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

      const response = new NextResponse(html, {
        status: 402,
        headers: { 'Content-Type': 'text/html' }
      });

      console.log('🟢 Response:');
      console.log('  - Status:', response.status);
      console.log('  - Content-Type:', response.headers.get('Content-Type'));
      console.log(
        '  - X-PAYMENT-RESPONSE present?',
        !!response.headers.get('X-PAYMENT-RESPONSE')
      );
      console.log('🟢 ============ END DYNAMIC ============\n');

      return response;
    }

    // API/non-browser request - return JSON
    console.log('🔌 No payment - returning JSON 402');
    const response = new NextResponse(
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

    console.log('🟢 Response:');
    console.log('  - Status:', response.status);
    console.log('  - Content-Type:', response.headers.get('Content-Type'));
    console.log(
      '  - X-PAYMENT-RESPONSE present?',
      !!response.headers.get('X-PAYMENT-RESPONSE')
    );
    console.log('🟢 ============ END DYNAMIC ============\n');

    return response;
  }

  console.log('💳 Payment header received, verifying...');

  // Decode payment from header
  let decodedPayment: any;
  try {
    decodedPayment = exact.evm.decodePayment(paymentHeader);
    console.log('✅ Payment decoded successfully');
  } catch (error) {
    console.log('❌ Payment decode failed:', error);

    const response = new NextResponse(
      JSON.stringify({
        x402Version: 1,
        error: 'Invalid payment format',
        accepts: [paymentRequirements]
      }),
      { status: 402, headers: { 'Content-Type': 'application/json' } }
    );

    console.log('🟢 Response:');
    console.log('  - Status:', response.status);
    console.log('  - Content-Type:', response.headers.get('Content-Type'));
    console.log('  - X-PAYMENT-RESPONSE present?', false);
    console.log('🟢 ============ END DYNAMIC ============\n');

    return response;
  }

  // Verify payment using x402 facilitator
  try {
    const { verify, settle } = useFacilitator({
      url: 'https://x402.org/facilitator'
    });

    console.log('🔍 Verifying payment with facilitator...');
    const verification = await verify(decodedPayment, paymentRequirements);

    if (!verification.isValid) {
      console.log(
        '❌ Payment verification failed:',
        verification.invalidReason
      );

      const response = new NextResponse(
        JSON.stringify({
          x402Version: 1,
          error: verification.invalidReason || 'Payment verification failed',
          accepts: [paymentRequirements]
        }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );

      console.log('🟢 Response:');
      console.log('  - Status:', response.status);
      console.log('  - Content-Type:', response.headers.get('Content-Type'));
      console.log('  - X-PAYMENT-RESPONSE present?', false);
      console.log('🟢 ============ END DYNAMIC ============\n');

      return response;
    }

    console.log('✅ Verification successful!');

    // Settle payment (move money on blockchain)
    const settlement = await settle(decodedPayment, paymentRequirements);

    if (settlement.success) {
      console.log('✅ Settlement successful!');

      // Generate download token after successful payment
      console.log('🎫 Generating download token...');

      try {
        // Create DownloadToken record
        const downloadTokenResponse = await fetch(
          `${baseUrl}/api/internal/create-download-token`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: productId,
              payerAddress: settlement.payer,
              transactionHash: settlement.transaction,
              network: settlement.network
            })
          }
        );

        if (!downloadTokenResponse.ok) {
          throw new Error('Failed to create download token');
        }

        const { token } = await downloadTokenResponse.json();
        console.log('✅ Download token created:', token);

        // Redirect to success page instead of direct file download
        const successUrl = `${baseUrl}/download/success/${token}`;
        console.log('↪️  Redirecting to success page:', successUrl);
        console.log('🟢 ============ END DYNAMIC ============\n');

        return NextResponse.redirect(successUrl);
      } catch (error) {
        console.error('❌ Error creating download token:', error);

        // Fallback to old behavior if token creation fails
        const response = NextResponse.next();
        const paymentResponse = {
          success: true,
          transaction: settlement.transaction,
          network: settlement.network,
          payer: settlement.payer
        };

        response.headers.set(
          'X-PAYMENT-RESPONSE',
          Buffer.from(JSON.stringify(paymentResponse)).toString('base64')
        );

        console.log('🟢 Fallback Response:');
        console.log('  - Status:', response.status || 200);
        console.log(
          '  - Content-Type:',
          response.headers.get('Content-Type') || 'passthrough'
        );
        console.log('  - X-PAYMENT-RESPONSE present?', true);
        console.log('🟢 ============ END DYNAMIC ============\n');

        return response;
      }
    } else {
      console.log('❌ Settlement failed');

      // Return error response for failed settlement
      const errorResponse = new NextResponse(
        JSON.stringify({
          x402Version: 1,
          error: 'Payment settlement failed',
          accepts: [paymentRequirements]
        }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );

      console.log('🟢 Response:');
      console.log('  - Status:', errorResponse.status);
      console.log(
        '  - Content-Type:',
        errorResponse.headers.get('Content-Type')
      );
      console.log('  - X-PAYMENT-RESPONSE present?', false);
      console.log('🟢 ============ END DYNAMIC ============\n');

      return errorResponse;
    }
  } catch (error) {
    console.log(
      '❌ Error in verification/settlement:',
      error instanceof Error ? error.message : String(error)
    );
    const response = new NextResponse(
      JSON.stringify({
        x402Version: 1,
        error:
          error instanceof Error ? error.message : 'Payment processing failed',
        accepts: [paymentRequirements]
      }),
      { status: 402, headers: { 'Content-Type': 'application/json' } }
    );

    console.log('🟢 Response:');
    console.log('  - Status:', response.status);
    console.log('  - Content-Type:', response.headers.get('Content-Type'));
    console.log('  - X-PAYMENT-RESPONSE present?', false);
    console.log('🟢 ============ END DYNAMIC ============\n');

    return response;
  }
}

export const config = {
  matcher: ['/api/download/dynamic/:path*']
};
