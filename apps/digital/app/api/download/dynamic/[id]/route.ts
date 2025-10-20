import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@workspace/database/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  console.log('\n🎯 ========== API ROUTE HIT ==========');
  console.log('🎯 CURRENT BROWSER URL:', request.url);
  console.log('🎯 Dynamic API route hit: /api/download/dynamic/' + id);
  console.log(
    '🎯 ⚠️  WARNING: This route should NOT run if middleware redirected!'
  );
  console.log('📦 Headers:', Object.fromEntries(request.headers.entries()));

  // Get product from database
  const product = await prisma.digitalProduct.findUnique({
    where: { id }
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // If we reach here, payment was verified AND settled by middleware!
  console.log('✅ Payment verified and settled! Serving download...');
  console.log('🌐 BROWSER WILL SHOW: JSON response at', request.url);
  console.log(
    '🚨 PROBLEM: Browser should have been redirected to success page!'
  );

  // Check for payment response header from middleware
  const paymentResponse = request.headers.get('X-PAYMENT-RESPONSE');
  if (paymentResponse) {
    const decoded = JSON.parse(
      Buffer.from(paymentResponse, 'base64').toString()
    );
    console.log('💳 Payment details:', decoded);
  }

  return NextResponse.json({
    message:
      'Download successful! Payment verified and settled (dynamic middleware).',
    productId: id,
    product: {
      title: product.title,
      description: product.description,
      filename: product.filename,
      fileSize: product.fileSize,
      mimeType: product.mimeType
    },
    timestamp: new Date().toISOString()
  });
}
