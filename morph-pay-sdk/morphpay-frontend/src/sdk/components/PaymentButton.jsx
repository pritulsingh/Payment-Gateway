import React, { useState, useEffect } from 'react';
import { Wallet, AlertCircle, CheckCircle } from 'lucide-react';
import MorphPay from '../core/MorphPay';
import { isValidAddress, MORPH_CHAIN_ID } from '../core/utils';
const PaymentButton = ({
  contractAddress,
  amount,
  recipient,
  paymentType = 'ETH', // 'ETH' or 'TOKEN'
  tokenAddress = null,
  autoConnect = false,
  onSuccess = () => { },
  onError = () => { },
  onConnect = () => { },
  className = '',
  style = {},
  children,
  size = 'md', // 'sm', 'md', 'lg'
  variant = 'primary', // 'primary', 'secondary', 'outline'
  disabled = false
}) => {
  const [morphPay, setMorphPay] = useState(null);
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [contractExists, setContractExists] = useState(null);

  // Size configurations
  const sizeConfig = {
    sm: { padding: '8px 16px', fontSize: '14px', iconSize: 14 },
    md: { padding: '12px 24px', fontSize: '16px', iconSize: 16 },
    lg: { padding: '16px 32px', fontSize: '18px', iconSize: 18 }
  };

  // Variant configurations
  const variantConfig = {
    primary: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      hoverBg: '#0056b3'
    },
    secondary: {
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      hoverBg: '#545b62'
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#007bff',
      border: '2px solid #007bff',
      hoverBg: '#007bff',
      hoverColor: 'white'
    }
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  // Initialize MorphPay
  useEffect(() => {
    const initMorphPay = async () => {
      try {
        if (!contractAddress) {
          setError("Contract address is required");
          return;
        }

        const morphPayInstance = new MorphPay({ contractAddress });
        setMorphPay(morphPayInstance);

        // Check contract exists
        const contractInfo = await morphPayInstance.getContractInfo();
        setContractExists(contractInfo.exists);

        // Auto-connect if enabled
        if (autoConnect) {
          await checkConnectionSilently(morphPayInstance);
        }

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

    initMorphPay();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [contractAddress, autoConnect]);

  const checkConnectionSilently = async (morphPayInstance) => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });

      if (accounts.length > 0) {
        const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
        setAccount(accounts[0]);
        setChainId(currentChainId);
        setIsConnected(true);

        onConnect({
          account: accounts[0],
          chainId: currentChainId,
          isCorrectChain: currentChainId === MORPH_CHAIN_ID
        });
      }
    } catch (err) {
      console.error("Error checking connection:", err);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAccount("");
      setError("Wallet disconnected");
    } else {
      setAccount(accounts[0]);
      setError("");
      onConnect({
        account: accounts[0],
        chainId,
        isCorrectChain: chainId === MORPH_CHAIN_ID
      });
    }
  };

  const handleChainChanged = (newChainId) => {
    setChainId(newChainId);
    if (newChainId !== MORPH_CHAIN_ID) {
      setError("Please switch to Morph Holesky Testnet");
    } else {
      setError("");
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed");
      onError(new Error("MetaMask is not installed"));
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

        if (currentChainId !== MORPH_CHAIN_ID) {
          await switchToMorphNetwork();
        }

        onConnect({
          account: accounts[0],
          chainId: currentChainId,
          isCorrectChain: currentChainId === MORPH_CHAIN_ID
        });
      }
    } catch (err) {
      console.error("Connection error:", err);
      const errorMessage = err.message || "Failed to connect wallet";
      setError(errorMessage);
      onError(err);
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
        } catch (addError) {
          setError("Failed to add Morph Holesky Testnet");
        }
      } else {
        setError("Failed to switch to Morph Holesky Testnet");
      }
    }
  };

  const handlePayment = async () => {
    // Validation
    if (!morphPay) {
      setError("Payment system not initialized");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Valid amount is required");
      return;
    }

    if (!recipient || !isValidAddress(recipient)) {
      setError("Valid recipient address is required");
      return;
    }

    if (!isConnected) {
      await connectWallet();
      return;
    }

    if (chainId !== MORPH_CHAIN_ID) {
      setError("Please switch to Morph Holesky Testnet");
      return;
    }

    if (contractExists === false) {
      setError("Payment gateway contract not found");
      return;
    }

    if (paymentType === 'TOKEN' && !tokenAddress) {
      setError("Token address is required for token payments");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      let payment;

      if (paymentType === 'ETH') {
        payment = await morphPay.payWithETH(amount, recipient);
      } else if (paymentType === 'TOKEN') {
        payment = await morphPay.payWithToken(tokenAddress, amount, recipient);
      } else {
        throw new Error("Invalid payment type");
      }

      onSuccess({
        transactionHash: payment.transactionHash,
        amount,
        recipient,
        paymentType,
        tokenAddress: paymentType === 'TOKEN' ? tokenAddress : null
      });

    } catch (err) {
      console.error("Payment error:", err);
      const errorMessage = err.message || "Payment failed";
      setError(errorMessage);
      onError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine button state and text
  const getButtonState = () => {
    if (disabled) return { text: 'Disabled', disabled: true };
    if (isProcessing) return { text: 'Processing...', disabled: true };
    if (isConnecting) return { text: 'Connecting...', disabled: true };
    if (!isConnected) return { text: 'Connect & Pay', disabled: false };
    if (chainId !== MORPH_CHAIN_ID) return { text: 'Switch Network', disabled: false };
    if (contractExists === false) return { text: 'Contract Not Found', disabled: true };
    if (contractExists === null) return { text: 'Checking...', disabled: true };

    const defaultText = children || `Pay ${amount} ${paymentType}`;
    return { text: defaultText, disabled: false };
  };

  const buttonState = getButtonState();

  const buttonStyle = {
    backgroundColor: buttonState.disabled ? '#cccccc' : currentVariant.backgroundColor,
    color: buttonState.disabled ? '#666666' : currentVariant.color,
    border: currentVariant.border,
    padding: currentSize.padding,
    borderRadius: '6px',
    fontSize: currentSize.fontSize,
    fontWeight: '600',
    cursor: buttonState.disabled ? 'not-allowed' : 'pointer',
    opacity: buttonState.disabled ? 0.7 : 1,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    outline: 'none',
    ...style
  };

  const handleMouseEnter = (e) => {
    if (!buttonState.disabled && currentVariant.hoverBg) {
      e.target.style.backgroundColor = currentVariant.hoverBg;
      if (currentVariant.hoverColor) {
        e.target.style.color = currentVariant.hoverColor;
      }
    }
  };

  const handleMouseLeave = (e) => {
    if (!buttonState.disabled) {
      e.target.style.backgroundColor = currentVariant.backgroundColor;
      e.target.style.color = currentVariant.color;
    }
  };

  return (
    <div className="morphpay-payment-button">
      <button
        onClick={handlePayment}
        disabled={buttonState.disabled}
        className={className}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {(isConnecting || isProcessing) && (
          <div
            style={{
              width: currentSize.iconSize,
              height: currentSize.iconSize,
              border: '2px solid transparent',
              borderTop: '2px solid currentColor',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
        )}
        {!isConnected && !isConnecting && (
          <Wallet size={currentSize.iconSize} />
        )}
        {isConnected && !isProcessing && chainId === MORPH_CHAIN_ID && contractExists && (
          <CheckCircle size={currentSize.iconSize} />
        )}
        {error && !isProcessing && !isConnecting && (
          <AlertCircle size={currentSize.iconSize} />
        )}
        <span>{buttonState.text}</span>
      </button>

      {error && (
        <div style={{
          color: '#dc3545',
          marginTop: '8px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Add CSS for spin animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PaymentButton;