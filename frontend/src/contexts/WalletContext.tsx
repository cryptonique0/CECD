import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import WalletConnectProvider from '@walletconnect/web3-provider';

interface WalletContextType {
  account: string | null;
  provider: any;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    try {
      setError(null);
      const wcProvider = new WalletConnectProvider({
        rpc: {
          1: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID", // Replace with your RPC URL
          137: "https://polygon-rpc.com", // Polygon
          56: "https://bsc-dataseed.binance.org/", // BSC
        },
        qrcode: true,
      });

      await wcProvider.enable();
      const accounts = await wcProvider.request({ method: "eth_accounts" });
      
      setProvider(wcProvider);
      setAccount(accounts[0]);
      setIsConnected(true);

      // Listen for account changes
      wcProvider.on("accountsChanged", (accounts: string[]) => {
        setAccount(accounts[0] || null);
      });

      // Listen for disconnection
      wcProvider.on("disconnect", () => {
        handleDisconnect();
      });

    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
      console.error("Wallet connection error:", err);
    }
  };

  const handleDisconnect = () => {
    setAccount(null);
    setProvider(null);
    setIsConnected(false);
  };

  const disconnect = async () => {
    try {
      if (provider) {
        await provider.disconnect();
      }
      handleDisconnect();
    } catch (err: any) {
      setError(err.message || "Failed to disconnect wallet");
      console.error("Wallet disconnection error:", err);
    }
  };

  const value: WalletContextType = {
    account,
    provider,
    isConnected,
    connect,
    disconnect,
    error,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
