import React, { useState } from 'react';
import { Shield, Lock, Eye, ToggleLeft, ToggleRight } from 'lucide-react';

interface SecuritySettings {
  twoFactor: boolean;
  activityNotifications: boolean;
  loginAlerts: boolean;
  dataEncryption: boolean;
  privacyMode: boolean;
  sessionTimeout: number;
}

const SecurityDashboard: React.FC = () => {
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactor: true,
    activityNotifications: true,
    loginAlerts: true,
    dataEncryption: true,
    privacyMode: false,
    sessionTimeout: 30,
  });

  const toggleSetting = (key: keyof SecuritySettings) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-2">
        <Shield className="text-blue-600" />
        Security Settings
      </h2>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-bold">Account Protection</h3>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Lock className="text-blue-600" size={20} />
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Require 2FA for login</p>
            </div>
          </div>
          <button onClick={() => toggleSetting('twoFactor')} className="text-2xl">
            {settings.twoFactor ? (
              <ToggleRight className="text-green-600" />
            ) : (
              <ToggleLeft className="text-gray-400" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Eye className="text-blue-600" size={20} />
            <div>
              <p className="font-medium">Activity Notifications</p>
              <p className="text-sm text-gray-600">Get alerts on account activity</p>
            </div>
          </div>
          <button onClick={() => toggleSetting('activityNotifications')} className="text-2xl">
            {settings.activityNotifications ? (
              <ToggleRight className="text-green-600" />
            ) : (
              <ToggleLeft className="text-gray-400" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Shield className="text-blue-600" size={20} />
            <div>
              <p className="font-medium">Login Alerts</p>
              <p className="text-sm text-gray-600">Notify on new login from new device</p>
            </div>
          </div>
          <button onClick={() => toggleSetting('loginAlerts')} className="text-2xl">
            {settings.loginAlerts ? (
              <ToggleRight className="text-green-600" />
            ) : (
              <ToggleLeft className="text-gray-400" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Lock className="text-blue-600" size={20} />
            <div>
              <p className="font-medium">End-to-End Encryption</p>
              <p className="text-sm text-gray-600">Encrypt sensitive data</p>
            </div>
          </div>
          <button onClick={() => toggleSetting('dataEncryption')} className="text-2xl">
            {settings.dataEncryption ? (
              <ToggleRight className="text-green-600" />
            ) : (
              <ToggleLeft className="text-gray-400" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Eye className="text-blue-600" size={20} />
            <div>
              <p className="font-medium">Privacy Mode</p>
              <p className="text-sm text-gray-600">Hide profile from public view</p>
            </div>
          </div>
          <button onClick={() => toggleSetting('privacyMode')} className="text-2xl">
            {settings.privacyMode ? (
              <ToggleRight className="text-green-600" />
            ) : (
              <ToggleLeft className="text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-bold">Session Management</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
            min="5"
            max="120"
          />
          <p className="text-xs text-gray-600">Auto logout after {settings.sessionTimeout} minutes of inactivity</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-bold">Active Sessions</h3>
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
            <div>
              <p className="font-medium text-sm">Current Session</p>
              <p className="text-xs text-gray-600">Chrome on Linux</p>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
