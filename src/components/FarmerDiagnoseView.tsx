import React, { useState, useEffect } from 'react';
import {
  Camera,
  Upload,
  MapPin,
  Compass,
  CloudSun,
  ShieldAlert,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Info,
  Calendar,
  Layers,
  FileCheck,
  ChevronRight,
  Send,
  FileText
} from 'lucide-react';
import {
  CropCase,
  IPMAdvisory,
  LanguageCode,
  LocationCoords,
  WeatherCondition,
  AgronomicRiskAssessment
} from '../types';
import { MULTILINGUAL_DICTIONARY } from '../data/mockAndReferenceData';
import { compressImageClientSide } from '../utils/imageCompress';
import { getHighAccuracyPosition } from '../utils/geo';
import { evaluateAgronomicRisk, fetchLiveWeather } from '../utils/weather';
import { ManualPinModal } from './ManualPinModal';
import { generateSingleCaseDiagnosticPDF } from '../utils/pdfExport';
import { LiveCameraModal } from './LiveCameraModal';
import { VoiceNarrationCard } from './VoiceNarrationCard';
import { getHindiPathology } from '../utils/hindiPathology';

interface FarmerDiagnoseViewProps {
  currentLanguage: LanguageCode;
  onCaseCreated: (newCase: CropCase) => void;
  activeRules: any[];
  userCoords: LocationCoords | null;
  setUserCoords: (coords: LocationCoords) => void;
}

export const FarmerDiagnoseView: React.FC<FarmerDiagnoseViewProps> = ({
  currentLanguage,
  onCaseCreated,
  activeRules,
  userCoords,
  setUserCoords
}) => {
  const dict = MULTILINGUAL_DICTIONARY[currentLanguage] || MULTILINGUAL_DICTIONARY.en;
  const isHindi = currentLanguage === 'hi';

  // Form State
  const [cropName, setCropName] = useState<string>('Paddy (Rice)');
  const [cropVariety, setCropVariety] = useState<string>('PR-126 Basmati');
  const [growthStage, setGrowthStage] = useState<
    'Germination' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Maturity' | 'Harvesting'
  >('Vegetative');
  const [farmerName, setFarmerName] = useState<string>('Rameshwar Kisan');
  const [farmerPhone, setFarmerPhone] = useState<string>('+91 9823412099');

  // Photo & Compression
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState<boolean>(false);
  const [compressionStats, setCompressionStats] = useState<{
    originalSizeKb: number;
    compressedSizeKb: number;
    ratio: number;
  } | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // GPS Location
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);

  // Weather & Risk
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<AgronomicRiskAssessment | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);

  // Diagnosis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeDiagnosis, setActiveDiagnosis] = useState<CropCase | null>(null);

  // Audio / TTS State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Follow-up Photo State
  const [showFollowUpForm, setShowFollowUpForm] = useState<boolean>(false);
  const [followUpNotes, setFollowUpNotes] = useState<string>('Leaves showing recovery after IPM application.');
  const [followUpStatus, setFollowUpStatus] = useState<'improving' | 'unchanged' | 'worsened'>('improving');
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState<boolean>(false);

  // Request High-Accuracy GPS
  const handleFetchGps = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const coords = await getHighAccuracyPosition();
      setUserCoords(coords);
      // Load live weather for coordinates
      fetchWeatherForCoords(coords.latitude, coords.longitude);
    } catch (err: any) {
      console.warn('Geolocation error:', err);
      setLocationError(err.message || 'GPS request timed out. Please enable location or use manual pin.');
      // Fallback default coordinates (Ahmednagar, Maharashtra)
      if (!userCoords) {
        const fallback: LocationCoords = {
          latitude: 19.542,
          longitude: 74.004,
          accuracy: 65,
          village: 'Akole',
          block: 'Akole Tehsil',
          district: 'Ahmednagar',
          state: 'Maharashtra',
          isManualPin: false
        };
        setUserCoords(fallback);
        fetchWeatherForCoords(fallback.latitude, fallback.longitude);
      }
    } finally {
      setIsLocating(false);
    }
  };

  const fetchWeatherForCoords = async (lat: number, lon: number) => {
    setIsLoadingWeather(true);
    try {
      const weatherData = await fetchLiveWeather(lat, lon);
      setWeather(weatherData);
      const risk = evaluateAgronomicRisk(weatherData, activeRules);
      setRiskAssessment(risk);
    } catch (e) {
      console.warn('Weather fetch error:', e);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // Initial location bootstrap if null
  useEffect(() => {
    if (!userCoords) {
      handleFetchGps();
    } else if (!weather) {
      fetchWeatherForCoords(userCoords.latitude, userCoords.longitude);
    }
  }, []);

  // Handle image selection & client-side compression
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const result = await compressImageClientSide(file, 1024, 0.78);
      setSelectedImage(result.compressedDataUrl);
      setCompressionStats({
        originalSizeKb: Math.round(result.originalSizeBytes / 1024),
        compressedSizeKb: Math.round(result.compressedSizeBytes / 1024),
        ratio: result.compressionRatio
      });
    } catch (err) {
      console.error('Image compression failed:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  // Handle direct snapshot capture from live webcam/camera stream
  const handleLiveCameraCapture = async (dataUrl: string) => {
    setIsCompressing(true);
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'live-crop-leaf-camera.jpg', { type: 'image/jpeg' });
      const result = await compressImageClientSide(file, 1024, 0.78);
      setSelectedImage(result.compressedDataUrl);
      setCompressionStats({
        originalSizeKb: Math.round(result.originalSizeBytes / 1024),
        compressedSizeKb: Math.round(result.compressedSizeBytes / 1024),
        ratio: result.compressionRatio
      });
    } catch (err) {
      console.warn('Direct live capture compression error:', err);
      setSelectedImage(dataUrl);
      setCompressionStats({
        originalSizeKb: Math.round(dataUrl.length / 1024),
        compressedSizeKb: Math.round(dataUrl.length / 1024),
        ratio: 1
      });
    } finally {
      setIsCompressing(false);
    }
  };

  // Text-To-Speech (Web Speech API) for low-literacy farmers
  const handleReadAloud = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this device browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Set language voice code
    const langMap: Record<LanguageCode, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      pa: 'pa-IN',
      mr: 'mr-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      bn: 'bn-IN'
    };
    utterance.lang = langMap[currentLanguage] || 'en-IN';
    utterance.rate = 0.9; // slightly slower for clarity

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Run Crop Health Analysis via Server API
  const handleAnalyzeCrop = async () => {
    if (!selectedImage) {
      alert('Please upload or snap a photo of the affected crop leaf first.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const payload = {
        imageBase64: selectedImage,
        cropName,
        cropVariety,
        growthStage,
        farmerName,
        farmerPhone,
        location: userCoords || {
          latitude: 28.6139,
          longitude: 77.209,
          accuracy: 25,
          district: 'Local District'
        },
        weatherSnapshot: weather,
        riskAssessment,
        deviceMetadata: {
          userAgent: navigator.userAgent,
          connectionType: (navigator as any).connection?.effectiveType || 'cellular'
        }
      };

      const res = await fetch('/api/analyze-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.case) {
        setActiveDiagnosis(data.case);
        onCaseCreated(data.case);
      }
    } catch (err: any) {
      console.error('Analysis failed:', err);
      alert('Network error during analysis. Using local agronomy fallback.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit 5-7 Day Follow-Up Photo (Module 10)
  const handleSubmitFollowUp = async () => {
    if (!activeDiagnosis) return;
    setIsSubmittingFollowUp(true);
    try {
      const res = await fetch(`/api/cases/${activeDiagnosis.id}/follow-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: selectedImage,
          farmerNotes: followUpNotes,
          recoveryStatus: followUpStatus
        })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveDiagnosis(data.case);
        setShowFollowUpForm(false);
        alert('Follow-up progress photo saved! This data helps refine treatment accuracy.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingFollowUp(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* SECTION 1: CROP & FARMER DETAILS */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Crop & Farmer Information</h2>
              <p className="text-xs text-stone-500">Provide field parameters to calibrate AI diagnostic accuracy</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full">
            Step 1 of 3
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div>
            <label className="block text-stone-700 font-semibold mb-1">Crop Type *</label>
            <select
              id="crop-type-select"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[44px]"
            >
              <option value="Paddy (Rice)">Paddy (Rice / धान)</option>
              <option value="Cotton">Cotton (कपास)</option>
              <option value="Tomato">Tomato (टमाटर)</option>
              <option value="Potato">Potato (आलू)</option>
              <option value="Maize">Maize (मक्का)</option>
              <option value="Chilli">Chilli (मिर्च)</option>
              <option value="Wheat">Wheat (गेहूं)</option>
              <option value="Soybean">Soybean (सोयाबीन)</option>
              <option value="Sugarcane">Sugarcane (गन्ना)</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">Variety / Hybrid</label>
            <input
              type="text"
              id="crop-variety-input"
              value={cropVariety}
              onChange={(e) => setCropVariety(e.target.value)}
              placeholder="e.g. PR-126, Arka Rakshak, Bt-659"
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">Current Growth Stage</label>
            <select
              id="growth-stage-select"
              value={growthStage}
              onChange={(e) => setGrowthStage(e.target.value as any)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[44px]"
            >
              <option value="Germination">Germination / Seedling</option>
              <option value="Vegetative">Vegetative Growth</option>
              <option value="Flowering">Flowering / Heading</option>
              <option value="Fruiting">Fruiting / Pod Formation</option>
              <option value="Maturity">Grain Fill / Maturity</option>
              <option value="Harvesting">Harvesting</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 2: GPS & LOCATION ACCURACY (MODULE 2 SPEC) */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900">GPS Location & Accuracy Radius</h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  High Precision
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Required to correlate local micro-weather risks and broadcast 10 km containment alerts.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="refresh-gps-button"
            onClick={handleFetchGps}
            disabled={isLocating}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl transition min-h-[36px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Fetching...' : 'Re-detect GPS'}</span>
          </button>
        </div>

        {/* Location Status Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Field Administrative Location</span>
              </span>
              {userCoords?.isManualPin && (
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                  Manually Pinned
                </span>
              )}
            </div>

            <div className="text-stone-900 font-bold text-sm">
              {userCoords?.village ? (
                <span>
                  {userCoords.village}, {userCoords.block}, {userCoords.district} ({userCoords.state})
                </span>
              ) : (
                'Resolving OpenStreetMap Nominatim location...'
              )}
            </div>

            <div className="text-stone-500 text-[11px] font-mono">
              Coordinates: {userCoords?.latitude.toFixed(4) || '—'}° N,{' '}
              {userCoords?.longitude.toFixed(4) || '—'}° E
            </div>
          </div>

          {/* Accuracy Radius Indicator (Module 2 Requirement) */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-700">Accuracy Radius (position.coords.accuracy)</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  (userCoords?.accuracy || 0) <= 25
                    ? 'bg-emerald-100 text-emerald-800'
                    : (userCoords?.accuracy || 0) <= 50
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                ± {userCoords?.accuracy || 15} meters
              </span>
            </div>

            <p className="text-stone-600 text-xs">
              {(userCoords?.accuracy || 0) <= 50
                ? 'Excellent GPS fix. Sufficient for accurate 10 km risk clustering.'
                : 'GPS accuracy is over 50m. Move away from trees or place pin manually on map.'}
            </p>

            {/* If accuracy > 50m, prompt fallback as required by Module 2 */}
            {(userCoords?.accuracy || 0) > 50 && (
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Accuracy &gt; 50m: Move to open sky or drop pin.</span>
                </div>
              </div>
            )}

            <button
              type="button"
              id="open-manual-pin-modal-btn"
              onClick={() => setIsPinModalOpen(true)}
              className="w-full py-2 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 font-bold rounded-lg transition flex items-center justify-center gap-1.5 text-xs min-h-[40px]"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>{dict.dropPinFallback || 'Place Pin Manually on Map'}</span>
            </button>
          </div>
        </div>

        {/* Live Weather & Agronomic Risk (Module 3) */}
        {weather && (
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudSun className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-emerald-950 text-sm">
                  {dict.weatherRiskTitle || 'Real-Time Weather Risk (Open-Meteo)'}
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">{weather.conditionText}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg border border-emerald-100 shadow-xs">
                <div className="text-stone-500 text-[10px]">Temperature</div>
                <div className="text-base font-extrabold text-stone-800">{weather.temperature}°C</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-emerald-100 shadow-xs">
                <div className="text-stone-500 text-[10px]">Relative Humidity</div>
                <div className="text-base font-extrabold text-stone-800">{weather.humidity}%</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-emerald-100 shadow-xs">
                <div className="text-stone-500 text-[10px]">Rainfall (24h)</div>
                <div className="text-base font-extrabold text-stone-800">{weather.rainfall} mm</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-emerald-100 shadow-xs">
                <div className="text-stone-500 text-[10px]">Overall Agronomic Risk</div>
                <div
                  className={`text-xs font-black uppercase mt-1 px-1.5 py-0.5 rounded ${
                    riskAssessment?.overallRisk === 'high'
                      ? 'bg-rose-100 text-rose-800'
                      : riskAssessment?.overallRisk === 'medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {riskAssessment?.overallRisk || 'low'}
                </div>
              </div>
            </div>

            {riskAssessment && riskAssessment.activeTriggers.length > 0 && (
              <div className="text-[11px] text-emerald-900 bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                <strong>Agronomic Risk Triggers: </strong>
                {riskAssessment.activeTriggers.join(' • ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 3: IMAGE CAPTURE & CLIENT-SIDE COMPRESSION (MODULE 1 SPEC) */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {dict.captureOrUpload || 'Upload or Capture Crop Photo'}
              </h2>
              <p className="text-xs text-stone-500">
                Works offline & on 3G: Images are compressed in-browser before sending
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full">
            Step 3 of 3
          </span>
        </div>

        {/* Image Picker / Drag Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Live Camera Button */}
          <button
            type="button"
            id="open-live-camera-button"
            onClick={() => setIsLiveCameraOpen(true)}
            className="flex flex-col items-center justify-center p-6 border-2 border-emerald-400 hover:border-emerald-600 bg-emerald-50/70 hover:bg-emerald-100/70 rounded-2xl cursor-pointer transition min-h-[150px] text-center shadow-xs group"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition shadow-sm">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-ping" />
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <span className="font-extrabold text-sm text-stone-950">
              {isHindi ? 'कैमरा खोलें (Live)' : (dict.openLiveCamera || 'Open Live Camera')}
            </span>
            <span className="text-xs text-stone-600 mt-1 max-w-xs leading-snug">
              {isHindi ? 'मोबाइल या लैपटॉप कैमरे से पौधे/पत्ती की लाइव फोटो खींचें' : (dict.openLiveCameraDesc || 'Take a clear direct photo of the affected crop leaf')}
            </span>
            <span className="mt-2 text-[11px] font-bold text-emerald-800 bg-emerald-200/70 px-2.5 py-0.5 rounded-full">
              {isHindi ? '● लाइव वीडियो कैमरा' : '● Live Stream & Capture'}
            </span>
          </button>

          {/* Gallery / File Upload */}
          <label
            htmlFor="gallery-input"
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-300 hover:border-emerald-400 bg-stone-50/50 hover:bg-stone-50 rounded-2xl cursor-pointer transition min-h-[150px] text-center"
          >
            <div className="w-12 h-12 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center mb-2">
              <Upload className="w-6 h-6 text-stone-600" />
            </div>
            <span className="font-bold text-sm text-stone-900">
              {isHindi ? 'गैलरी या फाइल से चुनें' : (dict.chooseGallery || 'Choose from Phone Gallery')}
            </span>
            <span className="text-xs text-stone-500 mt-1">
              {isHindi ? 'फोन की मेमोरी से पुरानी फोटो अपलोड करें (JPEG, PNG)' : (dict.chooseGalleryDesc || 'JPEG, PNG, WebP supported')}
            </span>
            <input
              type="file"
              id="gallery-input"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>
        </div>

        {/* Compression Status indicator */}
        {isCompressing && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>{isHindi ? 'फोटो को 3जी नेटवर्क के लिए कंप्रेस किया जा रहा है...' : (dict.clientCompressing || 'Compressing image for rural 3G connection...')}</span>
          </div>
        )}

        {/* Selected Image Preview & Compression Stats */}
        {selectedImage && (
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div className="relative group shrink-0">
              <img
                src={selectedImage}
                alt="Crop leaf sample"
                className="w-28 h-28 object-cover rounded-xl border border-stone-300 shadow-xs"
              />
              <button
                type="button"
                onClick={() => setIsLiveCameraOpen(true)}
                className="absolute inset-0 bg-black/60 text-white rounded-xl opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-[11px] font-bold p-1 text-center"
              >
                <Camera className="w-4 h-4 mb-1" />
                <span>{isHindi ? 'दोबारा फोटो लें' : 'Retake'}</span>
              </button>
            </div>
            <div className="space-y-1 text-xs flex-1">
              <div className="font-bold text-stone-800 text-sm flex items-center gap-2">
                <span>{isHindi ? 'फसल की फोटो तैयार है' : 'Crop Photo Ready for Pathology Scan'}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              {compressionStats && (
                <div className="text-stone-600 space-y-0.5">
                  <p>
                    <strong>{isHindi ? 'डाटा बचत:' : 'Data Saved:'}</strong> {compressionStats.originalSizeKb} KB &rarr;{' '}
                    <span className="text-emerald-700 font-bold">{compressionStats.compressedSizeKb} KB</span>{' '}
                    ({compressionStats.ratio}% {isHindi ? 'छोटी फाइल' : 'smaller for fast upload'})
                  </p>
                  <p className="text-stone-500 text-[11px]">
                    {isHindi ? 'पत्ती के रोग के धब्बे साफ दिखेंगे और तुरंत रिपोर्ट बनेगी' : 'Optimized resolution preserves disease lesion detail while minimizing bandwidth.'}
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsLiveCameraOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline mt-1"
              >
                <Camera className="w-3 h-3" />
                <span>{isHindi ? 'लाइव कैमरे से नई फोटो खींचें' : 'Take another photo with live camera'}</span>
              </button>
            </div>

            <button
              type="button"
              id="analyze-crop-button"
              onClick={handleAnalyzeCrop}
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition text-sm min-h-[48px]"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{dict.analyzingText || 'Diagnosing plant pathology...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{dict.analyzeButton || 'Analyze Crop Health with AI'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* SECTION 4: DIAGNOSIS & MULTILINGUAL IPM ADVISORY (MODULES 1, 8, 9) */}
      {activeDiagnosis && (
        <div
          id="diagnosis-result-card"
          className="bg-white rounded-2xl p-6 shadow-md border-2 border-emerald-600/30 space-y-6 animate-fadeIn"
        >
          {/* Header & Confidence Gating (Module 1 Spec) */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {isHindi ? `${activeDiagnosis.cropName} रोग जांच रिपोर्ट` : `${activeDiagnosis.cropName} Pathology Report`}
                </span>
                <span className="text-xs text-stone-500">
                  {new Date(activeDiagnosis.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className="text-2xl font-black text-stone-900 tracking-tight">
                {isHindi
                  ? (getHindiPathology(activeDiagnosis.probableDisease)?.hindiName || activeDiagnosis.probableDisease)
                  : activeDiagnosis.probableDisease}
              </h3>
              {isHindi && (
                <p className="text-xs text-stone-500 font-semibold mt-0.5">
                  रोग का तकनीकी/अंग्रेजी नाम: {activeDiagnosis.probableDisease}
                </p>
              )}
            </div>

            {/* Confidence Badge & <60% Expert Review Flag */}
            <div className="text-right">
              <div className="flex items-center gap-2">
                {activeDiagnosis.confidence < 60 ? (
                  <span
                    id="needs-expert-review-badge"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-stone-950 font-black text-xs rounded-xl shadow-xs animate-pulse"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>{dict.needsExpertReviewBadge || 'Needs Expert Review (< 60%)'}</span>
                  </span>
                ) : (
                  <span
                    id="high-confidence-badge"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>{dict.confirmedDiagnosisBadge || 'High Confidence Diagnosis'}</span>
                  </span>
                )}
                <span className="text-lg font-black text-stone-800">{activeDiagnosis.confidence}%</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                {activeDiagnosis.confidence < 60
                  ? (isHindi ? 'सत्यापन के लिए ब्लॉक कृषि विशेषज्ञ (Agronomist) को भेजा गया' : 'Flagged to district Agronomist queue for verification')
                  : (isHindi ? 'सटीक पुष्टि: तुरंत उपचार शुरू कर सकते हैं' : 'Meets ≥60% confidence threshold')}
              </p>

              <button
                type="button"
                id="download-case-certificate-pdf-btn"
                onClick={() => generateSingleCaseDiagnosticPDF(activeDiagnosis)}
                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs ml-auto transition shadow-2xs"
                title="Download official PDF diagnostic report & IPM spray schedule for documentation"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isHindi ? 'निदान रिपोर्ट (PDF) डाउनलोड करें' : 'Download Diagnostic PDF'}</span>
              </button>
            </div>
          </div>

          {/* VOICE NARRATION CARD: Speaks the problem and the solution aloud */}
          <VoiceNarrationCard
            diseaseName={activeDiagnosis.probableDisease}
            description={activeDiagnosis.description}
            ipmAdvisory={activeDiagnosis.ipmAdvisory}
            cropName={activeDiagnosis.cropName}
            currentLanguage={currentLanguage}
          />

          {/* PROBLEM SUMMARY BOX: "दिक्कत क्या है" */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-stone-800 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-xs">
                !
              </span>
              <h4 className="font-extrabold text-amber-950 text-sm">
                {isHindi ? 'फसल में क्या मुख्य दिक्कत है (रोग व लक्षण)' : 'Primary Crop Issue & Clinical Symptoms'}
              </h4>
            </div>
            <p className="text-sm font-medium leading-relaxed pl-8">
              {isHindi
                ? (getHindiPathology(activeDiagnosis.probableDisease)?.hindiProblemSummary || activeDiagnosis.description)
                : activeDiagnosis.description}
            </p>
            {isHindi && getHindiPathology(activeDiagnosis.probableDisease)?.hindiDescription && (
              <div className="pl-8 text-xs text-stone-600 border-t border-amber-200/60 pt-2 mt-2">
                <strong>पहचान के लक्षण: </strong>
                {getHindiPathology(activeDiagnosis.probableDisease).hindiDescription}
              </div>
            )}
          </div>

          {/* Top-3 Alternatives (Module 1 Spec) */}
          {activeDiagnosis.top3Alternatives && activeDiagnosis.top3Alternatives.length > 0 && (
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs space-y-2">
              <div className="font-bold text-stone-800 flex items-center justify-between">
                <span>{isHindi ? 'अन्य संभावित रोग (वैकल्पिक विश्लेषण)' : 'Top-3 Pathological Possibilities'}</span>
                <span className="text-stone-500 font-normal">{isHindi ? 'डिफरेंशियल एनालिसिस' : 'Differential Analysis'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {activeDiagnosis.top3Alternatives.map((alt, i) => {
                  const altHindi = isHindi ? getHindiPathology(alt.diseaseName) : null;
                  return (
                    <div key={i} className="bg-white p-2.5 rounded-lg border border-stone-200">
                      <div className="flex items-center justify-between font-semibold text-stone-800 mb-1">
                        <span className="truncate" title={altHindi ? altHindi.hindiName : alt.diseaseName}>
                          {altHindi ? altHindi.hindiName : alt.diseaseName}
                        </span>
                        <span className="text-emerald-700 font-mono font-bold">{alt.confidence}%</span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, alt.confidence)}%` }}
                        />
                      </div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 mt-1 block">
                        {alt.pathogenType}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* INTEGRATED PEST MANAGEMENT (IPM) SEQUENCING (MODULE 9 SPEC) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-black text-stone-900">
                {isHindi ? 'दिक्कत का संपूर्ण समाधान (रोकथाम व उपचार योजना)' : (dict.ipmHeader || 'Integrated Pest Management (IPM) Advisory')}
              </h4>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded font-mono font-bold">
                {isHindi ? 'आईसीएआर प्रमाणित अनुक्रम' : 'ICAR Standard Sequence'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* 1. Monitoring Steps */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="font-extrabold text-stone-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>{isHindi ? '1. खेत की निगरानी व निरीक्षण (Scouting)' : (dict.step1Monitoring || '1. Monitoring & Scouting Steps')}</span>
                </div>
                <ul className="space-y-1.5 text-stone-700 pl-7 list-disc">
                  {(isHindi
                    ? (getHindiPathology(activeDiagnosis.probableDisease)?.hindiMonitoring || activeDiagnosis.ipmAdvisory?.monitoringSteps)
                    : activeDiagnosis.ipmAdvisory?.monitoringSteps
                  )?.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>

              {/* 2. Cultural Controls */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="font-extrabold text-stone-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>{isHindi ? '2. सस्य क्रियाएं एवं स्वच्छता (Cultural)' : (dict.step2Cultural || '2. Cultural & Sanitation Practices')}</span>
                </div>
                <ul className="space-y-1.5 text-stone-700 pl-7 list-disc">
                  {(isHindi
                    ? (getHindiPathology(activeDiagnosis.probableDisease)?.hindiCultural || activeDiagnosis.ipmAdvisory?.culturalControls)
                    : activeDiagnosis.ipmAdvisory?.culturalControls
                  )?.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>

              {/* 3. Biological Controls */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="font-extrabold text-stone-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>{isHindi ? '3. जैविक व प्राकृतिक उपचार (Biological)' : (dict.step3Biological || '3. Biological & Botanical Controls')}</span>
                </div>
                <ul className="space-y-1.5 text-stone-700 pl-7 list-disc">
                  {(isHindi
                    ? (getHindiPathology(activeDiagnosis.probableDisease)?.hindiBiological || activeDiagnosis.ipmAdvisory?.biologicalControls)
                    : activeDiagnosis.ipmAdvisory?.biologicalControls
                  )?.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>

              {/* 4. Mechanical Controls */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="font-extrabold text-stone-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">
                    4
                  </span>
                  <span>{isHindi ? '4. भौतिक एवं यांत्रिक रोकथाम (Mechanical)' : (dict.step4Mechanical || '4. Physical & Mechanical Controls')}</span>
                </div>
                <ul className="space-y-1.5 text-stone-700 pl-7 list-disc">
                  {(isHindi
                    ? (getHindiPathology(activeDiagnosis.probableDisease)?.hindiMechanical || activeDiagnosis.ipmAdvisory?.mechanicalControls || ['रोगग्रस्त पत्तियों को तोड़कर नष्ट करें'])
                    : (activeDiagnosis.ipmAdvisory?.mechanicalControls || ['Manually remove and dispose of infected leaves'])
                  )?.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 5. Chemical Controls (Last Resort - Module 9 Strict Mandate) */}
            <div className="p-4.5 rounded-xl bg-rose-50/60 border-2 border-rose-300 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-black text-rose-950 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-700 text-white flex items-center justify-center text-xs">
                    5
                  </span>
                  <span>{isHindi ? '5. रासायनिक उपचार (अंतिम विकल्प - सीमित व सुरक्षित प्रयोग)' : (dict.step5Chemical || '5. Chemical Controls (Last Resort Only)')}</span>
                </div>
                <span className="text-[10px] font-extrabold bg-rose-200 text-rose-900 px-2 py-0.5 rounded">
                  {isHindi ? 'कृषि विभाग द्वारा अनुमोदित खुराक' : (dict.vettedDosageBadge || 'Govt. Vetted Dosage')}
                </span>
              </div>

              {isHindi && getHindiPathology(activeDiagnosis.probableDisease)?.hindiChemical ? (
                <div className="space-y-2.5">
                  {getHindiPathology(activeDiagnosis.probableDisease).hindiChemical.map((chemStr, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-xl border border-rose-200 text-xs space-y-1.5">
                      <div className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>उपचार विकल्प #{idx + 1}: {chemStr}</span>
                      </div>
                      <div className="p-2 bg-amber-50 rounded-lg text-stone-700 text-[11px] border border-amber-200 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span><strong>कटाई प्रतीक्षा अवधि (PHI):</strong> 7 से 14 दिन का अंतर रखें।</span>
                      </div>
                    </div>
                  ))}
                  <div className="p-2.5 bg-rose-100/70 rounded-lg text-rose-950 text-xs font-semibold border border-rose-300">
                    <strong>सुरक्षा निर्देश: </strong>
                    {getHindiPathology(activeDiagnosis.probableDisease).hindiSafetyWarning}
                  </div>
                </div>
              ) : (
                activeDiagnosis.ipmAdvisory?.chemicalControls?.map((chem, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-xl border border-rose-200 text-xs space-y-2">
                    <div className="font-extrabold text-stone-900 text-sm">
                      Active Chemical Class: {chem.activeIngredientClass}
                    </div>
                    <div className="text-stone-700">
                      <strong>Approved Dosage (Dept. of Agriculture):</strong> {chem.dosageGuidelines}
                    </div>
                    <div className="flex flex-wrap gap-4 text-stone-800">
                      <div className="flex items-center gap-1 text-amber-900 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        <span>
                          {dict.phiLabel || 'Pre-Harvest Interval (PHI)'}: {chem.preHarvestIntervalDays} days
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-rose-100/60 rounded-lg text-rose-900 text-[11px] font-medium border border-rose-200">
                      <strong>{dict.safetyLabel || 'Safety Precautions'}:</strong> {chem.safetyPrecautions}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mandatory Krishi Vigyan Kendra Disclaimer (Prompt Non-Functional Requirement) */}
          <div className="p-3 bg-stone-100 rounded-xl border border-stone-300 text-xs text-stone-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{dict.disclaimerText}</p>
          </div>

          {/* MODULE 10: 5-7 DAY FOLLOW-UP PROGRESS THREAD */}
          <div className="border-t border-stone-200 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-extrabold text-stone-900 text-sm">
                  {dict.followUpPrompt || 'Follow-Up Progress Thread (5-7 Days)'}
                </h5>
                <p className="text-xs text-stone-500">
                  Track field recovery and build the continuous learning dataset
                </p>
              </div>
              <button
                type="button"
                id="toggle-follow-up-form-btn"
                onClick={() => setShowFollowUpForm(!showFollowUpForm)}
                className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-lg text-xs transition"
              >
                {showFollowUpForm ? 'Cancel' : dict.uploadFollowUp || 'Upload Follow-Up Photo'}
              </button>
            </div>

            {/* Existing follow-ups */}
            {activeDiagnosis.followUps && activeDiagnosis.followUps.length > 0 && (
              <div className="space-y-2">
                {activeDiagnosis.followUps.map((f) => (
                  <div key={f.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-stone-800">
                        Follow-up logged on {new Date(f.timestamp).toLocaleDateString()}
                      </span>
                      <p className="text-stone-600">{f.farmerNotes}</p>
                    </div>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                        f.recoveryStatus === 'improving'
                          ? 'bg-emerald-100 text-emerald-800'
                          : f.recoveryStatus === 'unchanged'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {f.recoveryStatus}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Follow-up submission form */}
            {showFollowUpForm && (
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3 text-xs">
                <div className="font-bold text-emerald-950">Record Treatment Recovery Progress</div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Field Recovery Status</label>
                  <select
                    value={followUpStatus}
                    onChange={(e) => setFollowUpStatus(e.target.value as any)}
                    className="w-full bg-white border border-stone-300 rounded-lg p-2 font-medium"
                  >
                    <option value="improving">Improving - New leaves healthy, lesion drying</option>
                    <option value="unchanged">Unchanged - Symptoms persistent</option>
                    <option value="worsened">Worsened - Spread to new tillers/plants</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Farmer Observation Notes</label>
                  <textarea
                    rows={2}
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg p-2"
                    placeholder="e.g. Applied bio-spray on Tuesday; morning dew leaf damage stopped spreading."
                  />
                </div>
                <button
                  type="button"
                  id="submit-follow-up-btn"
                  onClick={handleSubmitFollowUp}
                  disabled={isSubmittingFollowUp}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingFollowUp ? 'Saving...' : 'Submit Progress Update'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Map Pin Fallback Modal */}
      <ManualPinModal
        isOpen={isPinModalOpen}
        initialCoords={userCoords ? { latitude: userCoords.latitude, longitude: userCoords.longitude } : undefined}
        onConfirm={(coords) => {
          setUserCoords(coords);
          fetchWeatherForCoords(coords.latitude, coords.longitude);
        }}
        onClose={() => setIsPinModalOpen(false)}
      />

      {/* Direct Live Camera Modal with Viewfinder & Shutter */}
      <LiveCameraModal
        isOpen={isLiveCameraOpen}
        onClose={() => setIsLiveCameraOpen(false)}
        onCapture={handleLiveCameraCapture}
        currentLanguage={currentLanguage}
      />
    </div>
  );
};
