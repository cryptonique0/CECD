import React, { useState } from 'react';
import { Activity, Heart, AlertTriangle, User } from 'lucide-react';

interface HealthVital {
  id: string;
  volunteerId: string;
  volunteerName: string;
  heartRate: number;
  oxygenLevel: number;
  temperature: number;
  lastReading: string;
  status: 'normal' | 'warning' | 'critical';
}

const WearableHealthMonitoring: React.FC = () => {
  const [vitals] = useState<HealthVital[]>([
    {
      id: 'vit-001',
      volunteerId: 'V-042',
      volunteerName: 'Alice Johnson',
      heartRate: 72,
      oxygenLevel: 98,
      temperature: 36.8,
      lastReading: '2 minutes ago',
      status: 'normal',
    },
    {
      id: 'vit-002',
      volunteerId: 'V-051',
      volunteerName: 'Bob Smith',
      heartRate: 95,
      oxygenLevel: 94,
      temperature: 37.2,
      lastReading: '1 minute ago',
      status: 'warning',
    },
    {
      id: 'vit-003',
      volunteerId: 'V-088',
      volunteerName: 'Carol White',
      heartRate: 115,
      oxygenLevel: 89,
      temperature: 38.5,
      lastReading: 'just now',
      status: 'critical',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Activity className="text-red-600" />
        Wearable Health Monitoring
      </h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Normal Status</p>
          <p className="text-3xl font-bold text-green-700">142</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Warning Alerts</p>
          <p className="text-3xl font-bold text-yellow-700">8</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Critical Alerts</p>
          <p className="text-3xl font-bold text-red-700">2</p>
        </div>
      </div>

      <div className="space-y-3">
        {vitals.map((vital) => (
          <div key={vital.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <User className="text-gray-600" size={18} />
                  <div>
                    <h3 className="font-semibold">{vital.volunteerName}</h3>
                    <p className="text-xs text-gray-500">{vital.volunteerId}</p>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(vital.status)}`}>
                {vital.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="p-3 bg-red-50 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 text-red-700 font-bold mb-1">
                  <Heart size={16} /> HR
                </div>
                <p className="text-2xl font-bold text-red-800">{vital.heartRate}</p>
                <p className="text-xs text-gray-600">bpm</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <div className="text-blue-700 font-bold mb-1">O2</div>
                <p className="text-2xl font-bold text-blue-800">{vital.oxygenLevel}%</p>
                <p className="text-xs text-gray-600">SpO2</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg text-center">
                <div className="text-orange-700 font-bold mb-1">Temp</div>
                <p className="text-2xl font-bold text-orange-800">{vital.temperature}°C</p>
                <p className="text-xs text-gray-600">body</p>
              </div>
            </div>

            <p className="text-xs text-gray-500">Last reading: {vital.lastReading}</p>

            {vital.status === 'critical' && (
              <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg flex items-center gap-2 text-red-800 text-sm">
                <AlertTriangle size={18} />
                Medical assistance required. Contact emergency services.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WearableHealthMonitoring;
