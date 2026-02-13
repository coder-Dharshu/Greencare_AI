import React, { useState, useRef } from 'react';
import { Upload, Camera, Loader2, AlertTriangle, CheckCircle, Stethoscope, RefreshCcw, Sparkles, Image as ImageIcon } from 'lucide-react';
import { analyzePlantDisease } from '../services/api';
import { DiseaseAnalysis } from '../types';

export const DiseaseDetector: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DiseaseAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setAnalysis(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzePlantDisease(file);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 bg-pink-100 text-pink-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
          <Camera className="w-4 h-4" />
          <span>Plant Doctor</span>
        </div>
        <h2 className="text-4xl font-bold text-slate-800 mb-4 flex items-center justify-center gap-3">
          AI-Powered Plant Diagnosis
          <Stethoscope className="text-indigo-500 w-8 h-8" />
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
          Worried about your plant? Upload a photo and get instant diagnosis with treatment recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="h-full">
          {!preview ? (
            <div
              onClick={triggerFileInput}
              className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-300 hover:border-emerald-400 hover:bg-slate-50 transition-all cursor-pointer h-[500px] flex flex-col items-center justify-center p-8 relative group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-10 h-10" />
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-3">Upload Plant Photo</h3>
              <p className="text-slate-500 text-center mb-8 max-w-xs">
                Drag and drop or click to upload a photo of your plant
              </p>

              <button className="bg-emerald-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 flex items-center gap-2">
                <Upload className="w-4 h-4" /> Choose Photo
              </button>

              <p className="absolute bottom-8 text-slate-400 text-xs font-medium uppercase tracking-wide">
                Supports JPG, PNG, HEIC • Max 10MB
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-slate-200 h-[500px] flex flex-col">
              <div className="relative flex-1 bg-slate-50 rounded-[2rem] overflow-hidden group">
                <img
                  src={preview}
                  alt="Plant Preview"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={reset}
                    className="bg-white/90 text-red-500 px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-white"
                  >
                    <RefreshCcw className="w-4 h-4" /> Change Photo
                  </button>
                </div>
              </div>

              <div className="mt-4 px-4 pb-2">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center space-x-3 text-white transition-all ${isAnalyzing
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200 active:scale-[0.99]'
                    }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing Plant Health...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Analyze Plant</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[500px] flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-400 uppercase tracking-wider text-sm">Diagnosis Results</h3>
          </div>

          {!analysis ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center p-8 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm text-slate-300">
                <Camera className="w-8 h-8" />
              </div>
              <p className="text-lg font-medium text-slate-500">Upload a photo to see diagnosis results</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-full overflow-y-auto custom-scrollbar">
              {/* Header Status */}
              <div className="flex items-start justify-between pb-6 border-b border-slate-100">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{analysis.plantName}</h3>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${analysis.healthStatus === 'healthy'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                      {analysis.healthStatus}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">
                      {(analysis.confidence * 100).toFixed(0)}% Match
                    </span>
                  </div>
                </div>
                {analysis.healthStatus === 'healthy' ? (
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                )}
              </div>

              {/* Diagnosis Box */}
              <div className="bg-slate-50 p-5 rounded-2xl">
                <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Stethoscope className="w-4 h-4 text-indigo-500" /> Diagnosis
                </h4>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {analysis.diagnosis}
                </p>
              </div>

              {/* Treatment Steps */}
              {analysis.treatment && analysis.treatment.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Treatment Plan</h4>
                  <div className="space-y-3">
                    {analysis.treatment.map((step, idx) => (
                      <div key={idx} className="flex gap-4 items-start bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prevention */}
              {analysis.preventativeMeasures && analysis.preventativeMeasures.length > 0 && (
                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                  <h4 className="font-bold text-emerald-800 mb-3 text-sm uppercase tracking-wide">Care Tips</h4>
                  <ul className="space-y-2">
                    {analysis.preventativeMeasures.map((m, i) => (
                      <li key={i} className="flex items-start text-emerald-700 text-sm">
                        <span className="mr-2 text-emerald-500 font-bold">•</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};