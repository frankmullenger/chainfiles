# ChainFiles Digital App

The core application enabling creators to upload digital files and sell them using cryptocurrency payments on Base blockchain.

## Purpose

ChainFiles Digital App provides a simple, secure platform for digital content creators to monetize their work without traditional payment processing overhead. By leveraging Web3 technology, creators receive payments directly to their wallets while buyers enjoy immediate access to purchased content.

## Technical Highlights

### x402 Payment Protocol
Implements the x402 HTTP payment standard for seamless pay-per-download functionality, enabling direct blockchain payments without complex integration.

### Base Blockchain Integration
- Low transaction fees for micropayments
- Fast settlement times
- USDC stablecoin support
- OnchainKit integration for smooth wallet experience

### Security Model
- Files stored securely outside web directories
- Token-based download access
- Time-limited download permissions
- Blockchain payment verification

## User Experience

### Simple Upload Process
1. Visit upload page
2. Select file and set price
3. Connect wallet for payment reception
4. Receive shareable link instantly

### Streamlined Purchase Flow
1. Click shared product link
2. View product details and pricing
3. Connect wallet and pay with crypto
4. Download content immediately

## Development Setup

This app is part of a monorepo structure. See the main repository README for complete setup instructions.

### Quick Start
```bash
# Install dependencies
pnpm install

# Start development server
pnpm --filter digital dev

# App runs on http://localhost:3003
```

## Architecture

The app follows modern React patterns with Next.js 15 App Router, emphasizing component composition and type safety. Key architectural decisions prioritize user experience and security while maintaining development simplicity.

For detailed technical architecture information, see [architecture.md](./architecture.md).
