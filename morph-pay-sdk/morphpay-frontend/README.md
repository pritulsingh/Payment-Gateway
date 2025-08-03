# MorphPay SDK

A comprehensive Web3 payment solution for the Morph Holesky Testnet, featuring QR code generation, token operations, and seamless ERC-20 payments.

[![npm version](https://img.shields.io/npm/v/morphpay-sdk)](https://www.npmjs.com/package/morphpay-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **🔗 Wallet Management**: Easy MetaMask and Web3 wallet connection
- **📱 QR Code Payments**: Generate mobile-friendly payment QR codes
- **🚰 Token Operations**: Mint and approve ERC-20 tokens (testnet)
- **💰 ERC-20 Payments**: Seamless token payments with approval handling
- **🌐 Network Detection**: Automatic Morph Holesky network switching
- **📊 Balance Tracking**: Real-time token balance monitoring
- **🔒 Type Safety**: Full TypeScript support
- **⚡ Modular Components**: Pre-built React components and utilities

## 📦 Installation

### NPM
```bash
npm install morphpay-sdk
```

### CDN (Browser)
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/web3/1.8.0/web3.min.js"></script>
<script src="https://unpkg.com/morphpay-sdk@1.0.0/dist/morphpay-sdk.min.js"></script>
```

## 🏁 Quick Start

### Basic Setup
```javascript
// Import the main SDK class and utilities
import { MorphPay } from 'morphpay-sdk';
import {
  isValidAddress,
  formatEther,
  toWei,
  MORPH_CHAIN_ID,
  MORPH_CHAIN_ID_DECIMAL,
  MORPH_NETWORK_CONFIG
} from 'morphpay-sdk';

// Initialize with optional configuration
const config = {
  contractAddress: '0xaF673968bd6b1c373670c9e82bc8B9059d5037F4',
  chainId: MORPH_CHAIN_ID,
  chainIdDecimal: MORPH_CHAIN_ID_DECIMAL,
  rpcUrl: MORPH_NETWORK_CONFIG.rpcUrl,
  explorerBase: MORPH_NETWORK_CONFIG.explorerBase
};

const morphPay = new MorphPay(config);

// Connect wallet
const connection = await morphPay.connectWallet();
if (connection.account) {
    console.log('Connected to:', connection.account);
}
```

### React Integration
```javascript
import React, { useState, useEffect } from 'react';
import { 
  MorphPay,
  PaymentButton,
  PaymentModal,
  CheckoutForm,
  isValidAddress,
  validatePaymentAmount,
  formatCrypto,
  shortenAddress
} from 'morphpay-sdk';

function PaymentApp() {
  const [sdk, setSdk] = useState(null);
  const [account, setAccount] = useState('');

  useEffect(() => {
    const initSDK = async () => {
      const morphPay = new MorphPay();
      setSdk(morphPay);
    };
    initSDK();
  }, []);

  const handleConnect = async () => {
    if (!sdk) return;
    const result = await sdk.connectWallet();
    setAccount(result.account);
  };

  return (
    <div>
      <button onClick={handleConnect}>
        {account ? `Connected: ${shortenAddress(account)}` : 'Connect Wallet'}
      </button>
      
      {/* Use pre-built components */}
      <PaymentButton 
        amount="10"
        tokenSymbol="USDC"
        recipientAddress="0x..."
        onSuccess={(txHash) => console.log('Payment successful:', txHash)}
      />
    </div>
  );
}
```

## 📖 Core Features

### 1. Wallet Connection & Network Management

```javascript
// Connect to MetaMask
const connection = await morphPay.connectWallet();
console.log('Account:', connection.account);

// Check if on correct network
const isCorrect = await isCorrectNetwork();
if (!isCorrect) {
  // Network switching is handled automatically during connection
  console.log('Switching to Morph Holesky...');
}

// Check MetaMask installation
if (!checkMetaMaskInstalled()) {
  requestMetaMaskInstallation();
}
```

### 2. Balance Management

```javascript
// Get ETH balance
const ethBalance = await morphPay.getBalance(account);
console.log('ETH Balance:', formatBalance(ethBalance));

// Get ERC-20 token balance
const tokenBalance = await morphPay.getTokenBalance(tokenAddress, account);
console.log('Token Balance:', tokenBalance.balance);

// Check token allowance
const allowance = await morphPay.checkTokenAllowance(tokenAddress, account);
console.log('Allowance:', allowance);
```

### 3. Token Operations

```javascript
// Approve token spending
const approvalTx = await morphPay.approveToken(tokenAddress, amount);
console.log('Approval TX:', approvalTx.transactionHash);

// Mint tokens (testnet only)
const mintTx = await morphPay.mintToken(tokenAddress);
console.log('Mint TX:', mintTx.transactionHash);
```

### 4. Payments

```javascript
// Pay with ETH
const ethPayment = await morphPay.payWithETH(recipientAddress, amount);
console.log('ETH Payment TX:', ethPayment.transactionHash);

// Pay with ERC-20 tokens
const tokenPayment = await morphPay.payWithToken(
  tokenAddress, 
  amount, 
  recipientAddress
);
console.log('Token Payment TX:', tokenPayment.transactionHash);
console.log('Payment ID:', tokenPayment.paymentId);
```

### 5. QR Code Generation

```javascript
// Generate QR code for ETH payment
const ethQR = generatePaymentQR(recipientAddress, amount, 'ETH');

// Generate QR code for token payment
const tokenQR = generatePaymentQR(recipientAddress, amount, 'USDC', {
  tokenAddress: '0xF5a9c115661d413A53128c368977FF44A5a9270C'
});

// Display QR code
document.getElementById('qr-image').src = ethQR.imageUrl;
console.log('Payment URI:', ethQR.uri);
```

### 6. Fee Calculation

```javascript
// Calculate platform fees
const feeInfo = await morphPay.calculateFee(amount);
console.log('Fee:', feeInfo.fee);
console.log('Net amount:', feeInfo.net);
```

### 7. Contract Information

```javascript
// Get contract status and info
const contractInfo = await morphPay.checkContract();
console.log('Contract exists:', contractInfo.exists);
console.log('Daily limit:', contractInfo.dailyLimit);
console.log('Fee basis points:', contractInfo.feeBps);
console.log('Min payment:', contractInfo.minPayment);
```

## 🎯 Available Components

### PaymentButton
```javascript
import { PaymentButton } from 'morphpay-sdk';

<PaymentButton
  amount="10"
  tokenSymbol="USDC"
  recipientAddress="0x..."
  onSuccess={(txHash) => console.log('Success:', txHash)}
  onError={(error) => console.error('Error:', error)}
/>
```

### PaymentModal
```javascript
import { PaymentModal } from 'morphpay-sdk';

<PaymentModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  paymentData={{
    amount: "10",
    tokenSymbol: "USDC",
    recipientAddress: "0x..."
  }}
/>
```

### CheckoutForm
```javascript
import { CheckoutForm } from 'morphpay-sdk';

<CheckoutForm
  onSubmit={(paymentData) => handlePayment(paymentData)}
  supportedTokens={['ETH', 'USDC', 'USDT']}
/>
```

## 🔧 Utility Functions

### Address & Validation
```javascript
import {
  isValidAddress,
  validatePaymentAmount,
  validateTokenAddress,
  shortenAddress
} from 'morphpay-sdk';

// Validate Ethereum address
const isValid = isValidAddress('0x...');

// Validate payment amount
const isValidAmount = validatePaymentAmount('10.5');

// Shorten address for display
const short = shortenAddress('0x1234...5678'); // "0x1234...5678"
```

### Formatting
```javascript
import {
  formatEther,
  formatCrypto,
  formatTransactionHash,
  toWei
} from 'morphpay-sdk';

// Format crypto amounts
const formatted = formatCrypto('1000000', 6, 2); // "1.00"

// Format transaction hash
const shortHash = formatTransactionHash('0xabcd...'); // "0xabcd...ef12"

// Convert to Wei
const wei = toWei('1.5'); // "1500000000000000000"
```

### Error Handling
```javascript
import {
  createPaymentError,
  handleWeb3Error,
  waitForTransaction
} from 'morphpay-sdk';

try {
  const tx = await morphPay.payWithETH(recipient, amount);
  
  // Wait for transaction confirmation
  await waitForTransaction(tx.transactionHash);
} catch (error) {
  const handledError = handleWeb3Error(error);
  console.error('Payment failed:', handledError.message);
}
```

### Network & Explorer
```javascript
import {
  getExplorerUrl,
  calculateNetworkFee,
  calculatePlatformFee,
  isCorrectNetwork
} from 'morphpay-sdk';

// Get explorer URL
const explorerUrl = getExplorerUrl(txHash);

// Check network
const onCorrectNetwork = await isCorrectNetwork();

// Calculate fees
const networkFee = calculateNetworkFee(gasUsed, gasPrice);
const platformFee = calculatePlatformFee(amount, feeBps);
```

## 🌐 Constants & Configuration

```javascript
import {
  MORPH_CHAIN_ID,           // '0xafa'
  MORPH_CHAIN_ID_DECIMAL,   // 2810
  MORPH_NETWORK_CONFIG,     // Network configuration object
  PAYMENT_TYPES,            // { ETH: 'ETH', USDC: 'USDC', ... }
  VERSION,                  // SDK version
  SDK_CONFIG                // Default SDK configuration
} from 'morphpay-sdk';
```

## 📋 Network Configuration

### Morph Holesky Testnet
- **Chain ID**: 2810 (0xafa)
- **RPC URL**: https://rpc-holesky.morphl2.io
- **Explorer**: https://explorer-holesky.morphl2.io
- **Faucet**: https://bridge-holesky.morphl2.io

### Default Contract Addresses
- **Payment Gateway**: `0xaF673968bd6b1c373670c9e82bc8B9059d5037F4`
- **Mock USDC**: `0xF5a9c115661d413A53128c368977FF44A5a9270C`
- **Mock USDT**: `0x3Cd1994D86E59d731969a392ab12D6F7e05f21F8`

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Example Test
```javascript
import { MorphPay, isValidAddress } from 'morphpay-sdk';

describe('MorphPay SDK', () => {
  let morphPay;
  
  beforeEach(() => {
    morphPay = new MorphPay();
  });
  
  test('should validate addresses correctly', () => {
    expect(isValidAddress('0x69f66FFbb39Bfe6538d870Bd483999A6C7442B58')).toBe(true);
    expect(isValidAddress('invalid')).toBe(false);
  });
  
  test('should initialize SDK', () => {
    expect(morphPay).toBeDefined();
  });
});
```

## 🔒 Security Features

- All transactions require user approval via MetaMask
- Private keys never leave the user's wallet
- Input validation on all user-provided data
- Network verification before transactions
- Automatic approval checks before token transfers
- Transaction confirmation waiting

## 🎯 Error Handling

The SDK provides comprehensive error handling:

```javascript
import { PAYMENT_TYPES, createPaymentError } from 'morphpay-sdk';

try {
  const result = await morphPay.payWithETH(recipient, amount);
} catch (error) {
  if (error.code === 'USER_REJECTED_REQUEST') {
    console.log('User cancelled the transaction');
  } else if (error.code === 'INSUFFICIENT_FUNDS') {
    console.log('Insufficient balance for transaction');
  } else {
    console.error('Payment error:', error.message);
  }
}
```

## 🛠️ Development

### Build from Source
```bash
git clone https://github.com/yourusername/morphpay-sdk.git
cd morphpay-sdk
npm install
npm run build
```

### Development Server
```bash
npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [GitHub Wiki](https://github.com/yourusername/morphpay-sdk/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/morphpay-sdk/issues)
- **Discord**: [Join our Discord](https://discord.gg/your-discord)
- **Email**: support@yourcompany.com

## 🎯 Roadmap

- [ ] Multi-chain support
- [ ] React hooks integration
- [ ] Vue.js plugin
- [ ] Payment notifications
- [ ] Recurring payments
- [ ] NFT payment support
- [ ] Mobile SDK (React Native)
- [ ] Enhanced error recovery
- [ ] Batch payments
- [ ] Gas optimization

---

**Made with ❤️ for the Morph ecosystem**