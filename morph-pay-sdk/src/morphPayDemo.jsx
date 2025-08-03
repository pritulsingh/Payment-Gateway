import React, { useState } from 'react';
import MorphPay from './MorphPay'; // Import your actual MorphPay component
import { Wallet, QrCode, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function MorphPayDemo() {
  const [showMorphPay, setShowMorphPay] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Mock gateway contract for demo
  const mockGatewayContract = {
    options: {
      address: "0x1234567890123456789012345678901234567890" // Replace with actual gateway address
    },
    methods: {
      payWithETH: (vendor, paymentId) => ({
        estimateGas: async ({ from, value }) => {
          // Mock gas estimation
          return 100000;
        },
        send: async ({ from, value, gas }) => {
          // Mock transaction - in real app this would call the actual contract
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                transactionHash: "0x" + Math.random().toString(16).substr(2, 64)
              });
            }, 2000);
          });
        },
        encodeABI: () => "0x" + Math.random().toString(16).substr(2, 64)
      }),
      payWithToken: (tokenAddress, amount, vendor, paymentId) => ({
        estimateGas: async ({ from }) => 120000,
        send: async ({ from, gas }) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                transactionHash: "0x" + Math.random().toString(16).substr(2, 64)
              });
            }, 2000);
          });
        }
      })
    }
  };

  // Configuration for MorphPay
  const morphPayConfig = {
    gateway: mockGatewayContract, // Your actual gateway contract instance
    vendor: "0xA2a5E26000b8FBFA4f35264E405613F567155064",
    amount: "0.01", // ETH amount
    amountEth: "0.01",
    // For token payments (optional)
    token: "0x1234567890123456789012345678901234567890", // Token contract address
    amountToken: "100", // Token amount
    decimals: 18
  };

  const handleOpenMorphPay = () => {
    setShowMorphPay(true);
    setPaymentResult(null);
  };

  const handleCloseMorphPay = () => {
    setShowMorphPay(false);
  };

  const handlePaymentSuccess = (result) => {
    console.log("Payment successful:", result);
    setPaymentResult(result);
    setShowMorphPay(false);
  };

  const handlePaymentError = (error) => {
    console.error("Payment error:", error);
    alert("Payment failed: " + error.message);
  };

  const steps = [
    {
      title: "Connect Wallet",
      description: "Choose your connection method",
      icon: <Wallet className="w-8 h-8" />,
      options: ["MetaMask (Browser)", "WalletConnect (Mobile)"]
    },
    {
      title: "QR Code Scan",
      description: "For mobile wallets only",
      icon: <QrCode className="w-8 h-8" />,
      detail: "Open your mobile wallet app and scan the QR code"
    },
    {
      title: "Wallet Connected",
      description: "Choose payment method",
      icon: <CheckCircle className="w-8 h-8" />,
      options: ["Pay with ETH", "Pay with Token"]
    },
    {
      title: "Transaction Approval",
      description: "Confirm in your wallet",
      icon: <AlertCircle className="w-8 h-8" />,
      detail: "Your wallet will prompt you to approve the transaction"
    },
    {
      title: "Payment Complete",
      description: "Transaction confirmed on blockchain",
      icon: <CheckCircle className="w-8 h-8" />,
      detail: "✅ Payment successful!"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        MorphPay Integration Demo
      </h1>
      
      {/* Demo Instructions */}
      <div className="bg-blue-50 p-6 rounded-lg mb-6 border-l-4 border-blue-500">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">
          How to Use This Demo
        </h2>
        <ol className="text-blue-700 space-y-2">
          <li>1. Make sure you have MetaMask installed or a WalletConnect-compatible wallet</li>
          <li>2. Add Morph Holesky testnet to your wallet (Chain ID: 2810)</li>
          <li>3. Get some test ETH for the Morph Holesky network</li>
          <li>4. Click "Open Real MorphPay" to test the actual payment flow</li>
        </ol>
      </div>

      {/* Payment Result Display */}
      {paymentResult && (
        <div className="bg-green-50 p-6 rounded-lg mb-6 border-l-4 border-green-500">
          <h2 className="text-xl font-semibold text-green-800 mb-4">
            ✅ Payment Successful!
          </h2>
          <div className="text-green-700 space-y-2">
            <p><strong>Transaction Hash:</strong> 
              <span className="font-mono text-sm bg-green-100 px-2 py-1 rounded ml-2">
                {paymentResult.txHash}
              </span>
            </p>
            <p><strong>Payment ID:</strong> {paymentResult.paymentId}</p>
            <p><strong>Method:</strong> {paymentResult.method}</p>
            <p><strong>Amount:</strong> {paymentResult.amount}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
        <button
          onClick={handleOpenMorphPay}
          className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
        >
          🚀 Open Real MorphPay
        </button>
        <button
          onClick={() => setCurrentStep(0)}
          className="px-8 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold text-lg"
        >
          📚 View Flow Demo
        </button>
      </div>

      {/* Flow Demo Section */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Payment Flow Explanation
        </h2>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`flex flex-col items-center ${
                  index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                  index <= currentStep ? 'border-blue-600 bg-blue-100' : 'border-gray-300'
                }`}>
                  {step.icon}
                </div>
                <span className="text-xs mt-2 text-center max-w-20">{step.title}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {steps[currentStep].icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {steps[currentStep].title}
            </h3>
            <p className="text-gray-600 mb-4">
              {steps[currentStep].description}
            </p>
            {steps[currentStep].detail && (
              <p className="text-gray-700 font-medium">
                {steps[currentStep].detail}
              </p>
            )}
          </div>
          
          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Info */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Current Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Network:</strong> Morph Holesky Testnet</p>
            <p><strong>Chain ID:</strong> 2810</p>
            <p><strong>ETH Amount:</strong> {morphPayConfig.amountEth} ETH</p>
          </div>
          <div>
            <p><strong>Vendor:</strong> {morphPayConfig.vendor.slice(0, 10)}...</p>
            <p><strong>Fee:</strong> 0.5%</p>
            <p><strong>Token Support:</strong> {morphPayConfig.token ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      {/* Render MorphPay Modal */}
      {showMorphPay && (
        <MorphPay
          config={morphPayConfig}
          onClose={handleCloseMorphPay}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          theme="light"
        />
      )}
    </div>
  );
}