"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"        
import { Button } from "./ui/button"
import { Alert, AlertDescription } from "./ui/alert"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { CheckCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react"
import { SUPPORTED_TOKENS, ERC20_ABI, PAYMENT_GATEWAY_ABI } from "../lib/contract-config"
import { 
  Copy, 
  Check 
} from "lucide-react"

const PAYMENT_GATEWAY_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xaF673968bd6b1c373670c9e82bc8B9059d5037F4"
const MORPH_EXPLORER_BASE = "https://explorer-holesky.morphl2.io/tx/"

export default function TokenPayment({ web3, account, isConnected, onSuccess, onError }) {
  const [selectedToken, setSelectedToken] = useState("USDT")
  const [amount, setAmount] = useState("10")
  const [vendor, setVendor] = useState(
    process.env.NEXT_PUBLIC_VENDOR_ADDRESS || "0x69f66FFbb39Bfe6538d870Bd483999A6C7442B58",
  )
  const [copiedHash, setCopiedHash] = useState(false);
  const [tokenBalance, setTokenBalance] = useState("0")
  const [allowance, setAllowance] = useState("0")
  const [isApproving, setIsApproving] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [needsApproval, setNeedsApproval] = useState(false)
  const [txHash, setTxHash] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [tokenSupported, setTokenSupported] = useState(null)
  const [isCheckingSupport, setIsCheckingSupport] = useState(false)
  
  const token = SUPPORTED_TOKENS[selectedToken]
// Listen for balance change events
useEffect(() => {
  const handleBalanceChange = (event) => {
    if (event.detail.token === token.symbol && event.detail.account === account) {
      console.log(`Balance change event received for ${token.symbol}`)
      setTimeout(() => {
        checkTokenStatus()
      }, 1000)
    }
  }

  window.addEventListener('tokenBalanceChanged', handleBalanceChange)
  
  return () => {
    window.removeEventListener('tokenBalanceChanged', handleBalanceChange)
  }
}, [token.symbol, account])
  // Helper functions for transaction handling
  const copyHashToClipboard = async (hash) => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopiedHash(true)
      setTimeout(() => setCopiedHash(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea')
        textArea.value = hash
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopiedHash(true)
        setTimeout(() => setCopiedHash(false), 2000)
      } catch (fallbackErr) {
        console.error('Copy failed')
      }
    }
  }

  const openTransactionInExplorer = (hash) => {
    window.open(`${MORPH_EXPLORER_BASE}${hash}`, '_blank', 'noopener,noreferrer')
  }

  // Check token support when token changes
  useEffect(() => {
    if (isConnected && web3 && token.address !== "0x0000000000000000000000000000000000000000") {
      checkTokenSupport()
    }
  }, [isConnected, web3, selectedToken])

  // Check token balance and allowance
  useEffect(() => {
    if (isConnected && web3 && account && token.address !== "0x0000000000000000000000000000000000000000") {
      checkTokenStatus()
    }
  }, [isConnected, web3, account, selectedToken, amount])

  // Check if approval is needed when amount changes
  useEffect(() => {
    if (amount && allowance) {
      const amountWei = web3?.utils.toWei(amount, token.decimals === 6 ? "mwei" : "ether") || "0"
      setNeedsApproval(BigInt(amountWei) > BigInt(allowance))
    }
  }, [amount, allowance, token.decimals, web3])

  const checkTokenSupport = async () => {
    setIsCheckingSupport(true)
    setTokenSupported(null)

    try {
      const gatewayContract = new web3.eth.Contract(PAYMENT_GATEWAY_ABI, PAYMENT_GATEWAY_ADDRESS)

      console.log(`Checking if ${token.symbol} (${token.address}) is supported...`)

      // Check if the contract exists first
      const code = await web3.eth.getCode(PAYMENT_GATEWAY_ADDRESS)
      if (!code || code === "0x" || code === "0x0") {
        setError("Payment gateway contract not found")
        setTokenSupported(false)
        return
      }

      try {
        const isSupported = await gatewayContract.methods.supportedTokens(token.address).call()
        setTokenSupported(isSupported)

        console.log(`${token.symbol} support status:`, isSupported)

        if (!isSupported) {
          setError(
            `${token.symbol} is not supported by the payment gateway. Please contact the admin to add this token.`,
          )
        } else {
          setError("") // Clear any previous errors
        }
      } catch (supportError) {
        console.error("Error checking token support:", supportError)
        setError(`Failed to check ${token.symbol} support. The contract may not have the supportedTokens function.`)
        setTokenSupported(false)
      }
    } catch (err) {
      console.error("Error checking token support:", err)
      setError(`Failed to verify ${token.symbol} support: ${err.message}`)
      setTokenSupported(false)
    } finally {
      setIsCheckingSupport(false)
    }
  }

  const checkTokenStatus = async () => {
    try {
      setError("") // Clear any previous errors

      // First check if token exists
      const tokenCode = await web3.eth.getCode(token.address)
      if (!tokenCode || tokenCode === "0x" || tokenCode === "0x0") {
        setError(`${token.symbol} contract not found at ${token.address}`)
        return
      }

      const tokenContract = new web3.eth.Contract(ERC20_ABI, token.address)

      try {
        // Get token balance
        const balance = await tokenContract.methods.balanceOf(account).call()
        const decimalsToUse = token.decimals === 6 ? "mwei" : "ether"
       const formattedBalance = web3.utils.fromWei(balance, decimalsToUse)
      // Show more precision for 18-decimal tokens, less for 6-decimal
      const displayDecimals = token.decimals === 6 ? 6 : 4
      setTokenBalance(Number.parseFloat(formattedBalance).toFixed(displayDecimals))
        console.log(`${token.symbol} balance:`, formattedBalance)
      } catch (balanceError) {
        console.error("Error getting token balance:", balanceError)
        setError(`Failed to get ${token.symbol} balance. Check if the token contract is valid.`)
        return
      }

      try {
        // Get allowance
        const currentAllowance = await tokenContract.methods.allowance(account, PAYMENT_GATEWAY_ADDRESS).call()
        setAllowance(currentAllowance)

        // Check if approval is needed
        if (amount) {
          const decimalsToUse = token.decimals === 6 ? "mwei" : "ether"
          const amountWei = web3.utils.toWei(amount, decimalsToUse)
          const needsApprovalNow = BigInt(currentAllowance) < BigInt(amountWei)
          setNeedsApproval(needsApprovalNow)

          console.log("Token status updated:", {
            balance: tokenBalance,
            allowance: currentAllowance,
            amountWei,
            needsApproval: needsApprovalNow,
            token: token.symbol,
          })
        }
      } catch (allowanceError) {
        console.error("Error getting allowance:", allowanceError)
        setError(`Failed to get ${token.symbol} allowance.`)
      }
    } catch (err) {
      console.error("Error checking token status:", err)
      setError(`Failed to check ${token.symbol} status: ${err.message}`)
    }
  }

  const approveToken = async () => {
    if (!web3 || !account) return

    setIsApproving(true)
    setError("")
    setSuccess("")

    try {
      const tokenContract = new web3.eth.Contract(ERC20_ABI, token.address)
      const decimalsToUse = token.decimals === 6 ? "mwei" : "ether"
      const amountWei = web3.utils.toWei(amount, decimalsToUse)

      console.log("Approving token:", {
        token: token.symbol,
        amount: amountWei,
        spender: PAYMENT_GATEWAY_ADDRESS,
        decimals: token.decimals,
      })

      // Check current allowance first
      const currentAllowance = await tokenContract.methods.allowance(account, PAYMENT_GATEWAY_ADDRESS).call()
      console.log("Current allowance before approval:", currentAllowance)

      // If there's already sufficient allowance, no need to approve again
      if (BigInt(currentAllowance) >= BigInt(amountWei)) {
        setSuccess(`${token.symbol} already approved!`)
        setNeedsApproval(false)
        setAllowance(currentAllowance)
        return
      }

      // Some tokens require setting allowance to 0 first if there's existing allowance
      if (BigInt(currentAllowance) > 0n) {
        console.log("Resetting allowance to 0 first...")
        const resetTx = await tokenContract.methods.approve(PAYMENT_GATEWAY_ADDRESS, "0").send({
          from: account,
          gas: 100000,
        })
        console.log("Reset allowance transaction:", resetTx)
      }

      // Estimate gas for approval
      const gasEstimate = await tokenContract.methods.approve(PAYMENT_GATEWAY_ADDRESS, amountWei).estimateGas({
        from: account,
      })

      // Send approval transaction
      const tx = await tokenContract.methods.approve(PAYMENT_GATEWAY_ADDRESS, amountWei).send({
        from: account,
        gas: Math.floor(Number(gasEstimate) * 1.2),
      })

      console.log("Approval transaction:", tx)

      // Wait for transaction confirmation and update state
      setSuccess(`${token.symbol} approval successful! You can now make the payment.`)

      // Refresh token status after approval
      setTimeout(async () => {
        await checkTokenStatus()
      }, 2000) // Wait 2 seconds for blockchain confirmation
    } catch (err) {
      console.error("Approval error:", err)

      let errorMessage = `Failed to approve ${token.symbol}`

      if (err.message.includes("User denied") || err.message.includes("rejected")) {
        errorMessage = "Approval was rejected by user"
      } else if (err.message.includes("insufficient funds")) {
        errorMessage = "Insufficient ETH for gas fees"
      } else {
        errorMessage = `Approval failed: ${err.message}`
      }

      setError(errorMessage)
    } finally {
      setIsApproving(false)
    }
  }

  const processTokenPayment = async () => {
    if (!web3 || !account || !isConnected) {
      setError("Please connect your wallet")
      return
    }

    if (!amount || !vendor) {
      setError("Please fill all required fields")
      return
    }

    if (!isValidAddress(vendor)) {
      setError("Please enter a valid vendor address")
      return
    }

    if (tokenSupported === false) {
      setError(`${token.symbol} is not supported by the payment gateway`)
      return
    }

    const amountNum = Number.parseFloat(amount)
    const balanceNum = Number.parseFloat(tokenBalance)

    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (amountNum > balanceNum) {
      setError(`Insufficient ${token.symbol} balance`)
      return
    }

    if (needsApproval) {
      setError(`Please approve ${token.symbol} spending first`)
      return
    }

    setIsProcessing(true)
    setError("")
    setSuccess("")
    setTxHash("")

    try {
      console.log("=== Token Payment Debug Info ===")
      console.log("Token:", token)
      console.log("Amount:", amount)
      console.log("Vendor:", vendor)
      console.log("Account:", account)
      console.log("Token Balance:", tokenBalance)
      console.log("Allowance:", allowance)
      console.log("Token Supported:", tokenSupported)

      // Check if we're on the correct network
      const currentChainId = await window.ethereum.request({ method: "eth_chainId" })
      if (currentChainId !== "0xafa") {
        // Morph Holesky chain ID (2810 = 0xafa)
        setError("Please switch to Morph Holesky Testnet")
        return
      }

      const gatewayContract = new web3.eth.Contract(PAYMENT_GATEWAY_ABI, PAYMENT_GATEWAY_ADDRESS)

      // Convert amount to proper decimals
      const decimalsToUse = token.decimals === 6 ? "mwei" : "ether"
      const amountWei = web3.utils.toWei(amount, decimalsToUse)
      const paymentId = web3.utils.randomHex(32)

      console.log("Amount in Wei:", amountWei)
      console.log("Payment ID:", paymentId)
      console.log("Decimals used:", decimalsToUse)

      // Double-check allowance before proceeding
      const tokenContract = new web3.eth.Contract(ERC20_ABI, token.address)
      const currentAllowance = await tokenContract.methods.allowance(account, PAYMENT_GATEWAY_ADDRESS).call()

      console.log("Current allowance:", currentAllowance)
      console.log("Required amount:", amountWei)

      if (BigInt(currentAllowance) < BigInt(amountWei)) {
        setError(`Insufficient allowance. Please approve ${token.symbol} spending first`)
        return
      }

      // Check token balance one more time
      const currentBalance = await tokenContract.methods.balanceOf(account).call()
      const formattedBalance = web3.utils.fromWei(currentBalance, decimalsToUse)

      console.log("Current token balance:", formattedBalance)

      if (BigInt(currentBalance) < BigInt(amountWei)) {
        setError(`Insufficient ${token.symbol} balance`)
        return
      }

      // Estimate gas first
      console.log("Estimating gas...")
      let gasEstimate
      try {
        gasEstimate = await gatewayContract.methods
          .payWithToken(token.address, amountWei, vendor, paymentId)
          .estimateGas({
            from: account,
          })
        console.log("Gas estimate:", gasEstimate)
      } catch (gasError) {
        console.error("Gas estimation failed:", gasError)

        // Try to get more specific error info
        if (gasError.message.includes("revert")) {
          const revertReason = gasError.message.match(/revert (.+)/)?.[1] || "Unknown error"
          setError(`Transaction would fail: ${revertReason}`)
        } else if (gasError.message.includes("TokenNotSupported")) {
          setError(`${token.symbol} is not supported by the payment gateway`)
        } else {
          setError(`Gas estimation failed: ${gasError.message}`)
        }
        return
      }

      // Send the transaction
      console.log("Sending transaction...")
      const tx = await gatewayContract.methods.payWithToken(token.address, amountWei, vendor, paymentId).send({
        from: account,
        gas: Math.floor(Number(gasEstimate) * 1.3), // Add 30% buffer
      })

      console.log("Token payment transaction:", tx)
      setTxHash(tx.transactionHash)
      setSuccess(`Payment successful! Paid ${amount} ${token.symbol}`)

      // Refresh token status with multiple attempts
      await checkTokenStatus()

      // Force refresh the parent component's token data
      setTimeout(async () => {
        await checkTokenStatus()
        // Trigger a custom event for other components to refresh
        window.dispatchEvent(new CustomEvent('tokenBalanceChanged', { 
          detail: { token: token.symbol, account } 
        }))
      }, 2000)

      // Additional refresh after 5 seconds to catch blockchain delays
      setTimeout(async () => {
        await checkTokenStatus()
      }, 5000)

      if (onSuccess) {
        onSuccess({
          txHash: tx.transactionHash,
          paymentId,
          amount,
          token: token.symbol,
          vendor,
          method: "TOKEN",
        })
      }
    } catch (err) {
      console.error("Token payment error:", err)

      // More detailed error handling
      let errorMessage = "Token payment failed"

      if (err.message.includes("insufficient funds")) {
        errorMessage = "Insufficient ETH for gas fees"
      } else if (err.message.includes("User denied") || err.message.includes("rejected")) {
        errorMessage = "Transaction was rejected by user"
      } else if (err.message.includes("TokenNotSupported")) {
        errorMessage = `${token.symbol} is not supported by the payment gateway`
      } else if (err.message.includes("PaymentTooSmall")) {
        errorMessage = "Payment amount is too small"
      } else if (err.message.includes("DailyLimitExceeded")) {
        errorMessage = "Daily payment limit exceeded"
      } else if (err.message.includes("execution reverted")) {
        const revertReason = err.message.match(/execution reverted: (.+)/)?.[1] || "Transaction reverted"
        errorMessage = `Transaction failed: ${revertReason}`
      } else if (err.code === -32603) {
        errorMessage = "Internal JSON-RPC error. Please check your transaction parameters and try again."
      } else if (err.message.includes("AbiError") || err.message.includes("Parameter decoding error")) {
        errorMessage = `Contract call failed. The token may not be supported or the contract ABI is incorrect.`
      } else {
        errorMessage = `Payment failed: ${err.message}`
      }

      setError(errorMessage)

      if (onError) {
        onError(new Error(errorMessage))
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Add address validation helper
  const isValidAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  if (!isConnected) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Please connect your wallet to use token payments</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ERC-20 Token Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token Selection */}
        <div>
          <Label htmlFor="token">Select Token</Label>
          <Select value={selectedToken} onValueChange={setSelectedToken}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SUPPORTED_TOKENS)
                .filter(([key]) => key !== "ETH")
                .map(([key, tokenInfo]) => (
                  <SelectItem key={key} value={key}>
                    {tokenInfo.symbol} - {tokenInfo.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Balance: {tokenBalance} {token.symbol} • Decimals: {token.decimals}
          </p>
        </div>

        {/* Token Support Status */}
        {isCheckingSupport && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Checking if {token.symbol} is supported by the payment gateway...</AlertDescription>
          </Alert>
        )}

        {tokenSupported === true && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>✅ {token.symbol} is supported by the payment gateway</AlertDescription>
          </Alert>
        )}

        {tokenSupported === false && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>❌ {token.symbol} is not supported by the payment gateway</p>
                <p className="text-xs">Contract address: {token.address}</p>
                <p className="text-xs">
                  The contract owner needs to call setSupportedToken({token.address}, true) to enable this token.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Amount Input */}
        <div>
          <Label htmlFor="tokenAmount">Amount ({token.symbol})</Label>
          <Input
            id="tokenAmount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Enter ${token.symbol} amount`}
            step={token.decimals === 6 ? "0.000001" : "0.000000000000000001"}
          />
        </div>

        {/* Vendor Address */}
        <div>
          <Label htmlFor="tokenVendor">Vendor Address</Label>
          <Input
            id="tokenVendor"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="0x..."
            className="font-mono text-sm"
          />
        </div>

        {/* Approval Status */}
        {needsApproval && tokenSupported === true && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>You need to approve the gateway contract to spend your {token.symbol}</p>
                <div className="flex gap-2">
                  <Button onClick={approveToken} disabled={isApproving} size="sm">
                    {isApproving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      `Approve ${token.symbol}`
                    )}
                  </Button>
                  <Button onClick={checkTokenStatus} variant="outline" size="sm" disabled={isApproving}>
                    Refresh Status
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {!needsApproval && allowance !== "0" && tokenSupported === true && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <p>✅ {token.symbol} spending approved! You can now make the payment.</p>
              <p className="text-xs mt-1">
                Approved amount: {web3?.utils.fromWei(allowance, token.decimals === 6 ? "mwei" : "ether") || "0"}{" "}
                {token.symbol}
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Button */}
        <Button
          onClick={processTokenPayment}
          disabled={
            isProcessing ||
            needsApproval ||
            !amount ||
            !vendor ||
            tokenSupported === false ||
            tokenSupported === null ||
            Number.parseFloat(amount) > Number.parseFloat(tokenBalance)
          }
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            `Pay ${amount} ${token.symbol}`
          )}
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
                <p className="font-medium text-green-700">Token Payment Successful!</p>
                
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
                        title="Open in Block Explorer"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-gray-600 break-all bg-white p-2 rounded border">
                    {txHash}
                  </div>
                </div>

                {/* Direct Link */}
                <div className="text-xs text-gray-500 border-t pt-2">
                  <p>View on Explorer: <a 
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
        
        {/* Token Info */}
        <div className="p-3 bg-gray-50 rounded-lg text-xs">
          <p className="font-medium mb-2">Token Details:</p>
          <p>Contract: {token.address}</p>
          <p>Decimals: {token.decimals}</p>
          <p>
            Your Balance: {tokenBalance} {token.symbol}
          </p>
          <p>
            Allowance: {web3?.utils.fromWei(allowance, token.decimals === 6 ? "mwei" : "ether") || "0"} {token.symbol}
          </p>
          <p>Gateway Support: {tokenSupported === null ? "Checking..." : tokenSupported ? "✅ Yes" : "❌ No"}</p>
        </div>
      </CardContent>
    </Card>
  )
}