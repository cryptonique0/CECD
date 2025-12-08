import React, { useMemo } from 'react';
import { Coins, Send, TrendingUp, ShieldCheck } from 'lucide-react';
import { useGrantData } from '../hooks/useCeloData';

const CeloGrantDisbursement: React.FC = () => {
  const { data: grants = [] } = useGrantData();

  const totals = useMemo(() => {
    const approved = grants.filter((g) => g.status === 'approved').reduce((sum, g) => sum + g.amount, 0);
    const sent = grants.filter((g) => g.status === 'sent' || g.status === 'settled').reduce((sum, g) => sum + g.amount, 0);
    return { approved, sent };
  }, [grants]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'sent':
        return 'bg-yellow-100 text-yellow-800';
      case 'settled':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Coins className="text-emerald-600" />
          Celo Grant Disbursement
        </h3>
        <div className="flex gap-2 text-sm">
          <div className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full">Approved: {totals.approved.toLocaleString()} cUSD</div>
          <div className="px-3 py-1 bg-green-50 text-green-800 rounded-full">Sent/Settled: {totals.sent.toLocaleString()} cUSD</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {grants.map((grant) => (
          <div key={grant.id} className="p-4 bg-white rounded-lg shadow space-y-3 border border-emerald-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">{grant.id}</p>
                <h4 className="text-lg font-semibold">{grant.project}</h4>
                <p className="text-sm text-gray-600">Recipient: {grant.recipient}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusColor(grant.status)}`}>
                {grant.status.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="font-semibold text-emerald-700">
                {grant.amount.toLocaleString()} {grant.currency}
              </div>
              <div className="text-gray-600">Deadline: {grant.deadline}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm">
                <Send size={16} /> Send Now
              </button>
              <button className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-sm">
                <ShieldCheck size={16} /> Add Safeguards
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-100 flex items-center gap-3 text-sm text-gray-700">
        <TrendingUp className="text-emerald-600" size={18} />
        Track approved vs sent disbursements and enforce on-chain safeguards for transparency.
      </div>
    </div>
  );
};

export default CeloGrantDisbursement;
