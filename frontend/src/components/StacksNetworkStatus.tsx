import React, { useState } from 'react';
import { useStacks } from '../contexts/StacksContext';
import { Bitcoin, Power, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { STACKS_NETWORK } from '../lib/stacks-config';

const StacksNetworkStatus: React.FC = () => {
  const { address, network, isConnected, connect, disconnect, switchNetwork } = useStacks();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect to Stacks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const networkConfig = STACKS_NETWORK[network];

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Bitcoin className="text-orange-500" />
          Stacks Network (BTC L2)
        </h3>
        {isConnected ? (
          <CheckCircle2 className="text-green-600" size={24} />
        ) : (
          <AlertCircle className="text-gray-400" size={24} />
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
          <span className="text-sm font-medium">Network</span>
          <div className="flex items-center gap-2">
            <select
              value={network}
              onChange={(e) => switchNetwork(e.target.value as 'mainnet' | 'testnet')}
              className="px-3 py-1 text-sm border rounded-lg"
              disabled={!isConnected}
            >
              <option value="testnet">Testnet</option>
              <option value="mainnet">Mainnet</option>
            </select>
          </div>
        </div>

        {isConnected && address ? (
          <>
            <div className="p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Connected Address</span>
                <a
                  href={`${networkConfig.explorer}/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
              <p className="text-xs font-mono bg-white p-2 rounded break-all">
                {address}
              </p>
            </div>

            <button
              onClick={disconnect}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <Power size={18} />
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
            <Bitcoin size={18} />
            {isLoading ? 'Connecting...' : 'Connect Stacks Wallet'}
          </button>
        )}
      </div>

      <div className="pt-3 border-t space-y-2">
        <h4 className="font-semibold text-sm">About Stacks</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>✓ Bitcoin Layer 2 for smart contracts</li>
          <li>✓ Secured by Bitcoin's proof-of-work</li>
          <li>✓ Clarity smart contract language</li>
          <li>✓ Native BTC integration via sBTC</li>
          <li>✓ Decentralized and trustless</li>
        </ul>
      </div>
    </div>
  );
};

export default StacksNetworkStatus;
