import React, { useState, useRef } from 'react';
import { DiseaseAnalysis } from '../types';
import { diagnosePlant } from '../services/api';

export const DiseaseDetector: React.FC = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<DiseaseAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) handleFile(f);
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await diagnosePlant(file);
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const confidence = result ? Math.round(result.confidence * 100) : 0;
  const statusColor = result?.healthStatus === 'healthy'
    ? 'text-green-600 bg-green-50 border-green-200'
    : result?.healthStatus === 'diseased'
    ? 'text-red-600 bg-red-50 border-red-200'
    : 'text-amber-600 bg-amber-50 border-amber-200';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">🔬 Plant Doctor</h2>
      <p className="text-slate-500 text-sm mb-6">Upload a photo of your plant to detect diseases, pests, or deficiencies</p>

      {/* Upload Area */}
      <div
        className={`glass-panel rounded-2xl border-2 border-dashed p-8 text-center mb-4 transition-colors custom-shadow
          ${preview ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 hover:border-emerald-300 cursor-pointer'}`}
        onClick={() => !preview && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl object-contain" />
            <button
              onClick={e => { e.stopPropagation(); setPreview(null); setFile(null); setResult(null); }}
              className="absolute top-2 right-2 bg-white shadow text-slate-500 hover:text-red-500 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <div className="text-4xl mb-3">📷</div>
            <p className="text-slate-600 font-medium">Drop image here or click to upload</p>
            <p className="text-slate-400 text-xs mt-1">Supports JPG, PNG, WEBP</p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {file && !loading && (
        <button
          onClick={analyze}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors mb-6"
        >
          🔍 Analyze Plant
        </button>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3 animate-bounce">🌿</div>
          <p className="text-emerald-600 font-medium">Analyzing your plant...</p>
          <p className="text-slate-400 text-sm mt-1">Powered by Llama 4 Scout Vision</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm mb-4">
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {!result.isPlant ? (
            <div className="glass-panel rounded-2xl p-5 border border-amber-200 bg-amber-50/30 custom-shadow">
              <p className="text-amber-700 font-medium">🌿 No plant detected in this image. Please upload a clear photo of a plant or leaf.</p>
            </div>
          ) : (
            <>
              {/* Plant Identity + Health */}
              <div className="glass-panel rounded-2xl p-5 custom-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{result.plantName}</h3>
                    <p className="text-slate-500 text-sm">{result.diagnosis}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${statusColor}`}>
                    {result.healthStatus === 'healthy' ? '✅ Healthy' : result.healthStatus === 'diseased' ? '⚠️ Diseased' : '❓ Unknown'}
                  </span>
                </div>
                {/* Confidence bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Confidence</span>
                    <span className="font-semibold">{confidence}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${confidence > 70 ? 'bg-emerald-500' : confidence > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Treatment */}
              {result.treatment?.length > 0 && (
                <div className="glass-panel rounded-2xl p-5 custom-shadow border border-red-100">
                  <h4 className="font-bold text-slate-700 mb-3">💊 Treatment Steps</h4>
                  <ol className="space-y-2">
                    {result.treatment.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-600">
                        <span className="bg-red-100 text-red-600 font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Preventative Measures */}
              {result.preventativeMeasures?.length > 0 && (
                <div className="glass-panel rounded-2xl p-5 custom-shadow border border-green-100">
                  <h4 className="font-bold text-slate-700 mb-3">🛡️ Preventative Care</h4>
                  <ul className="space-y-2">
                    {result.preventativeMeasures.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-600">
                        <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
