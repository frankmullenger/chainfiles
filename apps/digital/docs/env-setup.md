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
4. Save the credentials to your `.env` file:
   ```bash
   CDP_API_KEY_ID=your-key-id-here
   CDP_API_KEY_SECRET=your-secret-here
   ```

> **Important**: The secret will only be shown once. Save it securely!

---

### 2. **Your Wallet Address**

Use your MetaMask wallet address for receiving payments:

1. Open MetaMask
2. Switch to **Base Sepolia** testnet
3. Copy your wallet address (starts with `0x...`)
   ```bash
   NEXT_PUBLIC_SELLER_WALLET_ADDRESS=0xYourWalletAddressHere
   ```

> **Note**: This is where you'll receive USDC payments from buyers.

---

## 🧪 Testing on Base Sepolia

### Network Configuration

The app is pre-configured for Base Sepolia testnet:
- **Network**: base-sepolia
- **USDC Token**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **Payment Price**: $0.01 USD (hardcoded in middleware for MVP)

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
- [ ] MetaMask wallet address added
- [ ] Base Sepolia testnet selected in MetaMask
- [ ] Have testnet ETH for gas fees
- [ ] Have testnet USDC for testing payments
- [ ] Dev server running: `pnpm --filter digital dev`

---

## 🚀 Next Steps

Once all environment variables are set:

1. Restart the dev server: `pnpm --filter digital dev`
2. Visit the download test page: `http://localhost:3005/download/test-spike-123`
3. Click "Test Download (Requires Payment)" to see 402 payment response
4. Check browser console for payment data structure

---

## 🔒 Security Notes

- **Never commit `.env` to git** (already in `.gitignore`)
- **Keep CDP API secret secure** - it has access to your CDP account
- **Use testnet only** for development - switch to mainnet only when ready for production
- For production, use proper secret management (environment variables, secret managers)

---

## 📚 Additional Resources

- [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
- [x402 Protocol Docs](https://docs.x402.org/)
- [Base Sepolia Explorer](https://sepolia.basescan.org/)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
