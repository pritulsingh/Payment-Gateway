// Contract configuration
export const PAYMENT_GATEWAY_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xaF673968bd6b1c373670c9e82bc8B9059d5037F4"

// Your PaymentGateway ABI (complete ABI from your contract)
export const PAYMENT_GATEWAY_ABI = [
  {
    type: "constructor",
    stateMutability: "nonpayable",
    inputs: [{ name: "_feeRecipient", type: "address", internalType: "address" }],
  },
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
  {
    type: "function",
    name: "MAX_FEE_BPS",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "MIN_PAYMENT_AMOUNT",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "batchPayWithTokens",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokens", type: "address[]" },
      { name: "amounts", type: "uint256[]" },
      { name: "vendors", type: "address[]" },
      { name: "paymentIds", type: "bytes32[]" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "calculateFee",
    stateMutability: "view",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "calculateNetAmount",
    stateMutability: "view",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "dailyPaymentLimit",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "dailyPaymentVolume",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "disableEmergencyWithdrawal",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "emergencyBalance",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "emergencyWithdraw",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "emergencyWithdrawalEnabled",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "enableEmergencyWithdrawal",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "feeBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "feeRecipient",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "getDailyVolume",
    stateMutability: "view",
    inputs: [{ name: "dayTimestamp", type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "getRemainingDailyLimit",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "getTodayVolume",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "pause",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "paused",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "payWithETH",
    stateMutability: "payable",
    inputs: [
      { name: "vendor", type: "address" },
      { name: "paymentId", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "payWithToken",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "vendor", type: "address" },
      { name: "paymentId", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "processedPayments",
    stateMutability: "view",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "renounceOwnership",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "setDailyPaymentLimit",
    stateMutability: "nonpayable",
    inputs: [{ name: "newLimit", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "setFeeBps",
    stateMutability: "nonpayable",
    inputs: [{ name: "newFeeBps", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "setFeeRecipient",
    stateMutability: "nonpayable",
    inputs: [{ name: "newRecipient", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "setSupportedToken",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "supported", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "supportedTokens",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "transferOwnership",
    stateMutability: "nonpayable",
    inputs: [{ name: "newOwner", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "unpause",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "vendorPayments",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "event",
    name: "PaymentSettled",
    inputs: [
      { indexed: true, name: "paymentId", type: "bytes32" },
      { indexed: true, name: "payer", type: "address" },
      { indexed: true, name: "vendor", type: "address" },
      { indexed: false, name: "token", type: "address" },
      { indexed: false, name: "amountNet", type: "uint256" },
      { indexed: false, name: "fee", type: "uint256" },
      { indexed: false, name: "timestamp", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "TokenSupported",
    inputs: [
      { indexed: true, name: "token", type: "address" },
      { indexed: false, name: "supported", type: "bool" },
    ],
  },
  {
    type: "event",
    name: "FeeUpdated",
    inputs: [
      { indexed: false, name: "oldFee", type: "uint256" },
      { indexed: false, name: "newFee", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "FeeRecipientUpdated",
    inputs: [
      { indexed: true, name: "oldRecipient", type: "address" },
      { indexed: true, name: "newRecipient", type: "address" },
    ],
  },
  {
    type: "event",
    name: "EmergencyWithdrawal",
    inputs: [
      { indexed: true, name: "token", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "DailyLimitUpdated",
    inputs: [
      { indexed: false, name: "oldLimit", type: "uint256" },
      { indexed: false, name: "newLimit", type: "uint256" },
    ],
  },
]

// ERC-20 Token ABI (for token payments)
export const ERC20_ABI = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
]

// Supported tokens on Morph Holesky (using your addresses)
export const SUPPORTED_TOKENS = {
  ETH: {
    address: "0x0000000000000000000000000000000000000000",
    symbol: "ETH",
    decimals: 18,
    name: "Ethereum",
  },
  USDT: {
    address: process.env.NEXT_PUBLIC_USDT_ADDRESS || "0x4022210ba16Ab225A2518D9FDBD7c90b5Fb4fF16",
    symbol: "USDT",
    decimals: 6,
    name: "Tether USD",
  },
  USDC: {
    address: process.env.NEXT_PUBLIC_USDC_ADDRESS || "0xF5a9c115661d413A53128c368977FF44A5a9270C",
    symbol: "USDC",
    decimals: 6,
    name: "USD Coin",
  },
}

// Contract constants (from your contract)
export const CONTRACT_CONSTANTS = {
  MAX_FEE_BPS: 1000, // 10%
  MIN_PAYMENT_AMOUNT: 1000, // Minimum payment amount
  DEFAULT_FEE_BPS: 50, // 0.5%
}
