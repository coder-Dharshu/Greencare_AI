import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getProfile, updateProfile } from '../services/api';

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    experienceLevel: 'beginner',
    gardeningGoals: '',
    preferredLocation: '',
    availableSpace: '',
    notificationsEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getProfile()
      .then(p => setProfile(p))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-emerald-600">Loading profile...</div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">👤 My Profile</h2>
      <p className="text-slate-500 text-sm mb-6">Help us personalize your gardening experience</p>

      <div className="glass-panel rounded-2xl p-5 custom-shadow space-y-5">

        {/* Experience Level */}
        <div>
          <label className="text-xs text-slate-500 mb-2 block font-semibold uppercase tracking-wide">Experience Level</label>
          <div className="flex gap-3">
            {(['beginner', 'hobbyist', 'expert'] as const).map(level => (
              <button
                key={level}
                onClick={() => setProfile(p => ({ ...p, experienceLevel: level }))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all capitalize ${
                  profile.experienceLevel === level
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'
                }`}
              >
                {level === 'beginner' ? '🌱' : level === 'hobbyist' ? '🌿' : '🌳'} {level}
              </button>
            ))}
          </div>
        </div>

        {/* Gardening Goals */}
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Gardening Goals</label>
          <input
            value={profile.gardeningGoals || ''}
            onChange={e => setProfile(p => ({ ...p, gardeningGoals: e.target.value }))}
            placeholder="e.g. grow vegetables, air-purifying plants, decorative..."
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400"
          />
        </div>

        {/* Location */}
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Your Location</label>
          <input
            value={profile.preferredLocation || ''}
            onChange={e => setProfile(p => ({ ...p, preferredLocation: e.target.value }))}
            placeholder="e.g. Bengaluru, Karnataka, India"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400"
          />
        </div>

        {/* Available Space */}
        <div>
          <label className="text-xs text-slate-500 mb-2 block">Available Space</label>
          <div className="grid grid-cols-3 gap-2">
            {['Windowsill', 'Balcony', 'Terrace', 'Small Room', 'Large Room', 'Garden'].map(space => (
              <button
                key={space}
                onClick={() => setProfile(p => ({ ...p, availableSpace: space }))}
                className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                  profile.availableSpace === space
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-200'
                }`}
              >
                {space}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between py-2 border-t border-slate-100">
          <div>
            <p className="text-sm font-medium text-slate-700">Watering Reminders</p>
            <p className="text-xs text-slate-400">Get alerts when plants need water</p>
          </div>
          <button
            onClick={() => setProfile(p => ({ ...p, notificationsEnabled: !p.notificationsEnabled }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              profile.notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-200'
            }`}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              profile.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {saved ? '✅ Saved!' : saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
};
