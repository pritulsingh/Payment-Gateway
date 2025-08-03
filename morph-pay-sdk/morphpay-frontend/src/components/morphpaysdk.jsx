import React, { useState, useEffect } from 'react';
import { X, Wallet, Smartphone, Coins, CheckCircle, AlertCircle, Copy, ExternalLink, Check, Calculator, Shield } from 'lucide-react';

const MORPH_CHAIN_ID = "0xafa"; // 2810 in hex
const MORPH_CHAIN_ID_DECIMAL = 2810;
const MORPH_RPC_URL = "https://rpc-holesky.morphl2.io";
const MORPH_EXPLORER_BASE = "https://explorer-holesky.morphl2.io/tx/";

const PAYMENT_GATEWAY_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "vendor", "type": "address"}, {"internalType": "bytes32", "name": "paymentId", "type": "bytes32"}],
    "name": "payWithETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "calculateFee",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeBps",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const MorphPaySDK = ({ 
  isOpen, 
  onClose, 
  contractAddress,
  defaultVendor = "",
  defaultAmount = "0.01",
  theme = "light",
  onSuccess,
  onError 
}) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [chainId, setChainId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("browser");
  const [amount, setAmount] = useState(defaultAmount);
  const [recipient, setRecipient] = useState(defaultVendor);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [contractInfo, setContractInfo] = useState({
    exists: null,
    paused: false,
    feeBps: "50",
    minPayment: "0.001",
  });
  const [feeInfo, setFeeInfo] = useState({ fee: "0", net: "0" });

  useEffect(() => {
    if (isOpen && typeof window !== "undefined" && window.ethereum) {
      initializeWeb3();
    }
  }, [isOpen]);

  useEffect(() => {
    if (contract && amount && contractInfo.exists && !contractInfo.paused && parseFloat(amount) > 0) {
      calculateFees();
    } else {
      setFeeInfo({ fee: "0", net: "0" });
    }
  }, [contract, amount, contractInfo.exists, contractInfo.paused]);

  const initializeWeb3 = async () => {
    try {
      const Web3Module = (await import("web3")).default;
      const web3Instance = new Web3Module(window.ethereum);
      setWeb3(web3Instance);

      const contractInstance = new web3Instance.eth.Contract(PAYMENT_GATEWAY_ABI, contractAddress);
      setContract(contractInstance);

      await checkConnectionSilently(web3Instance);
      await checkContract(web3Instance, contractInstance);

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    } catch (err) {
      setError("Failed to initialize Web3. Please refresh and try again.");
    }
  };

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
          setError("Please switch to Morph Holesky Testnet");
        }
      }
    } catch (err) {
      console.error("Error checking connection:", err);
    }
  };

  const checkContract = async (web3Instance, contractInstance) => {
    try {
      const code = await web3Instance.eth.getCode(contractAddress);
      const exists = code && code !== "0x" && code !== "0x0";

      if (exists && contractInstance) {
        try {
          const [paused, feeBps] = await Promise.all([
            contractInstance.methods.paused().call(),
            contractInstance.methods.feeBps().call(),
          ]);

          setContractInfo({
            exists: true,
            paused,
            feeBps: feeBps.toString(),
            minPayment: "0.001",
          });
        } catch (err) {
          setContractInfo(prev => ({ ...prev, exists: true }));
        }
      } else {
        setContractInfo(prev => ({ ...prev, exists: false }));
      }
    } catch (err) {
      setContractInfo(prev => ({ ...prev, exists: false }));
    }
  };

  const calculateFees = async () => {
    try {
      if (!contract || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        setFeeInfo({ fee: "0", net: "0" });
        return;
      }

      const amountNum = parseFloat(amount);
      const amountWei = web3.utils.toWei(amountNum.toString(), 'ether');
      
      const fee = await contract.methods.calculateFee(amountWei).call();
      const feeEth = web3.utils.fromWei(fee.toString(), 'ether');
      const netEth = (amountNum - parseFloat(feeEth)).toFixed(6);

      setFeeInfo({
        fee: parseFloat(feeEth).toFixed(6),
        net: netEth,
      });
    } catch (err) {
      // Fallback calculation
      const amountNum = parseFloat(amount);
      const feePercent = parseFloat(contractInfo.feeBps) / 10000;
      const feeAmount = amountNum * feePercent;
      const netAmount = amountNum - feeAmount;

      setFeeInfo({
        fee: feeAmount.toFixed(6),
        net: netAmount.toFixed(6),
      });
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
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
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                rpcUrls: [MORPH_RPC_URL],
                blockExplorerUrls: ["https://explorer-holesky.morphl2.io/"],
              },
            ],
          });
          setSuccess("Morph Holesky Testnet added successfully!");
        } catch (addError) {
          setError("Failed to add Morph Holesky Testnet");
        }
      }
    }
  };

  const getBalance = async (address, web3Instance = web3) => {
    if (!web3Instance || !address) return;
    try {
      const balance = await web3Instance.eth.getBalance(address);
      const ethBalance = web3Instance.utils.fromWei(balance, "ether");
      setBalance(Number.parseFloat(ethBalance).toFixed(4));
    } catch (err) {
      setBalance("0");
    }
  };

  const processPayment = async () => {
    if (!isConnected || !web3 || !contract || !amount || !recipient) {
      setError("Please connect wallet and fill all required fields");
      return;
    }

    if (chainId !== MORPH_CHAIN_ID) {
      setError("Please switch to Morph Holesky Testnet");
      return;
    }

    if (!contractInfo.exists) {
      setError("Payment gateway contract not found");
      return;
    }

    const amountNum = Number.parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);
    setError("");
    setSuccess("");
    setTxHash("");

    try {
      const amountWei = web3.utils.toWei(amount, "ether");
      const paymentId = web3.utils.randomHex(32);

      const gasEstimate = await contract.methods.payWithETH(recipient, paymentId).estimateGas({
        from: account,
        value: amountWei,
      });

      const tx = await contract.methods.payWithETH(recipient, paymentId).send({
        from: account,
        value: amountWei,
        gas: Math.floor(Number(gasEstimate) * 1.2),
      });

      setTxHash(tx.transactionHash);
      setSuccess(`Payment successful! Vendor received: ${feeInfo.net} ETH`);
      
      // Call success callback
      if (onSuccess) {
        onSuccess({
          txHash: tx.transactionHash,
          amount: amount,
          vendor: recipient,
          fee: feeInfo.fee,
          net: feeInfo.net
        });
      }

      await getBalance(account);
    } catch (err) {
      const errorMsg = err.message.includes("User denied") 
        ? "Transaction was rejected by user"
        : `Payment failed: ${err.message}`;
      
      setError(errorMsg);
      
      if (onError) {
        onError(err);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAccount("");
      setBalance("0");
    } else {
      setAccount(accounts[0]);
      if (web3) getBalance(accounts[0], web3);
    }
  };

  const handleChainChanged = (newChainId) => {
    setChainId(newChainId);
    if (newChainId === MORPH_CHAIN_ID) {
      setError("");
      setSuccess("Connected to Morph Holesky Testnet");
    } else {
      setError("Please switch to Morph Holesky Testnet");
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

  const openTransactionInExplorer = (hash) => {
    const url = `${MORPH_EXPLORER_BASE}${hash}`;
    try {
      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        navigator.clipboard.writeText(url).then(() => {
          setSuccess('Explorer link copied to clipboard!');
        });
      }
    } catch (err) {
      setError(`Could not open explorer. Visit: ${url}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">MorphPay</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Payment Method Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setPaymentMethod("browser")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                paymentMethod === "browser" ? "bg-white shadow-sm" : "hover:bg-gray-200"
              }`}
            >
              <Wallet className="w-4 h-4" />
              Browser
            </button>
            <button
              onClick={() => setPaymentMethod("mobile")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                paymentMethod === "mobile" ? "bg-white shadow-sm" : "hover:bg-gray-200"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              QR Code
            </button>
          </div>

          {/* Browser Payment */}
          {paymentMethod === "browser" && (
            <div className="space-y-4">
              {/* Contract Status */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Contract Status</span>
                </div>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>Status: {contractInfo.exists === null ? "⏳ Checking..." : contractInfo.exists ? "✅ Active" : "❌ Not Found"}</p>
                  <p>Fee: {(Number.parseFloat(contractInfo.feeBps) / 100).toFixed(1)}%</p>
                </div>
              </div>

              {/* Connection Status */}
              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">Connected</span>
                  </div>
                  <p className="text-xs text-green-700 font-mono">{account?.slice(0, 6)}...{account?.slice(-4)}</p>
                  <p className="text-xs text-green-700">Balance: {balance} ETH</p>
                </div>
              )}

              {/* Payment Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (ETH)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.01"
                    step="0.001"
                    min="0.001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {amount && parseFloat(amount) > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Vendor receives: {feeInfo.net} ETH (Fee: {feeInfo.fee} ETH)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Address</label>
                  <input
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={processPayment}
                disabled={
                  !isConnected ||
                  isProcessing ||
                  !amount ||
                  !recipient ||
                  chainId !== MORPH_CHAIN_ID ||
                  !contractInfo.exists ||
                  contractInfo.paused ||
                  Number.parseFloat(amount) <= 0
                }
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? "Processing..." : `Pay ${amount} ETH`}
              </button>
            </div>
          )}

          {/* QR Code Payment */}
          {paymentMethod === "mobile" && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (ETH)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.01"
                    step="0.001"
                    min="0.001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Address</label>
                  <input
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>

              {/* QR Code Display */}
              {amount && recipient && parseFloat(amount) > 0 && /^0x[a-fA-F0-9]{40}$/.test(recipient) && (
                <div className="text-center space-y-3">
                  <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        `ethereum:${recipient}@${MORPH_CHAIN_ID_DECIMAL}?value=${web3?.utils.toWei(amount, 'ether') || '0'}`
                      )}`}
                      alt="Payment QR Code"
                      className="mx-auto"
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Scan with mobile wallet to pay {amount} ETH</p>
                    <p className="text-xs">Chain: Morph Holesky Testnet</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800">{success}</span>
              </div>
            </div>
          )}

          {/* Transaction Result */}
          {txHash && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Payment Successful!</span>
                </div>
                
                <div className="bg-white border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">Transaction Hash</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => copyHashToClipboard(txHash)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {copiedHash ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => openTransactionInExplorer(txHash)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-gray-600 break-all">
                    {txHash}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Demo Usage Component
const SDKDemo = () => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState('basic');
  const [demoConfig, setDemoConfig] = useState({
    contractAddress: "0xaF673968bd6b1c373670c9e82bc8B9059d5037F4",
    vendor: "0x69f66FFbb39Bfe6538d870Bd483999A6C7442B58",
    amount: "0.01",
    theme: "light"
  });
  const [testResults, setTestResults] = useState([]);

  // Demo scenarios
  const demoScenarios = {
    basic: {
      title: "Basic Payment",
      description: "Simple ETH payment with default settings",
      vendor: "0x69f66FFbb39Bfe6538d870Bd483999A6C7442B58",
      amount: "0.01"
    },
    ecommerce: {
      title: "E-commerce Checkout",
      description: "Checkout for a $25 item (≈0.025 ETH)",
      vendor: "0x742d35Cc7dE08ADce0d6dCb6a18e0F4D2bB6C3f5",
      amount: "0.025"
    },
    donation: {
      title: "Donation",
      description: "Charity donation of 0.05 ETH",
      vendor: "0x8ba1f109551bD432803012645Hac136c96c5234A",
      amount: "0.05"
    },
    subscription: {
      title: "Monthly Subscription",
      description: "Premium subscription payment",
      vendor: "0x1234567890123456789012345678901234567890",
      amount: "0.02"
    }
  };

  const handlePaymentSuccess = (result) => {
    const timestamp = new Date().toLocaleTimeString();
    const newResult = {
      id: Date.now(),
      type: 'success',
      timestamp,
      scenario: selectedDemo,
      data: result,
      message: `✅ Payment successful! TX: ${result.txHash.slice(0, 10)}...`
    };
    setTestResults(prev => [newResult, ...prev]);
    console.log("Payment successful:", result);
  };

  const handlePaymentError = (error) => {
    const timestamp = new Date().toLocaleTimeString();
    const newResult = {
      id: Date.now(),
      type: 'error',
      timestamp,
      scenario: selectedDemo,
      message: `❌ Payment failed: ${error.message}`
    };
    setTestResults(prev => [newResult, ...prev]);
    console.error("Payment failed:", error);
  };

  const openDemo = (scenario) => {
    setSelectedDemo(scenario);
    setDemoConfig(prev => ({
      ...prev,
      vendor: demoScenarios[scenario].vendor,
      amount: demoScenarios[scenario].amount
    }));
    setIsPaymentOpen(true);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">MorphPay SDK Demo & Testing</h1>
        <p className="text-lg text-gray-600 mb-8">
          Test the complete Web3 payment solution with different scenarios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Demo Controls */}
        <div className="space-y-6">
          {/* Demo Scenarios */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">🧪 Test Scenarios</h3>
            <div className="space-y-3">
              {Object.entries(demoScenarios).map(([key, scenario]) => (
                <div key={key} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{scenario.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Amount: {scenario.amount} ETH</span>
                        <span>Vendor: {scenario.vendor.slice(0, 10)}...</span>
                      </div>
                    </div>
                    <button
                      onClick={() => openDemo(key)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Test Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">⚙️ SDK Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contract Address</label>
                <input
                  type="text"
                  value={demoConfig.contractAddress}
                  onChange={(e) => setDemoConfig(prev => ({...prev, contractAddress: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono"
                  placeholder="0x..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Vendor</label>
                <input
                  type="text"
                  value={demoConfig.vendor}
                  onChange={(e) => setDemoConfig(prev => ({...prev, vendor: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono"
                  placeholder="0x..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Amount (ETH)</label>
                <input
                  type="number"
                  step="0.001"
                  value={demoConfig.amount}
                  onChange={(e) => setDemoConfig(prev => ({...prev, amount: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                <select
                  value={demoConfig.theme}
                  onChange={(e) => setDemoConfig(prev => ({...prev, theme: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              
              <button
                onClick={() => setIsPaymentOpen(true)}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                🚀 Test Custom Configuration
              </button>
            </div>
          </div>

          {/* Quick Tests */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">⚡ Quick Tests</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => openDemo('basic')}
                className="bg-blue-100 text-blue-800 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                💳 Basic Pay
              </button>
              <button
                onClick={() => openDemo('donation')}
                className="bg-green-100 text-green-800 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
              >
                💝 Donation
              </button>
              <button
                onClick={() => openDemo('ecommerce')}
                className="bg-purple-100 text-purple-800 py-2 px-3 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
              >
                🛒 Checkout
              </button>
              <button
                onClick={() => openDemo('subscription')}
                className="bg-orange-100 text-orange-800 py-2 px-3 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
              >
                📱 Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Test Results & Code */}
        <div className="space-y-6">
          {/* Test Results */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">📊 Test Results</h3>
              {testResults.length > 0 && (
                <button
                  onClick={clearResults}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
              )}
            </div>
            
            <div className="max-h-80 overflow-y-auto space-y-2">
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>🔬 No tests run yet</p>
                  <p className="text-sm">Try one of the scenarios above to see results here</p>
                </div>
              ) : (
                testResults.map((result) => (
                  <div
                    key={result.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      result.type === 'success' 
                        ? 'bg-green-50 border-green-400' 
                        : 'bg-red-50 border-red-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize">{result.scenario}</span>
                      <span className="text-xs text-gray-500">{result.timestamp}</span>
                    </div>
                    <p className="text-sm">{result.message}</p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-600 cursor-pointer">View Details</summary>
                        <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Integration Code */}
          <div className="bg-gray-900 text-gray-100 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">💻 Integration Code</h3>
            <pre className="text-sm overflow-x-auto">
{`import { MorphPaySDK } from '@morphpay/sdk'

function MyApp() {
  const [showPayment, setShowPayment] = useState(false)

  return (
    <>
      <button onClick={() => setShowPayment(true)}>
        Pay with MorphPay
      </button>

      <MorphPaySDK
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        contractAddress="${demoConfig.contractAddress}"
        defaultVendor="${demoConfig.vendor}"
        defaultAmount="${demoConfig.amount}"
        theme="${demoConfig.theme}"
        onSuccess={(result) => {
          console.log('Payment successful:', result)
          // Handle success (update UI, redirect, etc.)
          setShowPayment(false)
        }}
        onError={(error) => {
          console.error('Payment failed:', error)
          // Handle error (show message, retry, etc.)
        }}
      />
    </>
  )
}`}
            </pre>
          </div>

          {/* Status Indicators */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">🔍 Current Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">MetaMask Detected</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  typeof window !== 'undefined' && window.ethereum 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {typeof window !== 'undefined' && window.ethereum ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Contract Address Valid</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  /^0x[a-fA-F0-9]{40}$/.test(demoConfig.contractAddress)
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {/^0x[a-fA-F0-9]{40}$/.test(demoConfig.contractAddress) ? '✅ Valid' : '❌ Invalid'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tests Run</span>
                <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {testResults.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Success Rate</span>
                <span className="text-sm px-2 py-1 bg-gray-100 text-gray-800 rounded">
                  {testResults.length === 0 
                    ? 'N/A' 
                    : `${Math.round((testResults.filter(r => r.type === 'success').length / testResults.length) * 100)}%`
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SDK Component */}
      <MorphPaySDK
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        contractAddress={demoConfig.contractAddress}
        defaultVendor={demoConfig.vendor}
        defaultAmount={demoConfig.amount}
        theme={demoConfig.theme}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </div>
  );
};

export default SDKDemo;