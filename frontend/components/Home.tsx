import React from 'react';
import { Leaf, Droplets, ArrowRight, Sparkles, Activity, Camera } from 'lucide-react';
import { Plant, ViewState } from '../types';

interface HomeProps {
  onNavigate: (view: ViewState) => void;
  plants: Plant[];
}

export const Home: React.FC<HomeProps> = ({ onNavigate, plants }) => {
  // Check for plants needing water
  const plantsNeedingWater = plants.filter(plant => {
    const last = new Date(plant.lastWatered);
    const next = new Date(last);
    next.setDate(last.getDate() + plant.waterScheduleDays);
    const today = new Date();
    today.setHours(0,0,0,0);
    next.setHours(0,0,0,0);
    return next <= today;
  });

  return (
    <div className="relative z-10 space-y-16 py-8">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="lg:w-1/2 space-y-8">
          <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Gardening</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-tight">
            Grow Smarter with <span className="text-emerald-600 relative">
              AI
              <span className="absolute -top-6 -right-8 text-4xl">🌱</span>
            </span>
          </h1>
          
          <p className="text-lg text-slate-600 max-w-xl leading-relaxed font-medium">
            Your personal plant companion that helps you discover, nurture, and grow beautiful plants with confidence—even if you're just starting out.
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => onNavigate('garden')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-emerald-200 flex items-center gap-2"
            >
              <Leaf className="w-5 h-5" />
              Get Started Free
            </button>
            <button 
              onClick={() => onNavigate('recommend')}
              className="bg-white/80 hover:bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-full font-semibold transition-all backdrop-blur-sm"
            >
              Explore Plants
            </button>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500 font-medium pt-4">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 5,000+ plants
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400"></span> AI care plans
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Plant doctor
            </span>
          </div>
        </div>

        {/* Hero Visual / Dashboard Preview */}
        <div className="lg:w-1/2 relative">
            {/* Background shape */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-50 to-emerald-50 rounded-[3rem] transform rotate-3 scale-95 opacity-80 z-0 shadow-lg"></div>
            
            <div className="relative z-10 bg-[#fbf8f3] rounded-[2.5rem] p-8 custom-shadow border border-slate-100/50 overflow-hidden min-h-[400px] flex flex-col justify-center items-center">
              {/* Illustration Placeholder - Using generic plant composition */}
              <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1599596395568-7c8702c28769?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center mix-blend-multiply"></div>
              
              <img 
                src="https://images.unsplash.com/photo-1530968464165-7a1861cbaf9f?q=80&w=2070&auto=format&fit=crop"
                alt="Indoor Plants"
                className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay rounded-[2.5rem]"
              />

              {/* Floating Cards */}
              
              {/* AI Tip Card */}
              <div className="absolute bottom-1/4 right-0 transform translate-x-4 md:-translate-x-4 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 max-w-xs animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">AI Tip</p>
                  <p className="font-bold text-slate-800">Move to brighter spot</p>
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => onNavigate('diagnose')}
          className="group bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left"
        >
          <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-500 mb-6 group-hover:scale-110 transition-transform">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Plant Doctor</h3>
          <p className="text-slate-500 mb-4">Upload a photo to detect diseases and get treatment plans.</p>
          <div className="flex items-center text-pink-500 font-medium text-sm group-hover:gap-2 transition-all">
            Diagnose now <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </button>

        <button 
          onClick={() => onNavigate('recommend')}
          className="group bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
            <Leaf className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Find Plants</h3>
          <p className="text-slate-500 mb-4">Discover the perfect plants for your space and lifestyle.</p>
          <div className="flex items-center text-blue-500 font-medium text-sm group-hover:gap-2 transition-all">
            Start quiz <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </button>

        <div className="bg-emerald-900/90 backdrop-blur-md p-8 rounded-3xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Your Garden Status</h3>
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <span className="text-emerald-200">Total Plants</span>
                <span className="text-2xl font-bold">{plants.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-200">Needs Water</span>
                <span className="text-2xl font-bold text-yellow-400">{plantsNeedingWater.length}</span>
              </div>
              <button 
                onClick={() => onNavigate('garden')}
                className="w-full bg-white/10 hover:bg-white/20 mt-4 py-3 rounded-xl font-medium transition-colors backdrop-blur-sm border border-white/10"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-800 rounded-full opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-800 rounded-full opacity-50 translate-y-1/2 -translate-x-1/2"></div>
        </div>
      </div>
    </div>
  );
};