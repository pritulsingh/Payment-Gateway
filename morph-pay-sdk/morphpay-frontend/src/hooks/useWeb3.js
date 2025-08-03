"use client"

import { useState, useEffect, useCallback } from "react"
import Web3 from "web3"

const MORPH_CHAIN_ID = "0xafa" // 2810 in hex
const MORPH_RPC_URL = "https://rpc-holesky.morphl2.io"

export function useWeb3() {
  const [mounted, setMounted] = useState(false)
  const [web3, setWeb3] = useState(null)
  const [account, setAccount] = useState("")
  const [chainId, setChainId] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState("")

  // Handle mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  const isMetaMaskInstalled = useCallback(() => {
    return mounted && typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  }, [mounted])

  const checkConnection = useCallback(async () => {
    if (!mounted || !isMetaMaskInstalled()) return

    try {
      // Only check existing connection, don't request new one
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      const currentChainId = await window.ethereum.request({ method: "eth_chainId" })

      if (accounts.length > 0) {
        setAccount(accounts[0])
        setChainId(currentChainId)
        setIsConnected(true)
      }
    } catch (err) {
      console.error("Error checking connection:", err)
    }
  }, [mounted, isMetaMaskInstalled])

  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError("MetaMask is not installed")
      return false
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

        if (currentChainId !== MORPH_CHAIN_ID) {
          await switchToMorphNetwork()
        }

        return true
      }
    } catch (err) {
      setError(err.message || "Failed to connect wallet")
      return false
    } finally {
      setIsConnecting(false)
    }
  }, [isMetaMaskInstalled])

  const switchToMorphNetwork = useCallback(async () => {
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
        } catch (addError) {
          throw new Error("Failed to add Morph Holesky Testnet")
        }
      } else {
        throw new Error("Failed to switch to Morph Holesky Testnet")
      }
    }
  }, [])

  const getBalance = useCallback(
    async (address) => {
      if (!web3 || !address) return "0"

      try {
        const balance = await web3.eth.getBalance(address)
        return web3.utils.fromWei(balance, "ether")
      } catch (err) {
        console.error("Failed to get balance:", err)
        return "0"
      }
    },
    [web3],
  )

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setIsConnected(false)
      setAccount("")
    } else {
      setAccount(accounts[0])
    }
  }

  const handleChainChanged = (newChainId) => {
    setChainId(newChainId)
  }

  useEffect(() => {
    if (!mounted) return

    const initWeb3 = async () => {
      if (isMetaMaskInstalled()) {
        const web3Instance = new Web3(window.ethereum)
        setWeb3(web3Instance)

        // Only check if already connected, don't trigger connection
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          const currentChainId = await window.ethereum.request({ method: "eth_chainId" })
          setAccount(accounts[0])
          setChainId(currentChainId)
          setIsConnected(true)
          await getBalance(accounts[0])
        }

        window.ethereum.on("accountsChanged", handleAccountsChanged)
        window.ethereum.on("chainChanged", handleChainChanged)
      }
    }

    initWeb3()

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [mounted, isMetaMaskInstalled])

  return {
    web3,
    account,
    chainId,
    isConnected,
    isConnecting,
    error,
    isMetaMaskInstalled: isMetaMaskInstalled(),
    connectWallet,
    switchToMorphNetwork,
    getBalance,
    isCorrectNetwork: chainId === MORPH_CHAIN_ID,
    mounted,
  }
}
