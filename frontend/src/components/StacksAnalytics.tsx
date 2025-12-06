import React, { useState } from 'react';
import { useStacks } from '../contexts/StacksContext';
import { Bitcoin, TrendingUp, Users, DollarSign } from 'lucide-react';

interface StacksStats {
  totalDonations: number;
  donors: number;
  avgDonation: number;
  recentTxs: Array<{
    id: string;
    amount: number;
    donor: string;
    timestamp: string;
  }>;
}

const StacksAnalytics: React.FC = () => {
  const { isConnected, network } = useStacks();
  
  // Mock data - in production, fetch from Stacks API
  const [stats] = useState<StacksStats>({
    totalDonations: 15420.5,
    donors: 87,
    avgDonation: 177.25,
    recentTxs: [
      {
        id: '0x1234...5678',
        amount: 500,
        donor: 'SP2J6ZY...XFKK3',
        timestamp: '2024-12-06T10:30:00Z',
      },
      {
        id: '0xabcd...efgh',
        amount: 250,
        donor: 'SP3KY7H...MNOP2',
        timestamp: '2024-12-06T09:15:00Z',
      },
      {
        id: '0x9876...5432',
        amount: 1000,
        donor: 'SP1QRS8...TUVW9',
        timestamp: '2024-12-06T08:00:00Z',
      },
    ],
  });

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Bitcoin className="text-orange-500" />
        Stacks Donation Analytics
      </h3>

      {!isConnected ? (
        <div className="p-4 bg-orange-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            Connect to view Stacks donation analytics
          </p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Donations</p>
                  <p className="text-2xl font-bold">{stats.totalDonations.toLocaleString()} STX</p>
                </div>
                <DollarSign className="text-orange-600" size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Donors</p>
                  <p className="text-2xl font-bold">{stats.donors}</p>
                </div>
                <Users className="text-blue-600" size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Donation</p>
                  <p className="text-2xl font-bold">{stats.avgDonation.toFixed(2)} STX</p>
                </div>
                <TrendingUp className="text-purple-600" size={32} />
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <h4 className="font-semibold mb-3">Recent Transactions</h4>
            <div className="space-y-2">
              {stats.recentTxs.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium">{tx.amount} STX</p>
                    <p className="text-xs text-gray-600">
                      From {tx.donor}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                    <p className="text-xs font-mono text-blue-600">{tx.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Network Info */}
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Network:</span>
              <span className="font-medium capitalize">{network}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StacksAnalytics;
