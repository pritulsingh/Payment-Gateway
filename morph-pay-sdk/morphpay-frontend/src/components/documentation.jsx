"use client"

import { useState } from 'react';
import { ExternalLink, Copy, Code, Book, Zap, Shield, Globe, Check } from 'lucide-react';

export default function MorphPayDocs() {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedCode, setCopiedCode] = useState('');

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Book },
    { id: 'quickstart', label: 'Quick Start', icon: Zap },
    { id: 'api', label: 'API Reference', icon: Code },
    { id: 'examples', label: 'Examples', icon: Globe }
  ];

  const CodeBlock = ({ code, language = 'javascript', id }) => (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-300">{language}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="flex items-center space-x-1 text-sm text-gray-300 hover:text-white transition-colors"
        >
          {copiedCode === id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copiedCode === id ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <section id="documentation" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            MorphPay SDK Documentation
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive Web3 payment solution for the Morph blockchain. Build secure, user-friendly payment experiences with our TypeScript SDK.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <a
            href="https://docs.morphl2.io/docs/build-on-morph/intro/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
          >
            <ExternalLink className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900">Morph Docs</h3>
              <p className="text-sm text-gray-600">Official Morph developer docs</p>
            </div>
          </a>
          <a
            href="https://www.npmjs.com/package/morphpay-sdk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
          >
            <ExternalLink className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900">NPM Package</h3>
              <p className="text-sm text-gray-600">Install from npm registry</p>
            </div>
          </a>
          <a
            href="https://explorer-holesky.morphl2.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
          >
            <ExternalLink className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900">Morph Explorer</h3>
              <p className="text-sm text-gray-600">Holesky testnet explorer</p>
            </div>
          </a>
          <a
            href="https://bridge-holesky.morphl2.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
          >
            <ExternalLink className="w-5 h-5 text-purple-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900">Morph Faucet</h3>
              <p className="text-sm text-gray-600">Get testnet tokens</p>
            </div>
          </a>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white p-1 rounded-lg shadow-sm">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'overview' && (
            <div className="p-8">
              <div className="prose max-w-none">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is MorphPay SDK?</h3>
                <p className="text-lg text-gray-700 mb-8">
                  MorphPay SDK is a comprehensive Web3 payment solution designed specifically for the Morph Holesky Testnet. 
                  It provides developers with everything needed to integrate cryptocurrency payments into their applications.
                </p>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  <div className="space-y-6">
                    <h4 className="text-xl font-semibold text-gray-900">Key Features</h4>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <h5 className="font-medium text-gray-900">Wallet Management</h5>
                          <p className="text-gray-600">Easy MetaMask and Web3 wallet connection with secure handling</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Globe className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                          <h5 className="font-medium text-gray-900">QR Code Payments</h5>
                          <p className="text-gray-600">Generate mobile-friendly payment QR codes for seamless transactions</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Zap className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                        <div>
                          <h5 className="font-medium text-gray-900">Token Faucet</h5>
                          <p className="text-gray-600">Daily USDT/USDC token minting for testnet development</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xl font-semibold text-gray-900">Technical Specs</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-gray-600">Network:</dt>
                          <dd className="text-sm text-gray-900">Morph Holesky Testnet</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-gray-600">Chain ID:</dt>
                          <dd className="text-sm text-gray-900">2810 (0xafa)</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-gray-600">Language:</dt>
                          <dd className="text-sm text-gray-900">TypeScript</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-gray-600">Dependencies:</dt>
                          <dd className="text-sm text-gray-900">Minimal (Web3 only)</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>

                <h4 className="text-xl font-semibold text-gray-900 mb-4">Supported Tokens</h4>
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h5 className="font-medium text-gray-900">ETH</h5>
                    <p className="text-sm text-gray-600">Native Morph token</p>
                    <p className="text-xs text-gray-500 mt-1">18 decimals</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h5 className="font-medium text-gray-900">USDT</h5>
                    <p className="text-sm text-gray-600">Mock USDT token</p>
                    <p className="text-xs text-gray-500 mt-1">6 decimals</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h5 className="font-medium text-gray-900">USDC</h5>
                    <p className="text-sm text-gray-600">Mock USDC token</p>
                    <p className="text-xs text-gray-500 mt-1">18 decimals</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quickstart' && (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Start Guide</h3>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">1. Installation</h4>
                  <CodeBlock
                    code="npm install morphpay-sdk"
                    language="bash"
                    id="install"
                  />
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">2. Basic Setup</h4>
                  <CodeBlock
                    code={`import MorphPaymentSDK from 'morphpay-sdk';

// Initialize the SDK
const sdk = new MorphPaymentSDK();

// Connect wallet
const connection = await sdk.connect();
if (connection.success) {
  console.log('Connected to:', connection.account);
}`}
                    id="basic-setup"
                  />
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">3. Make Your First Payment</h4>
                  <CodeBlock
                    code={`// Initialize for payments
const init = await sdk.initializeForPayments();
if (!init.success) {
  throw new Error(init.error);
}

// Make a payment
const payment = await sdk.payment.payWithToken(
  'USDT',                                    // token
  '10',                                      // amount
  '0x69f66FFbb39Bfe6538d870Bd483999A6C7442B58' // recipient
);

console.log('Payment successful:', payment.txHash);`}
                    id="first-payment"
                  />
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">4. Generate QR Code</h4>
                  <CodeBlock
                    code={`// Generate payment QR code
const qr = await sdk.qr.generatePaymentQR(
  '0x69f66FFbb39Bfe6538d870Bd483999A6C7442B58', // vendor address
  '0.01'                                         // amount in ETH
);

if (qr.success) {
  // Display QR code
  document.getElementById('qr-image').src = qr.imageUrl;
  console.log('Payment URI:', qr.uri);
}`}
                    id="qr-code"
                  />
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">🎉 You're Ready!</h4>
                  <p className="text-gray-700">
                    That's it! You now have a basic MorphPay integration. Check out the API Reference for more advanced features.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">API Reference</h3>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Core Methods</h4>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-mono text-lg font-medium text-gray-900 mb-2">connect()</h5>
                      <p className="text-gray-600 mb-3">Connect to MetaMask wallet</p>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <strong>Returns:</strong> <code>{'Promise<{success: boolean, account?: string, error?: string}>'}</code>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-mono text-lg font-medium text-gray-900 mb-2">initializeForPayments()</h5>
                      <p className="text-gray-600 mb-3">Complete setup required for payments (connect + network switch)</p>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <strong>Returns:</strong> <code>{'Promise<{success: boolean, error?: string}>'}</code>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-mono text-lg font-medium text-gray-900 mb-2">getPaymentStatus(tokenSymbol, amount, vendor)</h5>
                      <p className="text-gray-600 mb-3">Check if payment is ready (balance, approval status)</p>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <strong>Parameters:</strong>
                        <ul className="mt-1 ml-4 list-disc">
                          <li><code>tokenSymbol</code>: 'ETH' | 'USDT' | 'USDC'</li>
                          <li><code>amount</code>: string (token amount)</li>
                          <li><code>vendor</code>: string (recipient address)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Payment Methods</h4>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-mono text-lg font-medium text-gray-900 mb-2">payment.payWithToken(tokenSymbol, amount, vendor, paymentId?)</h5>
                      <p className="text-gray-600 mb-3">Execute ERC-20 token payment</p>
                      <CodeBlock
                        code={`const result = await sdk.payment.payWithToken(
  'USDT',
  '100',
  '0x...',
  'payment-123' // optional
);`}
                        id="pay-token-example"
                      />
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-mono text-lg font-medium text-gray-900 mb-2">payment.approveToken(tokenSymbol, amount)</h5>
                      <p className="text-gray-600 mb-3">Approve token spending (required before first payment)</p>
                      <CodeBlock
                        code={`const approval = await sdk.payment.approveToken('USDT', '100');
console.log('Approved:', approval.txHash);`}
                        id="approve-example"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">QR Code Methods</h4>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-mono text-lg font-medium text-gray-900 mb-2">qr.generatePaymentQR(vendor, amount, options?)</h5>
                    <p className="text-gray-600 mb-3">Generate payment QR code with Ethereum URI</p>
                    <CodeBlock
                      code={`const qr = await sdk.qr.generatePaymentQR(
  '0x69f66FFbb39Bfe6538d870Bd483999A6C7442B58',
  '0.01',
  { size: '300x300' } // optional
);

if (qr.success) {
  document.getElementById('qr').src = qr.imageUrl;
}`}
                      id="qr-generate-example"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Token Faucet Methods</h4>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-mono text-lg font-medium text-gray-900 mb-2">minter.loadTokenData()</h5>
                      <p className="text-gray-600 mb-3">Load current token balances and minting status</p>
                      <CodeBlock
                        code={`const tokens = await sdk.minter.loadTokenData();
console.log('USDT Balance:', tokens.USDT.balance);
console.log('Can mint:', tokens.USDT.canMint);`}
                        id="load-tokens-example"
                      />
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-mono text-lg font-medium text-gray-900 mb-2">minter.mintTokens(tokenSymbol)</h5>
                      <p className="text-gray-600 mb-3">Mint testnet tokens (once per 24 hours)</p>
                      <CodeBlock
                        code={`try {
  const mint = await sdk.minter.mintTokens('USDT');
  console.log('Minted 1000 USDT!');
  console.log('Transaction:', mint.explorerUrl);
} catch (error) {
  console.error('Mint failed:', error.message);
}`}
                        id="mint-example"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'examples' && (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Code Examples</h3>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Complete Payment Flow</h4>
                  <CodeBlock
                    code={`async function processPayment(tokenSymbol, amount, vendor) {
  try {
    // 1. Initialize wallet connection
    const init = await sdk.initializeForPayments();
    if (!init.success) {
      throw new Error(init.error);
    }

    // 2. Check payment status
    const status = await sdk.getPaymentStatus(tokenSymbol, amount, vendor);
    if (!status.hasBalance) {
      throw new Error(\`Insufficient \${tokenSymbol} balance\`);
    }

    // 3. Handle token approval if needed
    if (status.needsApproval) {
      console.log('Approving token spending...');
      await sdk.payment.approveToken(tokenSymbol, amount);
    }

    // 4. Execute payment
    console.log('Processing payment...');
    const result = await sdk.payment.payWithToken(tokenSymbol, amount, vendor);
    
    return {
      success: true,
      txHash: result.txHash,
      explorerUrl: result.explorerUrl
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Usage
const result = await processPayment('USDT', '10', '0x...');
if (result.success) {
  console.log('Payment completed:', result.explorerUrl);
} else {
  console.error('Payment failed:', result.error);
}`}
                    id="complete-payment"
                  />
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">React Hook Integration</h4>
                  <CodeBlock
                    code={`import { useState, useEffect } from 'react';
import MorphPaymentSDK from 'morphpay-sdk';

export function useWalletConnection() {
  const [sdk] = useState(() => new MorphPaymentSDK());
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Listen for wallet events
    sdk.on('walletConnected', (data) => {
      setAccount(data.account);
      setIsConnected(true);
    });

    sdk.on('walletDisconnected', () => {
      setAccount(null);
      setIsConnected(false);
    });

    sdk.on('accountChanged', (data) => {
      setAccount(data.account);
    });

    return () => {
      // Cleanup listeners
      sdk.removeAllListeners();
    };
  }, [sdk]);

  const connect = async () => {
    const result = await sdk.connect();
    return result;
  };

  const disconnect = async () => {
    await sdk.disconnect();
  };

  return {
    sdk,
    account,
    isConnected,
    connect,
    disconnect
  };
}`}
                    language="jsx"
                    id="react-hook"
                  />
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">QR Code Payment Component</h4>
                  <CodeBlock
                    code={`function PaymentQRCode({ vendor, amount }) {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateQR = async () => {
    setLoading(true);
    try {
      const sdk = new MorphPaymentSDK();
      const qr = await sdk.qr.generatePaymentQR(vendor, amount);
      
      if (qr.success) {
        setQrCode(qr);
      }
    } catch (error) {
      console.error('QR generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendor && amount) {
      generateQR();
    }
  }, [vendor, amount]);

  if (loading) return <div>Generating QR code...</div>;
  if (!qrCode) return <div>No QR code available</div>;

  return (
    <div className="text-center">
      <img src={qrCode.imageUrl} alt="Payment QR Code" />
      <p>Amount: {qrCode.amount} ETH</p>
      <p>Vendor: {qrCode.shortVendor}</p>
    </div>
  );
}`}
                    language="jsx"
                    id="qr-component"
                  />
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Token Balance Tracker</h4>
                  <CodeBlock
                    code={`class TokenBalanceTracker {
  constructor() {
    this.sdk = new MorphPaymentSDK();
    this.balances = {};
  }

  async initialize() {
    await this.sdk.connect();
    await this.loadBalances();
    this.startAutoRefresh();
  }

  async loadBalances() {
    try {
      const tokenData = await this.sdk.minter.loadTokenData();
      this.balances = {
        ETH: tokenData.ETH?.balance || '0',
        USDT: tokenData.USDT?.balance || '0',
        USDC: tokenData.USDC?.balance || '0'
      };
      
      this.onBalanceUpdate(this.balances);
    } catch (error) {
      console.error('Failed to load balances:', error);
    }
  }

  startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      this.loadBalances();
    }, 30000); // Refresh every 30 seconds
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  onBalanceUpdate(balances) {
    // Override this method to handle balance updates
    console.log('Balances updated:', balances);
  }
}

// Usage
const tracker = new TokenBalanceTracker();
tracker.onBalanceUpdate = (balances) => {
  document.getElementById('eth-balance').textContent = balances.ETH;
  document.getElementById('usdt-balance').textContent = balances.USDT;
  document.getElementById('usdc-balance').textContent = balances.USDC;
};

await tracker.initialize();`}
                    id="balance-tracker"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}