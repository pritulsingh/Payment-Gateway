declare module 'morphpay-sdk' {
  import { ReactNode, CSSProperties } from 'react';

  // Core SDK Configuration
  export interface MorphPayConfig {
    contractAddress?: string;
    rpcUrl?: string;
    chainId?: string;
    chainIdDecimal?: number;
    explorerBase?: string;
    timeout?: number;
  }

  // Network Configuration
  export interface NetworkConfig {
    chainId: string;
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
  }

  // Contract Information - Updated to match actual SDK
  export interface ContractInfo {
    exists: boolean | null;
    paused: boolean;
    feeBps: string;
    feeRecipient: string;
    dailyLimit: string;
    todayVolume: string;
    minPayment: string;
    maxFeeBps: string;
    remainingDailyLimit: string;
  }

  // Token Balance Information
  export interface TokenBalance {
    balance: string;
    decimals: number;
    symbol: string;
    raw?: string;
  }

  // Fee Calculation Result - Updated to match SDK
  export interface FeeInfo {
    fee: string;
    net: string;
    feePercent?: string;
  }

  // Payment Result - Updated to match actual SDK response
  export interface PaymentResult {
    transactionHash: string;
    paymentId: string;  // This is what the fixed SDK returns
    explorerUrl: string;
  }

  // Batch Payment Result
  export interface BatchPaymentResult {
    transactionHash: string;
    paymentIds: string[];
    explorerUrl: string;
  }

  // Batch Payment Input
  export interface Payment {
    token: string;
    amount: string;
    vendor: string;
  }

  // Mint Result
  export interface MintResult {
    transactionHash: string;
    explorerUrl: string;
  }

  // QR Code Data
  export interface QRCodeData {
    uri: string;
    qrUrl: string;
    fallbackUrl: string;
  }

  // Network Info
  export interface NetworkInfo {
    chainId: string;
    chainIdDecimal: number;
    rpcUrl: string;
    explorerBase: string;
    name: string;
  }

  // Contract Addresses
  export interface ContractAddresses {
    paymentGateway: string;
    usdt: string;
    usdc: string;
  }

  // Payment Error
  export interface PaymentError extends Error {
    code: string;
    details?: any;
  }

  // Connection Info - Updated to match SDK
  export interface ConnectionInfo {
    account: string;
    chainId: string;
    isCorrectChain?: boolean;
  }

  // Component Base Props
  export interface BaseComponentProps {
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
  }

  // Payment Button Props
  export interface PaymentButtonProps extends BaseComponentProps {
    contractAddress: string;
    amount: string;
    recipient: string;
    paymentType?: 'ETH' | 'TOKEN';
    tokenAddress?: string | null;
    autoConnect?: boolean;
    onSuccess?: (result: PaymentResult) => void;
    onError?: (error: PaymentError) => void;
    onConnect?: (info: ConnectionInfo) => void;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary' | 'outline';
    disabled?: boolean;
  }

  // Payment Modal Props
  export interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    contractAddress: string;
    amount?: string;
    recipient?: string;
    paymentType?: 'ETH' | 'TOKEN' | 'QR';
    tokenAddress?: string | null;
    showAmountField?: boolean;
    showRecipientField?: boolean;
    showPaymentMethods?: boolean;
    onSuccess?: (result: PaymentResult) => void;
    onError?: (error: PaymentError) => void;
    theme?: 'light' | 'dark';
  }

  // Checkout Form Props
  export interface CheckoutFormProps {
    contractAddress: string;
    amount?: string;
    recipient?: string;
    paymentType?: 'ETH' | 'TOKEN';
    tokenAddress?: string | null;
    showAmountField?: boolean;
    showRecipientField?: boolean;
    onSuccess?: (result: PaymentResult) => void;
    onError?: (error: PaymentError) => void;
    onConnect?: (info: ConnectionInfo) => void;
    className?: string;
    theme?: 'light' | 'dark';
  }

  // Main SDK Class - Updated to match actual MorphPay class
  export class MorphPay {
    // Properties
    contractAddress: string;
    rpcUrl: string;
    chainId: string;
    chainIdDecimal: number;
    explorerBase: string;
    web3: any;
    contract: any;
    account: string;
    isConnected: boolean;
    contractInfo: ContractInfo;

    constructor(options?: MorphPayConfig);
    
    // Wallet connection methods
    initializeWeb3(): Promise<boolean>;
    isMetaMaskInstalled(): boolean;
    isValidAddress(address: string): boolean;
    connectWallet(): Promise<ConnectionInfo>;
    switchToMorphNetwork(): Promise<void>;
    handleAccountsChanged(accounts: string[]): void;
    handleChainChanged(newChainId: string): void;

    // Balance methods
    getBalance(address?: string): Promise<string>;
    getTokenBalance(tokenAddress: string, userAddress?: string): Promise<TokenBalance>;

    // Contract methods
    checkContract(): Promise<ContractInfo>;
    calculateFee(amount: string): Promise<FeeInfo>;

    // Payment methods - Updated signatures to match actual SDK
    payWithETH(vendor: string, amount: string): Promise<PaymentResult>;
    payWithToken(tokenAddress: string, amount: string, vendor: string): Promise<PaymentResult>;
    batchPayWithTokens(payments: Payment[]): Promise<BatchPaymentResult>;

    // Token methods
    mintToken(tokenAddress: string): Promise<MintResult>;
    isTokenSupported(tokenAddress: string): Promise<boolean>;

    // Utility methods
    generateQRCode(vendor: string, amount: string): QRCodeData;
    getDailyVolume(dayTimestamp: number): Promise<string>;
    getVendorPayments(vendorAddress: string): Promise<string>;
    isPaymentProcessed(paymentId: string): Promise<boolean>;
    getOwner(): Promise<string | null>;
    getEmergencyWithdrawalStatus(): Promise<boolean>;
    getEmergencyBalance(tokenAddress: string): Promise<string>;
    getContractAddresses(): ContractAddresses;
    getNetworkInfo(): NetworkInfo;

    // Event methods
    subscribeToEvents(eventName: string, callback: (data: any) => void, fromBlock?: string | number): any;
    cleanup(): void;

    // Browser-specific methods (optional)
    createPaymentForm?(containerId: string, options?: any): HTMLFormElement;
  }

  // React Components (if available)
  export const PaymentButton: React.FC<PaymentButtonProps>;
  export const PaymentModal: React.FC<PaymentModalProps>;
  export const CheckoutForm: React.FC<CheckoutFormProps>;

  // Core Utilities
  export function validateAddress(address: string): boolean;
  export function formatEther(wei: string | number): string;
  export function parseEther(ether: string | number): string;

  // Web3 Payment Utilities
  export function formatCrypto(amount: string | number, symbol?: string, decimals?: number): string;
  export function validatePaymentAmount(amount: string, minAmount?: string): boolean;
  export function validateTokenAddress(address: string): boolean;
  export function calculateNetworkFee(gasPrice: string, gasLimit: string): string;
  export function formatTransactionHash(hash: string): string;
  export function getExplorerUrl(hash: string, type?: 'tx' | 'address' | 'block'): string;
  export function shortenAddress(address: string, chars?: number): string;
  export function calculatePlatformFee(amount: string, feeBps?: number): FeeInfo;
  export function generatePaymentQR(recipient: string, amount: string, chainId?: number): string;
  export function waitForTransaction(web3: any, hash: string, maxWaitTime?: number): Promise<any>;

  // Network Utilities
  export function isCorrectNetwork(chainId: string): boolean;
  export function checkMetaMaskInstalled(): boolean;
  export function requestMetaMaskInstallation(): string;

  // Error Handling
  export function createPaymentError(message: string, code?: string, details?: any): PaymentError;
  export function handleWeb3Error(error: any): PaymentError;

  // Constants - Updated to match actual SDK
  export const MORPH_CHAIN_ID: string;
  export const MORPH_CHAIN_ID_DECIMAL: number;
  export const MORPH_NETWORK_CONFIG: NetworkConfig;
  
  export const PAYMENT_TYPES: {
    ETH: 'ETH';
    TOKEN: 'TOKEN';
    QR: 'QR';
  };

  // Contract Configuration
  export const CONTRACT_CONFIG: {
    PAYMENT_GATEWAY_ADDRESS: string;
    USDT_ADDRESS: string;
    USDC_ADDRESS: string;
    MORPH_CHAIN_ID: string;
    MORPH_CHAIN_ID_DECIMAL: number;
    MORPH_RPC_URL: string;
    MORPH_EXPLORER_BASE: string;
  };

  // SDK Configuration
  export const VERSION: string;
  export const SDK_CONFIG: {
    version: string;
    supportedChains: number[];
    defaultChain: number;
    explorerBaseUrl: string;
    rpcUrl: string;
    networkName: string;
  };

  // Default export - Updated to match actual SDK
  const SDK: typeof MorphPay;
  export default SDK;
}

// Global type augmentations for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, callback: Function) => void;
      removeListener?: (event: string, callback: Function) => void;
      isMetaMask?: boolean;
      selectedAddress?: string;
      chainId?: string;
      isCoinbaseWallet?: boolean;
      isTrust?: boolean;
    };
    WalletConnect?: any;
  }
}

// Web3 related types
export interface Web3Instance {
  eth: {
    getBalance: (address: string) => Promise<string>;
    getTransactionReceipt: (hash: string) => Promise<any>;
    getCode: (address: string) => Promise<string>;
    Contract: new (abi: any[], address: string) => any;
  };
  utils: {
    toWei: (amount: string, unit: string) => string;
    fromWei: (amount: string, unit: string) => string;
    isAddress: (address: string) => boolean;
    randomHex: (size: number) => string;
    toBN: (value: string | number) => any;
  };
}

// Transaction Receipt
export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  gasUsed: number;
  status: boolean;
  from: string;
  to: string;
  events?: any;
}