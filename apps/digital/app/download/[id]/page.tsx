'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
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
  const [response, setResponse] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    params.then(p => setProductId(p.id));
  }, [params]);

  const handleDownload = async () => {
    console.log('🔵 Button clicked - attempting download...');
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch(`/api/download/${productId}`);

      console.log('📡 Response status:', res.status);
      console.log('📡 Response headers:', Object.fromEntries(res.headers.entries()));

      if (res.status === 402) {
        const paymentInfo = res.headers.get('X-Accept-Payment');
        console.log('💳 Payment Required! Header:', paymentInfo);

        // Payment instructions might be in the response BODY, not headers
        const bodyText = await res.text();
        console.log('💳 Response body:', bodyText);

        let paymentData;
        try {
          paymentData = JSON.parse(bodyText);
          console.log('💳 Parsed payment data:', paymentData);
        } catch (e) {
          console.log('💳 Body is not JSON');
        }

        setResponse(`402 Payment Required\n\nHeader: ${paymentInfo}\n\nBody: ${bodyText}`);
      } else if (res.ok) {
        const data = await res.json();
        console.log('✅ Success:', data);
        setResponse(`Success!\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        const text = await res.text();
        console.log('❌ Error:', text);
        setResponse(`Error: ${res.status}\n\n${text}`);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card>
        <CardHeader>
          <CardTitle>Test Download Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Product ID</label>
            <p className="font-mono text-sm bg-muted p-2 rounded mt-1">
              {productId || 'Loading...'}
            </p>
          </div>

          <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900">Test Product</p>
            <p className="text-xs text-blue-700 mt-1">Price: $0.01 USDC on Base Sepolia</p>
          </div>

          <Button
            onClick={handleDownload}
            disabled={loading || !productId}
            className="w-full"
          >
            {loading ? 'Testing...' : '🧪 Test Payment & Download'}
          </Button>

          {response && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2">Response:</p>
              <pre className="text-xs whitespace-pre-wrap font-mono">
                {response}
              </pre>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
            <p>📝 <strong>What to expect:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Click button → request goes to /api/download/{productId}</li>
              <li>Middleware intercepts → returns 402 Payment Required</li>
              <li>Check browser console for detailed logs</li>
              <li>Check terminal for server-side logs</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
