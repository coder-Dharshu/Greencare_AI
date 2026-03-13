import React, { useState } from 'react';
import { Plant } from '../types';

interface GardenProps {
  plants: Plant[];
  onAddPlant: (plant: Plant) => void;
  onRemovePlant: (id: string) => void;
  onUpdatePlant: (plant: Plant) => void;
}

const EMPTY_FORM: Omit<Plant, 'id'> = {
  name: '', species: '', location: 'Indoor',
  waterScheduleDays: 7, lastWatered: new Date().toISOString().split('T')[0],
  notes: '', imageUrl: '', healthStatus: 'healthy'
};

function daysUntilWater(lastWatered: string, schedule: number): number {
  const last = new Date(lastWatered);
  const due = new Date(last);
  due.setDate(due.getDate() + schedule);
  const today = new Date();
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export const Garden: React.FC<GardenProps> = ({ plants, onAddPlant, onRemovePlant, onUpdatePlant }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Plant, 'id'>>(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    if (editId) {
      await onUpdatePlant({ ...form, id: editId });
    } else {
      await onAddPlant({ ...form, id: '' });
    }
    setForm(EMPTY_FORM);
    setShowForm(false);
    setEditId(null);
    setLoading(false);
  };

  const startEdit = (plant: Plant) => {
    setForm({ ...plant });
    setEditId(plant.id);
    setShowForm(true);
  };

  const waterNow = (plant: Plant) => {
    onUpdatePlant({ ...plant, lastWatered: new Date().toISOString(), healthStatus: 'healthy' });
  };

  const healthColor = (status?: string) => {
    if (status === 'healthy') return 'bg-green-100 text-green-700';
    if (status === 'sick') return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700';
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">🌿 My Garden</h2>
        <button
          onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          + Add Plant
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="glass-panel rounded-2xl p-5 mb-6 custom-shadow border border-emerald-100">
          <h3 className="font-bold text-slate-700 mb-4">{editId ? 'Edit Plant' : 'Add New Plant'}</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Plant Name *', key: 'name', type: 'text', placeholder: 'e.g. Tulsi' },
              { label: 'Species', key: 'species', type: 'text', placeholder: 'e.g. Ocimum tenuiflorum' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} className="col-span-2 sm:col-span-1">
                <label className="text-xs text-slate-500 mb-1 block">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
                />
              </div>
            ))}

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Location</label>
              <select
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400"
              >
                {['Indoor', 'Outdoor', 'Balcony', 'Windowsill', 'Terrace'].map(l => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Water every (days)</label>
              <input
                type="number" min={1} max={30}
                value={form.waterScheduleDays}
                onChange={e => setForm(f => ({ ...f, waterScheduleDays: parseInt(e.target.value) || 7 }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Last Watered</label>
              <input
                type="date"
                value={form.lastWatered?.split('T')[0]}
                onChange={e => setForm(f => ({ ...f, lastWatered: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Health Status</label>
              <select
                value={form.healthStatus}
                onChange={e => setForm(f => ({ ...f, healthStatus: e.target.value as any }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400"
              >
                <option value="healthy">Healthy</option>
                <option value="sick">Sick</option>
                <option value="recovering">Recovering</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-xs text-slate-500 mb-1 block">Notes</label>
              <textarea
                placeholder="Any notes about this plant..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              disabled={loading || !form.name.trim()}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-2 rounded-xl text-sm transition-colors"
            >
              {loading ? 'Saving...' : editId ? 'Update Plant' : 'Add Plant'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditId(null); }}
              className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Plant List */}
      {plants.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-4">🪴</div>
          <p className="font-medium">Your garden is empty</p>
          <p className="text-sm mt-1">Add your first plant to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plants.map(plant => {
            const daysLeft = daysUntilWater(plant.lastWatered, plant.waterScheduleDays);
            const needsWater = daysLeft <= 0;
            return (
              <div key={plant.id} className={`glass-panel rounded-2xl p-4 custom-shadow border ${needsWater ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-800">{plant.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${healthColor(plant.healthStatus)}`}>
                        {plant.healthStatus || 'healthy'}
                      </span>
                    </div>
                    {plant.species && <p className="text-slate-400 text-xs italic mt-0.5">{plant.species}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span>📍 {plant.location}</span>
                      <span className={needsWater ? 'text-amber-600 font-semibold' : ''}>
                        💧 {needsWater ? `${Math.abs(daysLeft)}d overdue` : `in ${daysLeft}d`}
                      </span>
                    </div>
                    {plant.notes && <p className="text-slate-400 text-xs mt-1 truncate">{plant.notes}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    {needsWater && (
                      <button
                        onClick={() => waterNow(plant)}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        💧 Water
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(plant)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onRemovePlant(plant.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-500 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
