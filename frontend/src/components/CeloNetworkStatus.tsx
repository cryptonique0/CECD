import React, { useState, useEffect } from "react";
import { useWallet } from "../contexts/WalletContext";

interface CeloNetworkStatusProps {
  showDetails?: boolean;
}

const CeloNetworkStatus: React.FC<CeloNetworkStatusProps> = ({ showDetails = true }) => {
  const { chainId, provider } = useWallet();
  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  const [gasPrice, setGasPrice] = useState<string | null>(null);

  const isCelo = chainId === 42220 || chainId === 44787;

  useEffect(() => {
    const fetchNetworkInfo = async () => {
      if (!provider || !isCelo) return;

      try {
        const block = await provider.request({
          method: "eth_blockNumber",
          params: [],
        });
        setBlockNumber(parseInt(block, 16));

        const gas = await provider.request({
          method: "eth_gasPrice",
          params: [],
        });
        const gasPriceGwei = (parseInt(gas, 16) / 1e9).toFixed(2);
        setGasPrice(gasPriceGwei);
      } catch (err) {
        console.error("Error fetching network info:", err);
      }
    };

    fetchNetworkInfo();
    const interval = setInterval(fetchNetworkInfo, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, [provider, isCelo]);

  if (!isCelo) {
    return null;
  }

  const networkName = chainId === 42220 ? "Celo Mainnet" : "Celo Alfajores Testnet";
  const explorerUrl = chainId === 42220 
    ? "https://explorer.celo.org" 
    : "https://alfajores.celoscan.io";

  return (
    <div className="p-4 bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg border border-green-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-semibold text-green-800">{networkName}</span>
        </div>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline"
        >
          Explorer ↗
        </a>
      </div>

      {showDetails && (
        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
          {blockNumber && (
            <div>
              <p className="text-gray-600 text-xs">Latest Block</p>
              <p className="font-mono font-medium text-green-800">{blockNumber.toLocaleString()}</p>
            </div>
          )}
          {gasPrice && (
            <div>
              <p className="text-gray-600 text-xs">Gas Price</p>
              <p className="font-mono font-medium text-green-800">{gasPrice} Gwei</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-green-200">
        <p className="text-xs text-gray-600">
          🌱 Celo is a carbon-negative blockchain designed for mobile-first financial inclusion
        </p>
      </div>
    </div>
  );
};

export default CeloNetworkStatus;
