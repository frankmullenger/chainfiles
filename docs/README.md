# ChainFiles Documentation

## Overview

ChainFiles is a Web3 application that enables creators to upload digital files and sell them instantly using cryptocurrency payments on Base blockchain. The platform prioritizes simplicity, security, and user experience while leveraging the benefits of blockchain technology.

## Architecture

### Core Applications

- **[Digital App](./digital/)** - Main application for file uploads and sales
- **[Marketing Site](./marketing/)** - Public-facing website and user acquisition

### Key Technical Components

- **x402 Payment Protocol** - Standard for pay-per-download functionality
- **Base Blockchain Integration** - Low-cost, fast cryptocurrency payments
- **Secure File Serving** - Token-based access control for digital assets
- **OnchainKit Integration** - Seamless Web3 wallet experience

## Quick Start

This is a pnpm monorepo with TurboRepo configuration.

### Installation
```bash
# Install all dependencies
pnpm install
```

### Development
```bash
# Start digital app (main MVP)
pnpm --filter digital dev

# Start marketing site
pnpm --filter marketing dev
```

### Database (Development)
```bash
# Run database migrations
pnpm --filter @workspace/database exec prisma migrate dev

# Generate Prisma client
pnpm --filter @workspace/database run generate

# Open database admin interface
pnpm --filter @workspace/database run studio
```

## Project Structure

```
apps/
├── digital/          # Core ChainFiles application
├── marketing/        # Public marketing website
├── dashboard/        # Creator analytics (future)
└── public-api/       # API endpoints (future)

packages/
├── database/         # Prisma schema and migrations
├── ui/              # Shared component library
├── auth/            # Authentication utilities
└── common/          # Shared utilities
```

## Key Features

### Technical Highlights
- **x402 Standard Compliance** - Industry standard for payment-required resources
- **Base Network** - Low fees and fast transactions
- **OnchainKit** - Coinbase's toolkit for optimal Web3 UX
- **Modern React** - Next.js 15 with App Router and TypeScript
- **Security First** - Files stored securely with token-based access

## Documentation Structure

- `./digital/` - Core application architecture and development guides
- `./marketing/` - Marketing site structure and content strategy
- `./architecture/` - System-wide architectural decisions and patterns

## Development Philosophy

ChainFiles is designed with the principle that Web3 technology should enhance user experience rather than complicate it. The architecture emphasizes:

- **Simplicity** - Minimal barriers to entry for both creators and buyers
- **Security** - Blockchain-verified payments and secure file access
- **Performance** - Fast, responsive interfaces with modern web standards
- **Accessibility** - Inclusive design for users across technical backgrounds
