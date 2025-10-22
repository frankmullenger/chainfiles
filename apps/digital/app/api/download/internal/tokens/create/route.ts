import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@workspace/database/client';

/**
 * Internal API route for creating download tokens after successful payment
 * This runs in Node.js runtime (not Edge), so Prisma works here
 */
export async function POST(request: NextRequest) {
  try {
    const { productSlug, payerAddress, transactionHash, network } =
      await request.json();

    console.log('🎫 Creating download token for:', {
      productSlug,
      payerAddress,
      transactionHash,
      network
    });

    // Verify product exists (query by slug)
    const product = await prisma.digitalProduct.findUnique({
      where: { slug: productSlug },
      select: { id: true, title: true }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Create download token with 24-hour expiry and unlimited downloads
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

    const downloadToken = await prisma.downloadToken.create({
      data: {
        token: crypto.randomUUID(), // Generate UUID token
        productId: product.id, // Use the UUID from database
        expiresAt: expiresAt,
        downloadCount: 0,
        maxDownloads: null // NULL = unlimited for MVP
      }
    });

    console.log('✅ Download token created successfully:', {
      token: downloadToken.token,
      expiresAt: downloadToken.expiresAt,
      productTitle: product.title
    });

    return NextResponse.json({
      token: downloadToken.token,
      expiresAt: downloadToken.expiresAt,
      productId: product.id
    });
  } catch (error) {
    console.error('❌ Error creating download token:', error);
    return NextResponse.json(
      { error: 'Failed to create download token' },
      { status: 500 }
    );
  }
}
