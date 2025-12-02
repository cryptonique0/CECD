import React, { useEffect, useState } from "react";
import { useWallet } from "../contexts/WalletContext";

const WalletInfo: React.FC = () => {
  const { account, chainId, error, getBalance, switchToCelo } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (account) {
        const bal = await getBalance();
        setBalance(bal);
      }
    };
    fetchBalance();
  }, [account, chainId]);

  if (error) {
    return (
      <div className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm">
        Error: {error}
      </div>
    );
  }

  if (!account) {
    return null;
  }

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getChainName = (id: number | null) => {
    switch (id) {
      case 42220:
        return "Celo";
      case 44787:
        return "Celo Alfajores";
      case 1:
        return "Ethereum";
      case 137:
        return "Polygon";
      default:
        return "Unknown";
    }
  };

  const isCelo = chainId === 42220 || chainId === 44787;

  return (
    <div className="flex items-center gap-2">
      <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
        <div className="flex flex-col">
          <span>Connected: {shortenAddress(account)}</span>
          {balance && <span className="text-xs">Balance: {balance} {getChainName(chainId)}</span>}
          <span className="text-xs text-green-600">Network: {getChainName(chainId)}</span>
        </div>
      </div>
      {!isCelo && (
        <button
          onClick={switchToCelo}
          className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-xs hover:bg-yellow-600 transition-colors"
        >
          Switch to Celo
        </button>
      )}
    </div>
  );
};

export default WalletInfo;
