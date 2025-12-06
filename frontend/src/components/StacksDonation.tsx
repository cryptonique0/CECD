import React, { useState } from 'react';
import { useStacks } from '../contexts/StacksContext';
import { openContractCall } from '@stacks/connect';
import { 
  uintCV, 
  stringAsciiCV, 
  PostConditionMode,
  AnchorMode,
} from '@stacks/transactions';
import { Bitcoin, Send, Loader2 } from 'lucide-react';
import { STACKS_CONTRACTS, STACKS_NETWORK } from '../lib/stacks-config';

const StacksDonation: React.FC = () => {
  const { address, network, isConnected, userSession } = useStacks();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);

  const handleDonate = async () => {
    if (!isConnected || !address || !amount || !userSession) {
      return;
    }

    setIsProcessing(true);
    setTxId(null);

    try {
      const amountMicroStx = Math.floor(parseFloat(amount) * 1_000_000);
      const contractAddress = STACKS_CONTRACTS[network].donation;
      const [addr, contractName] = contractAddress.split('.');

      const options = {
        network: network === 'mainnet' ? 'mainnet' : 'testnet',
        anchorMode: AnchorMode.Any,
        contractAddress: addr,
        contractName: contractName,
        functionName: 'donate-stx',
        functionArgs: [
          uintCV(amountMicroStx),
          stringAsciiCV(message || 'Emergency response donation'),
        ],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data: any) => {
          setTxId(data.txId);
          setAmount('');
          setMessage('');
          setIsProcessing(false);
        },
        onCancel: () => {
          setIsProcessing(false);
        },
      };

      await openContractCall(options);
    } catch (error) {
      console.error('Donation failed:', error);
      setIsProcessing(false);
    }
  };

  const networkConfig = STACKS_NETWORK[network];

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Bitcoin className="text-orange-500" />
        Donate STX
      </h3>

      {!isConnected ? (
        <div className="p-4 bg-orange-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            Connect your Stacks wallet to donate
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Amount (STX)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              step="0.000001"
              min="0"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={isProcessing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Support message..."
              rows={3}
              maxLength={100}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={isProcessing}
            />
          </div>

          <button
            onClick={handleDonate}
            disabled={isProcessing || !amount || parseFloat(amount) <= 0}
            className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 font-medium flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Processing...
              </>
            ) : (
              <>
                <Send size={18} />
                Donate STX
              </>
            )}
          </button>

          {txId && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-1">
                Transaction Submitted!
              </p>
              <a
                href={`${networkConfig.explorer}/txid/${txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 break-all"
              >
                View on Explorer →
              </a>
            </div>
          )}
        </div>
      )}

      <div className="pt-3 border-t">
        <h4 className="font-semibold text-sm mb-2">Why Donate with Stacks?</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>✓ Secured by Bitcoin's security</li>
          <li>✓ Fast and low-cost transactions</li>
          <li>✓ Transparent on-chain records</li>
          <li>✓ Direct peer-to-peer support</li>
        </ul>
      </div>
    </div>
  );
};

export default StacksDonation;
