import React, { useState } from "react";
import { useWallet } from "../contexts/WalletContext";

interface StableCoinDonationProps {
  recipientAddress?: string;
}

// Celo Mainnet Contract Addresses
const TOKEN_ADDRESSES = {
  cUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  cEUR: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
  CELO: "0x0000000000000000000000000000000000000000",
};

const StableCoinDonation: React.FC<StableCoinDonationProps> = ({
  recipientAddress = "0x0000000000000000000000000000000000000000",
}) => {
  const { provider, account, chainId } = useWallet();
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<"CELO" | "cUSD" | "cEUR">("cUSD");
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isCelo = chainId === 42220 || chainId === 44787;

  const sendStableCoin = async () => {
    if (!provider || !account || !amount) {
      setError("Please enter a valid amount");
      return;
    }

    if (!isCelo) {
      setError("Please switch to Celo network");
      return;
    }

    try {
      setSending(true);
      setError(null);

      const amountInWei = (parseFloat(amount) * 1e18).toString(16);

      if (selectedToken === "CELO") {
        // Native CELO transfer
        const txHash = await provider.request({
          method: "eth_sendTransaction",
          params: [
            {
              to: recipientAddress,
              from: account,
              value: "0x" + amountInWei,
            },
          ],
        });
        setTxHash(txHash);
      } else {
        // ERC20 token transfer (cUSD or cEUR)
        const tokenAddress = TOKEN_ADDRESSES[selectedToken];
        
        // ERC20 transfer function signature
        const transferData = 
          "0xa9059cbb" + // transfer(address,uint256)
          recipientAddress.slice(2).padStart(64, "0") +
          amountInWei.padStart(64, "0");

        const txHash = await provider.request({
          method: "eth_sendTransaction",
          params: [
            {
              to: tokenAddress,
              from: account,
              data: transferData,
            },
          ],
        });
        setTxHash(txHash);
      }

      setAmount("");
    } catch (err: any) {
      setError(err.message || "Transaction failed");
      console.error("Donation error:", err);
    } finally {
      setSending(false);
    }
  };

  if (!account) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg text-center">
        <p className="text-gray-600">Connect your wallet to donate with stable coins</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Support with Stable Coins</h3>
      <p className="text-sm text-gray-600 mb-4">
        Donate using CELO or stable coins (cUSD, cEUR) for predictable aid budgets
      </p>

      {!isCelo && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 text-sm">
            ⚠️ Please switch to Celo network to donate
          </p>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Token
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["cUSD", "cEUR", "CELO"] as const).map((token) => (
            <button
              key={token}
              onClick={() => setSelectedToken(token)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                selectedToken === token
                  ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {token}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Donation Amount ({selectedToken})
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          disabled={sending || !isCelo}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />
        <p className="text-xs text-gray-500 mt-1">
          {selectedToken === "cUSD" || selectedToken === "cEUR"
            ? "Stable value pegged to USD/EUR"
            : "Native Celo token"}
        </p>
      </div>

      <button
        onClick={sendStableCoin}
        disabled={sending || !amount || !isCelo}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {sending ? "Sending..." : `Donate ${amount || "0"} ${selectedToken}`}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {txHash && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800 text-sm font-medium">Transaction Successful!</p>
          <a
            href={`https://explorer.celo.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm break-all"
          >
            View on Explorer: {txHash.substring(0, 10)}...
          </a>
        </div>
      )}

      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>💚 Stable coins maintain value</span>
          <span>⚡ Low fees on Celo</span>
          <span>🌍 Carbon negative</span>
        </div>
      </div>
    </div>
  );
};

export default StableCoinDonation;
