// Ethereum provider type declarations for window.ethereum

interface EthereumProvider {
  request(args: { method: 'eth_requestAccounts' }): Promise<string[]>;
  request(args: {
    method: 'eth_signTypedData_v4';
    params: [string, string];
  }): Promise<string>;
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(event: string, callback: (...args: any[]) => void): void;
  removeListener(event: string, callback: (...args: any[]) => void): void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export {};
