"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"        
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"       
import { Badge } from "./ui/badge"
import {
  CheckCircle,
  ExternalLink,
  AlertCircle,
  Calculator,
  Shield,
  Wallet,
  Smartphone,
  Coins,
  Settings,
  Copy,
  Check,
} from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"
import { PAYMENT_GATEWAY_ABI } from "../lib/contract-config"
import TokenMintComponent from "./token-mint-component"
import ConnectionStatus from "./connection-status"
import QRCodeGenerator from "./qr-code-generator"
import TokenPayment from "./token-payment"
import AdminPanel from "./admin-panel"

const PAYMENT_GATEWAY_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xaF673968bd6b1c373670c9e82bc8B9059d5037F4"

const MORPH_CHAIN_ID = "0xafa" // 2810 in hex
const MORPH_CHAIN_ID_DECIMAL = 2810
const MORPH_RPC_URL = "https://rpc-holesky.morphl2.io"
const MORPH_EXPLORER_BASE = "https://explorer-holesky.morphl2.io/tx/"

export default function Demo() {
  const [mounted, setMounted] = useState(false)
  const [web3, setWeb3] = useState(null)
  const [contract, setContract] = useState(null)
  const [account, setAccount] = useState("")
  const [balance, setBalance] = useState("0")
  const [chainId, setChainId] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("browser")
  const [paymentType, setPaymentType] = useState("ETH")
  const [amount, setAmount] = useState("0.01")
  const [recipient, setRecipient] = useState(
    process.env.NEXT_PUBLIC_VENDOR_ADDRESS || "0x69f66FFbb39Bfe6538d870Bd483999A6C7442B58",
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const [copiedHash, setCopiedHash] = useState(false)
  const [txHash, setTxHash] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [qrData, setQrData] = useState("")
  const [contractInfo, setContractInfo] = useState({
    exists: null,
    paused: false,
    feeBps: "50",
    feeRecipient: "",
    dailyLimit: "0",
    todayVolume: "0",
    minPayment: "0",
  })
  const [feeInfo, setFeeInfo] = useState({ fee: "0", net: "0" })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (contract && amount && contractInfo.exists && !contractInfo.paused && parseFloat(amount) > 0) {
      calculateFees()
    } else {
      setFeeInfo({ fee: "0", net: "0" })
    }
  }, [contract, amount, contractInfo.exists, contractInfo.paused])

  const isMetaMaskInstalled = () => {
    return mounted && typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  }

  const isValidAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const openTransactionInExplorer = (hash) => {
    const primaryUrl = `${MORPH_EXPLORER_BASE}${hash}`;
  try {
    const newWindow = window.open(primaryUrl, '_blank');
    
    if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
      navigator.clipboard.writeText(primaryUrl).then(() => {
        setSuccess('Explorer link copied to clipboard! Paste in your browser to view transaction.');
      }).catch(() => {
        setError(`Could not open explorer. Visit: ${primaryUrl}`);
      });
    }
  } catch (err) {
    console.error('Failed to open explorer:', err);
    setError(`Could not open explorer. Visit: ${primaryUrl}`);
  }
}

const copyHashToClipboard = async (hash) => {
  try {
    await navigator.clipboard.writeText(hash)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2000)
  } catch (err) {
    console.error('Failed to copy hash:', err)
  }
}
useEffect(() => {
  if (!mounted) return

  const initWeb3 = async () => {
    try {
      if (isMetaMaskInstalled()) {
        const Web3Module = (await import("web3")).default
        const web3Instance = new Web3Module(window.ethereum)
        setWeb3(web3Instance)

        const contractInstance = new web3Instance.eth.Contract(PAYMENT_GATEWAY_ABI, PAYMENT_GATEWAY_ADDRESS)
        setContract(contractInstance)

        window.ethereum.on("accountsChanged", handleAccountsChanged)
        window.ethereum.on("chainChanged", handleChainChanged)
      }
    } catch (err) {
      console.error("Error initializing Web3:", err)
      setError("Failed to initialize Web3. Please refresh the page.")
    }
  }

  initWeb3()

  return () => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      window.ethereum.removeListener("chainChanged", handleChainChanged)
    }
  }
}, [mounted])
  const checkContract = async (web3Instance, contractInstance, skipWalletChecks = false) => {
  try {
    if (!isValidAddress(PAYMENT_GATEWAY_ADDRESS)) {
      setContractInfo((prev) => ({ ...prev, exists: false }))
      return
    }

    if (!skipWalletChecks) {
      const currentChainId = await window.ethereum.request({ method: "eth_chainId" })
      if (currentChainId !== MORPH_CHAIN_ID) {
        setContractInfo((prev) => ({ ...prev, exists: null }))
        return
      }
    }

    const code = await web3Instance.eth.getCode(PAYMENT_GATEWAY_ADDRESS)
    const exists = code && code !== "0x" && code !== "0x0"

    if (exists && contractInstance) {
      try {
        const [paused, feeBps, feeRecipient, dailyLimit, todayVolume, minPayment] = await Promise.all([
          contractInstance.methods.paused().call(),
          contractInstance.methods.feeBps().call(),
          contractInstance.methods.feeRecipient().call(),
          contractInstance.methods.dailyPaymentLimit().call(),
          contractInstance.methods.getTodayVolume().call(),
          contractInstance.methods.MIN_PAYMENT_AMOUNT().call(),
        ])

        setContractInfo({
          exists: true,
          paused,
          feeBps: feeBps.toString(),
          feeRecipient,
          dailyLimit: web3Instance.utils.fromWei(dailyLimit, "ether"),
          todayVolume: web3Instance.utils.fromWei(todayVolume, "ether"),
          minPayment: web3Instance.utils.fromWei(minPayment, "ether"),
        })

        console.log("Contract info loaded:", {
          paused,
          feeBps: feeBps.toString(),
          feeRecipient,
          dailyLimit: web3Instance.utils.fromWei(dailyLimit, "ether"),
          todayVolume: web3Instance.utils.fromWei(todayVolume, "ether"),
          minPayment: web3Instance.utils.fromWei(minPayment, "ether"),
        })
      } catch (err) {
        console.error("Error getting contract info:", err)
        setContractInfo((prev) => ({ ...prev, exists: true }))
      }
    } else {
      setContractInfo((prev) => ({ ...prev, exists: false }))
    }
  } catch (err) {
    console.error("Error checking contract:", err)
    setContractInfo((prev) => ({ ...prev, exists: false }))
  }
}
const checkConnectionSilently = async (web3Instance) => {
  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" })
    
    if (accounts.length > 0) {
      const currentChainId = await window.ethereum.request({ method: "eth_chainId" })
      setAccount(accounts[0])
      setChainId(currentChainId)
      setIsConnected(true)
      await getBalance(accounts[0], web3Instance)

      await checkContract(web3Instance, contract, false)

      if (currentChainId === MORPH_CHAIN_ID) {
        setSuccess("Connected to Morph Holesky Testnet")
      } else {
        setError("Please switch to Morph Holesky Testnet (Chain ID: 2810)")
      }
    } else {
      await checkContract(web3Instance, contract, true)
    }
  } catch (err) {
    console.error("Error checking connection silently:", err)
    if (web3Instance && contract) {
      await checkContract(web3Instance, contract, true)
    }
  }
}

  useEffect(() => {
    if (contract && amount && contractInfo.exists && !contractInfo.paused) {
      calculateFees()
    }
  }, [contract, amount, contractInfo.exists, contractInfo.paused])

  const calculateFees = async () => {
  try {
    if (!contract || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setFeeInfo({ fee: "0", net: "0" })
      return
    }

    const amountNum = parseFloat(amount)
    if (amountNum <= 0) {
      setFeeInfo({ fee: "0", net: "0" })
      return
    }

    const amountWei = web3.utils.toWei(amountNum.toString(), 'ether')
    
    const [fee, net] = await Promise.all([
      contract.methods.calculateFee(amountWei).call().catch(() => null),
      contract.methods.calculateNetAmount(amountWei).call().catch(() => null)
    ])

    if (fee !== null && net !== null) {
      setFeeInfo({
        fee: web3.utils.fromWei(fee.toString(), 'ether'),
        net: web3.utils.fromWei(net.toString(), 'ether'),
      })
    } else {
      const feePercent = parseFloat(contractInfo.feeBps) / 10000
      const feeAmount = amountNum * feePercent
      const netAmount = amountNum - feeAmount

      setFeeInfo({
        fee: feeAmount.toFixed(6),
        net: netAmount.toFixed(6),
      })
    }
  } catch (err) {
    console.error("Error calculating fees:", err)
    try {
      const amountNum = parseFloat(amount)
      const feePercent = parseFloat(contractInfo.feeBps) / 10000
      const feeAmount = amountNum * feePercent
      const netAmount = amountNum - feeAmount

      setFeeInfo({
        fee: feeAmount.toFixed(6),
        net: netAmount.toFixed(6),
      })
    } catch (fallbackErr) {
      console.error("Fallback calculation failed:", fallbackErr)
      setFeeInfo({ fee: "0", net: "0" })
    }
  }
}
  const checkExistingConnection = async (web3Instance) => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      const currentChainId = await window.ethereum.request({ method: "eth_chainId" })

      if (accounts.length > 0) {
        setAccount(accounts[0])
        setChainId(currentChainId)
        setIsConnected(true)
        await getBalance(accounts[0], web3Instance)

        if (currentChainId === MORPH_CHAIN_ID) {
          setSuccess("Connected to Morph Holesky Testnet")
        } else {
          setError("Please switch to Morph Holesky Testnet (Chain ID: 2810)")
        }
      }
    } catch (err) {
      console.error("Error checking existing connection:", err)
    }
  }

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setIsConnected(false)
      setAccount("")
      setBalance("0")
      setError("Please connect your wallet")
    } else {
      setAccount(accounts[0])
      if (web3) {
        getBalance(accounts[0], web3)
      }
      window.dispatchEvent(new CustomEvent('refreshTokenBalances'));
    }
  }

  const handleChainChanged = (newChainId) => {
    setChainId(newChainId)
    if (newChainId === MORPH_CHAIN_ID) {
      setError("")
      setSuccess("Connected to Morph Holesky Testnet")
      if (web3 && contract) {
        checkContract(web3, contract)
      }
    } else {
      setError("Please switch to Morph Holesky Testnet (Chain ID: 2810)")
      setContractInfo((prev) => ({ ...prev, exists: null }))
    }
  }

  const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    setError("MetaMask is not installed. Please install MetaMask to continue.")
    return
  }

  setIsConnecting(true)
  setError("")

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    const currentChainId = await window.ethereum.request({ method: "eth_chainId" })

    if (accounts.length > 0) {
      setAccount(accounts[0])
      setChainId(currentChainId)
      setIsConnected(true)

      if (web3) {
        await getBalance(accounts[0], web3)
      }

      if (currentChainId !== MORPH_CHAIN_ID) {
        await switchToMorphNetwork()
      } else {
        setSuccess("Successfully connected to Morph Holesky Testnet!")
        if (web3 && contract) {
          await checkContract(web3, contract)
        }
      }
    }
  } catch (err) {
    console.error("Connection error:", err)
    setError(err.message || "Failed to connect wallet")
  } finally {
    setIsConnecting(false)
  }
}
useEffect(() => {
  if (web3 && contract && mounted) {
    checkConnectionSilently(web3)
  }
}, [web3, contract, mounted])

  const switchToMorphNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MORPH_CHAIN_ID }],
      })
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
                rpcUrls: [MORPH_RPC_URL],
                blockExplorerUrls: ["https://explorer.testnet.morphl2.io/"],
              },
            ],
          })
          setSuccess("Morph Holesky Testnet added and switched successfully!")
        } catch (addError) {
          setError("Failed to add Morph Holesky Testnet to MetaMask")
        }
      } else {
        setError("Failed to switch to Morph Holesky Testnet")
      }
    }
  }

  const getBalance = async (address, web3Instance = web3) => {
    if (!web3Instance || !address || !isValidAddress(address)) return

    try {
      const balance = await web3Instance.eth.getBalance(address)
      const ethBalance = web3Instance.utils.fromWei(balance, "ether")
      setBalance(Number.parseFloat(ethBalance).toFixed(4))
    } catch (err) {
      console.error("Failed to get balance:", err)
      setBalance("0")
    }
  }

  const processPayment = async () => {
    if (!isConnected || !web3 || !contract || !amount || !recipient) {
      setError("Please connect wallet and fill all required fields")
      return
    }

    if (!isValidAddress(recipient)) {
      setError("Please enter a valid recipient address")
      return
    }

    if (chainId !== MORPH_CHAIN_ID) {
      setError("Please switch to Morph Holesky Testnet (Chain ID: 2810)")
      return
    }

    if (!contractInfo.exists) {
      setError("Payment gateway contract not found")
      return
    }

    if (contractInfo.paused) {
      setError("Payment gateway is currently paused")
      return
    }

    const amountNum = Number.parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount")
      return
    }

    const minPayment = Number.parseFloat(contractInfo.minPayment)
    if (amountNum < minPayment) {
      setError(`Minimum payment amount is ${minPayment} ETH`)
      return
    }

    const balanceNum = Number.parseFloat(balance)
    if (amountNum > balanceNum) {
      setError("Insufficient balance")
      return
    }

    setIsProcessing(true)
    setError("")
    setSuccess("")
    setTxHash("")

    try {
      console.log("Processing payment through PaymentGateway...")
      console.log("Contract address:", PAYMENT_GATEWAY_ADDRESS)
      console.log("Vendor:", recipient)
      console.log("Amount:", amount, "ETH")

      const amountWei = web3.utils.toWei(amount, "ether")
      const paymentId = web3.utils.randomHex(32)

      console.log("Payment ID:", paymentId)
      console.log("Amount in Wei:", amountWei)

      const gasEstimate = await contract.methods.payWithETH(recipient, paymentId).estimateGas({
        from: account,
        value: amountWei,
      })

      console.log("Gas estimate:", gasEstimate)

      const tx = await contract.methods.payWithETH(recipient, paymentId).send({
        from: account,
        value: amountWei,
        gas: Math.floor(Number(gasEstimate) * 1.2), 
      })

      console.log("Transaction sent:", tx)
      setTxHash(tx.transactionHash)
      setSuccess(`Payment successful! Vendor received: ${feeInfo.net} ETH (Platform fee: ${feeInfo.fee} ETH)`)

      await getBalance(account)
      await checkContract(web3, contract)

      setAmount("0.01")
    } catch (err) {
      console.error("Payment error:", err)

      if (err.message.includes("insufficient funds")) {
        setError("Insufficient ETH balance for this transaction")
      } else if (err.message.includes("User denied") || err.message.includes("rejected")) {
        setError("Transaction was rejected by user")
      } else if (err.message.includes("PaymentTooSmall")) {
        setError(`Payment amount is below minimum threshold (${contractInfo.minPayment} ETH)`)
      } else if (err.message.includes("DailyLimitExceeded")) {
        setError("Daily payment limit exceeded")
      } else if (err.message.includes("PaymentAlreadyProcessed")) {
        setError("Payment ID already processed (duplicate)")
      } else if (err.message.includes("TokenNotSupported")) {
        setError("Token not supported by the gateway")
      } else if (err.message.includes("gas")) {
        setError("Gas estimation failed. Please try a smaller amount.")
      } else {
        setError(`Payment failed: ${err.message}`)
      }
    } finally {
      setIsProcessing(false)
    }
  }
  const refreshTokenBalances = async () => {
    window.dispatchEvent(new CustomEvent('refreshTokenBalances'));
  };
  const handlePaymentSuccess = (result) => {
    console.log("Payment successful:", result)
    setSuccess(`Payment successful! Transaction: ${result.txHash}`)
    if (web3 && account) {
      getBalance(account)
    }
  }

  const handlePaymentError = (error) => {
    console.error("Payment error:", error)
    setError(`Payment failed: ${error.message}`)
  }

  if (!mounted) {
    return (
      <section id="demo" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">Loading demo...</div>
          </div>
        </div>
      </section>
    )
  }

  return (
  <>
    {/* Features Section */}
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Features</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to integrate Web3 payments into your application.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Multi-Payment Support</h3>
            <p className="text-gray-600">Accept ETH and ERC-20 tokens with automatic fee calculation and secure processing.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">QR Code Payments</h3>
            <p className="text-gray-600">Generate QR codes for mobile wallet payments with automatic URI generation.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure & Auditable</h3>
            <p className="text-gray-600">Built with security best practices and transparent fee structures.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Calculator className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Transparent Fees</h3>
            <p className="text-gray-600">Clear fee structure with real-time calculations and detailed breakdowns.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Coins className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Token Management</h3>
            <p className="text-gray-600">Mint test tokens and manage ERC-20 token support with admin controls.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Admin Dashboard</h3>
            <p className="text-gray-600">Comprehensive admin panel for contract management and configuration.</p>
          </div>
        </div>
      </div>
    </section>

    {/* YOUR EXISTING DEMO SECTION - PASTE YOUR CODE FROM paste.txt HERE */}
    <section id="demo" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Try It Live</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience real Web3 payments using your deployed PaymentGateway contract on Morph Holesky Testnet.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Payment Method Selection */}
          <div className="mb-8">
           <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <Button
                variant={paymentMethod === "browser" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPaymentMethod("browser")}
                className="flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Browser Wallet
              </Button>
              <Button
                variant={paymentMethod === "mobile" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPaymentMethod("mobile")}
                className="flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                Mobile QR
              </Button>
              <Button
                variant={paymentMethod === "token" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPaymentMethod("token")}
                className="flex items-center gap-2"
              >
                <Coins className="w-4 h-4" />
                ERC-20 Tokens
              </Button>
              {/* ADD THIS NEW BUTTON */}
              <Button
                variant={paymentMethod === "mint" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPaymentMethod("mint")}
                className="flex items-center gap-2"
              >
                <Coins className="w-4 h-4" />
                Mint Tokens
              </Button>
              <Button
                variant={paymentMethod === "admin" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPaymentMethod("admin")}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Admin Panel
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Payment Interface */}
            <div className="space-y-6">
              {paymentMethod === "browser" && (
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
                      ETH Payment via Browser
                      {chainId === MORPH_CHAIN_ID && <Badge variant="secondary">Morph Holesky</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Contract Status */}
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
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
                            <strong>Platform Fee:</strong> {(Number.parseFloat(contractInfo.feeBps) / 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-600 font-mono">{PAYMENT_GATEWAY_ADDRESS}</p>
                        </div>
                      </AlertDescription>
                    </Alert>

                    {/* Fee Calculator */}
                    {contractInfo.exists && amount && (
                      <Alert>
                        <Calculator className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            <p>
                              <strong>Payment Breakdown:</strong>
                            </p>
                            <p className="text-sm">
                              Amount: {amount} ETH → Vendor gets: {feeInfo.net} ETH (Fee: {feeInfo.fee} ETH)
                            </p>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Connection Status */}
                    <ConnectionStatus />

                    {/* Payment Form */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="amount">Amount (ETH)</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.01"
                          step="0.001"
                          min={contractInfo.minPayment || "0.001"}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Balance: {balance} ETH • Min: {contractInfo.minPayment || "0.001"} ETH • Vendor receives:{" "}
                          {feeInfo.net} ETH
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="recipient">Vendor Address</Label>
                        <Input
                          id="recipient"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          placeholder="0x..."
                          className="font-mono text-sm"
                        />
                        {recipient && !isValidAddress(recipient) && (
                          <p className="text-xs text-red-500 mt-1">Invalid address format</p>
                        )}
                      </div>
                    </div>

                    {/* Payment Button */}
                    <Button
                      onClick={processPayment}
                      disabled={
                        !isConnected ||
                        isProcessing ||
                        !amount ||
                        !recipient ||
                        !isValidAddress(recipient) ||
                        chainId !== MORPH_CHAIN_ID ||
                        !contractInfo.exists ||
                        contractInfo.paused ||
                        Number.parseFloat(amount) <= 0 ||
                        Number.parseFloat(amount) < Number.parseFloat(contractInfo.minPayment || "0") ||
                        Number.parseFloat(amount) > Number.parseFloat(balance)
                      }
                      className="w-full"
                      size="lg"
                    >
                      {isProcessing ? "Processing Payment..." : `Pay ${amount} ETH via Gateway`}
                    </Button>

                    {/* Status Messages */}
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    {/* Transaction Result */}
                      {txHash && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-3">
                              <p className="font-medium text-green-700">Payment Successful!</p>
                              
                              {/* Transaction Hash Display */}
                              <div className="bg-gray-50 border rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">Transaction Hash</span>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyHashToClipboard(txHash)}
                                      className="h-7 px-2"
                                    >
                                      {copiedHash ? (
                                        <Check className="w-3 h-3 text-green-600" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openTransactionInExplorer(txHash)}
                                      className="h-7 px-2"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="text-xs font-mono text-gray-600 break-all bg-white p-2 rounded border">
                                  {txHash}
                                </div>
                              </div>

                              {/* Payment Summary */}
                              <div className="text-sm text-gray-600">
                                <p>Vendor received: <span className="font-medium text-green-600">{feeInfo.net} ETH</span></p>
                                <p>Platform fee: <span className="font-medium">{feeInfo.fee} ETH</span></p>
                              </div>

                              {/* Explorer Link (if direct click fails) */}
                              <div className="text-xs text-gray-500 border-t pt-2">
                                <p>Direct link: <a 
                                  href={`${MORPH_EXPLORER_BASE}${txHash}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 hover:underline font-mono break-all"
                                >
                                  {MORPH_EXPLORER_BASE}{txHash}
                                </a></p>
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              {paymentMethod === "mobile" && (
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Mobile QR Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* QR Payment Form */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="qr-amount">Amount (ETH)</Label>
                        <Input
                          id="qr-amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.01"
                          step="0.001"
                          min="0.001"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Min: 0.001 ETH
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="qr-vendor">Vendor Address</Label>
                        <Input
                          id="qr-vendor"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          placeholder="0x..."
                          className="font-mono text-sm"
                        />
                        {recipient && !isValidAddress(recipient) && (
                          <p className="text-xs text-red-500 mt-1">Invalid address format</p>
                        )}
                      </div>

                      {/* QR Code Display */}
                      {amount && recipient && isValidAddress(recipient) && parseFloat(amount) > 0 && (
                        <div className="text-center space-y-3">
                          <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                `ethereum:${recipient}@${MORPH_CHAIN_ID_DECIMAL}?value=${web3?.utils.toWei(amount, 'ether') || '0'}`
                              )}`}
                              alt="Payment QR Code"
                              className="mx-auto"
                              onError={(e) => {
                                e.target.src = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(
                                  `ethereum:${recipient}@${MORPH_CHAIN_ID_DECIMAL}?value=${web3?.utils.toWei(amount, 'ether') || '0'}`
                                )}`
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const uri = `ethereum:${recipient}@${MORPH_CHAIN_ID_DECIMAL}?value=${web3?.utils.toWei(amount, 'ether') || '0'}`
                                  navigator.clipboard.writeText(uri).then(() => {
                                    setSuccess('Payment URI copied to clipboard!')
                                    setTimeout(() => setSuccess(''), 3000)
                                  })
                                }}
                                className="h-7 px-2"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="text-xs font-mono text-gray-600 break-all bg-white p-2 rounded border">
                              ethereum:{recipient}@{MORPH_CHAIN_ID_DECIMAL}?value={web3?.utils.toWei(amount, 'ether') || '0'}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Validation Messages */}
                      {amount && parseFloat(amount) <= 0 && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>Please enter a valid amount greater than 0</AlertDescription>
                        </Alert>
                      )}

                      {recipient && !isValidAddress(recipient) && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>Please enter a valid Ethereum address</AlertDescription>
                        </Alert>
                      )}

                      {!amount || !recipient && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>Enter amount and vendor address to generate QR code</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              {paymentMethod === "token" && (
                <TokenPayment
                  web3={web3}
                  account={account}
                  isConnected={isConnected}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )}
              {paymentMethod === "mint" && (
                <TokenMintComponent
                  web3={web3}
                  account={account}
                  isConnected={isConnected}
                  chainId={chainId}
                  explorerBase={MORPH_EXPLORER_BASE}
                  copyHashToClipboard={copyHashToClipboard}
                  openTransactionInExplorer={openTransactionInExplorer}
                  key={`${account}-${chainId}-${paymentMethod}`} // Force re-render when these change
                />
              )}
{paymentMethod === "admin" && <AdminPanel web3={web3} account={account} isConnected={isConnected} />}
            </div>

            {/* Right Column - Code Example */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Integration Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="eth" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="eth">ETH Payment</TabsTrigger>
                    <TabsTrigger value="token">Token Payment</TabsTrigger>
                    <TabsTrigger value="qr">QR Code</TabsTrigger>
                    <TabsTrigger value="mint">Mint Tokens</TabsTrigger>
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                  </TabsList>

                  <TabsContent value="eth" className="mt-4">
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                      <pre>{`// ETH Payment via PaymentGateway
import Web3 from 'web3'

const web3 = new Web3(window.ethereum)
const contract = new web3.eth.Contract(
  ABI, 
  '${PAYMENT_GATEWAY_ADDRESS}'
)

const paymentId = web3.utils.randomHex(32)
const amountWei = web3.utils.toWei('${amount}', 'ether')

const tx = await contract.methods
  .payWithETH('${recipient}', paymentId)
  .send({
    from: '${account || "YOUR_ADDRESS"}',
    value: amountWei,
    gas: 150000
  })

// Vendor receives: ${feeInfo.net} ETH
// Platform fee: ${feeInfo.fee} ETH`}</pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="token" className="mt-4">
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                      <pre>{`// ERC-20 Token Payment
import Web3 from 'web3'

const web3 = new Web3(window.ethereum)
const tokenContract = new web3.eth.Contract(ERC20_ABI, tokenAddress)
const gatewayContract = new web3.eth.Contract(ABI, gatewayAddress)

// 1. Approve token spending
await tokenContract.methods
  .approve(gatewayAddress, amountWei)
  .send({ from: account })

// 2. Pay with token
const paymentId = web3.utils.randomHex(32)
await gatewayContract.methods
  .payWithToken(tokenAddress, amountWei, vendor, paymentId)
  .send({ from: account })`}</pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="qr" className="mt-4">
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                      <pre>{`// Generate QR Code for Mobile Payments
const generatePaymentQR = (vendor, amount, chainId) => {
  const amountWei = (parseFloat(amount) * 1e18).toString()
  const uri = \`ethereum:\${vendor}@\${chainId}?value=\${amountWei}\`
  
  // Generate QR code
  const qrUrl = \`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=\${encodeURIComponent(uri)}\`
  
  return { uri, qrUrl }
}

// Usage
const { uri, qrUrl } = generatePaymentQR(
  '${recipient}',
  '${amount}',
  ${MORPH_CHAIN_ID_DECIMAL}
)`}</pre>
                    </div>
                  </TabsContent>
<TabsContent value="mint" className="mt-4">
  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
    <pre>{`// Mint Test Tokens (Daily Faucet System)
import Web3 from 'web3'

const ERC20_ABI = [
  "function mintTo(address to) external",
  "function balanceOf(address) view returns (uint256)",
  "function lastMinted(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
]

const web3 = new Web3(window.ethereum)

// Check USDT availability (6 decimals)
const usdtContract = new web3.eth.Contract(
  ERC20_ABI, 
  '${process.env.NEXT_PUBLIC_USDT_ADDRESS}'
)

const usdtLastMinted = await usdtContract.methods
  .lastMinted(account).call()
const canMintUsdt = (Date.now() / 1000) - usdtLastMinted > 86400

if (canMintUsdt) {
  await usdtContract.methods
    .mintTo(account)
    .send({ from: account })
  console.log('1000 USDT tokens minted! (6 decimals)')
}

// Check USDC availability (18 decimals)
const usdcContract = new web3.eth.Contract(
  ERC20_ABI,
  '${process.env.NEXT_PUBLIC_USDC_ADDRESS}'
)

const usdcLastMinted = await usdcContract.methods
  .lastMinted(account).call()
const canMintUsdc = (Date.now() / 1000) - usdcLastMinted > 86400

if (canMintUsdc) {
  await usdcContract.methods
    .mintTo(account)
    .send({ from: account })
  console.log('1000 USDC tokens minted! (18 decimals)')
}

// Both tokens have independent 24h cooldowns`}</pre>
  </div>
</TabsContent>
                  <TabsContent value="admin" className="mt-4">
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                      <pre>{`// Add Token Support (Owner Only)
const contract = new web3.eth.Contract(ABI, contractAddress)

// Add USDC support
await contract.methods
  .setSupportedToken(
    '0x65aFADD39029741B3b8f0756952C74678c9cEC93', 
    true
  )
  .send({ from: ownerAddress })

// Check if token is supported
const isSupported = await contract.methods
  .supportedTokens('0x65aFADD39029741B3b8f0756952C74678c9cEC93')
  .call()

console.log('USDC supported:', isSupported)`}</pre>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Contract Stats */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-3">Contract Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray-600">Daily Limit</p>
                      <p className="font-mono">{contractInfo.dailyLimit} ETH</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Today's Volume</p>
                      <p className="font-mono">{contractInfo.todayVolume} ETH</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Min Payment</p>
                      <p className="font-mono">{contractInfo.minPayment} ETH</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Platform Fee</p>
                      <p className="font-mono">{(Number.parseFloat(contractInfo.feeBps) / 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
 </>
)
}
