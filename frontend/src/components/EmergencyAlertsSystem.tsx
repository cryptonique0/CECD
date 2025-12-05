import React, { useState } from 'react';
import { Bell, AlertTriangle, Send, Clock } from 'lucide-react';

interface EmergencyAlert {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium';
  createdAt: Date;
  recipientCount: number;
  status: 'draft' | 'sent' | 'scheduled';
  scheduledTime?: Date;
}

const EmergencyAlertsSystem: React.FC = () => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([
    {
      id: '1',
      title: 'Severe Weather Warning',
      message: 'Tornado warning in effect. Seek shelter immediately.',
      severity: 'critical',
      createdAt: new Date(Date.now() - 3600000),
      recipientCount: 245,
      status: 'sent',
    },
    {
      id: '2',
      title: 'Flood Alert',
      message: 'River levels rising. Evacuate low-lying areas.',
      severity: 'high',
      createdAt: new Date(Date.now() - 7200000),
      recipientCount: 189,
      status: 'sent',
    },
  ]);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'critical' | 'high' | 'medium'>('high');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  const recipientGroups = [
    { id: 'medical', name: 'Medical Teams', count: 45 },
    { id: 'rescue', name: 'Search & Rescue', count: 67 },
    { id: 'logistics', name: 'Logistics Team', count: 32 },
    { id: 'communications', name: 'Communications', count: 28 },
    { id: 'public', name: 'Public Volunteers', count: 112 },
  ];

  const handleSendAlert = () => {
    if (title.trim() && message.trim() && selectedRecipients.length > 0) {
      const totalRecipients = recipientGroups
        .filter(g => selectedRecipients.includes(g.id))
        .reduce((sum, g) => sum + g.count, 0);

      const newAlert: EmergencyAlert = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        message,
        severity,
        createdAt: new Date(),
        recipientCount: totalRecipients,
        status: 'sent',
      };

      setAlerts([newAlert, ...alerts]);
      setTitle('');
      setMessage('');
      setSeverity('high');
      setSelectedRecipients([]);
    }
  };

  const severityColors = {
    critical: 'bg-red-50 border-red-200 text-red-900',
    high: 'bg-orange-50 border-orange-200 text-orange-900',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  };

  const severityBadgeColors = {
    critical: 'bg-red-600',
    high: 'bg-orange-600',
    medium: 'bg-yellow-600',
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-2">
        <Bell className="text-red-600" />
        Emergency Alerts System
      </h2>

      {/* Alert Composer */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <AlertTriangle className="text-orange-600" />
          Compose New Alert
        </h3>

        <div>
          <label className="block text-sm font-medium mb-2">Alert Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Tornado Warning"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the emergency situation..."
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Severity Level</label>
          <div className="flex gap-4">
            {(['critical', 'high', 'medium'] as const).map(level => (
              <label key={level} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={severity === level}
                  onChange={() => setSeverity(level)}
                  className="w-4 h-4"
                />
                <span className="capitalize">{level}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Select Recipients</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recipientGroups.map(group => (
              <label key={group.id} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRecipients.includes(group.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRecipients([...selectedRecipients, group.id]);
                    } else {
                      setSelectedRecipients(selectedRecipients.filter(id => id !== group.id));
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="flex-1">{group.name}</span>
                <span className="text-xs text-gray-600">({group.count})</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSendAlert}
            disabled={!title.trim() || !message.trim() || selectedRecipients.length === 0}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium flex items-center justify-center gap-2"
          >
            <Send size={18} />
            Send Alert Now
          </button>
          <button
            className="px-4 py-3 border rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2"
          >
            <Clock size={18} />
            Schedule
          </button>
        </div>
      </div>

      {/* Active Alerts Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-sm text-gray-600">Critical Alerts Sent</p>
          <p className="text-2xl font-bold text-red-600">
            {alerts.filter(a => a.severity === 'critical' && a.status === 'sent').length}
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-sm text-gray-600">High Priority Alerts</p>
          <p className="text-2xl font-bold text-orange-600">
            {alerts.filter(a => a.severity === 'high' && a.status === 'sent').length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-gray-600">Total Recipients Notified</p>
          <p className="text-2xl font-bold text-blue-600">
            {alerts.filter(a => a.status === 'sent').reduce((sum, a) => sum + a.recipientCount, 0)}
          </p>
        </div>
      </div>

      {/* Alert History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Alert History</h3>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <p className="text-gray-500">No alerts sent yet</p>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className={`border rounded-lg p-4 ${severityColors[alert.severity]}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-white text-xs font-bold rounded ${severityBadgeColors[alert.severity]}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <h4 className="font-bold text-lg">{alert.title}</h4>
                    </div>
                    <p className="mt-2">{alert.message}</p>
                    <div className="mt-3 flex gap-4 text-sm">
                      <span>Recipients: {alert.recipientCount}</span>
                      <span>Sent: {alert.createdAt.toLocaleString()}</span>
                      <span className="capitalize">Status: {alert.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyAlertsSystem;
