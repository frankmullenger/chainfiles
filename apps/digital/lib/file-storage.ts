/**
 * File Storage Adapter Pattern
 * Supports both local filesystem and cloud storage (S3, Linode Object Storage)
 */

import { createReadStream, promises as fs } from 'fs';
import * as path from 'path';

export interface FileUploadResult {
  /** File path/key where the file is stored */
  filePath: string;
  /** File size in bytes */
  fileSize: number;
  /** MIME type of the uploaded file */
  mimeType: string;
}

export interface FileStorage {
  /**
   * Upload a file to storage
   * @param file - File buffer to upload
   * @param productId - Product ID for organizing files
   * @param originalFilename - Original filename from user
   * @returns Promise with file path and metadata
   */
  upload(
    file: Buffer,
    productId: string,
    originalFilename: string
  ): Promise<FileUploadResult>;

  /**
   * Get a download response for a file
   * @param filePath - Path/key returned from upload()
   * @param filename - Filename for download (Content-Disposition)
   * @param mimeType - MIME type for Content-Type header
   * @returns Promise with Response object (either file stream or redirect)
   */
  getDownloadResponse(
    filePath: string,
    filename: string,
    mimeType: string
  ): Promise<Response>;
}

/**
 * Factory for creating file storage instances based on environment
 */
export class FileStorageFactory {
  static create(): FileStorage {
    const storageType = process.env.STORAGE_TYPE || 'local';

    switch (storageType) {
      case 'cloud':
        return new CloudFileStorage();
      case 'local':
      default:
        return new LocalFileStorage();
    }
  }
}

/**
 * Local filesystem storage implementation
 */
export class LocalFileStorage implements FileStorage {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'products');

  async upload(
    file: Buffer,
    productId: string,
    originalFilename: string
  ): Promise<FileUploadResult> {
    // Generate secure file key with product ID and timestamp
    const fileExtension = path.extname(originalFilename);
    const fileKey = `${productId}-${Date.now()}${fileExtension}`;
    const filePath = path.join(this.uploadsDir, fileKey);

    try {
      // Ensure upload directory exists
      await fs.mkdir(this.uploadsDir, { recursive: true });

      // Save file to disk
      await fs.writeFile(filePath, file);

      // Get file stats for metadata
      const stats = await fs.stat(filePath);

      return {
        filePath: fileKey, // Store relative path (just the filename)
        fileSize: stats.size,
        mimeType: this.getMimeType(originalFilename)
      };
    } catch (error) {
      console.error('LocalFileStorage upload error:', error);
      throw new Error(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getDownloadResponse(
    filePath: string,
    filename: string,
    mimeType: string
  ): Promise<Response> {
    const fullPath = path.join(this.uploadsDir, filePath);

    try {
      // Check if file exists
      await fs.access(fullPath);

      // Create file stream
      const fileStream = createReadStream(fullPath);

      // Return Response with file stream
      return new Response(fileStream as any, {
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    } catch (error) {
      console.error('LocalFileStorage download error:', error);
      throw new Error(
        `Failed to serve file: ${error instanceof Error ? error.message : 'File not found'}`
      );
    }
  }

  /**
   * Get MIME type based on file extension
   */
  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.txt': 'text/plain'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

/**
 * Cloud storage implementation (S3, Linode Object Storage)
 * TODO: Implement when ready for production scaling
 */
export class CloudFileStorage implements FileStorage {
  async upload(
    file: Buffer,
    productId: string,
    originalFilename: string
  ): Promise<FileUploadResult> {
    // TODO: Implement cloud storage upload (S3/Linode Object Storage)
    throw new Error(
      'CloudFileStorage not implemented yet - use STORAGE_TYPE=local'
    );
  }

  async getDownloadResponse(
    filePath: string,
    filename: string,
    mimeType: string
  ): Promise<Response> {
    // TODO: Implement signed URL generation
    throw new Error(
      'CloudFileStorage not implemented yet - use STORAGE_TYPE=local'
    );
  }
}
