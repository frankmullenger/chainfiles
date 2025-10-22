# Digital App Technical Architecture

## Overview

Technical architecture for the ChainFiles digital app, focusing on file upload/download flows, payment processing via x402 protocol, and secure file serving.

## High-Level Flows

### File Upload Flow
1. **Form Submission**: User submits upload form with file, title, price, and wallet address
2. **File Storage**: File saved to `uploads/products/` directory with unique filename
3. **Database Record**: `DigitalProduct` record created with file metadata and pricing
4. **Response**: User receives shareable product URL (`/download/[productId]`)

### Download & Payment Flow
1. **Product Page**: User visits `/download/[productId]` to view product details
2. **Payment Initiation**: User clicks download button, redirected to `/api/download/dynamic/[productId]`
3. **x402 Middleware**: Intercepts request, checks payment status
4. **Payment Required**: If unpaid, returns HTTP 402 with payment interface
5. **Payment Processing**: User completes payment via Web3 wallet
6. **Payment Verification**: Transaction verified on Base blockchain
7. **Token Generation**: Download token created with 24-hour expiry
8. **File Access**: User redirected to success page with download link

## File Serving Architecture

### Current Implementation (MVP)
- **Storage Location**: `uploads/products/` directory (outside public web root)
- **Access Method**: API endpoint `/api/files/[token]` serves files after token validation
- **Security**: Files never directly accessible via URL
- **Token Validation**: 
  - Tokens stored in `download_tokens` database table
  - Time-limited access (24-hour default expiry)
  - Associated with specific product and payment proof

### Token-Based Access Flow
1. **Token Generation**: Created after successful payment verification
2. **Database Storage**: Token stored with expiry timestamp and product reference
3. **File Request**: User requests `/api/files/[token]`
4. **Validation**: Server validates token exists and hasn't expired
5. **File Serving**: If valid, file streamed directly from filesystem
6. **Headers**: Proper content-type and download headers set

### Future Architecture (Cloud Storage)
- **Storage**: S3/R2/CloudFlare for scalable file storage
- **Access Method**: Pre-signed URLs generated after payment
- **Signing**: Server-side URL signing with expiry policies
- **Benefits**: 
  - Reduced server load
  - Better global performance
  - Automatic scaling
  - Enhanced reliability

## x402 Payment Protocol Implementation

### Protocol Overview
The x402 "Payment Required" HTTP status code enables pay-per-resource access. When a client requests a protected resource without payment, the server responds with HTTP 402 and payment instructions.

### Implementation Details

#### Middleware Layer
- **Location**: `/middleware/dynamicMiddleware.ts`
- **Trigger**: Requests to `/api/download/dynamic/[productId]`
- **Process**:
  1. Extract product ID from URL
  2. Fetch product details from database
  3. Check payment status for client
  4. Return payment interface or process successful payment

#### Payment Interface Generation
```typescript
// Simplified flow
if (!paymentReceived) {
  return new Response(paymentHTML, {
    status: 402,
    headers: {
      'Content-Type': 'text/html',
      'Accept-Payment': 'crypto'
    }
  })
}
```

#### Payment Verification
1. **Transaction Check**: Verify USDC payment on Base blockchain
2. **Amount Validation**: Confirm payment amount matches product price
3. **Recipient Validation**: Ensure payment sent to correct seller wallet
4. **Uniqueness**: Prevent double-spending of same transaction

#### Success Handling
1. **Token Creation**: Generate download token in database
2. **Redirect**: Redirect user to success page with download access
3. **Audit Trail**: Log successful payment and token generation

### x402 Library Integration
- **Payment UI**: Leverages x402 library for standard payment interface
- **Wallet Integration**: OnchainKit handles Web3 wallet connections
- **Transaction Processing**: Base network for fast, low-cost settlements
- **Error Handling**: Graceful fallbacks for failed payments or network issues

## Database Schema

### Core Tables
```sql
-- Product metadata and pricing
digital_products (
  id, filename, file_key, title, description, 
  price, seller_wallet, created_at
)

-- Time-limited access tokens
download_tokens (
  id, token, file_id, expires_at, 
  download_count, max_downloads, created_at
)
```

### Data Flow
1. **Upload**: Creates `digital_products` record
2. **Payment**: Verified via blockchain, no database record needed
3. **Access**: Creates `download_tokens` record for file access
4. **Download**: Validates token and serves file

## Security Architecture

### File Protection
- **No Direct Access**: Files stored outside web-accessible directories
- **Token Validation**: All file access requires valid, non-expired tokens
- **Single-Use Options**: Configurable token usage limits
- **Audit Logging**: Track all file access attempts

### Payment Security
- **Blockchain Verification**: All payments verified on-chain
- **No Custody**: Direct wallet-to-wallet transactions
- **Transaction Uniqueness**: Prevent replay attacks
- **Amount Verification**: Exact price matching required

### System Security
- **Input Validation**: All uploads validated for type and size
- **Path Traversal Prevention**: Secure file path handling
- **Rate Limiting**: Prevent abuse of upload/download endpoints
- **Error Handling**: No sensitive information in error responses

## Scalability Considerations

### Current Limitations
- **Filesystem Storage**: Single server file storage
- **Direct File Serving**: Server bandwidth used for file delivery
- **Database Queries**: Real-time token validation per download

### Scaling Solutions
- **Cloud Storage**: Migrate to S3/R2 for unlimited capacity
- **CDN Integration**: Global edge caching for faster delivery
- **Pre-signed URLs**: Offload file serving from application servers
- **Caching**: Redis for token validation and product metadata
- **Load Balancing**: Horizontal scaling of application instances

This architecture provides a secure, scalable foundation for digital file sales while maintaining simplicity in the core user flows.
