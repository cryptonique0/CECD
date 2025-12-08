import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Clock, Eye, Coins } from 'lucide-react';

interface PayoutTransaction {
  id: string;
  grantId: string;
  amount: number;
  currency: 'cUSD' | 'cEUR';
  recipient: string;
  status: 'draft' | 'signing' | 'pending' | 'confirmed' | 'error';
  txHash?: string;
  timestamp?: string;
  error?: string;
}

const CeloGrantPayment: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutTransaction[]>([
    {
      id: 'payout-1',
      grantId: 'G-1042',
      amount: 12500,
      currency: 'cUSD',
      recipient: '0x9f1...b27',
      status: 'confirmed',
      txHash: '0x7a9f8e2c1d...5b42',
      timestamp: '2025-12-08 14:32 UTC',
    },
    {
      id: 'payout-2',
      grantId: 'G-1043',
      amount: 8200,
      currency: 'cUSD',
      recipient: '0x7a2...cd3',
      status: 'pending',
      txHash: '0x4c2a9f8e1d...9e15',
      timestamp: '2025-12-08 13:15 UTC',
    },
  ]);

  const [newPayout, setNewPayout] = useState({
    grantId: 'G-1044',
    amount: 5600,
    recipient: '0x44a...91c',
  });

  const [selectedPayout, setSelectedPayout] = useState<PayoutTransaction | null>(null);

  const handleInitiatePayout = async () => {
    const draft: PayoutTransaction = {
      id: `payout-${Date.now()}`,
      grantId: newPayout.grantId,
      amount: newPayout.amount,
      currency: 'cUSD',
      recipient: newPayout.recipient,
      status: 'draft',
    };
    setPayouts([draft, ...payouts]);
    setNewPayout({ grantId: '', amount: 0, recipient: '' });
  };

  const handleSignAndSend = async (payout: PayoutTransaction) => {
    // Simulate signing and sending
    const updated = payouts.map((p) =>
      p.id === payout.id
        ? { ...p, status: 'signing' as const }
        : p
    );
    setPayouts(updated);

    // Simulate transaction
    setTimeout(() => {
      const finalUpdated = payouts.map((p) =>
        p.id === payout.id
          ? {
              ...p,
              status: 'pending' as const,
              txHash: '0x' + Math.random().toString(16).slice(2, 18),
              timestamp: new Date().toLocaleString('en-US', { timeZone: 'UTC' }) + ' UTC',
            }
          : p
      );
      setPayouts(finalUpdated);
    }, 2000);
  };

  const handleConfirmTransaction = async (txHash: string) => {
    // Simulate waiting for confirmations
    const updated = payouts.map((p) =>
      p.txHash === txHash
        ? { ...p, status: 'confirmed' as const }
        : p
    );
    setPayouts(updated);
  };

  const getStatusIcon = (status: PayoutTransaction['status']) => {
    switch (status) {
      case 'draft':
        return <AlertCircle className="text-gray-500" size={18} />;
      case 'signing':
        return <Clock className="text-yellow-600 animate-spin" size={18} />;
      case 'pending':
        return <Clock className="text-blue-600 animate-pulse" size={18} />;
      case 'confirmed':
        return <CheckCircle className="text-green-600" size={18} />;
      case 'error':
        return <AlertCircle className="text-red-600" size={18} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: PayoutTransaction['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'signing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Coins className="text-emerald-600" />
        Celo Grant Payout Flows
      </h3>

      {/* Initiate New Payout */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4 border border-emerald-100">
        <h4 className="font-semibold text-lg">Initiate New Payout</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grant ID</label>
            <input
              type="text"
              value={newPayout.grantId}
              onChange={(e) => setNewPayout({ ...newPayout, grantId: e.target.value })}
              placeholder="G-XXXX"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (cUSD)</label>
            <input
              type="number"
              value={newPayout.amount}
              onChange={(e) => setNewPayout({ ...newPayout, amount: parseFloat(e.target.value) })}
              placeholder="0.00"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Address</label>
            <input
              type="text"
              value={newPayout.recipient}
              onChange={(e) => setNewPayout({ ...newPayout, recipient: e.target.value })}
              placeholder="0x..."
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        <button
          onClick={handleInitiatePayout}
          className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold flex items-center justify-center gap-2"
        >
          <Send size={18} /> Create Payout Draft
        </button>
      </div>

      {/* Payout History & Status */}
      <div className="space-y-3">
        <h4 className="font-semibold text-lg">Payout History</h4>
        {payouts.map((payout) => (
          <div
            key={payout.id}
            className="bg-white rounded-lg shadow p-4 border border-emerald-100 space-y-3 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedPayout(payout)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {getStatusIcon(payout.status)}
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {payout.grantId} → {payout.recipient}
                    </p>
                    <p className="text-xs text-gray-600">
                      {payout.amount.toLocaleString()} {payout.currency}
                    </p>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(payout.status)}`}>
                {payout.status.toUpperCase()}
              </span>
            </div>

            {/* Action Buttons by Status */}
            {payout.status === 'draft' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSignAndSend(payout);
                }}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Sign & Send Transaction
              </button>
            )}

            {payout.status === 'pending' && payout.txHash && (
              <div className="flex items-center justify-between gap-2 p-3 bg-blue-50 rounded-lg text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Eye size={16} />
                  <span className="font-mono text-xs">{payout.txHash}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConfirmTransaction(payout.txHash!);
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                >
                  Mark Confirmed
                </button>
              </div>
            )}

            {payout.status === 'confirmed' && (
              <div className="p-3 bg-green-50 rounded-lg text-sm">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle size={16} />
                  <span>
                    Confirmed at {payout.timestamp}
                  </span>
                </div>
                <p className="text-xs text-gray-600 font-mono mt-1">{payout.txHash}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payout Details Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Coins className="text-emerald-600" />
              Payout Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">ID:</span><span className="font-mono">{selectedPayout.id}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Grant:</span><span className="font-semibold">{selectedPayout.grantId}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Amount:</span><span className="font-semibold text-emerald-700">{selectedPayout.amount} {selectedPayout.currency}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Recipient:</span><span className="font-mono text-xs">{selectedPayout.recipient}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Status:</span><span className={`px-2 py-1 text-xs font-bold rounded ${getStatusColor(selectedPayout.status)}`}>{selectedPayout.status.toUpperCase()}</span></div>
              {selectedPayout.txHash && (
                <div className="flex justify-between"><span className="text-gray-600">Tx Hash:</span><span className="font-mono text-xs truncate">{selectedPayout.txHash}</span></div>
              )}
              {selectedPayout.timestamp && (
                <div className="flex justify-between"><span className="text-gray-600">Sent:</span><span className="text-xs">{selectedPayout.timestamp}</span></div>
              )}
            </div>
            <button
              onClick={() => setSelectedPayout(null)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CeloGrantPayment;
