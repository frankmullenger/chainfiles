// Type declarations for x402 package submodules
// These modules are exported by x402 but TypeScript can't resolve them automatically

declare module 'x402/schemes' {
  export const exact: {
    evm: {
      decodePayment: (paymentHeader: string) => any;
      encodePayment: (payment: any) => string;
    };
    svm: {
      decodePayment: (paymentHeader: string) => any;
      encodePayment: (payment: any) => string;
    };
  };
}

declare module 'x402/verify' {
  export function useFacilitator(config?: { url?: string }): {
    verify: (
      payload: any,
      requirements: any
    ) => Promise<{
      isValid: boolean;
      invalidReason?: string;
      payer?: string;
    }>;
    settle: (
      payload: any,
      requirements: any
    ) => Promise<{
      success: boolean;
      transaction?: string;
      network?: string;
      payer?: string;
    }>;
    supported: () => Promise<any>;
    list: (config?: any) => Promise<any>;
  };

  export const verify: (payload: any, requirements: any) => Promise<any>;
  export const settle: (payload: any, requirements: any) => Promise<any>;
  export const supported: () => Promise<any>;
  export const list: (config?: any) => Promise<any>;
}
