import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  MapPin,
  CloudSun,
  User,
  ExternalLink,
  ChevronDown,
  Filter,
  Send,
  Sparkles,
  FileText,
  Download
} from 'lucide-react';
import { CropCase } from '../types';
import { generateSingleCaseDiagnosticPDF, generateSurveillanceAndFarmerReportPDF } from '../utils/pdfExport';

interface ExpertQueueViewProps {
  cases: CropCase[];
  onReviewSubmitted: (caseId: string, decision: 'approved' | 'corrected' | 'rejected', notes: string, correctedDisease?: string) => Promise<void>;
}

export const ExpertQueueView: React.FC<ExpertQueueViewProps> = ({
  cases,
  onReviewSubmitted
}) => {
  const [filterMode, setFilterMode] = useState<'pending' | 'all'>('pending');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Review Form State
  const [decision, setDecision] = useState<'approved' | 'corrected' | 'rejected'>('approved');
  const [notes, setNotes] = useState<string>('Confirmed diagnosis based on distinct leaf lesion patterns.');
  const [correctedDisease, setCorrectedDisease] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const pendingCases = cases.filter((c) => c.status === 'pending_review' || c.needsExpertReview);
  const displayedCases = filterMode === 'pending' ? pendingCases : cases;

  const activeCase = cases.find((c) => c.id === selectedCaseId) || displayedCases[0] || null;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase) return;

    if (!notes.trim()) {
      alert('Mandatory expert note is required per protocol.');
      return;
    }

    if (decision === 'corrected' && !correctedDisease.trim()) {
      alert('Please provide the corrected disease label.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onReviewSubmitted(
        activeCase.id,
        decision,
        notes,
        decision === 'corrected' ? correctedDisease : undefined
      );
      alert('Expert validation recorded! If confirmed, 10 km notification broadcast has been dispatched.');
      setNotes('');
      setCorrectedDisease('');
    } catch (err: any) {
      alert(`Error submitting review: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-900 rounded-xl">
            <ShieldAlert className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-stone-900">
                Official Expert Validation Queue (Module 8)
              </h2>
              <span className="text-xs bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded-full">
                {pendingCases.length} Pending Actions
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Low-confidence (&lt;60%) AI predictions & farmer-flagged samples awaiting official agronomic validation
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="export-queue-pdf-btn"
            onClick={() =>
              generateSurveillanceAndFarmerReportPDF(displayedCases, [], {
                title: `Agronomist Expert Queue Report (${filterMode === 'pending' ? 'Pending Actions' : 'All Cases'})`,
                officerName: 'District Plant Pathologist / Agronomist',
                includeFarmerContact: true
              })
            }
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            title="Download PDF report of cases in current queue filter"
          >
            <FileText className="w-4 h-4 text-emerald-200" />
            <span>Export Queue (PDF)</span>
          </button>

          {/* Filter Toggle */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterMode('pending')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterMode === 'pending'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Pending Review ({pendingCases.length})
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterMode === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Submissions ({cases.length})
            </button>
          </div>
        </div>
      </div>

      {displayedCases.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 text-stone-500 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h4 className="font-bold text-stone-800 text-base">Expert Queue Clear</h4>
          <p className="text-xs">All submitted crop pathology cases have been validated.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left List of Cases */}
          <div className="lg:col-span-4 space-y-3 max-h-[820px] overflow-y-auto pr-1">
            {displayedCases.map((c) => {
              const isSelected = activeCase?.id === c.id;
              const isLowConf = c.confidence < 60;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer text-xs space-y-2 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-stone-900 text-sm">{c.cropName}</span>
                      <p className="text-stone-500 text-[11px]">
                        {c.location.village}, {c.location.district}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : isLowConf
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {c.confidence}% Conf.
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={c.imageUrl}
                      alt={c.cropName}
                      className="w-14 h-14 rounded-lg object-cover border border-stone-200 shrink-0"
                    />
                    <div className="space-y-0.5 flex-1">
                      <div className="font-bold text-stone-800 line-clamp-1">{c.probableDisease}</div>
                      <div className="text-stone-500 text-[10px] flex items-center gap-1">
                        <span>Stage: {c.growthStage || 'Vegetative'}</span>
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {new Date(c.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Case Inspection & Validation Form */}
          {activeCase && (
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-6">
              {/* Top Meta */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Case #{activeCase.id}
                    </span>
                    <span className="text-xs text-stone-500">
                      Logged on {new Date(activeCase.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-stone-900 mt-1">
                    {activeCase.cropName} — {activeCase.probableDisease}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    id="export-single-case-pdf-btn"
                    type="button"
                    onClick={() => generateSingleCaseDiagnosticPDF(activeCase)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-2xs"
                    title="Export printable diagnostic certificate and IPM spray advisory"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Export Diagnostic PDF</span>
                  </button>

                  <div className="text-right">
                    <div className="text-xs text-stone-500">AI Confidence Score</div>
                    <div
                      className={`text-2xl font-black ${
                        activeCase.confidence < 60 ? 'text-amber-600' : 'text-emerald-700'
                      }`}
                    >
                      {activeCase.confidence}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo & Agronomic Context Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <img
                    src={activeCase.imageUrl}
                    alt={activeCase.cropName}
                    className="w-full h-64 object-cover rounded-xl border border-stone-300 shadow-xs"
                  />
                  <p className="text-[11px] text-stone-500 mt-1.5 text-center">
                    Submitted by farmer: {activeCase.farmerName} ({activeCase.farmerPhone})
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Top-3 AI Predictions */}
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <span className="font-bold text-stone-800 block">AI Differential Guesses</span>
                    <div className="space-y-1.5">
                      {activeCase.top3Alternatives?.map((alt, i) => (
                        <div key={i} className="flex items-center justify-between bg-white p-2 rounded border border-stone-200">
                          <span className="font-medium text-stone-800">{alt.diseaseName}</span>
                          <span className="font-bold text-emerald-800 font-mono">{alt.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GPS & Weather Snapshot Context */}
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                    <div className="font-bold text-stone-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {activeCase.location.village}, {activeCase.location.district} ({activeCase.location.state})
                      </span>
                    </div>
                    <div className="text-stone-500 font-mono text-[11px]">
                      GPS: {activeCase.location.latitude.toFixed(4)}° N, {activeCase.location.longitude.toFixed(4)}° E (± {activeCase.location.accuracy}m)
                    </div>

                    {activeCase.weatherSnapshot && (
                      <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-stone-700">
                        <span>
                          Weather: <strong>{activeCase.weatherSnapshot.temperature}°C</strong> |{' '}
                          <strong>{activeCase.weatherSnapshot.humidity}% RH</strong>
                        </span>
                        <span className="text-emerald-700 font-semibold">{activeCase.weatherSnapshot.conditionText}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Farmer description */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700">
                <strong>Visual Pathological Analysis: </strong>
                {activeCase.description}
              </div>

              {/* Expert Validation Form */}
              <form onSubmit={handleSubmitReview} className="p-5 rounded-2xl bg-amber-50/50 border-2 border-amber-300 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-black text-stone-900 text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <span>Official Agronomist Verdict</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-900 uppercase">
                    Mandatory Notes Protocol
                  </span>
                </div>

                {/* Decision Radio */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <label
                    className={`p-3 rounded-xl border font-bold text-center cursor-pointer transition ${
                      decision === 'approved'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-white text-stone-700 border-stone-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="approved"
                      checked={decision === 'approved'}
                      onChange={() => setDecision('approved')}
                      className="hidden"
                    />
                    <span>Approve (Confirm)</span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border font-bold text-center cursor-pointer transition ${
                      decision === 'corrected'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                        : 'bg-white text-stone-700 border-stone-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="corrected"
                      checked={decision === 'corrected'}
                      onChange={() => setDecision('corrected')}
                      className="hidden"
                    />
                    <span>Correct Diagnosis</span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border font-bold text-center cursor-pointer transition ${
                      decision === 'rejected'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                        : 'bg-white text-stone-700 border-stone-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="rejected"
                      checked={decision === 'rejected'}
                      onChange={() => setDecision('rejected')}
                      className="hidden"
                    />
                    <span>Reject Sample</span>
                  </label>
                </div>

                {/* Corrected Disease Input */}
                {decision === 'corrected' && (
                  <div className="text-xs">
                    <label className="block text-stone-700 font-semibold mb-1">
                      Correct Pathogen / Diagnosis Label *
                    </label>
                    <input
                      type="text"
                      id="corrected-disease-input"
                      value={correctedDisease}
                      onChange={(e) => setCorrectedDisease(e.target.value)}
                      placeholder="e.g. Septoria Leaf Spot, Pink Bollworm Larval Entry"
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 font-medium"
                      required
                    />
                  </div>
                )}

                {/* Mandatory Notes */}
                <div className="text-xs">
                  <label className="block text-stone-700 font-semibold mb-1">
                    Mandatory Agronomist Review Notes *
                  </label>
                  <textarea
                    id="expert-notes-input"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter clinical rationale, microscopic confirmation, or field advice..."
                    className="w-full bg-white border border-amber-300 rounded-xl p-2.5 font-medium"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-stone-500">
                    Approving automatically broadcasts 10 km notification to adjacent registered farmers.
                  </span>

                  <button
                    type="submit"
                    id="submit-expert-review-btn"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-black rounded-xl shadow transition text-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Recording...' : 'Submit Expert Validation'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
