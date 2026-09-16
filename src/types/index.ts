export type UserRole = 'farmer' | 'expert' | 'admin';

export type UserAccountRole = 'farmer' | 'official' | 'agronomist' | 'admin';
export type AccountStatus = 'approved' | 'pending_approval' | 'rejected';

export interface UserAccount {
  id: string;
  email: string;
  password?: string;
  name: string;
  phone?: string;
  role: UserAccountRole;
  status: AccountStatus;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  // Official / Agronomist specific
  department?: string;
  designation?: string;
  officialId?: string;
  district?: string;
  // Farmer specific
  village?: string;
  state?: string;
  primaryCrops?: string[];
  landSizeAcres?: number;
}

export type LanguageCode = 'en' | 'hi' | 'pa' | 'mr' | 'te' | 'ta' | 'bn';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  village?: string;
  block?: string;
  district?: string;
  state?: string;
  isManualPin?: boolean;
}

export interface WeatherCondition {
  temperature: number; // °C
  humidity: number; // %
  rainfall: number; // mm
  windSpeed: number; // km/h
  weatherCode: number;
  conditionText: string;
  forecast5Day?: {
    date: string;
    tempMax: number;
    tempMin: number;
    rainfall: number;
    humidity: number;
    riskScore: 'low' | 'medium' | 'high';
  }[];
}

export interface AgronomicRiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  fungalBlightRisk: 'low' | 'medium' | 'high';
  bacterialRisk: 'low' | 'medium' | 'high';
  pestOutbreakRisk: 'low' | 'medium' | 'high';
  explanation: string;
  activeTriggers: string[];
}

export interface ChemicalRecommendation {
  activeIngredientClass: string; // e.g. "Triazole fungicide (e.g. Hexaconazole 5% EC)"
  recommendedTarget: string;
  dosageGuidelines: string; // From vetted department list
  preHarvestIntervalDays: number; // PHI
  safetyPrecautions: string; // PPE, spray safety
}

export interface IPMAdvisory {
  monitoringSteps: string[];
  culturalControls: string[];
  biologicalControls: string[];
  mechanicalControls: string[];
  chemicalControls: ChemicalRecommendation[];
  waterAndSoilManagement?: string;
}

export interface DiseaseAlternative {
  diseaseName: string;
  confidence: number;
  pathogenType: 'fungal' | 'bacterial' | 'viral' | 'pest' | 'nutritional' | 'healthy';
}

export interface CropCase {
  id: string;
  farmerName: string;
  farmerPhone: string;
  cropName: string;
  cropVariety?: string;
  growthStage?: 'Germination' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Maturity' | 'Harvesting';
  imageUrl: string;
  timestamp: string;
  location: LocationCoords;
  probableDisease: string;
  confidence: number; // 0 to 100
  needsExpertReview: boolean;
  status: 'pending_review' | 'confirmed' | 'corrected' | 'rejected' | 'auto_diagnosed';
  top3Alternatives: DiseaseAlternative[];
  description: string;
  ipmAdvisory: IPMAdvisory;
  weatherSnapshot?: WeatherCondition;
  riskAssessment?: AgronomicRiskAssessment;
  expertReview?: {
    expertName: string;
    reviewedAt: string;
    decision: 'approved' | 'corrected' | 'rejected';
    correctedDisease?: string;
    notes: string;
  };
  followUps?: {
    id: string;
    imageUrl: string;
    timestamp: string;
    farmerNotes: string;
    recoveryStatus: 'improving' | 'unchanged' | 'worsened';
  }[];
  deviceMetadata?: {
    userAgent: string;
    connectionType?: string;
  };
}

export interface RiskAlert {
  id: string;
  caseId: string;
  cropAffected: string;
  diseaseName: string;
  confirmedAt: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  district: string;
  severity: 'high' | 'medium' | 'low';
  radiusKm: number;
  advisorySummary: string;
  affectedDistanceKm?: number;
}

export interface SensorDataReading {
  id: string;
  deviceId: string;
  readingType: 'pest_trap' | 'leaf_wetness' | 'soil_moisture' | 'micro_weather' | 'spore_counter';
  value: number;
  unit: string;
  gps: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  batteryPercent?: number;
  notes?: string;
}

export interface AgronomicRiskRule {
  id: string;
  category: 'fungal' | 'bacterial' | 'pest';
  title: string;
  minHumidity: number; // %
  minTemp: number; // °C
  maxTemp: number; // °C
  minRainfall48h: number; // mm
  consecutiveHours: number;
  riskLevel: 'medium' | 'high';
  notes: string;
  enabled: boolean;
}

export interface FarmerProfile {
  id: string;
  name: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  cropType: string;
  variety: string;
  sowingDate: string;
  fieldSizeAcres: number;
  soilType: 'Alluvial' | 'Black' | 'Red & Yellow' | 'Laterite' | 'Sandy Loam';
  irrigationType: 'Drip' | 'Sprinkler' | 'Canal' | 'Borewell / Tube well' | 'Rainfed';
}
