import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  DEFAULT_RISK_RULES,
  INITIAL_CROP_CASES,
  INITIAL_FARMER_PROFILES,
  INITIAL_RISK_ALERTS,
  INITIAL_SENSOR_READINGS,
  VETTED_PESTICIDE_REGISTRY
} from './src/data/mockAndReferenceData.ts';
import { CropCase, FarmerProfile, RiskAlert, SensorDataReading, AgronomicRiskRule, UserAccount } from './src/types/index.ts';

dotenv.config();

const runtimeFilename = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const runtimeDirectory = path.dirname(runtimeFilename);

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const app = express();
const allowedOrigins = new Set(
  (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean)
);

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  const originAllowed = !requestOrigin || allowedOrigins.size === 0 || allowedOrigins.has(requestOrigin);

  if (originAllowed && requestOrigin) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(originAllowed ? 204 : 403);
  }

  next();
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initial User Accounts including Root Administrator
const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-admin-root',
    email: 'devp3987@gmail.com',
    password: '211008gaints',
    name: 'Dev P. (System Administrator)',
    phone: '+91 9800001122',
    role: 'admin',
    status: 'approved',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    approvedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    approvedBy: 'System Root',
    designation: 'Chief Administrator & Security Officer',
    department: 'Directorate of Agriculture & Remote Sensing Surveillance'
  },
  {
    id: 'user-official-nashik',
    email: 'official.nashik@gov.agri.in',
    password: 'Official@123',
    name: 'Dr. R. K. Sharma',
    phone: '+91 9822334455',
    role: 'official',
    status: 'approved',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    approvedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    approvedBy: 'devp3987@gmail.com',
    designation: 'District Agricultural Officer',
    department: 'Department of Agriculture, Maharashtra',
    officialId: 'MAH-AGRI-0812',
    district: 'Nashik'
  },
  {
    id: 'user-agronomist-patil',
    email: 'dr.patil@agri.univ.in',
    password: 'Doctor@123',
    name: 'Dr. V. M. Patil',
    phone: '+91 9422019876',
    role: 'agronomist',
    status: 'approved',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    approvedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    approvedBy: 'devp3987@gmail.com',
    designation: 'Senior Plant Pathologist',
    department: 'ICAR National Research Centre',
    officialId: 'ICAR-PATH-492',
    district: 'Pune'
  },
  {
    id: 'user-pending-official-pune',
    email: 'officer.pune@gov.agri.in',
    password: 'Officer@123',
    name: 'Sunita Deshmukh',
    phone: '+91 9876543210',
    role: 'official',
    status: 'pending_approval',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    designation: 'Sub-Divisional Agriculture Officer',
    department: 'Division of Crop Protection, Pune',
    officialId: 'MAH-AGRI-9914',
    district: 'Pune'
  },
  {
    id: 'user-pending-agronomist-verma',
    email: 'arun.pathology@kvk.res.in',
    password: 'Arun@123',
    name: 'Dr. Arun Verma',
    phone: '+91 9123456789',
    role: 'agronomist',
    status: 'pending_approval',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    designation: 'Agronomist & Extension Specialist',
    department: 'Krishi Vigyan Kendra (KVK)',
    officialId: 'KVK-EXT-2041',
    district: 'Aurangabad'
  },
  {
    id: 'user-farmer-ramesh',
    email: 'ramesh.patil@kisan.in',
    password: 'farmer123',
    name: 'Ramesh Patil',
    phone: '+91 9822012345',
    role: 'farmer',
    status: 'approved',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    village: 'Dindori',
    district: 'Nashik',
    state: 'Maharashtra',
    primaryCrops: ['Tomato', 'Grapes', 'Onion'],
    landSizeAcres: 4.5
  }
];

// In-memory data store
let cropCases: CropCase[] = [...INITIAL_CROP_CASES];
let riskAlerts: RiskAlert[] = [...INITIAL_RISK_ALERTS];
let sensorReadings: SensorDataReading[] = [...INITIAL_SENSOR_READINGS];
let riskRules: AgronomicRiskRule[] = [...DEFAULT_RISK_RULES];
let farmerProfiles: FarmerProfile[] = [...INITIAL_FARMER_PROFILES];
let userAccounts: UserAccount[] = [...INITIAL_USERS];

// Lazy Gemini client helper
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiClient;
}

// Haversine distance in km
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Agropari - AI Crop Health Management System',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    kindwiseConfigured: Boolean(process.env.KINDWISE_API_KEY)
  });
});

// GET all cases
app.get('/api/cases', (req, res) => {
  res.json({ cases: cropCases });
});

// POST analyze crop with AI (Module 1, 2, 3, 4, 9)
app.post('/api/analyze-crop', async (req, res) => {
  try {
    const requestBody = req.body && typeof req.body === 'object' ? req.body : {};
    const {
      imageBase64,
      cropName = 'Field Crop',
      cropVariety = 'Standard',
      growthStage = 'Vegetative',
      farmerName = 'Local Farmer',
      farmerPhone = '+91 9800000000',
      location = { latitude: 28.6139, longitude: 77.209, accuracy: 20, district: 'Local' },
      weatherSnapshot,
      riskAssessment,
      deviceMetadata
    } = requestBody;

    if (typeof imageBase64 !== 'string' || !imageBase64.startsWith('data:image/')) {
      return res.status(400).json({
        status: 'invalid_image',
        message: 'Please upload a valid crop image.'
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        status: 'analysis_unavailable',
        message: 'Crop image analysis is unavailable. Configure GEMINI_API_KEY and restart the API server.'
      });
    }

    let diagnosisResult: {
      probableDisease: string;
      confidence: number;
      top3Alternatives: { diseaseName: string; confidence: number; pathogenType: 'fungal' | 'bacterial' | 'viral' | 'pest' | 'nutritional' | 'healthy' }[];
      description: string;
      ipmAdvisory: {
        monitoringSteps: string[];
        culturalControls: string[];
        biologicalControls: string[];
        mechanicalControls: string[];
        chemicalControls: {
          activeIngredientClass: string;
          recommendedTarget: string;
          dosageGuidelines: string;
          preHarvestIntervalDays: number;
          safetyPrecautions: string;
        }[];
      };
    } | null = null;

    // 1. Attempt Gemini Multimodal Vision if API Key is configured
    if (imageBase64) {
      try {
        // Strip data:image/...;base64, if present
        let cleanBase64 = imageBase64;
        let mimeType = 'image/jpeg';
        if (imageBase64.includes('base64,')) {
          const parts = imageBase64.split('base64,');
          cleanBase64 = parts[1];
          const mimeMatch = parts[0].match(/data:([^;]+);/);
          if (mimeMatch) mimeType = mimeMatch[1];
        }

        const prompt = `You are a world-class agronomist and plant pathologist working on the Agropari Crop Health Management System in India.
Analyze the provided image in two stages. First, evaluate whether the image displays a real plant leaf or crop foliage. If it shows a car, face, person, animal, building, food, screenshot, random object, or any non-leaf image, return status: "NOT_A_LEAF" and stop. Only if a valid plant leaf or crop foliage is present, analyze the pathological symptoms.
Context:
Crop: ${cropName} (Variety: ${cropVariety}, Stage: ${growthStage})
Location: Lat ${location.latitude}, Lon ${location.longitude}, District: ${location.district || 'Rural India'}
Live Weather: Temp ${weatherSnapshot?.temperature || 28}°C, Humidity ${weatherSnapshot?.humidity || 75}%, Rainfall ${weatherSnapshot?.rainfall || 0}mm.

CRITICAL IPM & SAFETY RULES:
1. Return is_plant as a probability from 0 to 1. A valid leaf requires is_plant >= 0.70.
2. Identify the probable disease, pest, or deficiency (or Healthy Crop) only for a valid leaf.
3. Assign confidence integer percentage (0-100). If uncertain or ambiguous, keep confidence below 60.
4. Provide top 3 differential diagnoses (alternatives).
5. Provide structured Integrated Pest Management (IPM) in standard sequencing:
   - monitoringSteps (list of strings)
   - culturalControls (list of strings)
   - biologicalControls (list of strings, e.g. Trichoderma, Pseudomonas, neem, pheromones)
   - mechanicalControls (list of strings)
   - chemicalControls (list of objects: activeIngredientClass, recommendedTarget, dosageGuidelines, preHarvestIntervalDays, safetyPrecautions).
   *RULE: NEVER name commercial brand names for chemicals. Use only active ingredient chemical classes (e.g. "Triazole fungicide e.g. Hexaconazole 5% EC", "Carbamate", "Copper Oxychloride"). Include Pre-Harvest Interval (PHI) in days and strict safety precautions.*

Return ONLY valid JSON matching this exact schema:
{
  "status": "VALID_LEAF"|"NOT_A_LEAF",
  "is_plant": 0.0,
  "probableDisease": "string",
  "confidence": number,
  "top3Alternatives": [
    { "diseaseName": "string", "confidence": number, "pathogenType": "fungal"|"bacterial"|"viral"|"pest"|"nutritional"|"healthy" }
  ],
  "description": "2-3 sentence clinical diagnosis explaining leaf symptoms observed.",
  "ipmAdvisory": {
    "monitoringSteps": ["step 1", "step 2"],
    "culturalControls": ["step 1", "step 2"],
    "biologicalControls": ["step 1", "step 2"],
    "mechanicalControls": ["step 1"],
    "chemicalControls": [
      {
        "activeIngredientClass": "string",
        "recommendedTarget": "string",
        "dosageGuidelines": "string",
        "preHarvestIntervalDays": number,
        "safetyPrecautions": "string"
      }
    ]
  }
}`;

        // Resilient candidate model fallback order including high-quota flash models
        const candidateModels = [
          'gemini-2.5-flash',
          'gemini-1.5-flash',
          'gemini-3.8-flash',
          'gemini-3.1-flash-lite',
          'gemini-flash-latest'
        ];
        let response: any = null;

        for (const modelName of candidateModels) {
          try {
            const apiPromise = ai.models.generateContent({
              model: modelName,
              contents: {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType,
                      data: cleanBase64
                    }
                  }
                ]
              },
              config: {
                responseMimeType: 'application/json',
                temperature: 0.2
              }
            });

            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Timeout with ${modelName}`)), 10000)
            );

            response = await Promise.race([apiPromise, timeoutPromise]);
            if (response?.text) break;
          } catch (modelErr: any) {
            // Handle transient 503, 429 quota exhaustion, or timeouts by cascading to next model
            const errMsg = String(modelErr?.message || modelErr || '');
            console.warn(`[Gemini Cascade] ${modelName} encountered issue: ${errMsg.slice(0, 150)}`);
            const isTransient =
              errMsg.includes('503') ||
              errMsg.includes('high demand') ||
              errMsg.includes('UNAVAILABLE') ||
              errMsg.includes('429') ||
              errMsg.includes('resource_exhausted') ||
              errMsg.includes('quota');
            if (isTransient) {
              await new Promise((resolve) => setTimeout(resolve, 300));
            }
          }
        }

        if (response?.text) {
          const rawText = response.text.trim();
          const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
          const parsed = JSON.parse(cleanJson);
          const isPlantProbability = Number(parsed.is_plant ?? parsed.isPlant);
          if (parsed.status === 'NOT_A_LEAF' || !Number.isFinite(isPlantProbability) || isPlantProbability < 0.70) {
            return res.status(422).json({
              status: 'invalid_image',
              message: 'No crop leaf detected. Please upload a clear photo of an affected plant leaf.'
            });
          }

          if (parsed.status !== 'VALID_LEAF' || !parsed.probableDisease || parsed.confidence === undefined) {
            throw new Error('Vision model returned an invalid leaf-screening response');
          }

          if (parsed.probableDisease && parsed.confidence !== undefined) {
            // Normalize top3Alternatives to ensure object structure matches client expectation
            if (Array.isArray(parsed.top3Alternatives)) {
              parsed.top3Alternatives = parsed.top3Alternatives.map((alt: any, idx: number) => {
                if (typeof alt === 'string') {
                  return {
                    diseaseName: alt,
                    confidence: Math.max(10, Math.round(Number(parsed.confidence || 75) * (0.6 - idx * 0.18))),
                    pathogenType: 'fungal'
                  };
                }
                return {
                  diseaseName: alt.diseaseName || alt.name || alt.disease || 'Alternative Diagnosis',
                  confidence: Number(alt.confidence) || 50,
                  pathogenType: alt.pathogenType || 'fungal'
                };
              });
            }
            // Ensure ipmAdvisory arrays exist
            if (!parsed.ipmAdvisory) {
              parsed.ipmAdvisory = {};
            }
            parsed.ipmAdvisory.monitoringSteps = Array.isArray(parsed.ipmAdvisory.monitoringSteps) ? parsed.ipmAdvisory.monitoringSteps : [];
            parsed.ipmAdvisory.culturalControls = Array.isArray(parsed.ipmAdvisory.culturalControls) ? parsed.ipmAdvisory.culturalControls : [];
            parsed.ipmAdvisory.biologicalControls = Array.isArray(parsed.ipmAdvisory.biologicalControls) ? parsed.ipmAdvisory.biologicalControls : [];
            parsed.ipmAdvisory.mechanicalControls = Array.isArray(parsed.ipmAdvisory.mechanicalControls) ? parsed.ipmAdvisory.mechanicalControls : [];
            parsed.ipmAdvisory.chemicalControls = Array.isArray(parsed.ipmAdvisory.chemicalControls) ? parsed.ipmAdvisory.chemicalControls : [];

            parsed.confidence = Math.max(0, Math.min(100, Number(parsed.confidence)));

            diagnosisResult = parsed;
          }
        }
      } catch (geminiErr: any) {
        console.log('Gemini model unavailable or returned an invalid response; routing to safe review fallback.');
      }
    }

    // Do not create a case when all vision models fail. The client receives a structured error.
    if (!diagnosisResult) {
      return res.status(503).json({
        status: 'analysis_unavailable',
        message: 'Crop image analysis could not be completed. Please try again or send the image to an agronomist for review.'
      });
    }

    const isLowConfidence = diagnosisResult.confidence < 60;
    const needsExpertReview = isLowConfidence;
    if (isLowConfidence) {
      diagnosisResult.probableDisease = 'Low Confidence / Ambiguous';
      diagnosisResult.description = `The image appears to show crop foliage, but the disease signal is ambiguous (${diagnosisResult.confidence}% confidence). An agronomist must verify the diagnosis before treatment.`;
      diagnosisResult.ipmAdvisory.chemicalControls = [];
    }
    const newCaseId = `case-${Date.now()}`;

    const newCase: CropCase = {
      id: newCaseId,
      farmerName,
      farmerPhone,
      cropName,
      cropVariety,
      growthStage,
      imageUrl: imageBase64?.startsWith('data:') ? imageBase64 : `https://images.unsplash.com/photo-1592417817098-8f3d6ef23a67?auto=format&fit=crop&w=800&q=80`,
      timestamp: new Date().toISOString(),
      location,
      probableDisease: diagnosisResult.probableDisease,
      confidence: diagnosisResult.confidence,
      needsExpertReview,
      status: needsExpertReview ? 'pending_review' : 'confirmed',
      top3Alternatives: diagnosisResult.top3Alternatives,
      description: diagnosisResult.description,
      ipmAdvisory: diagnosisResult.ipmAdvisory,
      weatherSnapshot,
      riskAssessment,
      deviceMetadata
    };

    cropCases.unshift(newCase);

    res.status(201).json({
      success: true,
      case: newCase
    });
  } catch (err: any) {
    console.error('Error in /api/analyze-crop:', err);
    res.status(500).json({ success: false, error: err.message || 'Analysis error' });
  }
});

// Expert review queue update (Module 8 & Module 6 Alert Network trigger)
app.put('/api/cases/:id/review', (req, res) => {
  const { id } = req.params;
  const { decision, notes, expertName, correctedDisease } = req.body;

  const targetIndex = cropCases.findIndex((c) => c.id === id);
  if (targetIndex === -1) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const currentCase = cropCases[targetIndex];
  const updatedCase: CropCase = {
    ...currentCase,
    status: decision === 'approved' ? 'confirmed' : decision === 'corrected' ? 'corrected' : 'rejected',
    needsExpertReview: false,
    probableDisease: decision === 'corrected' && correctedDisease ? correctedDisease : currentCase.probableDisease,
    expertReview: {
      expertName: expertName || 'District Agricultural Officer',
      reviewedAt: new Date().toISOString(),
      decision,
      correctedDisease,
      notes: notes || 'Reviewed and validated.'
    }
  };

  cropCases[targetIndex] = updatedCase;

  // MODULE 6: 10 KM RISK NETWORK & ALERTS
  // If expert confirms/approves, find all farmers within 10 km and generate alert
  if (decision === 'approved' || decision === 'corrected') {
    const alertId = `alert-${Date.now()}`;
    const diseaseName = updatedCase.probableDisease;
    const caseLat = updatedCase.location.latitude;
    const caseLon = updatedCase.location.longitude;

    // Check if duplicate alert exists within 10km recently (rate-limit: 1 per disease-cluster)
    const existingRecent = riskAlerts.find(
      (a) =>
        a.diseaseName.toLowerCase() === diseaseName.toLowerCase() &&
        haversineDistanceKm(a.coordinates.latitude, a.coordinates.longitude, caseLat, caseLon) <= 10
    );

    if (!existingRecent) {
      const newAlert: RiskAlert = {
        id: alertId,
        caseId: updatedCase.id,
        cropAffected: updatedCase.cropName,
        diseaseName,
        confirmedAt: new Date().toISOString(),
        coordinates: { latitude: caseLat, longitude: caseLon },
        district: updatedCase.location.district || 'District Cluster',
        severity: updatedCase.riskAssessment?.overallRisk === 'high' ? 'high' : 'medium',
        radiusKm: 10,
        advisorySummary: `Confirmed ${diseaseName} on ${updatedCase.cropName} by official expert. Immediate preventive IPM steps recommended within 10 km.`,
        affectedDistanceKm: 0
      };
      riskAlerts.unshift(newAlert);
    }
  }

  res.json({ success: true, case: updatedCase });
});

// Follow-up photo upload (Module 10)
app.post('/api/cases/:id/follow-up', (req, res) => {
  const { id } = req.params;
  const { imageUrl, farmerNotes, recoveryStatus } = req.body;

  const targetIndex = cropCases.findIndex((c) => c.id === id);
  if (targetIndex === -1) {
    return res.status(404).json({ error: 'Case not found' });
  }

  const followUp = {
    id: `followup-${Date.now()}`,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a67?auto=format&fit=crop&w=800&q=80',
    timestamp: new Date().toISOString(),
    farmerNotes: farmerNotes || 'Follow-up observation after IPM treatment.',
    recoveryStatus: recoveryStatus || 'improving'
  };

  const currentCase = cropCases[targetIndex];
  const followUps = currentCase.followUps ? [...currentCase.followUps, followUp] : [followUp];

  cropCases[targetIndex] = {
    ...currentCase,
    followUps
  };

  res.json({ success: true, followUp, case: cropCases[targetIndex] });
});

// GET alerts (both /api/alerts and /api/risk-alerts)
const handleGetAlerts = (req: express.Request, res: express.Response) => {
  const { lat, lon } = req.query;
  if (lat && lon) {
    const userLat = parseFloat(lat as string);
    const userLon = parseFloat(lon as string);
    const enrichedAlerts = riskAlerts.map((a) => {
      const dist = haversineDistanceKm(userLat, userLon, a.coordinates.latitude, a.coordinates.longitude);
      return {
        ...a,
        affectedDistanceKm: dist,
        isWithin10km: dist <= 10
      };
    });
    return res.json({ alerts: enrichedAlerts });
  }
  res.json({ alerts: riskAlerts });
};

app.get('/api/alerts', handleGetAlerts);
app.get('/api/risk-alerts', handleGetAlerts);

// MODULE 5: Sensor Data Ingestion
app.post('/api/sensor-data', (req, res) => {
  const { device_id, reading_type, value, gps, timestamp, notes, battery_percent } = req.body;

  if (!device_id || reading_type === undefined || value === undefined) {
    return res.status(400).json({ error: 'device_id, reading_type, and value are required.' });
  }

  const newReading: SensorDataReading = {
    id: `sensor-${Date.now()}`,
    deviceId: String(device_id),
    readingType: reading_type,
    value: Number(value),
    unit:
      reading_type === 'pest_trap'
        ? 'moths/night'
        : reading_type === 'leaf_wetness'
        ? 'hours/day'
        : reading_type === 'soil_moisture'
        ? '%'
        : reading_type === 'spore_counter'
        ? 'spores/m³'
        : '°C',
    gps: gps || { latitude: 20.5937, longitude: 78.9629 },
    timestamp: timestamp || new Date().toISOString(),
    batteryPercent: battery_percent || 90,
    notes: notes || 'Ingested via POST /api/sensor-data IoT stream'
  };

  sensorReadings.unshift(newReading);
  res.status(201).json({ success: true, reading: newReading });
});

app.get('/api/sensor-data', (req, res) => {
  res.json({ readings: sensorReadings });
});

// MODULE 3: Agronomic Risk Rules Config
app.get('/api/risk-rules', (req, res) => {
  res.json({ rules: riskRules });
});

app.put('/api/risk-rules', (req, res) => {
  const { rules } = req.body;
  if (Array.isArray(rules)) {
    riskRules = rules;
    return res.json({ success: true, rules: riskRules });
  }
  res.status(400).json({ error: 'Invalid rules array' });
});

// Farmer profiles (Module 4)
app.get('/api/farmers', (req, res) => {
  res.json({ farmers: farmerProfiles });
});

app.post('/api/farmers', (req, res) => {
  const newFarmer: FarmerProfile = {
    id: `farmer-${Date.now()}`,
    ...req.body
  };
  farmerProfiles.push(newFarmer);
  res.status(201).json({ success: true, farmer: newFarmer });
});

// ----------------------------------------------------
// AUTHENTICATION & ACCESS CONTROL ROUTES
// ----------------------------------------------------

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  // Check Root Admin: devp3987@gmail.com / 211008gaints
  if (cleanEmail === 'devp3987@gmail.com') {
    if (cleanPassword === '211008gaints') {
      let admin = userAccounts.find((u) => u.email.toLowerCase() === 'devp3987@gmail.com');
      if (!admin) {
        admin = INITIAL_USERS[0];
        userAccounts.push(admin);
      }
      return res.json({
        success: true,
        user: { ...admin, password: '' }
      });
    } else {
      return res.status(401).json({ success: false, error: 'Invalid administrator password' });
    }
  }

  // Find user by email
  const user = userAccounts.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return res.status(401).json({ success: false, error: 'No account found matching this email address' });
  }

  if (user.password && user.password !== cleanPassword) {
    return res.status(401).json({ success: false, error: 'Incorrect password' });
  }

  // Check approval status for official and agronomist
  if (user.status === 'pending_approval') {
    return res.status(403).json({
      success: false,
      pendingApproval: true,
      error: 'Account Pending Administrator Approval',
      message: `Your registration request as ${user.role} is currently awaiting approval from the System Administrator (devp3987@gmail.com). You will receive full access once your email is approved.`
    });
  }

  if (user.status === 'rejected') {
    return res.status(403).json({
      success: false,
      error: 'Access Denied: Account Application Rejected',
      message: user.rejectionReason || 'Your application was rejected by the administrator.'
    });
  }

  // User approved
  return res.json({
    success: true,
    user: { ...user, password: '' }
  });
});

// POST /api/auth/register-farmer
app.post('/api/auth/register-farmer', (req, res) => {
  const { name, phone, email, password, village, district, state, primaryCrops, landSizeAcres } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ success: false, error: 'Name, phone number, and password are required' });
  }

  const normalizedEmail = (email || `${phone.replace(/\D/g, '')}@kisan.in`).trim().toLowerCase();

  const existing = userAccounts.find((u) => u.email.toLowerCase() === normalizedEmail || u.phone === phone);
  if (existing) {
    return res.status(409).json({ success: false, error: 'An account with this email or mobile number already exists' });
  }

  const newFarmer: UserAccount = {
    id: `farmer-${Date.now()}`,
    email: normalizedEmail,
    password,
    name,
    phone,
    role: 'farmer',
    status: 'approved', // Farmers are approved immediately
    createdAt: new Date().toISOString(),
    village: village || 'Local Village',
    district: district || 'Local District',
    state: state || 'Maharashtra',
    primaryCrops: Array.isArray(primaryCrops) ? primaryCrops : ['Tomato', 'Field Crop'],
    landSizeAcres: Number(landSizeAcres) || 2
  };

  userAccounts.push(newFarmer);

  // Sync to farmerProfiles
  farmerProfiles.push({
    id: newFarmer.id,
    name: newFarmer.name,
    phone: newFarmer.phone || '',
    village: newFarmer.village || '',
    district: newFarmer.district || '',
    state: newFarmer.state || '',
    coordinates: { latitude: 20.0, longitude: 73.8 },
    cropType: newFarmer.primaryCrops?.[0] || 'General Crops',
    variety: 'Standard',
    sowingDate: new Date().toISOString().slice(0, 10),
    fieldSizeAcres: newFarmer.landSizeAcres || 2,
    soilType: 'Black',
    irrigationType: 'Drip'
  });

  res.status(201).json({
    success: true,
    user: { ...newFarmer, password: '' },
    message: 'Farmer registration completed successfully'
  });
});

// POST /api/auth/request-official-access
app.post('/api/auth/request-official-access', (req, res) => {
  const { name, email, password, role, department, designation, officialId, district, phone } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, error: 'Name, official email, password, and requested role are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = userAccounts.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(409).json({ success: false, error: 'An account with this email address is already registered' });
  }

  const requestedRole = role === 'official' ? 'official' : 'agronomist';

  const newAccount: UserAccount = {
    id: `req-${Date.now()}`,
    email: cleanEmail,
    password,
    name,
    phone: phone || '',
    role: requestedRole,
    status: 'pending_approval', // Locked until Admin devp3987@gmail.com approves!
    createdAt: new Date().toISOString(),
    department: department || 'Department of Agriculture',
    designation: designation || (requestedRole === 'official' ? 'Agricultural Officer' : 'Agronomist'),
    officialId: officialId || `ID-${Math.floor(1000 + Math.random() * 9000)}`,
    district: district || 'State-wide'
  };

  userAccounts.unshift(newAccount);

  res.status(201).json({
    success: true,
    user: { ...newAccount, password: '' },
    message: `Application submitted successfully. Under security protocol, Administrator (devp3987@gmail.com) must approve this email before ${requestedRole} privileges are unlocked.`
  });
});

// GET /api/auth/users (for Admin Settings)
app.get('/api/auth/users', (req, res) => {
  const sanitized = userAccounts.map((u) => ({ ...u, password: '' }));
  res.json({ users: sanitized });
});

// PUT /api/auth/users/:id/approve (Admin approves email)
app.put('/api/auth/users/:id/approve', (req, res) => {
  const { id } = req.params;
  const user = userAccounts.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User account not found' });
  }

  user.status = 'approved';
  user.approvedAt = new Date().toISOString();
  user.approvedBy = 'devp3987@gmail.com';
  delete user.rejectionReason;

  res.json({
    success: true,
    user: { ...user, password: '' },
    message: `Account for ${user.name} (${user.email}) has been approved. They can now log in as ${user.role}.`
  });
});

// PUT /api/auth/users/:id/reject
app.put('/api/auth/users/:id/reject', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const user = userAccounts.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User account not found' });
  }

  user.status = 'rejected';
  user.rejectionReason = reason || 'Declined by Administrator';

  res.json({
    success: true,
    user: { ...user, password: '' },
    message: `Application for ${user.email} was declined.`
  });
});

// PUT /api/auth/users/:id/revoke
app.put('/api/auth/users/:id/revoke', (req, res) => {
  const { id } = req.params;
  const user = userAccounts.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User account not found' });
  }
  if (user.email.toLowerCase() === 'devp3987@gmail.com') {
    return res.status(400).json({ success: false, error: 'Root administrator access cannot be revoked' });
  }

  user.status = 'pending_approval';
  res.json({
    success: true,
    user: { ...user, password: '' },
    message: `Access revoked for ${user.email}. User set to pending approval.`
  });
});

// DELETE /api/auth/users/:id
app.delete('/api/auth/users/:id', (req, res) => {
  const { id } = req.params;
  const idx = userAccounts.findIndex((u) => u.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'User account not found' });
  }
  if (userAccounts[idx].email.toLowerCase() === 'devp3987@gmail.com') {
    return res.status(400).json({ success: false, error: 'Cannot delete root administrator' });
  }

  userAccounts.splice(idx, 1);
  res.json({ success: true, message: 'User deleted successfully' });
});

// MODULE 10: Export expert-confirmed labeled dataset for MobileNet/PlantVillage training
app.get('/api/export-dataset', (req, res) => {
  const confirmedData = cropCases
    .filter((c) => c.status === 'confirmed' || c.status === 'corrected')
    .map((c) => ({
      case_id: c.id,
      crop: c.cropName,
      variety: c.cropVariety || 'Unspecified',
      ground_truth_label: c.expertReview?.correctedDisease || c.probableDisease,
      ai_initial_prediction: c.probableDisease,
      initial_confidence: c.confidence,
      expert_reviewer: c.expertReview?.expertName || 'System Verified',
      reviewed_timestamp: c.expertReview?.reviewedAt || c.timestamp,
      latitude: c.location.latitude,
      longitude: c.location.longitude,
      district: c.location.district || '',
      state: c.location.state || '',
      weather_temperature_c: c.weatherSnapshot?.temperature ?? null,
      weather_humidity_pct: c.weatherSnapshot?.humidity ?? null,
      weather_rainfall_mm: c.weatherSnapshot?.rainfall ?? null,
      image_source_url: c.imageUrl
    }));

  const format = req.query.format || 'json';

  if (format === 'csv') {
    if (confirmedData.length === 0) {
      return res.send('case_id,crop,ground_truth_label,initial_confidence,latitude,longitude\n');
    }
    const headers = Object.keys(confirmedData[0]).join(',');
    const rows = confirmedData.map((row) =>
      Object.values(row)
        .map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="agropari-labeled-dataset.csv"');
    return res.send([headers, ...rows].join('\n'));
  }

  res.json({
    dataset_name: 'Agropari Expert-Labeled Plant Pathology Dataset (India)',
    target_models: ['MobileNetV3', 'EfficientNet-B0', 'ResNet-50'],
    base_transfer_dataset: 'PlantVillage + Indian Field Conditions',
    total_samples: confirmedData.length,
    samples: confirmedData
  });
});

// ----------------------------------------------------
// VITE OR STATIC SERVING
// ----------------------------------------------------

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = runtimeDirectory;
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[Agropari] Server running on http://${HOST}:${PORT}`);
  });
}

start();
