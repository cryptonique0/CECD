import React, { useState } from "react";
import { useWallet } from "../contexts/WalletContext";

interface CeloDonationProps {
  recipientAddress?: string;
}

const CeloDonation: React.FC<CeloDonationProps> = ({ 
  recipientAddress = "0x0000000000000000000000000000000000000000" // Replace with actual emergency fund address
}) => {
  const { provider, account, chainId } = useWallet();
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isCelo = chainId === 42220 || chainId === 44787;

  const sendDonation = async () => {
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

      // Convert amount to Wei (1 CELO = 10^18 Wei)
      const amountInWei = (parseFloat(amount) * 1e18).toString(16);

      const transactionParameters = {
        to: recipientAddress,
        from: account,
        value: "0x" + amountInWei,
      };

      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });

      setTxHash(txHash);
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
        <p className="text-gray-600">Connect your wallet to make a donation</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Support Emergency Response</h3>
      <p className="text-sm text-gray-600 mb-4">
        Donate CELO to support emergency coordination efforts
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
          Donation Amount (CELO)
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
      </div>

      <button
        onClick={sendDonation}
        disabled={sending || !amount || !isCelo}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {sending ? "Sending..." : "Donate"}
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
        <p className="text-xs text-gray-500">
          All donations go directly to emergency coordination efforts on the Celo blockchain.
        </p>
      </div>
    </div>
  );
};

export default CeloDonation;
