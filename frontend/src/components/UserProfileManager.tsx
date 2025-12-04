import React, { useState } from 'react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar?: string;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    darkMode: boolean;
    language: string;
  };
}

const UserProfileManager: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    location: 'San Francisco, CA',
    bio: 'Emergency response volunteer',
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      darkMode: false,
      language: 'en',
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    // Save to backend
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Profile Settings</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            value={profile.location}
            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            disabled={!isEditing}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="font-bold">Preferences</h3>
        
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={profile.preferences.emailNotifications}
            onChange={(e) => setProfile({
              ...profile,
              preferences: { ...profile.preferences, emailNotifications: e.target.checked }
            })}
            disabled={!isEditing}
          />
          <span>Email Notifications</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={profile.preferences.pushNotifications}
            onChange={(e) => setProfile({
              ...profile,
              preferences: { ...profile.preferences, pushNotifications: e.target.checked }
            })}
            disabled={!isEditing}
          />
          <span>Push Notifications</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={profile.preferences.darkMode}
            onChange={(e) => setProfile({
              ...profile,
              preferences: { ...profile.preferences, darkMode: e.target.checked }
            })}
            disabled={!isEditing}
          />
          <span>Dark Mode</span>
        </label>
      </div>

      {isEditing && (
        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Save Changes
        </button>
      )}
    </div>
  );
};

export default UserProfileManager;
