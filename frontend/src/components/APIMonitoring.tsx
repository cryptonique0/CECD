import React, { useState } from 'react';
import { Network, Shield, RefreshCw, Zap } from 'lucide-react';

interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  uptime: number;
  lastCheck: string;
}

const APIMonitoring: React.FC = () => {
  const [endpoints] = useState<APIEndpoint[]>([
    {
      id: 'api-001',
      name: 'Incident Management API',
      url: '/api/incidents',
      status: 'healthy',
      latency: 45,
      uptime: 99.98,
      lastCheck: '10 seconds ago',
    },
    {
      id: 'api-002',
      name: 'Volunteer Coordination API',
      url: '/api/volunteers',
      status: 'healthy',
      latency: 62,
      uptime: 99.91,
      lastCheck: '12 seconds ago',
    },
    {
      id: 'api-003',
      name: 'Resource Tracking API',
      url: '/api/resources',
      status: 'degraded',
      latency: 320,
      uptime: 98.5,
      lastCheck: '8 seconds ago',
    },
    {
      id: 'api-004',
      name: 'Celo Blockchain API',
      url: 'https://forno.celo.org/',
      status: 'healthy',
      latency: 150,
      uptime: 99.99,
      lastCheck: '5 seconds ago',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'down': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const avgLatency = (endpoints.reduce((sum, e) => sum + e.latency, 0) / endpoints.length).toFixed(0);
  const avgUptime = (endpoints.reduce((sum, e) => sum + e.uptime, 0) / endpoints.length).toFixed(2);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Network className="text-teal-600" />
        API Monitoring & Health
      </h2>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Healthy</p>
          <p className="text-3xl font-bold text-green-700">3</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Degraded</p>
          <p className="text-3xl font-bold text-yellow-700">1</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Avg Latency</p>
          <p className="text-3xl font-bold text-blue-700">{avgLatency}ms</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Avg Uptime</p>
          <p className="text-3xl font-bold text-purple-700">{avgUptime}%</p>
        </div>
      </div>

      <div className="space-y-3">
        {endpoints.map((endpoint) => (
          <div key={endpoint.id} className="bg-white rounded-lg shadow p-4 border border-teal-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield size={18} className="text-teal-600" />
                  {endpoint.name}
                </h3>
                <p className="text-sm text-gray-600 font-mono mt-1">{endpoint.url}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(endpoint.status)}`}>
                {endpoint.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <Zap className="text-orange-600" size={18} />
                <div>
                  <p className="text-xs text-gray-600">Latency</p>
                  <p className="text-lg font-bold">{endpoint.latency}ms</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600">Uptime</p>
                <p className="text-lg font-bold text-green-700">{endpoint.uptime}%</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Last Check</p>
                <p className="text-sm font-semibold">{endpoint.lastCheck}</p>
              </div>
            </div>

            {endpoint.status !== 'healthy' && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex items-center gap-2">
                <RefreshCw size={14} />
                System is monitoring. Attempting recovery...
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default APIMonitoring;
