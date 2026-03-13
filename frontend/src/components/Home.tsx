import React, { useEffect, useState } from 'react';
import { ViewState, Plant, WateringReminder } from '../types';
import { getReminders } from '../services/api';

interface HomeProps {
  onNavigate: (view: ViewState) => void;
  plants: Plant[];
}

export const Home: React.FC<HomeProps> = ({ onNavigate, plants }) => {
  const [reminders, setReminders] = useState<WateringReminder[]>([]);

  useEffect(() => {
    getReminders().then(setReminders).catch(() => {});
  }, [plants]);

  const healthyCount = plants.filter(p => p.healthStatus === 'healthy').length;
  const overdueCount = reminders.filter(r => r.status === 'overdue').length;

  const features = [
    {
      icon: '🔬',
      title: 'Diagnose Plant',
      desc: 'Upload a photo to detect diseases, pests, or deficiencies instantly',
      view: 'diagnose' as ViewState,
      color: 'from-red-50 to-orange-50 border-red-100',
      btn: 'bg-red-500 hover:bg-red-600'
    },
    {
      icon: '✨',
      title: 'Get Recommendations',
      desc: 'AI-powered plant suggestions based on your space and environment',
      view: 'recommend' as ViewState,
      color: 'from-purple-50 to-pink-50 border-purple-100',
      btn: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      icon: '🧪',
      title: 'Soil-Based AI',
      desc: 'Enter soil NPK values to get the most compatible plants for your garden',
      view: 'predict' as ViewState,
      color: 'from-blue-50 to-cyan-50 border-blue-100',
      btn: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      icon: '🌿',
      title: 'My Garden',
      desc: 'Track and manage all your plants with care schedules and reminders',
      view: 'garden' as ViewState,
      color: 'from-emerald-50 to-teal-50 border-emerald-100',
      btn: 'bg-emerald-500 hover:bg-emerald-600'
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🌱</div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">GreenCare AI</h1>
        <p className="text-slate-500 text-sm">Your personalized plant care companion</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="glass-panel rounded-2xl p-4 text-center custom-shadow">
          <div className="text-2xl font-bold text-emerald-600">{plants.length}</div>
          <div className="text-xs text-slate-500 mt-1">Total Plants</div>
        </div>
        <div className="glass-panel rounded-2xl p-4 text-center custom-shadow">
          <div className="text-2xl font-bold text-green-600">{healthyCount}</div>
          <div className="text-xs text-slate-500 mt-1">Healthy</div>
        </div>
        <div
          className={`glass-panel rounded-2xl p-4 text-center custom-shadow cursor-pointer hover:scale-105 transition-transform ${overdueCount > 0 ? 'bg-amber-50 border-amber-200' : ''}`}
          onClick={() => onNavigate('garden')}
        >
          <div className={`text-2xl font-bold ${overdueCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
            {overdueCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">Need Water</div>
        </div>
      </div>

      {/* Reminders Banner */}
      {reminders.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
            💧 Watering Reminders
          </h3>
          <div className="space-y-1">
            {reminders.slice(0, 3).map(r => (
              <div key={r.plantId} className="text-sm text-amber-700 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${r.status === 'overdue' ? 'bg-red-500' : r.status === 'due_today' ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                {r.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Cards */}
      <div className="grid grid-cols-1 gap-4">
        {features.map(f => (
          <div
            key={f.view}
            className={`glass-panel rounded-2xl p-5 border bg-gradient-to-r ${f.color} custom-shadow`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{f.icon}</span>
                  <h3 className="font-bold text-slate-800">{f.title}</h3>
                </div>
                <p className="text-slate-500 text-sm mb-4">{f.desc}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate(f.view)}
              className={`${f.btn} text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors`}
            >
              Open →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
