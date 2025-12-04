import React, { useState } from 'react';
import { IncidentType, IncidentSeverity } from '../types/incident';

interface FilterProps {
  onFilterChange: (filters: IncidentFilters) => void;
}

export interface IncidentFilters {
  type?: IncidentType;
  severity?: IncidentSeverity;
  status?: 'all' | 'open' | 'resolved';
  searchTerm?: string;
}

const IncidentFilter: React.FC<FilterProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<IncidentFilters>({});

  const handleChange = (newFilters: IncidentFilters) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const types: IncidentType[] = ['fire', 'flood', 'earthquake', 'medical', 'other'];
  const severities: IncidentSeverity[] = ['low', 'medium', 'high', 'critical'];

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
      <h3 className="font-semibold">Filter Incidents</h3>
      
      <input
        type="text"
        placeholder="Search incidents..."
        onChange={(e) => handleChange({ ...filters, searchTerm: e.target.value })}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <select
            onChange={(e) => handleChange({ ...filters, type: e.target.value as IncidentType })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Severity</label>
          <select
            onChange={(e) => handleChange({ ...filters, severity: e.target.value as IncidentSeverity })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severities</option>
            {severities.map((severity) => (
              <option key={severity} value={severity}>
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <select
        onChange={(e) => handleChange({ ...filters, status: e.target.value as 'all' | 'open' | 'resolved' })}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Status</option>
        <option value="open">Open</option>
        <option value="resolved">Resolved</option>
      </select>
    </div>
  );
};

export default IncidentFilter;
