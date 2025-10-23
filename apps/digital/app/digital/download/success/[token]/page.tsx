import { notFound } from 'next/navigation';
import Link from 'next/link';

import { prisma } from '@workspace/database/client';
import { Button } from '@workspace/ui/components/button';
import { routes } from '@workspace/routes';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert';
import { CheckCircleIcon, DownloadIcon, InfoIcon, FileIcon } from 'lucide-react';

interface DownloadSuccessPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function DownloadSuccessPage({ params }: DownloadSuccessPageProps) {
  const { token } = await params;

  // Validate token and get product info with payment transaction details
  const downloadToken = await prisma.downloadToken.findUnique({
    where: { token },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          description: true,
          filename: true,
          fileSize: true,
          price: true,
          sellerWallet: true
        }
      },
      paymentTransaction: {
        select: {
          transactionHash: true,
          network: true,
          payerAddress: true,
          amountPaid: true,
          currency: true,
          createdAt: true
        }
      }
    }
  });

  if (!downloadToken) {
    notFound();
  }

  // Check if token has expired
  const isExpired = downloadToken.expiresAt < new Date();
  const hoursUntilExpiry = Math.max(0, Math.floor(
    (downloadToken.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60)
  ));

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getBlockExplorerUrl = (transactionHash: string, network: string): string | null => {
    if (network === 'base-sepolia') {
      return `https://sepolia.basescan.org/tx/${transactionHash}`;
    } else if (network === 'base') {
      return `https://basescan.org/tx/${transactionHash}`;
    }
    return null; // Unknown network
  };

  return (
    <div className="container max-w-2xl mx-auto py-12">
      {/* Success Header */}
            {/* Success Header */}
      <div className="flex items-start gap-4 mb-8">
        <CheckCircleIcon className="size-8 text-green-600 mt-1" />
        <div>
          <h1 className="text-3xl font-bold text-green-600">Payment Successful!</h1>
          <p className="text-muted-foreground mt-1">
            Your download is now ready
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Prominent Download Section - Most Important */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-lg border-2 border-green-200">
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-green-900 mb-2">📥 Download Your File</h3>
              <p className="text-green-700 mb-6">
                Your file is ready for download
              </p>
            </div>
            {!isExpired ? (
              <>
                {/* Download Icon - Centered and prominent - NOW CLICKABLE */}
                <div className="flex justify-center">
                  <a href={`/api/download/file/${token}`} download>
                    <div className="w-20 h-20 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center border-4 border-green-200 shadow-lg transition-colors cursor-pointer">
                      <DownloadIcon className="size-10 text-white" />
                    </div>
                  </a>
                </div>

                <Button
                  asChild
                  size="lg"
                  className="w-full max-w-md mx-auto h-16 text-xl bg-green-600 hover:bg-green-700 shadow-lg font-semibold cursor-pointer"
                >
                  <a href={`/api/download/file/${token}`} download>
                    Download {downloadToken.product.filename}
                  </a>
                </Button>

                <p className="text-lg text-green-700">
                  Your download link expires in <strong className="text-green-900">{hoursUntilExpiry} hours</strong>
                </p>
              </>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-red-900 font-semibold text-xl mb-3">Download Expired</h3>
                <p className="text-red-700">
                  This download link has expired. Please contact support if you need access to this file.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Important Notice */}
        {!isExpired && (
          <Alert variant="warning">
            <InfoIcon className="size-4" />
            <AlertTitle>Do not refresh this page</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1">
                <li>• Click the download button above to save the file to your device</li>
                <li>• The file will download with its original filename</li>
                <li>• You can download multiple times before the link expires</li>
                <li>• This download link expires in 24 hours and cannot be recovered</li>
                <li>• <a
                  href={routes.digital.download.success.Index.replace('[token]', token)}
                  className="underline font-medium"
                >
                  Bookmark this page here
                </a> to return later</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Transaction Details */}
        {downloadToken.paymentTransaction && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircleIcon className="size-5 text-green-600" />
                Payment Transaction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Transaction Hash</label>
                <p className="font-mono text-xs bg-muted p-2 rounded mt-1 break-all">
                  {downloadToken.paymentTransaction.transactionHash}
                </p>
                {getBlockExplorerUrl(downloadToken.paymentTransaction.transactionHash, downloadToken.paymentTransaction.network) && (
                  <Link
                    href={getBlockExplorerUrl(downloadToken.paymentTransaction.transactionHash, downloadToken.paymentTransaction.network)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline mt-1 inline-block"
                  >
                    View Transaction →
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Network</label>
                  <p className="font-medium capitalize">
                    {downloadToken.paymentTransaction.network.replace('-', ' ')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Amount Paid</label>
                  <p className="font-medium text-green-600">
                    ${(downloadToken.paymentTransaction.amountPaid / 100).toFixed(2)} {downloadToken.paymentTransaction.currency}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Date</label>
                  <p className="font-medium">
                    {new Date(downloadToken.paymentTransaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Paid From</label>
                  <p className="font-mono text-xs bg-muted p-2 rounded mt-1 break-all">
                    {downloadToken.paymentTransaction.payerAddress}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Paid To</label>
                  <p className="font-mono text-xs bg-muted p-2 rounded mt-1 break-all">
                    {downloadToken.product.sellerWallet}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
              <p className="text-lg font-semibold">{downloadToken.product.title}</p>
            </div>

            {downloadToken.product.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {downloadToken.product.description}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">File</label>
              <p className="font-medium">{downloadToken.product.filename}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(downloadToken.product.fileSize || 0)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Price Paid</label>
                <p className="text-xl font-bold text-green-600">${(downloadToken.product.price / 100).toFixed(2)} USDC</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Downloads</label>
                <p className="font-medium">
                  {downloadToken.downloadCount} / {downloadToken.maxDownloads || 'unlimited'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
