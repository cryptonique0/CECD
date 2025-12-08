import React from 'react';
import { Activity, Shield, Wifi, Link2 } from 'lucide-react';
import { useValidatorHealth } from '../hooks/useCeloData';

const CeloValidatorHealth: React.FC = () => {
  const { data: validators = [] } = useValidatorHealth();

  const statusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'down':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Activity className="text-emerald-600" />
        Celo Validator Health
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {validators.map((v) => (
          <div key={v.id} className="p-4 bg-white rounded-lg shadow border border-emerald-100 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">{v.id}</p>
                <p className="text-lg font-semibold">{v.name}</p>
                <p className="text-xs text-gray-600">{v.location}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusColor(v.status)}`}>
                {v.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-green-700 font-semibold">
                <Shield size={16} /> Uptime {v.uptime}%
              </span>
              <span className="flex items-center gap-1 text-gray-700">
                <Wifi size={16} /> {v.latency} ms
              </span>
            </div>
            <button className="w-full text-sm mt-1 px-3 py-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 flex items-center justify-center gap-2">
              <Link2 size={16} /> View Attestations
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CeloValidatorHealth;
