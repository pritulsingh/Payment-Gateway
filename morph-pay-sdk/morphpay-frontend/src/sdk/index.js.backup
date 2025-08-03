// Core SDK
import MorphPay from './core/MorphPay';
import Web3 from 'web3';
// React Components
import PaymentButton from './components/PaymentButton.jsx';
import PaymentModal from './components/PaymentModal.jsx';
import CheckoutForm from './components/CheckoutForm.jsx';

// Utilities from core
import { 
  isValidAddress, 
  formatEther, 
  toWei,
  MORPH_CHAIN_ID, 
  MORPH_CHAIN_ID_DECIMAL,
  MORPH_NETWORK_CONFIG 
} from './core/utils';

// Web3 Payment Utilities
const formatCrypto = (amount, symbol = 'ETH', decimals = 6) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0 ' + symbol;
  return num.toFixed(decimals) + ' ' + symbol;
};

const validatePaymentAmount = (amount, minAmount = '0.001') => {
  const amountNum = parseFloat(amount);
  const minAmountNum = parseFloat(minAmount);
  return !isNaN(amountNum) && amountNum > 0 && amountNum >= minAmountNum;
};

const validateTokenAddress = (address) => {
  return isValidAddress(address);
};

const calculateNetworkFee = (gasPrice, gasLimit) => {
  if (!gasPrice || !gasLimit) return '0';
  const gasCost = parseFloat(gasPrice) * parseFloat(gasLimit);
  return formatEther(gasCost.toString());
};

const formatTransactionHash = (hash) => {
  if (!hash || hash.length < 42) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

const getExplorerUrl = (hash, type = 'tx') => {
  const baseUrl = 'https://explorer-holesky.morphl2.io';
  return `${baseUrl}/${type}/${hash}`;
};

const shortenAddress = (address, chars = 4) => {
  if (!address || address.length < 42) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

// Payment type constants
const PAYMENT_TYPES = {
  ETH: 'ETH',
  TOKEN: 'TOKEN',
  QR: 'QR'
};

// Network validation
const isCorrectNetwork = (chainId) => {
  return chainId === MORPH_CHAIN_ID;
};

// Error handling utilities
const createPaymentError = (message, code = 'PAYMENT_ERROR', details = {}) => {
  const error = new Error(message);
  error.code = code;
  error.details = details;
  return error;
};

const handleWeb3Error = (error) => {
  if (error.code === 4001) {
    return createPaymentError('Transaction rejected by user', 'USER_REJECTED');
  }
  if (error.code === -32603) {
    return createPaymentError('Transaction failed', 'TRANSACTION_FAILED', { originalError: error });
  }
  if (error.message?.includes('insufficient funds')) {
    return createPaymentError('Insufficient balance', 'INSUFFICIENT_FUNDS');
  }
  return createPaymentError(error.message || 'Unknown error', 'UNKNOWN_ERROR', { originalError: error });
};

// Connection utilities
const checkMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

const requestMetaMaskInstallation = () => {
  const installUrl = 'https://metamask.io/download/';
  if (typeof window !== 'undefined') {
    window.open(installUrl, '_blank');
  }
  return installUrl;
};

// Fee calculation utilities
const calculatePlatformFee = (amount, feeBps = 50) => {
  const amountNum = parseFloat(amount);
  const feePercent = parseFloat(feeBps) / 10000;
  const feeAmount = amountNum * feePercent;
  const netAmount = amountNum - feeAmount;
  
  return {
    fee: feeAmount.toFixed(6),
    net: netAmount.toFixed(6),
    feePercent: (feePercent * 100).toFixed(2)
  };
};

// Transaction utilities
const waitForTransaction = async (web3, hash, maxWaitTime = 60000) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const receipt = await web3.eth.getTransactionReceipt(hash);
      if (receipt) {
        return receipt;
      }
    } catch (error) {
      console.warn('Error checking transaction receipt:', error);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw createPaymentError('Transaction confirmation timeout', 'TIMEOUT');
};

// QR Code utilities
const generatePaymentQR = (recipient, amount, chainId = MORPH_CHAIN_ID_DECIMAL) => {
  if (!isValidAddress(recipient) || !validatePaymentAmount(amount)) {
    throw createPaymentError('Invalid recipient address or amount', 'INVALID_PARAMETERS');
  }
  
  // Convert amount to wei for the URI
  
  const weiAmount = Web3.utils.toWei(amount, 'ether');
  
  return `ethereum:${recipient}@${chainId}?value=${weiAmount}`;
};

// SDK Version
const VERSION = '1.0.0';

// SDK Configuration
const SDK_CONFIG = {
  version: VERSION,
  supportedChains: [MORPH_CHAIN_ID_DECIMAL],
  defaultChain: MORPH_CHAIN_ID_DECIMAL,
  explorerBaseUrl: 'https://explorer-holesky.morphl2.io',
  rpcUrl: 'https://rpc-holesky.morphl2.io',
  networkName: 'Morph Holesky Testnet'
};

// Main export

// Named exports
export {
  // Core
  MorphPay,
  
  // Components
  PaymentButton,
  PaymentModal,
  CheckoutForm,
  
  // Utilities from core
  isValidAddress,
  formatEther,
  toWei,
  MORPH_CHAIN_ID,
  MORPH_CHAIN_ID_DECIMAL,
  MORPH_NETWORK_CONFIG,
  
  // Web3 Payment Utilities
  formatCrypto,
  validatePaymentAmount,
  validateTokenAddress,
  calculateNetworkFee,
  formatTransactionHash,
  getExplorerUrl,
  shortenAddress,
  calculatePlatformFee,
  generatePaymentQR,
  waitForTransaction,
  
  // Payment Types
  PAYMENT_TYPES,
  
  // Network Utilities
  isCorrectNetwork,
  checkMetaMaskInstalled,
  requestMetaMaskInstallation,
  
  // Error Handling
  createPaymentError,
  handleWeb3Error,
  
  // SDK Info
  VERSION,
  SDK_CONFIG
};

// // For CommonJS compatibility
// if (typeof module !== 'undefined' && module.exports) {
//   module.exports = MorphPay;
//   module.exports.MorphPay = MorphPay;
//   module.exports.PaymentButton = PaymentButton;
//   module.exports.PaymentModal = PaymentModal;
//   module.exports.CheckoutForm = CheckoutForm;
//   module.exports.validateAddress = isValidAddress;
//   module.exports.formatEther = formatEther;
//   module.exports.toWei = toWei;
//   module.exports.MORPH_CHAIN_ID = MORPH_CHAIN_ID;
//   module.exports.MORPH_CHAIN_ID_DECIMAL = MORPH_CHAIN_ID_DECIMAL;
//   module.exports.MORPH_NETWORK_CONFIG = MORPH_NETWORK_CONFIG;
//   module.exports.formatCrypto = formatCrypto;
//   module.exports.validatePaymentAmount = validatePaymentAmount;
//   module.exports.validateTokenAddress = validateTokenAddress;
//   module.exports.calculateNetworkFee = calculateNetworkFee;
//   module.exports.formatTransactionHash = formatTransactionHash;
//   module.exports.getExplorerUrl = getExplorerUrl;
//   module.exports.shortenAddress = shortenAddress;
//   module.exports.calculatePlatformFee = calculatePlatformFee;
//   module.exports.generatePaymentQR = generatePaymentQR;
//   module.exports.waitForTransaction = waitForTransaction;
//   module.exports.PAYMENT_TYPES = PAYMENT_TYPES;
//   module.exports.isCorrectNetwork = isCorrectNetwork;
//   module.exports.checkMetaMaskInstalled = checkMetaMaskInstalled;
//   module.exports.requestMetaMaskInstallation = requestMetaMaskInstallation;
//   module.exports.createPaymentError = createPaymentError;
//   module.exports.handleWeb3Error = handleWeb3Error;
//   module.exports.VERSION = VERSION;
//   module.exports.SDK_CONFIG = SDK_CONFIG;
// }