import React from 'react';
import { ViewState } from '../types';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  children: React.ReactNode;
  reminderCount?: number;
}

const NAV_ITEMS: { view: ViewState; label: string; icon: string }[] = [
  { view: 'home',      label: 'Home',      icon: '🏡' },
  { view: 'garden',    label: 'My Garden', icon: '🌿' },
  { view: 'diagnose',  label: 'Diagnose',  icon: '🔬' },
  { view: 'recommend', label: 'Suggest',   icon: '✨' },
  { view: 'predict',   label: 'Soil AI',   icon: '🧪' },
  { view: 'profile',   label: 'Profile',   icon: '👤' },
];

export const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children, reminderCount = 0 }) => {
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
      {/* Top Header */}
      <header className="sticky top-0 z-50 glass-panel px-6 py-4 flex items-center justify-between custom-shadow">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌱</span>
          <span className="font-bold text-emerald-800 text-xl tracking-tight">GreenCare AI</span>
        </div>
        {reminderCount > 0 && (
          <button
            onClick={() => onNavigate('garden')}
            className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-amber-100 transition-colors"
          >
            💧 {reminderCount} plant{reminderCount > 1 ? 's' : ''} need water
          </button>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-slate-200">
        <div className="flex justify-around items-center px-2 py-2">
          {NAV_ITEMS.map(({ view, label, icon }) => {
            const active = currentView === view;
            return (
              <button
                key={view}
                onClick={() => onNavigate(view)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                  active
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <span className="text-xl">{icon}</span>
                <span className={`text-[10px] font-semibold tracking-wide ${active ? 'text-emerald-700' : ''}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
