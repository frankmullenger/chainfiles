import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@workspace/database/client';

/**
 * Internal API route for middleware to fetch product data
 * This runs in Node.js runtime (not Edge), so Prisma works here
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.digitalProduct.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        price: true,
        sellerWallet: true
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
