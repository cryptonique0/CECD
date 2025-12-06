import React, { useMemo, useState } from 'react';
import { History, Clock4, CheckCircle2, Filter, FileText } from 'lucide-react';

interface IncidentHistoryItem {
  id: string;
  title: string;
  type: 'medical' | 'fire' | 'flood' | 'security' | 'logistics';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'resolved' | 'closed';
  reportedAt: string;
  resolvedAt: string;
  commander: string;
  team: string[];
  summary: string;
  lessons: string[];
}

const mockHistory: IncidentHistoryItem[] = [
  {
    id: 'INC-1043',
    title: 'Flooded Basement in Clinic',
    type: 'flood',
    severity: 'high',
    status: 'resolved',
    reportedAt: '2024-11-03T10:45:00Z',
    resolvedAt: '2024-11-03T14:10:00Z',
    commander: 'Alice Johnson',
    team: ['Rescue Team A', 'Logistics Unit'],
    summary: 'Water leak contained, pumps deployed, patients relocated.',
    lessons: ['Pre-position pumps near clinics', 'Add water sensors in basements'],
  },
  {
    id: 'INC-1038',
    title: 'Chemical Spill at Warehouse',
    type: 'logistics',
    severity: 'critical',
    status: 'closed',
    reportedAt: '2024-10-21T08:12:00Z',
    resolvedAt: '2024-10-21T12:55:00Z',
    commander: 'Bob Smith',
    team: ['Hazmat Crew', 'Medical Standby'],
    summary: 'Spill contained, ventilation cleared, no injuries.',
    lessons: ['Verify hazmat PPE stock monthly', 'Refresh evacuation signage'],
  },
  {
    id: 'INC-1027',
    title: 'Apartment Fire Evacuation',
    type: 'fire',
    severity: 'high',
    status: 'resolved',
    reportedAt: '2024-09-15T19:05:00Z',
    resolvedAt: '2024-09-15T21:40:00Z',
    commander: 'Carol White',
    team: ['Fire Brigade', 'Volunteer Marshals'],
    summary: 'Residents evacuated, fire contained to single unit.',
    lessons: ['Drill stairwell clearing quarterly', 'Improve radio coverage in tower'],
  },
  {
    id: 'INC-1019',
    title: 'Medical Triage Post-Storm',
    type: 'medical',
    severity: 'medium',
    status: 'resolved',
    reportedAt: '2024-08-02T06:30:00Z',
    resolvedAt: '2024-08-02T08:05:00Z',
    commander: 'Dana Hughes',
    team: ['Field Medics', 'Logistics Unit'],
    summary: 'Set up temporary triage, treated 12 minor injuries.',
    lessons: ['Cache portable generators', 'Pre-stage water and blankets'],
  },
];

const IncidentHistoryReporting: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return mockHistory.filter(item => {
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesSeverity = severityFilter === 'all' || item.severity === severityFilter;
      const matchesSearch = search.trim().length === 0 || item.title.toLowerCase().includes(search.toLowerCase()) || item.summary.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSeverity && matchesSearch;
    });
  }, [typeFilter, severityFilter, search]);

  const avgResolutionMinutes = useMemo(() => {
    if (filtered.length === 0) return 0;
    const totalMinutes = filtered.reduce((sum, item) => {
      const start = new Date(item.reportedAt).getTime();
      const end = new Date(item.resolvedAt).getTime();
      return sum + Math.max(0, (end - start) / 60000);
    }, 0);
    return Math.round(totalMinutes / filtered.length);
  }, [filtered]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <History className="text-blue-600" size={28} />
        <div>
          <h2 className="text-3xl font-bold">Incident History & Reporting</h2>
          <p className="text-gray-600">Review resolved incidents, timelines, and post-mortem notes.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter size={18} />
          <span className="text-sm font-medium">Filter</span>
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All Types</option>
          <option value="medical">Medical</option>
          <option value="fire">Fire</option>
          <option value="flood">Flood</option>
          <option value="security">Security</option>
          <option value="logistics">Logistics</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title or summary"
          className="flex-1 min-w-[220px] px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="text-sm text-gray-600">Incidents Reviewed</div>
          <div className="text-2xl font-bold">{filtered.length}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <div className="text-sm text-gray-600">Avg Resolution Time</div>
          <div className="text-2xl font-bold">{avgResolutionMinutes} mins</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
          <div className="text-sm text-gray-600">Critical Learnings Logged</div>
          <div className="text-2xl font-bold">{filtered.reduce((sum, item) => sum + item.lessons.length, 0)}</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Clock4 className="text-indigo-600" />
          Resolution Timeline
        </h3>
        <div className="space-y-4">
          {filtered.map(item => (
            <div key={item.id} className="border-l-4 border-indigo-500 pl-4 py-3">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-green-600" size={18} />
                    <span className="font-bold">{item.title}</span>
                    <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 uppercase">{item.type}</span>
                    <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 uppercase">{item.severity}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.summary}</p>
                  <p className="text-xs text-gray-500 mt-1">Commander: {item.commander} · Team: {item.team.join(', ')}</p>
                </div>
                <div className="text-right min-w-[220px]">
                  <p className="text-sm font-semibold">Reported: {new Date(item.reportedAt).toLocaleString()}</p>
                  <p className="text-sm font-semibold">Resolved: {new Date(item.resolvedAt).toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Duration: {Math.round((new Date(item.resolvedAt).getTime() - new Date(item.reportedAt).getTime()) / 60000)} mins</p>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-gray-500 text-sm">No incidents match the selected filters.</p>
          )}
        </div>
      </div>

      {/* Lessons learned */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <FileText className="text-emerald-600" />
          Post-Mortem Notes
        </h3>
        <div className="space-y-3">
          {filtered.flatMap(item => item.lessons.map((lesson, idx) => (
            <div key={`${item.id}-${idx}`} className="border rounded-lg p-3 flex justify-between items-start">
              <div>
                <p className="font-medium">{lesson}</p>
                <p className="text-xs text-gray-500">From {item.id} · {item.title}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 uppercase">{item.type}</span>
            </div>
          )))}
          {filtered.length === 0 && (
            <p className="text-gray-500 text-sm">No lessons available. Adjust filters to see items.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentHistoryReporting;
