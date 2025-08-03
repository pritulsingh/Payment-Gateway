// TokenMintComponent.jsx
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"        
import { Button } from "./ui/button"
import { Alert, AlertDescription } from "./ui/alert"
import { CheckCircle, AlertCircle, Coins, ExternalLink, Copy } from "lucide-react"

// ERC20 ABI with mintTo function for your MockUSDT/MockUSDC contracts
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{"name": "to", "type": "address"}],
    "name": "mintTo",
    "outputs": [],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "_user", "type": "address"}],
    "name": "lastMinted",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  }
];

const USDT_ADDRESS = process.env.NEXT_PUBLIC_USDT_ADDRESS || "0x3Cd1994D86E59d731969a392ab12D6F7e05f21F8";
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || "0xF5a9c115661d413A53128c368977FF44A5a9270C";
const MORPH_EXPLORER_BASE = "https://explorer.testnet.morphl2.io/tx/";
const MORPH_CHAIN_ID = "0xafa"; // Morph Holesky chain ID
const MINT_COOLDOWN = 86400; // 24 hours in seconds
const MINT_AMOUNT = 1000;

export default function TokenMintComponent({ web3, account, isConnected, chainId }) {
  const [tokenData, setTokenData] = useState({
    USDT: { balance: '0', decimals: 6, lastMinted: 0, symbol: 'USDT', name: 'Mock USDT' },
    USDC: { balance: '0', decimals: 18, lastMinted: 0, symbol: 'USDC', name: 'USD Coin' }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingToken, setLoadingToken] = useState('');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState('');
  // Add this useEffect to listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      console.log('Received refresh event, reloading token data...');
      loadTokenData();
    };

    window.addEventListener('refreshTokenBalances', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshTokenBalances', handleRefresh);
    };
  }, [web3, account, isConnected]);
  // Load token balances and last minted times
  const loadTokenData = async () => {
    if (!web3 || !account || !isConnected) return;

    try {
      const usdtContract = new web3.eth.Contract(ERC20_ABI, USDT_ADDRESS);
      const usdcContract = new web3.eth.Contract(ERC20_ABI, USDC_ADDRESS);
      
      // Load data sequentially with error handling for each call
      let usdtData = {
        balance: '0',
        decimals: 6,
        lastMinted: 0,
        symbol: 'USDT',
        name: 'Mock USDT'
      };
      
      let usdcData = {
        balance: '0',
        decimals: 18,
        lastMinted: 0,
        symbol: 'USDC',
        name: 'USD Coin'
      };

      try {
        // Load USDT data
        const usdtBalance = await usdtContract.methods.balanceOf(account).call();
        const usdtDecimals = await usdtContract.methods.decimals().call();
        
        // Try to get lastMinted, fall back to 0 if method doesn't exist
        let usdtLastMint = 0;
        try {
          usdtLastMint = await usdtContract.methods.lastMinted(account).call();
        } catch (e) {
          console.warn('lastMinted method not available for USDT contract');
        }

        // Try to get name and symbol, fall back to defaults
        let usdtName = 'Mock USDT';
        let usdtSymbol = 'USDT';
        try {
          usdtName = await usdtContract.methods.name().call();
          usdtSymbol = await usdtContract.methods.symbol().call();
        } catch (e) {
          console.warn('name/symbol methods not available for USDT contract');
        }

        usdtData = {
          balance: (Number(usdtBalance) / (10 ** Number(usdtDecimals))).toFixed(Number(usdtDecimals)),
          decimals: Number(usdtDecimals),
          lastMinted: Number(usdtLastMint),
          symbol: usdtSymbol,
          name: usdtName
        };
      } catch (error) {
        console.error('Error loading USDT data:', error);
      }

      try {
        // Load USDC data
        const usdcBalance = await usdcContract.methods.balanceOf(account).call();
        const usdcDecimals = await usdcContract.methods.decimals().call();
        
        // Try to get lastMinted, fall back to 0 if method doesn't exist
        let usdcLastMint = 0;
        try {
          usdcLastMint = await usdcContract.methods.lastMinted(account).call();
        } catch (e) {
          console.warn('lastMinted method not available for USDC contract');
        }

        // Try to get name and symbol, fall back to defaults
        let usdcName = 'USD Coin';
        let usdcSymbol = 'USDC';
        try {
          usdcName = await usdcContract.methods.name().call();
          usdcSymbol = await usdcContract.methods.symbol().call();
        } catch (e) {
          console.warn('name/symbol methods not available for USDC contract');
        }

        usdcData = {
          balance: (Number(usdcBalance) / (10 ** Number(usdcDecimals))).toFixed(Number(usdcDecimals) === 6 ? 6 : 8), // Use appropriate decimals          decimals: Number(usdcDecimals),
          lastMinted: Number(usdcLastMint),
          symbol: usdcSymbol,
          name: usdcName
        };
      } catch (error) {
        console.error('Error loading USDC data:', error);
      }
      
      setTokenData({
        USDT: usdtData,
        USDC: usdcData
      });

      // Clear any previous errors if data loaded successfully
      setError('');
    } catch (error) {
      console.error('Error loading token data:', error);
      setError(`Failed to load token data: ${error.message}`);
    }
  };

  // Load token data when connected
  useEffect(() => {
    if (isConnected && web3 && account) {
      loadTokenData();
      // Set up interval to refresh data every 30 seconds
      const interval = setInterval(loadTokenData, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, web3, account]);

  // Check if user can mint (24 hours since last mint)
  const canMint = (lastMintTime) => {
    if (lastMintTime === 0) return true; // Never minted before
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = currentTime - lastMintTime;
    return timeDiff >= MINT_COOLDOWN;
  };

  // Get time remaining until next mint
  const getTimeUntilNextMint = (lastMintTime) => {
    if (lastMintTime === 0) return 0;
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = currentTime - lastMintTime;
    const remaining = MINT_COOLDOWN - timeDiff;
    return remaining > 0 ? remaining : 0;
  };

  // Format time remaining
  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return "Available now";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Copy address to clipboard
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Mint tokens
  const mintTokens = async (tokenType) => {
    if (!isConnected || !web3 || !account) {
      setError('Please connect your wallet first!');
      return;
    }

    if (chainId !== MORPH_CHAIN_ID) {
      setError('Please switch to Morph Holesky Testnet to mint tokens');
      return;
    }

    const tokenInfo = tokenData[tokenType];
    if (!canMint(tokenInfo.lastMinted)) {
      const remaining = getTimeUntilNextMint(tokenInfo.lastMinted);
      setError(`You can only mint once per day. Next ${tokenType} mint available in ${formatTimeRemaining(remaining)}`);
      return;
    }

    setIsLoading(true);
    setLoadingToken(tokenType);
    setError('');
    setSuccess('');
    setTxHash('');
    
    try {
      const contractAddress = tokenType === 'USDT' ? USDT_ADDRESS : USDC_ADDRESS;
      const contract = new web3.eth.Contract(ERC20_ABI, contractAddress);
      
      // Check if mintTo method exists
      try {
        // Estimate gas first to check if method exists
        const gasEstimate = await contract.methods.mintTo(account).estimateGas({
          from: account
        });
        
        // Call mintTo function
        const tx = await contract.methods.mintTo(account).send({
          from: account,
          gas: Math.floor(Number(gasEstimate) * 1.2) // Add 20% buffer
        });
        
        setTxHash(tx.transactionHash);
        setSuccess(`Successfully minted ${MINT_AMOUNT} ${tokenType} tokens! (Daily limit)`);
        
        // Reload token data after a short delay - multiple attempts to ensure update
        setTimeout(async () => {
          await loadTokenData();
          // Second attempt after 3 more seconds to catch any delayed updates
          setTimeout(async () => {
            await loadTokenData();
          }, 3000);
        }, 2000);
        
      } catch (methodError) {
        if (methodError.message.includes('mintTo')) {
          setError(`The ${tokenType} contract does not support the mintTo function. Please check the contract implementation.`);
        } else {
          throw methodError;
        }
      }
      
    } catch (error) {
      console.error('Error minting tokens:', error);
      
      if (error.message.includes('User denied') || error.message.includes('rejected')) {
        setError('Transaction was rejected by user');
      } else if (error.message.includes('Can only mint once per day')) {
        setError(`You can only mint ${tokenType} once per day. Please wait 24 hours.`);
      } else if (error.message.includes('insufficient funds')) {
        setError('Insufficient ETH for gas fees');
      } else if (error.message.includes('execution reverted')) {
        setError(`Contract execution failed. You may have already minted today or the contract has restrictions.`);
      } else {
        setError(`Minting failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
      setLoadingToken('');
    }
  };

  // Check if on correct network
  const isCorrectNetwork = chainId === MORPH_CHAIN_ID;

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5" />
          Test Token Daily Faucet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        {!isConnected && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to access the token faucet
            </AlertDescription>
          </Alert>
        )}

        {/* Network Check */}
        {isConnected && !isCorrectNetwork && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please switch to Morph Holesky Testnet (Chain ID: {MORPH_CHAIN_ID}) to use the faucet
            </AlertDescription>
          </Alert>
        )}

        {/* Token Balances */}
        {isConnected && isCorrectNetwork && (
          <div className="grid md:grid-cols-2 gap-4">
            {/* USDT Card */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-green-800">USDT Balance</h3>
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                  {tokenData.USDT.decimals} decimals
                </span>
              </div>
              <p className="text-2xl font-bold text-green-900">{tokenData.USDT.balance}</p>
              <p className="text-green-600 text-sm mb-2">{tokenData.USDT.name}</p>
              <p className="text-xs text-green-700">
                <span className="font-medium">Next mint:</span>{' '}
                {canMint(tokenData.USDT.lastMinted) 
                  ? "✅ Available now" 
                  : `⏰ ${formatTimeRemaining(getTimeUntilNextMint(tokenData.USDT.lastMinted))}`}
              </p>
            </div>
            
            {/* USDC Card */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-blue-800">USDC Balance</h3>
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                  {tokenData.USDC.decimals} decimals
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{tokenData.USDC.balance}</p>
              <p className="text-blue-600 text-sm mb-2">{tokenData.USDC.name}</p>
              <p className="text-xs text-blue-700">
                <span className="font-medium">Next mint:</span>{' '}
                {canMint(tokenData.USDC.lastMinted) 
                  ? "✅ Available now" 
                  : `⏰ ${formatTimeRemaining(getTimeUntilNextMint(tokenData.USDC.lastMinted))}`}
              </p>
            </div>
          </div>
        )}

        {/* Faucet Information */}
        {isConnected && isCorrectNetwork && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">🚰 Daily Token Faucet</h3>
            <div className="space-y-1 text-sm text-yellow-700">
              <p>• Get <strong>{MINT_AMOUNT} tokens</strong> per day for each token type</p>
              <p>• <strong>24-hour cooldown</strong> period between mints</p>
              <p>• Perfect for testing your dApp with realistic amounts</p>
              <p>• USDT uses 6 decimals, USDC uses 18 decimals (like mainnet)</p>
            </div>
            <p className="text-xs text-yellow-600 mt-2 font-medium">
              ⚠️ Test tokens only • Morph Holesky Testnet • No real value
            </p>
          </div>
        )}

        {/* Mint Buttons */}
        {isConnected && isCorrectNetwork && (
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={() => mintTokens('USDT')}
              disabled={isLoading || !canMint(tokenData.USDT.lastMinted)}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 h-14 text-base font-semibold"
            >
              {isLoading && loadingToken === 'USDT' ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Minting USDT...
                </div>
              ) : canMint(tokenData.USDT.lastMinted) ? (
                <div className="text-center">
                  <div>🪙 Mint {MINT_AMOUNT} USDT</div>
                  <div className="text-xs opacity-90">({tokenData.USDT.decimals} decimals)</div>
                </div>
              ) : (
                <div className="text-center text-sm">
                  <div>USDT Cooldown</div>
                  <div className="text-xs">{formatTimeRemaining(getTimeUntilNextMint(tokenData.USDT.lastMinted))}</div>
                </div>
              )}
            </Button>
            
            <Button
              onClick={() => mintTokens('USDC')}
              disabled={isLoading || !canMint(tokenData.USDC.lastMinted)}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 h-14 text-base font-semibold"
            >
              {isLoading && loadingToken === 'USDC' ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Minting USDC...
                </div>
              ) : canMint(tokenData.USDC.lastMinted) ? (
                <div className="text-center">
                  <div>🪙 Mint {MINT_AMOUNT} USDC</div>
                  <div className="text-xs opacity-90">({tokenData.USDC.decimals} decimals)</div>
                </div>
              ) : (
                <div className="text-center text-sm">
                  <div>USDC Cooldown</div>
                  <div className="text-xs">{formatTimeRemaining(getTimeUntilNextMint(tokenData.USDC.lastMinted))}</div>
                </div>
              )}
            </Button>
            {/* Manual Refresh Button */}
            <div className="flex justify-center mt-4">
              <Button
                onClick={loadTokenData}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="text-xs"
              >
                🔄 Refresh Balances
              </Button>
            </div>
          </div>
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

        {/* Transaction Hash */}
        {txHash && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">✅ Transaction Successful!</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`${MORPH_EXPLORER_BASE}${txHash}`, "_blank")}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View on Explorer
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Contract Addresses */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            📋 Contract Information
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
              <div>
                <span className="font-medium text-green-800">USDT Contract:</span>
                <div className="text-xs text-green-600">{tokenData.USDT.decimals} decimals • Daily faucet</div>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                  {USDT_ADDRESS.slice(0, 6)}...{USDT_ADDRESS.slice(-4)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(USDT_ADDRESS, 'USDT')}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                {copied === 'USDT' && (
                  <span className="text-xs text-green-600">Copied!</span>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded border border-blue-200">
              <div>
                <span className="font-medium text-blue-800">USDC Contract:</span>
                <div className="text-xs text-blue-600">{tokenData.USDC.decimals} decimals • Daily faucet</div>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                  {USDC_ADDRESS.slice(0, 6)}...{USDC_ADDRESS.slice(-4)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(USDC_ADDRESS, 'USDC')}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                {copied === 'USDC' && (
                  <span className="text-xs text-blue-600">Copied!</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-600">
            <p className="font-medium mb-1">Network: Morph Holesky Testnet</p>
            <p>⚠️ Test tokens only • {MINT_AMOUNT} tokens per day limit • 24h cooldown</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}