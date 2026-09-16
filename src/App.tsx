import React, { useState, useEffect } from 'react';
import {
  DEFAULT_RISK_RULES,
  INITIAL_CROP_CASES,
  INITIAL_RISK_ALERTS,
  INITIAL_SENSOR_READINGS
} from './data/mockAndReferenceData';
import {
  AgronomicRiskRule,
  CropCase,
  LanguageCode,
  LocationCoords,
  RiskAlert,
  SensorDataReading,
  UserRole,
  UserAccount
} from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { FarmerDiagnoseView } from './components/FarmerDiagnoseView';
import { FarmerFieldsAndAlertsView } from './components/FarmerFieldsAndAlertsView';
import { HotspotMapView } from './components/HotspotMapView';
import { ExpertQueueView } from './components/ExpertQueueView';
import { OfficialDashboardView } from './components/OfficialDashboardView';
import { RiskRulesConfigView } from './components/RiskRulesConfigView';
import { SensorDataView } from './components/SensorDataView';
import { AboutModal } from './components/AboutModal';
import { AuthModal } from './components/AuthModal';
import { AdminLoginGate } from './components/AdminLoginGate';
import { OfficialAccessGate } from './components/OfficialAccessGate';
import { AdminApprovalsPanel } from './components/AdminApprovalsPanel';
import {
  ChevronUp,
  Camera,
  BellRing,
  Map,
  KeyRound,
  Sprout,
  ShieldAlert,
  Settings,
  Lock
} from 'lucide-react';

export default function App() {
  // Global User Session State
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [activeTab, setActiveTab] = useState<string>('diagnose');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  // Authentication & Role State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('agropari_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'farmer_register' | 'official_apply' | 'admin_login'>('login');
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);

  // App Data State
  const [cases, setCases] = useState<CropCase[]>(INITIAL_CROP_CASES);
  const [alerts, setAlerts] = useState<RiskAlert[]>(INITIAL_RISK_ALERTS);
  const [sensorReadings, setSensorReadings] = useState<SensorDataReading[]>(INITIAL_SENSOR_READINGS);
  const [riskRules, setRiskRules] = useState<AgronomicRiskRule[]>(DEFAULT_RISK_RULES);
  const [userCoords, setUserCoords] = useState<LocationCoords | null>(null);

  // Smooth Scroll Helper
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Authorization checks
  const isAuthorizedOfficialOrExpert = Boolean(
    currentUser &&
    currentUser.status === 'approved' &&
    (currentUser.role === 'official' || currentUser.role === 'agronomist' || currentUser.role === 'admin')
  );

  const isAuthorizedAdmin = Boolean(
    currentUser &&
    currentUser.status === 'approved' &&
    currentUser.role === 'admin' &&
    currentUser.email.toLowerCase() === 'devp3987@gmail.com'
  );

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check pending approvals count
  const checkPendingApprovals = async () => {
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users) {
          const pending = data.users.filter(
            (u: UserAccount) => u.status === 'pending_approval' && (u.role === 'official' || u.role === 'agronomist')
          );
          setPendingApprovalsCount(pending.length);
        }
      }
    } catch (err) {
      console.warn('Could not fetch pending approvals count:', err);
    }
  };

  // Fetch initial data from server APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [casesRes, alertsRes, sensorsRes, rulesRes] = await Promise.allSettled([
          fetch('/api/cases'),
          fetch('/api/alerts'),
          fetch('/api/sensor-data'),
          fetch('/api/risk-rules')
        ]);

        if (casesRes.status === 'fulfilled' && casesRes.value.ok) {
          const data = await casesRes.value.json();
          if (data.cases) setCases(data.cases);
        }

        if (alertsRes.status === 'fulfilled' && alertsRes.value.ok) {
          const data = await alertsRes.value.json();
          if (data.alerts) setAlerts(data.alerts);
        }

        if (sensorsRes.status === 'fulfilled' && sensorsRes.value.ok) {
          const data = await sensorsRes.value.json();
          if (data.readings) setSensorReadings(data.readings);
        }

        if (rulesRes.status === 'fulfilled' && rulesRes.value.ok) {
          const data = await rulesRes.value.json();
          if (data.rules) setRiskRules(data.rules);
        }
      } catch (err) {
        console.warn('Backend fetch failed, relying on initial state:', err);
      }
    };

    fetchData();
    checkPendingApprovals();
  }, []);

  // Login handler
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('agropari_user_session', JSON.stringify(user));
    } catch (e) {
      console.warn('Could not save session to localStorage', e);
    }
    checkPendingApprovals();

    if (user.role === 'admin') {
      setCurrentRole('admin');
      setActiveTab('adminApprovals');
      scrollToSection('portals');
    } else if (user.role === 'official') {
      setCurrentRole('expert');
      setActiveTab('officialDash');
      scrollToSection('portals');
    } else if (user.role === 'agronomist') {
      setCurrentRole('expert');
      setActiveTab('expertQueue');
      scrollToSection('portals');
    } else {
      setCurrentRole('farmer');
      setActiveTab('diagnose');
      scrollToSection('diagnose');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('agropari_user_session');
    } catch (e) {
      console.warn('Could not clear session', e);
    }
    setCurrentRole('farmer');
    setActiveTab('diagnose');
  };

  // Handler: New Case created by Farmer
  const handleCaseCreated = (newCase: CropCase) => {
    setCases((prev) => [newCase, ...prev]);
  };

  // Handler: Expert submits review (Module 8 & Module 6)
  const handleReviewSubmitted = async (
    caseId: string,
    decision: 'approved' | 'corrected' | 'rejected',
    notes: string,
    correctedDisease?: string
  ) => {
    try {
      const expertName = currentUser ? currentUser.name : 'Dr. R. K. Sharma (Senior Agronomist)';
      const res = await fetch(`/api/cases/${caseId}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          notes,
          correctedDisease,
          expertName
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCases((prev) => prev.map((c) => (c.id === caseId ? data.case : c)));

        const alertRes = await fetch('/api/alerts');
        if (alertRes.ok) {
          const alertData = await alertRes.json();
          if (alertData.alerts) setAlerts(alertData.alerts);
        }
      }
    } catch (e: any) {
      console.error('Expert review update error:', e);
      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? {
                ...c,
                status: decision === 'approved' ? 'confirmed' : decision === 'corrected' ? 'corrected' : 'rejected',
                needsExpertReview: false,
                probableDisease: correctedDisease || c.probableDisease
              }
            : c
        )
      );
    }
  };

  // Handler: Save Rules (Module 3)
  const handleSaveRules = async (updatedRules: AgronomicRiskRule[]) => {
    setRiskRules(updatedRules);
    await fetch('/api/risk-rules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rules: updatedRules })
    });
  };

  // Handler: Ingest Sensor Reading (Module 5)
  const handleIngestReading = async (payload: any) => {
    const res = await fetch('/api/sensor-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.reading) {
        setSensorReadings((prev) => [data.reading, ...prev]);
      }
    }
  };

  const pendingReviewCount = cases.filter((c) => c.status === 'pending_review' || c.needsExpertReview).length;
  const isHindi = currentLanguage === 'hi';

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900 font-sans selection:bg-emerald-200 scroll-smooth">
      {/* Multilingual Sticky Header with Section Smooth Scroll Links */}
      <Header
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
        currentLanguage={currentLanguage}
        onLanguageChange={(lang) => setCurrentLanguage(lang)}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        pendingReviewCount={pendingReviewCount}
        activeAlertsCount={alerts.length}
        onOpenAbout={() => setIsAboutOpen(true)}
        isOnline={isOnline}
        currentUser={currentUser}
        onOpenAuth={(tab) => {
          if (tab) setAuthModalTab(tab);
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        pendingApprovalsCount={pendingApprovalsCount}
        onScrollTo={scrollToSection}
      />

      {/* HERO SECTION: Explains the platform, live metrics, action buttons */}
      <HeroSection
        currentLanguage={currentLanguage}
        onScrollTo={scrollToSection}
        casesCount={cases.length}
        alertsCount={alerts.length}
      />

      {/* ABOUT PLATFORM SECTION: Mission, Tech Giants, ICAR alignment, Pillars */}
      <AboutSection
        currentLanguage={currentLanguage}
        onScrollTo={scrollToSection}
      />

      {/* HOW IT WORKS SECTION: 4-step workflow explainer */}
      <HowItWorksSection
        currentLanguage={currentLanguage}
        onScrollTo={scrollToSection}
      />

      {/* MAIN WEBSITE INTERACTIVE SECTIONS (All accessible via navigation scroll) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-12 space-y-24">
        {/* SECTION 1: AI LEAF PATHOLOGY & CAMERA DIAGNOSIS */}
        <section id="diagnose" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-300 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Camera className="w-4 h-4" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {isHindi ? 'एआई नैदानिक उपकरण' : 'Interactive Pathology Tool'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-display">
                {isHindi ? 'फसल रोग जांच एवं बोलकर समाधान' : 'AI Crop Disease Diagnosis & Voice Prescription'}
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm mt-1">
                {isHindi
                  ? 'लाइव कैमरे या गैलरी से पत्ती की फोटो दें। एआई रोग की पहचान करेगा और ऑडियो द्वारा समस्या व उपाय बोलकर सुनाएगा।'
                  : 'Point camera or upload crop symptoms for real-time vision diagnosis, vernacular audio narration, and ICAR IPM spray guidelines.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => scrollToSection('field-sentinel')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>{isHindi ? 'खेत अलर्ट देखें &darr;' : 'View Field Sentinel &darr;'}</span>
            </button>
          </div>

          <FarmerDiagnoseView
            currentLanguage={currentLanguage}
            onCaseCreated={handleCaseCreated}
            activeRules={riskRules}
            userCoords={userCoords}
            setUserCoords={setUserCoords}
          />
        </section>

        {/* SECTION 2: FARMER FIELDS & 10KM REAL-TIME THREAT ALERTS */}
        <section id="field-sentinel" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-300 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <BellRing className="w-4 h-4" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  {isHindi ? 'खेत सुरक्षा एवं चेतावनी' : 'Field Telemetry & Alerts'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-display">
                {isHindi ? 'खेत निगरानी एवं 10 किमी अलर्ट नेटवर्क' : 'Field Sentinel & 10km Disease Containment Alerts'}
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm mt-1">
                {isHindi
                  ? 'अपने खेत का क्षेत्रफल दर्ज करें, स्थानीय तापमान व आर्द्रता के जोखिम नियम देखें, और 10 किमी के दायरे में जारी चेतावनियों पर नजर रखें।'
                  : 'Track your registered fields, inspect microclimate disease triggers, and monitor active 10km early warning broadcasts.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => scrollToSection('outbreak-radar')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>{isHindi ? 'प्रकोप मैप देखें &darr;' : 'View Outbreak Radar &darr;'}</span>
            </button>
          </div>

          <FarmerFieldsAndAlertsView
            currentLanguage={currentLanguage}
            userCoords={userCoords}
            alerts={alerts}
            onViewAdvisoryForDisease={() => {
              scrollToSection('diagnose');
            }}
          />
        </section>

        {/* SECTION 3: 10KM EPIDEMIC OUTBREAK RADAR & HEATMAP */}
        <section id="outbreak-radar" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-300 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Map className="w-4 h-4" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  {isHindi ? 'जीपीएस प्रकोप मानचित्र' : 'Geospatial Radar'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-display">
                {isHindi ? '10 किमी महामारी प्रकोप राडार एवं हीटमैप' : '10km Epidemic Outbreak Radar & Geospatial Heatmap'}
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm mt-1">
                {isHindi
                  ? 'रोग संचरण के हॉटस्पॉट, 10 किलोमीटर के सुरक्षित घेरे, और पुष्ट संक्रमण केंद्रों का वास्तविक समय में नक्शा।'
                  : 'Live geospatial map plotting confirmed disease clusters, interactive 10km containment buffers, and pathogen dispersion.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => scrollToSection('portals')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>{isHindi ? 'अधिकारी पोर्टल पर जाएं &darr;' : 'Go to Official Portals &darr;'}</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-sm">
            <HotspotMapView
              cases={cases}
              userCoords={userCoords ? { latitude: userCoords.latitude, longitude: userCoords.longitude } : null}
            />
          </div>
        </section>

        {/* SECTION 4: OFFICIALS, AGRONOMISTS & GOVERNANCE PORTALS */}
        <section id="portals" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-300 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <KeyRound className="w-4 h-4" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-full">
                  {isHindi ? 'हितधारक प्रमाणीकरण एवं प्रशासन' : 'Stakeholder Portals & Governance'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-display">
                {isHindi ? 'कृषि वैज्ञानिक, अधिकारी एवं व्यवस्थापक पोर्टल' : 'Official Review Queue & Administrative Portal'}
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm mt-1">
                {isHindi
                  ? 'ब्लॉक कृषि अधिकारी, केवीके वैज्ञानिक और मुख्य व्यवस्थापक के लिए विशेष सुरक्षित नियंत्रण कक्ष।'
                  : 'Dedicated credentialed access for ICAR/KVK agronomists, sub-divisional officers, and system administrator (devp3987@gmail.com).'}
              </p>
            </div>
          </div>

          {/* Role switcher tabs inside the Portals section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {isHindi ? 'सक्रिय पोर्टल दृश्य:' : 'Active Portal Workspace:'}
                </span>
                <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-300 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentRole('expert');
                      setActiveTab(isAuthorizedOfficialOrExpert ? 'expertQueue' : 'officialDash');
                    }}
                    className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                      currentRole === 'expert' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'वैज्ञानिक / अधिकारी पोर्टल' : 'Agronomist / Official Queue'}</span>
                    {!isAuthorizedOfficialOrExpert && <Lock className="w-3 h-3 text-amber-500 ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentRole('admin');
                      setActiveTab('adminApprovals');
                    }}
                    className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                      currentRole === 'admin' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'व्यवस्थापक सेटिंग्स' : 'Admin Settings (devp3987@gmail.com)'}</span>
                    {!isAuthorizedAdmin && <Lock className="w-3 h-3 text-amber-500 ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentRole('farmer');
                      setActiveTab('diagnose');
                    }}
                    className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                      currentRole === 'farmer' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <Sprout className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'किसान अवलोकन' : 'Farmer Overview'}</span>
                  </button>
                </div>
              </div>

              {currentUser && (
                <div className="text-xs bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 text-emerald-900 font-semibold flex items-center gap-2">
                  <span>Signed in as: <strong>{currentUser.email}</strong> ({currentUser.role})</span>
                  <button type="button" onClick={handleLogout} className="text-rose-700 hover:text-rose-900 underline font-bold">Logout</button>
                </div>
              )}
            </div>

            {/* Portal Content based on selected role */}
            {currentRole === 'expert' && (
              <>
                {!isAuthorizedOfficialOrExpert ? (
                  <OfficialAccessGate
                    onAuthenticated={handleLoginSuccess}
                    onRequestAccreditation={() => {
                      setAuthModalTab('official_apply');
                      setIsAuthModalOpen(true);
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab('expertQueue')}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                          activeTab === 'expertQueue' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        Clinical Review Queue ({pendingReviewCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('officialDash')}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                          activeTab === 'officialDash' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        Sub-Divisional Official Analytics
                      </button>
                    </div>

                    {activeTab === 'expertQueue' && (
                      <ExpertQueueView
                        cases={cases}
                        onReviewSubmitted={handleReviewSubmitted}
                      />
                    )}

                    {activeTab === 'officialDash' && (
                      <OfficialDashboardView cases={cases} alerts={alerts} />
                    )}
                  </div>
                )}
              </>
            )}

            {currentRole === 'admin' && (
              <>
                {!isAuthorizedAdmin ? (
                  <AdminLoginGate
                    onAdminAuthenticated={handleLoginSuccess}
                    onCancel={() => {
                      setCurrentRole('farmer');
                      setActiveTab('diagnose');
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab('adminApprovals')}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 ${
                          activeTab === 'adminApprovals' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        <span>Official & Agronomist Approvals</span>
                        {pendingApprovalsCount > 0 && (
                          <span className="bg-amber-400 text-stone-950 font-black px-1.5 py-0.5 rounded-full text-[10px]">
                            {pendingApprovalsCount}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('riskRules')}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                          activeTab === 'riskRules' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        Risk Rules Config
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('sensorData')}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                          activeTab === 'sensorData' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        IoT Weather Sensor Ingestion
                      </button>
                    </div>

                    {activeTab === 'adminApprovals' && (
                      <AdminApprovalsPanel currentAdminUser={currentUser!} />
                    )}

                    {activeTab === 'riskRules' && (
                      <RiskRulesConfigView
                        rules={riskRules}
                        onSaveRules={handleSaveRules}
                      />
                    )}

                    {activeTab === 'sensorData' && (
                      <SensorDataView
                        readings={sensorReadings}
                        onIngestReading={handleIngestReading}
                      />
                    )}
                  </div>
                )}
              </>
            )}

            {currentRole === 'farmer' && (
              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="space-y-2 md:col-span-2">
                  <h4 className="text-base font-black text-stone-900">
                    {isHindi ? 'विशेषज्ञ व अधिकारी सत्यापन सुविधा' : 'Official Gating & Agronomist Review'}
                  </h4>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    {isHindi
                      ? 'अधिकारियों और वैज्ञानिकों के लिए पासवर्ड लॉक व्यवस्था लागू है। जब कोई अधिकारी या वैज्ञानिक आवेदन करता है, तो मुख्य व्यवस्थापक (devp3987@gmail.com) द्वारा अनुमोदन के बाद ही उन्हें समीक्षा अधिकार मिलते हैं।'
                      : 'All official & agronomist portals are password-locked and require accreditation approval by system administrator devp3987@gmail.com to maintain scientific integrity.'}
                  </p>
                </div>
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentRole('expert');
                      setActiveTab('expertQueue');
                    }}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isHindi ? 'वैज्ञानिक लॉगिन खोलें' : 'Open Agronomist Login'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentRole('admin');
                      setActiveTab('adminApprovals');
                    }}
                    className="w-full py-2.5 bg-stone-800 hover:bg-stone-900 text-stone-100 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isHindi ? 'एडमिन सेटिंग्स खोलें' : 'Admin Login (devp3987@gmail.com)'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Quick Scroll to Top Button */}
      <button
        type="button"
        onClick={() => scrollToSection('hero')}
        className="fixed bottom-6 right-6 z-40 w-11 h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-xl flex items-center justify-center transition transform hover:scale-110 active:scale-95 border-2 border-emerald-400"
        title="Scroll to Top"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      {/* Mandatory Team Tech Giants Footer */}
      <Footer onOpenAbout={() => setIsAboutOpen(true)} onScrollTo={scrollToSection} />

      {/* Authentication & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* About & Technical Architecture Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}
