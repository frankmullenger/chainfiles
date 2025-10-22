'use client';

import { Button } from '@workspace/ui/components/button';

interface TestStaticButtonProps {
  productId: string; // This is actually the slug, but keeping prop name for compatibility
}

export function TestStaticButton({ productId }: TestStaticButtonProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border-2 border-blue-200">
      <h3 className="font-semibold text-blue-900 mb-2">🧪 Test Static Middleware</h3>
      <p className="text-sm text-blue-700 mb-4">
        Development testing with hardcoded $0.01 price for x402 paywall testing.
      </p>

      <Button
        asChild
        size="lg"
        variant="outline"
        className="w-full h-12 border-blue-300 text-blue-700 hover:bg-blue-100"
      >
        <a href={`/api/download/static/${productId}`}>
          🔧 Test Static Paywall ($0.01)
        </a>
      </Button>

      <p className="text-xs text-blue-600 mt-3 text-center">
        For development testing only
      </p>
    </div>
  );
}
