import React, { useState, useEffect } from "react";

interface OfflineSyncStatus {
  isOnline: boolean;
  pendingActions: number;
  lastSync: string;
}

const OfflineSupport: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<OfflineSyncStatus>({
    isOnline: navigator.onLine,
    pendingActions: 0,
    lastSync: new Date().toISOString(),
  });

  useEffect(() => {
    const handleOnline = () => {
      console.debug("[OfflineSupport] Network status: online");
      setSyncStatus((prev) => ({ ...prev, isOnline: true }));
      syncPendingData();
    };

    const handleOffline = () => {
      console.debug("[OfflineSupport] Network status: offline");
      setSyncStatus((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check for pending offline data
    checkPendingData();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const checkPendingData = () => {
    const pending = localStorage.getItem("pendingIncidents");
    if (pending) {
      const data = JSON.parse(pending);
      setSyncStatus((prev) => ({ ...prev, pendingActions: data.length }));
    }
  };

  const syncPendingData = async () => {
    const pending = localStorage.getItem("pendingIncidents");
    if (!pending) return;

    const data = JSON.parse(pending);
    
    // Simulate syncing (in production, send to backend)
    for (const item of data) {
      console.log("Syncing incident:", item);
      // await api.createIncident(item);
    }

    localStorage.removeItem("pendingIncidents");
    setSyncStatus((prev) => ({
      ...prev,
      pendingActions: 0,
      lastSync: new Date().toISOString(),
    }));
  };

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-sm ${
      syncStatus.isOnline ? "bg-green-50 border-2 border-green-400" : "bg-yellow-50 border-2 border-yellow-400"
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${
          syncStatus.isOnline ? "bg-green-500 animate-pulse" : "bg-yellow-500"
        }`}></div>
        <div className="flex-1">
          <p className={`font-semibold text-sm ${
            syncStatus.isOnline ? "text-green-800" : "text-yellow-800"
          }`}>
            {syncStatus.isOnline ? "Online" : "Offline Mode"}
          </p>
          {syncStatus.pendingActions > 0 && (
            <p className="text-xs text-gray-600">
              {syncStatus.pendingActions} actions pending sync
            </p>
          )}
          {syncStatus.isOnline && (
            <p className="text-xs text-gray-500">
              Last synced: {new Date(syncStatus.lastSync).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
      
      {!syncStatus.isOnline && (
        <div className="mt-3 pt-3 border-t border-yellow-200">
          <p className="text-xs text-yellow-700">
            📱 Data saved locally. Will sync when connection returns.
          </p>
        </div>
      )}
    </div>
  );
};

// Service Worker Registration
export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered:", registration);
      
      // Check for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              console.log("New service worker available");
            }
          });
        }
      });
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }
};

// Helper to save data offline
export const saveOfflineData = (type: string, data: any) => {
  const key = `pending${type}`;
  const existing = localStorage.getItem(key);
  const items = existing ? JSON.parse(existing) : [];
  items.push({ ...data, timestamp: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(items));
};

export default OfflineSupport;
