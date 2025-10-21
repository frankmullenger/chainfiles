'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { ValidationError } from '@workspace/common/errors';
import { prisma } from '@workspace/database/client';
import { routes } from '@workspace/routes';

import { FileStorageFactory } from '../lib/file-storage';

// File validation constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.pdf',
  '.txt',
  '.doc',
  '.docx',
  '.zip'
];

// FormData schema (for server action)
const createProductFormDataSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.coerce.number().min(0.01).max(10000),
  sellerWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/)
});

// FormData-based server action for file upload
export async function createProductWithFile(formData: FormData) {
  let productId: string;

  try {
    // Extract and validate form fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const sellerWallet = formData.get('sellerWallet') as string;
    const file = formData.get('file') as File;

    // Validate form data
    const validatedData = createProductFormDataSchema.parse({
      title,
      description: description || undefined,
      price,
      sellerWallet
    });

    // Validate file
    if (!file || file.size === 0) {
      throw new ValidationError('Please select a file to upload.');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError('File size must be less than 50MB.');
    }

    const fileName = file.name.toLowerCase();
    const isValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext)
    );
    if (!isValidExtension) {
      throw new ValidationError(
        'File type not supported. Please upload PDF, image, TXT, DOC, DOCX, or ZIP files.'
      );
    }

    // Start database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create product record
      const product = await tx.digitalProduct.create({
        data: {
          title: validatedData.title,
          description: validatedData.description || null,
          price: Math.round(validatedData.price * 100), // Convert to cents
          sellerWallet: validatedData.sellerWallet,
          filename: file.name,
          fileKey: '', // Will be set after file upload
          mimeType: file.type || null,
          fileSize: file.size
        }
      });

      try {
        // Upload file using adapter pattern
        const fileStorage = FileStorageFactory.create();
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await fileStorage.upload(
          buffer,
          product.id,
          file.name
        );

        // Update product with file information
        await tx.digitalProduct.update({
          where: { id: product.id },
          data: {
            fileKey: uploadResult.filePath,
            fileSize: uploadResult.fileSize,
            mimeType: uploadResult.mimeType
          }
        });

        return product;
      } catch (fileError) {
        // If file operations fail, the transaction will roll back
        console.error('File upload error:', fileError);
        throw new ValidationError('Failed to save file. Please try again.');
      }
    });

    productId = result.id;
    console.log('Product created successfully:', productId);
  } catch (error) {
    console.error('Product creation error:', error);

    if (error instanceof ValidationError) {
      throw error;
    }

    // For any other errors, show generic message
    throw new ValidationError('Failed to create product. Please try again.');
  }

  // Redirect outside try-catch so redirect error isn't caught
  redirect(routes.digital.product.Index.replace('[id]', productId));
}
