import React, { useState } from 'react';
import { TrendingUp, DollarSign, Users, Activity } from 'lucide-react';

interface FundData {
  month: string;
  donations: number;
  contributors: number;
  allocation: {
    medical: number;
    supplies: number;
    volunteer_ops: number;
  };
}

const FundAnalyticsDashboard: React.FC = () => {
  const [fundData] = useState<FundData[]>([
    {
      month: 'January',
      donations: 15000,
      contributors: 125,
      allocation: { medical: 5000, supplies: 6000, volunteer_ops: 4000 },
    },
    {
      month: 'February',
      donations: 22000,
      contributors: 180,
      allocation: { medical: 8000, supplies: 8000, volunteer_ops: 6000 },
    },
    {
      month: 'March',
      donations: 18500,
      contributors: 160,
      allocation: { medical: 6500, supplies: 7000, volunteer_ops: 5000 },
    },
    {
      month: 'April',
      donations: 25000,
      contributors: 210,
      allocation: { medical: 9000, supplies: 9000, volunteer_ops: 7000 },
    },
  ]);

  const [selectedMonth, setSelectedMonth] = useState(fundData[fundData.length - 1]);

  const totalDonations = fundData.reduce((sum, d) => sum + d.donations, 0);
  const totalContributors = fundData[fundData.length - 1].contributors;
  const avgDonation = totalDonations / totalContributors;

  const allocationTotal = selectedMonth.allocation.medical + 
                         selectedMonth.allocation.supplies + 
                         selectedMonth.allocation.volunteer_ops;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-2">
        <TrendingUp className="text-green-600" />
        Fund Analytics Dashboard
      </h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Donations</p>
              <p className="text-2xl font-bold">${totalDonations.toLocaleString()}</p>
            </div>
            <DollarSign className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Contributors</p>
              <p className="text-2xl font-bold">{totalContributors}</p>
            </div>
            <Users className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Donation</p>
              <p className="text-2xl font-bold">${avgDonation.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            </div>
            <Activity className="text-purple-600" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Month</p>
              <p className="text-2xl font-bold">${selectedMonth.donations.toLocaleString()}</p>
            </div>
            <TrendingUp className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Donation Trend Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Donation Trends</h3>
        <div className="flex items-end justify-around h-64 gap-4">
          {fundData.map((data, idx) => {
            const maxDonation = Math.max(...fundData.map(d => d.donations));
            const height = (data.donations / maxDonation) * 100;
            return (
              <div
                key={idx}
                className="flex flex-col items-center gap-2 flex-1"
                onClick={() => setSelectedMonth(data)}
                style={{ cursor: 'pointer' }}
              >
                <div className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                     style={{ height: `${height}%` }} />
                <p className="text-sm font-medium">{data.month}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fund Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Current Month Allocation</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Medical Services</span>
                <span className="text-sm font-bold">${selectedMonth.allocation.medical}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${(selectedMonth.allocation.medical / allocationTotal) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Supplies & Equipment</span>
                <span className="text-sm font-bold">${selectedMonth.allocation.supplies}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${(selectedMonth.allocation.supplies / allocationTotal) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Volunteer Operations</span>
                <span className="text-sm font-bold">${selectedMonth.allocation.volunteer_ops}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(selectedMonth.allocation.volunteer_ops / allocationTotal) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Donor Statistics</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-green-600 pl-4 py-2">
              <p className="text-sm text-gray-600">Monthly Contributors</p>
              <p className="text-2xl font-bold">{selectedMonth.contributors}</p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4 py-2">
              <p className="text-sm text-gray-600">Avg Donation Amount</p>
              <p className="text-2xl font-bold">${(selectedMonth.donations / selectedMonth.contributors).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            </div>
            <div className="border-l-4 border-purple-600 pl-4 py-2">
              <p className="text-sm text-gray-600">Total Allocated</p>
              <p className="text-2xl font-bold">${allocationTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Monthly Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Month</th>
                <th className="text-right py-2">Donations</th>
                <th className="text-right py-2">Contributors</th>
                <th className="text-right py-2">Medical</th>
                <th className="text-right py-2">Supplies</th>
                <th className="text-right py-2">Operations</th>
              </tr>
            </thead>
            <tbody>
              {fundData.map((data, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-2">{data.month}</td>
                  <td className="text-right">${data.donations.toLocaleString()}</td>
                  <td className="text-right">{data.contributors}</td>
                  <td className="text-right">${data.allocation.medical.toLocaleString()}</td>
                  <td className="text-right">${data.allocation.supplies.toLocaleString()}</td>
                  <td className="text-right">${data.allocation.volunteer_ops.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FundAnalyticsDashboard;
