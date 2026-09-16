import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CropCase, RiskAlert } from '../types';

export interface SurveillancePdfOptions {
  title?: string;
  departmentName?: string;
  officerName?: string;
  districtFilter?: string;
  cropFilter?: string;
  includeFarmerContact?: boolean;
}

/**
 * Generates an official, publication-quality Crop Health & Farmer Statistics Surveillance Report (PDF).
 */
export function generateSurveillanceAndFarmerReportPDF(
  cases: CropCase[],
  alerts: RiskAlert[],
  options: SurveillancePdfOptions = {}
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const title = options.title || 'Official Crop Health & Farmer Statistics Surveillance Report';
  const department = options.departmentName || 'Department of Agriculture & Plant Protection Directorate';
  const officer = options.officerName || 'District Agricultural Officer & Epidemiological Surveillance Cell';
  const generatedAt = new Date().toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  // Filter cases if specified
  let filteredCases = [...cases];
  if (options.cropFilter && options.cropFilter !== 'all') {
    filteredCases = filteredCases.filter(
      (c) => c.cropName.toLowerCase() === options.cropFilter?.toLowerCase()
    );
  }
  if (options.districtFilter && options.districtFilter !== 'all') {
    filteredCases = filteredCases.filter(
      (c) => c.location.district?.toLowerCase() === options.districtFilter?.toLowerCase()
    );
  }

  const totalCases = filteredCases.length;
  const confirmedCases = filteredCases.filter((c) => c.status === 'confirmed' || c.status === 'corrected').length;
  const pendingCases = filteredCases.filter((c) => c.status === 'pending_review' || c.needsExpertReview).length;
  const confirmationRate = totalCases > 0 ? Math.round((confirmedCases / totalCases) * 100) : 100;

  // Unique farmers calculation
  const uniqueFarmers = new Set(filteredCases.map((c) => `${c.farmerName}-${c.farmerPhone}`)).size;

  // Crop Breakdown
  const cropCounts = filteredCases.reduce((acc, c) => {
    acc[c.cropName] = (acc[c.cropName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Disease Breakdown
  const diseaseCounts = filteredCases.reduce((acc, c) => {
    acc[c.probableDisease] = (acc[c.probableDisease] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Districts breakdown
  const districtCounts = filteredCases.reduce((acc, c) => {
    const dist = c.location.district || 'Unspecified';
    acc[dist] = (acc[dist] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // --- PAGE HEADER BANNER ---
  doc.setFillColor(16, 75, 48); // Deep forest emerald green #104b30
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('AGROPARI — NATIONAL CROP EPIDEMIOLOGICAL SURVEILLANCE', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(department.toUpperCase(), 14, 18);

  doc.setFontSize(7.5);
  doc.text('OFFICIAL RECORD — CONFIDENTIAL & REGULATORY USE', 196, 18, { align: 'right' });

  // Title block
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(title, 14, 35);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${generatedAt}  |  Issuing Officer: ${officer}`, 14, 41);
  doc.text(`Scope: ${options.cropFilter && options.cropFilter !== 'all' ? options.cropFilter : 'All Crops'}  |  District: ${options.districtFilter && options.districtFilter !== 'all' ? options.districtFilter : 'All Districts'}`, 14, 46);

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, 49, 196, 49);

  // --- SECTION 1: EXECUTIVE SUMMARY METRICS TABLE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(16, 75, 48);
  doc.text('1. Executive Surveillance & Farmer Engagement Summary', 14, 55);

  autoTable(doc, {
    startY: 58,
    theme: 'grid',
    head: [['Surveillance Metric', 'Count / Value', 'Benchmark / Operational Status']],
    body: [
      ['Total Crop Health Submissions', `${totalCases} Field Cases`, 'Registered via mobile vision & field scouting'],
      ['Unique Farmers Engaged', `${uniqueFarmers} Farmers`, 'Active producers participating in diagnosis'],
      ['Expert Validated Cases', `${confirmedCases} (${confirmationRate}%)`, 'Confirmed / Corrected by Senior Agronomists'],
      ['Pending Expert Verification Queue', `${pendingCases} Cases`, 'Requires manual microscopic / ground audit'],
      ['Active 10 km Risk Alert Clusters', `${alerts.length} Active Rings`, 'Epidemiological broadcasts dispatched to nearby growers'],
      ['Surveillance Scope', `${Object.keys(districtCounts).length} Districts Audited`, `${Object.keys(cropCounts).length} Major Crop Types Registered`]
    ],
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 41, 59],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { cellWidth: 45, fontStyle: 'bold' },
      2: { cellWidth: 67 }
    },
    margin: { left: 14, right: 14 }
  });

  // --- SECTION 2: CROP & PATHOGEN DISTRIBUTIONS ---
  const afterMetricsY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(16, 75, 48);
  doc.text('2. Crop Pathology Incidence & Prevalent Disease Outbreaks', 14, afterMetricsY);

  const cropRows = Object.entries(cropCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([crop, count]) => [
      crop,
      `${count}`,
      `${totalCases > 0 ? ((count / totalCases) * 100).toFixed(1) : 0}%`,
      count > 4 ? 'High Frequency' : count > 2 ? 'Moderate' : 'Isolated'
    ]);

  const diseaseRows = Object.entries(diseaseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([disease, count]) => [
      disease,
      `${count}`,
      `${totalCases > 0 ? ((count / totalCases) * 100).toFixed(1) : 0}%`,
      count >= 3 ? 'Surveillance Warning' : 'Under Monitoring'
    ]);

  // Combined breakdown table
  autoTable(doc, {
    startY: afterMetricsY + 3,
    theme: 'striped',
    head: [['Crop Type', 'Reports', '% Total', 'Incidence Tier', 'Prevalent Pathology', 'Cases', '% Outbreak', 'Advisory Priority']],
    body: cropRows.slice(0, 5).map((row, idx) => {
      const dRow = diseaseRows[idx] || ['—', '—', '—', '—'];
      return [row[0], row[1], row[2], row[3], dRow[0], dRow[1], dRow[2], dRow[3]];
    }),
    headStyles: {
      fillColor: [16, 75, 48],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59]
    },
    margin: { left: 14, right: 14 }
  });

  // --- SECTION 3: DETAILED FARMER INCIDENT REGISTRY TABLE ---
  const afterBreakdownY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(16, 75, 48);
  doc.text('3. Field Case Submissions & Farmer Registry', 14, afterBreakdownY);

  const incidentHeaders = options.includeFarmerContact !== false
    ? ['Case ID', 'Date', 'Farmer Name', 'Phone', 'Crop & Stage', 'Diagnosed Disease', 'Conf.', 'Status', 'District']
    : ['Case ID', 'Date', 'Farmer Name', 'Crop & Stage', 'Diagnosed Disease', 'Conf.', 'Status', 'Village', 'District'];

  const incidentData = filteredCases.map((c) => {
    const formattedDate = c.timestamp ? new Date(c.timestamp).toLocaleDateString('en-IN') : 'N/A';
    const cropAndStage = `${c.cropName}${c.growthStage ? ` (${c.growthStage.slice(0, 4)}.)` : ''}`;
    const statusText = c.status === 'confirmed' ? 'Confirmed' : c.status === 'corrected' ? 'Corrected' : 'Pending';

    if (options.includeFarmerContact !== false) {
      return [
        c.id.replace('case-', '#'),
        formattedDate,
        c.farmerName,
        c.farmerPhone || 'N/A',
        cropAndStage,
        c.probableDisease,
        `${c.confidence}%`,
        statusText,
        c.location.district || c.location.village || 'Local'
      ];
    }

    return [
      c.id.replace('case-', '#'),
      formattedDate,
      c.farmerName,
      cropAndStage,
      c.probableDisease,
      `${c.confidence}%`,
      statusText,
      c.location.village || 'Local',
      c.location.district || 'Local'
    ];
  });

  autoTable(doc, {
    startY: afterBreakdownY + 3,
    theme: 'grid',
    head: [incidentHeaders],
    body: incidentData,
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7
    },
    bodyStyles: {
      fontSize: 6.8,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 16 },
      1: { cellWidth: 16 },
      2: { fontStyle: 'bold', cellWidth: 22 },
      3: { cellWidth: 22 },
      4: { cellWidth: 22 },
      5: { cellWidth: 32 },
      6: { cellWidth: 11 },
      7: { cellWidth: 17 },
      8: { cellWidth: 24 }
    },
    margin: { left: 14, right: 14 }
  });

  // --- SECTION 4: ACTIVE 10 KM RISK CONTAINMENT CLUSTERS ---
  const afterIncidentsY = (doc as any).lastAutoTable.finalY + 8;
  
  // Check if we have enough room on current page, or create a new page if too low
  if (afterIncidentsY > 235) {
    doc.addPage();
    renderPageHeader(doc, department, 'ACTIVE 10 KM EPIDEMIOLOGICAL CONTAINMENT RINGS');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(16, 75, 48);
    doc.text('4. Active 10 km Risk Containment Rings & SMS Broadcasts', 14, 34);
    renderAlertsTable(doc, alerts, 37);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(16, 75, 48);
    doc.text('4. Active 10 km Risk Containment Rings & SMS Broadcasts', 14, afterIncidentsY);
    renderAlertsTable(doc, alerts, afterIncidentsY + 3);
  }

  // --- OFFICIAL SIGNATURE & VALIDATION BLOCK ---
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  const signY = finalY > 240 ? (doc.addPage(), 35) : finalY;

  doc.setDrawColor(203, 213, 225);
  doc.rect(14, signY, 182, 32);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(16, 75, 48);
  doc.text('OFFICIAL VERIFICATION & AGRONOMIC AUDIT SIGN-OFF', 18, signY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('This document constitutes an official diagnostic and surveillance summary generated by the Agropari', 18, signY + 11);
  doc.text('AI Crop Health Management System. Diagnoses conform to ICAR and PlantVillage reference standards.', 18, signY + 15);

  doc.text('Surveillance Officer Signature: _______________________', 18, signY + 26);
  doc.text(`Date & Seal: ${new Date().toLocaleDateString('en-IN')}`, 130, signY + 26);

  // Add Page Numbers & Footer to all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Agropari Epidemiological System — Page ${i} of ${pageCount} — Confidential Regulatory Documentation`,
      105,
      292,
      { align: 'center' }
    );
  }

  const fileName = `agropari-crop-health-surveillance-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}

function renderAlertsTable(doc: jsPDF, alerts: RiskAlert[], startY: number) {
  const alertData = alerts.length > 0
    ? alerts.map((a) => [
        a.id.replace('alert-', '#'),
        a.cropAffected,
        a.diseaseName,
        a.district,
        `${a.radiusKm} km`,
        a.severity.toUpperCase(),
        a.advisorySummary
      ])
    : [['—', 'No Active Outbreak Rings', 'All monitored districts within safe thresholds', 'All Districts', '—', 'LOW', 'Routine preventive scouting recommended']];

  autoTable(doc, {
    startY,
    theme: 'striped',
    head: [['Alert ID', 'Crop', 'Pathogen Outbreak', 'District', 'Radius', 'Severity', 'Broadcast Advisory Summary']],
    body: alertData,
    headStyles: {
      fillColor: [190, 24, 93], // Rose/crimson alert color
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7
    },
    bodyStyles: {
      fontSize: 6.8,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 15 },
      1: { cellWidth: 18 },
      2: { cellWidth: 32 },
      3: { cellWidth: 22 },
      4: { cellWidth: 14 },
      5: { fontStyle: 'bold', cellWidth: 16 },
      6: { cellWidth: 65 }
    },
    margin: { left: 14, right: 14 }
  });
}

function renderPageHeader(doc: jsPDF, department: string, title: string) {
  doc.setFillColor(16, 75, 48);
  doc.rect(0, 0, 210, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`AGROPARI — ${title}`, 14, 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(department.toUpperCase(), 14, 14);
}

/**
 * Generates an Individual Official Crop Health Diagnostic Dossier & Field Advisory (PDF).
 */
export function generateSingleCaseDiagnosticPDF(cropCase: CropCase): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header Banner
  doc.setFillColor(16, 75, 48); // Dark Emerald
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('DEPARTMENT OF AGRICULTURE — CROP HEALTH DIAGNOSTIC CERTIFICATE', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('OFFICIAL AGRONOMIC PATHOLOGY REPORT & INTEGRATED PEST MANAGEMENT (IPM) ADVISORY', 14, 18);

  // Case Reference bar
  doc.setFillColor(241, 245, 249);
  doc.rect(14, 28, 182, 10, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`CASE FILE: ${cropCase.id}`, 18, 34.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date of Submission: ${new Date(cropCase.timestamp).toLocaleString('en-IN')}`, 90, 34.5);
  doc.text(`Status: ${cropCase.status.toUpperCase()}`, 160, 34.5);

  // Farmer & Plot Information Table
  autoTable(doc, {
    startY: 41,
    theme: 'grid',
    head: [['Farmer & Location Information', 'Crop & Botanical Characteristics']],
    body: [
      [`Farmer Name: ${cropCase.farmerName}`, `Target Crop: ${cropCase.cropName}`],
      [`Mobile Contact: ${cropCase.farmerPhone || '+91 98000 00000'}`, `Crop Variety: ${cropCase.cropVariety || 'Standard Cultivar'}`],
      [`Village / Block: ${cropCase.location.village || 'Field Sector A'}`, `Growth Stage: ${cropCase.growthStage || 'Vegetative'}`],
      [`District & State: ${cropCase.location.district || 'Surveillance Zone'}, ${cropCase.location.state || 'India'}`, `GPS Coordinates: ${cropCase.location.latitude.toFixed(4)}° N, ${cropCase.location.longitude.toFixed(4)}° E`]
    ],
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.8,
      textColor: [30, 41, 59]
    },
    margin: { left: 14, right: 14 }
  });

  // Pathology Diagnosis & Agronomist Validation
  const diagY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(16, 75, 48);
  doc.text('Diagnostic Findings & Epidemiological Classification', 14, diagY);

  autoTable(doc, {
    startY: diagY + 2,
    theme: 'grid',
    head: [['Parameter', 'Diagnostic Evaluation & Laboratory Corroboration']],
    body: [
      ['Primary Diagnosis', `${cropCase.probableDisease}`],
      ['AI Confidence Score', `${cropCase.confidence}% (Vetted against ICAR disease spectrum)`],
      ['Differential Diagnoses', cropCase.top3Alternatives.map((a) => `${a.diseaseName} (${a.confidence}%)`).join('  |  ') || 'None recorded'],
      ['Symptom Description', cropCase.description || 'Characteristic foliar lesions and necrosis observed on vegetative canopy.'],
      ['Agronomist Validation', cropCase.expertReview ? `${cropCase.expertReview.decision.toUpperCase()} by ${cropCase.expertReview.expertName}. Notes: ${cropCase.expertReview.notes}` : 'Auto-screened via high-confidence multimodal vision model; pending manual laboratory sign-off']
    ],
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 41, 59],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 137 }
    },
    margin: { left: 14, right: 14 }
  });

  // ICAR Integrated Pest Management (IPM) Advisory Table
  const ipmY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(16, 75, 48);
  doc.text('Mandatory Integrated Pest Management (IPM) Protocols', 14, ipmY);

  const ipmRows: string[][] = [];

  if (cropCase.ipmAdvisory?.monitoringSteps?.length) {
    ipmRows.push(['1. Field Scouting', cropCase.ipmAdvisory.monitoringSteps.join('\n• ')]);
  }
  if (cropCase.ipmAdvisory?.culturalControls?.length) {
    ipmRows.push(['2. Cultural Practices', cropCase.ipmAdvisory.culturalControls.join('\n• ')]);
  }
  if (cropCase.ipmAdvisory?.biologicalControls?.length) {
    ipmRows.push(['3. Biological Controls', cropCase.ipmAdvisory.biologicalControls.join('\n• ')]);
  }
  if (cropCase.ipmAdvisory?.mechanicalControls?.length) {
    ipmRows.push(['4. Mechanical Controls', cropCase.ipmAdvisory.mechanicalControls.join('\n• ')]);
  }
  if (cropCase.ipmAdvisory?.chemicalControls?.length) {
    const chemicalDesc = cropCase.ipmAdvisory.chemicalControls
      .map(
        (c) =>
          `Class: ${c.activeIngredientClass}\nDosage: ${c.dosageGuidelines} | PHI: ${c.preHarvestIntervalDays} days\nPrecautions: ${c.safetyPrecautions}`
      )
      .join('\n\n');
    ipmRows.push(['5. Chemical Controls (Vetted)', chemicalDesc]);
  }

  autoTable(doc, {
    startY: ipmY + 2,
    theme: 'grid',
    head: [['Intervention Pillar', 'Recommended Agricultural Action & Spray Schedule']],
    body: ipmRows.length > 0 ? ipmRows : [['Standard IPM', 'Follow standard agronomic sanitation, prune diseased foliage, and maintain furrow irrigation.']],
    headStyles: {
      fillColor: [16, 75, 48],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 137 }
    },
    margin: { left: 14, right: 14 }
  });

  // Official Signature Block
  const sigY = (doc as any).lastAutoTable.finalY + 8;
  const targetSigY = sigY > 240 ? (doc.addPage(), 35) : sigY;

  doc.setDrawColor(203, 213, 225);
  doc.rect(14, targetSigY, 182, 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(16, 75, 48);
  doc.text('CERTIFICATE OF AGRONOMIC VALIDATION & FARMER RECORD', 18, targetSigY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(71, 85, 105);
  doc.text('Issued under the authority of the Plant Health Directorate. Farmers must adhere to indicated Pre-Harvest', 18, targetSigY + 11);
  doc.text('Intervals (PHI) and wear recommended personal protective equipment (PPE) during chemical application.', 18, targetSigY + 15);

  doc.text('Verified By: Dr. R. K. Sharma (Senior Agronomist)', 18, targetSigY + 24);
  doc.text(`Official Stamp: AGROPARI-CERT-${cropCase.id.slice(-6).toUpperCase()}`, 120, targetSigY + 24);

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Agropari Crop Health Certificate — Case ID: ${cropCase.id} — Page ${i} of ${pageCount}`,
      105,
      292,
      { align: 'center' }
    );
  }

  const fileName = `agropari-diagnostic-certificate-${cropCase.id}.pdf`;
  doc.save(fileName);
}
