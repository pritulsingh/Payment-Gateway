import React, { useState, useEffect } from 'react';
import { Wallet, AlertCircle, CheckCircle, Calculator, Shield, Copy, Check, ExternalLink } from 'lucide-react';
import MorphPay from '../core/MorphPay';
import { isValidAddress, formatEther, MORPH_CHAIN_ID, MORPH_CHAIN_ID_DECIMAL } from '../core/utils';

const CheckoutForm = ({
  contractAddress,
  amount: initialAmount = "0.01",
  recipient: initialRecipient = "",
  paymentType = "ETH", // "ETH" or "TOKEN"
  tokenAddress = null,
  showAmountField = true,
  showRecipientField = true,
  onSuccess = () => {},
  onError = () => {},
  onConnect = () => {},
  className = '',
  theme = 'light'
}) => {
  // State management
  const [morphPay, setMorphPay] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [chainId, setChainId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [amount, setAmount] = useState(initialAmount);
  const [recipient, setRecipient] = useState(initialRecipient);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedHash, setCopiedHash] = useState(false);
  
  const [contractInfo, setContractInfo] = useState({
    exists: null,
    paused: false,
    feeBps: "50",
    minPayment: "0.001",
  });
  const [feeInfo, setFeeInfo] = useState({ fee: "0", net: "0" });

  // Theme classes
  const themeClasses = theme === 'dark' 
    ? 'bg-gray-900 text-white border-gray-700' 
    : 'bg-white text-gray-900 border-gray-200';

  const inputClasses = theme === 'dark'
    ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500';

  // Initialize MorphPay
  useEffect(() => {
    const initMorphPay = async () => {
      try {
        const morphPayInstance = new MorphPay({ contractAddress });
        setMorphPay(morphPayInstance);
        setWeb3(morphPayInstance.web3);
        
        // Check existing connection
        await checkConnectionSilently(morphPayInstance);
        
        // Set up event listeners
        if (window.ethereum) {
          window.ethereum.on("accountsChanged", handleAccountsChanged);
          window.ethereum.on("chainChanged", handleChainChanged);
        }
      } catch (err) {
        console.error("Error initializing MorphPay:", err);
        setError("Failed to initialize payment system");
      }
    };

    if (contractAddress) {
      initMorphPay();
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [contractAddress]);

  // Calculate fees when amount changes
  useEffect(() => {
    if (morphPay && amount && contractInfo.exists && !contractInfo.paused && parseFloat(amount) > 0) {
      calculateFees();
    } else {
      setFeeInfo({ fee: "0", net: "0" });
    }
  }, [morphPay, amount, contractInfo.exists, contractInfo.paused]);

  const checkConnectionSilently = async (morphPayInstance) => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      
      if (accounts.length > 0) {
        const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
        setAccount(accounts[0]);
        setChainId(currentChainId);
        setIsConnected(true);
        
        await getBalance(accounts[0], morphPayInstance);
        await checkContract(morphPayInstance);

        if (currentChainId === MORPH_CHAIN_ID) {
          setSuccess("Connected to Morph Holesky Testnet");
        } else {
          setError("Please switch to Morph Holesky Testnet");
        }
      } else {
        await checkContract(morphPayInstance, true);
      }
    } catch (err) {
      console.error("Error checking connection:", err);
      if (morphPayInstance) {
        await checkContract(morphPayInstance, true);
      }
    }
  };

  const checkContract = async (morphPayInstance, skipWalletChecks = false) => {
    try {
      const contractData = await morphPayInstance.getContractInfo();
      setContractInfo(contractData);
    } catch (err) {
      console.error("Error checking contract:", err);
      setContractInfo(prev => ({ ...prev, exists: false }));
    }
  };

  const calculateFees = async () => {
    try {
      if (!morphPay || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        setFeeInfo({ fee: "0", net: "0" });
        return;
      }

      const fees = await morphPay.calculateFees(amount);
      setFeeInfo(fees);
    } catch (err) {
      console.error("Error calculating fees:", err);
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

  const getBalance = async (address, morphPayInstance = morphPay) => {
    try {
      const balance = await morphPayInstance.getBalance(address);
      setBalance(balance);
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
      if (morphPay) {
        getBalance(accounts[0]);
      }
    }
  };

  const handleChainChanged = (newChainId) => {
    setChainId(newChainId);
    if (newChainId === MORPH_CHAIN_ID) {
      setError("");
      setSuccess("Connected to Morph Holesky Testnet");
      if (morphPay) {
        checkContract(morphPay);
      }
    } else {
      setError("Please switch to Morph Holesky Testnet");
      setContractInfo(prev => ({ ...prev, exists: null }));
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

        if (morphPay) {
          await getBalance(accounts[0]);
        }

        if (currentChainId !== MORPH_CHAIN_ID) {
          await switchToMorphNetwork();
        } else {
          setSuccess("Successfully connected to Morph Holesky Testnet!");
          if (morphPay) {
            await checkContract(morphPay);
          }
        }
        
        onConnect({ account: accounts[0], chainId: currentChainId });
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
                rpcUrls: ["https://rpc-holesky.morphl2.io"],
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

  const processPayment = async () => {
    // Validation
    if (!isConnected || !morphPay || !amount || !recipient) {
      setError("Please connect wallet and fill all required fields");
      return;
    }

    if (!isValidAddress(recipient)) {
      setError("Please enter a valid recipient address");
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

    if (contractInfo.paused) {
      setError("Payment gateway is currently paused");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    const minPayment = parseFloat(contractInfo.minPayment);
    if (amountNum < minPayment) {
      setError(`Minimum payment amount is ${minPayment} ETH`);
      return;
    }

    const balanceNum = parseFloat(balance);
    if (amountNum > balanceNum) {
      setError("Insufficient balance");
      return;
    }

    setIsProcessing(true);
    setError("");
    setSuccess("");
    setTxHash("");

    try {
      let payment;
      
      if (paymentType === "ETH") {
        payment = await morphPay.payWithETH(amount, recipient);
      } else if (paymentType === "TOKEN" && tokenAddress) {
        payment = await morphPay.payWithToken(tokenAddress, amount, recipient);
      } else {
        throw new Error("Invalid payment type or missing token address");
      }

      setTxHash(payment.transactionHash);
      setSuccess(`Payment successful! Vendor received: ${feeInfo.net} ${paymentType} (Platform fee: ${feeInfo.fee} ${paymentType})`);

      // Refresh balance and contract info
      await getBalance(account);
      await checkContract(morphPay);

      onSuccess({
        transactionHash: payment.transactionHash,
        amount,
        recipient,
        paymentType,
        fees: feeInfo
      });

      // Clear form
      if (showAmountField) setAmount("0.01");
    } catch (err) {
      console.error("Payment error:", err);
      const errorMessage = err.message || "Payment failed";
      setError(errorMessage);
      onError(err);
    } finally {
      setIsProcessing(false);
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
    const explorerUrl = `https://explorer-holesky.morphl2.io/tx/${hash}`;
    try {
      const newWindow = window.open(explorerUrl, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        navigator.clipboard.writeText(explorerUrl).then(() => {
          setSuccess('Explorer link copied to clipboard!');
        }).catch(() => {
          setError(`Could not open explorer. Visit: ${explorerUrl}`);
        });
      }
    } catch (err) {
      console.error('Failed to open explorer:', err);
      setError(`Could not open explorer. Visit: ${explorerUrl}`);
    }
  };

  return (
    <div className={`max-w-lg mx-auto p-6 border rounded-lg shadow-sm ${themeClasses} ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Web3 Payment</h2>
        <p className="text-gray-600">
          Pay with {paymentType} on Morph Holesky Testnet
        </p>
      </div>

      {/* Contract Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4" />
          <span className="font-medium text-sm">Contract Status</span>
        </div>
        <div className="space-y-1 text-sm">
          <p>
            <strong>Contract:</strong>{" "}
            {contractInfo.exists === null
              ? "⏳ Checking..."
              : contractInfo.exists
                ? "✅ Found"
                : "❌ Not Found"}
          </p>
          <p>
            <strong>Status:</strong> {contractInfo.paused ? "⏸️ Paused" : "▶️ Active"}
          </p>
          <p>
            <strong>Platform Fee:</strong> {(parseFloat(contractInfo.feeBps) / 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Fee Calculator */}
      {contractInfo.exists && amount && parseFloat(amount) > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-sm text-blue-800">Payment Breakdown</span>
          </div>
          <div className="text-sm text-blue-700">
            <p>Amount: {amount} {paymentType} → Vendor gets: {feeInfo.net} {paymentType} (Fee: {feeInfo.fee} {paymentType})</p>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
            <span className="font-medium">
              {isConnected ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "Not Connected"}
            </span>
          </div>
          {isConnected && (
            <span className="text-sm text-gray-600">
              Balance: {balance} ETH
            </span>
          )}
        </div>

        {!isConnected && (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>

      {/* Payment Form */}
      {isConnected && (
        <div className="space-y-4">
          {showAmountField && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Amount ({paymentType})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputClasses}`}
                placeholder="0.01"
                step="0.001"
                min={contractInfo.minPayment || "0.001"}
              />
              <p className="text-xs text-gray-500 mt-1">
                Min: {contractInfo.minPayment || "0.001"} {paymentType} • Vendor receives: {feeInfo.net} {paymentType}
              </p>
            </div>
          )}

          {showRecipientField && (
            <div>
              <label className="block text-sm font-medium mb-2">Recipient Address</label>
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${inputClasses}`}
                placeholder="0x..."
              />
              {recipient && !isValidAddress(recipient) && (
                <p className="text-xs text-red-500 mt-1">Invalid address format</p>
              )}
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={processPayment}
            disabled={
              isProcessing ||
              !amount ||
              !recipient ||
              !isValidAddress(recipient) ||
              chainId !== MORPH_CHAIN_ID ||
              !contractInfo.exists ||
              contractInfo.paused ||
              parseFloat(amount) <= 0 ||
              parseFloat(amount) < parseFloat(contractInfo.minPayment || "0") ||
              parseFloat(amount) > parseFloat(balance)
            }
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
          >
            {isProcessing ? "Processing Payment..." : `Pay ${amount} ${paymentType}`}
          </button>

          {/* Status Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && !txHash && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Transaction Result */}
          {txHash && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-700">Payment Successful!</span>
              </div>
              
              {/* Transaction Hash Display */}
              <div className="bg-white border rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Transaction Hash</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => copyHashToClipboard(txHash)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {copiedHash ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => openTransactionInExplorer(txHash)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="text-xs font-mono text-gray-600 break-all bg-gray-50 p-2 rounded border">
                  {txHash}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="text-sm text-gray-600">
                <p>Vendor received: <span className="font-medium text-green-600">{feeInfo.net} {paymentType}</span></p>
                <p>Platform fee: <span className="font-medium">{feeInfo.fee} {paymentType}</span></p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckoutForm;