import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@workspace/database/client';

import { FileStorageFactory } from '~/lib/file-storage';

/**
 * Secure download API - validates tokens and streams files
 * Route: /api/download/file/[token]/route.ts
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  console.log('\n🔐 ============ SECURE DOWNLOAD API ============');
  console.log('🔐 Token:', token);
  console.log('🔐 URL:', request.url);
  console.log('🔐 Method:', request.method);

  try {
    // Validate download token
    console.log('🔍 Validating download token...');

    const downloadToken = await prisma.downloadToken.findUnique({
      where: { token },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            filename: true,
            fileKey: true,
            mimeType: true,
            fileSize: true
          }
        }
      }
    });

    if (!downloadToken) {
      console.log('❌ Invalid token - not found in database');
      return NextResponse.json(
        { error: 'Invalid or expired download token' },
        { status: 404 }
      );
    }

    console.log('✅ Token found:', {
      tokenId: downloadToken.id,
      productTitle: downloadToken.product.title,
      expiresAt: downloadToken.expiresAt,
      downloadCount: downloadToken.downloadCount,
      maxDownloads: downloadToken.maxDownloads
    });

    // Check if token has expired
    if (downloadToken.expiresAt < new Date()) {
      console.log('❌ Token has expired:', downloadToken.expiresAt);
      return NextResponse.json(
        { error: 'Download token has expired' },
        { status: 410 } // Gone
      );
    }

    // Check download limits (if any)
    if (
      downloadToken.maxDownloads !== null &&
      downloadToken.downloadCount >= downloadToken.maxDownloads
    ) {
      console.log('❌ Download limit exceeded:', {
        downloadCount: downloadToken.downloadCount,
        maxDownloads: downloadToken.maxDownloads
      });
      return NextResponse.json(
        { error: 'Download limit exceeded' },
        { status: 429 } // Too Many Requests
      );
    }

    console.log('✅ Token validation passed');

    // Increment download count
    console.log('📊 Incrementing download count...');
    await prisma.downloadToken.update({
      where: { token },
      data: {
        downloadCount: {
          increment: 1
        }
      }
    });

    console.log('✅ Download count updated');

    // Stream file using FileStorage adapter
    console.log('📁 Preparing file download...');
    console.log('📁 File details:', {
      filename: downloadToken.product.filename,
      fileKey: downloadToken.product.fileKey,
      mimeType: downloadToken.product.mimeType,
      fileSize: downloadToken.product.fileSize
    });

    const fileStorage = FileStorageFactory.create();

    const downloadResponse = await fileStorage.getDownloadResponse(
      downloadToken.product.fileKey, // File path/key
      downloadToken.product.filename, // Original filename for download
      downloadToken.product.mimeType || 'application/octet-stream'
    );

    console.log('✅ File download response prepared');
    console.log('🔐 ============ END SECURE DOWNLOAD ============\n');

    return downloadResponse;
  } catch (error) {
    console.error('❌ Error in secure download API:', error);
    console.log('🔐 ============ END SECURE DOWNLOAD (ERROR) ============\n');

    return NextResponse.json(
      { error: 'Failed to process download request' },
      { status: 500 }
    );
  }
}
