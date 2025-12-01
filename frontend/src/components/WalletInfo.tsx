import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

const WalletInfo: React.FC = () => {
  const { account, isConnected, provider } = useWallet();
  const [balance, setBalance] = useState<string>('0');
  const [chainId, setChainId] = useState<number | null>(null);

  useEffect(() => {
    const fetchWalletInfo = async () => {
      if (isConnected && provider && account) {
        try {
          // Get balance
          const balanceHex = await provider.request({
            method: 'eth_getBalance',
            params: [account, 'latest'],
          });
          const balanceWei = parseInt(balanceHex, 16);
          const balanceEth = (balanceWei / 1e18).toFixed(4);
          setBalance(balanceEth);

          // Get chain ID
          const chainIdHex = await provider.request({ method: 'eth_chainId' });
          setChainId(parseInt(chainIdHex, 16));
        } catch (error) {
          console.error('Error fetching wallet info:', error);
        }
      }
    };

    fetchWalletInfo();
  }, [isConnected, provider, account]);

  const getNetworkName = (id: number | null) => {
    const networks: { [key: number]: string } = {
      1: 'Ethereum Mainnet',
      137: 'Polygon',
      56: 'Binance Smart Chain',
      5: 'Goerli Testnet',
      80001: 'Mumbai Testnet',
    };
    return id ? networks[id] || `Chain ID: ${id}` : 'Unknown';
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      alert('Address copied to clipboard!');
    }
  };

  if (!isConnected || !account) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 max-w-md">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        Wallet Information
      </h3>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Address:</span>
          <button
            onClick={copyAddress}
            className="text-sm font-mono text-blue-600 dark:text-blue-400 hover:underline"
          >
            {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Balance:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {balance} ETH
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Network:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {getNetworkName(chainId)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WalletInfo;
