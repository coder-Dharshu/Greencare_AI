export interface Plant {
  id: string;
  name: string;
  species: string;
  location: string;
  waterScheduleDays: number;
  lastWatered: string;
  notes?: string;
  imageUrl?: string;
  healthStatus?: 'healthy' | 'sick' | 'recovering';
}

export interface DiseaseAnalysis {
  isPlant: boolean;
  plantName: string;
  healthStatus: 'healthy' | 'diseased' | 'unknown';
  diagnosis: string;
  confidence: number;
  treatment: string[];
  preventativeMeasures: string[];
}

export interface RecommendationRequest {
  location: string;
  environment: 'indoor' | 'outdoor';
  lightLevel: 'low' | 'medium' | 'high';
  maintenance: 'low' | 'medium' | 'high';
  petSafe: boolean;
  notes?: string;
}

export interface PlantRecommendation {
  name: string;
  scientificName: string;
  description: string;
  waterNeeds: string;
  lightNeeds: string;
  difficulty: string;
  reason?: string;
}

export interface SoilPredictionRequest {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

export interface PlantPrediction {
  plant: string;
  displayName: string;
  confidence: number;
}

export interface FeatureImportance {
  feature: string;
  value: number;
  importance: number;
}

export interface PredictionExplanation {
  topPlant: string;
  confidence: number;
  featureImportance: FeatureImportance[];
  explanation: string;
}

export interface WateringReminder {
  plantId: string;
  plantName: string;
  daysLeft: number;
  status: 'overdue' | 'due_today' | 'upcoming';
  message: string;
}

export interface UserProfile {
  experienceLevel: 'beginner' | 'hobbyist' | 'expert';
  gardeningGoals: string;
  preferredLocation: string;
  availableSpace: string;
  notificationsEnabled: boolean;
}

export type ViewState = 'home' | 'garden' | 'diagnose' | 'recommend' | 'predict' | 'profile';
