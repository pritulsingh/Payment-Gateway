// Web3 Utility functions for MorphPay SDK

// Supported blockchain networks
export const SUPPORTED_CHAINS = {
  MORPH_HOLESKY: {
    id: 2810,
    name: 'Morph Holesky',
    rpcUrl: 'https://rpc-quicknode-holesky.morphl2.io',
    blockExplorer: 'https://explorer-holesky.morphl2.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  ETHEREUM: {
    id: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  SEPOLIA: {
    id: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'SEP',
      decimals: 18
    }
  }
};

export const MORPH_CHAIN_ID = '0xafa'; // or 2810 if you're using decimal
export const MORPH_CHAIN_ID_DECIMAL = 2810;
export const MORPH_NETWORK_CONFIG = SUPPORTED_CHAINS.MORPH_HOLESKY;

// Validate Ethereum address
export const isValidAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // Check if it's a valid hex string with 0x prefix and 40 characters
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Validate chain ID
export const isValidChainId = (chainId) => {
  const supportedChainIds = Object.values(SUPPORTED_CHAINS).map(chain => chain.id);
  return supportedChainIds.includes(parseInt(chainId));
};

// Get chain info by ID
export const getChainInfo = (chainId) => {
  return Object.values(SUPPORTED_CHAINS).find(chain => chain.id === parseInt(chainId)) || null;
};

// Wei/ETH conversion utilities
export const toWei = (eth, unit = 'ether') => {
  if (!eth || isNaN(parseFloat(eth))) {
    return '0';
  }
  
  const units = {
    wei: '1',
    kwei: '1000',
    mwei: '1000000',
    gwei: '1000000000',
    szabo: '1000000000000',
    finney: '1000000000000000',
    ether: '1000000000000000000'
  };
  
  const multiplier = units[unit.toLowerCase()] || units.ether;
  const ethAmount = parseFloat(eth);
  const weiAmount = ethAmount * parseFloat(multiplier);
  
  return Math.floor(weiAmount).toString();
};

// Convert Wei to ETH
export const fromWei = (wei, unit = 'ether') => {
  if (!wei || isNaN(parseFloat(wei))) {
    return '0';
  }
  
  const units = {
    wei: '1',
    kwei: '1000',
    mwei: '1000000',
    gwei: '1000000000',
    szabo: '1000000000000',
    finney: '1000000000000000',
    ether: '1000000000000000000'
  };
  
  const divisor = units[unit.toLowerCase()] || units.ether;
  const weiAmount = parseFloat(wei);
  const ethAmount = weiAmount / parseFloat(divisor);
  
  return ethAmount.toString();
};

// Format ETH amount for display
export const formatEther = (amount, decimals = 4) => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return '0 ETH';
  
  return `${numAmount.toFixed(decimals)} ETH`;
};

// Validate transaction hash
export const isValidTxHash = (hash) => {
  if (!hash || typeof hash !== 'string') {
    return false;
  }
  
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
};

// Amount validation for Web3
export const validateAmount = (amount) => {
  if (amount === null || amount === undefined) {
    return false;
  }
  
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount > 0;
};

// Contract interaction helpers
export const encodeContractCall = (methodSignature, params = []) => {
  // Simple ABI encoding for common method calls
  // In production, you'd use a proper ABI encoder like ethers.js
  const methodId = methodSignature.slice(0, 10); // First 4 bytes
  
  // This is a simplified version - real implementation would need proper ABI encoding
  return methodId + params.map(p => p.toString().padStart(64, '0')).join('');
};

// Generate contract deployment data
export const generateDeploymentData = (bytecode, constructorParams = []) => {
  return bytecode + constructorParams.map(p => p.toString().padStart(64, '0')).join('');
};

// Gas estimation helpers
export const estimateGasPrice = (priority = 'standard') => {
  // Simplified gas price estimation
  const gasPrices = {
    slow: '10000000000',      // 10 gwei
    standard: '20000000000',  // 20 gwei
    fast: '30000000000',      // 30 gwei
    rapid: '50000000000'      // 50 gwei
  };
  
  return gasPrices[priority] || gasPrices.standard;
};

// Validate Web3 payment data
export const validateWeb3PaymentData = (data) => {
  const errors = [];

  if (!data.amount || !validateAmount(data.amount)) {
    errors.push('Amount must be a positive number');
  }

  if (data.recipient && !isValidAddress(data.recipient)) {
    errors.push('Recipient must be a valid Ethereum address');
  }

  if (data.chainId && !isValidChainId(data.chainId)) {
    errors.push('Unsupported chain ID');
  }

  if (data.tokenAddress && !isValidAddress(data.tokenAddress)) {
    errors.push('Token address must be a valid Ethereum address');
  }

  if (data.gasLimit && (isNaN(parseInt(data.gasLimit)) || parseInt(data.gasLimit) <= 0)) {
    errors.push('Gas limit must be a positive integer');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Wallet connection utilities
export const detectWallet = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const wallets = {
    metamask: window.ethereum?.isMetaMask,
    coinbase: window.ethereum?.isCoinbaseWallet,
    walletconnect: window.WalletConnect,
    trust: window.ethereum?.isTrust
  };

  return Object.entries(wallets)
    .filter(([_, isPresent]) => isPresent)
    .map(([name]) => name);
};

// Check if wallet is connected
export const isWalletConnected = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts && accounts.length > 0;
  } catch (error) {
    console.warn('Error checking wallet connection:', error);
    return false;
  }
};

// Generate unique ID
export const generateId = (prefix = 'mp') => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${prefix}_${timestamp}_${randomPart}`;
};

// Deep merge objects
export const deepMerge = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
};

// Check if value is object
export const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

// Debounce function
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Browser detection utilities
export const getBrowserInfo = () => {
  if (typeof window === 'undefined') {
    return { name: 'server', version: 'unknown' };
  }

  const ua = window.navigator.userAgent;
  
  if (ua.includes('Chrome')) return { name: 'Chrome', version: ua.match(/Chrome\/(\d+)/)?.[1] };
  if (ua.includes('Firefox')) return { name: 'Firefox', version: ua.match(/Firefox\/(\d+)/)?.[1] };
  if (ua.includes('Safari')) return { name: 'Safari', version: ua.match(/Safari\/(\d+)/)?.[1] };
  if (ua.includes('Edge')) return { name: 'Edge', version: ua.match(/Edge\/(\d+)/)?.[1] };
  
  return { name: 'unknown', version: 'unknown' };
};