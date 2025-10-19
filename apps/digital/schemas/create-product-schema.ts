import { isAddress } from 'viem';
import { z } from 'zod';

export const createProductSchema = z.object({
  title: z
    .string({
      required_error: 'Product title is required.',
      invalid_type_error: 'Product title must be a string.'
    })
    .trim()
    .min(1, 'Product title is required.')
    .max(100, 'Maximum 100 characters allowed.'),

  description: z
    .string()
    .trim()
    .max(500, 'Maximum 500 characters allowed.')
    .optional(),

  price: z
    .number({
      required_error: 'Price is required.',
      invalid_type_error: 'Price must be a number.'
    })
    .min(1.0, 'Price must be at least $1.00')
    .max(10000, 'Price cannot exceed $10,000')
    .refine(
      (price) => {
        // Check that price has at most 2 decimal places
        const rounded = Math.round(price * 100) / 100;
        return Math.abs(price - rounded) < 0.001;
      },
      {
        message: 'Price can only have up to 2 decimal places'
      }
    ),

  sellerWallet: z
    .string({
      required_error: 'Seller wallet address is required.',
      invalid_type_error: 'Seller wallet address must be a string.'
    })
    .trim()
    .refine((address) => isAddress(address), {
      message: 'Invalid wallet address format or checksum'
    })
    .transform((address) => address as `0x${string}`)
});

// Schema for form validation (without file)
export const createProductFormSchema = createProductSchema.extend({
  file: z
    .instanceof(File, {
      message: 'Please select a file to upload.'
    })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: 'File size must be less than 10MB.'
    })
    .refine(
      (file) => {
        const allowedExtensions = [
          '.pdf',
          '.jpg',
          '.jpeg',
          '.png',
          '.webp',
          '.txt'
        ];
        const fileName = file.name.toLowerCase();
        return allowedExtensions.some((ext) => fileName.endsWith(ext));
      },
      {
        message:
          'File type not supported. Please upload PDF, image (JPG, PNG, WebP), or TXT files.'
      }
    )
});

export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type CreateProductFormSchema = z.output<typeof createProductFormSchema>;
