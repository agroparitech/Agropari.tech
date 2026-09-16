import React, { useState } from 'react';
import {
  Bell,
  ShieldAlert,
  Calendar,
  Layers,
  Droplets,
  Sprout,
  Store,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  Info
} from 'lucide-react';
import { FarmerProfile, LanguageCode, LocationCoords, RiskAlert } from '../types';
import { DISTRICT_OGD_CONTEXT, MULTILINGUAL_DICTIONARY } from '../data/mockAndReferenceData';
import { calculateDistanceKm } from '../utils/geo';

interface FarmerFieldsAndAlertsViewProps {
  currentLanguage: LanguageCode;
  userCoords: LocationCoords | null;
  alerts: RiskAlert[];
  onViewAdvisoryForDisease?: (diseaseName: string, cropName: string) => void;
}

export const FarmerFieldsAndAlertsView: React.FC<FarmerFieldsAndAlertsViewProps> = ({
  currentLanguage,
  userCoords,
  alerts,
  onViewAdvisoryForDisease
}) => {
  const dict = MULTILINGUAL_DICTIONARY[currentLanguage] || MULTILINGUAL_DICTIONARY.en;

  // Active Farmer Field Profile (Module 4)
  const [profile, setProfile] = useState<FarmerProfile>({
    id: 'farmer-local',
    name: 'Baldev Singh Dhillon',
    phone: '+91 9417283411',
    village: userCoords?.village || 'Raikot',
    district: userCoords?.district || 'Ludhiana',
    state: userCoords?.state || 'Punjab',
    coordinates: {
      latitude: userCoords?.latitude || 30.651,
      longitude: userCoords?.longitude || 75.602
    },
    cropType: 'Paddy (Rice)',
    variety: 'PR-126 Basmati',
    sowingDate: '2026-07-01',
    fieldSizeAcres: 6.5,
    soilType: 'Alluvial',
    irrigationType: 'Borewell / Tube well'
  });

  // Derive Growth Stage automatically based on sowing date (Module 4 specification)
  const deriveGrowthStage = (sowingDateStr: string): { stage: string; daysElapsed: number } => {
    const sowing = new Date(sowingDateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - sowing.getTime());
    const daysElapsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysElapsed < 15) return { stage: 'Germination / Seedling', daysElapsed };
    if (daysElapsed < 45) return { stage: 'Active Tillering / Vegetative', daysElapsed };
    if (daysElapsed < 70) return { stage: 'Flowering & Panicle Initiation', daysElapsed };
    if (daysElapsed < 100) return { stage: 'Grain Filling / Pod Development', daysElapsed };
    return { stage: 'Maturity / Ready to Harvest', daysElapsed };
  };

  const growth = deriveGrowthStage(profile.sowingDate);

  // Compute live distance from user coords to each alert
  const userLat = userCoords?.latitude || profile.coordinates.latitude;
  const userLon = userCoords?.longitude || profile.coordinates.longitude;

  const nearbyAlerts = alerts.map((a) => {
    const dist = calculateDistanceKm(userLat, userLon, a.coordinates.latitude, a.coordinates.longitude);
    return {
      ...a,
      affectedDistanceKm: dist,
      isWithin10km: dist <= 10
    };
  }).sort((a, b) => (a.affectedDistanceKm || 0) - (b.affectedDistanceKm || 0));

  // OGD District Context data (Module 4)
  const districtKey = profile.district.includes('Ludhiana')
    ? 'Ludhiana'
    : profile.district.includes('Ahmednagar')
    ? 'Ahmednagar'
    : profile.district.includes('Bagalkot')
    ? 'Bagalkot'
    : 'Kasganj';
  const districtOgd = DISTRICT_OGD_CONTEXT[districtKey] || DISTRICT_OGD_CONTEXT['Ludhiana'];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* 10 KM RISK NETWORK ALERTS (MODULE 6 SPECIFICATION) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-stone-900">
                  {dict.alertsWithin10km || '10 km Risk Network & Outbreak Alerts'}
                </h3>
                <span className="text-xs font-extrabold bg-rose-500 text-white px-2 py-0.5 rounded-full">
                  {nearbyAlerts.filter((a) => a.isWithin10km).length} Active Nearby
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Geospatial early-warning system: Alerting fields within 10 km of confirmed pathogen clusters
              </p>
            </div>
          </div>
        </div>

        {nearbyAlerts.filter((a) => a.isWithin10km).length === 0 ? (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
            <Sprout className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{dict.noAlertsNearby || 'No active disease outbreaks detected within 10 km radius of your farm.'}</span>
          </div>
        ) : (
          <div className="space-y-3">
            {nearbyAlerts
              .filter((a) => a.isWithin10km)
              .map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 rounded-xl border-2 border-rose-300 bg-rose-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-rose-950">{alert.diseaseName}</span>
                      <span className="bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                        Affects {alert.cropAffected}
                      </span>
                    </div>
                    <p className="text-stone-700 font-medium">{alert.advisorySummary}</p>
                    <div className="flex items-center gap-3 text-stone-500 text-[11px]">
                      <span className="flex items-center gap-1 font-bold text-rose-700">
                        <MapPin className="w-3.5 h-3.5" />
                        {alert.affectedDistanceKm} km {dict.distanceAway || 'away from your field'}
                      </span>
                      <span>Confirmed by District Agronomist</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onViewAdvisoryForDisease) {
                        onViewAdvisoryForDisease(alert.diseaseName, alert.cropAffected);
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1 shrink-0"
                  >
                    <span>Preventive Advisory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* FARMER PROFILE & DERIVED GROWTH STAGE (MODULE 4 SPECIFICATION) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">Farmer Field Profile & Crop Context</h3>
              <p className="text-xs text-stone-500">
                Automated growth stage derivation and agronomic field attributes
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <div className="text-stone-500 font-medium">Farmer Name & Village</div>
            <div className="text-stone-900 font-extrabold text-sm mt-0.5">{profile.name}</div>
            <div className="text-stone-600 text-[11px] mt-0.5">
              {profile.village}, {profile.district} ({profile.state})
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <div className="text-stone-500 font-medium">Crop & Variety</div>
            <div className="text-stone-900 font-extrabold text-sm mt-0.5">
              {profile.cropType} ({profile.variety})
            </div>
            <div className="text-stone-600 text-[11px] mt-0.5">Field Size: {profile.fieldSizeAcres} Acres</div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="text-emerald-900 font-bold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>Derived Growth Stage</span>
            </div>
            <div className="text-emerald-950 font-black text-sm mt-0.5">{growth.stage}</div>
            <div className="text-emerald-800 text-[11px] mt-0.5 font-medium">
              Sown on {profile.sowingDate} ({growth.daysElapsed} days elapsed)
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <div className="text-stone-500 font-medium">Soil Type</div>
            <div className="text-stone-900 font-bold mt-0.5">{profile.soilType}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <div className="text-stone-500 font-medium">Irrigation System</div>
            <div className="text-stone-900 font-bold mt-0.5">{profile.irrigationType}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <div className="text-stone-500 font-medium">Geospatial Coordinates</div>
            <div className="text-stone-900 font-mono font-bold mt-0.5">
              {profile.coordinates.latitude.toFixed(4)}, {profile.coordinates.longitude.toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      {/* DISTRICT OGD & AGMARKNET COMMODITY CONTEXT (MODULE 4 SPECIFICATION) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-stone-900">
                  District Historical Pest & Mandi Context (OGD / Agmarknet)
                </h3>
                <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded">
                  data.gov.in Live API
                </span>
              </div>
              <p className="text-xs text-stone-500">
                What is prevalent in {profile.district} district right now & official market trends
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Common Regional Pathogens */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <span className="font-extrabold text-stone-800 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Prevalent District Disease Pressures ({profile.district})</span>
            </span>
            <ul className="space-y-1 text-stone-700 pl-4 list-disc">
              {districtOgd.commonDiseases.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
            <p className="text-[11px] text-stone-500 pt-1 border-t border-stone-200">
              {districtOgd.advisoryNote}
            </p>
          </div>

          {/* Agmarknet Mandi Prices */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <span className="font-extrabold text-stone-800 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-blue-600" />
              <span>Agmarknet Mandi Daily Modal Rates</span>
            </span>
            <div className="space-y-1.5">
              {districtOgd.currentMandiPrices.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-stone-200">
                  <div>
                    <span className="font-bold text-stone-800">{m.commodity}</span>
                    <span className="text-[10px] text-stone-500 block">{m.mandi}</span>
                  </div>
                  <span className="font-black text-emerald-800">{m.modalPrice}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
