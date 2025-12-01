import React from 'react';
import { useWallet } from '../contexts/WalletContext';

interface ConnectWalletButtonProps {
  className?: string;
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ className = '' }) => {
  const { isConnected, connect, disconnect, error, account } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className={`flex flex-col items-end ${className}`}>
      {isConnected && account ? (
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Disconnect ({formatAddress(account)})
        </button>
      ) : (
        <button
          onClick={connect}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Connect Wallet
        </button>
      )}
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default ConnectWalletButton;
