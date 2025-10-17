'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';

interface DownloadPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function DownloadPage({ params }: DownloadPageProps): React.JSX.Element {
  const [productId, setProductId] = React.useState<string>('');
  const [staticResponse, setStaticResponse] = React.useState<string>('');
  const [dynamicResponse, setDynamicResponse] = React.useState<string>('');
  const [staticLoading, setStaticLoading] = React.useState(false);
  const [dynamicLoading, setDynamicLoading] = React.useState(false);

  React.useEffect(() => {
    params.then(p => setProductId(p.id));
  }, [params]);

  const handleStaticTest = async () => {
    console.log('🔵 STATIC: Button clicked - testing static middleware...');
    setStaticLoading(true);
    setStaticResponse('');

    try {
      const res = await fetch(`/api/download/static/${productId}`);

      console.log('� STATIC: Response status:', res.status);
      console.log('� STATIC: Response headers:', Object.fromEntries(res.headers.entries()));

      if (res.status === 402) {
        const bodyText = await res.text();
        console.log('🔵 STATIC: Response body:', bodyText);

        let paymentData;
        try {
          paymentData = JSON.parse(bodyText);
          console.log('🔵 STATIC: Parsed payment data:', paymentData);
        } catch (e) {
          console.log('� STATIC: Body is not JSON');
        }

        setStaticResponse(`402 Payment Required (Static)\n\n${bodyText}`);
      } else if (res.ok) {
        const data = await res.json();
        console.log('🔵 STATIC: Success:', data);
        setStaticResponse(`Success!\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        const text = await res.text();
        console.log('🔵 STATIC: Error:', text);
        setStaticResponse(`Error: ${res.status}\n\n${text}`);
      }
    } catch (error) {
      console.error('🔵 STATIC: Fetch error:', error);
      setStaticResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setStaticLoading(false);
    }
  };

  const handleDynamicTest = async () => {
    console.log('🟢 DYNAMIC: Button clicked - testing dynamic middleware...');
    setDynamicLoading(true);
    setDynamicResponse('');

    try {
      const res = await fetch(`/api/download/dynamic/${productId}`);

      console.log('🟢 DYNAMIC: Response status:', res.status);
      console.log('🟢 DYNAMIC: Response headers:', Object.fromEntries(res.headers.entries()));

      if (res.status === 402) {
        const bodyText = await res.text();
        console.log('� DYNAMIC: Response body:', bodyText);

        let paymentData;
        try {
          paymentData = JSON.parse(bodyText);
          console.log('� DYNAMIC: Parsed payment data:', paymentData);
        } catch (e) {
          console.log('� DYNAMIC: Body is not JSON');
        }

        setDynamicResponse(`402 Payment Required (Dynamic)\n\n${bodyText}`);
      } else if (res.ok) {
        const data = await res.json();
        console.log('🟢 DYNAMIC: Success:', data);
        setDynamicResponse(`Success!\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        const text = await res.text();
        console.log('🟢 DYNAMIC: Error:', text);
        setDynamicResponse(`Error: ${res.status}\n\n${text}`);
      }
    } catch (error) {
      console.error('🟢 DYNAMIC: Fetch error:', error);
      setDynamicResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDynamicLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <Card>
        <CardHeader>
          <CardTitle>Test Download Page - Dual Middleware</CardTitle>
          <CardDescription>Compare Static vs Dynamic Payment Middleware</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Product ID</label>
            <p className="font-mono text-sm bg-muted p-2 rounded mt-1">
              {productId || 'Loading...'}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Static Middleware Test */}
            <div className="border-2 border-blue-200 bg-blue-50/50 p-4 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">🔵 Static Middleware</h3>
                <p className="text-xs text-blue-700">Route: /api/download/static/*</p>
              </div>

              <div className="text-xs space-y-1 bg-white p-2 rounded border">
                <p className="font-medium text-gray-900">Configuration:</p>
                <p className="text-gray-700">• Price: <span className="font-mono">$0.01</span> (hardcoded)</p>
                <p className="text-gray-700">• Wallet: <span className="font-mono text-[10px]">from env</span></p>
              </div>

              <Button
                onClick={handleStaticTest}
                disabled={staticLoading || !productId}
                className="w-full"
                variant="default"
              >
                {staticLoading ? 'Testing...' : '🧪 Test Static'}
              </Button>

              {staticResponse && (
                <div className="bg-white p-3 rounded-lg border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Response:</p>
                  <pre className="text-[10px] whitespace-pre-wrap font-mono max-h-64 overflow-auto text-gray-900">
                    {staticResponse}
                  </pre>
                </div>
              )}
            </div>

            {/* Dynamic Middleware Test */}
            <div className="border-2 border-green-200 bg-green-50/50 p-4 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-green-900 mb-1">🟢 Dynamic Middleware</h3>
                <p className="text-xs text-green-700">Route: /api/download/dynamic/*</p>
              </div>

              <div className="text-xs space-y-1 bg-white p-2 rounded border">
                <p className="font-medium text-gray-900">Configuration:</p>
                <p className="text-gray-700">• Price: <span className="font-mono">from database</span></p>
                <p className="text-gray-700">• Wallet: <span className="font-mono text-[10px]">from database</span></p>
              </div>

              <Button
                onClick={handleDynamicTest}
                disabled={dynamicLoading || !productId}
                className="w-full"
                variant="default"
              >
                {dynamicLoading ? 'Testing...' : '🧪 Test Dynamic'}
              </Button>

              {dynamicResponse && (
                <div className="bg-white p-3 rounded-lg border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Response:</p>
                  <pre className="text-[10px] whitespace-pre-wrap font-mono max-h-64 overflow-auto text-gray-900">
                    {dynamicResponse}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-2 border-t pt-4">
            <p className="font-medium">📝 What to expect:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Static:</strong> Always returns $0.01 price with env wallet address</li>
              <li><strong>Dynamic:</strong> Queries database for product-specific price and seller wallet</li>
              <li>Both return 402 Payment Required with payment instructions in body</li>
              <li>Check browser console (🔵 blue = static, 🟢 green = dynamic)</li>
              <li>Check terminal for server-side middleware logs</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
