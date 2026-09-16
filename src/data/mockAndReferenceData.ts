import { AgronomicRiskRule, CropCase, FarmerProfile, RiskAlert, SensorDataReading } from '../types';

export const DEFAULT_RISK_RULES: AgronomicRiskRule[] = [
  {
    id: 'rule-fungal-1',
    category: 'fungal',
    title: 'Fungal Blight & Rust Outbreak Warning',
    minHumidity: 80,
    minTemp: 20,
    maxTemp: 30,
    minRainfall48h: 5,
    consecutiveHours: 48,
    riskLevel: 'high',
    notes: 'Prolonged leaf wetness + 20-30°C promotes spore germination of Phytophthora, Alternaria and rusts.',
    enabled: true,
  },
  {
    id: 'rule-bacterial-1',
    category: 'bacterial',
    title: 'Bacterial Leaf Streak & Blight Trigger',
    minHumidity: 75,
    minTemp: 26,
    maxTemp: 35,
    minRainfall48h: 25,
    consecutiveHours: 24,
    riskLevel: 'high',
    notes: 'Heavy precipitation drives bacterial splashing through hydathodes and storm wind micro-wounds.',
    enabled: true,
  },
  {
    id: 'rule-pest-1',
    category: 'pest',
    title: 'Dry-Spell Sucking Pest Escalation (Aphids/Whiteflies/Thrips)',
    minHumidity: 30,
    minTemp: 28,
    maxTemp: 42,
    minRainfall48h: 0,
    consecutiveHours: 72,
    riskLevel: 'medium',
    notes: 'Extended dry spell without rain allows rapid nymph population explosions on young foliage.',
    enabled: true,
  }
];

export const VETTED_PESTICIDE_REGISTRY: Record<string, {
  crop: string;
  activeClass: string;
  phiDays: number;
  safetyNote: string;
  dosage: string;
  biologicalAlt: string;
}> = {
  'Late Blight': {
    crop: 'Potato / Tomato',
    activeClass: 'Carbamate / Dithiocarbamate (e.g. Mancozeb 75% WP or Cymoxanil + Mancozeb)',
    phiDays: 7,
    safetyNote: 'Wear nitrile gloves and face mask. NEVER spray within 4 hours of anticipated rainfall. Toxic to aquatic organisms.',
    dosage: '2.0 - 2.5 g per litre of clean water. Apply uniform canopy coat.',
    biologicalAlt: 'Trichoderma viride @ 5g/L or Pseudomonas fluorescens foliage spray.'
  },
  'Early Blight': {
    crop: 'Tomato / Potato',
    activeClass: 'Triazole / Chlorothalonil (e.g. Chlorothalonil 75% WP or Difenoconazole 25% EC)',
    phiDays: 14,
    safetyNote: 'Do not spray during peak bee foraging (10 AM - 3 PM). Use eye protection.',
    dosage: '1.5 - 2.0 ml per litre of water.',
    biologicalAlt: 'Bacillus subtilis soil & foliar spray.'
  },
  'Yellow Stem Borer': {
    crop: 'Paddy / Rice',
    activeClass: 'Diamide (e.g. Chlorantraniliprole 18.5% SC or Cartap hydrochloride 4% G)',
    phiDays: 21,
    safetyNote: 'Keep children and cattle away from field for 48 hours. Store in locked cupboard.',
    dosage: '60 ml in 200 L water per acre.',
    biologicalAlt: 'Trichogramma japonicum egg parasitoid cards @ 50,000/ha released weekly.'
  },
  'Fall Armyworm': {
    crop: 'Maize / Corn',
    activeClass: 'Spinosyn / Emamectin (e.g. Emamectin Benzoate 5% SG or Spinetoram 11.7% SC)',
    phiDays: 10,
    safetyNote: 'Direct nozzle into central plant whorl where larvae feed. Wear protective clothing.',
    dosage: '0.4 g per litre of water into plant whorl.',
    biologicalAlt: 'Bacillus thuringiensis (Bt) kurstaki formulation @ 2g/L or Metarhizium anisopliae.'
  },
  'Powdery Mildew': {
    crop: 'Chilli / Cucurbits / Grapes',
    activeClass: 'Inorganic Sulphur / Triazole (e.g. Wettable Sulphur 80% WDG or Penconazole 10% EC)',
    phiDays: 5,
    safetyNote: 'Do not spray when ambient temperature exceeds 32°C to prevent sulfur leaf scorch.',
    dosage: '2.5 g per litre of water.',
    biologicalAlt: 'Ampelomyces quisqualis bio-fungicide or 0.5% neem oil emulsion.'
  },
  'Bacterial Leaf Blight': {
    crop: 'Paddy / Cotton',
    activeClass: 'Copper Bactericide (e.g. Copper Oxychloride 50% WP + Streptocycline sulphate)',
    phiDays: 15,
    safetyNote: 'Do not consume treated produce within PHI window. Wash spray equipment thoroughly.',
    dosage: 'Copper Oxychloride 2.5 g + Streptocycline 0.1 g per litre.',
    biologicalAlt: 'Seed treatment with Pseudomonas fluorescens @ 10g/kg seed.'
  },
  'Healthy Crop': {
    crop: 'General',
    activeClass: 'None needed - Crop is healthy',
    phiDays: 0,
    safetyNote: 'Maintain balanced NPK nutrition and avoid excessive synthetic nitrogen.',
    dosage: 'No pesticide recommended.',
    biologicalAlt: 'Regular Panchagavya or Jeevamrutha soil drenching for root vigour.'
  }
};

export const INITIAL_FARMER_PROFILES: FarmerProfile[] = [
  {
    id: 'farmer-101',
    name: 'Rameshwar Patil',
    phone: '+91 9823412099',
    village: 'Akole',
    district: 'Ahmednagar',
    state: 'Maharashtra',
    coordinates: { latitude: 19.542, longitude: 74.004 },
    cropType: 'Cotton',
    variety: 'Bt Cotton Hybrid RCH-659',
    sowingDate: '2026-06-15',
    fieldSizeAcres: 4.5,
    soilType: 'Black',
    irrigationType: 'Drip'
  },
  {
    id: 'farmer-102',
    name: 'Baldev Singh Dhillon',
    phone: '+91 9417283411',
    village: 'Raikot',
    district: 'Ludhiana',
    state: 'Punjab',
    coordinates: { latitude: 30.651, longitude: 75.602 },
    cropType: 'Paddy (Rice)',
    variety: 'PR-126 Basmati',
    sowingDate: '2026-06-25',
    fieldSizeAcres: 8.0,
    soilType: 'Alluvial',
    irrigationType: 'Borewell / Tube well'
  },
  {
    id: 'farmer-103',
    name: 'Kallappa Gouda',
    phone: '+91 9741029388',
    village: 'Hiresindagi',
    district: 'Bagalkot',
    state: 'Karnataka',
    coordinates: { latitude: 16.182, longitude: 75.698 },
    cropType: 'Tomato',
    variety: 'Arka Rakshak',
    sowingDate: '2026-07-10',
    fieldSizeAcres: 2.2,
    soilType: 'Red & Yellow',
    irrigationType: 'Drip'
  },
  {
    id: 'farmer-104',
    name: 'Shivpal Yadav',
    phone: '+91 8853291044',
    village: 'Bilram',
    district: 'Kasganj',
    state: 'Uttar Pradesh',
    coordinates: { latitude: 27.811, longitude: 78.653 },
    cropType: 'Potato',
    variety: 'Kufri Bahar',
    sowingDate: '2026-08-01',
    fieldSizeAcres: 3.0,
    soilType: 'Sandy Loam',
    irrigationType: 'Borewell / Tube well'
  }
];

export const INITIAL_CROP_CASES: CropCase[] = [
  {
    id: 'case-ind-001',
    farmerName: 'Baldev Singh Dhillon',
    farmerPhone: '+91 9417283411',
    cropName: 'Paddy (Rice)',
    cropVariety: 'PR-126',
    growthStage: 'Vegetative',
    imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80',
    timestamp: '2026-09-12T09:30:00Z',
    location: {
      latitude: 30.655,
      longitude: 75.610,
      accuracy: 12,
      village: 'Raikot',
      block: 'Ludhiana West',
      district: 'Ludhiana',
      state: 'Punjab',
      isManualPin: false
    },
    probableDisease: 'Bacterial Leaf Blight',
    confidence: 88,
    needsExpertReview: false,
    status: 'confirmed',
    top3Alternatives: [
      { diseaseName: 'Bacterial Leaf Blight', confidence: 88, pathogenType: 'bacterial' },
      { diseaseName: 'Bacterial Leaf Streak', confidence: 9, pathogenType: 'bacterial' },
      { diseaseName: 'Potassium Deficiency', confidence: 3, pathogenType: 'nutritional' }
    ],
    description: 'Water-soaked lesions turning yellowish-white with wavy margins starting from leaf tips, showing typical bacterial ooze during humid mornings.',
    ipmAdvisory: {
      monitoringSteps: [
        'Inspect field corners early morning before dew evaporates for bacterial droplets.',
        'Record percentage of tillers displaying tip-drying symptoms.'
      ],
      culturalControls: [
        'Drain excess standing water from infected plots for 3 days to lower canopy humidity.',
        'Avoid excessive top-dressing of urea nitrogen; split N into smaller doses.'
      ],
      biologicalControls: [
        'Foliar spray with Pseudomonas fluorescens (commercial bio-agent) @ 10g/L water.'
      ],
      mechanicalControls: [
        'Prune and safely burn heavily blighted rogue leaves away from irrigation channels.'
      ],
      chemicalControls: [
        {
          activeIngredientClass: 'Copper Hydroxide / Streptocycline bactericide',
          recommendedTarget: 'Bacterial Leaf Blight',
          dosageGuidelines: 'Copper Oxychloride 50% WP @ 2.5g/L + Streptocycline 0.1g/L',
          preHarvestIntervalDays: 15,
          safetyPrecautions: 'Use personal PPE (gloves, mask). Never spray when rain is expected within 3 hours.'
        }
      ],
      waterAndSoilManagement: 'Regulate canal water entry to prevent cross-contamination to neighboring paddies.'
    },
    weatherSnapshot: {
      temperature: 29.4,
      humidity: 86,
      rainfall: 18.2,
      windSpeed: 14,
      weatherCode: 61,
      conditionText: 'Monsoon showers and warm humid weather'
    },
    riskAssessment: {
      overallRisk: 'high',
      fungalBlightRisk: 'medium',
      bacterialRisk: 'high',
      pestOutbreakRisk: 'low',
      explanation: 'Recent thunderstorm rainfall combined with 29°C temperature has driven bacterial spread across adjacent bunds.',
      activeTriggers: ['Heavy rainfall in past 24h', 'Humidity > 80% for 36h']
    },
    expertReview: {
      expertName: 'Dr. Gurpreet K., Senior Agronomist (PAU Ludhiana)',
      reviewedAt: '2026-09-12T11:45:00Z',
      decision: 'approved',
      notes: 'Confirmed Bacterial Leaf Blight based on undulating wavy leaf margins and dew droplet symptoms. 10km radius alert issued to Ludhiana district farmers.'
    }
  },
  {
    id: 'case-ind-002',
    farmerName: 'Rameshwar Patil',
    farmerPhone: '+91 9823412099',
    cropName: 'Cotton',
    cropVariety: 'Bt RCH-659',
    growthStage: 'Flowering',
    imageUrl: 'https://images.unsplash.com/photo-1594488554238-d698eb82f6e2?auto=format&fit=crop&w=800&q=80',
    timestamp: '2026-09-13T14:10:00Z',
    location: {
      latitude: 19.539,
      longitude: 74.009,
      accuracy: 24,
      village: 'Akole',
      block: 'Akole',
      district: 'Ahmednagar',
      state: 'Maharashtra',
      isManualPin: false
    },
    probableDisease: 'Pink Bollworm / Sucking Pest Complex',
    confidence: 54, // Under 60% -> Flags Needs Expert Review!
    needsExpertReview: true,
    status: 'pending_review',
    top3Alternatives: [
      { diseaseName: 'Pink Bollworm (Early Infestation)', confidence: 54, pathogenType: 'pest' },
      { diseaseName: 'Whitefly Sooty Mould', confidence: 32, pathogenType: 'pest' },
      { diseaseName: 'Magnesium Deficiency Chlorosis', confidence: 14, pathogenType: 'nutritional' }
    ],
    description: 'Noticeable rosetted flowers and curling on terminal shoot leaves with early necrotic spots.',
    ipmAdvisory: {
      monitoringSteps: [
        'Erect 5 Pheromone Traps (Phero-sensor) per hectare with Gossyplure lures.',
        'Pluck 20 green bolls randomly across field to check for larval entry pins.'
      ],
      culturalControls: [
        'Avoid ratooning or extending the crop beyond 150 days.',
        'Maintain clean field borders free of Abutilon weed hosts.'
      ],
      biologicalControls: [
        'Release Trichogramma bactrae egg parasitoids @ 1,50,000/ha at 10-day intervals.'
      ],
      mechanicalControls: [
        'Manual collection and deep destruction of rosette flowers.'
      ],
      chemicalControls: [
        {
          activeIngredientClass: 'Spinosyn insect control',
          recommendedTarget: 'Lepidopteran larvae',
          dosageGuidelines: 'Spinetoram 11.7% SC @ 1.0 ml/L or Profenofos 50% EC @ 2 ml/L',
          preHarvestIntervalDays: 14,
          safetyPrecautions: 'Wear mask and protective clothing. Keep spray away from apiaries and surface water.'
        }
      ]
    },
    weatherSnapshot: {
      temperature: 32.1,
      humidity: 48,
      rainfall: 0,
      windSpeed: 9,
      weatherCode: 1,
      conditionText: 'Dry sunny interval'
    },
    riskAssessment: {
      overallRisk: 'medium',
      fungalBlightRisk: 'low',
      bacterialRisk: 'low',
      pestOutbreakRisk: 'high',
      explanation: 'Dry spell with high day temperature accelerates pest life cycle and nymph multiplication.',
      activeTriggers: ['Dry spell > 72 hours', 'Warm daytime temperature 32°C']
    }
  },
  {
    id: 'case-ind-003',
    farmerName: 'Kallappa Gouda',
    farmerPhone: '+91 9741029388',
    cropName: 'Tomato',
    cropVariety: 'Arka Rakshak',
    growthStage: 'Fruiting',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a67?auto=format&fit=crop&w=800&q=80',
    timestamp: '2026-09-13T16:00:00Z',
    location: {
      latitude: 16.180,
      longitude: 75.702,
      accuracy: 8,
      village: 'Hiresindagi',
      block: 'Bagalkot',
      district: 'Bagalkot',
      state: 'Karnataka',
      isManualPin: false
    },
    probableDisease: 'Early Blight',
    confidence: 84,
    needsExpertReview: false,
    status: 'confirmed',
    top3Alternatives: [
      { diseaseName: 'Early Blight (Alternaria solani)', confidence: 84, pathogenType: 'fungal' },
      { diseaseName: 'Septoria Leaf Spot', confidence: 11, pathogenType: 'fungal' },
      { diseaseName: 'Tomato Mosaic Virus', confidence: 5, pathogenType: 'viral' }
    ],
    description: 'Concentric ring target-like dark brown spots on lower leaves with yellow halo margins.',
    ipmAdvisory: {
      monitoringSteps: [
        'Check lowest canopy tier for concentric target-board lesions after overhead irrigation.'
      ],
      culturalControls: [
        'Prune lower foliage touching wet soil to eliminate splash transmission.',
        'Mulch planting beds with straw to prevent raindrop soil splash.'
      ],
      biologicalControls: [
        'Bio-spray with Trichoderma harzianum @ 5g/L on root zone and foliage.'
      ],
      mechanicalControls: [
        'Remove yellowing diseased lower leaves with sanitized shears.'
      ],
      chemicalControls: [
        {
          activeIngredientClass: 'Triazole / Chloronitrile fungicide',
          recommendedTarget: 'Alternaria solani',
          dosageGuidelines: 'Difenoconazole 25% EC @ 1ml/L or Chlorothalonil 75% WP @ 2g/L',
          preHarvestIntervalDays: 7,
          safetyPrecautions: 'Do not harvest fruits within 7 days of application. Use eye protection.'
        }
      ]
    },
    weatherSnapshot: {
      temperature: 27.2,
      humidity: 82,
      rainfall: 6.5,
      windSpeed: 11,
      weatherCode: 61,
      conditionText: 'Intermittent light drizzle'
    },
    riskAssessment: {
      overallRisk: 'high',
      fungalBlightRisk: 'high',
      bacterialRisk: 'medium',
      pestOutbreakRisk: 'low',
      explanation: 'High relative humidity (82%) with 27°C optimum temperature provides prime spore germination window.',
      activeTriggers: ['Humidity > 80%', 'Temperature 20-30°C optimal for Alternaria']
    },
    expertReview: {
      expertName: 'Suresh Hegde, Deputy Director of Horticulture',
      reviewedAt: '2026-09-14T08:30:00Z',
      decision: 'approved',
      notes: 'Confirmed Early Blight. Farmers within 10 km notified to ensure mulching and prophylactic bio-fungicide sprays.'
    }
  },
  {
    id: 'case-ind-004',
    farmerName: 'Shivpal Yadav',
    farmerPhone: '+91 8853291044',
    cropName: 'Potato',
    cropVariety: 'Kufri Bahar',
    growthStage: 'Vegetative',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
    timestamp: '2026-09-14T07:20:00Z',
    location: {
      latitude: 27.815,
      longitude: 78.650,
      accuracy: 16,
      village: 'Bilram',
      block: 'Kasganj',
      district: 'Kasganj',
      state: 'Uttar Pradesh',
      isManualPin: false
    },
    probableDisease: 'Late Blight',
    confidence: 91,
    needsExpertReview: false,
    status: 'confirmed',
    top3Alternatives: [
      { diseaseName: 'Late Blight (Phytophthora infestans)', confidence: 91, pathogenType: 'fungal' },
      { diseaseName: 'Potato Leaf Roll Virus', confidence: 6, pathogenType: 'viral' },
      { diseaseName: 'Sclerotinia Stem Rot', confidence: 3, pathogenType: 'fungal' }
    ],
    description: 'Large purplish-black water-soaked lesions spreading rapidly from margins inward, accompanied by delicate white fungal growth on leaf undersides.',
    ipmAdvisory: {
      monitoringSteps: [
        'Survey low-lying damp spots daily when morning fog or dense dew occurs.'
      ],
      culturalControls: [
        'High earthing up of potato ridges to protect underground tubers from spore wash.',
        'Stop furrow irrigation immediately when blight symptoms are spotted.'
      ],
      biologicalControls: [
        'Apply Pseudomonas fluorescens culture @ 10g/L early morning.'
      ],
      mechanicalControls: [
        'Destruction of self-sown cull potato heaps in vicinity.'
      ],
      chemicalControls: [
        {
          activeIngredientClass: 'Acylalanine / Dithiocarbamate',
          recommendedTarget: 'Phytophthora infestans',
          dosageGuidelines: 'Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/L',
          preHarvestIntervalDays: 14,
          safetyPrecautions: 'Mandatory respirator/mask. Do not spray if heavy downpour is imminent within 2 hours.'
        }
      ]
    },
    weatherSnapshot: {
      temperature: 24.5,
      humidity: 89,
      rainfall: 12.0,
      windSpeed: 8,
      weatherCode: 63,
      conditionText: 'Dense morning fog & light drizzle'
    },
    riskAssessment: {
      overallRisk: 'high',
      fungalBlightRisk: 'high',
      bacterialRisk: 'medium',
      pestOutbreakRisk: 'low',
      explanation: 'Prolonged fog and 89% humidity with 24°C provides critical late blight infection window.',
      activeTriggers: ['Humidity > 80% for > 48h', 'Temp 20-26°C with free moisture']
    },
    expertReview: {
      expertName: 'Dr. V. K. Shukla, KVK Plant Pathologist',
      reviewedAt: '2026-09-14T09:15:00Z',
      decision: 'approved',
      notes: 'Severe Late Blight identified. High priority 10 km alert dispatched to Kasganj potato belt.'
    }
  }
];

export const INITIAL_RISK_ALERTS: RiskAlert[] = [
  {
    id: 'alert-001',
    caseId: 'case-ind-004',
    cropAffected: 'Potato',
    diseaseName: 'Late Blight (Phytophthora infestans)',
    confirmedAt: '2026-09-14T09:15:00Z',
    coordinates: { latitude: 27.815, longitude: 78.650 },
    district: 'Kasganj, Uttar Pradesh',
    severity: 'high',
    radiusKm: 10,
    advisorySummary: 'Confirmed Late Blight within 10 km! High earthing up advised; spray contact protectant (Mancozeb 75% WP @ 2.5g/L) before rain.',
    affectedDistanceKm: 4.2
  },
  {
    id: 'alert-002',
    caseId: 'case-ind-001',
    cropAffected: 'Paddy (Rice)',
    diseaseName: 'Bacterial Leaf Blight',
    confirmedAt: '2026-09-12T11:45:00Z',
    coordinates: { latitude: 30.655, longitude: 75.610 },
    district: 'Ludhiana, Punjab',
    severity: 'high',
    radiusKm: 10,
    advisorySummary: 'Bacterial leaf blight confirmed in Raikot block. Drain standing water for 48h, withhold urea nitrogen application.',
    affectedDistanceKm: 6.8
  },
  {
    id: 'alert-003',
    caseId: 'case-ind-003',
    cropAffected: 'Tomato',
    diseaseName: 'Early Blight (Alternaria solani)',
    confirmedAt: '2026-09-14T08:30:00Z',
    coordinates: { latitude: 16.180, longitude: 75.702 },
    district: 'Bagalkot, Karnataka',
    severity: 'medium',
    radiusKm: 10,
    advisorySummary: 'Early Blight detected in Hiresindagi tomato orchards. Clear lower foliage and apply Trichoderma bio-spray.',
    affectedDistanceKm: 2.1
  }
];

export const INITIAL_SENSOR_READINGS: SensorDataReading[] = [
  {
    id: 'sensor-read-01',
    deviceId: 'TRAP-PHERO-MH-04',
    readingType: 'pest_trap',
    value: 28, // moths counted in trap
    unit: 'moths/night',
    gps: { latitude: 19.540, longitude: 74.006 },
    timestamp: '2026-09-14T06:00:00Z',
    batteryPercent: 92,
    notes: 'Pink bollworm adult moth flight surge exceeded ETL threshold (8 moths/trap/night).'
  },
  {
    id: 'sensor-read-02',
    deviceId: 'LEAF-WET-PB-02',
    readingType: 'leaf_wetness',
    value: 11.5,
    unit: 'hours/day',
    gps: { latitude: 30.652, longitude: 75.608 },
    timestamp: '2026-09-14T06:30:00Z',
    batteryPercent: 88,
    notes: 'Extended dew duration recorded on paddy canopy.'
  },
  {
    id: 'sensor-read-03',
    deviceId: 'SPORE-OPTIC-UP-01',
    readingType: 'spore_counter',
    value: 142,
    unit: 'spores/m³',
    gps: { latitude: 27.812, longitude: 78.652 },
    timestamp: '2026-09-14T07:00:00Z',
    batteryPercent: 81,
    notes: 'Phytophthora sporangia count spiked after early morning fog.'
  }
];

export const DISTRICT_OGD_CONTEXT: Record<string, {
  commonDiseases: string[];
  currentMandiPrices: { commodity: string; mandi: string; modalPrice: string }[];
  advisoryNote: string;
}> = {
  'Ahmednagar': {
    commonDiseases: ['Pink Bollworm in Cotton', 'Rust in Soybean', 'Downy Mildew in Grapes'],
    currentMandiPrices: [
      { commodity: 'Cotton (Medium Staple)', mandi: 'Akole APMC', modalPrice: '₹ 7,200 / Qtl' },
      { commodity: 'Soybean', mandi: 'Sangamner APMC', modalPrice: '₹ 4,450 / Qtl' }
    ],
    advisoryNote: 'Dry spell continuing in central Maharashtra. Monitor pheromone traps weekly.'
  },
  'Ludhiana': {
    commonDiseases: ['Bacterial Leaf Blight in Paddy', 'Sheath Blight in Basmati', 'Foot Rot'],
    currentMandiPrices: [
      { commodity: 'Paddy (Basmati 1121)', mandi: 'Ludhiana Mandi', modalPrice: '₹ 3,850 / Qtl' },
      { commodity: 'Maize', mandi: 'Jagraon Mandi', modalPrice: '₹ 2,100 / Qtl' }
    ],
    advisoryNote: 'Monsoon humidity remains high (>80%). Keep paddy fields drained if tip burn appears.'
  },
  'Bagalkot': {
    commonDiseases: ['Early Blight in Tomato', 'Powdery Mildew in Chilli', 'Fruit Borer'],
    currentMandiPrices: [
      { commodity: 'Tomato Hybrid', mandi: 'Bagalkot APMC', modalPrice: '₹ 1,800 / Qtl' },
      { commodity: 'Chilli Dry (Byadagi)', mandi: 'Hubli APMC', modalPrice: '₹ 18,500 / Qtl' }
    ],
    advisoryNote: 'Intermittent rain showers. Remove bottom yellow leaves of solanaceous crops.'
  },
  'Kasganj': {
    commonDiseases: ['Late Blight in Potato', 'White Rust in Mustard', 'Stem Rot'],
    currentMandiPrices: [
      { commodity: 'Potato (Desi)', mandi: 'Kasganj Mandi', modalPrice: '₹ 1,450 / Qtl' },
      { commodity: 'Mustard seed', mandi: 'Aligarh Mandi', modalPrice: '₹ 5,600 / Qtl' }
    ],
    advisoryNote: 'High risk alert active for Late Blight. Prophylactic fungicide application recommended.'
  }
};

export const MULTILINGUAL_DICTIONARY: Record<string, Record<string, string>> = {
  en: {
    appTitle: 'Agropari',
    appSubtitle: 'AI Crop Health Management System',
    farmerRole: 'Farmer',
    expertRole: 'Official / Agronomist',
    adminRole: 'Admin Settings',
    tabDiagnose: 'Diagnose Crop',
    tabFieldsAndAlerts: 'My Field & 10km Alerts',
    tabMap: 'Hotspot Map',
    tabExpertQueue: 'Expert Review Queue',
    tabOfficialDash: 'Official Dashboard',
    tabRiskRules: 'Agronomic Rules',
    tabSensors: 'IoT Sensor Streams',
    captureOrUpload: 'Upload or Capture Crop Photo',
    tapToSnap: 'Tap Camera or Select Leaf Photo',
    clientCompressing: 'Compressing image for rural 3G...',
    gpsAccuracy: 'GPS Accuracy',
    gpsLocating: 'Fetching High-Precision GPS...',
    dropPinFallback: 'Place Pin Manually on Map',
    analyzeButton: 'Analyze Crop Health with AI',
    analyzingText: 'Diagnosing plant pathology...',
    confidenceScore: 'AI Confidence',
    needsExpertReviewBadge: 'Needs Expert Review (< 60%)',
    confirmedDiagnosisBadge: 'High Confidence Diagnosis',
    disclaimerText: 'Notice: This AI diagnosis is an advisory tool. For confirmation, contact your nearest Krishi Vigyan Kendra (KVK) or State Agricultural Extension officer.',
    weatherRiskTitle: 'Real-Time Weather Risk (Open-Meteo)',
    fungalRisk: 'Fungal Risk',
    bacterialRisk: 'Bacterial Risk',
    pestRisk: 'Pest Outbreak Risk',
    ipmHeader: 'Integrated Pest Management (IPM) Advisory',
    step1Monitoring: '1. Monitoring & Scouting',
    step2Cultural: '2. Cultural & Sanitation Practices',
    step3Biological: '3. Biological & Botanical Controls',
    step4Mechanical: '4. Physical & Mechanical Controls',
    step5Chemical: '5. Chemical Controls (Last Resort)',
    vettedDosageBadge: 'Govt. Vetted Dosage',
    phiLabel: 'Pre-Harvest Interval (PHI)',
    safetyLabel: 'Safety Warning',
    readAloud: 'Read Advisory Aloud (TTS)',
    stopAudio: 'Stop Audio',
    openLiveCamera: 'Open Live Camera',
    openLiveCameraDesc: 'Take a clear direct photo of the affected crop leaf',
    chooseGallery: 'Choose from Gallery / Files',
    chooseGalleryDesc: 'Select an existing photo from your device',
    problemHeading: 'Detected Crop Problem & Symptoms',
    solutionHeading: 'Problem Solution & IPM Treatment Plan',
    voiceNarrationHeading: 'Listen Aloud (Voice Narration)',
    voiceNarrationDesc: 'Listen to the diagnosis problem and complete remedies in your language',
    cropLabel: 'Select Crop',
    varietyLabel: 'Crop Variety',
    stageLabel: 'Growth Stage',
    farmerNameLabel: 'Farmer Name',
    farmerPhoneLabel: 'Mobile Number',
    locationLabel: 'Field Location & GPS',
    followUpPrompt: 'Follow-Up Progress (5-7 Days)',
    uploadFollowUp: 'Upload 5-7 Day Follow-Up Photo',
    alertsWithin10km: 'Nearby Alerts Within 10 km',
    distanceAway: 'away from your field',
    noAlertsNearby: 'No active disease outbreaks detected within 10 km radius.',
    footerText: 'Developed by Team Tech Giants | devp3987@gmail.com | +91 8081774848'
  },
  hi: {
    appTitle: 'एग्रोपरी',
    appSubtitle: 'एआई फसल स्वास्थ्य प्रबंधन प्रणाली',
    farmerRole: 'किसान (Farmer)',
    expertRole: 'कृषि अधिकारी / विशेषज्ञ',
    adminRole: 'एडमिन सेटिंग्स',
    tabDiagnose: 'फसल की जांच करें',
    tabFieldsAndAlerts: 'मेरा खेत और 10 किमी अलर्ट',
    tabMap: 'हॉटस्पॉट मानचित्र',
    tabExpertQueue: 'विशेषज्ञ समीक्षा कतार',
    tabOfficialDash: 'अधिकारी डैशबोर्ड',
    tabRiskRules: 'मौसम व रोग नियम',
    tabSensors: 'आईओटी सेंसर डेटा',
    captureOrUpload: 'फसल की फोटो खींचें या अपलोड करें',
    tapToSnap: 'कैमरा चालू करें या पत्ती की फोटो चुनें',
    clientCompressing: 'कम इंटरनेट के लिए फोटो कम्प्रेस हो रही है...',
    gpsAccuracy: 'जीपीएस सटीकता',
    gpsLocating: 'सटीक जीपीएस लोकेशन खोजी जा रही है...',
    dropPinFallback: 'नक्शे पर पिन लगाएं',
    analyzeButton: 'एआई से फसल की जांच करें',
    analyzingText: 'पौधे की बीमारी का विश्लेषण हो रहा है...',
    confidenceScore: 'एआई विश्वास दर',
    needsExpertReviewBadge: 'विशेषज्ञ समीक्षा आवश्यक (< 60%)',
    confirmedDiagnosisBadge: 'सटीक एआई निदान',
    disclaimerText: 'सूचना: यह एआई रिपोर्ट सलाहकारी है। पक्की पुष्टि हेतु अपने नजदीकी कृषि विज्ञान केंद्र (KVK) या कृषि अधिकारी से संपर्क करें।',
    weatherRiskTitle: 'लाइव मौसम जोखिम (ओपन-मेटियो)',
    fungalRisk: 'फफूंद रोग जोखिम',
    bacterialRisk: 'जीवाणु रोग जोखिम',
    pestRisk: 'कीट प्रकोप जोखिम',
    ipmHeader: 'एकीकृत कीट प्रबंधन (IPM) सलाह',
    step1Monitoring: '1. खेत की निगरानी व निरीक्षण',
    step2Cultural: '2. सस्य क्रियाएं एवं स्वच्छता',
    step3Biological: '3. जैविक व प्राकृतिक उपचार',
    step4Mechanical: '4. भौतिक एवं यांत्रिक रोकथाम',
    step5Chemical: '5. रासायनिक उपचार (अंतिम उपाय)',
    vettedDosageBadge: 'सरकारी अनुशंसित मात्रा',
    phiLabel: 'तुड़ाई पूर्व अंतराल (PHI)',
    safetyLabel: 'सुरक्षा निर्देश',
    readAloud: 'सलाह सुनकर समझें (आवाज)',
    stopAudio: 'आवाज रोकें',
    openLiveCamera: 'लाइव कैमरा खोलें (Live)',
    openLiveCameraDesc: 'प्रभावित पत्ती की लाइव सीधी फोटो खींचने हेतु कैमरा चालू करें',
    chooseGallery: 'गैलरी या फाइल से चुनें',
    chooseGalleryDesc: 'फोन की गैलरी या कंप्यूटर से फोटो चुनें',
    problemHeading: 'फसल में क्या दिक्कत है (रोग व लक्षण)',
    solutionHeading: 'दिक्कत का समाधान (रोकथाम व उपचार योजना)',
    voiceNarrationHeading: 'बोल कर सुनाएं (आवाज़ में सुनें)',
    voiceNarrationDesc: 'बीमारी की दिक्कत और संपूर्ण समाधान को हिन्दी आवाज़ में सुनें',
    cropLabel: 'फसल चुनें',
    varietyLabel: 'फसल की किस्म (वैरायटी)',
    stageLabel: 'फसल विकास अवस्था',
    farmerNameLabel: 'किसान का नाम',
    farmerPhoneLabel: 'मोबाइल नंबर',
    locationLabel: 'खेत का स्थान व जीपीएस',
    followUpPrompt: '5-7 दिन बाद प्रगति फोटो',
    uploadFollowUp: 'उपचार के 5-7 दिन बाद की फोटो अपलोड करें',
    alertsWithin10km: '10 किमी के भीतर रोग प्रकोप अलर्ट',
    distanceAway: 'आपके खेत से दूरी',
    noAlertsNearby: '10 किमी के दायरे में कोई सक्रिय बीमारी दर्ज नहीं है।',
    footerText: 'Developed by Team Tech Giants | devp3987@gmail.com | +91 8081774848'
  },
  pa: {
    appTitle: 'ਐਗਰੋਪਰੀ',
    appSubtitle: 'ਏਆਈ ਫ਼ਸਲ ਸਿਹਤ ਪ੍ਰਬੰਧਨ ਪ੍ਰਣਾਲੀ',
    farmerRole: 'ਕਿਸਾਨ (Farmer)',
    expertRole: 'ਖੇਤੀਬਾੜੀ ਅਧਿਕਾਰੀ / ਮਾਹਿਰ',
    adminRole: 'ਸੈਟਿੰਗਾਂ',
    tabDiagnose: 'ਫ਼ਸਲ ਦੀ ਜਾਂਚ',
    tabFieldsAndAlerts: 'ਮੇਰਾ ਖੇਤ ਅਤੇ 10 ਕਿਲੋਮੀਟਰ ਅਲਰਟ',
    tabMap: 'ਹੌਟਸਪੌਟ ਨਕਸ਼ਾ',
    tabExpertQueue: 'ਮਾਹਿਰ ਸਮੀਖਿਆ ਸੂਚੀ',
    tabOfficialDash: 'ਅਧਿਕਾਰੀ ਡੈਸ਼ਬੋਰਡ',
    tabRiskRules: 'ਮੌਸਮੀ ਜੋਖਮ ਨਿਯਮ',
    tabSensors: 'ਆਈਓਟੀ ਸੈਂਸਰ',
    captureOrUpload: 'ਫ਼ਸਲ ਦੀ ਫੋਟੋ ਲਵੋ ਜਾਂ ਅਪਲੋਡ ਕਰੋ',
    tapToSnap: 'ਕੈਮਰੇ ਨਾਲ ਫੋਟੋ ਖਿੱਚੋ',
    clientCompressing: 'ਫੋਟੋ ਸੰਕੁਚਿਤ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...',
    gpsAccuracy: 'ਜੀਪੀਐਸ ਸ਼ੁੱਧਤਾ',
    gpsLocating: 'ਜੀਪੀਐਸ ਲੱਭਿਆ ਜਾ ਰਿਹਾ ਹੈ...',
    dropPinFallback: 'ਨਕਸ਼ੇ ਤੇ ਪਿੰਨ ਲਗਾਓ',
    analyzeButton: 'ਏਆਈ ਦੁਆਰਾ ਜਾਂਚ ਕਰੋ',
    analyzingText: 'ਬਿਮਾਰੀ ਦੀ ਜਾਂਚ ਹੋ ਰਹੀ ਹੈ...',
    confidenceScore: 'ਏਆਈ ਭਰੋਸਾ',
    needsExpertReviewBadge: 'ਮਾਹਿਰ ਜਾਂਚ ਲੋੜੀਂਦੀ (< 60%)',
    confirmedDiagnosisBadge: 'ਪੁਸ਼ਟ ਨਿਦਾਨ',
    disclaimerText: 'ਸੂਚਨਾ: ਇਹ ਏਆਈ ਰਿਪੋਰਟ ਸਲਾਹ ਵਜੋਂ ਹੈ। ਪੱਕੀ ਪੁਸ਼ਟੀ ਲਈ ਪੀਏਯੂ (PAU) ਜਾਂ ਨੇੜਲੇ ਕੇਵੀਕੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।',
    weatherRiskTitle: 'ਮੌਸਮੀ ਜੋਖਮ ਸਥਿਤੀ',
    fungalRisk: 'ਉੱਲੀ ਰੋਗ ਜੋਖਮ',
    bacterialRisk: 'ਬੈਕਟੀਰੀਆ ਰੋਗ ਜੋਖਮ',
    pestRisk: 'ਕੀੜੇ-ਮਕੌੜੇ ਜੋਖਮ',
    ipmHeader: 'ਸੰਯੁਕਤ ਕੀਟ ਪ੍ਰਬੰਧਨ (IPM) ਸਲਾਹ',
    step1Monitoring: '1. ਖੇਤ ਦਾ ਨਿਰੀਖਣ',
    step2Cultural: '2. ਸਫ਼ਾਈ ਅਤੇ ਫ਼ਸਲੀ ਢੰਗ',
    step3Biological: '3. ਜੈਵਿਕ ਰੋਕਥਾਮ',
    step4Mechanical: '4. ਭੌਤਿਕ ਰੋਕਥਾਮ',
    step5Chemical: '5. ਰਸਾਇਣਕ ਰੋਕਥਾਮ (ਆਖਰੀ ਹੱਲ)',
    vettedDosageBadge: 'ਪ੍ਰਮਾਣਿਤ ਮਾਤਰਾ',
    phiLabel: 'ਵਾਢੀ ਤੋਂ ਪਹਿਲਾਂ ਅੰਤਰਾਲ (PHI)',
    safetyLabel: 'ਸੁਰੱਖਿਆ ਚੇਤਾਵਨੀ',
    readAloud: 'ਸਲਾਹ ਸੁਣੋ (TTS)',
    stopAudio: 'ਰੋਕੋ',
    followUpPrompt: '5-7 ਦਿਨਾਂ ਬਾਅਦ ਫੋਟੋ',
    uploadFollowUp: 'ਇਲਾਜ ਤੋਂ 5-7 ਦਿਨ ਬਾਅਦ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ',
    alertsWithin10km: '10 ਕਿਲੋਮੀਟਰ ਅੰਦਰ ਬਿਮਾਰੀ ਅਲਰਟ',
    distanceAway: 'ਤੁਹਾਡੇ ਖੇਤ ਤੋਂ ਦੂਰ',
    noAlertsNearby: '10 ਕਿਲੋਮੀਟਰ ਦੇ ਦਾਇਰੇ ਵਿੱਚ ਕੋਈ ਨਵਾਂ ਪ੍ਰਕੋਪ ਨਹੀਂ ਹੈ।',
    footerText: 'Developed by Team Tech Giants | devp3987@gmail.com | +91 8081774848'
  },
  mr: {
    appTitle: 'अॅग्रोपरी',
    appSubtitle: 'एआय पीक आरोग्य व्यवस्थापन प्रणाली',
    farmerRole: 'शेतकरी (Farmer)',
    expertRole: 'कृषी अधिकारी / तज्ज्ञ',
    adminRole: 'प्रशासक सेटिंग्ज',
    tabDiagnose: 'पिकाचे निदान करा',
    tabFieldsAndAlerts: 'माझे शेत व १० किमी अलर्ट',
    tabMap: 'हॉटस्पॉट नकाशा',
    tabExpertQueue: 'तज्ज्ञ पुनरावलोकन रांग',
    tabOfficialDash: 'अधिकारी डॅशबोर्ड',
    tabRiskRules: 'हवामान जोखीम नियम',
    tabSensors: 'आयओटी सेन्सर डेटा',
    captureOrUpload: 'पिकाचा फोटो काढा किंवा अपलोड करा',
    tapToSnap: 'कॅमेऱ्याने पानाचा फोटो घ्या',
    clientCompressing: 'फोटो कॉम्प्रेस होत आहे...',
    gpsAccuracy: 'जीपीएस अचूकता',
    gpsLocating: 'जीपीएस लोकेशन शोधत आहे...',
    dropPinFallback: 'नकाशावर पिन ठेवा',
    analyzeButton: 'एआय द्वारे निदान करा',
    analyzingText: 'रोगाचे विश्लेषण सुरू आहे...',
    confidenceScore: 'एआय अचूकता दर',
    needsExpertReviewBadge: 'तज्ज्ञ पुनरावलोकन आवश्यक (< ६०%)',
    confirmedDiagnosisBadge: 'निश्चित एआय निदान',
    disclaimerText: 'सूचना: हा एआय अहवाल सल्लागार स्वरूपाचा आहे. खात्रीसाठी जवळच्या कृषी विज्ञान केंद्राशी संपर्क साधा.',
    weatherRiskTitle: 'थेट हवामान जोखीम (ओपन-मेटियो)',
    fungalRisk: 'बुरशीजन्य जोखीम',
    bacterialRisk: 'जिवाणूजन्य जोखीम',
    pestRisk: 'कीड प्रादुर्भाव जोखीम',
    ipmHeader: 'एकात्मिक कीड व्यवस्थापन (IPM) सल्ला',
    step1Monitoring: '१. शेताचे निरीक्षण',
    step2Cultural: '२. मशागती पद्धती व स्वच्छता',
    step3Biological: '३. जैविक व वनस्पतीजन्य नियंत्रणे',
    step4Mechanical: '४. यांत्रिक व भौतिक नियंत्रणे',
    step5Chemical: '५. रासायनिक फवारणी (शेवटचा पर्याय)',
    vettedDosageBadge: 'शासकीय प्रमाणित प्रमाण',
    phiLabel: 'कापणीपूर्व कालावधी (PHI)',
    safetyLabel: 'सुरक्षा सूचना',
    readAloud: 'सल्ला ऐका (आवाज)',
    stopAudio: 'आवाज थांबवा',
    followUpPrompt: '५-७ दिवसांनंतर पाठपुरावा',
    uploadFollowUp: '५-७ दिवसांनंतरचा फॉलो-अप फोटो पाठवा',
    alertsWithin10km: '१० किमी परिसरातील रोग अलर्ट',
    distanceAway: 'आपल्या शेतापासून अंतर',
    noAlertsNearby: '१० किमी परिसरात कोणताही सक्रिय प्रादुर्भाव नाही.',
    footerText: 'Developed by Team Tech Giants | devp3987@gmail.com | +91 8081774848'
  },
  te: {
    appTitle: 'ఆగ్రోపరీ',
    appSubtitle: 'ఏఐ పంట ఆరోగ్య నిర్వహణ వ్యవస్థ',
    farmerRole: 'రైతు (Farmer)',
    expertRole: 'వ్యవసాయ అధికారి / నిపుణుడు',
    adminRole: 'అడ్మిన్ సెట్టింగులు',
    tabDiagnose: 'పంట వ్యాధి నిర్ధారణ',
    tabFieldsAndAlerts: 'నా పొలం & 10 కి.మీ హెచ్చరికలు',
    tabMap: 'హాట్‌స్పాట్ మ్యాప్',
    tabExpertQueue: 'నిపుణుల సమీక్ష జాబితా',
    tabOfficialDash: 'అధికారుల డ్యాష్‌బోర్డ్',
    tabRiskRules: 'వాతావరణ రిస్క్ నియమాలు',
    tabSensors: 'ఐఓటీ సెన్సార్ డేటా',
    captureOrUpload: 'పంట ఫోటో తీయండి లేదా అప్‌లోడ్ చేయండి',
    tapToSnap: 'కెమెరా తెరవండి లేదా ఫోటో ఎంచుకోండి',
    clientCompressing: 'ఫోటో పరిమాణం కుదించబడుతోంది...',
    gpsAccuracy: 'జీపీఎస్ ఖచ్చితత్వం',
    gpsLocating: 'జీపీఎస్ స్థానం తీసుకుంటోంది...',
    dropPinFallback: 'మ్యాప్‌పై పిన్ ఉంచండి',
    analyzeButton: 'ఏఐతో పంట ఆరోగ్యాన్ని విశ్లేషించండి',
    analyzingText: 'రోగ నిర్ధారణ జరుగుతోంది...',
    confidenceScore: 'ఏఐ ఖచ్చితత్వ రేటు',
    needsExpertReviewBadge: 'నిపుణుల సమీక్ష అవసరం (< 60%)',
    confirmedDiagnosisBadge: 'ఖచ్చితమైన ఏఐ నిర్ధారణ',
    disclaimerText: 'గమనిక: ఈ ఏఐ ఫలితం కేవలం సలహా మాత్రమే. నిర్ధారణ కోసం స్థానిక కృషి విజ్ఞాన కేంద్రాన్ని (KVK) సంప్రదించండి.',
    weatherRiskTitle: 'ప్రత్యక్ష వాతావరణ రిస్క్',
    fungalRisk: 'శిలీంధ్రాల రిస్క్',
    bacterialRisk: 'బాక్టీరియల్ రిస్క్',
    pestRisk: 'పురుగుల వ్యాప్తి రిస్క్',
    ipmHeader: 'సమగ్ర సస్యరక్షణ (IPM) సలహా',
    step1Monitoring: '1. పొలం పరిశీలన',
    step2Cultural: '2. సాగు పద్ధతులు మరియు పారిశుధ్యం',
    step3Biological: '3. జీవ నియంత్రణ చర్యలు',
    step4Mechanical: '4. భౌతిక మరియు యాంత్రిక చర్యలు',
    step5Chemical: '5. రసాయన మందులు (చివరి మార్గం)',
    vettedDosageBadge: 'ప్రభుత్వ సూచించిన మోతాదు',
    phiLabel: 'కోతకు ముందు వ్యవధి (PHI)',
    safetyLabel: 'భద్రతా హెచ్చరిక',
    readAloud: 'సలహాను వినండి (TTS)',
    stopAudio: 'ఆపండి',
    followUpPrompt: '5-7 రోజుల తర్వాత ప్రోగ్రెస్ ఫోటో',
    uploadFollowUp: 'మందు కొట్టిన 5-7 రోజుల తర్వాత ఫోటో అప్‌లోడ్ చేయండి',
    alertsWithin10km: '10 కి.మీ పరిధిలో వ్యాధి హెచ్చరికలు',
    distanceAway: 'మీ పొలం నుండి దూరం',
    noAlertsNearby: '10 కి.మీ పరిధిలో ఎటువంటి తెగుళ్ళ ఉధృతి లేదు.',
    footerText: 'Developed by Team Tech Giants | devp3987@gmail.com | +91 8081774848'
  },
  ta: {
    appTitle: 'அக்ரோபரி',
    appSubtitle: 'AI பயிர் நல மேலாண்மை அமைப்பு',
    farmerRole: 'விவசாயி (Farmer)',
    expertRole: 'வேளாண் அலுவலர் / வல்லுநர்',
    adminRole: 'நிர்வாக அமைப்பு',
    tabDiagnose: 'பயிர் நோய் கண்டறிதல்',
    tabFieldsAndAlerts: 'என் நிலம் & 10 கி.மீ எச்சரிக்கைகள்',
    tabMap: 'ஹாட்ஸ்பாட் வரைபடம்',
    tabExpertQueue: 'வல்லுநர் மதிப்பாய்வு வரிசை',
    tabOfficialDash: 'அலுவலர் தகவல் பலகை',
    tabRiskRules: 'வானிலை இடர் விதிகள்',
    tabSensors: 'சென்சார் தகவல்கள்',
    captureOrUpload: 'பயிர் புகைப்படம் எடுக்கவும் / பதிவேற்றவும்',
    tapToSnap: 'கேமரா மூலம் இலை புகைப்படம் எடுக்கவும்',
    clientCompressing: 'புகைப்படம் சுருக்கப்படுகிறது...',
    gpsAccuracy: 'ஜிபிஎஸ் துல்லியம்',
    gpsLocating: 'ஜிபிஎஸ் இருப்பிடம் பெறப்படுகிறது...',
    dropPinFallback: 'வரைபடத்தில் பின் இடவும்',
    analyzeButton: 'AI மூலம் பயிர் பரிசோதனை செய்',
    analyzingText: 'நோய் பகுப்பாய்வு நடக்கிறது...',
    confidenceScore: 'AI நம்பகத்தன்மை',
    needsExpertReviewBadge: 'வல்லுநர் மதிப்பாய்வு தேவை (< 60%)',
    confirmedDiagnosisBadge: 'உறுதிசெய்யப்பட்ட AI கணிப்பு',
    disclaimerText: 'குறிப்பு: இந்த AI கணிப்பு வழிகாட்டுதலுக்கானது. உறுதிப்படுத்த அருகில் உள்ள வேளாண் அறிவியல் மையத்தை (KVK) அணுகவும்.',
    weatherRiskTitle: 'நேரலை வானிலை இடர் மதிப்பீடு',
    fungalRisk: 'பூஞ்சை நோய் அபாயம்',
    bacterialRisk: 'பாக்டீரியா நோய் அபாயம்',
    pestRisk: 'பூச்சித் தாக்குதல் அபாயம்',
    ipmHeader: 'ஒருங்கிணைந்த பயிர் பாதுகாப்பு (IPM) ஆலோசனை',
    step1Monitoring: '1. வயல் கண்காணிப்பு',
    step2Cultural: '2. சாகுபடி முறைகள் மற்றும் தூய்மை',
    step3Biological: '3. உயிரியல் பாதுகாப்பு முறைகள்',
    step4Mechanical: '4. இயந்திர மற்றும் உடல் முறைகள்',
    step5Chemical: '5. வேதியியல் மருந்துகள் (கடைசி வழி)',
    vettedDosageBadge: 'அங்கீகரிக்கப்பட்ட அளவு',
    phiLabel: 'அறுவடைக்கு முந்தைய இடைவெளி (PHI)',
    safetyLabel: 'பாதுகாப்பு எச்சரிக்கை',
    readAloud: 'ஆலோசனையை கேட்கவும் (TTS)',
    stopAudio: 'நிறுத்து',
    followUpPrompt: '5-7 நாட்களுக்குப் பின் நிலை',
    uploadFollowUp: 'மருந்து தெளித்த 5-7 நாள் கழித்து படம் பதிவேற்றவும்',
    alertsWithin10km: '10 கி.மீ சுற்றளவில் நோய் எச்சரிக்கைகள்',
    distanceAway: 'உங்கள் நிலத்திலிருந்து தொலைவு',
    noAlertsNearby: '10 கி.மீ சுற்றளவில் தீவிர நோய் பாதிப்பு இல்லை.',
    footerText: 'Developed by Team Tech Giants | devp3987@gmail.com | +91 8081774848'
  },
  bn: {
    appTitle: 'এগ্রোপারি',
    appSubtitle: 'এআই ফসল স্বাস্থ্য ব্যবস্থাপনা ব্যবস্থা',
    farmerRole: 'কৃষক (Farmer)',
    expertRole: 'কৃষি আধিকারিক / বিশেষজ্ঞ',
    adminRole: 'অ্যাডমিন সেটিংস',
    tabDiagnose: 'ফসল রোগ নির্ণয়',
    tabFieldsAndAlerts: 'আমার খেত ও ১০ কিমি সতর্কতা',
    tabMap: 'হটস্পট মানচিত্র',
    tabExpertQueue: 'বিশেষজ্ঞ পর্যালোচনা সারি',
    tabOfficialDash: 'অফিসিয়াল ড্যাশবোর্ড',
    tabRiskRules: 'আবহাওয়া ঝুঁকি নিয়মাবলী',
    tabSensors: 'আইওটি সেন্সর ডেটা',
    captureOrUpload: 'ফসলের ছবি তুলুন বা আপলোড করুন',
    tapToSnap: 'ক্যামেরা চালু করুন বা পাতার ছবি বাছুন',
    clientCompressing: 'ছবি সংকুচিত করা হচ্ছে...',
    gpsAccuracy: 'জিপিএস নির্ভুলতা',
    gpsLocating: 'সঠিক জিপিএস অবস্থান খোঁজা হচ্ছে...',
    dropPinFallback: 'মানচিত্রে পিন রাখুন',
    analyzeButton: 'এআই দিয়ে ফসল পরীক্ষা করুন',
    analyzingText: 'রোগ নির্ণয় করা হচ্ছে...',
    confidenceScore: 'এআই নির্ভরযোগ্যতা',
    needsExpertReviewBadge: 'বিশেষজ্ঞ পর্যালোচনা প্রয়োজন (< ৬০%)',
    confirmedDiagnosisBadge: 'নিশ্চিত রোগ নির্ণয়',
    disclaimerText: 'বিজ্ঞপ্তি: এই এআই রিপোর্ট পরামর্শমূলক। চূড়ান্ত নিশ্চিতকরণের জন্য নিকটবর্তী কৃষি বিজ্ঞান কেন্দ্র (KVK)-এর সাথে যোগাযোগ করুন।',
    weatherRiskTitle: 'লাইভ আবহাওয়া ঝুঁকি',
    fungalRisk: 'ছত্রাকজনিত ঝুঁকি',
    bacterialRisk: 'ব্যাকটেরিয়া ঝুঁকি',
    pestRisk: 'কীটপতঙ্গ প্রাদুর্ভাব ঝুঁকি',
    ipmHeader: 'সমন্বিত বালাই ব্যবস্থাপনা (IPM) পরামর্শ',
    step1Monitoring: '১. খেত পর্যবেক্ষণ',
    step2Cultural: '২. পরিচর্যা ও পরিচ্ছন্নতা',
    step3Biological: '৩. জৈব নিয়ন্ত্রণ পদ্ধতি',
    step4Mechanical: '৪. যান্ত্রিক ও শারীরিক নিয়ন্ত্রণ',
    step5Chemical: '৫. রাসায়নিক প্রয়োগ (সর্বশেষ উপায়)',
    vettedDosageBadge: 'অনুমোদিত মাত্রা',
    phiLabel: 'ফসল তোলার পূর্ববর্তী ব্যবধান (PHI)',
    safetyLabel: 'সুরক্ষা নির্দেশিকা',
    readAloud: 'পরামর্শ শুনুন (TTS)',
    stopAudio: 'থামান',
    followUpPrompt: '৫-৭ দিন পর অগ্রগতি যাচাই',
    uploadFollowUp: 'ঔষধ প্রয়োগের ৫-৭ দিন পর ছবি আপলোড করুন',
    alertsWithin10km: '১০ কিমি ব্যাসার্ধে রোগ সতর্কতা',
    distanceAway: 'আপনার খেত থেকে দূরত্ব',
    noAlertsNearby: '১০ কিলোমিটারের মধ্যে সক্রিয় রোগের প্রাদুর্ভাব নেই।',
    footerText: 'Developed by Team Tech Giants | devp3987@gmail.com | +91 8081774848'
  }
};
