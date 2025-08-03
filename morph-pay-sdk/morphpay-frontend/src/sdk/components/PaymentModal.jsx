import React, { useState, useEffect } from 'react';
import { X, Wallet, AlertCircle, CheckCircle, Calculator, Shield, Copy, Check, ExternalLink, Smartphone } from 'lucide-react';
import MorphPay from '../core/MorphPay';
import { isValidAddress, MORPH_CHAIN_ID, MORPH_CHAIN_ID_DECIMAL } from '../core/utils';

const PaymentModal = ({ 
  isOpen,
  onClose,
  contractAddress,
  amount: initialAmount = "0.01",
  recipient: initialRecipient = "",
  paymentType = "ETH", // "ETH", "TOKEN", or "QR"
  tokenAddress = null,
  showAmountField = true,
  showRecipientField = true,
  showPaymentMethods = true,
  onSuccess = () => {},
  onError = () => {},
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
  
  const [currentPaymentType, setCurrentPaymentType] = useState(paymentType);
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
  
  const [step, setStep] = useState('payment'); // 'payment', 'processing', 'success', 'error'

  // Theme classes
  const themeClasses = theme === 'dark' 
    ? 'bg-gray-900 text-white border-gray-700' 
    : 'bg-white text-gray-900 border-gray-200';

  const inputClasses = theme === 'dark'
    ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500';

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setStep('payment');
      setError("");
      setSuccess("");
      setTxHash("");
      setCopiedHash(false);
      setAmount(initialAmount);
      setRecipient(initialRecipient);
      setCurrentPaymentType(paymentType);
    }
  }, [isOpen, initialAmount, initialRecipient, paymentType]);

  // Initialize MorphPay when modal opens
  useEffect(() => {
    if (isOpen && contractAddress && !morphPay) {
      initMorphPay();
    }
  }, [isOpen, contractAddress, morphPay]);

  // Calculate fees when amount changes
  useEffect(() => {
    if (morphPay && amount && contractInfo.exists && !contractInfo.paused && parseFloat(amount) > 0) {
      calculateFees();
    } else {
      setFeeInfo({ fee: "0", net: "0" });
    }
  }, [morphPay, amount, contractInfo.exists, contractInfo.paused]);

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.keyCode === 27 && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

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

        if (currentChainId !== MORPH_CHAIN_ID) {
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

  const handlePayment = async () => {
    // Validation
    if (!isConnected || !morphPay || !amount || !recipient) {
      setError("Please connect wallet and fill all required fields");
      return;
    }

    if (!isValidAddress(address)) {
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
    setStep('processing');

    try {
      let payment;
      
      if (currentPaymentType === "ETH") {
        payment = await morphPay.payWithETH(amount, recipient);
      } else if (currentPaymentType === "TOKEN" && tokenAddress) {
        payment = await morphPay.payWithToken(tokenAddress, amount, recipient);
      } else {
        throw new Error("Invalid payment type or missing token address");
      }

      setTxHash(payment.transactionHash);
      setSuccess(`Payment successful! Vendor received: ${feeInfo.net} ${currentPaymentType} (Platform fee: ${feeInfo.fee} ${currentPaymentType})`);
      setStep('success');

      // Refresh balance and contract info
      await getBalance(account);
      await checkContract(morphPay);

      onSuccess({
        transactionHash: payment.transactionHash,
        amount,
        recipient,
        paymentType: currentPaymentType,
        fees: feeInfo
      });
    } catch (err) {
      console.error("Payment error:", err);
      const errorMessage = err.message || "Payment failed";
      setError(errorMessage);
      setStep('error');
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

  // Generate QR code data
  const generateQRData = () => {
    if (currentPaymentType === 'QR' && recipient && amount && parseFloat(amount) > 0) {
      return `ethereum:${recipient}@${MORPH_CHAIN_ID_DECIMAL}?value=${web3?.utils.toWei(amount, 'ether') || '0'}`;
    }
    return null;
  };

  const renderPaymentStep = () => (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      {showPaymentMethods && (
        <div>
          <label className="block text-sm font-medium mb-3">Payment Method</label>
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setCurrentPaymentType('ETH')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                currentPaymentType === 'ETH'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Wallet className="w-4 h-4" />
              ETH
            </button>
            <button
              type="button"
              onClick={() => setCurrentPaymentType('TOKEN')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                currentPaymentType === 'TOKEN'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Token
            </button>
            <button
              type="button"
              onClick={() => setCurrentPaymentType('QR')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                currentPaymentType === 'QR'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              QR Code
            </button>
          </div>
        </div>
      )}

      {/* Contract Status */}
      <div className="p-4 bg-gray-50 rounded-lg border">
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
      {contractInfo.exists && amount && parseFloat(amount) > 0 && currentPaymentType !== 'QR' && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-sm text-blue-800">Payment Breakdown</span>
          </div>
          <div className="text-sm text-blue-700">
            <p>Amount: {amount} {currentPaymentType} → Vendor gets: {feeInfo.net} {currentPaymentType} (Fee: {feeInfo.fee} {currentPaymentType})</p>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div>
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

      {/* QR Code Display */}
      {currentPaymentType === 'QR' && (
        <div className="text-center space-y-4">
          {amount && recipient && isValidAddress(recipient) && parseFloat(amount) > 0 ? (
            <>
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generateQRData())}`}
                  alt="Payment QR Code"
                  className="mx-auto"
                  onError={(e) => {
                    e.target.src = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(generateQRData())}`;
                  }}
                />
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium">Scan with mobile wallet to pay {amount} ETH</p>
                <p className="text-xs">Chain: Morph Holesky Testnet (ID: {MORPH_CHAIN_ID_DECIMAL})</p>
                <p className="text-xs font-mono break-all">To: {recipient}</p>
              </div>
              
              {/* Payment URI for manual copy */}
              <div className="bg-gray-50 border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Payment URI</span>
                  <button
                    onClick={() => {
                      const uri = generateQRData();
                      navigator.clipboard.writeText(uri).then(() => {
                        setSuccess('Payment URI copied to clipboard!');
                        setTimeout(() => setSuccess(''), 3000);
                      });
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-xs font-mono text-gray-600 break-all bg-white p-2 rounded border">
                  {generateQRData()}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Enter amount and recipient to generate QR code</p>
            </div>
          )}
        </div>
      )}

      {/* Payment Form - Show for ETH and TOKEN, hide for QR */}
      {currentPaymentType !== 'QR' && isConnected && (
        <div className="space-y-4">
          {showAmountField && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Amount ({currentPaymentType})
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
                Min: {contractInfo.minPayment || "0.001"} {currentPaymentType} • Vendor receives: {feeInfo.net} {currentPaymentType}
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
            onClick={handlePayment}
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
            {isProcessing ? "Processing Payment..." : `Pay ${amount} ${currentPaymentType}`}
          </button>
        </div>
      )}

      {/* Amount and Recipient for QR */}
      {currentPaymentType === 'QR' && (
        <div className="space-y-4">
          {showAmountField && (
            <div>
              <label className="block text-sm font-medium mb-2">Amount (ETH)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputClasses}`}
                placeholder="0.01"
                step="0.001"
                min="0.001"
              />
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
        </div>
      )}

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
    </div>
  );

  const renderProcessingStep = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
      <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
      <p className="text-gray-500">Please wait while we process your {currentPaymentType} payment...</p>
      <div className="mt-4 text-sm text-gray-600">
        <p>Amount: {amount} {currentPaymentType}</p>
        <p>To: {recipient.slice(0, 10)}...{recipient.slice(-8)}</p>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
      <p className="text-gray-500 mb-4">
        Your {currentPaymentType} payment has been processed successfully.
      </p>
      
      {/* Transaction Hash Display */}
      {txHash && (
        <div className="bg-gray-50 border rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Transaction Hash</span>
            <div className="flex gap-1">
              <button
                onClick={() => copyHashToClipboard(txHash)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {copiedHash ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
              <button
                onClick={() => openTransactionInExplorer(txHash)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="text-xs font-mono text-gray-600 break-all bg-white p-2 rounded border">
            {txHash}
          </div>
        </div>
      )}

      {/* Payment Summary */}
      <div className="text-sm text-gray-600 mb-6">
        <p>Vendor received: <span className="font-medium text-green-600">{feeInfo.net} {currentPaymentType}</span></p>
        <p>Platform fee: <span className="font-medium">{feeInfo.fee} {currentPaymentType}</span></p>
      </div>

      <button
        onClick={onClose}
        className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Done
      </button>
    </div>
  );

  const renderErrorStep = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Payment Failed</h3>
      <p className="text-gray-500 mb-4">{error}</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setStep('payment')}
          className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={onClose}
          className="border border-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-lg rounded-lg shadow-xl ${themeClasses} border max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-inherit">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              {currentPaymentType === 'QR' ? (
                <Smartphone className="w-5 h-5 text-blue-600" />
              ) : (
                <Wallet className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {currentPaymentType === 'QR' ? 'QR Code Payment' : `${currentPaymentType} Payment`}
              </h2>
              <p className="text-sm text-gray-500">
                {amount && `${amount} ${currentPaymentType}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'payment' && renderPaymentStep()}
          {step === 'processing' && renderProcessingStep()}
          {step === 'success' && renderSuccessStep()}
          {step === 'error' && renderErrorStep()}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;