'use client';

interface PurchaseButtonProps {
  productId: string; // This is actually the slug, but keeping prop name for compatibility
  price: number; // in cents
  title: string;
}

export function PurchaseButton({ productId, price, title }: PurchaseButtonProps) {
  const priceInDollars = (price / 100).toFixed(2);

  const handlePurchase = () => {
    window.location.href = `/api/download/dynamic/${productId}`;
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-lg border-2 border-green-200">
      <div className="text-center space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-green-900 mb-2">Purchase This Product</h3>
          <p className="text-green-700 mb-6">
            Click below to complete your purchase securely.
          </p>
        </div>

        <button
          onClick={handlePurchase}
          className="w-full max-w-md mx-auto h-16 text-xl bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-colors inline-flex items-center justify-center cursor-pointer"
        >
          🔒 Purchase & Download - ${priceInDollars} USDC
        </button>

        <p className="text-sm text-green-600">
          Secure payment powered by Base blockchain
        </p>
      </div>
    </div>
  );
}
