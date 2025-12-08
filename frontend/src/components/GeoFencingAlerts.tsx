import React, { useState } from 'react';
import { MapPin, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface GeoFence {
  id: string;
  name: string;
  location: string;
  radius: number;
  center: { lat: number; lng: number };
  alertLevel: 'low' | 'medium' | 'high';
  active: boolean;
  volunteers: number;
}

const GeoFencingAlerts: React.FC = () => {
  const [fences, setFences] = useState<GeoFence[]>([
    {
      id: 'gf-001',
      name: 'Downtown Risk Zone',
      location: '42.3601,-71.0589',
      radius: 2.5,
      center: { lat: 42.3601, lng: -71.0589 },
      alertLevel: 'high',
      active: true,
      volunteers: 12,
    },
    {
      id: 'gf-002',
      name: 'Harbor District',
      location: '42.3540,-71.0400',
      radius: 3.0,
      center: { lat: 42.354, lng: -71.04 },
      alertLevel: 'medium',
      active: true,
      volunteers: 8,
    },
    {
      id: 'gf-003',
      name: 'Airport Access Corridor',
      location: '42.3656,-71.0096',
      radius: 4.0,
      center: { lat: 42.3656, lng: -71.0096 },
      alertLevel: 'low',
      active: false,
      volunteers: 0,
    },
  ]);

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleFence = (id: string) => {
    setFences(
      fences.map((f) =>
        f.id === id ? { ...f, active: !f.active } : f
      )
    );
  };

  const deleteFence = (id: string) => {
    setFences(fences.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="text-cyan-600" />
          Geofencing & Location Alerts
        </h2>
        <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center gap-2">
          <Plus size={18} /> New Fence
        </button>
      </div>

      <div className="space-y-3">
        {fences.map((fence) => (
          <div key={fence.id} className="bg-white rounded-lg shadow p-4 border border-cyan-100 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{fence.name}</h3>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getAlertColor(fence.alertLevel)}`}>
                    {fence.alertLevel.toUpperCase()}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${fence.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {fence.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <MapPin size={14} /> {fence.location} (Radius: {fence.radius} km)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-gray-600">Volunteers In Zone</p>
                <p className="text-2xl font-bold text-blue-700">{fence.volunteers}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-gray-600">Coverage Area</p>
                <p className="text-2xl font-bold text-purple-700">{fence.radius} km²</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleFence(fence.id)}
                className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm ${
                  fence.active
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                {fence.active ? 'Active' : 'Inactive'}
              </button>
              <button className="flex-1 px-3 py-2 rounded-lg border border-cyan-300 text-cyan-700 hover:bg-cyan-50 font-medium text-sm">
                Edit Zone
              </button>
              <button
                onClick={() => deleteFence(fence.id)}
                className="px-3 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-100 flex items-center gap-3 text-sm text-cyan-800">
        <AlertCircle size={18} />
        Geofences trigger automatic notifications when volunteers enter/exit zones. Useful for rapid deployment.
      </div>
    </div>
  );
};

export default GeoFencingAlerts;
