import { prisma } from '@workspace/database/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';
import { DownloadTestClient } from './download-test-client';

interface DownloadPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DownloadPage({ params }: DownloadPageProps) {
  const { id } = await params;

  // Fetch product data server-side - NO useEffect, NO fetch API needed!
  const product = await prisma.digitalProduct.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      price: true,
      sellerWallet: true
    }
  });

  if (!product) {
    return (
      <div className="container mx-auto max-w-4xl py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Product Not Found</h2>
          <p className="text-red-700">The product with ID {id} could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <Card>
        <CardHeader>
          <CardTitle>Download Page - {product.title}</CardTitle>
          <CardDescription>Product information and payment testing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Product ID */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Product ID</label>
            <p className="font-mono text-sm bg-muted p-2 rounded mt-1">{id}</p>
          </div>

          {/* Product Information */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-2 border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-3">📦 Product Information</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-700 font-medium">Title:</span>
                <span className="text-purple-900 font-mono">{product.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700 font-medium">Price:</span>
                <span className="text-purple-900 font-mono">
                  ${(product.price / 100).toFixed(2)} USD
                  <span className="text-xs text-purple-600 ml-2">({product.price} cents)</span>
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-purple-700 font-medium">Seller Wallet:</span>
                <span className="text-purple-900 font-mono text-xs break-all max-w-xs text-right">
                  {product.sellerWallet}
                </span>
              </div>
            </div>
            <p className="text-xs text-purple-600 mt-3 italic">
              ↑ Dynamic middleware should use these values
            </p>
          </div>

          {/* Purchase & Download Button */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">💳 Test Payment Flow</h3>
            <p className="text-sm text-green-700 mb-4">
              Click below to test the x402 payment flow with the built-in paywall UI.
              This uses the static middleware with a hardcoded $0.01 price.
            </p>
            <a
              href={`/api/download/static/${id}`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2 w-full"
            >
              🔒 Purchase & Download ($0.01)
            </a>
            <p className="text-xs text-green-600 mt-3 italic">
              ↑ Opens x402 paywall → Connect wallet → Pay with USDC → Download file
            </p>
          </div>

          {/* Client Component for Interactive Tests */}
          <DownloadTestClient productId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
