import React from 'react';
import { Leaf, Recycle, Gauge } from 'lucide-react';

const CeloCarbonAnalytics: React.FC = () => {
  const metrics = [
    { label: 'Offset Purchased', value: '42.5 tons', detail: 'Retired via Toucan/Refi partners' },
    { label: 'Renewable Coverage', value: '78%', detail: 'Transactions powered by green mix' },
    { label: 'Per-Donation Footprint', value: '0.12 kg CO2', detail: 'Avg. on-chain transaction footprint' },
    { label: 'Communities Served', value: '18', detail: 'Regions benefiting from green deployments' },
  ];

  const initiatives = [
    { name: 'Solar Microgrids', impact: '12 sites live', co2: '6.1t avoided / mo' },
    { name: 'Clean Water', impact: '5 filtration hubs', co2: '1.9t avoided / mo' },
    { name: 'Cold-Chain Vaccines', impact: '9 fridges deployed', co2: '0.8t avoided / mo' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Leaf className="text-emerald-600" />
        Celo Carbon & Impact
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="p-4 bg-white rounded-lg shadow border border-emerald-100">
            <p className="text-sm text-gray-600">{m.label}</p>
            <p className="text-2xl font-bold text-emerald-700">{m.value}</p>
            <p className="text-xs text-gray-500 mt-1">{m.detail}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-4 border border-emerald-100 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Recycle className="text-emerald-600" size={18} />
          Current ReFi projects on Celo
        </div>
        <div className="divide-y divide-gray-100">
          {initiatives.map((i) => (
            <div key={i.name} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold">{i.name}</p>
                <p className="text-xs text-gray-500">{i.impact}</p>
              </div>
              <span className="text-sm font-bold text-emerald-700">{i.co2}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-emerald-50 to-amber-50 rounded-lg border border-emerald-100 flex items-center gap-3 text-sm text-gray-700">
        <Gauge className="text-emerald-600" size={18} />
        Celo is carbon-negative; track offsets and renewable coverage to keep operations green.
      </div>
    </div>
  );
};

export default CeloCarbonAnalytics;
