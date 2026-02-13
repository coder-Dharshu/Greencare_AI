import React, { useState } from 'react';
import { Plus, Droplets, Calendar, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Plant } from '../types';

interface GardenProps {
  plants: Plant[];
  onAddPlant: (plant: Plant) => void;
  onRemovePlant: (id: string) => void;
  onUpdatePlant: (plant: Plant) => void;
}

export const Garden: React.FC<GardenProps> = ({ plants, onAddPlant, onRemovePlant, onUpdatePlant }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newPlant, setNewPlant] = useState<Partial<Plant>>({
    name: '',
    species: '',
    location: 'Living Room',
    waterScheduleDays: 7,
  });

  // Calculate status
  const getStatus = (plant: Plant) => {
    const last = new Date(plant.lastWatered);
    const next = new Date(last);
    next.setDate(last.getDate() + plant.waterScheduleDays);
    
    const today = new Date();
    today.setHours(0,0,0,0);
    next.setHours(0,0,0,0);

    const diffTime = next.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'overdue', days: Math.abs(diffDays), color: 'text-red-600', badge: 'bg-red-50 border-red-100 text-red-700' };
    if (diffDays === 0) return { status: 'due', days: 0, color: 'text-amber-600', badge: 'bg-amber-50 border-amber-100 text-amber-700' };
    return { status: 'ok', days: diffDays, color: 'text-emerald-600', badge: 'bg-emerald-50 border-emerald-100 text-emerald-700' };
  };

  const handleWater = (plant: Plant) => {
    onUpdatePlant({
      ...plant,
      lastWatered: new Date().toISOString()
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlant.name || !newPlant.species) return;

    onAddPlant({
      id: crypto.randomUUID(),
      name: newPlant.name,
      species: newPlant.species,
      location: newPlant.location || 'Indoor',
      waterScheduleDays: newPlant.waterScheduleDays || 7,
      lastWatered: new Date().toISOString(),
      ...newPlant
    } as Plant);
    
    setIsAdding(false);
    setNewPlant({ name: '', species: '', location: 'Living Room', waterScheduleDays: 7 });
  };

  const sortedPlants = [...plants].sort((a, b) => {
    const statusA = getStatus(a);
    const statusB = getStatus(b);
    if (statusA.status === 'overdue' && statusB.status !== 'overdue') return -1;
    if (statusB.status === 'overdue' && statusA.status !== 'overdue') return 1;
    if (statusA.status === 'due' && statusB.status !== 'due') return -1;
    if (statusB.status === 'due' && statusA.status !== 'due') return 1;
    return 0;
  });

  const plantsNeedingWater = plants.filter(p => {
    const s = getStatus(p);
    return s.status === 'overdue' || s.status === 'due';
  });

  return (
    <div className="py-8 space-y-12">
      
      {/* Water Reminders Banner */}
      {plantsNeedingWater.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Watering Reminder</h3>
                  <p className="text-emerald-50">You have {plantsNeedingWater.length} plants that need water today.</p>
                </div>
              </div>
              <button 
                onClick={() => plantsNeedingWater.forEach(handleWater)}
                className="bg-white text-emerald-700 px-6 py-3 rounded-full font-bold hover:bg-emerald-50 transition-colors shadow-sm"
              >
                Mark All Watered
              </button>
           </div>
           {/* Decorative */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">My Garden</h2>
          <p className="text-slate-500 mt-2">Manage your garden and schedule.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-full transition-all shadow-lg hover:shadow-emerald-200 active:scale-95 font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Add Plant</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <span className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-3 text-emerald-600">
              <Plus className="w-5 h-5" />
            </span>
            Add New Plant
          </h3>
          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Plant Nickname</label>
              <input
                type="text"
                required
                className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium placeholder:text-slate-400"
                placeholder="e.g. Mr. Ficus"
                value={newPlant.name}
                onChange={e => setNewPlant({...newPlant, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Species</label>
              <input
                type="text"
                required
                className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium placeholder:text-slate-400"
                placeholder="e.g. Ficus Lyrata"
                value={newPlant.species}
                onChange={e => setNewPlant({...newPlant, species: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Location</label>
              <input
                type="text"
                className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium placeholder:text-slate-400"
                value={newPlant.location}
                onChange={e => setNewPlant({...newPlant, location: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Water Every (Days)</label>
              <input
                type="number"
                min="1"
                className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium placeholder:text-slate-400"
                value={newPlant.waterScheduleDays}
                onChange={e => setNewPlant({...newPlant, waterScheduleDays: parseInt(e.target.value)})}
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-4 mt-4">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-8 py-3 text-slate-500 hover:bg-slate-50 rounded-full transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all shadow-md font-semibold"
              >
                Save Plant
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedPlants.length === 0 && !isAdding && (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-8 h-8 text-emerald-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Your garden is empty</h3>
            <p className="text-slate-500 mb-6">Add your first plant to start tracking care.</p>
            <button
               onClick={() => setIsAdding(true)}
               className="text-emerald-600 font-semibold hover:text-emerald-700"
            >
              Add a plant now &rarr;
            </button>
          </div>
        )}

        {sortedPlants.map(plant => {
          const { status, days, color, badge } = getStatus(plant);
          return (
            <div key={plant.id} className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 group border border-slate-100 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100/50 flex items-center justify-center text-emerald-700 font-bold text-2xl">
                    {plant.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{plant.name}</h3>
                    <p className="text-sm text-slate-500">{plant.species}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onRemovePlant(plant.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center text-sm font-medium text-slate-500">
                  <Calendar className="w-4 h-4 mr-3 text-slate-400" />
                  <span>Every {plant.waterScheduleDays} days</span>
                </div>
                <div className={`flex items-center text-sm font-semibold p-3 rounded-xl border ${badge}`}>
                  {status === 'overdue' && <AlertCircle className="w-5 h-5 mr-3" />}
                  {status === 'due' && <Droplets className="w-5 h-5 mr-3" />}
                  {status === 'ok' && <CheckCircle2 className="w-5 h-5 mr-3" />}
                  
                  <span>
                    {status === 'overdue' ? `${days} days overdue!` : 
                     status === 'due' ? 'Water today!' : 
                     `Water in ${days} days`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleWater(plant)}
                className={`w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center space-x-2 transition-all active:scale-[0.98] ${
                  status === 'ok' 
                  ? 'bg-slate-50 text-slate-600 hover:bg-slate-100' 
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200'
                }`}
              >
                <Droplets className={`w-4 h-4 ${status === 'ok' ? 'text-slate-400' : 'text-white'}`} />
                <span>{status === 'ok' ? 'Watered' : 'Mark Watered'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};