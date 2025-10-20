import * as React from 'react';
import { notFound } from 'next/navigation';
import { CheckCircleIcon, FileIcon, PlusIcon, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { Alert, AlertTitle, AlertDescription } from '@workspace/ui/components/alert';
import { prisma } from '@workspace/database/client';

import { CopyButton } from '~/components/copy-button';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Server Component - fetches data directly from database (Next.js best practice)
export default async function ProductPage({ params }: ProductPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  // Fetch product directly from database - no API endpoint needed!
  const product = await prisma.digitalProduct.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/download/${product.id}`;
  const priceInDollars = (product.price / 100).toFixed(2);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container max-w-2xl mx-auto py-12">
      {/* Success Header */}
      <div className="flex items-center gap-3 mb-8">
        <CheckCircleIcon className="size-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold text-green-600">Product Created Successfully!</h1>
          <p className="text-muted-foreground mt-1">
            Your digital product is now ready for sale
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Shareable Link - Most Important Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">📤 Your Product Link</CardTitle>
            <p className="text-muted-foreground">Share this link with customers to sell your digital product</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product URL</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={downloadUrl}
                  readOnly
                  className="flex-1 text-sm bg-muted p-3 rounded-md font-mono border min-w-0"
                />
                <CopyButton value={downloadUrl} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Alert variant="warning" className="gap-y-2">
          <AlertTriangle className="size-4" />
          <AlertTitle className="mb-1">Important Notice</AlertTitle>
          <AlertDescription>
            Your product will be automatically deleted if no one downloads it within 7 days. Share your link soon to keep it active!
          </AlertDescription>
        </Alert>

        {/* Product Details - Full Width */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileIcon className="size-5" />
              Product Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Title</label>
              <p className="text-lg font-semibold">{product.title}</p>
            </div>

            {product.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* File details after description */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">File</label>
              <p className="font-medium">{product.filename}</p>
              <p className="text-xs text-muted-foreground">
                {product.fileSize ? formatFileSize(product.fileSize) : 'Unknown size'}
              </p>
            </div>

            <Separator />

            {/* Price and Payment Wallet side by side */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Price</label>
                <p className="text-xl font-bold text-green-600">${priceInDollars} USDC</p>
              </div>

              <div className="md:col-span-3">
                <label className="text-sm font-medium text-muted-foreground">Your Payment Wallet</label>
                <p className="font-mono text-xs bg-muted p-2 rounded mt-1 break-all">
                  {product.sellerWallet}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Where you'll receive USDC payments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Simple Action */}
        <div className="flex justify-end">
          <Link href="/digital/upload">
            <Button>
              <PlusIcon className="size-4 mr-2" />
              Create Another Product
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
