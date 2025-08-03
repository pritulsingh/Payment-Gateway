import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Web3 components with no SSR to avoid server-side rendering issues
const PaymentButton = dynamic(
  () => import('../sdk/components/PaymentButton'),
  { 
    ssr: false,
    loading: () => <p>Loading payment component...</p>
  }
);

const PaymentModal = dynamic(
  () => import('../sdk/components/PaymentModal'),
  { 
    ssr: false,
    loading: () => <p>Loading payment modal...</p>
  }
);

const CheckoutForm = dynamic(
  () => import('../sdk/components/CheckoutForm'),
  { 
    ssr: false,
    loading: () => <p>Loading checkout form...</p>
  }
);

// Web3 Utilities (these are safe for SSR but check for window)
const formatCrypto = (amount, symbol = 'ETH', decimals = 6) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0 ' + symbol;
  return num.toFixed(decimals) + ' ' + symbol;
};

const validateAddress = (address) => {
  if (typeof window === 'undefined') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const validatePaymentAmount = (amount, minAmount = '0.001') => {
  const amountNum = parseFloat(amount);
  const minAmountNum = parseFloat(minAmount);
  return !isNaN(amountNum) && amountNum > 0 && amountNum >= minAmountNum;
};

const shortenAddress = (address, chars = 4) => {
  if (!address || address.length < 42) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

// SDK Version
const VERSION = '1.0.0';

// Demo contract address (replace with actual deployed contract)
const DEMO_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';
const DEMO_RECIPIENT_ADDRESS = '0x742d35Cc6634C0532925a3b8D186DD2c6c8F3c20';

export default function DocsPage() {
  const [morphPay, setMorphPay] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Only import and instantiate MorphPay on the client side
    const initializeMorphPay = async () => {
      try {
        const { default: MorphPay } = await import('../sdk/core/MorphPay');
        const mp = new MorphPay({ 
          contractAddress: DEMO_CONTRACT_ADDRESS 
        });
        setMorphPay(mp);
      } catch (error) {
        console.error('Failed to initialize MorphPay:', error);
      }
    };

    initializeMorphPay();
  }, []);

  const handlePaymentSuccess = (result) => {
    console.log('Payment successful:', result);
    alert(`Payment completed successfully!\nTransaction: ${result.transactionHash}\nAmount: ${result.amount} ${result.paymentType}`);
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    alert('Payment failed: ' + error.message);
  };

  const handleConnect = (connectionInfo) => {
    setAccount(connectionInfo.account);
    setIsConnected(true);
    console.log('Wallet connected:', connectionInfo);
  };

  // Don't render Web3 components until mounted (client-side only)
  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <h1 className="text-4xl font-bold mb-8">MorphPay Web3 SDK Documentation</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
        <p className="text-gray-600 mb-4">
          MorphPay SDK version {VERSION} provides seamless Web3 payment integration for the Morph blockchain network.
        </p>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-2">Installation</h3>
          <code className="bg-gray-800 text-green-400 p-2 rounded block">
            npm install morphpay-sdk
          </code>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Network Information</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li><strong>Network:</strong> Morph Holesky Testnet</li>
            <li><strong>Chain ID:</strong> 2810</li>
            <li><strong>RPC URL:</strong> https://rpc-holesky.morphl2.io</li>
            <li><strong>Explorer:</strong> https://explorer-holesky.morphl2.io</li>
          </ul>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Live Components Demo</h2>
        
        {/* Connection Status */}
        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-medium">
              {isConnected ? `Connected: ${shortenAddress(account)}` : 'Not Connected'}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {isConnected 
              ? 'Ready to make payments on Morph Holesky Testnet' 
              : 'Connect your wallet to interact with payment components'
            }
          </p>
        </div>

        {/* Payment Button Demo */}
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Payment Button Component</h3>
          <p className="text-gray-600 mb-4">
            Simple one-click payment button for ETH transactions:
          </p>
          
          <div className="space-y-4">
            <PaymentButton
              contractAddress={DEMO_CONTRACT_ADDRESS}
              amount="0.01"
              recipient={DEMO_RECIPIENT_ADDRESS}
              paymentType="ETH"
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onConnect={handleConnect}
              size="md"
              variant="primary"
            >
              Pay 0.01 ETH
            </PaymentButton>

            <PaymentButton
              contractAddress={DEMO_CONTRACT_ADDRESS}
              amount="0.005"
              recipient={DEMO_RECIPIENT_ADDRESS}
              paymentType="ETH"
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onConnect={handleConnect}
              size="sm"
              variant="outline"
            >
              Small Payment
            </PaymentButton>
          </div>
        </div>

        {/* Payment Modal Demo */}
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Payment Modal Component</h3>
          <p className="text-gray-600 mb-4">
            Full-featured payment modal with multiple payment methods:
          </p>
          
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Open Payment Modal
          </button>

          <PaymentModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            contractAddress={DEMO_CONTRACT_ADDRESS}
            amount="0.02"
            recipient={DEMO_RECIPIENT_ADDRESS}
            paymentType="ETH"
            showPaymentMethods={true}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            theme="light"
          />
        </div>

        {/* Checkout Form Demo */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Checkout Form Component</h3>
          <p className="text-gray-600 mb-4">
            Complete checkout experience with fee calculation:
          </p>
          
          <CheckoutForm
            contractAddress={DEMO_CONTRACT_ADDRESS}
            amount="0.015"
            recipient={DEMO_RECIPIENT_ADDRESS}
            paymentType="ETH"
            showAmountField={true}
            showRecipientField={true}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onConnect={handleConnect}
            theme="light"
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">SDK Usage Examples</h2>
        
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Initialize MorphPay</h3>
            <p className="text-gray-600 mb-4">Create a new MorphPay instance with your contract address.</p>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
{`import MorphPay from 'morphpay-sdk';

const morphPay = new MorphPay({
  contractAddress: '0x1234...', // Your deployed contract address
  rpcUrl: 'https://rpc-holesky.morphl2.io', // Optional: custom RPC
  timeout: 30000 // Optional: request timeout
});`}
            </pre>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">ETH Payment</h3>
            <p className="text-gray-600 mb-4">Process ETH payments directly.</p>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
{`// Pay with ETH
const payment = await morphPay.payWithETH(
  '0.01', // amount in ETH
  '0x742d35Cc6634C0532925a3b8D186DD2c6c8F3c20' // recipient address
);

console.log('Transaction hash:', payment.transactionHash);`}
            </pre>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Token Payment</h3>
            <p className="text-gray-600 mb-4">Process ERC-20 token payments.</p>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
{`// Pay with tokens
const payment = await morphPay.payWithToken(
  '0xTokenAddress...', // token contract address
  '100', // amount in token units
  '0x742d35Cc6634C0532925a3b8D186DD2c6c8F3c20' // recipient address
);`}
            </pre>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Contract Information</h3>
            <p className="text-gray-600 mb-4">Get contract status and fee information.</p>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
{`// Get contract info
const info = await morphPay.getContractInfo();

console.log('Contract exists:', info.exists);
console.log('Contract paused:', info.paused);
console.log('Platform fee (bps):', info.feeBps);
console.log('Minimum payment:', info.minPayment);`}
            </pre>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Utility Functions</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">formatCrypto()</h3>
            <p className="text-gray-600 mb-2">Format cryptocurrency amounts.</p>
            <p className="text-sm">Example: {formatCrypto('0.01', 'ETH', 4)}</p>
            <pre className="bg-gray-100 p-2 text-xs rounded mt-2">
{`formatCrypto('0.01', 'ETH', 4)`}
            </pre>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">validateAddress()</h3>
            <p className="text-gray-600 mb-2">Validate Ethereum addresses.</p>
            <p className="text-sm">
              Valid: {validateAddress('0x742d35Cc6634C0532925a3b8D186DD2c6c8F3c20') ? '✅' : '❌'} |
              Invalid: {validateAddress('invalid-address') ? '✅' : '❌'}
            </p>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">validatePaymentAmount()</h3>
            <p className="text-gray-600 mb-2">Validate payment amounts with minimum checks.</p>
            <p className="text-sm">
              Valid: {validatePaymentAmount('0.01') ? '✅' : '❌'} |
              Too small: {validatePaymentAmount('0.0001') ? '✅' : '❌'}
            </p>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">shortenAddress()</h3>
            <p className="text-gray-600 mb-2">Display shortened wallet addresses.</p>
            <p className="text-sm">
              Full: 0x742d35Cc6634C0532925a3b8D186DD2c6c8F3c20<br/>
              Short: {shortenAddress('0x742d35Cc6634C0532925a3b8D186DD2c6c8F3c20')}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">React Component Props</h2>
        
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">PaymentButton Props</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4">Prop</th>
                    <th className="text-left py-2 pr-4">Type</th>
                    <th className="text-left py-2 pr-4">Required</th>
                    <th className="text-left py-2">Description</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono">contractAddress</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">✅</td>
                    <td className="py-2">Payment gateway contract address</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono">amount</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">✅</td>
                    <td className="py-2">Payment amount in ETH or token units</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono">recipient</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">✅</td>
                    <td className="py-2">Recipient wallet address</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono">paymentType</td>
                    <td className="py-2 pr-4">'ETH' | 'TOKEN'</td>
                    <td className="py-2 pr-4">❌</td>
                    <td className="py-2">Payment currency type (default: 'ETH')</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono">size</td>
                    <td className="py-2 pr-4">'sm' | 'md' | 'lg'</td>
                    <td className="py-2 pr-4">❌</td>
                    <td className="py-2">Button size (default: 'md')</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono">variant</td>
                    <td className="py-2 pr-4">'primary' | 'secondary' | 'outline'</td>
                    <td className="py-2 pr-4">❌</td>
                    <td className="py-2">Button style variant (default: 'primary')</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Error Handling</h2>
        
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Common Error Codes</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b">
              <code className="bg-gray-100 px-2 py-1 rounded">USER_REJECTED</code>
              <span className="text-gray-600">User rejected the transaction</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <code className="bg-gray-100 px-2 py-1 rounded">INSUFFICIENT_FUNDS</code>
              <span className="text-gray-600">Wallet has insufficient balance</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <code className="bg-gray-100 px-2 py-1 rounded">TRANSACTION_FAILED</code>
              <span className="text-gray-600">Transaction execution failed</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <code className="bg-gray-100 px-2 py-1 rounded">NETWORK_ERROR</code>
              <span className="text-gray-600">Wrong network or connection issue</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}