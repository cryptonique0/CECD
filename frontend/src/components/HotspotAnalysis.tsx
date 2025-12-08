import React, { useState } from 'react';
import { MapPin, AlertCircle, Clock } from 'lucide-react';

interface HotspotAlert {
  id: string;
  location: string;
  incidents: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  lastUpdate: string;
}

const HotspotAnalysis: React.FC = () => {
  const [hotspots] = useState<HotspotAlert[]>([
    {
      id: '1',
      location: 'Downtown Market District',
      incidents: 12,
      severity: 'high',
      lastUpdate: '5 mins ago',
    },
    {
      id: '2',
      location: 'Harbor Zone East',
      incidents: 8,
      severity: 'medium',
      lastUpdate: '15 mins ago',
    },
    {
      id: '3',
      location: 'Industrial Area West',
      incidents: 5,
      severity: 'low',
      lastUpdate: '2 hours ago',
    },
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-900';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-900';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-900';
      case 'low':
        return 'bg-green-100 border-green-300 text-green-900';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-900';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <MapPin className="text-red-600" />
        Incident Hotspots
      </h3>

      <div className="space-y-3">
        {hotspots.map((hotspot) => (
          <div
            key={hotspot.id}
            className={`border rounded-lg p-4 ${getSeverityColor(hotspot.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold flex items-center gap-2">
                  <MapPin size={18} />
                  {hotspot.location}
                </h4>
                <p className="text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={16} />
                  {hotspot.incidents} incidents
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase font-bold">{hotspot.severity}</span>
                <p className="text-xs mt-1 flex items-center gap-1 justify-end">
                  <Clock size={14} />
                  {hotspot.lastUpdate}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t text-sm text-gray-600">
        <p>Monitor high-risk areas for faster response coordination</p>
      </div>
    </div>
  );
};

export default HotspotAnalysis;
