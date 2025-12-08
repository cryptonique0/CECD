import React, { useState } from 'react';
import { Smartphone, Download, Loader, WifiOff } from 'lucide-react';

interface MobileDeployment {
  id: string;
  version: string;
  platform: 'iOS' | 'Android';
  status: 'available' | 'beta' | 'deprecated';
  releaseDate: string;
  features: number;
  downloads: number;
  rating: number;
}

const MobileAppDeployment: React.FC = () => {
  const [deployments] = useState<MobileDeployment[]>([
    {
      id: 'app-001',
      version: '3.2.1',
      platform: 'iOS',
      status: 'available',
      releaseDate: '2025-12-01',
      features: 24,
      downloads: 12540,
      rating: 4.8,
    },
    {
      id: 'app-002',
      version: '3.2.1',
      platform: 'Android',
      status: 'available',
      releaseDate: '2025-12-01',
      features: 24,
      downloads: 18920,
      rating: 4.7,
    },
    {
      id: 'app-003',
      version: '3.3.0-beta',
      platform: 'iOS',
      status: 'beta',
      releaseDate: '2025-12-08',
      features: 28,
      downloads: 2150,
      rating: 4.6,
    },
    {
      id: 'app-004',
      version: '3.1.5',
      platform: 'Android',
      status: 'deprecated',
      releaseDate: '2025-10-15',
      features: 20,
      downloads: 8540,
      rating: 4.3,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'beta': return 'bg-blue-100 text-blue-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalDownloads = deployments.reduce((sum, d) => sum + d.downloads, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Smartphone className="text-blue-600" />
        Mobile App Deployment
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Downloads</p>
          <p className="text-3xl font-bold text-blue-700">{(totalDownloads / 1000).toFixed(1)}K</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Active Versions</p>
          <p className="text-3xl font-bold text-purple-700">2</p>
        </div>
      </div>

      <div className="space-y-3">
        {deployments.map((deployment) => (
          <div key={deployment.id} className="bg-white rounded-lg shadow p-4 border border-blue-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Smartphone className={`${deployment.platform === 'iOS' ? 'text-gray-800' : 'text-green-700'}`} size={20} />
                  <div>
                    <h3 className="font-semibold">v{deployment.version}</h3>
                    <p className="text-xs text-gray-600">{deployment.platform}</p>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(deployment.status)}`}>
                {deployment.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-3 text-sm">
              <div>
                <p className="text-gray-600 text-xs">Release</p>
                <p className="font-semibold">{deployment.releaseDate}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs">Features</p>
                <p className="font-semibold text-blue-700">{deployment.features}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs">Downloads</p>
                <p className="font-semibold text-green-700">{deployment.downloads.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs">Rating</p>
                <p className="font-semibold text-yellow-600">⭐ {deployment.rating}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 text-sm font-medium flex items-center justify-center gap-2">
                <Download size={16} /> View Details
              </button>
              {deployment.status === 'available' && (
                <button className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2">
                  <Loader size={16} className="animate-spin" /> Deploy Update
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-3 text-sm text-blue-800">
        <WifiOff size={18} />
        Mobile apps support offline mode for emergency coordination in areas with poor connectivity.
      </div>
    </div>
  );
};

export default MobileAppDeployment;
