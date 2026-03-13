import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Garden } from './components/Garden';
import { DiseaseDetector } from './components/DiseaseDetector';
import { RecommendationEngine } from './components/RecommendationEngine';
import { SoilPredictor } from './components/SoilPredictor';
import { Profile } from './components/Profile';
import { Home } from './components/Home';
import { ViewState, Plant, WateringReminder } from './types';
import { getPlants, addPlant, removePlant, updatePlant, getReminders } from './services/api';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [plants, setPlants] = useState<Plant[]>([]);
  const [reminders, setReminders] = useState<WateringReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGarden();
  }, []);

  // Refresh reminders whenever plants change
  useEffect(() => {
    if (!loading) {
      getReminders().then(setReminders).catch(() => {});
    }
  }, [plants, loading]);

  const loadGarden = async () => {
    try {
      const data = await getPlants();
      setPlants(data);
    } catch (error) {
      console.error('Failed to load garden:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlant = async (newPlant: Plant) => {
    try {
      const saved = await addPlant(newPlant);
      setPlants(prev => [saved, ...prev]);
    } catch (error) {
      console.error('Failed to add plant:', error);
      alert('Failed to save plant. Is the backend running?');
    }
  };

  const handleRemovePlant = async (id: string) => {
    try {
      await removePlant(id);
      setPlants(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to remove plant:', error);
    }
  };

  const handleUpdatePlant = async (updated: Plant) => {
    try {
      const saved = await updatePlant(updated);
      setPlants(prev => prev.map(p => p.id === saved.id ? saved : p));
    } catch (error) {
      console.error('Failed to update plant:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3 text-emerald-600">
        <div className="text-4xl animate-bounce">🌱</div>
        <p className="font-medium">Loading your garden...</p>
      </div>
    );
  }

  const overdueCount = reminders.filter(r => r.status === 'overdue' || r.status === 'due_today').length;

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView} reminderCount={overdueCount}>
      {currentView === 'home' && (
        <Home onNavigate={setCurrentView} plants={plants} />
      )}
      {currentView === 'garden' && (
        <Garden
          plants={plants}
          onAddPlant={handleAddPlant}
          onRemovePlant={handleRemovePlant}
          onUpdatePlant={handleUpdatePlant}
        />
      )}
      {currentView === 'diagnose' && <DiseaseDetector />}
      {currentView === 'recommend' && <RecommendationEngine onAddPlant={handleAddPlant} />}
      {currentView === 'predict' && <SoilPredictor onAddPlant={handleAddPlant} />}
      {currentView === 'profile' && <Profile />}
    </Layout>
  );
};

export default App;
