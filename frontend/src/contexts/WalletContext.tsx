import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";

interface WalletContextType {
  account: string | null;
  provider: any;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToCelo: () => Promise<void>;
  getBalance: () => Promise<string | null>;
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
  const [chainId, setChainId] = useState<number | null>(null);
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
          42220: "https://forno.celo.org", // Celo Mainnet
          44787: "https://alfajores-forno.celo-testnet.org", // Celo Alfajores Testnet
        },
        chainId: 42220, // Default to Celo Mainnet
        qrcode: true,
      });

      await walletConnectProvider.enable();
      const accounts = await walletConnectProvider.request({ method: "eth_accounts" });
      const network = await walletConnectProvider.request({ method: "eth_chainId" });
      
      setProvider(walletConnectProvider);
      setAccount(accounts[0]);
      setChainId(parseInt(network, 16));

      // Listen for account changes
      walletConnectProvider.on("accountsChanged", (accounts: string[]) => {
        setAccount(accounts[0] || null);
      });

      // Listen for chain changes
      walletConnectProvider.on("chainChanged", (chainId: string) => {
        setChainId(parseInt(chainId, 16));
      });

      // Listen for disconnection
      walletConnectProvider.on("disconnect", () => {
        setAccount(null);
        setProvider(null);
        setChainId(null);
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
    setChainId(null);
  };

  const switchToCelo = async () => {
    if (!provider) {
      setError("No wallet connected");
      return;
    }

    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xA4EC" }], // 42220 in hex (Celo Mainnet)
      });
    } catch (switchError: any) {
      // Chain not added to wallet, add it
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xA4EC",
                chainName: "Celo Mainnet",
                nativeCurrency: {
                  name: "CELO",
                  symbol: "CELO",
                  decimals: 18,
                },
                rpcUrls: ["https://forno.celo.org"],
                blockExplorerUrls: ["https://explorer.celo.org"],
              },
            ],
          });
        } catch (addError: any) {
          setError("Failed to add Celo network");
          console.error("Add network error:", addError);
        }
      } else {
        setError("Failed to switch to Celo network");
        console.error("Switch network error:", switchError);
      }
    }
  };

  const getBalance = async (): Promise<string | null> => {
    if (!provider || !account) return null;

    try {
      const balance = await provider.request({
        method: "eth_getBalance",
        params: [account, "latest"],
      });
      // Convert from Wei to CELO/ETH
      const balanceInEth = (parseInt(balance, 16) / 1e18).toFixed(4);
      return balanceInEth;
    } catch (err) {
      console.error("Error fetching balance:", err);
      return null;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        chainId,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
        switchToCelo,
        getBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
