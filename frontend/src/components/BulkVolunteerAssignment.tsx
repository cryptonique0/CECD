import React, { useState } from 'react';
import { Users, Check, X, Clock, Mail } from 'lucide-react';

interface BulkAssignment {
  id: string;
  teamName: string;
  volunteersCount: number;
  assigned: number;
  failed: number;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  createdAt: string;
}

const BulkVolunteerAssignment: React.FC = () => {
  const [assignments] = useState<BulkAssignment[]>([
    {
      id: 'bulk-001',
      teamName: 'Medical Response Team Alpha',
      volunteersCount: 45,
      assigned: 45,
      failed: 0,
      status: 'completed',
      createdAt: '2025-12-08 10:30 UTC',
    },
    {
      id: 'bulk-002',
      teamName: 'Supply Distribution Teams 1-5',
      volunteersCount: 120,
      assigned: 118,
      failed: 2,
      status: 'completed',
      createdAt: '2025-12-08 09:15 UTC',
    },
    {
      id: 'bulk-003',
      teamName: 'Evacuation Center Support',
      volunteersCount: 85,
      assigned: 72,
      failed: 13,
      status: 'in-progress',
      createdAt: '2025-12-08 08:00 UTC',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const successRate = (assigned: number, total: number) => ((assigned / total) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Users className="text-indigo-600" />
        Bulk Volunteer Assignment
      </h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Assignments</p>
          <p className="text-3xl font-bold text-indigo-700">3</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Assigned</p>
          <p className="text-3xl font-bold text-green-700">235</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Failed</p>
          <p className="text-3xl font-bold text-red-700">15</p>
        </div>
      </div>

      <button className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center justify-center gap-2">
        <Users size={20} /> Start New Bulk Assignment
      </button>

      <div className="space-y-3">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="bg-white rounded-lg shadow p-5 border border-indigo-100 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{assignment.teamName}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <Clock size={14} /> {assignment.createdAt}
                </p>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(assignment.status)}`}>
                {assignment.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-700">{assignment.volunteersCount}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-xs text-gray-600">Assigned</p>
                <p className="text-2xl font-bold text-green-700">{assignment.assigned}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-center">
                <p className="text-xs text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-700">{assignment.failed}</p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span>Success Rate</span>
                <span className="font-bold text-green-700">{successRate(assignment.assigned, assignment.volunteersCount)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-green-600 transition-all"
                  style={{ width: `${successRate(assignment.assigned, assignment.volunteersCount)}%` }}
                />
              </div>
            </div>

            {assignment.failed > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-yellow-800 text-sm">
                  <X size={16} />
                  {assignment.failed} volunteers failed to assign
                </div>
                <button className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 flex items-center gap-1">
                  <Mail size={14} /> Retry
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BulkVolunteerAssignment;
