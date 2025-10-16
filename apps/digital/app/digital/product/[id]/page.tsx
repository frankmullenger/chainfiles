import * as React from 'react';
import { notFound } from 'next/navigation';
import { CheckCircleIcon, FileIcon, PlusIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
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
    <div className="container max-w-4xl mx-auto py-12">
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

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Product Details */}
        <div className="lg:col-span-2">
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

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Price</label>
                  <p className="text-xl font-bold text-green-600">${priceInDollars} USDC</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">File</label>
                  <p className="font-medium">{product.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.fileSize ? formatFileSize(product.fileSize) : 'Unknown size'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Seller Wallet</label>
                <p className="font-mono text-sm bg-muted p-2 rounded">
                  {product.sellerWallet}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Product ID</label>
                <p className="font-mono text-sm bg-muted p-2 rounded">
                  {product.id}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* Shareable Link */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shareable Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Share this link with customers
                </label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={downloadUrl}
                    readOnly
                    className="flex-1 text-sm bg-muted p-2 rounded font-mono text-muted-foreground"
                  />
                  <CopyButton value={downloadUrl} />
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 p-3 rounded">
                <p className="font-medium text-amber-800 mb-1">⚠️ Casual User Notice</p>
                <p>This product will be automatically deleted after 30 days if no downloads occur.</p>
              </div>
            </CardContent>
          </Card>

          {/* Download Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Download Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Downloads</div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/digital/upload" className="block">
                <Button className="w-full">
                  <PlusIcon className="size-4 mr-2" />
                  Create Another Product
                </Button>
              </Link>

              <Link href="/digital" className="block">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
