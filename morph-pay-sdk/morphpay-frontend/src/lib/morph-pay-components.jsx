import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, CheckCircle, AlertCircle, ExternalLink, Smartphone, Monitor } from 'lucide-react';
import QRCode from 'qrcode.react';
import Web3 from 'web3';

const MORPH_CHAIN_ID_HEX = '0xafa'; // 2810 in hex (lowercase)
const MORPH_EXPLORER_BASE = 'https://explorer.testnet.morphl2.io/tx/';

const MorphPaySDK = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('browser');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [paymentType, setPaymentType] = useState('ETH');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [qrData, setQrData] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const connectWallet = async () => {
    try {
      setError('');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });

      if (chainId !== MORPH_CHAIN_ID_HEX) {
        throw new Error('Please switch to Morph Holesky Testnet (Chain ID: 2810)');
      }

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        await getBalance(accounts[0]);
        setSuccess('Wallet connected successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const getBalance = async (address) => {
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      const ethBalance = parseInt(balance, 16) / 1e18;
      setBalance(ethBalance.toFixed(4));
    } catch (err) {
      console.error('Failed to get balance:', err);
    }
  };

  const toWeiHex = (val) => '0x' + Math.floor(parseFloat(val) * 1e18).toString(16);

  const generateQRCode = useCallback(() => {
    if (!amount || !recipient || paymentType !== 'ETH') return;

    const ethAmountWei = Web3.utils.toWei(amount, 'ether');
    const qrURI = `ethereum:${recipient}@2810?value=${ethAmountWei}`;
    setQrData(qrURI);
  }, [amount, recipient, paymentType]);

  const processPayment = async () => {
    if (!isConnected || !amount || !recipient) {
      setError('Please fill in all required fields and connect your wallet');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== MORPH_CHAIN_ID_HEX) {
        throw new Error('Wrong network. Please switch to Morph Holesky (Chain ID: 2810)');
      }

      let txParams;

      if (paymentType === 'ETH') {
        txParams = {
          from: account,
          to: recipient,
          value: toWeiHex(amount),
          gas: '0x5208',
        };
      } else {
        const tokenAmount = toWeiHex(amount);
        const transferData = `0xa9059cbb${recipient.slice(2).padStart(64, '0')}${tokenAmount.slice(2).padStart(64, '0')}`;

        txParams = {
          from: account,
          to: tokenAddress,
          data: transferData,
          gas: '0x13880',
        };
      }

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      setTxHash(txHash);
      setSuccess('Payment successful!');
      setAmount('');
      setRecipient('');
      setTokenAddress('');
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyQRData = () => {
    navigator.clipboard.writeText(qrData);
    setSuccess('QR code data copied to clipboard!');
  };

  useEffect(() => {
    if (paymentMethod === 'mobile') {
      generateQRCode();
    }
  }, [paymentMethod, generateQRCode]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">MorphPay SDK</h1>
        <p className="text-gray-600">Pay with ETH and tokens via browser wallet or mobile QR scan</p>
      </div>

      {/* Payment Method */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
        <div className="flex space-x-4">
          <button onClick={() => setPaymentMethod('browser')} className={`flex items-center px-4 py-2 rounded-lg ${paymentMethod === 'browser' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            <Monitor className="w-4 h-4 mr-2" />
            Browser Wallet
          </button>
          <button onClick={() => setPaymentMethod('mobile')} className={`flex items-center px-4 py-2 rounded-lg ${paymentMethod === 'mobile' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            <Smartphone className="w-4 h-4 mr-2" />
            Mobile QR
          </button>
        </div>
      </div>

      {/* Wallet Connection */}
      {paymentMethod === 'browser' && (
        <div className="mb-6">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">Browser Wallet Connection</h3>
            {!isConnected ? (
              <button onClick={connectWallet} className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="font-medium">Connected</span>
                </div>
                <p className="text-sm text-gray-600">Account: {account.slice(0, 6)}...{account.slice(-4)}</p>
                <p className="text-sm text-gray-600">Balance: {balance} ETH</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
          <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
            <option value="ETH">ETH</option>
            <option value="TOKEN">ERC-20 Token</option>
          </select>
        </div>

        {paymentType === 'TOKEN' && paymentMethod === 'browser' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Token Contract Address</label>
            <input type="text" value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} placeholder="0x..." className="w-full p-2 border rounded-lg" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" step="0.001" className="w-full p-2 border rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Address</label>
          <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x..." className="w-full p-2 border rounded-lg" />
        </div>
      </div>

      {/* Action Button or QR */}
      {paymentMethod === 'browser' ? (
        <button onClick={processPayment} disabled={!isConnected || isProcessing || !amount || !recipient} className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600">
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </button>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Mobile Wallet QR Code</h3>
          {qrData ? (
            <>
              <div className="flex justify-center my-4">
                <QRCode value={qrData} size={192} />
              </div>
              <button onClick={copyQRData} className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg">Copy QR Data</button>
            </>
          ) : (
            <p className="text-sm text-gray-500">Only ETH QR payments are supported. Fill amount and recipient.</p>
          )}
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          {success}
        </div>
      )}
      {txHash && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg">
          <div className="flex justify-between items-center">
            <span>Transaction Hash:</span>
            <button onClick={() => window.open(`${MORPH_EXPLORER_BASE}${txHash}`, '_blank')} className="text-blue-600 hover:underline flex items-center">
              <ExternalLink className="w-4 h-4 mr-1" />
              View
            </button>
          </div>
          <p className="text-xs break-all mt-1">{txHash}</p>
        </div>
      )}
    </div>
  );
};
export default MorphPaySDK;
