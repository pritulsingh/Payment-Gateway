import React, { useState, useEffect } from 'react';
import { Play, Copy, Check, Code, Zap, Shield, Globe, Wallet, Smartphone, Coins, Settings, ExternalLink, AlertCircle, CheckCircle, Calculator } from 'lucide-react';

const MorphPayPlayground = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const [amount, setAmount] = useState('0.01');
  const [recipient, setRecipient] = useState('0x69f66FFbb39Bfe6538d870Bd483999A6C7442B58');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [activeTab, setActiveTab] = useState('eth');
  const [paymentMethod, setPaymentMethod] = useState('eth');

  const [contract, setContract] = useState(null);
  const [contractInfo, setContractInfo] = useState({
    exists: null,
    paused: false,
    feeBps: "50",
    feeRecipient: "",
    dailyLimit: "0",
    todayVolume: "0",
    minPayment: "0.001",
  });
  const [feeInfo, setFeeInfo] = useState({ fee: "0", net: "0" });

  const MORPH_CHAIN_ID = "0xafa"; // 2810 in hex
  const MORPH_CHAIN_ID_DECIMAL = 2810;
  const MORPH_RPC_URL = "https://rpc-holesky.morphl2.io";
  const MORPH_EXPLORER_BASE = "https://explorer-holesky.morphl2.io/tx/";
  const PAYMENT_GATEWAY_ADDRESS = "0xaF673968bd6b1c373670c9e82bc8B9059d5037F4";

  const isMetaMaskInstalled = () => {
    return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
  };

  const isValidAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        if (isMetaMaskInstalled()) {
          const Web3 = (await import('web3')).default;
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          await checkConnectionSilently(web3Instance);

          window.ethereum.on("accountsChanged", handleAccountsChanged);
          window.ethereum.on("chainChanged", handleChainChanged);
        }
      } catch (err) {
        console.error("Error initializing Web3:", err);
        setError("Failed to initialize Web3. Please refresh the page.");
      }
    };

    initWeb3();

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const checkConnectionSilently = async (web3Instance) => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      
      if (accounts.length > 0) {
        const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
        setAccount(accounts[0]);
        setChainId(currentChainId);
        setIsConnected(true);
        await getBalance(accounts[0], web3Instance);

        if (currentChainId === MORPH_CHAIN_ID) {
          setSuccess("Connected to Morph Holesky Testnet");
        } else {
          setError("Please switch to Morph Holesky Testnet (Chain ID: 2810)");
        }
      }
    } catch (err) {
      console.error("Error checking connection silently:", err);
    }
  };

  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      setError("MetaMask is not installed. Please install MetaMask to continue.");
      return;
    }

    setIsConnecting(true);
    setError("");

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const currentChainId = await window.ethereum.request({ method: "eth_chainId" });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setChainId(currentChainId);
        setIsConnected(true);

        if (web3) {
          await getBalance(accounts[0], web3);
        }

        if (currentChainId !== MORPH_CHAIN_ID) {
          await switchToMorphNetwork();
        } else {
          setSuccess("Successfully connected to Morph Holesky Testnet!");
        }
      }
    } catch (err) {
      console.error("Connection error:", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToMorphNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MORPH_CHAIN_ID }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: MORPH_CHAIN_ID,
                chainName: "Morph Holesky Testnet",
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: [MORPH_RPC_URL],
                blockExplorerUrls: ["https://explorer-holesky.morphl2.io/"],
              },
            ],
          });
          setSuccess("Morph Holesky Testnet added and switched successfully!");
        } catch (addError) {
          setError("Failed to add Morph Holesky Testnet to MetaMask");
        }
      } else {
        setError("Failed to switch to Morph Holesky Testnet");
      }
    }
  };

  const getBalance = async (address, web3Instance = web3) => {
    if (!web3Instance || !address || !isValidAddress(address)) return;

    try {
      const balance = await web3Instance.eth.getBalance(address);
      const ethBalance = web3Instance.utils.fromWei(balance, "ether");
      setBalance(Number.parseFloat(ethBalance).toFixed(4));
    } catch (err) {
      console.error("Failed to get balance:", err);
      setBalance("0");
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAccount("");
      setBalance("0");
      setError("Please connect your wallet");
    } else {
      setAccount(accounts[0]);
      if (web3) {
        getBalance(accounts[0], web3);
      }
    }
  };

  const handleChainChanged = (newChainId) => {
    setChainId(newChainId);
    if (newChainId === MORPH_CHAIN_ID) {
      setError("");
      setSuccess("Connected to Morph Holesky Testnet");
    } else {
      setError("Please switch to Morph Holesky Testnet (Chain ID: 2810)");
    }
  };

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      const amountNum = parseFloat(amount);
      const feePercent = parseFloat(contractInfo.feeBps) / 10000;
      const feeAmount = amountNum * feePercent;
      const netAmount = amountNum - feeAmount;

      setFeeInfo({
        fee: feeAmount.toFixed(6),
        net: netAmount.toFixed(6),
      });
    } else {
      setFeeInfo({ fee: "0", net: "0" });
    }
  }, [amount, contractInfo.feeBps]);

  const processETHPayment = async () => {
    if (!isConnected || !web3 || !amount || !recipient) {
      setError("Please connect wallet and fill all required fields");
      return;
    }

    if (!isValidAddress(recipient)) {
      setError("Please enter a valid recipient address");
      return;
    }

    if (chainId !== MORPH_CHAIN_ID) {
      setError("Please switch to Morph Holesky Testnet (Chain ID: 2810)");
      return;
    }

    const amountNum = Number.parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    const balanceNum = Number.parseFloat(balance);
    if (amountNum > balanceNum) {
      setError("Insufficient balance");
      return;
    }

    setIsProcessing(true);
    setError("");
    setSuccess("");
    setTxHash("");

    try {
      const amountWei = web3.utils.toWei(amount, "ether");

      const tx = await web3.eth.sendTransaction({
        from: account,
        to: recipient,
        value: amountWei,
        gas: 21000,
      });

      setTxHash(tx.transactionHash);
      setSuccess(`Payment successful! Sent ${amount} ETH to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`);

      await getBalance(account);

      setAmount("0.01");
    } catch (err) {
      console.error("Payment error:", err);

      if (err.message.includes("insufficient funds")) {
        setError("Insufficient ETH balance for this transaction");
      } else if (err.message.includes("User denied") || err.message.includes("rejected")) {
        setError("Transaction was rejected by user");
      } else {
        setError(`Payment failed: ${err.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const openTransactionInExplorer = (hash) => {
    const primaryUrl = `${MORPH_EXPLORER_BASE}${hash}`;
    try {
      const newWindow = window.open(primaryUrl, '_blank');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        navigator.clipboard.writeText(primaryUrl).then(() => {
          setSuccess('Explorer link copied to clipboard! Paste in your browser to view transaction.');
        }).catch(() => {
          setError(`Could not open explorer. Visit: ${primaryUrl}`);
        });
      }
    } catch (err) {
      console.error('Failed to open explorer:', err);
      setError(`Could not open explorer. Visit: ${primaryUrl}`);
    }
  };

  const copyHashToClipboard = async (hash) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } catch (err) {
      console.error('Failed to copy hash:', err);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(codeExamples[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeExamples = {
    eth: `// Direct ETH Payment using MorphPay SDK
import MorphPay from '@morphpay/sdk';
const morphpay = new MorphPay();

// Initialize Web3 connection
await morphpay.connect();

// Send ETH payment
try {
  const payment = await morphpay.sendETH({
    to: '${recipient}',
    amount: '${amount}',
    from: '${account || 'YOUR_ADDRESS'}'
  });
  
  console.log('Payment successful:', payment.transactionHash);
  console.log('Gas used:', payment.gasUsed);
} catch (error) {
  console.error('Payment failed:', error.message);
}`,

    token: `// ERC-20 Token Payment using MorphPay SDK
import MorphPay from '@morphpay/sdk';
const morphpay = new MorphPay();

await morphpay.connect();

// Send token payment
try {
  const payment = await morphpay.sendToken({
    tokenAddress: '0x65aFADD39029741B3b8f0756952C74678c9cEC93', // USDC
    to: '${recipient}',
    amount: '${amount}',
    from: '${account || 'YOUR_ADDRESS'}'
  });
  
  console.log('Token payment successful:', payment.transactionHash);
} catch (error) {
  console.error('Token payment failed:', error.message);
}`,

    qr: `// Generate QR Code for Mobile Payments
import { generatePaymentQR } from '@morphpay/sdk';

const qrData = generatePaymentQR({
  recipient: '${recipient}',
  amount: '${amount}',
  chainId: ${MORPH_CHAIN_ID_DECIMAL}
});

// QR URI: ethereum:${recipient}@${MORPH_CHAIN_ID_DECIMAL}?value=${web3?.utils.toWei(amount || '0', 'ether') || '0'}
console.log('Payment URI:', qrData.uri);
console.log('QR Code URL:', qrData.qrUrl);`,

    gateway: `// Payment Gateway Contract Integration
import MorphPay from '@morphpay/sdk';
const morphpay = new MorphPay({
  contractAddress: '${PAYMENT_GATEWAY_ADDRESS}'
});

await morphpay.connect();

// Pay through gateway (with fees)
try {
  const paymentId = morphpay.generatePaymentId();
  
  const payment = await morphpay.payWithETH({
    vendor: '${recipient}',
    amount: '${amount}',
    paymentId: paymentId
  });
  
  console.log('Gateway payment successful:', payment.transactionHash);
  console.log('Vendor received:', '${feeInfo.net}', 'ETH');
  console.log('Platform fee:', '${feeInfo.fee}', 'ETH');
} catch (error) {
  console.error('Gateway payment failed:', error.message);
}`
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">MorphPay SDK</h1>
                <p className="text-purple-200 text-sm">Web3 Payment Testing</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${isConnected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className={`text-sm ${isConnected ? 'text-green-300' : 'text-red-300'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Payment Interface */}
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Wallet Connection</h3>
              
              {!isConnected ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-yellow-300">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Please connect your wallet to continue</span>
                  </div>
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{isConnecting ? 'Connecting...' : 'Connect MetaMask'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-green-300">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Wallet Connected</span>
                  </div>
                  <div className="space-y-2 text-sm text-white/80">
                    <p><strong>Account:</strong> <span className="font-mono text-xs">{account.slice(0, 6)}...{account.slice(-4)}</span></p>
                    <p><strong>Balance:</strong> {balance} ETH</p>
                    <p><strong>Network:</strong> {chainId === MORPH_CHAIN_ID ? 'Morph Holesky ✅' : 'Wrong Network ❌'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Payment Method</h3>
              
              <div className="grid grid-cols-2 gap-2 mb-6">
                {[
                  { id: 'eth', label: 'Direct ETH', icon: Wallet },
                  { id: 'qr', label: 'QR Code', icon: Smartphone },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setPaymentMethod(id)}
                    className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                      paymentMethod === id
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-purple-200 hover:bg-white/20'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Payment Form */}
              {paymentMethod === 'eth' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Amount (ETH)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="0.01"
                    />
                    <p className="text-xs text-purple-200 mt-1">
                      Balance: {balance} ETH
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Recipient Address</label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                      placeholder="0x..."
                    />
                    {recipient && !isValidAddress(recipient) && (
                      <p className="text-xs text-red-400 mt-1">Invalid address format</p>
                    )}
                  </div>

                  <button
                    onClick={processETHPayment}
                    disabled={
                      !isConnected ||
                      isProcessing ||
                      !amount ||
                      !recipient ||
                      !isValidAddress(recipient) ||
                      chainId !== MORPH_CHAIN_ID ||
                      Number.parseFloat(amount) <= 0 ||
                      Number.parseFloat(amount) > Number.parseFloat(balance)
                    }
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>{isProcessing ? 'Processing...' : `Send ${amount} ETH`}</span>
                  </button>
                </div>
              )}

              {paymentMethod === 'qr' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Amount (ETH)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Recipient Address</label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                      placeholder="0x..."
                    />
                  </div>

                  {amount && recipient && isValidAddress(recipient) && parseFloat(amount) > 0 && (
                    <div className="text-center space-y-3">
                      <div className="bg-white p-4 rounded-lg">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                            `ethereum:${recipient}@${MORPH_CHAIN_ID_DECIMAL}?value=${web3?.utils.toWei(amount, 'ether') || '0'}`
                          )}`}
                          alt="Payment QR Code"
                          className="mx-auto"
                        />
                      </div>
                      <div className="text-sm text-purple-200">
                        <p className="font-medium">Scan with mobile wallet to pay {amount} ETH</p>
                        <p className="text-xs">Chain: Morph Holesky Testnet (ID: {MORPH_CHAIN_ID_DECIMAL})</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Result Panel */}
            {(error || success || txHash) && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">Result</h3>
                
                {error && (
                  <div className="flex items-start space-x-2 text-red-300 bg-red-500/10 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-start space-x-2 text-green-300 bg-green-500/10 p-3 rounded-lg">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{success}</span>
                  </div>
                )}

                {txHash && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-300">Transaction Hash</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => copyHashToClipboard(txHash)}
                          className="p-1 hover:bg-white/10 rounded"
                        >
                          {copiedHash ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-white" />}
                        </button>
                        <button
                          onClick={() => openTransactionInExplorer(txHash)}
                          className="p-1 hover:bg-white/10 rounded"
                        >
                          <ExternalLink className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-green-300 break-all bg-black/20 p-2 rounded">
                      {txHash}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Code Examples */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Code Examples</h3>
              <button
                onClick={copyCode}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white" />}
                <span className="text-white text-sm">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex space-x-1 mb-4">
              {[
                { id: 'eth', label: 'Direct ETH' },
                { id: 'token', label: 'ERC-20' },
                { id: 'qr', label: 'QR Code' },
                { id: 'gateway', label: 'Gateway' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="bg-black/30 rounded-lg overflow-hidden">
              <pre className="p-4 text-sm text-green-300 overflow-x-auto">
                <code>{codeExamples[activeTab]}</code>
              </pre>
            </div>

            {/* SDK Stats */}
            <div className="mt-6 p-4 bg-black/20 rounded-lg">
              <h4 className="font-semibold text-sm mb-3 text-white">SDK Information</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-purple-200">Network</p>
                  <p className="font-mono text-white">Morph Holesky</p>
                </div>
                <div>
                  <p className="text-purple-200">Chain ID</p>
                  <p className="font-mono text-white">{MORPH_CHAIN_ID_DECIMAL}</p>
                </div>
                <div>
                  <p className="text-purple-200">Gateway</p>
                  <p className="font-mono text-white text-xs">{PAYMENT_GATEWAY_ADDRESS.slice(0, 8)}...</p>
                </div>
                <div>
                  <p className="text-purple-200">SDK Version</p>
                  <p className="font-mono text-white">v1.0.0</p>
                </div>
              </div>

              {/* Features List */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <h5 className="text-xs font-medium text-purple-200 mb-2">Features Available</h5>
                <div className="space-y-1 text-xs text-white/80">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>Direct ETH Transfers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>ERC-20 Token Support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>QR Code Generation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>Payment Gateway Integration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>Mobile Wallet Support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>Transaction Monitoring</span>
                  </div>
                </div>
              </div>

              {/* Network Info */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <h5 className="text-xs font-medium text-purple-200 mb-2">Network Details</h5>
                <div className="space-y-1 text-xs text-white/80">
                  <p><span className="text-purple-200">RPC URL:</span> {MORPH_RPC_URL}</p>
                  <p><span className="text-purple-200">Explorer:</span> explorer-holesky.morphl2.io</p>
                  <p><span className="text-purple-200">Currency:</span> ETH</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Integration Guide */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Quick Integration Guide</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <h4 className="font-semibold text-white">Install SDK</h4>
              <div className="bg-black/30 rounded p-3 text-xs font-mono text-green-300">
                npm install @morphpay/sdk
              </div>
            </div>

            <div className="space-y-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <h4 className="font-semibold text-white">Import & Connect</h4>
              <div className="bg-black/30 rounded p-3 text-xs font-mono text-green-300">
                import MorphPay from '@morphpay/sdk'<br/>
                const morphpay = new MorphPay()<br/>
                await morphpay.connect()
              </div>
            </div>

            <div className="space-y-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <h4 className="font-semibold text-white">Process Payments</h4>
              <div className="bg-black/30 rounded p-3 text-xs font-mono text-green-300">
                const tx = await morphpay.sendETH(&#123;<br/>
                &nbsp;&nbsp;to: recipient,<br/>
                &nbsp;&nbsp;amount: '0.01'<br/>
                &#125;)
              </div>
            </div>
          </div>

          {/* Additional Resources */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="font-semibold text-white mb-3">Resources</h4>
            <div className="flex flex-wrap gap-3">
              <a 
                href="https://docs.morphl2.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-purple-200 hover:text-white text-sm"
              >
                <Globe className="w-4 h-4" />
                <span>Morph Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://explorer-holesky.morphl2.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-purple-200 hover:text-white text-sm"
              >
                <Shield className="w-4 h-4" />
                <span>Block Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://github.com/morphl2/sdk" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-purple-200 hover:text-white text-sm"
              >
                <Code className="w-4 h-4" />
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MorphPayPlayground;