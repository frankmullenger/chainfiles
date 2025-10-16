'use client';

import * as React from 'react';

import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { toast } from '@workspace/ui/components/sonner';

import { useZodForm } from '../../../hooks/use-zod-form';
import { createProductFormSchema, type CreateProductFormSchema } from '../../../schemas/create-product-schema';
import { createProductWithFile } from '../../../actions/create-product-with-file';
import { FileDropzone } from '../../../components/file-dropzone';

export default function UploadPage(): React.JSX.Element {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Debug logging for error state changes
  React.useEffect(() => {
    console.log('Error state changed:', error);
  }, [error]);

  const methods = useZodForm({
    schema: createProductFormSchema,
    mode: 'onSubmit',
    defaultValues: {
      title: 'Premium Design Template Pack',
      description: 'A collection of 10 high-quality Figma templates for modern web design. Includes landing pages, dashboards, and mobile app designs.',
      price: 29.99,
      sellerWallet: '0x742d35Cc6634C0532925a3b8D54619f0B42d1234'
    }
  });

  // Update form value when file is selected
  React.useEffect(() => {
    if (selectedFile) {
      methods.setValue('file', selectedFile, { shouldValidate: true });
    }
  }, [selectedFile, methods]);

  const onSubmit = async (values: CreateProductFormSchema) => {
    console.log('=== FORM SUBMISSION START ===');
    console.log('Form values:', values);
    console.log('Selected file:', selectedFile);

    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description || '');
      formData.append('price', values.price.toString());
      formData.append('sellerWallet', values.sellerWallet);
      formData.append('file', selectedFile);

      console.log('FormData created, calling server action...');

      // Call server action with FormData
      await createProductWithFile(formData);

      // If we get here without redirect, something went wrong
      console.log('Server action completed without redirect - this is unexpected');
      toast.error('Unexpected error occurred');

    } catch (error) {
      // Check if this is a Next.js redirect first (expected behavior, not an error)
      if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
        // This is a successful redirect - don't log or handle as error
        return;
      }

      // Only log and handle actual errors, not redirects
      console.error('=== UPLOAD ERROR CAUGHT ===');
      console.error('Error object:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');

      const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
      console.log('Setting error state to:', errorMessage);

      setError(errorMessage);
      toast.error(errorMessage);

    } finally {
      console.log('Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Upload Digital Product</h1>
        <p className="text-muted-foreground mt-2">
          Create a new digital product listing that customers can purchase with USDC on Base.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
              {/* Title field */}
              <FormField
                control={methods.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Premium Design Template Pack"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description field */}
              <FormField
                control={methods.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A collection of high-quality templates..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price field */}
              <FormField
                control={methods.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (USDC)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="10000"
                        placeholder="29.99"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File Upload */}
              <FormField
                control={methods.control}
                name="file"
                render={() => (
                  <FormItem>
                    <FormLabel>Digital Product File</FormLabel>
                    <FormControl>
                      <FileDropzone
                        onFileSelect={setSelectedFile}
                        selectedFile={selectedFile}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Seller Wallet field */}
              <FormField
                control={methods.control}
                name="sellerWallet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seller Wallet Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0x742d35Cc6634C0532925a3b8D54619f0B42d1234"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="px-0">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Product...' : 'Create Product'}
                </Button>
              </CardFooter>
            </form>
          </FormProvider>
        </CardContent>
      </Card>

      {/* Show error message */}
      {error && (
        <div className="mt-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 font-medium">
              ❌ ERROR: {error}
            </p>
            <p className="text-red-600 text-sm mt-2">
              Check browser console for detailed error information
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
