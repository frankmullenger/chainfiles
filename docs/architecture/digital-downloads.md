# Digital Downloads Architecture

## Overview

Digital downloads MVP using x402 Payment Protocol on Base blockchain. Users can upload digital files, set prices in USDC, and receive payments directly to their Base wallet.

## Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS, shadcn/ui
- **Blockchain**: Base Sepolia (testnet), OnchainKit for wallet integration
- **Payment**: x402 HTTP Payment Required protocol, USDC payments
- **File Storage**: Local filesystem (MVP), future: S3/R2 with signed URLs
- **Database**: PostgreSQL with Prisma ORM

## User Flows

### Seller Flow
1. Visit `/digital/upload`
2. Fill form: title, price (USDC), wallet address
3. Upload file (drag & drop)
4. Submit → Get shareable link `/download/[id]`
5. Share link on social media, etc.

### Buyer Flow
1. Click shared link → `/download/[id]`
2. See product page with file info & price
3. Click "Download" → x402 payment required
4. Connect Base wallet (Smart Wallet via OnchainKit)
5. Pay in USDC → Payment confirmed on Base
6. Get temporary download URL (24h expiry, unlimited downloads)

## Architecture Decisions

### MVP Simplifications
- **No user accounts**: Just wallet addresses
- **Local file storage**: Files in `apps/digital/uploads/`
- **Direct payment**: No platform fees initially
- **Generous download policy**: 24h expiry, unlimited downloads

### Security Model
- Files stored outside public directory
- Downloads protected by x402 middleware
- Temporary signed URLs prevent direct access
- Payment verification via Base blockchain

## App Structure

```
apps/digital/
├── app/
│   ├── digital/
│   │   ├── page.tsx              # Landing page
│   │   └── upload/
│   │       └── page.tsx          # Upload form
│   ├── download/[id]/
│   │   └── page.tsx              # Product page (shareable link)
│   └── api/
│       ├── upload/
│       │   └── route.ts          # Handle file upload
│       ├── download/[id]/
│       │   └── route.ts          # x402 protected download
│       └── files/[token]/
│           └── route.ts          # Serve temporary files
├── uploads/                      # Private file storage
├── hooks/
│   └── use-zod-form.tsx         # Form validation helper
└── components/                   # UI components (TBD)
```

## Database Schema

```sql
-- Digital products table
CREATE TABLE digital_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR NOT NULL,           -- Original filename
  file_key VARCHAR UNIQUE NOT NULL,    -- Stored filename/path
  title VARCHAR(100) NOT NULL,         -- Display title
  description TEXT,                    -- Optional description
  price INTEGER NOT NULL,              -- Price in USDC cents (500 = $5.00)
  seller_wallet VARCHAR NOT NULL,      -- Base wallet address
  created_at TIMESTAMP DEFAULT NOW()
);

-- Download tokens for temporary access
CREATE TABLE download_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR UNIQUE NOT NULL,       -- Random access token
  file_id UUID REFERENCES digital_products(id),
  expires_at TIMESTAMP NOT NULL,       -- 24h from creation
  download_count INTEGER DEFAULT 0,    -- Track usage
  max_downloads INTEGER DEFAULT NULL,  -- NULL = unlimited
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Upload API
- **POST** `/api/upload`
- **Body**: `multipart/form-data`
  - `file`: File upload
  - `title`: Product title
  - `price`: Price in USDC (decimal)
  - `sellerWallet`: Base wallet address
- **Response**: `{ productId, shareableLink }`

### Download Pages
- **GET** `/download/[id]` - Product page (public)
- **GET** `/api/download/[id]` - x402 protected endpoint
- **GET** `/api/files/[token]` - Temporary file serving

## Payment Integration

### x402 Protocol Flow
1. User requests `/api/download/[id]`
2. x402 middleware checks payment status
3. If unpaid: Return HTTP 402 + payment instructions
4. If paid: Generate temporary token → return download URL

### Base Integration
- **Network**: Base Sepolia (testnet)
- **Token**: USDC on Base
- **Wallet**: OnchainKit Smart Wallet
- **Payment verification**: On-chain transaction confirmation

## Future Enhancements

### Phase 2 - Scale Up
- [ ] Cloud storage (S3/R2) with signed URLs
- [ ] Platform fees via 0xSplits contract
- [ ] Base mainnet deployment
- [ ] Better file type validation

### Phase 3 - Features
- [ ] Seller dashboard for analytics
- [ ] Bulk uploads
- [ ] Digital signatures/certificates
- [ ] NFT integration for proof of purchase

## Development Status

### ✅ Completed
- [x] Basic upload form (title, price, wallet)
- [x] Landing page & navigation
- [x] Form validation with Zod
- [x] Basic UI components

### 🚧 In Progress
- [ ] File upload component
- [ ] Database schema implementation
- [ ] Upload API endpoint

### 📋 Todo
- [ ] Product download page
- [ ] x402 payment integration
- [ ] Base wallet connection
- [ ] File serving with tokens
- [ ] End-to-end testing on Base Sepolia

## Notes

- This is MVP architecture - many simplifications for speed
- Focus on core x402 + Base integration first
- Plan to clean up marketing/dashboard apps later
- Document all endpoint changes here
