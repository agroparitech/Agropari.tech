import React from 'react';
import { X, Mail, Phone, Sprout, ShieldCheck, Cpu, Map, Layers } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-5 bg-emerald-900 text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold">
              <Sprout className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">About Agropari</h3>
              <p className="text-xs text-emerald-200">AI Crop Health Management System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-200 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs text-stone-700 leading-relaxed">
          {/* Mandatory Team Tech Giants Credentials */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
            <div className="font-black text-emerald-950 text-sm">
              Developed by Team Tech Giants
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-emerald-800">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>devp3987@gmail.com</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>+91 8081774848</span>
              </div>
            </div>
          </div>

          {/* 5-Layer Detection Accuracy Strategy (Technical Specification Section 5) */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Multi-Layered Agronomic Accuracy Architecture</span>
            </h4>
            <div className="space-y-2 text-stone-600">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <strong>Layer 1 — Commercial / AI Vision:</strong> Multimodal deep learning & Kindwise API integration for high-accuracy plant pathology detection from field leaf photos.
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <strong>Layer 2 — 60% Confidence Gating:</strong> Any prediction with &lt;60% confidence is automatically redirected to the Human Expert Review Queue to protect farmers from misdiagnoses.
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <strong>Layer 3 — Expert-in-the-Loop:</strong> State agronomists and KVK plant pathologists approve, correct, or reject cases with mandatory notes.
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <strong>Layer 4 — Continuous Learning:</strong> Confirmed cases are exported to fine-tune open-source MobileNet/EfficientNet models on the PlantVillage dataset, eliminating long-term API costs.
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <strong>Layer 5 — Micro-Climate Cross-Check:</strong> Real-time weather (Open-Meteo) and district pest history (data.gov.in) sanity-check diagnoses against ambient temperature and humidity.
              </div>
            </div>
          </div>

          {/* Integrated Open Source & Government APIs */}
          <div className="space-y-2">
            <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Zero-Billing Open APIs Implemented</span>
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-600">
              <li className="p-2 bg-stone-50 rounded border border-stone-200">
                <strong>Weather:</strong> Open-Meteo (Free, high limits, no key required)
              </li>
              <li className="p-2 bg-stone-50 rounded border border-stone-200">
                <strong>Mapping:</strong> Leaflet.js + OpenStreetMap (Avoids Google Maps billing)
              </li>
              <li className="p-2 bg-stone-50 rounded border border-stone-200">
                <strong>Geocoding:</strong> OpenStreetMap Nominatim with client-side cache
              </li>
              <li className="p-2 bg-stone-50 rounded border border-stone-200">
                <strong>Govt Data:</strong> data.gov.in OGD & Agmarknet mandi pricing
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
