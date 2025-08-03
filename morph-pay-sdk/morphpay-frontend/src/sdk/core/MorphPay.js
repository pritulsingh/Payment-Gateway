import Web3 from 'web3'

// Contract configuration
const CONTRACT_CONFIG = {
  PAYMENT_GATEWAY_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xaF673968bd6b1c373670c9e82bc8B9059d5037F4",
  USDT_ADDRESS: process.env.NEXT_PUBLIC_USDT_ADDRESS || "0x65aFADD39029741B3b8f0756952C74678c9cEC93",
  USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS || "0x69f66FFbb39Bfe6538d870Bd483999A6C7442B58",
  MORPH_CHAIN_ID: "0xafa", // 2810 in hex
  MORPH_CHAIN_ID_DECIMAL: 2810,
  MORPH_RPC_URL: "https://rpc-holesky.morphl2.io",
  MORPH_EXPLORER_BASE: "https://explorer-holesky.morphl2.io/tx/"
}

// Payment Gateway ABI - Full ABI from PaymentGateway.json
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
]

// ERC20 Token ABI
const ERC20_ABI = [
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{ "name": "owner", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "mintTo",
    "inputs": [{ "name": "to", "type": "address" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "lastMinted",
    "inputs": [{ "name": "user", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  }
];

class MorphPay {
  constructor(options = {}) {
    this.contractAddress = options.contractAddress || CONTRACT_CONFIG.PAYMENT_GATEWAY_ADDRESS
    this.rpcUrl = options.rpcUrl || CONTRACT_CONFIG.MORPH_RPC_URL
    this.chainId = options.chainId || CONTRACT_CONFIG.MORPH_CHAIN_ID
    this.chainIdDecimal = options.chainIdDecimal || CONTRACT_CONFIG.MORPH_CHAIN_ID_DECIMAL
    this.explorerBase = options.explorerBase || CONTRACT_CONFIG.MORPH_EXPLORER_BASE
    this.web3 = null
    this.contract = null
    this.account = ""
    this.isConnected = false
    this.contractInfo = {
      exists: null,
      paused: false,
      feeBps: "50",
      feeRecipient: "",
      dailyLimit: "0",
      todayVolume: "0",
      minPayment: "0",
      maxFeeBps: "1000",
      remainingDailyLimit: "0"
    }
    
    if (!this.contractAddress) {
      throw new Error('PaymentGateway contract address is required')
    }
  }

  // Initialize Web3 and connect wallet
  async initializeWeb3() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.web3 = new Web3(window.ethereum)
      this.contract = new this.web3.eth.Contract(PAYMENT_GATEWAY_ABI, this.contractAddress)
      
      // Set up event listeners
      if (window.ethereum.on) {
        window.ethereum.on("accountsChanged", this.handleAccountsChanged.bind(this))
        window.ethereum.on("chainChanged", this.handleChainChanged.bind(this))
      }
      
      return true
    }
    throw new Error('MetaMask not found')
  }

  // Check if MetaMask is installed
  isMetaMaskInstalled() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
  }

  // Validate Ethereum address
  isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  // Handle account changes
  handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      this.isConnected = false
      this.account = ""
    } else {
      this.account = accounts[0]
      if (this.web3) {
        this.getBalance(accounts[0])
      }
    }
  }

  // Handle chain changes
  handleChainChanged(newChainId) {
    if (newChainId === this.chainId) {
      if (this.web3 && this.contract) {
        this.checkContract()
      }
    }
  }

  // Connect wallet
  async connectWallet() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.')
    }

    if (!this.web3) await this.initializeWeb3()
    
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      this.account = accounts[0]
      this.isConnected = true
      
      const currentChainId = await window.ethereum.request({ method: "eth_chainId" })
      if (currentChainId !== this.chainId) {
        await this.switchToMorphNetwork()
      }
      
      await this.getBalance(this.account)
      await this.checkContract()
      
      return { account: this.account, chainId: currentChainId }
    } catch (error) {
      throw new Error(`Failed to connect wallet: ${error.message}`)
    }
  }

  // Switch to Morph network
  async switchToMorphNetwork() {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: this.chainId }],
      })
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: this.chainId,
              chainName: "Morph Holesky Testnet",
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: [this.rpcUrl],
              blockExplorerUrls: ["https://explorer-holesky.morphl2.io/"],
            }],
          })
        } catch (addError) {
          throw new Error("Failed to add Morph Holesky Testnet to MetaMask")
        }
      } else {
        throw new Error("Failed to switch to Morph Holesky Testnet")
      }
    }
  }

  // Get ETH balance
  async getBalance(address = this.account) {
    if (!this.web3 || !address || !this.isValidAddress(address)) return "0"

    try {
      const balance = await this.web3.eth.getBalance(address)
      const ethBalance = this.web3.utils.fromWei(balance, "ether")
      return parseFloat(ethBalance).toFixed(4)
    } catch (error) {
      console.error("Failed to get balance:", error)
      return "0"
    }
  }

  // Get token balance
  async getTokenBalance(tokenAddress, userAddress = this.account) {
    if (!this.web3 || !tokenAddress || !userAddress) return { balance: "0", decimals: 18, symbol: "TOKEN" }

    try {
      const tokenContract = new this.web3.eth.Contract(ERC20_ABI, tokenAddress)
      const [balance, decimals, symbol] = await Promise.all([
        tokenContract.methods.balanceOf(userAddress).call(),
        tokenContract.methods.decimals().call(),
        tokenContract.methods.symbol().call()
      ])

      const formattedBalance = this.web3.utils.fromWei(
        balance.toString(), 
        decimals === 6 ? 'mwei' : 'ether'
      )

      return {
        balance: formattedBalance,
        decimals: parseInt(decimals),
        symbol,
        raw: balance.toString()
      }
    } catch (error) {
      console.error("Failed to get token balance:", error)
      return { balance: "0", decimals: 18, symbol: "TOKEN" }
    }
  }

  // Check contract status
  async checkContract() {
    try {
      if (!this.isValidAddress(this.contractAddress)) {
        this.contractInfo.exists = false
        return this.contractInfo
      }

      const currentChainId = await window.ethereum.request({ method: "eth_chainId" })
      if (currentChainId !== this.chainId) {
        this.contractInfo.exists = null
        return this.contractInfo
      }

      const code = await this.web3.eth.getCode(this.contractAddress)
      const exists = code && code !== "0x" && code !== "0x0"

      if (exists && this.contract) {
        try {
          const [
            paused, 
            feeBps, 
            feeRecipient, 
            dailyLimit, 
            todayVolume, 
            minPayment,
            maxFeeBps,
            remainingDailyLimit
          ] = await Promise.all([
            this.contract.methods.paused().call(),
            this.contract.methods.feeBps().call(),
            this.contract.methods.feeRecipient().call(),
            this.contract.methods.dailyPaymentLimit().call(),
            this.contract.methods.getTodayVolume().call(),
            this.contract.methods.MIN_PAYMENT_AMOUNT().call(),
            this.contract.methods.MAX_FEE_BPS().call(),
            this.contract.methods.getRemainingDailyLimit().call()
          ])

          this.contractInfo = {
            exists: true,
            paused,
            feeBps: feeBps.toString(),
            feeRecipient,
            dailyLimit: this.web3.utils.fromWei(dailyLimit, "ether"),
            todayVolume: this.web3.utils.fromWei(todayVolume, "ether"),
            minPayment: this.web3.utils.fromWei(minPayment, "ether"),
            maxFeeBps: maxFeeBps.toString(),
            remainingDailyLimit: this.web3.utils.fromWei(remainingDailyLimit, "ether")
          }
        } catch (error) {
          console.error("Error getting contract info:", error)
          this.contractInfo.exists = true
        }
      } else {
        this.contractInfo.exists = false
      }

      return this.contractInfo
    } catch (error) {
      console.error("Error checking contract:", error)
      this.contractInfo.exists = false
      return this.contractInfo
    }
  }

  // Calculate fees
  async calculateFee(amount) {
    if (!this.contract || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return { fee: "0", net: "0" }
    }

    try {
      const amountWei = this.web3.utils.toWei(amount.toString(), 'ether')
      const [fee, net] = await Promise.all([
        this.contract.methods.calculateFee(amountWei).call(),
        this.contract.methods.calculateNetAmount(amountWei).call()
      ])

      return {
        fee: this.web3.utils.fromWei(fee.toString(), 'ether'),
        net: this.web3.utils.fromWei(net.toString(), 'ether'),
      }
    } catch (error) {
      // Fallback calculation
      const amountNum = parseFloat(amount)
      const feePercent = parseFloat(this.contractInfo.feeBps) / 10000
      const feeAmount = amountNum * feePercent
      const netAmount = amountNum - feeAmount

      return {
        fee: feeAmount.toFixed(6),
        net: netAmount.toFixed(6),
      }
    }
  }

  // Pay with ETH
  // Pay with ETH - FIXED VERSION
  async payWithETH(vendor, amount) {
    if (!this.isConnected) throw new Error('Wallet not connected')
    if (!this.isValidAddress(vendor)) throw new Error('Invalid vendor address')
    if (!this.contractInfo.exists) throw new Error('Payment gateway contract not found')
    if (this.contractInfo.paused) throw new Error('Payment gateway is currently paused')

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) throw new Error('Invalid amount')

    const minPayment = parseFloat(this.contractInfo.minPayment)
    if (amountNum < minPayment) throw new Error(`Minimum payment amount is ${minPayment} ETH`)

    try {
      // Generate a unique paymentId (this is what was missing!)
      const paymentId = this.web3.utils.randomHex(32)
      const amountWei = this.web3.utils.toWei(amount.toString(), "ether")

      // Estimate gas for the transaction
      const gasEstimate = await this.contract.methods.payWithETH(vendor, paymentId).estimateGas({
        from: this.account,
        value: amountWei,
      })

      // Execute the transaction with correct parameters: vendor and paymentId
      // The amount goes in the 'value' field, not as a parameter
      const tx = await this.contract.methods.payWithETH(vendor, paymentId).send({
        from: this.account,
        value: amountWei,  // This is where the amount goes
        gas: Math.floor(Number(gasEstimate) * 1.2), // Add 20% buffer
      })

      return { 
        transactionHash: tx.transactionHash, 
        paymentId,  // Return the generated paymentId for tracking
        explorerUrl: `${this.explorerBase}${tx.transactionHash}`
      }
    } catch (error) {
      if (error.message.includes("insufficient funds")) {
        throw new Error("Insufficient ETH balance for this transaction")
      } else if (error.message.includes("User denied") || error.message.includes("rejected")) {
        throw new Error("Transaction was rejected by user")
      } else if (error.message.includes("DailyLimitExceeded")) {
        throw new Error("Daily payment limit exceeded")
      } else if (error.message.includes("PaymentTooSmall")) {
        throw new Error(`Payment amount is below minimum of ${this.contractInfo.minPayment} ETH`)
      } else if (error.message.includes("EnforcedPause")) {
        throw new Error("Payment gateway is currently paused")
      } else if (error.message.includes("PaymentAlreadyProcessed")) {
        throw new Error("This payment has already been processed")
      } else {
        throw new Error(`Payment failed: ${error.message}`)
      }
    }
  }

  // Pay with Token
  async payWithToken(tokenAddress, amount, vendor) {
    if (!this.isConnected) throw new Error('Wallet not connected')
    if (!this.isValidAddress(vendor)) throw new Error('Invalid vendor address')
    if (!this.isValidAddress(tokenAddress)) throw new Error('Invalid token address')

    try {
      // Check if token is supported
      const isSupported = await this.contract.methods.supportedTokens(tokenAddress).call()
      if (!isSupported) {
        throw new Error('Token is not supported by the payment gateway')
      }

      // Get token info
      const tokenContract = new this.web3.eth.Contract(ERC20_ABI, tokenAddress)
      const decimals = await tokenContract.methods.decimals().call()
      
      // Convert amount based on token decimals
      const amountWei = decimals === 6 
        ? this.web3.utils.toWei(amount.toString(), 'mwei')  // For USDT (6 decimals)
        : this.web3.utils.toWei(amount.toString(), 'ether') // For USDC and others (18 decimals)

      // Check allowance
      const allowance = await tokenContract.methods.allowance(this.account, this.contractAddress).call()
      
      if (this.web3.utils.toBN(allowance).lt(this.web3.utils.toBN(amountWei))) {
        // Approve token spending
        const approveTx = await tokenContract.methods.approve(this.contractAddress, amountWei).send({ from: this.account })
        console.log('Token approval transaction:', approveTx.transactionHash)
      }

      // Process payment
      const paymentId = this.web3.utils.randomHex(32)
      const tx = await this.contract.methods.payWithToken(tokenAddress, amountWei, vendor, paymentId).send({
        from: this.account
      })

      return { 
        transactionHash: tx.transactionHash, 
        paymentId,
        explorerUrl: `${this.explorerBase}${tx.transactionHash}`
      }
    } catch (error) {
      if (error.message.includes("User denied") || error.message.includes("rejected")) {
        throw new Error("Transaction was rejected by user")
      } else if (error.message.includes("TokenNotSupported")) {
        throw new Error("Token is not supported by the payment gateway")
      } else if (error.message.includes("DailyLimitExceeded")) {
        throw new Error("Daily payment limit exceeded")
      } else if (error.message.includes("EnforcedPause")) {
        throw new Error("Payment gateway is currently paused")
      } else {
        throw new Error(`Token payment failed: ${error.message}`)
      }
    }
  }

  // Batch payment with tokens
  async batchPayWithTokens(payments) {
    if (!this.isConnected) throw new Error('Wallet not connected')
    if (!Array.isArray(payments) || payments.length === 0) throw new Error('Invalid payments array')

    try {
      const tokens = []
      const amounts = []
      const vendors = []
      const paymentIds = []

      for (const payment of payments) {
        if (!this.isValidAddress(payment.vendor)) throw new Error(`Invalid vendor address: ${payment.vendor}`)
        if (!this.isValidAddress(payment.token)) throw new Error(`Invalid token address: ${payment.token}`)

        const tokenContract = new this.web3.eth.Contract(ERC20_ABI, payment.token)
        const decimals = await tokenContract.methods.decimals().call()
        
        const amountWei = decimals === 6 
          ? this.web3.utils.toWei(payment.amount.toString(), 'mwei')
          : this.web3.utils.toWei(payment.amount.toString(), 'ether')

        tokens.push(payment.token)
        amounts.push(amountWei)
        vendors.push(payment.vendor)
        paymentIds.push(this.web3.utils.randomHex(32))
      }

      const tx = await this.contract.methods.batchPayWithTokens(tokens, amounts, vendors, paymentIds).send({
        from: this.account
      })

      return {
        transactionHash: tx.transactionHash,
        paymentIds,
        explorerUrl: `${this.explorerBase}${tx.transactionHash}`
      }
    } catch (error) {
      throw new Error(`Batch payment failed: ${error.message}`)
    }
  }

  // Mint test tokens
  async mintToken(tokenAddress) {
    if (!this.isConnected) throw new Error('Wallet not connected')
    if (!this.isValidAddress(tokenAddress)) throw new Error('Invalid token address')

    try {
      const tokenContract = new this.web3.eth.Contract(ERC20_ABI, tokenAddress)
      
      // Check if user can mint (24h cooldown)
      const lastMinted = await tokenContract.methods.lastMinted(this.account).call()
      const canMint = (Date.now() / 1000) - lastMinted > 86400

      if (!canMint) {
        const timeLeft = 86400 - ((Date.now() / 1000) - lastMinted)
        const hoursLeft = Math.ceil(timeLeft / 3600)
        throw new Error(`You can mint again in ${hoursLeft} hours`)
      }

      const tx = await tokenContract.methods.mintTo(this.account).send({ from: this.account })
      
      return {
        transactionHash: tx.transactionHash,
        explorerUrl: `${this.explorerBase}${tx.transactionHash}`
      }
    } catch (error) {
      throw new Error(`Token minting failed: ${error.message}`)
    }
  }

  // Generate QR code for mobile payments
  generateQRCode(vendor, amount) {
    if (!this.isValidAddress(vendor)) throw new Error('Invalid vendor address')
    if (!amount || parseFloat(amount) <= 0) throw new Error('Invalid amount')

    const amountWei = this.web3 ? this.web3.utils.toWei(amount.toString(), 'ether') : (parseFloat(amount) * 1e18).toString()
    const uri = `ethereum:${vendor}@${this.chainIdDecimal}?value=${amountWei}`
    
    return {
      uri,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uri)}`,
      fallbackUrl: `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(uri)}`
    }
  }

  // Check if token is supported
  async isTokenSupported(tokenAddress) {
    if (!this.contract || !this.isValidAddress(tokenAddress)) return false

    try {
      return await this.contract.methods.supportedTokens(tokenAddress).call()
    } catch (error) {
      console.error("Error checking token support:", error)
      return false
    }
  }

  // Get daily volume for a specific date
  async getDailyVolume(dayTimestamp) {
    if (!this.contract) return "0"

    try {
      const volume = await this.contract.methods.getDailyVolume(dayTimestamp).call()
      return this.web3.utils.fromWei(volume, "ether")
    } catch (error) {
      console.error("Error getting daily volume:", error)
      return "0"
    }
  }

  // Get vendor payments total
  async getVendorPayments(vendorAddress) {
    if (!this.contract || !this.isValidAddress(vendorAddress)) return "0"

    try {
      const payments = await this.contract.methods.vendorPayments(vendorAddress).call()
      return this.web3.utils.fromWei(payments, "ether")
    } catch (error) {
      console.error("Error getting vendor payments:", error)
      return "0"
    }
  }

  // Check if payment ID has been processed
  async isPaymentProcessed(paymentId) {
    if (!this.contract || !paymentId) return false

    try {
      return await this.contract.methods.processedPayments(paymentId).call()
    } catch (error) {
      console.error("Error checking payment status:", error)
      return false
    }
  }

  // Get contract owner
  async getOwner() {
    if (!this.contract) return null

    try {
      return await this.contract.methods.owner().call()
    } catch (error) {
      console.error("Error getting contract owner:", error)
      return null
    }
  }

  // Get emergency withdrawal status
  async getEmergencyWithdrawalStatus() {
    if (!this.contract) return false

    try {
      return await this.contract.methods.emergencyWithdrawalEnabled().call()
    } catch (error) {
      console.error("Error getting emergency withdrawal status:", error)
      return false
    }
  }

  // Get emergency balance for a token
  async getEmergencyBalance(tokenAddress) {
    if (!this.contract || !this.isValidAddress(tokenAddress)) return "0"

    try {
      const balance = await this.contract.methods.emergencyBalance(tokenAddress).call()
      return this.web3.utils.fromWei(balance, "ether")
    } catch (error) {
      console.error("Error getting emergency balance:", error)
      return "0"
    }
  }

  // Get contract addresses
  getContractAddresses() {
    return {
      paymentGateway: this.contractAddress,
      usdt: CONTRACT_CONFIG.USDT_ADDRESS,
      usdc: CONTRACT_CONFIG.USDC_ADDRESS
    }
  }

  // Get network info
  getNetworkInfo() {
    return {
      chainId: this.chainId,
      chainIdDecimal: this.chainIdDecimal,
      rpcUrl: this.rpcUrl,
      explorerBase: this.explorerBase,
      name: "Morph Holesky Testnet"
    }
  }

  // Listen to contract events
  subscribeToEvents(eventName, callback, fromBlock = 'latest') {
    if (!this.contract) {
      throw new Error('Contract not initialized')
    }

    const eventEmitter = this.contract.events[eventName]({
      fromBlock: fromBlock
    })

    eventEmitter.on('data', callback)
    eventEmitter.on('error', (error) => {
      console.error(`Error in ${eventName} event:`, error)
    })

    return eventEmitter
  }

  // Cleanup event listeners
  cleanup() {
    if (typeof window !== 'undefined' && window.ethereum && window.ethereum.removeListener) {
      window.ethereum.removeListener("accountsChanged", this.handleAccountsChanged)
      window.ethereum.removeListener("chainChanged", this.handleChainChanged)
    }
  }
}

// Browser-specific additions - Payment Form Helper
MorphPay.prototype.createPaymentForm = function(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container with id "${containerId}" not found`);
  }

  const form = document.createElement('form');
  form.innerHTML = `
    <div class="morphpay-form" style="max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h3>MorphPay Payment</h3>
      
      <div class="form-group" style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Payment Type:</label>
        <select name="paymentType" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
          <option value="ETH">ETH</option>
          <option value="USDT">USDT</option>
          <option value="USDC">USDC</option>
        </select>
      </div>
      
      <div class="form-group" style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Amount:</label>
        <input type="number" name="amount" step="0.001" min="0.001" placeholder="0.01" required 
               style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
      </div>
      
      <div class="form-group" style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Vendor Address:</label>
        <input type="text" name="vendor" placeholder="0x..." required 
               style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-family: monospace;" />
      </div>
      
      <div class="form-group" style="margin-bottom: 15px;">
        <div id="connection-status" style="padding: 10px; background: #f0f0f0; border-radius: 4px; text-align: center;">
          <span>Not connected</span>
        </div>
      </div>
      
      <button type="button" id="connect-wallet" 
              style="width: 100%; padding: 10px; background: #007cba; color: white; border: none; border-radius: 4px; margin-bottom: 10px; cursor: pointer;">
        Connect Wallet
      </button>
      
      <button type="submit" disabled
              style="width: 100%; padding: 10px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; opacity: 0.5;">
        Pay Now
      </button>
      
      <div id="status-messages" style="margin-top: 15px;"></div>
    </div>
  `;

  const connectBtn = form.querySelector('#connect-wallet');
  const submitBtn = form.querySelector('button[type="submit"]');
  const statusDiv = form.querySelector('#connection-status span');
  const messagesDiv = form.querySelector('#status-messages');
  
  const showMessage = (message, type = 'info') => {
    const colors = {
      success: '#d4edda',
      error: '#f8d7da',
      info: '#d1ecf1'
    };
    messagesDiv.innerHTML = `<div style="padding: 10px; background: ${colors[type]}; border-radius: 4px; margin-top: 10px;">${message}</div>`;
  };

  connectBtn.addEventListener('click', async () => {
    try {
      connectBtn.disabled = true;
      connectBtn.textContent = 'Connecting...';
      
      const result = await this.connectWallet();
      
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      connectBtn.textContent = `Connected: ${result.account.slice(0,6)}...${result.account.slice(-4)}`;
      statusDiv.textContent = `Connected to ${result.account.slice(0,6)}...${result.account.slice(-4)}`;
      statusDiv.parentElement.style.background = '#d4edda';
      
      showMessage('Wallet connected successfully!', 'success');
    } catch (error) {
      connectBtn.disabled = false;
      connectBtn.textContent = 'Connect Wallet';
      showMessage(`Connection failed: ${error.message}`, 'error');
      if (options.onError) options.onError(error);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const paymentType = formData.get('paymentType');
    const amount = formData.get('amount');
    const vendor = formData.get('vendor');
    
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';
      showMessage('Processing payment...', 'info');
      
      let result;
      
      if (paymentType === 'ETH') {
        result = await this.payWithETH(vendor, amount);
      } else if (paymentType === 'USDT') {
        result = await this.payWithToken(CONTRACT_CONFIG.USDT_ADDRESS, amount, vendor);
      } else if (paymentType === 'USDC') {
        result = await this.payWithToken(CONTRACT_CONFIG.USDC_ADDRESS, amount, vendor);
      }
      
      showMessage(`Payment successful! <a href="${result.explorerUrl}" target="_blank">View Transaction</a>`, 'success');
      
      if (options.onSuccess) options.onSuccess(result);
    } catch (error) {
      showMessage(`Payment failed: ${error.message}`, 'error');
      if (options.onError) options.onError(error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Pay Now';
    }
  });

  container.appendChild(form);
  return form;
};

// Export for different environments
export default MorphPay;

// Only add to window in browser environments, after export
if (typeof window !== 'undefined') {
  window.MorphPay = MorphPay;
}