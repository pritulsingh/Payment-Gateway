// TEMPORARY SOLUTION: Replace the useWeb3 hook with direct wallet logic
"use client"
import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Wallet, CheckCircle, AlertCircle } from "lucide-react"

const MORPH_CHAIN_ID = "0xafa" // 2810 in hex

export default function WalletConnectButton({
  className = "",
  size = "default",
  variant = "default", 
  showStatus = true,
}) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [account, setAccount] = useState("")
  const [chainId, setChainId] = useState("")
  const [mounted, setMounted] = useState(false)

  const isCorrectNetwork = chainId === MORPH_CHAIN_ID

  useEffect(() => {
    setMounted(true)
    
    // ONLY check silently if already connected - NO POPUP
    const checkExistingConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // eth_accounts does NOT trigger popup
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setAccount(accounts[0])
            setIsConnected(true)
            const currentChainId = await window.ethereum.request({ method: "eth_chainId" })
            setChainId(currentChainId)
          }
        } catch (err) {
          console.error("Error checking existing connection:", err)
        }
      }
    }

    checkExistingConnection()

    // Set up event listeners
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setIsConnected(false)
          setAccount("")
        } else {
          setAccount(accounts[0])
          setIsConnected(true)
        }
      }

      const handleChainChanged = (newChainId) => {
        setChainId(newChainId)
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("MetaMask is not installed!")
      return
    }

    setIsConnecting(true)

    try {
      // THIS triggers the popup - only when user clicks
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      
      if (accounts.length > 0) {
        setAccount(accounts[0])
        setIsConnected(true)
        const currentChainId = await window.ethereum.request({ method: "eth_chainId" })
        setChainId(currentChainId)
        
        if (currentChainId !== MORPH_CHAIN_ID) {
          // Try to switch to Morph network
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: MORPH_CHAIN_ID }],
            })
          } catch (switchError) {
            if (switchError.code === 4902) {
              // Add the network if it doesn't exist
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [{
                  chainId: MORPH_CHAIN_ID,
                  chainName: "Morph Holesky Testnet",
                  nativeCurrency: {
                    name: "ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: ["https://rpc-holesky.morphl2.io"],
                  blockExplorerUrls: ["https://explorer-holesky.morphl2.io/"],
                }],
              })
            }
          }
        }
      }
    } catch (err) {
      console.error("Connection failed:", err)
    } finally {
      setIsConnecting(false)
    }
  }

  if (!mounted) {
    return null
  }

  if (isConnected && showStatus) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-800">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
          {!isCorrectNetwork && <AlertCircle className="w-4 h-4 text-orange-500" />}
        </div>
      </div>
    )
  }

  return (
    <Button onClick={connectWallet} disabled={isConnecting} variant={variant} size={size} className={className}>
      <Wallet className="w-4 h-4 mr-2" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}