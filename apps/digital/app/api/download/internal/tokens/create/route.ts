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

    console.log('🎫 Creating payment transaction and download token for:', {
      productSlug,
      payerAddress,
      transactionHash,
      network
    });

    // Verify product exists (query by slug)
    const product = await prisma.digitalProduct.findUnique({
      where: { slug: productSlug },
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

    // Check if transaction already exists (prevent duplicates)
    const existingTransaction = await prisma.paymentTransaction.findUnique({
      where: { transactionHash }
    });

    if (existingTransaction) {
      console.log('⚠️ Transaction already exists, returning existing token');

      // Find existing download token for this transaction
      const existingToken = await prisma.downloadToken.findFirst({
        where: { paymentTransactionId: existingTransaction.id }
      });

      if (existingToken) {
        return NextResponse.json({
          token: existingToken.token,
          expiresAt: existingToken.expiresAt,
          productId: product.id,
          paymentTransactionId: existingTransaction.id
        });
      }
    }

    // Create both PaymentTransaction and DownloadToken in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create payment transaction record
      const paymentTransaction = await tx.paymentTransaction.create({
        data: {
          transactionHash,
          network,
          payerAddress,
          recipientAddress: product.sellerWallet,
          amountPaid: product.price, // Price in cents
          currency: 'USDC',
          status: 'confirmed', // Middleware already verified this
          productId: product.id
        }
      });

      console.log('💳 Payment transaction created:', paymentTransaction.id);

      // Create download token with 24-hour expiry
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

      const downloadToken = await tx.downloadToken.create({
        data: {
          token: crypto.randomUUID(), // Generate UUID token
          productId: product.id,
          paymentTransactionId: paymentTransaction.id, // Link to payment
          expiresAt: expiresAt,
          downloadCount: 0,
          maxDownloads: null // NULL = unlimited for MVP
        }
      });

      console.log('🎫 Download token created:', downloadToken.token);

      return { paymentTransaction, downloadToken };
    });

    console.log(
      '✅ Payment transaction and download token created successfully:',
      {
        transactionHash,
        paymentId: result.paymentTransaction.id,
        token: result.downloadToken.token,
        expiresAt: result.downloadToken.expiresAt,
        productTitle: product.title
      }
    );

    return NextResponse.json({
      token: result.downloadToken.token,
      expiresAt: result.downloadToken.expiresAt,
      productId: product.id,
      paymentTransactionId: result.paymentTransaction.id
    });
  } catch (error) {
    console.error(
      '❌ Error creating payment transaction and download token:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to create download token' },
      { status: 500 }
    );
  }
}
