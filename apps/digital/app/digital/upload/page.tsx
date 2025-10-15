'use client';

import * as React from 'react';
import { type SubmitHandler } from 'react-hook-form';

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
import { toast } from '@workspace/ui/components/sonner';

import { useZodForm } from '../../../hooks/use-zod-form';
import { z } from 'zod';

// Simple form schema for now
const uploadFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  price: z.string().min(1, 'Price is required'),
  sellerWallet: z.string().min(1, 'Wallet address is required')
});

type UploadFormSchema = z.infer<typeof uploadFormSchema>;

export default function UploadPage(): React.JSX.Element {
  const methods = useZodForm({
    schema: uploadFormSchema,
    mode: 'onSubmit',
    defaultValues: {
      title: '',
      price: '',
      sellerWallet: ''
    }
  });

  const canSubmit = !methods.formState.isSubmitting;

  const onSubmit: SubmitHandler<UploadFormSchema> = async (values) => {
    if (!canSubmit) {
      return;
    }

    // For now, just show the form data
    console.log('Form submitted:', values);
    toast.success('Form submitted! (Check console for data)');
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <FormProvider {...methods}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Upload Digital Product</CardTitle>
            <p className="text-sm text-muted-foreground">
              Share your digital files and get paid in USDC on Base
            </p>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-6"
              onSubmit={methods.handleSubmit(onSubmit)}
            >
              <FormField
                control={methods.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Product Title</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="e.g., My Amazing PDF Guide"
                        maxLength={100}
                        disabled={methods.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={methods.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Price (USDC)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="5.00"
                        step="0.01"
                        min="0.01"
                        disabled={methods.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={methods.control}
                name="sellerWallet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Your Base Wallet Address</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="0x..."
                        disabled={methods.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Payments will be sent to this Base wallet address
                    </p>
                  </FormItem>
                )}
              />

              {/* File upload will go here later */}
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  File upload coming soon...
                </p>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              type="submit"
              disabled={!canSubmit}
              loading={methods.formState.isSubmitting}
              onClick={methods.handleSubmit(onSubmit)}
            >
              Upload Product
            </Button>
          </CardFooter>
        </Card>
      </FormProvider>
    </div>
  );
}
