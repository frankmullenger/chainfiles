'use server';

import { ValidationError } from '@workspace/common/errors';
import { prisma } from '@workspace/database/client';

import { createProductSchema } from '../schemas/create-product-schema';
import { actionClient } from './safe-action';

export const createProduct = actionClient
  .metadata({ actionName: 'createProduct' })
  .inputSchema(createProductSchema)
  .action(async ({ parsedInput }) => {
    // Convert price from dollars to cents (USDC precision)
    const priceInCents = Math.round(parsedInput.price * 100);

    // For now, we'll create a product without a file
    // File upload will be added in the next step
    const product = await prisma.digitalProduct.create({
      data: {
        title: parsedInput.title,
        description: parsedInput.description || null,
        price: priceInCents,
        sellerWallet: parsedInput.sellerWallet,
        // Temporary values - will be updated when file upload is added
        filename: 'pending-upload',
        fileKey: `temp-${Date.now()}`,
        mimeType: null,
        fileSize: null
      }
    });

    return {
      success: true,
      productId: product.id,
      message: 'Product created successfully! File upload coming next.'
    };
  });
