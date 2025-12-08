import React, { useState } from 'react';
import { MapPin, AlertTriangle, Users, Clock, CheckCircle } from 'lucide-react';

interface EvacuationSite {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentOccupancy: number;
  status: 'available' | 'full' | 'closing';
  amenities: string[];
  staffCount: number;
}

const EvacuationCenterManagement: React.FC = () => {
  const [sites, setSites] = useState<EvacuationSite[]>([
    {
      id: 'evac-001',
      name: 'City Convention Center',
      location: 'Downtown District',
      capacity: 5000,
      currentOccupancy: 3240,
      status: 'available',
      amenities: ['Beds', 'Medical', 'Food', 'Showers', 'WiFi'],
      staffCount: 45,
    },
    {
      id: 'evac-002',
      name: 'University Sports Complex',
      location: 'Campus North',
      capacity: 3000,
      currentOccupancy: 2950,
      status: 'full',
      amenities: ['Beds', 'Medical', 'Food', 'Showers'],
      staffCount: 32,
    },
    {
      id: 'evac-003',
      name: 'Harbor Warehouse',
      location: 'Port District',
      capacity: 2000,
      currentOccupancy: 340,
      status: 'available',
      amenities: ['Beds', 'Food', 'Water'],
      staffCount: 12,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'full': return 'bg-red-100 text-red-800';
      case 'closing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const occupancyPercent = (current: number, capacity: number) => (current / capacity) * 100;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <MapPin className="text-blue-600" />
        Evacuation Center Management
      </h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Capacity</p>
          <p className="text-3xl font-bold text-blue-700">10,000</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Occupancy</p>
          <p className="text-3xl font-bold text-yellow-700">6,530</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Available</p>
          <p className="text-3xl font-bold text-green-700">3,470</p>
        </div>
      </div>

      <div className="space-y-3">
        {sites.map((site) => (
          <div key={site.id} className="bg-white rounded-lg shadow p-5 space-y-3 border border-blue-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{site.name}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin size={16} /> {site.location}
                </p>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(site.status)}`}>
                {site.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Occupancy: {site.currentOccupancy}/{site.capacity}</span>
                <span className="font-semibold">{occupancyPercent(site.currentOccupancy, site.capacity).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    occupancyPercent(site.currentOccupancy, site.capacity) > 95
                      ? 'bg-red-600'
                      : occupancyPercent(site.currentOccupancy, site.capacity) > 75
                      ? 'bg-yellow-600'
                      : 'bg-green-600'
                  }`}
                  style={{ width: `${occupancyPercent(site.currentOccupancy, site.capacity)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Users size={16} /> {site.staffCount} staff
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle size={16} /> {site.amenities.length} amenities
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {site.amenities.map((amenity) => (
                <span key={amenity} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {amenity}
                </span>
              ))}
            </div>

            <button className="w-full px-4 py-2 mt-2 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 font-medium text-sm">
              Manage Center
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvacuationCenterManagement;
