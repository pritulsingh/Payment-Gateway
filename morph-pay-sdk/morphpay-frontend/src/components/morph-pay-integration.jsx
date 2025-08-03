"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, ExternalLink, Loader2 } from "lucide-react"
import { useWeb3 } from "@/hooks/useWeb3"

const GATEWAY_ADDRESS = "0xaF673968bd6B1c373670c9e82bc8B9059d5037F4"
const MORPH_EXPLORER_BASE = "https://explorer.testnet.morphl2.io/tx/"

const GATEWAY_ABI = [
  {
    inputs: [
      { name: "vendor", type: "address" },
      { name: "paymentId", type: "bytes32" },
    ],
    name: "payWithETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
]

export default function MorphPayIntegration({
  vendor = "0xA2a5E26000b8FBFA4f35264E405613F567155064",
  amount = "0.01",
  onSuccess,
  onError,
  onClose,
}) {
  const { web3, account, isConnected, connectWallet, isCorrectNetwork } = useWeb3()
  const [isProcessing, setIsProcessing] = useState(false)
  const [txHash, setTxHash] = useState("")
  const [error, setError] = useState("")

  const handlePayment = async () => {
    if (!isConnected) {
      const connected = await connectWallet()
      if (!connected) return
    }

    if (!isCorrectNetwork) {
      setError("Please switch to Morph Holesky Testnet")
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      const gateway = new web3.eth.Contract(GATEWAY_ABI, GATEWAY_ADDRESS)
      const paymentId = web3.utils.randomHex(32)
      const amountWei = web3.utils.toWei(amount, "ether")

      const tx = await gateway.methods.payWithETH(vendor, paymentId).send({
        from: account,
        value: amountWei,
        gas: 100000,
      })

      setTxHash(tx.transactionHash)

      if (onSuccess) {
        onSuccess({
          txHash: tx.transactionHash,
          paymentId,
          amount,
          vendor,
          method: "ETH",
        })
      }
    } catch (err) {
      const errorMessage = err.message || "Payment failed"
      setError(errorMessage)

      if (onError) {
        onError(new Error(errorMessage))
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            MorphPay
            <Badge variant="secondary">Morph Holesky</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payment Details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Amount:</span>
              <span className="font-mono">{amount} ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>To:</span>
              <span className="font-mono">
                {vendor.slice(0, 6)}...{vendor.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Network:</span>
              <span>Morph Holesky</span>
            </div>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <Alert>
              <AlertDescription>Connect your wallet to continue with the payment</AlertDescription>
            </Alert>
          )}

          {isConnected && !isCorrectNetwork && (
            <Alert variant="destructive">
              <AlertDescription>Please switch to Morph Holesky Testnet (Chain ID: 2810)</AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {txHash && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Payment Successful!</p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-xs"
                    onClick={() => window.open(`${MORPH_EXPLORER_BASE}${txHash}`, "_blank")}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View Transaction
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent" disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={isProcessing} className="flex-1">
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${amount} ETH`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
