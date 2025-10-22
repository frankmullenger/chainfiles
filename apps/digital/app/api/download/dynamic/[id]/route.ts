import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@workspace/database/client';

import { FileStorageFactory } from '~/lib/file-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // id param contains the slug
) {
  const { id: slug } = await params; // id param contains the slug

  console.log('\n🎯 ========== API ROUTE HIT ==========');
  console.log('🎯 CURRENT BROWSER URL:', request.url);
  console.log('🎯 Dynamic API route hit: /api/download/dynamic/' + slug);

  // Check if middleware passed us a download token (Option B - direct serving)
  const downloadToken = request.headers.get('X-DOWNLOAD-TOKEN');

  if (downloadToken) {
    console.log('🎯 ✅ Download token from middleware:', downloadToken);
    console.log('🎯 🚀 SERVING FILE DIRECTLY (x402 pattern)');

    try {
      // Validate the token and get file info
      const tokenRecord = await prisma.downloadToken.findUnique({
        where: { token: downloadToken },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              filename: true, // Original filename for download
              fileKey: true, // Actual filename on disk
              mimeType: true,
              fileSize: true
            }
          }
        }
      });

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        console.log('❌ Invalid or expired token');
        return NextResponse.json(
          { error: 'Invalid or expired download token' },
          { status: 403 }
        );
      }

      console.log('📁 Loading file:', {
        originalFilename: tokenRecord.product.filename,
        fileKey: tokenRecord.product.fileKey
      });

      // Use FileStorage to serve the file - use fileKey (actual disk filename), not filename
      const fileStorage = FileStorageFactory.create();
      const downloadResponse = await fileStorage.getDownloadResponse(
        tokenRecord.product.fileKey, // Actual file path on disk
        tokenRecord.product.filename, // Original filename for download
        tokenRecord.product.mimeType || 'application/octet-stream'
      );

      console.log('🌐 BROWSER WILL: Download file directly from API URL');
      console.log('📥 File:', tokenRecord.product.filename);

      return downloadResponse;
    } catch (error) {
      console.error('❌ Error serving file:', error);
      return NextResponse.json(
        { error: 'Failed to serve file' },
        { status: 500 }
      );
    }
  }

  // Fallback: Old behavior for debugging/fallback
  console.log('🎯 ⚠️  No download token - falling back to JSON response');
  console.log(
    '🎯 ⚠️  This should only happen if middleware redirect is restored!'
  );
  console.log('📦 Headers:', Object.fromEntries(request.headers.entries()));

  // Get product from database
  const product = await prisma.digitalProduct.findUnique({
    where: { slug }
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
    productSlug: slug,
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
