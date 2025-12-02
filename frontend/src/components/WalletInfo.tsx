import React from "react";
import { useWallet } from "../contexts/WalletContext";

const WalletInfo: React.FC = () => {
  const { account, error } = useWallet();

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

  return (
    <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
      Connected: {shortenAddress(account)}
    </div>
  );
};

export default WalletInfo;
