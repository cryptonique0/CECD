import React, { useState, useEffect, useRef } from "react";

interface NotificationMessage {
  id: string;
  type: "incident" | "update" | "alert" | "volunteer";
  title: string;
  message: string;
  timestamp: Date;
  priority: "low" | "medium" | "high";
}

const RealTimeNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Simulate WebSocket connection (in production, connect to actual WebSocket server)
  useEffect(() => {
    // Simulate connection
    const simulateConnection = () => {
      setIsConnected(true);
      
      // Simulate incoming notifications
      const interval = setInterval(() => {
        const notifications: NotificationMessage[] = [
          {
            id: Date.now().toString(),
            type: "incident",
            title: "New Incident Reported",
            message: "Fire reported on Main Street. Emergency services dispatched.",
            timestamp: new Date(),
            priority: "high",
          },
          {
            id: Date.now().toString(),
            type: "update",
            title: "Incident Update",
            message: "Flooding situation on River Road is under control.",
            timestamp: new Date(),
            priority: "medium",
          },
          {
            id: Date.now().toString(),
            type: "alert",
            title: "Weather Alert",
            message: "Severe thunderstorm warning for the next 2 hours.",
            timestamp: new Date(),
            priority: "high",
          },
          {
            id: Date.now().toString(),
            type: "volunteer",
            title: "Volunteer Request",
            message: "5 volunteers needed for relief distribution at Community Center.",
            timestamp: new Date(),
            priority: "medium",
          },
        ];

        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
        setNotifications((prev) => [randomNotification, ...prev].slice(0, 20));
      }, 8000);

      return () => clearInterval(interval);
    };

    const cleanup = simulateConnection();
    return cleanup;
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 border-red-400 text-red-800";
      case "medium":
        return "bg-yellow-100 border-yellow-400 text-yellow-800";
      case "low":
        return "bg-blue-100 border-blue-400 text-blue-800";
      default:
        return "bg-gray-100 border-gray-400 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "incident":
        return "🚨";
      case "update":
        return "ℹ️";
      case "alert":
        return "⚠️";
      case "volunteer":
        return "🤝";
      default:
        return "📢";
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Real-Time Notifications</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">📭</p>
          <p>No notifications yet</p>
          <p className="text-sm mt-1">You'll receive real-time updates here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border-l-4 ${getPriorityColor(notification.priority)} animate-slideIn`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold">{notification.title}</h4>
                    <span className="text-xs opacity-75">
                      {notification.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm mt-1 opacity-90">{notification.message}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                      {notification.type}
                    </span>
                    <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded capitalize">
                      {notification.priority}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WebSocket Info */}
      <div className="pt-4 border-t">
        <details className="text-sm text-gray-600">
          <summary className="cursor-pointer hover:text-gray-900">Connection Info</summary>
          <div className="mt-2 p-3 bg-gray-50 rounded space-y-1">
            <p>
              <strong>Status:</strong> {isConnected ? "✅ Connected" : "❌ Disconnected"}
            </p>
            <p>
              <strong>Messages Received:</strong> {notifications.length}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              In production, this connects to a WebSocket server for real-time updates.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default RealTimeNotifications;
