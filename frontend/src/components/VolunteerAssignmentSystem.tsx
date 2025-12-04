import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Users } from 'lucide-react';

interface Volunteer {
  id: string;
  name: string;
  skills: string[];
  availability: boolean;
  currentAssignments: number;
}

interface Assignment {
  id: string;
  volunteerId: string;
  incidentId: string;
  status: 'pending' | 'assigned' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
}

const VolunteerAssignmentSystem: React.FC = () => {
  const [volunteers] = useState<Volunteer[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      skills: ['Medical', 'CPR', 'First Aid'],
      availability: true,
      currentAssignments: 1,
    },
    {
      id: '2',
      name: 'Bob Smith',
      skills: ['Search & Rescue', 'Navigation'],
      availability: true,
      currentAssignments: 0,
    },
    {
      id: '3',
      name: 'Carol White',
      skills: ['Supply Management', 'Logistics'],
      availability: false,
      currentAssignments: 2,
    },
  ]);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAssign = () => {
    if (selectedVolunteer && selectedIncident) {
      const newAssignment: Assignment = {
        id: Math.random().toString(36).substr(2, 9),
        volunteerId: selectedVolunteer,
        incidentId: selectedIncident,
        status: 'assigned',
        createdAt: new Date(),
      };
      setAssignments([...assignments, newAssignment]);
      setSelectedVolunteer(null);
      setSelectedIncident(null);
      setShowConfirm(false);
    }
  };

  const pendingAssignments = assignments.filter(a => a.status === 'pending');
  const activeAssignments = assignments.filter(a => a.status === 'assigned');
  const completedAssignments = assignments.filter(a => a.status === 'completed');

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-2">
        <Users className="text-blue-600" />
        Volunteer Assignment System
      </h2>

      {/* Assignment Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Create New Assignment</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Volunteer</label>
            <select
              value={selectedVolunteer || ''}
              onChange={(e) => setSelectedVolunteer(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Choose a volunteer...</option>
              {volunteers.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.availability ? 'Available' : 'Busy'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Incident</label>
            <select
              value={selectedIncident || ''}
              onChange={(e) => setSelectedIncident(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Choose an incident...</option>
              <option value="inc-001">Flood - Downtown Area</option>
              <option value="inc-002">Medical Emergency - Hospital</option>
              <option value="inc-003">Fire - Industrial District</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          disabled={!selectedVolunteer || !selectedIncident}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          Create Assignment
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && selectedVolunteer && selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h4 className="font-bold text-lg mb-4">Confirm Assignment</h4>
            <p className="mb-6">
              Assign {volunteers.find(v => v.id === selectedVolunteer)?.name} to incident {selectedIncident}?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold">{activeAssignments.length}</div>
          <div className="text-sm text-gray-600">Active Assignments</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-2xl font-bold">{pendingAssignments.length}</div>
          <div className="text-sm text-gray-600">Pending Assignments</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold">{completedAssignments.length}</div>
          <div className="text-sm text-gray-600">Completed Assignments</div>
        </div>
      </div>

      {/* Volunteer List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Volunteer Directory</h3>
        <div className="space-y-4">
          {volunteers.map(volunteer => (
            <div key={volunteer.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold">{volunteer.name}</h4>
                  <p className="text-sm text-gray-600">Skills: {volunteer.skills.join(', ')}</p>
                  <p className="text-sm text-gray-600">Current Assignments: {volunteer.currentAssignments}</p>
                </div>
                <div className="flex items-center gap-2">
                  {volunteer.availability ? (
                    <CheckCircle2 className="text-green-600" size={20} />
                  ) : (
                    <AlertCircle className="text-orange-600" size={20} />
                  )}
                  <span className="text-sm font-medium">
                    {volunteer.availability ? 'Available' : 'Busy'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Assignments */}
      {activeAssignments.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Active Assignments</h3>
          <div className="space-y-3">
            {activeAssignments.map(assignment => {
              const volunteer = volunteers.find(v => v.id === assignment.volunteerId);
              return (
                <div key={assignment.id} className="border-l-4 border-blue-600 pl-4 py-2">
                  <p className="font-medium">{volunteer?.name} → Incident {assignment.incidentId}</p>
                  <p className="text-sm text-gray-600">Assigned: {assignment.createdAt.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerAssignmentSystem;
