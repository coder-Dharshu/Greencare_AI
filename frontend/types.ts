export interface Plant {
  id: string;
  name: string;
  species: string;
  location: string;
  waterScheduleDays: number;
  lastWatered: string; // ISO Date string
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
}

export type ViewState = 'home' | 'garden' | 'diagnose' | 'recommend';