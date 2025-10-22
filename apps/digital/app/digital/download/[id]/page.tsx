import { notFound } from 'next/navigation';

import { prisma } from '@workspace/database/client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';
import { ShoppingCartIcon, FileIcon } from 'lucide-react';

import { PurchaseButton } from '~/components/digital/purchase-button';
// import { TestStaticButton } from '~/components/digital/test-static-button'; // Uncomment for testing

interface DownloadPageProps {
  params: Promise<{
    id: string; // This will now be the slug, but keeping param name for URL compatibility
  }>;
}

export default async function DownloadPage({ params }: DownloadPageProps) {
  const { id: slug } = await params; // id param contains the slug

  // Fetch complete product data by slug
  const product = await prisma.digitalProduct.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      filename: true,
      fileSize: true,
      price: true,
      sellerWallet: true,
      mimeType: true
    }
  });

  if (!product) {
    notFound();
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const priceInDollars = (product.price / 100).toFixed(2);

  return (
    <div className="container max-w-2xl mx-auto py-12">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <ShoppingCartIcon className="size-8 text-blue-600 mt-1" />
        <div>
          <h1 className="text-3xl font-bold">Purchase Digital Product</h1>
          <p className="text-muted-foreground mt-1">
            Secure payment with USDC on Base blockchain
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Purchase Section - Most Important */}
        <PurchaseButton
          productId={product.slug}
          price={product.price}
          title={product.title}
        />

        {/* Development Testing - Uncomment to enable */}
        {/* <TestStaticButton productId={product.slug} /> */}

        {/* Product Details */}
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

            <div>
              <label className="text-sm font-medium text-muted-foreground">File</label>
              <p className="font-medium">{product.filename}</p>
              <p className="text-xs text-muted-foreground">
                {product.fileSize ? formatFileSize(product.fileSize) : 'Unknown size'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Price</label>
                <p className="text-xl font-bold text-blue-600">${priceInDollars} USDC</p>
              </div>

              <div className="md:col-span-3">
                <label className="text-sm font-medium text-muted-foreground">Seller</label>
                <p className="font-mono text-xs bg-muted p-2 rounded mt-1 break-all">
                  {product.sellerWallet}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
