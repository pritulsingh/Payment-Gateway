// Web3 API configuration and helper functions

// Import the correct ABI from PaymentGateway.json
const PAYMENT_GATEWAY_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_feeRecipient",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "DailyLimitExceeded",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EnforcedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExpectedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FeeTooHigh",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidAmount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "PaymentAlreadyProcessed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "PaymentTooSmall",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "SafeERC20FailedOperation",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "TokenNotSupported",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "TransferFailed",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldLimit",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newLimit",
        "type": "uint256"
      }
    ],
    "name": "DailyLimitUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "EmergencyWithdrawal",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldRecipient",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newRecipient",
        "type": "address"
      }
    ],
    "name": "FeeRecipientUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newFee",
        "type": "uint256"
      }
    ],
    "name": "FeeUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldMin",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newMin",
        "type": "uint256"
      }
    ],
    "name": "MinPaymentUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "paymentId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "payer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "vendor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountNet",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "fee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "PaymentSettled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "supported",
        "type": "bool"
      }
    ],
    "name": "TokenSupported",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "inputs": [],
    "name": "MAX_FEE_BPS",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_PAYMENT_AMOUNT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "tokens",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "amounts",
        "type": "uint256[]"
      },
      {
        "internalType": "address[]",
        "name": "vendors",
        "type": "address[]"
      },
      {
        "internalType": "bytes32[]",
        "name": "paymentIds",
        "type": "bytes32[]"
      }
    ],
    "name": "batchPayWithTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "calculateFee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "calculateNetAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "dailyPaymentLimit",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "dailyPaymentVolume",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "disableEmergencyWithdrawal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "emergencyBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "emergencyWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "emergencyWithdrawalEnabled",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "enableEmergencyWithdrawal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeBps",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeRecipient",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "dayTimestamp",
        "type": "uint256"
      }
    ],
    "name": "getDailyVolume",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRemainingDailyLimit",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTodayVolume",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "vendor",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "paymentId",
        "type": "bytes32"
      }
    ],
    "name": "payWithETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "vendor",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "paymentId",
        "type": "bytes32"
      }
    ],
    "name": "payWithToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "processedPayments",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newLimit",
        "type": "uint256"
      }
    ],
    "name": "setDailyPaymentLimit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newFeeBps",
        "type": "uint256"
      }
    ],
    "name": "setFeeBps",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newRecipient",
        "type": "address"
      }
    ],
    "name": "setFeeRecipient",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "supported",
        "type": "bool"
      }
    ],
    "name": "setSupportedToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "supportedTokens",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "vendorPayments",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

// Web3 configuration
export const WEB3_CONFIG = {
  chains: {
    morphHolesky: {
      chainId: 2810, // Fixed: Changed from 2710 to 2810 to match demo.jsx
      name: 'Morph Holesky Testnet',
      rpcUrls: [
        'https://rpc-holesky.morphl2.io',
        'https://rpc-quicknode-holesky.morphl2.io'
      ],
      blockExplorer: 'https://explorer-holesky.morphl2.io',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      }
    },
    ethereum: {
      chainId: 1,
      name: 'Ethereum Mainnet',
      rpcUrls: [
        'https://mainnet.infura.io/v3/',
        'https://eth-mainnet.alchemyapi.io/v2/'
      ],
      blockExplorer: 'https://etherscan.io',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      }
    },
    sepolia: {
      chainId: 11155111,
      name: 'Sepolia',
      rpcUrls: [
        'https://sepolia.infura.io/v3/',
        'https://eth-sepolia.g.alchemy.com/v2/'
      ],
      blockExplorer: 'https://sepolia.etherscan.io',
      nativeCurrency: {
        name: 'Sepolia Ether',
        symbol: 'SEP',
        decimals: 18
      }
    }
  },
  
  contracts: {
    morphHolesky: {
      // Using the actual addresses from demo.jsx
      paymentGateway: '0xaF673968bd6b1c373670c9e82bc8B9059d5037F4', // Main PaymentGateway contract
      vendorAddress: '0x69f66FFbb39Bfe6538d870Bd483999A6C7442B58',  // Default vendor address
      usdtToken: process.env.NEXT_PUBLIC_USDT_ADDRESS || '0x1234567890123456789012345678901234567890',
      usdcToken: process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x65aFADD39029741B3b8f0756952C74678c9cEC93'
    },
    ethereum: {
      paymentGateway: '0xaF673968bd6b1c373670c9e82bc8B9059d5037F4',
      vendorAddress: '0x69f66FFbb39Bfe6538d870Bd483999A6C7442B58',
      usdtToken: '0x3Cd1994D86E59d731969a392ab12D6F7e05f21F8',
      usdcToken: '0xF5a9c115661d413A53128c368977FF44A5a9270C'
    },
    sepolia: {
      paymentGateway: '0xaF673968bd6b1c373670c9e82bc8B9059d5037F4',
      vendorAddress: '0x69f66FFbb39Bfe6538d870Bd483999A6C7442B58',
      usdtToken: '0x3Cd1994D86E59d731969a392ab12D6F7e05f21F8',
      usdcToken: '0xF5a9c115661d413A53128c368977FF44A5a9270C'
    }
  },

  gas: {
    limits: {
      transfer: 21000,
      approve: 50000,
      ethPayment: 150000,    // For payWithETH
      tokenPayment: 100000,  // For payWithToken
      refund: 80000,
      mintToken: 80000,       // For token minting
      batchPayment: 300000    // For batchPayWithTokens
    },
    prices: {
      slow: '10000000000',    // 10 gwei
      standard: '20000000000', // 20 gwei
      fast: '30000000000',    // 30 gwei
      rapid: '50000000000'    // 50 gwei
    }
  }
};

// Web3 endpoints
export const WEB3_ENDPOINTS = {
  web3Payments: '/web3/payments',
  transactions: '/web3/transactions',
  wallets: '/web3/wallets',
  contracts: '/web3/contracts',
  tokens: '/web3/tokens',
  gas: '/web3/gas-estimate',
  paymentGateway: '/web3/payment-gateway'
};

// Contract ABIs - Updated to use the complete PaymentGateway ABI
export const CONTRACT_ABIS = {
  paymentGateway: PAYMENT_GATEWAY_ABI,
  
  erc20: [
    {
      "inputs": [
        {"name": "spender", "type": "address"},
        {"name": "amount", "type": "uint256"}
      ],
      "name": "approve",
      "outputs": [{"name": "", "type": "bool"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {"name": "to", "type": "address"},
        {"name": "amount", "type": "uint256"}
      ],
      "name": "transfer",
      "outputs": [{"name": "", "type": "bool"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"name": "account", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {"name": "owner", "type": "address"},
        {"name": "spender", "type": "address"}
      ],
      "name": "allowance",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [{"name": "", "type": "uint8"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [{"name": "", "type": "string"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [{"name": "", "type": "string"}],
      "stateMutability": "view",
      "type": "function"
    }
  ],

  // Test token contract (for minting)
  testToken: [
    {
      "inputs": [{"name": "to", "type": "address"}],
      "name": "mintTo",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"name": "user", "type": "address"}],
      "name": "lastMinted",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    // Include all ERC20 functions
    {
      "inputs": [
        {"name": "spender", "type": "address"},
        {"name": "amount", "type": "uint256"}
      ],
      "name": "approve",
      "outputs": [{"name": "", "type": "bool"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {"name": "to", "type": "address"},
        {"name": "amount", "type": "uint256"}
      ],
      "name": "transfer",
      "outputs": [{"name": "", "type": "bool"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"name": "account", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {"name": "owner", "type": "address"},
        {"name": "spender", "type": "address"}
      ],
      "name": "allowance",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [{"name": "", "type": "uint8"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [{"name": "", "type": "string"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [{"name": "", "type": "string"}],
      "stateMutability": "view",
      "type": "function"
    }
  ]
};

// Morph-specific constants
export const MORPH_CONSTANTS = {
  CHAIN_ID: 2810,
  CHAIN_ID_HEX: '0xafa',
  RPC_URL: 'https://rpc-holesky.morphl2.io',
  EXPLORER_BASE: 'https://explorer-holesky.morphl2.io/tx/',
  PAYMENT_GATEWAY_ADDRESS: '0xaF673968bd6b1c373670c9e82bc8B9059d5037F4',
  DEFAULT_VENDOR_ADDRESS: '0x69f66FFbb39Bfe6538d870Bd483999A6C7442B58'
};

// Web3 Error types - Updated to match PaymentGateway contract errors
export const ERROR_TYPES = {
  WEB3_ERROR: 'WEB3_ERROR',
  WALLET_ERROR: 'WALLET_ERROR',
  CONTRACT_ERROR: 'CONTRACT_ERROR',
  TRANSACTION_ERROR: 'TRANSACTION_ERROR',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  GAS_ESTIMATION_ERROR: 'GAS_ESTIMATION_ERROR',
  CHAIN_ERROR: 'CHAIN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  // PaymentGateway specific errors
  DAILY_LIMIT_EXCEEDED: 'DAILY_LIMIT_EXCEEDED',
  ENFORCED_PAUSE: 'ENFORCED_PAUSE',
  EXPECTED_PAUSE: 'EXPECTED_PAUSE',
  FEE_TOO_HIGH: 'FEE_TOO_HIGH',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  OWNABLE_INVALID_OWNER: 'OWNABLE_INVALID_OWNER',
  OWNABLE_UNAUTHORIZED_ACCOUNT: 'OWNABLE_UNAUTHORIZED_ACCOUNT',
  PAYMENT_ALREADY_PROCESSED: 'PAYMENT_ALREADY_PROCESSED',
  PAYMENT_TOO_SMALL: 'PAYMENT_TOO_SMALL',
  REENTRANCY_GUARD_REENTRANT_CALL: 'REENTRANCY_GUARD_REENTRANT_CALL',
  SAFE_ERC20_FAILED_OPERATION: 'SAFE_ERC20_FAILED_OPERATION',
  TOKEN_NOT_SUPPORTED: 'TOKEN_NOT_SUPPORTED',
  TRANSFER_FAILED: 'TRANSFER_FAILED'
};

// Custom error class for Web3
export class Web3Error extends Error {
  constructor(message, type, code, details = {}) {
    super(message);
    this.name = 'Web3Error';
    this.type = type;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Web3 utility functions
export const getChainConfig = (chainId) => {
  const chains = Object.values(WEB3_CONFIG.chains);
  return chains.find(chain => chain.chainId === parseInt(chainId)) || null;
};

export const getContractAddress = (chainId, contractType) => {
  const chainKey = Object.keys(WEB3_CONFIG.chains).find(
    key => WEB3_CONFIG.chains[key].chainId === parseInt(chainId)
  );
  
  if (!chainKey || !WEB3_CONFIG.contracts[chainKey]) {
    return null;
  }
  
  return WEB3_CONFIG.contracts[chainKey][contractType] || null;
};

export const getRpcUrl = (chainId, index = 0) => {
  const chainConfig = getChainConfig(chainId);
  if (!chainConfig || !chainConfig.rpcUrls[index]) {
    return null;
  }
  return chainConfig.rpcUrls[index];
};

export const validateWeb3Config = (chainId) => {
  const chainConfig = getChainConfig(chainId);
  if (!chainConfig) {
    throw new Web3Error(
      `Unsupported chain ID: ${chainId}`,
      ERROR_TYPES.CHAIN_ERROR,
      400
    );
  }
  return true;
};

// Address validation
export const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Convert chain ID to hex
export const toHex = (num) => {
  return '0x' + num.toString(16);
};

// Payment validation
export const validatePaymentAmount = (amount, minAmount = '0.001') => {
  const amountNum = parseFloat(amount);
  const minAmountNum = parseFloat(minAmount);
  
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Web3Error(
      'Invalid payment amount',
      ERROR_TYPES.VALIDATION_ERROR,
      400
    );
  }
  
  if (amountNum < minAmountNum) {
    throw new Web3Error(
      `Payment amount must be at least ${minAmount} ETH`,
      ERROR_TYPES.PAYMENT_TOO_SMALL,
      400
    );
  }
  
  return true;
};

// Web3 error handler - Enhanced for PaymentGateway contract errors
export const handleWeb3Error = (error) => {
  let errorType = ERROR_TYPES.WEB3_ERROR;
  let errorMessage = error.message || 'Web3 operation failed';
  let errorCode = 500;

  // Handle specific Web3 errors
  if (error.code === 4001) {
    errorType = ERROR_TYPES.WALLET_ERROR;
    errorMessage = 'User rejected the transaction';
    errorCode = 400;
  } else if (error.code === -32603) {
    errorType = ERROR_TYPES.CONTRACT_ERROR;
    errorMessage = 'Contract execution failed';
    errorCode = 400;
  } else if (error.message?.includes('insufficient funds')) {
    errorType = ERROR_TYPES.INSUFFICIENT_FUNDS;
    errorMessage = 'Insufficient funds for transaction';
    errorCode = 400;
  } else if (error.message?.includes('gas')) {
    errorType = ERROR_TYPES.GAS_ESTIMATION_ERROR;
    errorMessage = 'Gas estimation failed';
    errorCode = 400;
  } else if (error.message?.includes('network')) {
    errorType = ERROR_TYPES.NETWORK_ERROR;
    errorMessage = 'Network connection failed';
    errorCode = 503;
  }
  // PaymentGateway specific error handling
  else if (error.message?.includes('DailyLimitExceeded')) {
    errorType = ERROR_TYPES.DAILY_LIMIT_EXCEEDED;
    errorMessage = 'Daily payment limit exceeded';
    errorCode = 400;
  } else if (error.message?.includes('EnforcedPause')) {
    errorType = ERROR_TYPES.ENFORCED_PAUSE;
    errorMessage = 'Payment gateway is currently paused';
    errorCode = 503;
  } else if (error.message?.includes('ExpectedPause')) {
    errorType = ERROR_TYPES.EXPECTED_PAUSE;
    errorMessage = 'Expected pause state mismatch';
    errorCode = 400;
  } else if (error.message?.includes('FeeTooHigh')) {
    errorType = ERROR_TYPES.FEE_TOO_HIGH;
    errorMessage = 'Fee amount exceeds maximum allowed';
    errorCode = 400;
  } else if (error.message?.includes('InvalidAddress')) {
    errorType = ERROR_TYPES.INVALID_ADDRESS;
    errorMessage = 'Invalid address provided';
    errorCode = 400;
  } else if (error.message?.includes('InvalidAmount')) {
    errorType = ERROR_TYPES.INVALID_AMOUNT;
    errorMessage = 'Invalid amount provided';
    errorCode = 400;
  } else if (error.message?.includes('PaymentAlreadyProcessed')) {
    errorType = ERROR_TYPES.PAYMENT_ALREADY_PROCESSED;
    errorMessage = 'Payment has already been processed';
    errorCode = 400;
  } else if (error.message?.includes('PaymentTooSmall')) {
    errorType = ERROR_TYPES.PAYMENT_TOO_SMALL;
    errorMessage = 'Payment amount is below minimum threshold';
    errorCode = 400;
  } else if (error.message?.includes('TokenNotSupported')) {
    errorType = ERROR_TYPES.TOKEN_NOT_SUPPORTED;
    errorMessage = 'Token not supported by the gateway';
    errorCode = 400;
  } else if (error.message?.includes('TransferFailed')) {
    errorType = ERROR_TYPES.TRANSFER_FAILED;
    errorMessage = 'Token transfer failed';
    errorCode = 400;
  } else if (error.message?.includes('ReentrancyGuardReentrantCall')) {
    errorType = ERROR_TYPES.REENTRANCY_GUARD_REENTRANT_CALL;
    errorMessage = 'Reentrancy attempt detected';
    errorCode = 400;
  } else if (error.message?.includes('SafeERC20FailedOperation')) {
    errorType = ERROR_TYPES.SAFE_ERC20_FAILED_OPERATION;
    errorMessage = 'ERC20 operation failed';
    errorCode = 400;
  }

  throw new Web3Error(errorMessage, errorType, errorCode, {
    originalError: error.message,
    code: error.code
  });
};

// Retry logic for Web3 operations
export const withWeb3Retry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry for these error types
      if (error.type === ERROR_TYPES.WALLET_ERROR || 
          error.type === ERROR_TYPES.VALIDATION_ERROR ||
          error.type === ERROR_TYPES.PAYMENT_TOO_SMALL ||
          error.type === ERROR_TYPES.ENFORCED_PAUSE ||
          error.type === ERROR_TYPES.PAYMENT_ALREADY_PROCESSED ||
          error.code === 4001) {
        throw error;
      }

      // Don't retry on last attempt
      if (i === maxRetries) {
        throw error;
      }

      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  throw lastError;
};

// Generate payment ID
export const generatePaymentId = () => {
  // For demo purposes - in production, use a more robust method
  const timestamp = Date.now().toString(16);
  const random = Math.random().toString(16).substr(2, 8);
  return '0x' + timestamp + random + '0'.repeat(64 - timestamp.length - random.length);
};

// Format Wei to Ether
export const formatEther = (wei, decimals = 4) => {
  if (!wei) return '0';
  const ether = parseFloat(wei) / Math.pow(10, 18);
  return ether.toFixed(decimals);
};

// Format Ether to Wei
export const parseEther = (ether) => {
  if (!ether) return '0';
  return (parseFloat(ether) * Math.pow(10, 18)).toString();
};

export default {
  // Web3 config
  WEB3_CONFIG,
  WEB3_ENDPOINTS,
  CONTRACT_ABIS,
  ERROR_TYPES,
  MORPH_CONSTANTS,
  Web3Error,
  
  // Web3 utilities
  getChainConfig,
  getContractAddress,
  getRpcUrl,
  validateWeb3Config,
  isValidAddress,
  toHex,
  validatePaymentAmount,
  handleWeb3Error,
  withWeb3Retry,
  generatePaymentId,
  formatEther,
  parseEther
};