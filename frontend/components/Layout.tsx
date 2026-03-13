import React from 'react';
import { Leaf, Menu, X, User, Bell, Droplets } from 'lucide-react';
import { ViewState, Plant } from '../types';
import { getPlantStatus } from './useWateringNotifications';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  children: React.ReactNode;
  plants?: Plant[];
  onUpdatePlant?: (plant: Plant) => void;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children, plants = [], onUpdatePlant }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);

  // Compute notifications
  const notifications = plants.filter(p => {
    const s = getPlantStatus(p);
    return s.status === 'due' || s.status === 'overdue';
  });

  const NavLink = ({ view, label }: { view: ViewState; label: string }) => (
    <button
      onClick={() => {
        onNavigate(view);
        setIsMobileMenuOpen(false);
      }}
      className={`text-sm font-medium transition-colors ${
        currentView === view
          ? 'text-emerald-600'
          : 'text-slate-500 hover:text-emerald-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbf8]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => onNavigate('home')}
            >
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white mr-3 shadow-sm">
                <Leaf className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight">Greencare AI</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <NavLink view="home" label="Home" />
              <NavLink view="recommend" label="Plants" />
              <NavLink view="garden" label="My Garden" />
              <NavLink view="diagnose" label="Plant Doctor" />
            </nav>

            {/* Right Actions */}
            <div className="hidden md:flex items-center space-x-4 relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                title="Watering Reminders"
              >
                <Bell className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] items-center justify-center text-white font-bold">{notifications.length}</span>
                  </span>
                )}
              </button>

              <button 
                onClick={() => onNavigate('garden')}
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-full hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                <User className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute top-[120%] right-0 mt-2 w-80 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Watering Reminders</h3>
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">
                      {notifications.length} due
                    </span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-sm">
                        All plants are watered and happy! 🌿
                      </div>
                    ) : (
                      notifications.map(plant => {
                        const status = getPlantStatus(plant);
                        return (
                          <div key={plant.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors last:border-0">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-slate-800 text-sm">{plant.name}</h4>
                                <p className="text-xs text-slate-500">{plant.species}</p>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${status.status === 'overdue' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                {status.status === 'overdue' ? `${status.days}d overdue` : 'Due today'}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                if (onUpdatePlant) {
                                  onUpdatePlant({ ...plant, lastWatered: new Date().toISOString() });
                                }
                                onNavigate('garden');
                                setIsNotificationsOpen(false);
                              }}
                              className="w-full mt-2 py-2 bg-emerald-100/50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Droplets className="w-3.5 h-3.5" /> Water Now
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-lg">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <button onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-3 text-base font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">Home</button>
              <button onClick={() => { onNavigate('recommend'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-3 text-base font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">Plants</button>
              <button onClick={() => { onNavigate('garden'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-3 text-base font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">My Garden</button>
              <button onClick={() => { onNavigate('diagnose'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-3 text-base font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">Plant Doctor</button>
              <div className="pt-4 border-t border-slate-100 mt-2">
                <button 
                  onClick={() => { onNavigate('garden'); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white px-4 py-3 rounded-xl font-medium"
                >
                  <User className="w-5 h-5" />
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
             <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-emerald-600">
                <Leaf className="w-4 h-4" />
             </div>
             <span className="font-semibold text-slate-800">Greencare AI</span>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Contact</a>
          </div>
          <div className="mt-4 md:mt-0">
            &copy; 2024 Greencare AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};