import React, { useState } from 'react';
import { PlantRecommendation, RecommendationRequest, Plant } from '../types';
import { getRecommendations } from '../services/api';

interface RecommendationEngineProps {
  onAddPlant: (plant: Plant) => void;
}

const INITIAL_FORM: RecommendationRequest = {
  location: 'Bengaluru, Karnataka, India',
  environment: 'indoor',
  lightLevel: 'medium',
  maintenance: 'low',
  petSafe: false,
  notes: ''
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-amber-100 text-amber-700',
  Hard: 'bg-red-100 text-red-700',
};

export const RecommendationEngine: React.FC<RecommendationEngineProps> = ({ onAddPlant }) => {
  const [form, setForm] = useState<RecommendationRequest>(INITIAL_FORM);
  const [results, setResults] = useState<PlantRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());

  const handleGet = async () => {
    setLoading(true);
    setError(null);
    setAdded(new Set());
    try {
      const data = await getRecommendations(form);
      setResults(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const addToGarden = (rec: PlantRecommendation) => {
    onAddPlant({
      id: '',
      name: rec.name,
      species: rec.scientificName,
      location: form.environment === 'indoor' ? 'Indoor' : 'Outdoor',
      waterScheduleDays: 7,
      lastWatered: new Date().toISOString(),
      notes: rec.description,
      healthStatus: 'healthy'
    });
    setAdded(prev => new Set([...prev, rec.name]));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">✨ Plant Recommendations</h2>
      <p className="text-slate-500 text-sm mb-6">Get AI-powered suggestions tailored to your space</p>

      {/* Form */}
      <div className="glass-panel rounded-2xl p-5 mb-6 custom-shadow">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs text-slate-500 mb-1 block">Your Location</label>
            <input
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="e.g. Mumbai, India"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400"
            />
          </div>

          {[
            { label: 'Environment', key: 'environment', opts: ['indoor', 'outdoor'] },
            { label: 'Light Level', key: 'lightLevel', opts: ['low', 'medium', 'high'] },
            { label: 'Maintenance', key: 'maintenance', opts: ['low', 'medium', 'high'] },
          ].map(({ label, key, opts }) => (
            <div key={key}>
              <label className="text-xs text-slate-500 mb-1 block capitalize">{label}</label>
              <select
                value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400"
              >
                {opts.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
              </select>
            </div>
          ))}

          <div className="flex items-center gap-3 pt-4">
            <input
              type="checkbox"
              id="petSafe"
              checked={form.petSafe}
              onChange={e => setForm(f => ({ ...f, petSafe: e.target.checked }))}
              className="w-4 h-4 accent-emerald-500"
            />
            <label htmlFor="petSafe" className="text-sm text-slate-600">Pet-safe plants only</label>
          </div>

          <div className="col-span-2">
            <label className="text-xs text-slate-500 mb-1 block">Additional Notes (optional)</label>
            <input
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="e.g. want herbs, limited space, need air-purifying plants..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        <button
          onClick={handleGet}
          disabled={loading}
          className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {loading ? '🌿 Finding plants...' : '✨ Get Recommendations'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm mb-4">⚠️ {error}</div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-700">🌱 Recommended Plants</h3>
          {results.map((rec, i) => (
            <div key={i} className="glass-panel rounded-2xl p-5 custom-shadow border border-emerald-50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-slate-800">{rec.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLOR[rec.difficulty] || 'bg-slate-100 text-slate-600'}`}>
                      {rec.difficulty}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs italic mb-2">{rec.scientificName}</p>
                  <p className="text-slate-600 text-sm mb-3">{rec.description}</p>
                  {rec.reason && (
                    <p className="text-emerald-600 text-xs bg-emerald-50 rounded-lg px-3 py-2 mb-3">
                      💡 {rec.reason}
                    </p>
                  )}
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>💧 {rec.waterNeeds}</span>
                    <span>☀️ {rec.lightNeeds}</span>
                  </div>
                </div>

                <button
                  onClick={() => addToGarden(rec)}
                  disabled={added.has(rec.name)}
                  className={`shrink-0 text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
                    added.has(rec.name)
                      ? 'bg-green-100 text-green-600 cursor-default'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {added.has(rec.name) ? '✓ Added' : '+ Add'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
