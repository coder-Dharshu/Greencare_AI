import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Garden } from './components/Garden';
import { DiseaseDetector } from './components/DiseaseDetector';
import { RecommendationEngine } from './components/RecommendationEngine';
import { Home } from './components/Home';
import { ViewState, Plant } from './types';
import { getPlants, addPlant, removePlant, updatePlant } from './services/api';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  // Load plants on mount
  useEffect(() => {
    loadGarden();
  }, []);

  const loadGarden = async () => {
    try {
      const data = await getPlants();
      setPlants(data);
    } catch (error) {
      console.error("Failed to load garden:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlant = async (newPlant: Plant) => {
    try {
      // Optimistic update or wait for server? Let's wait for server to get real ID if needed, 
      // but here we might want to just send the data.
      // note: id generation is now on backend or frontend? 
      // Backend generates ID if we use the backend AddPlant logic I wrote.
      // Let's adjust to pass plant data without ID if backend generates it, 
      // or just pass it all. My backend code generates a new UUID.
      const savedPlant = await addPlant(newPlant);
      setPlants(prev => [...prev, savedPlant]);
    } catch (error) {
      console.error("Failed to add plant:", error);
      alert("Failed to save plant to cloud.");
    }
  };

  const handleRemovePlant = async (id: string) => {
    try {
      await removePlant(id);
      setPlants(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Failed to remove plant:", error);
      alert("Failed to remove plant.");
    }
  };

  const handleUpdatePlant = async (updatedPlant: Plant) => {
    try {
      const saved = await updatePlant(updatedPlant);
      setPlants(prev => prev.map(p => p.id === saved.id ? saved : p));
    } catch (error) {
      console.error("Failed to update plant:", error);
      alert("Failed to update plant.");
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-emerald-600">Loading your garden...</div>;
  }

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
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
    </Layout>
  );
};

export default App;