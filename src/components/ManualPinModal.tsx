import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Check, X, Compass } from 'lucide-react';
import { LocationCoords } from '../types';
import { reverseGeocodeCoords } from '../utils/geo';

interface ManualPinModalProps {
  isOpen: boolean;
  initialCoords?: { latitude: number; longitude: number };
  onConfirm: (coords: LocationCoords) => void;
  onClose: () => void;
}

export const ManualPinModal: React.FC<ManualPinModalProps> = ({
  isOpen,
  initialCoords,
  onConfirm,
  onClose
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [pinnedLat, setPinnedLat] = useState<number>(initialCoords?.latitude || 28.6139);
  const [pinnedLon, setPinnedLon] = useState<number>(initialCoords?.longitude || 77.209);
  const [resolvedAddress, setResolvedAddress] = useState<{ village: string; block: string; district: string; state: string } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      const centerLat = initialCoords?.latitude || 22.5937;
      const centerLon = initialCoords?.longitude || 78.9629;
      const initialZoom = initialCoords ? 13 : 5;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLon],
        zoom: initialZoom
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: 'custom-pin-drop',
        html: `
          <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: #059669;">
            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="#059669" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3" fill="white"></circle>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const marker = L.marker([centerLat, centerLon], {
        icon: pinIcon,
        draggable: true
      }).addTo(map);

      markerRef.current = marker;
      mapInstanceRef.current = map;

      const updatePinLocation = async (lat: number, lon: number) => {
        setPinnedLat(lat);
        setPinnedLon(lon);
        setIsGeocoding(true);
        try {
          const addr = await reverseGeocodeCoords(lat, lon);
          setResolvedAddress(addr);
        } finally {
          setIsGeocoding(false);
        }
      };

      // Drag event
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        updatePinLocation(pos.lat, pos.lng);
      });

      // Click on map to place pin
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        updatePinLocation(e.latlng.lat, e.latlng.lng);
      });

      // Initial reverse geocode
      updatePinLocation(centerLat, centerLon);
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onConfirm({
      latitude: pinnedLat,
      longitude: pinnedLon,
      accuracy: 10, // Manual pin accuracy standard
      village: resolvedAddress?.village || 'Farm Field',
      block: resolvedAddress?.block || 'Block',
      district: resolvedAddress?.district || 'District',
      state: resolvedAddress?.state || 'State',
      isManualPin: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="font-bold text-base">Drop Pin Manually on OpenStreetMap</h3>
              <p className="text-xs text-emerald-200">
                Fallback for low GPS accuracy (&gt;50m) or indoor photography
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map */}
        <div className="relative w-full h-[380px] bg-stone-100">
          <div ref={mapContainerRef} className="absolute inset-0" />
          <div className="absolute top-3 left-3 z-[1000] bg-white/95 px-3 py-1.5 rounded-lg shadow text-xs font-semibold text-stone-700 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Click on map or drag pin to position over your field</span>
          </div>
        </div>

        {/* Coords & Reverse Geocode Banner */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="font-bold text-stone-800">
              Coordinates: {pinnedLat.toFixed(5)}, {pinnedLon.toFixed(5)}
            </div>
            <div className="text-stone-500">
              {isGeocoding ? (
                'Resolving village & district from OpenStreetMap Nominatim...'
              ) : resolvedAddress ? (
                <span>
                  <strong>{resolvedAddress.village}</strong>, {resolvedAddress.block},{' '}
                  {resolvedAddress.district}, {resolvedAddress.state}
                </span>
              ) : (
                'Rural agricultural area'
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              id="confirm-pin-btn"
              onClick={handleSave}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 shadow transition"
            >
              <Check className="w-4 h-4" />
              <span>Use This Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
