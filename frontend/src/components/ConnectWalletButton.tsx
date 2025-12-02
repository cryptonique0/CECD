import React from "react";
import { useWallet } from "../contexts/WalletContext";

const ConnectWalletButton: React.FC = () => {
  const { account, isConnecting, connectWallet, disconnectWallet } = useWallet();

  return (
    <button
      onClick={account ? disconnectWallet : connectWallet}
      disabled={isConnecting}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isConnecting ? "Connecting..." : account ? "Disconnect" : "Connect Wallet"}
    </button>
  );
};

export default ConnectWalletButton;
