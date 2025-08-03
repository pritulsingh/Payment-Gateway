"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"        
import { Button } from "./ui/button"
import { Alert, AlertDescription } from "./ui/alert"
import { Copy, Smartphone, CheckCircle } from "lucide-react"
import {
  Check, 
  ExternalLink 
} from "lucide-react"
export default function QRCodeGenerator({ amount, vendor, chainId = 2810 }) {
  const [qrData, setQrData] = useState("")
  const [qrImage, setQrImage] = useState("")
  const [copied, setCopied] = useState(false)
const [txHash, setTxHash] = useState("");
const [copiedHash, setCopiedHash] = useState(false);
  useEffect(() => {
    if (amount && vendor) {
      generateQRCode()
    }
  }, [amount, vendor])

  const generateQRCode = async () => {
    try {
      // Create the Ethereum URI for QR code
      const amountWei = Number.parseFloat(amount) * Math.pow(10, 18) // Convert to Wei
      const qrURI = `ethereum:${vendor}@${chainId}?value=${amountWei.toString()}`
      setQrData(qrURI)

      // Generate QR code image using a QR code API
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrURI)}`
      setQrImage(qrImageUrl)
    } catch (err) {
      console.error("Error generating QR code:", err)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrData)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  if (!qrData) {
    return (
      <Alert>
        <Smartphone className="h-4 w-4" />
        <AlertDescription>Enter amount and vendor address to generate QR code</AlertDescription>
      </Alert>
    )
  }
  // In QRCodeGenerator component, add these functions:
const openTransactionInExplorer = (hash) => {
  const primaryUrl = `https://explorer-holesky.morphl2.io/tx/${hash}`;
  
  try {
    const newWindow = window.open(primaryUrl, '_blank');
    
    if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
      navigator.clipboard.writeText(primaryUrl).then(() => {
        // Show success message in QR component
        console.log('Explorer link copied to clipboard!');
      }).catch(() => {
        console.log(`Could not open explorer. Visit: ${primaryUrl}`);
      });
    }
  } catch (err) {
    console.error('Failed to open explorer:', err);
  }
}

const copyHashToClipboard = async (hash) => {
  try {
    await navigator.clipboard.writeText(hash)
    // Show copied feedback
  } catch (err) {
    console.error('Failed to copy hash:', err)
  }
}

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Mobile QR Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          {qrImage && (
            <div className="inline-block p-4 bg-white rounded-lg border">
              <img src={qrImage || "/placeholder.svg"} alt="Payment QR Code" className="w-48 h-48" />
            </div>
          )}
        </div>

        <Alert>
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Scan with mobile wallet to pay:</p>
              <p className="text-sm">• Amount: {amount} ETH</p>
              <p className="text-sm">
                • To: {vendor.slice(0, 6)}...{vendor.slice(-4)}
              </p>
              <p className="text-sm">• Network: Morph Holesky (Chain ID: {chainId})</p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <p className="text-sm font-medium">Payment URI:</p>
          <div className="flex gap-2">
            <div className="flex-1 p-2 bg-gray-100 rounded text-xs font-mono break-all">{qrData}</div>
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <Alert>
          <AlertDescription className="text-xs">
            <strong>Note:</strong> QR codes work best with mobile wallets like MetaMask Mobile, Trust Wallet, or
            Rainbow. Make sure your mobile wallet supports Morph Holesky Testnet.
          </AlertDescription>
        </Alert>
        {txHash && (
          <Alert className="mt-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="font-medium text-green-700">Mobile Payment Detected!</p>
                
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

                {/* Direct Link */}
                <div className="text-xs text-gray-500 border-t pt-2">
                  <p>Direct link: <a 
                    href={`${props.explorerBase}${txHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline font-mono break-all"
                  >
                    {props.explorerBase}{txHash}
                  </a></p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
