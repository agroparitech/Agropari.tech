import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Filter, Eye, ShieldAlert, Sparkles, MapPin, Compass } from 'lucide-react';
import { CropCase } from '../types';

// Fix default Leaflet marker icon URLs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface HotspotMapViewProps {
  cases: CropCase[];
  selectedCaseId?: string | null;
  onSelectCase?: (c: CropCase) => void;
  userCoords?: { latitude: number; longitude: number } | null;
}

export const HotspotMapView: React.FC<HotspotMapViewProps> = ({
  cases,
  selectedCaseId,
  onSelectCase,
  userCoords
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const circleGroupRef = useRef<L.LayerGroup | null>(null);

  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [show10kmCircles, setShow10kmCircles] = useState<boolean>(true);
  const [showHeatCircles, setShowHeatCircles] = useState<boolean>(true);

  const uniqueCrops = Array.from(new Set(cases.map((c) => c.cropName))).filter(Boolean);

  const filteredCases = cases.filter((c) => {
    if (selectedCrop !== 'all' && c.cropName !== selectedCrop) return false;
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    return true;
  });

  // Calculate risk level of a case
  const getRiskLevel = (c: CropCase): 'green' | 'yellow' | 'orange' | 'red' => {
    if (c.status === 'confirmed') {
      if (c.riskAssessment?.overallRisk === 'high' || c.confidence > 85) return 'red';
      return 'orange';
    }
    if (c.needsExpertReview || c.confidence < 60) {
      return 'yellow';
    }
    return 'green';
  };

  const getRiskColor = (level: 'green' | 'yellow' | 'orange' | 'red'): string => {
    switch (level) {
      case 'red':
        return '#DC2626'; // Red: Multiple confirmed / high risk
      case 'orange':
        return '#EA580C'; // Orange: Medium risk confirmed contained
      case 'yellow':
        return '#EAB308'; // Yellow: Low risk unconfirmed/low-confidence
      case 'green':
        return '#16A34A'; // Green: No active outbreak
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = userCoords
        ? [userCoords.latitude, userCoords.longitude]
        : cases.length > 0
        ? [cases[0].location.latitude, cases[0].location.longitude]
        : [22.5937, 78.9629]; // Center of India

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: userCoords ? 10 : 6,
        minZoom: 3,
        maxZoom: 18,
        scrollWheelZoom: true
      });

      // Free OpenStreetMap Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Agropari Hotspot System',
        maxZoom: 19
      }).addTo(map);

      const layers = L.layerGroup().addTo(map);
      const circles = L.layerGroup().addTo(map);
      layerGroupRef.current = layers;
      circleGroupRef.current = circles;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers and 10km Circles on Filter/Cases changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    const circles = circleGroupRef.current;
    if (!map || !layers || !circles) return;

    layers.clearLayers();
    circles.clearLayers();

    // User location pin if available
    if (userCoords) {
      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `<div style="background-color: #059669; border: 3px solid #ffffff; width: 22px; height: 22px; border-radius: 50%; box-shadow: 0 0 10px rgba(5,150,105,0.8); display: flex; align-items: center; justify-content: center;"><div style="background: white; width: 6px; height: 6px; border-radius: 50%;"></div></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const userMarker = L.marker([userCoords.latitude, userCoords.longitude], {
        icon: userIcon,
        title: 'Your Farm Location'
      });
      userMarker.bindPopup(
        `<div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
          <strong style="color: #059669;">Your Current Farm Location</strong>
          <p style="margin: 2px 0 0;">Lat: ${userCoords.latitude.toFixed(4)}, Lon: ${userCoords.longitude.toFixed(4)}</p>
        </div>`
      );
      layers.addLayer(userMarker);
    }

    filteredCases.forEach((cropCase) => {
      const { latitude, longitude, village, district } = cropCase.location;
      const risk = getRiskLevel(cropCase);
      const color = getRiskColor(risk);

      // Custom high-contrast SVG div icon
      const customPin = L.divIcon({
        className: 'custom-disease-pin',
        html: `
          <div style="position: relative; width: 32px; height: 32px; cursor: pointer;">
            <div style="position: absolute; top: 0; left: 0; width: 32px; height: 32px; border-radius: 50%; background-color: ${color}; opacity: 0.3; animation: pulse 2s infinite;"></div>
            <div style="position: absolute; top: 4px; left: 4px; width: 24px; height: 24px; border-radius: 50%; background-color: ${color}; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">
              ${cropCase.cropName.substring(0, 2).toUpperCase()}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([latitude, longitude], { icon: customPin });

      // Popup Content
      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 220px; max-width: 280px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-weight: 800; font-size: 14px; color: #1c1917;">${cropCase.cropName}</span>
            <span style="background-color: ${color}; color: white; padding: 2px 6px; border-radius: 9999px; font-size: 10px; font-weight: bold; text-transform: uppercase;">
              ${risk} Risk
            </span>
          </div>
          <div style="font-size: 12px; margin-bottom: 4px; color: #292524;">
            <strong>Disease:</strong> ${cropCase.probableDisease} (${cropCase.confidence}% conf.)
          </div>
          <div style="font-size: 11px; color: #57534e; margin-bottom: 6px;">
            ${village ? `${village}, ` : ''}${district || 'Rural Field'}
          </div>
          <div style="background-color: #f5f5f4; border-radius: 6px; padding: 6px; font-size: 11px; color: #44403c; margin-bottom: 8px;">
            ${cropCase.description.substring(0, 100)}...
          </div>
          <div style="display: flex; gap: 4px;">
            <span style="font-size: 10px; color: #78716c;">Status: <strong>${cropCase.status}</strong></span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        if (onSelectCase) onSelectCase(cropCase);
      });

      layers.addLayer(marker);

      // 10km Risk Radius Circle (Module 6 & Module 7)
      if (show10kmCircles && (risk === 'red' || risk === 'orange')) {
        const circle = L.circle([latitude, longitude], {
          radius: 10000, // 10,000 meters = 10 km
          color: color,
          fillColor: color,
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '5, 8'
        });
        circle.bindTooltip(`10 km Alert Zone: ${cropCase.probableDisease} (${cropCase.cropName})`, {
          permanent: false,
          direction: 'top'
        });
        circles.addLayer(circle);
      }

      // Heat Circle for density visualization
      if (showHeatCircles) {
        const heatCircle = L.circle([latitude, longitude], {
          radius: risk === 'red' ? 18000 : 8000,
          color: 'transparent',
          fillColor: color,
          fillOpacity: 0.12,
          weight: 0
        });
        circles.addLayer(heatCircle);
      }
    });

    // Auto fit bounds if cases exist
    if (filteredCases.length > 0) {
      const group = new L.FeatureGroup(layers.getLayers());
      map.fitBounds(group.getBounds().pad(0.3));
    }
  }, [filteredCases, show10kmCircles, showHeatCircles, userCoords]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col h-[740px]">
      {/* Map Control Bar */}
      <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Epidemiological Hotspot & 10 km Risk Network Map
            </h3>
            <p className="text-xs text-stone-500">
              Leaflet.js + OpenStreetMap (Zero-Cost Geo-Spatial Monitoring)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Crop Filter */}
          <div className="flex items-center bg-white border border-stone-300 rounded-lg px-2 py-1">
            <Filter className="w-3.5 h-3.5 text-stone-400 mr-1.5" />
            <select
              id="map-crop-filter"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="bg-transparent font-medium text-stone-700 focus:outline-none"
            >
              <option value="all">All Crops ({cases.length})</option>
              {uniqueCrops.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-white border border-stone-300 rounded-lg px-2 py-1">
            <select
              id="map-status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-medium text-stone-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed Outbreaks</option>
              <option value="pending_review">Needs Review (&lt;60%)</option>
            </select>
          </div>

          {/* 10km Circles Toggle */}
          <button
            id="toggle-10km-circles-btn"
            onClick={() => setShow10kmCircles(!show10kmCircles)}
            className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 transition ${
              show10kmCircles
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-white border-stone-300 text-stone-600'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>10 km Alert Rings</span>
          </button>

          {/* Heat Circles Toggle */}
          <button
            id="toggle-heat-circles-btn"
            onClick={() => setShowHeatCircles(!showHeatCircles)}
            className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 transition ${
              showHeatCircles
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-stone-300 text-stone-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>Heat Density</span>
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative flex-1 w-full h-full min-h-[480px] z-0">
        <div ref={mapContainerRef} className="absolute inset-0 z-0" />

        {/* Legend Overlay on Map (Prompt Module 7 Specification) */}
        <div className="absolute top-4 left-4 z-[1] bg-white/95 backdrop-blur-sm p-3.5 rounded-xl shadow-lg border border-stone-200 text-xs max-w-xs">
          <div className="font-extrabold text-stone-900 mb-2 flex items-center justify-between">
            <span>Risk Zone Legend</span>
            <span className="text-[10px] text-stone-500 font-normal">Module 7 Spec</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white shrink-0 shadow-sm"></span>
              <span className="text-stone-700">
                <strong>Red (High Risk):</strong> Multiple confirmed / rapid spread
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-orange-500 border border-white shrink-0 shadow-sm"></span>
              <span className="text-stone-700">
                <strong>Orange (Medium Risk):</strong> Confirmed case(s), contained
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-400 border border-white shrink-0 shadow-sm"></span>
              <span className="text-stone-700">
                <strong>Yellow (Low Risk):</strong> 1-2 unconfirmed / &lt;60% conf.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 border border-white shrink-0 shadow-sm"></span>
              <span className="text-stone-700">
                <strong>Green:</strong> Clean zone / healthy crops
              </span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Dashed ring = 10 km notification radius</span>
          </div>
        </div>

        {/* Active Outbreak Counter Badge */}
        <div className="absolute top-4 right-4 z-[2] bg-stone-900/90 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>Showing {filteredCases.length} mapped incidents</span>
        </div>
      </div>
    </div>
  );
};
