import * as React from 'react';
import Link from 'next/link';

import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';

export default function DigitalPage(): React.JSX.Element {
  return (
    <div className="container mx-auto max-w-4xl py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Digital Downloads on Base
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Share your digital files and get paid instantly in USDC on Base blockchain.
          No accounts needed - just upload, set a price, and share the link.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>For Sellers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Upload your digital products, set a price in USDC, and get paid directly to your Base wallet.
            </p>
            <Button asChild className="w-full">
              <Link href="/digital/upload">
                Upload Digital Product
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>For Buyers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Click any shared link, connect your Base wallet, pay in USDC, and download instantly.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/digital/download/test-spike-123">
                🧪 Test x402 Middleware
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          Powered by Base blockchain • x402 Payment Protocol • OnchainKit
        </p>
      </div>
    </div>
  );
}
