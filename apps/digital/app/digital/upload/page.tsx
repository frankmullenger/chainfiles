'use client';

import * as React from 'react';
import { useAction } from 'next-safe-action/hooks';

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
import { createProductSchema, type CreateProductSchema } from '../../../schemas/create-product-schema';
import { createProduct } from '../../../actions/create-product';

export default function UploadPage(): React.JSX.Element {
  const { execute, result, isExecuting } = useAction(createProduct);

  const methods = useZodForm({
    schema: createProductSchema,
    mode: 'onSubmit',
    defaultValues: {
      title: 'Premium Design Template Pack',
      description: 'A collection of 10 high-quality Figma templates for modern web design. Includes landing pages, dashboards, and mobile app designs.',
      price: 29.99,
      sellerWallet: '0x742d35Cc6634C0532925a3b8D54619f0B42d1234'
    }
  });

  const onSubmit = async (values: CreateProductSchema) => {
    try {
      await execute(values);

      if (result?.data?.success) {
        toast.success(result.data.message);
        methods.reset();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to create product');
    }
  };

  // Show server errors
  React.useEffect(() => {
    if (result?.serverError) {
      toast.error(result.serverError);
    }
    if (result?.validationErrors) {
      toast.error('Please check your form inputs');
    }
  }, [result]);

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
                  disabled={isExecuting}
                >
                  {isExecuting ? 'Creating Product...' : 'Create Product'}
                </Button>
              </CardFooter>
            </form>
          </FormProvider>
        </CardContent>
      </Card>

      {/* Show success message */}
      {result?.data?.success && (
        <div className="mt-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800">
              ✅ Product created successfully! Product ID: {result.data.productId}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
