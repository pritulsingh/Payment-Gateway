"use client"
import { useState } from 'react';
import { Copy, Check, Code, Zap, Shield, Database, Wallet, CreditCard } from 'lucide-react';

export default function MorphPayIntegration() {
  const [activeStep, setActiveStep] = useState(1);
  const [copiedCode, setCopiedCode] = useState('');

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const CodeBlock = ({ code, language = 'javascript', id, title }) => (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
        <span className="text-sm text-gray-400">{title}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
        >
          {copiedCode === id ? <Check size={12} /> : <Copy size={12} />}
          {copiedCode === id ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className={`language-${language} text-sm text-gray-100`}>{code}</code>
      </pre>
    </div>
  );

  const steps = [
    {
      id: 1,
      title: "Installation",
      icon: <Database className="w-6 h-6" />,
      description: "Install MorphPay SDK",
      content: (
        <div className="space-y-4">
          <CodeBlock
            id="install"
            title="Install SDK"
            code={`npm install morphpay-sdk`}
            language="bash"
          />
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
            <strong>Requirements:</strong> Node.js 18+, React 18+, MetaMask extension
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "SDK Setup",
      icon: <Code className="w-6 h-6" />,
      description: "Initialize the SDK",
      content: (
        <div className="space-y-4">
          <CodeBlock
            id="sdk-setup"
            title="SDK Initialization"
            code={`import { MorphPay } from 'morphpay-sdk';

const [sdk, setSdk] = useState(null);

useEffect(() => {
  const initSDK = async () => {
    const instance = new MorphPay({
      contractAddress: "YOUR_CONTRACT_ADDRESS",
      chainId: "0x28c58", // Morph Holesky
      rpcUrl: "https://rpc-quicknode-holesky.morphl2.io"
    });
    setSdk(instance);
  };
  initSDK();
}, []);`}
          />
        </div>
      )
    },
    {
      id: 3,
      title: "Connect Wallet",
      icon: <Wallet className="w-6 h-6" />,
      description: "Connect user's MetaMask wallet",
      content: (
        <div className="space-y-4">
          <CodeBlock
            id="connect-wallet"
            title="Wallet Connection"
            code={`const [account, setAccount] = useState("");

const connectWallet = async () => {
  try {
    const result = await sdk.connectWallet();
    setAccount(result.account);
    console.log("Connected:", result.account);
  } catch (error) {
    console.error("Connection failed:", error);
  }
};

// UI
<button onClick={connectWallet}>
  {account ? "Connected" : "Connect Wallet"}
</button>`}
          />
        </div>
      )
    },
    {
      id: 4,
      title: "Load Balances",
      icon: <Shield className="w-6 h-6" />,
      description: "Get user's ETH and token balances",
      content: (
        <div className="space-y-4">
          <CodeBlock
            id="balances"
            title="Balance Loading"
            code={`const [balances, setBalances] = useState({ ETH: "0", USDC: "0" });

const loadBalances = async () => {
  if (!sdk || !account) return;
  
  try {
    // ETH balance
    const ethBalance = await sdk.getBalance(account);
    
    // Token balance (USDC example)
    const usdcInfo = await sdk.getTokenBalance(
      "0xF5a9c115661d413A53128c368977FF44A5a9270C", // USDC address
      account
    );
    
    setBalances({
      ETH: ethBalance,
      USDC: usdcInfo.balance
    });
  } catch (error) {
    console.error("Balance loading failed:", error);
  }
};`}
          />
        </div>
      )
    },
    {
      id: 5,
      title: "Make Payments",
      icon: <CreditCard className="w-6 h-6" />,
      description: "Process ETH and token payments",
      content: (
        <div className="space-y-4">
          <CodeBlock
            id="payments"
            title="Payment Processing"
            code={`const [amount, setAmount] = useState("0.01");
const [vendorAddress, setVendorAddress] = useState("");

// ETH Payment
const payWithETH = async () => {
  try {
    const result = await sdk.payWithETH(vendorAddress, amount);
    console.log("Payment successful:", result.transactionHash);
  } catch (error) {
    console.error("Payment failed:", error);
  }
};

// Token Payment
const payWithToken = async () => {
  try {
    const tokenAddress = "0xF5a9c115661d413A53128c368977FF44A5a9270C";
    const result = await sdk.payWithToken(tokenAddress, amount, vendorAddress);
    console.log("Token payment successful:", result.transactionHash);
  } catch (error) {
    console.error("Token payment failed:", error);
  }
};`}
          />
        </div>
      )
    }
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          MorphPay SDK Integration
        </h1>
        <p className="text-lg text-gray-600">
          Quick integration guide for MorphPay SDK in React applications.
        </p>
      </div>

      {/* Step Navigation */}
      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all font-medium text-sm ${
                activeStep === step.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg transform scale-105'
                  : 'bg-white text-gray-800 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 shadow-sm'
              }`}
            >
              {step.icon}
              <span className="whitespace-nowrap">
                {step.id}. {step.title}
              </span>
            </button>
          ))}
        </div>
        
        <div className="w-full bg-gray-300 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm" 
            style={{ width: `${(activeStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-8 border border-gray-200 shadow-sm">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`${activeStep === step.id ? 'block' : 'hidden'}`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl text-indigo-600 shadow-sm">
                {step.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {step.title}
                </h2>
                <p className="text-gray-700">{step.description}</p>
              </div>
            </div>
            {step.content}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <button
          onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
          disabled={activeStep === 1}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-400 hover:text-indigo-700 transition-all"
        >
          ← Previous
        </button>
        
        <div className="flex items-center bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-full">
          <span className="text-gray-700 font-medium">
            Step {activeStep} of {steps.length}
          </span>
        </div>
        
        <button
          onClick={() => setActiveStep(Math.min(steps.length, activeStep + 1))}
          disabled={activeStep === steps.length}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-indigo-600 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
        >
          Next →
        </button>
      </div>
    </div>
  );
}