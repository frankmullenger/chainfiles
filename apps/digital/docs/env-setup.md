# Environment Variables Setup Guide

This guide will help you set up all the required environment variables for the Digital Downloads MVP.

## 📋 Prerequisites Checklist

- [ ] MetaMask wallet installed
- [ ] Switched to Base Sepolia testnet in MetaMask
- [ ] Coinbase Developer Platform account created

---

## 🔐 Required Environment Variables

### 1. **CDP API Credentials**

Get these from [Coinbase Developer Platform](https://portal.cdp.coinbase.com/):

1. Sign in to CDP Portal
2. Go to "API Keys" section
3. Click "Create API Key"
4. Save the credentials:
   ```bash
   CDP_API_KEY_NAME=organizations/your-org-id/apiKeys/your-key-id
   CDP_API_KEY_PRIVATE_KEY=-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----
   ```

> **Important**: The private key will only be shown once. Save it securely!

---

### 2. **OnchainKit Project ID**

From the same CDP Portal:

1. Go to "OnchainKit" section
2. Create a new project (or use existing)
3. Copy the Project ID:
   ```bash
   NEXT_PUBLIC_ONCHAINKIT_PROJECT_ID=your-project-id-here
   ```

---

### 3. **Your Wallet Address**

Use your MetaMask wallet address for receiving payments:

1. Open MetaMask
2. Switch to **Base Sepolia** testnet
3. Copy your wallet address (starts with `0x...`)
   ```bash
   NEXT_PUBLIC_SELLER_WALLET_ADDRESS=0xYourWalletAddressHere
   ```

> **Note**: This is where you'll receive USDC payments from buyers.

---

### 4. **Download URL Secret**

Generate a random secret for signing temporary download URLs:

```bash
# Run this command in your terminal:
openssl rand -base64 32

# Copy the output to .env:
DOWNLOAD_URL_SECRET=your-generated-secret-here
```

---

## 🧪 Testing on Base Sepolia

### Get Testnet USDC

You'll need Base Sepolia ETH and USDC for testing:

1. **Get Base Sepolia ETH** (for gas fees):
   - Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
   - Enter your wallet address
   - Request testnet ETH

2. **Get Base Sepolia USDC**:
   - Bridge Sepolia ETH to Base Sepolia using [Superbridge](https://superbridge.app/base-sepolia)
   - Swap for testnet USDC on Base Sepolia

3. **Add USDC to MetaMask**:
   - Token Address: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
   - Symbol: USDC
   - Decimals: 6

---

## ✅ Verification Checklist

After filling out all variables:

- [ ] CDP API credentials copied from portal
- [ ] OnchainKit project ID configured
- [ ] MetaMask wallet address added
- [ ] Download URL secret generated
- [ ] Base Sepolia testnet selected in MetaMask
- [ ] Have testnet ETH for gas fees
- [ ] Have testnet USDC for testing payments

---

## 🚀 Next Steps

Once all environment variables are set:

1. Restart the dev server: `pnpm --filter digital dev`
2. Test wallet connection on the download page
3. Test a complete payment flow with testnet USDC

---

## 🔒 Security Notes

- **Never commit `.env` to git** (already in `.gitignore`)
- **Keep CDP private key secure** - it has access to your CDP account
- **Use testnet only** for development - switch to mainnet only when ready for production
- **Generate a strong secret** for `DOWNLOAD_URL_SECRET` in production

---

## 📚 Additional Resources

- [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
- [x402 Protocol Docs](https://docs.cdp.coinbase.com/x402/docs/welcome)
- [OnchainKit Documentation](https://onchainkit.xyz/)
- [Base Sepolia Explorer](https://sepolia.basescan.org/)
