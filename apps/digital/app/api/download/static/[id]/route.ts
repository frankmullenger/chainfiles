import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  console.log('\n🎯 ========== STATIC API ROUTE ==========');
  console.log('🎯 Product ID:', id);
  console.log('📦 All Headers:', Object.fromEntries(request.headers.entries()));

  // Check for payment response header from middleware
  const paymentResponseHeader = request.headers.get('X-PAYMENT-RESPONSE');
  if (paymentResponseHeader) {
    console.log('\n💳 Payment Response Header Found!');
    try {
      const decoded = JSON.parse(
        Buffer.from(paymentResponseHeader, 'base64').toString()
      );
      console.log(
        '💳 Decoded payment details:',
        JSON.stringify(decoded, null, 2)
      );
      console.log('✅ Transaction Hash:', decoded.transaction);
      console.log('🌐 Network:', decoded.network);
      console.log('👤 Payer:', decoded.payer);
    } catch (e) {
      console.error('❌ Failed to decode payment response:', e);
    }
  } else {
    console.log('⚠️  No X-PAYMENT-RESPONSE header - payment may have failed');
  }

  // If we reach here, payment was verified AND settled by middleware!
  console.log('\n✅ Payment verified and settled! Serving file download...');

  // Create a test file to download
  const fileContent = `# Digital Download Test File

Product ID: ${id}
Downloaded: ${new Date().toISOString()}
Payment Status: Verified & Settled via x402
Middleware: Static ($0.01)

This is a test file from Digi Downloads!
Your payment was successfully processed on Base Sepolia.

Thank you for testing the x402 payment flow! 🎉
`;

  console.log('📄 Preparing file download...');
  console.log('📄 File size:', Buffer.from(fileContent).length, 'bytes');
  console.log('🎯 ========== END STATIC API ROUTE ==========\n');

  // Return file as download
  return new NextResponse(fileContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="digital-download-${id}.txt"`,
      'Content-Length': Buffer.from(fileContent).length.toString()
    }
  });
}
