"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"        
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { CheckCircle, AlertCircle, Loader2, ExternalLink, Shield, Settings } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"
import { PAYMENT_GATEWAY_ABI, SUPPORTED_TOKENS } from "../lib/contract-config"
const PAYMENT_GATEWAY_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xaF673968bd6b1c373670c9e82bc8B9059d5037F4"
const MORPH_EXPLORER_BASE = "https://explorer.testnet.morphl2.io/tx/"

export default function AdminPanel({ web3, account, isConnected }) {
  const [isOwner, setIsOwner] = useState(false)
  const [isCheckingOwner, setIsCheckingOwner] = useState(false)
  const [contractOwner, setContractOwner] = useState("")
  const [tokenAddress, setTokenAddress] = useState("0x65aFADD39029741B3b8f0756952C74678c9cEC93") // Default to USDC
  const [isProcessing, setIsProcessing] = useState(false)
  const [txHash, setTxHash] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [supportedTokensStatus, setSupportedTokensStatus] = useState({})

  useEffect(() => {
    if (isConnected && web3 && account) {
      checkOwnership()
      checkAllTokensSupport()
    }
  }, [isConnected, web3, account])

  const checkOwnership = async () => {
    setIsCheckingOwner(true)
    try {
      const contract = new web3.eth.Contract(PAYMENT_GATEWAY_ABI, PAYMENT_GATEWAY_ADDRESS)
      const owner = await contract.methods.owner().call()
      setContractOwner(owner)
      setIsOwner(owner.toLowerCase() === account.toLowerCase())

      console.log("Contract owner:", owner)
      console.log("Current account:", account)
      console.log("Is owner:", owner.toLowerCase() === account.toLowerCase())
    } catch (err) {
      console.error("Error checking ownership:", err)
      setError("Failed to check contract ownership")
    } finally {
      setIsCheckingOwner(false)
    }
  }

  const checkAllTokensSupport = async () => {
    try {
      const contract = new web3.eth.Contract(PAYMENT_GATEWAY_ABI, PAYMENT_GATEWAY_ADDRESS)
      const status = {}

      for (const [symbol, tokenInfo] of Object.entries(SUPPORTED_TOKENS)) {
        if (symbol === "ETH") continue 
        try {
          const isSupported = await contract.methods.supportedTokens(tokenInfo.address).call()
          status[symbol] = isSupported
        } catch (err) {
          console.error(`Error checking ${symbol} support:`, err)
          status[symbol] = false
        }
      }

      setSupportedTokensStatus(status)
      console.log("Token support status:", status)
    } catch (err) {
      console.error("Error checking token support:", err)
    }
  }

  const addTokenSupport = async (address, enable = true) => {
    if (!isOwner) {
      setError("Only the contract owner can add token support")
      return
    }

    setIsProcessing(true)
    setError("")
    setSuccess("")
    setTxHash("")

    try {
      const contract = new web3.eth.Contract(PAYMENT_GATEWAY_ABI, PAYMENT_GATEWAY_ADDRESS)

      console.log(`${enable ? "Adding" : "Removing"} token support for:`, address)

      // Estimate gas
      const gasEstimate = await contract.methods.setSupportedToken(address, enable).estimateGas({
        from: account,
      })

      // Send transaction
      const tx = await contract.methods.setSupportedToken(address, enable).send({
        from: account,
        gas: Math.floor(Number(gasEstimate) * 1.2),
      })

      console.log("Token support transaction:", tx)
      setTxHash(tx.transactionHash)
      setSuccess(`Token support ${enable ? "added" : "removed"} successfully!`)

      setTimeout(() => {
        checkAllTokensSupport()
      }, 2000)
    } catch (err) {
      console.error("Error updating token support:", err)

      let errorMessage = "Failed to update token support"

      if (err.message.includes("User denied") || err.message.includes("rejected")) {
        errorMessage = "Transaction was rejected by user"
      } else if (err.message.includes("insufficient funds")) {
        errorMessage = "Insufficient ETH for gas fees"
      } else if (err.message.includes("Ownable: caller is not the owner")) {
        errorMessage = "Only the contract owner can perform this action"
      } else {
        errorMessage = `Failed to update token support: ${err.message}`
      }

      setError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const quickAddUSDC = () => {
    addTokenSupport("0x65aFADD39029741B3b8f0756952C74678c9cEC93", true)
  }

  const quickAddUSDT = () => {
    addTokenSupport("0x4022210ba16Ab225A2518D9FDBD7c90b5Fb4fF16", true)
  }

  if (!isConnected) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Please connect your wallet to access the admin panel</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Admin Panel - Token Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ownership Status */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>Contract Owner:</strong>{" "}
                {contractOwner ? `${contractOwner.slice(0, 6)}...${contractOwner.slice(-4)}` : "Loading..."}
              </p>
              <p>
                <strong>Your Account:</strong> {account.slice(0, 6)}...{account.slice(-4)}
              </p>
              <p>
                <strong>Access Level:</strong>{" "}
                {isCheckingOwner ? (
                  "Checking..."
                ) : isOwner ? (
                  <span className="text-green-600 font-medium">✅ Contract Owner</span>
                ) : (
                  <span className="text-red-600 font-medium">❌ Not Owner</span>
                )}
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Current Token Support Status */}
        <div>
          <h3 className="font-semibold mb-3">Current Token Support Status</h3>
          <div className="space-y-2">
            {Object.entries(SUPPORTED_TOKENS)
              .filter(([symbol]) => symbol !== "ETH")
              .map(([symbol, tokenInfo]) => (
                <div key={symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {symbol} - {tokenInfo.name}
                    </p>
                    <p className="text-xs text-gray-600 font-mono">{tokenInfo.address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {supportedTokensStatus[symbol] === true ? (
                      <span className="text-green-600 text-sm font-medium">✅ Supported</span>
                    ) : supportedTokensStatus[symbol] === false ? (
                      <span className="text-red-600 text-sm font-medium">❌ Not Supported</span>
                    ) : (
                      <span className="text-gray-500 text-sm">Checking...</span>
                    )}
                    {isOwner && (
                      <Button
                        size="sm"
                        variant={supportedTokensStatus[symbol] ? "destructive" : "default"}
                        onClick={() => addTokenSupport(tokenInfo.address, !supportedTokensStatus[symbol])}
                        disabled={isProcessing}
                      >
                        {supportedTokensStatus[symbol] ? "Remove" : "Add"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Quick Actions */}
        {isOwner && (
          <div>
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={quickAddUSDC}
                disabled={isProcessing || supportedTokensStatus.USDC === true}
                className="flex items-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {supportedTokensStatus.USDC === true ? "USDC Already Added" : "Add USDC Support"}
              </Button>
              <Button
                onClick={quickAddUSDT}
                disabled={isProcessing || supportedTokensStatus.USDT === true}
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {supportedTokensStatus.USDT === true ? "USDT Already Added" : "Add USDT Support"}
              </Button>
            </div>
          </div>
        )}

        {/* Manual Token Addition */}
        {isOwner && (
          <div>
            <h3 className="font-semibold mb-3">Add Custom Token</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="tokenAddress">Token Contract Address</Label>
                <Input
                  id="tokenAddress"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="0x..."
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => addTokenSupport(tokenAddress, true)}
                  disabled={isProcessing || !tokenAddress}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Add Token Support"
                  )}
                </Button>
                <Button
                  onClick={() => addTokenSupport(tokenAddress, false)}
                  disabled={isProcessing || !tokenAddress}
                  variant="destructive"
                  className="flex-1"
                >
                  Remove Token Support
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Non-Owner Message */}
        {!isOwner && !isCheckingOwner && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>You are not the contract owner. Only the owner can add token support.</p>
                <p className="text-xs">
                  To add USDC support, the contract owner ({contractOwner.slice(0, 6)}...{contractOwner.slice(-4)})
                  needs to call:
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  setSupportedToken("0x65aFADD39029741B3b8f0756952C74678c9cEC93", true)
                </code>
              </div>
            </AlertDescription>
          </Alert>
        )}

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
              <div className="space-y-2">
                <p className="font-medium">Transaction Successful!</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono">{txHash.slice(0, 20)}...</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`${MORPH_EXPLORER_BASE}${txHash}`, "_blank")}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View Transaction
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Contract Info */}
        <div className="p-3 bg-gray-50 rounded-lg text-xs">
          <p className="font-medium mb-2">Contract Information:</p>
          <p>Gateway Address: {PAYMENT_GATEWAY_ADDRESS}</p>
          <p>Owner: {contractOwner}</p>
          <p>Network: Morph Holesky Testnet</p>
        </div>
      </CardContent>
    </Card>
  )
}
