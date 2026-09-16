import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  FileSpreadsheet,
  FileText,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Database,
  Cpu,
  RefreshCw,
  Sparkles,
  Users,
  Printer,
  SlidersHorizontal,
  X,
  ShieldCheck
} from 'lucide-react';
import { CropCase, RiskAlert } from '../types';
import { generateSurveillanceAndFarmerReportPDF } from '../utils/pdfExport';

interface OfficialDashboardViewProps {
  cases: CropCase[];
  alerts: RiskAlert[];
}

export const OfficialDashboardView: React.FC<OfficialDashboardViewProps> = ({
  cases,
  alerts
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // PDF Export Configuration State
  const [pdfCropFilter, setPdfCropFilter] = useState<string>('all');
  const [pdfDistrictFilter, setPdfDistrictFilter] = useState<string>('all');
  const [pdfTitle, setPdfTitle] = useState<string>('State & District Crop Health Surveillance & Farmer Statistics Report');
  const [pdfOfficerName, setPdfOfficerName] = useState<string>('Dr. R. K. Sharma (District Agricultural Officer)');
  const [includeFarmerContact, setIncludeFarmerContact] = useState<boolean>(true);

  const totalCases = cases.length;
  const confirmedCases = cases.filter((c) => c.status === 'confirmed' || c.status === 'corrected').length;
  const pendingCases = cases.filter((c) => c.status === 'pending_review' || c.needsExpertReview).length;
  const confirmationRate = totalCases > 0 ? Math.round((confirmedCases / totalCases) * 100) : 100;

  // Breakdown by crop
  const cropCounts = cases.reduce((acc, c) => {
    acc[c.cropName] = (acc[c.cropName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Breakdown by disease
  const diseaseCounts = cases.reduce((acc, c) => {
    acc[c.probableDisease] = (acc[c.probableDisease] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Unique options for filters
  const availableCrops = Object.keys(cropCounts);
  const availableDistricts = Array.from(
    new Set(cases.map((c) => c.location.district).filter(Boolean))
  ) as string[];

  // Filtered subset for PDF preview
  const previewFilteredCases = cases.filter((c) => {
    const matchCrop = pdfCropFilter === 'all' || c.cropName.toLowerCase() === pdfCropFilter.toLowerCase();
    const matchDist = pdfDistrictFilter === 'all' || c.location.district?.toLowerCase() === pdfDistrictFilter.toLowerCase();
    return matchCrop && matchDist;
  });

  const previewUniqueFarmers = new Set(
    previewFilteredCases.map((c) => `${c.farmerName}-${c.farmerPhone}`)
  ).size;

  // Trigger PDF Generation
  const handleGeneratePDF = () => {
    setIsGeneratingPdf(true);
    try {
      generateSurveillanceAndFarmerReportPDF(cases, alerts, {
        title: pdfTitle,
        cropFilter: pdfCropFilter,
        districtFilter: pdfDistrictFilter,
        officerName: pdfOfficerName,
        includeFarmerContact
      });
      setIsPdfModalOpen(false);
    } catch (err: any) {
      console.error('Error generating PDF report:', err);
      alert(`Failed to generate PDF: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Quick One-Click PDF Download with default settings
  const handleQuickDownloadPDF = () => {
    setIsGeneratingPdf(true);
    try {
      generateSurveillanceAndFarmerReportPDF(cases, alerts, {
        title: 'Official Crop Health Surveillance & Farmer Statistics Dossier',
        includeFarmerContact: true
      });
    } catch (err: any) {
      console.error('Quick PDF export error:', err);
      alert(`Error generating PDF: ${err?.message || err}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Export Incident Report (CSV)
  const handleExportIncidentCSV = () => {
    const headers = [
      'Case ID',
      'Crop',
      'Variety',
      'Stage',
      'Diagnosed Disease',
      'Confidence %',
      'Status',
      'Village',
      'District',
      'State',
      'Latitude',
      'Longitude',
      'Timestamp'
    ];

    const rows = cases.map((c) => [
      c.id,
      `"${c.cropName}"`,
      `"${c.cropVariety || ''}"`,
      `"${c.growthStage || ''}"`,
      `"${c.probableDisease}"`,
      c.confidence,
      c.status,
      `"${c.location.village || ''}"`,
      `"${c.location.district || ''}"`,
      `"${c.location.state || ''}"`,
      c.location.latitude,
      c.location.longitude,
      c.timestamp
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `agropari-crop-health-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Module 10: Export Labeled Dataset for Model Fine-Tuning
  const handleExportModelDataset = async (format: 'json' | 'csv') => {
    setIsExporting(true);
    try {
      window.open(`/api/export-dataset?format=${format}`, '_blank');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl">
            <BarChart3 className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-stone-900">
                Department of Agriculture — Official Dashboard
              </h2>
              <span className="text-xs bg-emerald-800 text-white font-bold px-2 py-0.5 rounded-full">
                Module 11
              </span>
            </div>
            <p className="text-xs text-stone-500">
              State & District Epidemiological Surveillance, Containment Rings, and Continuous Model Training
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="quick-export-pdf-btn"
            onClick={handleQuickDownloadPDF}
            disabled={isGeneratingPdf}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
            title="Download full surveillance report with standard official parameters"
          >
            <FileText className="w-4 h-4 text-emerald-200" />
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Official PDF'}</span>
          </button>

          <button
            id="configure-export-pdf-btn"
            onClick={() => setIsPdfModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            title="Customize report scope, filters, and officer sign-off"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
            <span>Custom PDF Dossier</span>
          </button>

          <button
            id="export-incident-csv-btn"
            onClick={handleExportIncidentCSV}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Surveillance CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 space-y-1">
          <div className="text-xs font-bold text-stone-500 uppercase">Total Field Reports</div>
          <div className="text-3xl font-black text-stone-900">{totalCases}</div>
          <div className="text-xs text-stone-600 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active Farmer Submissions</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 space-y-1">
          <div className="text-xs font-bold text-stone-500 uppercase">Expert Confirmed Cases</div>
          <div className="text-3xl font-black text-emerald-700">{confirmedCases}</div>
          <div className="text-xs text-stone-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{confirmationRate}% validation rate</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 space-y-1">
          <div className="text-xs font-bold text-stone-500 uppercase">Under Expert Review</div>
          <div className="text-3xl font-black text-amber-600">{pendingCases}</div>
          <div className="text-xs text-stone-600 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Confidence &lt;60% or flagged</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 space-y-1">
          <div className="text-xs font-bold text-stone-500 uppercase">Active 10 km Risk Clusters</div>
          <div className="text-3xl font-black text-rose-600">{alerts.length}</div>
          <div className="text-xs text-stone-600">Broadcast rings active</div>
        </div>
      </div>

      {/* Surveillance Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cases by Crop */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4">
          <h3 className="font-extrabold text-stone-900 text-sm">Pathology Incidence by Crop</h3>
          <div className="space-y-3 text-xs">
            {Object.entries(cropCounts).map(([crop, count]) => {
              const numCount = Number(count);
              const pct = totalCases > 0 ? Math.round((numCount / totalCases) * 100) : 0;
              return (
                <div key={crop} className="space-y-1">
                  <div className="flex items-center justify-between font-bold text-stone-800">
                    <span>{crop}</span>
                    <span className="font-mono text-emerald-800">
                      {numCount} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Diagnosed Pathogens */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4">
          <h3 className="font-extrabold text-stone-900 text-sm">Prevalent Disease / Pest Outbreaks</h3>
          <div className="space-y-3 text-xs">
            {Object.entries(diseaseCounts).map(([disease, count]) => {
              const numCount = Number(count);
              const pct = totalCases > 0 ? Math.round((numCount / totalCases) * 100) : 0;
              return (
                <div key={disease} className="space-y-1">
                  <div className="flex items-center justify-between font-bold text-stone-800">
                    <span className="truncate pr-2">{disease}</span>
                    <span className="font-mono text-stone-700">{numCount} cases</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODULE 10: CONTINUOUS LEARNING & FINE-TUNING DATASET HUB */}
      <div className="bg-stone-900 text-white p-6 rounded-2xl shadow-md border border-stone-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/30 text-emerald-300 rounded-xl border border-emerald-500/40">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white">
                  Continuous Model Fine-Tuning Pipeline (Module 10)
                </h3>
                <span className="text-[10px] bg-emerald-500 text-stone-950 font-bold px-2 py-0.5 rounded">
                  PlantVillage + Indian Field Conditions
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Ground-truth expert labeled pairs to train in-house MobileNet / EfficientNet classifiers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="export-dataset-csv-btn"
              onClick={() => handleExportModelDataset('csv')}
              disabled={isExporting}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <Database className="w-4 h-4" />
              <span>Export Labeled Dataset (CSV)</span>
            </button>
            <button
              id="export-dataset-json-btn"
              onClick={() => handleExportModelDataset('json')}
              disabled={isExporting}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-emerald-300 border border-emerald-500/30 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Export JSON Format</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-stone-800">
          <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700">
            <span className="text-stone-400 text-[11px]">Validated Samples Ready</span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{confirmedCases} Verified Pairs</div>
          </div>
          <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700">
            <span className="text-stone-400 text-[11px]">Supported Target Backbones</span>
            <div className="text-sm font-bold text-stone-200 mt-0.5">MobileNetV3, EfficientNet-B0</div>
          </div>
          <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700">
            <span className="text-stone-400 text-[11px]">Primary Cost Objective</span>
            <div className="text-sm font-bold text-stone-200 mt-0.5">Gradually reduce 3rd-party API reliance</div>
          </div>
        </div>
      </div>

      {/* PDF Export Configuration & Preview Modal */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-300 overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-800/80 rounded-lg text-emerald-200">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Export Official Crop Health & Farmer Statistics (PDF)</h3>
                  <p className="text-xs text-emerald-200">
                    Generate regulatory-ready epidemiological surveillance dossier & farmer registry
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-800/50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Settings */}
            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {/* Report Title */}
              <div className="space-y-1">
                <label className="font-bold text-stone-800 block">Dossier / Document Title</label>
                <input
                  type="text"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  placeholder="e.g. State & District Crop Health Surveillance & Farmer Statistics Report"
                />
              </div>

              {/* Scope Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-stone-800 block">Crop Scope Filter</label>
                  <select
                    value={pdfCropFilter}
                    onChange={(e) => setPdfCropFilter(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  >
                    <option value="all">All Crops ({totalCases} Total Reports)</option>
                    {availableCrops.map((crop) => (
                      <option key={crop} value={crop}>
                        {crop} ({cropCounts[crop]} cases)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-800 block">District Scope Filter</label>
                  <select
                    value={pdfDistrictFilter}
                    onChange={(e) => setPdfDistrictFilter(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  >
                    <option value="all">All Districts (State-wide)</option>
                    {availableDistricts.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Issuing Officer & Designation */}
              <div className="space-y-1">
                <label className="font-bold text-stone-800 block">Issuing Authority / Officer Name & Designation</label>
                <input
                  type="text"
                  value={pdfOfficerName}
                  onChange={(e) => setPdfOfficerName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  placeholder="e.g. Dr. R. K. Sharma (District Agricultural Officer)"
                />
              </div>

              {/* Options Checkboxes */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
                <span className="font-bold text-stone-900 block">Documentation Formatting & Data Privacy</span>
                <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                  <input
                    type="checkbox"
                    checked={includeFarmerContact}
                    onChange={(e) => setIncludeFarmerContact(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>
                    <strong>Include Farmer Mobile Numbers:</strong> Recommended for departmental field officers & agronomists doing follow-up visits (uncheck to redact for public documentation).
                  </span>
                </label>
              </div>

              {/* Real-time PDF Preview Summary */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Dossier Generation Summary</span>
                  </span>
                  <span className="text-[11px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-mono">
                    Ready for Export
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    <span className="text-stone-500 text-[10px] block">Field Records</span>
                    <strong className="text-stone-900 text-sm">{previewFilteredCases.length} Cases</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    <span className="text-stone-500 text-[10px] block">Unique Farmers</span>
                    <strong className="text-stone-900 text-sm">{previewUniqueFarmers} Producers</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    <span className="text-stone-500 text-[10px] block">Containment Rings</span>
                    <strong className="text-stone-900 text-sm">{alerts.length} Active Rings</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    <span className="text-stone-500 text-[10px] block">Output Format</span>
                    <strong className="text-emerald-700 text-sm">Vector PDF (A4)</strong>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-800 pt-1">
                  Includes Executive KPI summary, pathology incidence tables, complete farmer submission log, and active 10 km containment alerts with official signature seal block.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-bold rounded-xl text-xs transition"
              >
                Cancel
              </button>

              <button
                type="button"
                id="modal-generate-pdf-btn"
                onClick={handleGeneratePDF}
                disabled={isGeneratingPdf || previewFilteredCases.length === 0}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-md text-xs flex items-center gap-2 transition disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingPdf ? 'Compiling PDF Dossier...' : 'Download Official PDF Dossier'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
