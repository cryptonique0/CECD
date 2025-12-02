import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";

interface WalletContextType {
  account: string | null;
  provider: any;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const walletConnectProvider = new WalletConnectProvider({
        rpc: {
          1: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
          137: "https://polygon-rpc.com",
        },
        qrcode: true,
      });

      await walletConnectProvider.enable();
      const accounts = await walletConnectProvider.request({ method: "eth_accounts" });
      
      setProvider(walletConnectProvider);
      setAccount(accounts[0]);

      // Listen for account changes
      walletConnectProvider.on("accountsChanged", (accounts: string[]) => {
        setAccount(accounts[0] || null);
      });

      // Listen for disconnection
      walletConnectProvider.on("disconnect", () => {
        setAccount(null);
        setProvider(null);
      });
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
      console.error("Wallet connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    if (provider) {
      provider.disconnect();
    }
    setAccount(null);
    setProvider(null);
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
