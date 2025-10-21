'use client';

import * as React from 'react';
import { InfoIcon, AlertTriangle, UploadIcon } from 'lucide-react';
import Link from 'next/link';

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
import { Checkbox } from '@workspace/ui/components/checkbox';
import { toast } from '@workspace/ui/components/sonner';
import { Alert, AlertTitle, AlertDescription } from '@workspace/ui/components/alert';

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
      // price: 1.00,
      sellerWallet: '0x900a07B823233989540822cA86519027CCAD721d',
      acceptTerms: false
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
      {/* Upload Header */}
      <div className="flex items-start gap-4 mb-8">
        <UploadIcon className="size-10 text-blue-600 mt-1" />
        <div>
          <h1 className="text-3xl font-bold">Sell Your Digital Product</h1>
          <p className="text-muted-foreground mt-1">
            Upload your digital file and start selling to customers worldwide. Set your price in USD and get paid instantly.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Info section */}
          <Alert variant="info" className="mb-6 gap-y-2">
            <InfoIcon className="size-4" />
            <AlertTitle className="mb-1">How it works</AlertTitle>
            <AlertDescription>
              <ul className="space-y-1">
                <li>• Set your price in US dollars - customers pay with USDC cryptocurrency</li>
                <li>• Enter your crypto wallet address to receive payments instantly</li>
                <li>• Upload your digital file (up to 10MB) - it stays private until purchased</li>
                <li>• Share your product link with customers worldwide</li>
              </ul>
            </AlertDescription>
          </Alert>



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
                    <FormLabel>Price in USD</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="1.00"
                          max="10000"
                          placeholder="1.00"
                          className="pl-6"
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Parse and update - let user type freely
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue)) {
                              field.onChange(numValue);
                            } else if (value === '') {
                              field.onChange(1);
                            }
                          }}
                          onBlur={field.onBlur}
                        />
                      </div>
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Payments are processed in USDC on the Base network
                    </p>
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
                    <FormLabel>Upload Your Digital Product</FormLabel>
                    <FormControl>
                      <FileDropzone
                        onFileSelect={setSelectedFile}
                        selectedFile={selectedFile}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supported: PDF, images (JPG, PNG, WebP), TXT files (max 10MB)
                    </p>
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
                    <FormLabel>Your Wallet Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0x900a07B823233989540822cA86519027CCAD721d"
                        className="font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      This is where you'll receive payments. Must be a Base network wallet address.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Terms Acceptance Section */}
              <div className="py-4">
                <FormField
                  control={methods.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          I confirm this content is legal and I own the rights to distribute it.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Content Policy Alert - Below checkbox */}
                <div className="mt-4">
                  <Alert variant="warning">
                    <AlertTriangle className="size-4" />
                    <AlertTitle>Content Guidelines</AlertTitle>
                    <AlertDescription>
                      No illegal, adult, copyrighted, or harmful content. Files are subject to review.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

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
