import { Plant, DiseaseAnalysis, PlantRecommendation, RecommendationRequest } from '../types';

const API_BASE_URL = 'http://localhost:5005/api';

// --- Garden Management ---

export const getPlants = async (): Promise<Plant[]> => {
  const response = await fetch(`${API_BASE_URL}/plants`);
  if (!response.ok) throw new Error('Failed to fetch plants');
  return response.json();
};

export const addPlant = async (plant: Partial<Plant>): Promise<Plant> => {
  const response = await fetch(`${API_BASE_URL}/plants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plant),
  });
  if (!response.ok) throw new Error('Failed to add plant');
  return response.json();
};

export const updatePlant = async (plant: Plant): Promise<Plant> => {
  const response = await fetch(`${API_BASE_URL}/plants/${plant.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plant),
  });
  if (!response.ok) throw new Error('Failed to update plant');
  return response.json();
};

export const removePlant = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/plants/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to remove plant');
};

// --- Disease Detection ---

export const analyzePlantDisease = async (file: File): Promise<DiseaseAnalysis> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/diagnose`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to analyze plant');
  }
  
  return response.json();
};

// --- Recommendations ---

export const getPlantRecommendations = async (criteria: RecommendationRequest): Promise<PlantRecommendation[]> => {
  const response = await fetch(`${API_BASE_URL}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(criteria),
  });

  if (!response.ok) {
     const errorData = await response.json();
     throw new Error(errorData.error || 'Failed to get recommendations');
  }

  return response.json();
};
