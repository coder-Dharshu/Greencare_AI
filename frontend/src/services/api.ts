import {
  Plant, DiseaseAnalysis, PlantRecommendation, RecommendationRequest,
  SoilPredictionRequest, PlantPrediction, PredictionExplanation,
  WateringReminder, UserProfile
} from '../types';

const BASE_URL = 'http://localhost:5005';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API error');
  }
  return res.json();
}

export const getPlants = () => apiFetch<Plant[]>('/api/plants');

export const addPlant = (plant: Omit<Plant, 'id'>) =>
  apiFetch<Plant>('/api/plants', { method: 'POST', body: JSON.stringify(plant) });

export const updatePlant = (plant: Plant) =>
  apiFetch<Plant>(`/api/plants/${plant.id}`, { method: 'PUT', body: JSON.stringify(plant) });

export const removePlant = (id: string) =>
  apiFetch<{ status: string }>(`/api/plants/${id}`, { method: 'DELETE' });

export const getReminders = () => apiFetch<WateringReminder[]>('/api/reminders');

export const diagnosePlant = async (file: File): Promise<DiseaseAnalysis> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE_URL}/api/diagnose`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Diagnosis failed');
  return res.json();
};

export const getRecommendations = (criteria: RecommendationRequest) =>
  apiFetch<PlantRecommendation[]>('/api/recommend', {
    method: 'POST', body: JSON.stringify(criteria)
  });

export const predictBysoil = (data: SoilPredictionRequest) =>
  apiFetch<{ predictions: PlantPrediction[] }>('/api/predict', {
    method: 'POST', body: JSON.stringify(data)
  });

export const explainPrediction = (data: SoilPredictionRequest) =>
  apiFetch<PredictionExplanation>('/api/explain', {
    method: 'POST', body: JSON.stringify(data)
  });

export const getProfile = () => apiFetch<UserProfile>('/api/profile');

export const updateProfile = (profile: UserProfile) =>
  apiFetch<{ status: string }>('/api/profile', {
    method: 'PUT', body: JSON.stringify(profile)
  });
