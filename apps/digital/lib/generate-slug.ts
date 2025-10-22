import { nanoid } from 'nanoid';

/**
 * Generate a slug using NanoID
 * @param length - Optional length for the generated ID (default is 10 chars)
 * @returns A unique slug for URLs
 */
export function generateSlug(length: number = 10): string {
  return nanoid(length);
}
