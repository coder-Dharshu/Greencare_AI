import React, { useState } from 'react';
import { SoilPredictionRequest, PlantPrediction, PredictionExplanation } from '../types';
import { predictBysoil, explainPrediction } from '../services/api';
import { Plant } from '../types';

interface SoilPredictorProps {
  onAddPlant: (plant: Plant) => void;
}

const INITIAL_SOIL: SoilPredictionRequest = {
  N: 30, P: 20, K: 25,
  temperature: 25, humidity: 65,
  ph: 6.5, rainfall: 90
};

const FEATURE_INFO: Record<string, { label: string; unit: string; min: number; max: number; desc: string }> = {
  N:           { label: 'Nitrogen (N)',     unit: 'mg/kg', min: 0,   max: 140, desc: 'Soil nitrogen content' },
  P:           { label: 'Phosphorus (P)',   unit: 'mg/kg', min: 0,   max: 100, desc: 'Soil phosphorus content' },
  K:           { label: 'Potassium (K)',    unit: 'mg/kg', min: 0,   max: 100, desc: 'Soil potassium content' },
  temperature: { label: 'Temperature',     unit: '°C',    min: 5,   max: 45,  desc: 'Average temperature' },
  humidity:    { label: 'Humidity',         unit: '%',     min: 10,  max: 100, desc: 'Relative humidity' },
  ph:          { label: 'Soil pH',          unit: '',      min: 3.5, max: 9,   desc: 'Soil pH level (3.5–9)' },
  rainfall:    { label: 'Rainfall',         unit: 'mm',    min: 0,   max: 300, desc: 'Average annual rainfall' },
};

export const SoilPredictor: React.FC<SoilPredictorProps> = ({ onAddPlant }) => {
  const [soil, setSoil] = useState<SoilPredictionRequest>(INITIAL_SOIL);
  const [predictions, setPredictions] = useState<PlantPrediction[]>([]);
  const [explanation, setExplanation] = useState<PredictionExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [explainLoading, setExplainLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setExplanation(null);
    try {
      const res = await predictBysoil(soil);
      setPredictions(res.predictions);
    } catch (e: any) {
      setError(e.message || 'Prediction failed. Make sure the model is loaded on the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    setExplainLoading(true);
    try {
      const res = await explainPrediction(soil);
      setExplanation(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setExplainLoading(false);
    }
  };

  const addToGarden = (pred: PlantPrediction) => {
    onAddPlant({
      id: '',
      name: pred.displayName,
      species: pred.plant,
      location: 'Outdoor',
      waterScheduleDays: 7,
      lastWatered: new Date().toISOString(),
      notes: `Recommended by Soil AI with ${pred.confidence}% confidence`,
      healthStatus: 'healthy'
    });
    setAdded(prev => new Set([...prev, pred.plant]));
  };

  const getBarColor = (importance: number) => {
    if (importance > 30) return 'bg-emerald-500';
    if (importance > 15) return 'bg-blue-400';
    return 'bg-slate-300';
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">🧪 Soil-Based AI</h2>
      <p className="text-slate-500 text-sm mb-6">
        Enter your soil and environment data — our Transformer model will predict the most compatible plants
      </p>

      {/* Soil Input Form */}
      <div className="glass-panel rounded-2xl p-5 mb-6 custom-shadow">
        <h3 className="font-semibold text-slate-700 mb-4">Soil & Environment Parameters</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(FEATURE_INFO).map(([key, info]) => (
            <div key={key}>
              <label className="text-xs text-slate-500 mb-1 block">
                {info.label} {info.unit && <span className="text-slate-400">({info.unit})</span>}
              </label>
              <input
                type="number"
                min={info.min}
                max={info.max}
                step={key === 'ph' ? 0.1 : 1}
                value={(soil as any)[key]}
                onChange={e => setSoil(s => ({ ...s, [key]: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
              />
              <p className="text-slate-400 text-[10px] mt-0.5">{info.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={handlePredict}
            disabled={loading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
          >
            {loading ? '🧠 Predicting...' : '🧪 Predict Best Plants'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm mb-4">
          ⚠️ {error}
          {error.includes('model') && (
            <p className="mt-1 text-xs">Run <code className="bg-red-100 px-1 rounded">python train.py</code> in the backend to generate the model file.</p>
          )}
        </div>
      )}

      {/* Predictions */}
      {predictions.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-700">🌱 Top Predicted Plants</h3>
            <button
              onClick={handleExplain}
              disabled={explainLoading}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {explainLoading ? 'Loading...' : '📊 Explain (XAI)'}
            </button>
          </div>

          <div className="space-y-3">
            {predictions.map((pred, i) => (
              <div key={pred.plant} className="glass-panel rounded-2xl p-4 custom-shadow border border-blue-50">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' :
                      i === 1 ? 'bg-slate-100 text-slate-600' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">{pred.displayName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${pred.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 shrink-0">{pred.confidence}%</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => addToGarden(pred)}
                    disabled={added.has(pred.plant)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors shrink-0 ${
                      added.has(pred.plant)
                        ? 'bg-green-100 text-green-600 cursor-default'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {added.has(pred.plant) ? '✓ Added' : '+ Add'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SHAP Explanation */}
      {explanation && (
        <div className="glass-panel rounded-2xl p-5 custom-shadow border border-purple-100">
          <h3 className="font-bold text-slate-700 mb-1">📊 Why {explanation.topPlant}?</h3>
          <p className="text-slate-500 text-sm mb-4">{explanation.explanation}</p>

          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Feature Importance</h4>
          <div className="space-y-2">
            {explanation.featureImportance.map(f => (
              <div key={f.feature} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-24 shrink-0">{FEATURE_INFO[f.feature]?.label || f.feature}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getBarColor(f.importance)}`}
                    style={{ width: `${Math.min(f.importance, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-10 text-right shrink-0">{f.importance.toFixed(1)}%</span>
                <span className="text-xs text-slate-400 w-16 text-right shrink-0">{f.value} {FEATURE_INFO[f.feature]?.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
