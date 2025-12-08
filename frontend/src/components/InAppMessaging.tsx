import React, { useState } from 'react';
import { MessageCircle, Send, User, Inbox } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'warning' | 'success';
  timestamp: string;
  read: boolean;
}

const InAppMessaging: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Critical Alert',
      message: 'Medical emergency detected at Downtown Center',
      type: 'alert',
      timestamp: '2 mins ago',
      read: false,
    },
    {
      id: '2',
      title: 'Volunteer Assignment',
      message: 'You have been assigned to Supply Distribution Team B',
      type: 'info',
      timestamp: '15 mins ago',
      read: false,
    },
    {
      id: '3',
      title: 'System Update',
      message: 'Evacuation centers updated with real-time capacity data',
      type: 'success',
      timestamp: '1 hour ago',
      read: true,
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alert': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'success': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Inbox className="text-purple-600" />
        In-App Messaging ({unreadCount} unread)
      </h2>

      <div className="bg-white rounded-lg shadow p-4 space-y-3 border border-purple-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Send a message to team..."
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <Send size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => {
              handleMarkAsRead(notif.id);
              setSelectedNotif(notif);
            }}
            className={`p-4 rounded-lg cursor-pointer transition-all border-l-4 ${
              notif.read
                ? 'bg-gray-50 border-gray-300'
                : 'bg-blue-50 border-blue-500 shadow-md'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{notif.title}</h4>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getTypeColor(notif.type)}`}>
                    {notif.type.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                <p className="text-xs text-gray-500 mt-2">{notif.timestamp}</p>
              </div>
              {!notif.read && <div className="w-3 h-3 rounded-full bg-purple-600 mt-1 flex-shrink-0" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InAppMessaging;
