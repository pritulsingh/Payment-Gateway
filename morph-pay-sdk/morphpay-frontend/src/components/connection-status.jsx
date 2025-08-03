"use client"

import { CheckCircle, AlertCircle, Wifi, WifiOff } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"
import { useWeb3 } from "../hooks/useWeb3"
import WalletConnectButton from "./wallet-connect-button"

export default function ConnectionStatus({ showConnectButton = true }) {
  const { isConnected, account, balance, chainId, isCorrectNetwork, isMetaMaskInstalled, mounted } = useWeb3()

  if (!mounted) {
    return (
      <Alert>
        <Wifi className="h-4 w-4" />
        <AlertDescription>Loading wallet status...</AlertDescription>
      </Alert>
    )
  }

  if (!isMetaMaskInstalled) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          MetaMask is required. Please install MetaMask browser extension to continue.
          <a
            href="https://metamask.io"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-600 hover:underline"
          >
            Install MetaMask
          </a>
        </AlertDescription>
      </Alert>
    )
  }

  if (!isConnected) {
    return (
      <Alert>
        <WifiOff className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>Connect your wallet to continue</span>
            {showConnectButton && <WalletConnectButton size="sm" />}
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className={isCorrectNetwork ? "" : "border-orange-200 bg-orange-50"}>
      <CheckCircle className={`h-4 w-4 ${isCorrectNetwork ? "text-green-600" : "text-orange-600"}`} />
      <AlertDescription>
        <div className="space-y-2">
          <div className="flex items-center text-green-600">
            <span className="text-sm font-medium">Wallet Connected</span>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <p>
              <strong>Account:</strong> {account.slice(0, 6)}...{account.slice(-4)}
            </p>
            <p>
              <strong>ETH Balance:</strong> {balance} ETH
            </p>
            <p>
              <strong>Network:</strong>{" "}
              {isCorrectNetwork ? (
                <span className="text-green-600">Morph Holesky ✅</span>
              ) : (
                <span className="text-orange-600">Wrong Network ❌</span>
              )}
            </p>
          </div>
          {!isCorrectNetwork && (
            <p className="text-xs text-orange-600 mt-2">Please switch to Morph Holesky Testnet (Chain ID: 2810)</p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
