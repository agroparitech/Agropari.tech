import React, { useState } from 'react';
import { Sliders, Save, Plus, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { AgronomicRiskRule } from '../types';
import { DEFAULT_RISK_RULES } from '../data/mockAndReferenceData';

interface RiskRulesConfigViewProps {
  rules: AgronomicRiskRule[];
  onSaveRules: (updatedRules: AgronomicRiskRule[]) => Promise<void>;
}

export const RiskRulesConfigView: React.FC<RiskRulesConfigViewProps> = ({
  rules,
  onSaveRules
}) => {
  const [localRules, setLocalRules] = useState<AgronomicRiskRule[]>(rules);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setLocalRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleUpdate = (id: string, field: keyof AgronomicRiskRule, val: any) => {
    setLocalRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMessage(null);
    try {
      await onSaveRules(localRules);
      setSuccessMessage('Agronomic risk threshold rules updated successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (e: any) {
      alert(`Save failed: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setLocalRules([...DEFAULT_RISK_RULES]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl">
            <Sliders className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-stone-900">
                Agronomic Environmental Risk Rules (Module 3)
              </h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Tunable Engine
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Agronomists can tune micro-climate pathogen thresholds (temperature, humidity, rainfall) without code changes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-100 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ICAR Defaults</span>
          </button>
          <button
            type="button"
            id="save-risk-rules-btn"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Rule Thresholds'}</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Rules Table / Cards */}
      <div className="space-y-4">
        {localRules.map((rule) => (
          <div
            key={rule.id}
            className={`p-5 rounded-2xl border-2 transition text-xs space-y-4 ${
              rule.enabled ? 'bg-white border-stone-200' : 'bg-stone-50 border-stone-200 opacity-60'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`rule-toggle-${rule.id}`}
                  checked={rule.enabled}
                  onChange={() => handleToggle(rule.id)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div>
                  <h3 className="text-base font-black text-stone-900">{rule.title}</h3>
                  <span className="text-[10px] uppercase font-bold text-stone-500">
                    Category: {rule.category} pathogen
                  </span>
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded font-black text-[10px] uppercase ${
                  rule.riskLevel === 'high'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                Triggers {rule.riskLevel} Risk Alert
              </span>
            </div>

            {/* Config Sliders & Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <label className="block text-stone-600 font-bold mb-1">
                  Min Humidity Threshold (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="30"
                    max="95"
                    value={rule.minHumidity}
                    onChange={(e) => handleUpdate(rule.id, 'minHumidity', Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <span className="font-black text-stone-800 w-10 text-right">{rule.minHumidity}%</span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <label className="block text-stone-600 font-bold mb-1">
                  Temp Range (°C)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={rule.minTemp}
                    onChange={(e) => handleUpdate(rule.id, 'minTemp', Number(e.target.value))}
                    className="w-14 bg-white border border-stone-300 rounded p-1 text-center font-bold"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    value={rule.maxTemp}
                    onChange={(e) => handleUpdate(rule.id, 'maxTemp', Number(e.target.value))}
                    className="w-14 bg-white border border-stone-300 rounded p-1 text-center font-bold"
                  />
                  <span>°C</span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <label className="block text-stone-600 font-bold mb-1">
                  Min 48h Rain (mm)
                </label>
                <input
                  type="number"
                  value={rule.minRainfall48h}
                  onChange={(e) => handleUpdate(rule.id, 'minRainfall48h', Number(e.target.value))}
                  className="w-full bg-white border border-stone-300 rounded p-1 font-bold"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <label className="block text-stone-600 font-bold mb-1">
                  Sustained Duration
                </label>
                <div className="flex items-center gap-1 font-bold text-stone-800">
                  <input
                    type="number"
                    value={rule.consecutiveHours}
                    onChange={(e) => handleUpdate(rule.id, 'consecutiveHours', Number(e.target.value))}
                    className="w-16 bg-white border border-stone-300 rounded p-1"
                  />
                  <span>hours</span>
                </div>
              </div>
            </div>

            <div className="text-stone-600 text-[11px] bg-stone-100/70 p-2.5 rounded-lg">
              <strong>Epidemiological Rationale: </strong>
              {rule.notes}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
