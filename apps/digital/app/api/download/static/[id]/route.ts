import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  console.log('🎯 Static API route hit: /api/download/static/' + id);
  console.log('📦 Headers:', Object.fromEntries(request.headers.entries()));

  // If we reach here, payment was verified by middleware!
  console.log('✅ Payment verified! Returning download data...');

  return NextResponse.json({
    message: 'Download successful! Payment verified (static middleware).',
    productId: id,
    timestamp: new Date().toISOString()
  });
}
