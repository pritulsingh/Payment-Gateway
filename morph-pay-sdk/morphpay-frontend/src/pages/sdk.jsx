import React, { useState } from 'react';
import { Download, Copy, Check, Code, Zap, Shield, Globe } from 'lucide-react';

const SDKPage = () => {
  const [copiedCode, setCopiedCode] = useState('');
  const [selectedTab, setSelectedTab] = useState('javascript');

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const codeExamples = {
    javascript: {
      install: 'npm install morphpay-sdk',
      usage: `import MorphPay from 'morphpay-sdk';

const morphpay = new MorphPay('your-api-key');

// Create a payment
const payment = await morphpay.createPayment({
  amount: 99.99,
  currency: 'USD',
  description: 'Product Purchase'
});

console.log('Payment created:', payment.id);`
    },
    react: {
      install: 'npm install morphpay-sdk',
      usage: `import { PaymentButton } from 'morphpay-sdk';

function App() {
  return (
    <PaymentButton
      apiKey="your-api-key"
      amount={29.99}
      currency="USD"
      onSuccess={(payment) => {
        console.log('Success:', payment);
      }}
    >
      Pay $29.99
    </PaymentButton>
  );
}`
    },
    cdn: {
      install: '<!-- No installation required -->',
      usage: `<script src="https://cdn.morphpay.com/sdk/morphpay-sdk.min.js"></script>

<script>
  const morphpay = new MorphPay('your-api-key');
  
  document.getElementById('pay-btn').onclick = async () => {
    const payment = await morphpay.createPayment({
      amount: 99.99,
      currency: 'USD'
    });
    
    console.log('Payment:', payment);
  };
</script>`
    }
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'Initialize payments in milliseconds with our optimized SDK'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure by Default',
      description: 'Built-in security features and PCI compliance out of the box'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Global Support',
      description: 'Accept payments in 100+ currencies across 40+ countries'
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'Developer Friendly',
      description: 'Clean APIs, comprehensive docs, and excellent TypeScript support'
    }
  ];

  const CodeBlock = ({ code, id, title }) => (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
        <span className="text-gray-300 text-sm">{title}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          {copiedCode === id ? <Check size={16} /> : <Copy size={16} />}
          {copiedCode === id ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-green-400 text-sm">{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              MorphPay SDK
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Integrate payments into your application in minutes. One SDK, multiple platforms, endless possibilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
                <Download size={20} />
                Get Started
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose MorphPay SDK?</h2>
          <p className="text-gray-600 text-lg">Built for developers who value simplicity and reliability</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Options */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Integration Method</h2>
            <p className="text-gray-600 text-lg">Multiple ways to integrate, all equally powerful</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              {Object.keys(codeExamples).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-6 py-2 rounded-md font-medium capitalize transition-colors ${
                    selectedTab === tab
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'cdn' ? 'CDN' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Code Examples */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Installation</h3>
              <CodeBlock
                code={codeExamples[selectedTab].install}
                id={`install-${selectedTab}`}
                title="Install Command"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Example</h3>
              <CodeBlock
                code={codeExamples[selectedTab].usage}
                id={`usage-${selectedTab}`}
                title="Basic Usage"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SDK Downloads */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Download SDK</h2>
          <p className="text-gray-600 text-lg">Get the latest version for your platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* JavaScript/Node.js */}
          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <Code className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">JavaScript/Node.js</h3>
                <p className="text-sm text-gray-600">v1.0.0</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Full-featured SDK for JavaScript and Node.js applications
            </p>
            <div className="space-y-2">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                npm install morphpay-sdk
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                Download .zip
              </button>
            </div>
          </div>

          {/* React Components */}
          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Code className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">React Components</h3>
                <p className="text-sm text-gray-600">v1.0.0</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Pre-built React components for faster integration
            </p>
            <div className="space-y-2">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                npm install morphpay-react
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                View Components
              </button>
            </div>
          </div>

          {/* CDN */}
          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Globe className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">CDN</h3>
                <p className="text-sm text-gray-600">v1.0.0</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Include directly in your HTML for quick setup
            </p>
            <div className="space-y-2">
              <button 
                onClick={() => copyToClipboard('https://cdn.morphpay.com/sdk/morphpay-sdk.min.js', 'cdn-url')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copiedCode === 'cdn-url' ? 'Copied!' : 'Copy CDN URL'}
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                Download File
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of developers already using MorphPay to power their payments
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              View Documentation
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Get API Keys
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SDKPage;