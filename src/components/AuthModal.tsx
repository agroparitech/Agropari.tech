import React, { useState } from 'react';
import {
  Lock,
  User,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Sprout,
  X,
  CheckCircle2,
  AlertCircle,
  Building,
  KeyRound,
  Phone,
  MapPin,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { UserAccount, UserAccountRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'farmer_register' | 'official_apply' | 'admin_login';
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
  onLoginSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'farmer_register' | 'official_apply' | 'admin_login'>(initialTab);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Farmer Registration Form State
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [farmerEmail, setFarmerEmail] = useState('');
  const [farmerPassword, setFarmerPassword] = useState('');
  const [farmerVillage, setFarmerVillage] = useState('Dindori');
  const [farmerDistrict, setFarmerDistrict] = useState('Nashik');
  const [farmerState, setFarmerState] = useState('Maharashtra');
  const [farmerCrops, setFarmerCrops] = useState('Tomato, Onion, Cotton');
  const [farmerAcres, setFarmerAcres] = useState('3.5');
  const [farmerSuccessMsg, setFarmerSuccessMsg] = useState<string | null>(null);

  // Official / Agronomist Application Form State
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPassword, setApplicantPassword] = useState('');
  const [applicantRole, setApplicantRole] = useState<'official' | 'agronomist'>('official');
  const [applicantDepartment, setApplicantDepartment] = useState('Department of Agriculture & Plant Health');
  const [applicantDesignation, setApplicantDesignation] = useState('District Plant Protection Officer');
  const [applicantOfficialId, setApplicantOfficialId] = useState('MAH-AGRI-5521');
  const [applicantDistrict, setApplicantDistrict] = useState('Nashik');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applySubmitted, setApplySubmitted] = useState<boolean>(false);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Standard / Official / Agronomist Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);
    setPendingNotice(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.pendingApproval) {
          setPendingNotice(data.message || 'Account Pending Administrator Approval');
        } else {
          setLoginError(data.error || data.message || 'Login failed');
        }
        return;
      }

      if (data.success && data.user) {
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError('Connection error. Please check server connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Farmer Registration
  const handleFarmerRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);

    const cropsArray = farmerCrops.split(',').map((c) => c.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/auth/register-farmer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: farmerName,
          phone: farmerPhone,
          email: farmerEmail || undefined,
          password: farmerPassword,
          village: farmerVillage,
          district: farmerDistrict,
          state: farmerState,
          primaryCrops: cropsArray,
          landSizeAcres: Number(farmerAcres) || 2
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || 'Failed to register farmer');
        return;
      }

      if (data.success && data.user) {
        setFarmerSuccessMsg('Farmer account created! Logging in...');
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 800);
      }
    } catch (err: any) {
      console.error('Farmer registration error:', err);
      setLoginError('Registration error. Please check server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Official / Agronomist Access Application
  const handleOfficialApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/auth/request-official-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: applicantName,
          email: applicantEmail,
          password: applicantPassword,
          role: applicantRole,
          department: applicantDepartment,
          designation: applicantDesignation,
          officialId: applicantOfficialId,
          district: applicantDistrict,
          phone: applicantPhone
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || 'Application submission failed');
        return;
      }

      if (data.success) {
        setApplySubmitted(true);
        setApplyMessage(data.message);
      }
    } catch (err: any) {
      console.error('Application request error:', err);
      setLoginError('Error submitting application.');
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-fill Helpers for convenient testing
  const fillApprovedOfficial = () => {
    setLoginEmail('official.nashik@gov.agri.in');
    setLoginPassword('Official@123');
    setLoginError(null);
    setPendingNotice(null);
  };

  const fillApprovedAgronomist = () => {
    setLoginEmail('dr.patil@agri.univ.in');
    setLoginPassword('Doctor@123');
    setLoginError(null);
    setPendingNotice(null);
  };

  const fillPendingOfficial = () => {
    setLoginEmail('officer.pune@gov.agri.in');
    setLoginPassword('Officer@123');
    setLoginError(null);
    setPendingNotice(null);
  };

  const fillAdminCredentials = () => {
    setLoginEmail('devp3987@gmail.com');
    setLoginPassword('211008gaints');
    setLoginError(null);
    setPendingNotice(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        {/* Modal Top Header */}
        <div className="bg-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/80 flex items-center justify-center text-emerald-100 shadow-inner">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight flex items-center gap-2">
                <span>Agropari Access & Security Gate</span>
                <span className="text-[10px] bg-emerald-800 text-emerald-200 uppercase px-2 py-0.5 rounded font-bold">
                  RBAC
                </span>
              </h2>
              <p className="text-xs text-emerald-300">
                Official surveillance lock, agronomist credentials & farmer registration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 bg-stone-100 p-1.5 border-b border-stone-200 text-xs font-bold text-center">
          <button
            onClick={() => {
              setActiveTab('login');
              setLoginError(null);
              setPendingNotice(null);
            }}
            className={`py-2 px-1 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'login' || activeTab === 'admin_login'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
            <span>Official / Login</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('farmer_register');
              setLoginError(null);
              setPendingNotice(null);
            }}
            className={`py-2 px-1 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'farmer_register'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-700" />
            <span>Farmer Register</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('official_apply');
              setLoginError(null);
              setPendingNotice(null);
              setApplySubmitted(false);
            }}
            className={`py-2 px-1 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'official_apply'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-emerald-700" />
            <span>Apply as Official</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* TAB 1: LOGIN (Officials, Agronomists, Admin, Farmers) */}
          {(activeTab === 'login' || activeTab === 'admin_login') && (
            <div className="space-y-4">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Authorized Personnel Login</span>
                </div>
                <p className="text-emerald-800 text-[11px]">
                  Sign in with your approved Official, Agronomist, Administrator, or Farmer credentials. Official accounts require administrator email approval prior to activation.
                </p>
              </div>

              {/* Pending Notice Banner (Triggered when user is pending approval) */}
              {pendingNotice && (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs text-amber-950 space-y-2 animate-fadeIn">
                  <div className="font-extrabold flex items-center gap-2 text-amber-900 text-sm">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Access Locked: Pending Admin Approval</span>
                  </div>
                  <p className="text-stone-700 leading-relaxed">{pendingNotice}</p>
                  <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-[11px] text-stone-600">
                    <span>
                      Approving Admin: <strong className="font-mono text-stone-800">devp3987@gmail.com</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        fillAdminCredentials();
                      }}
                      className="text-amber-800 hover:underline font-bold"
                    >
                      Login as Admin to Approve &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">
                    Email / Government ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      id="login-email-input"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. official.nashik@gov.agri.in or devp3987@gmail.com"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-stone-800 block">Password</label>
                    <span className="text-[11px] text-stone-400">Case-sensitive</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      id="login-password-input"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter account password"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="login-submit-btn"
                  disabled={isLoading}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Unlock & Enter Dashboard</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick Fill Demo Badges */}
              <div className="pt-3 border-t border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 block mb-2">
                  Demo & Testing Quick Credentials:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={fillApprovedOfficial}
                    className="p-1.5 text-left bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 transition"
                  >
                    <strong className="block text-emerald-800">🏛️ Approved Official</strong>
                    <span className="text-stone-400">official.nashik@gov.agri.in</span>
                  </button>

                  <button
                    type="button"
                    onClick={fillApprovedAgronomist}
                    className="p-1.5 text-left bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 transition"
                  >
                    <strong className="block text-emerald-800">🔬 Approved Agronomist</strong>
                    <span className="text-stone-400">dr.patil@agri.univ.in</span>
                  </button>

                  <button
                    type="button"
                    onClick={fillPendingOfficial}
                    className="p-1.5 text-left bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-amber-900 transition"
                  >
                    <strong className="block text-amber-800">⏳ Pending Approval Official</strong>
                    <span className="text-stone-500">officer.pune@gov.agri.in</span>
                  </button>

                  <button
                    type="button"
                    onClick={fillAdminCredentials}
                    className="p-1.5 text-left bg-emerald-900 text-white rounded-lg hover:bg-emerald-800 transition"
                  >
                    <strong className="block text-amber-300">🛡️ Admin (devp3987)</strong>
                    <span className="text-emerald-200 font-mono">devp3987@gmail.com</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FARMER REGISTRATION */}
          {activeTab === 'farmer_register' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-emerald-700" />
                  <span>Direct Farmer Registration (Kisan Portal)</span>
                </div>
                <p className="text-emerald-800 text-[11px]">
                  Farmers receive instant active access without administrative delay. Your farm details will be linked to disease diagnoses and 10km containment ring broadcasts.
                </p>
              </div>

              {farmerSuccessMsg && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold">{farmerSuccessMsg}</span>
                </div>
              )}

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleFarmerRegisterSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Farmer Full Name *</label>
                    <input
                      type="text"
                      id="farmer-name-input"
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      placeholder="e.g. Ramesh Patil"
                      required
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      id="farmer-phone-input"
                      value={farmerPhone}
                      onChange={(e) => setFarmerPhone(e.target.value)}
                      placeholder="10-digit mobile (e.g. 9822012345)"
                      required
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={farmerEmail}
                      onChange={(e) => setFarmerEmail(e.target.value)}
                      placeholder="farmer@kisan.in (optional)"
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Account Password *</label>
                    <input
                      type="password"
                      id="farmer-password-input"
                      value={farmerPassword}
                      onChange={(e) => setFarmerPassword(e.target.value)}
                      placeholder="Choose a password"
                      required
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Village *</label>
                    <input
                      type="text"
                      value={farmerVillage}
                      onChange={(e) => setFarmerVillage(e.target.value)}
                      placeholder="e.g. Dindori"
                      required
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-800 block mb-1">District *</label>
                    <input
                      type="text"
                      value={farmerDistrict}
                      onChange={(e) => setFarmerDistrict(e.target.value)}
                      placeholder="e.g. Nashik"
                      required
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-800 block mb-1">Farm Land (Acres)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={farmerAcres}
                      onChange={(e) => setFarmerAcres(e.target.value)}
                      placeholder="e.g. 3.5"
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">Primary Crops Cultivated</label>
                  <input
                    type="text"
                    value={farmerCrops}
                    onChange={(e) => setFarmerCrops(e.target.value)}
                    placeholder="e.g. Tomato, Cotton, Onion, Wheat, Potato"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  id="register-farmer-submit-btn"
                  disabled={isLoading}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm mt-2"
                >
                  <Sprout className="w-4 h-4" />
                  <span>{isLoading ? 'Registering...' : 'Register & Enter Farmer Portal'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: APPLY AS OFFICIAL OR AGRONOMIST (PENDING ADMIN APPROVAL) */}
          {activeTab === 'official_apply' && (
            <div className="space-y-4">
              {applySubmitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-3 animate-fadeIn">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-black text-emerald-950">Application Logged Successfully!</h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Your credentials have been recorded with status <strong>Pending Administrator Approval</strong>.
                  </p>
                  <div className="p-3.5 bg-white border border-emerald-200 rounded-xl text-left text-xs text-stone-700 space-y-1">
                    <div className="font-bold text-stone-900">Official Protocol Mandate:</div>
                    <p className="text-[11px] text-stone-600">
                      Under departmental security protocols, the Administrator (<strong className="font-mono text-emerald-900">devp3987@gmail.com</strong>) must verify and approve your email address in the Admin Settings Console before your Official/Agronomist access is unlocked.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setLoginEmail(applicantEmail);
                      setLoginPassword(applicantPassword);
                    }}
                    className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs transition"
                  >
                    Go to Login Screen
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-amber-700" />
                      <span>Official / Agronomist Accreditation Request</span>
                    </div>
                    <p className="text-stone-700 text-[11px]">
                      Registered accounts require Administrator (<strong className="font-mono text-stone-900">devp3987@gmail.com</strong>) approval before gaining access to state surveillance dashboards and clinical diagnosis queues.
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleOfficialApplySubmit} className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-stone-800 block mb-1">Full Name & Title *</label>
                        <input
                          type="text"
                          value={applicantName}
                          onChange={(e) => setApplicantName(e.target.value)}
                          placeholder="e.g. Dr. Sunita Deshmukh"
                          required
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-stone-800 block mb-1">Accredited Role Applied For *</label>
                        <select
                          value={applicantRole}
                          onChange={(e) => setApplicantRole(e.target.value as any)}
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                        >
                          <option value="official">🏛️ Department of Agriculture Official</option>
                          <option value="agronomist">🔬 Plant Pathologist / Agronomist Expert</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-stone-800 block mb-1">Official / Institutional Email *</label>
                        <input
                          type="email"
                          value={applicantEmail}
                          onChange={(e) => setApplicantEmail(e.target.value)}
                          placeholder="e.g. officer@gov.agri.in"
                          required
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-stone-800 block mb-1">Create Password *</label>
                        <input
                          type="password"
                          value={applicantPassword}
                          onChange={(e) => setApplicantPassword(e.target.value)}
                          placeholder="Secure login password"
                          required
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-stone-800 block mb-1">Department / Organization *</label>
                        <input
                          type="text"
                          value={applicantDepartment}
                          onChange={(e) => setApplicantDepartment(e.target.value)}
                          placeholder="e.g. Division of Crop Protection"
                          required
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-stone-800 block mb-1">Designation / Title *</label>
                        <input
                          type="text"
                          value={applicantDesignation}
                          onChange={(e) => setApplicantDesignation(e.target.value)}
                          placeholder="e.g. Agricultural Officer"
                          required
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-stone-800 block mb-1">Employee / Government ID</label>
                        <input
                          type="text"
                          value={applicantOfficialId}
                          onChange={(e) => setApplicantOfficialId(e.target.value)}
                          placeholder="e.g. MAH-AGRI-5521"
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-stone-800 block mb-1">Assigned District / Jurisdiction</label>
                        <input
                          type="text"
                          value={applicantDistrict}
                          onChange={(e) => setApplicantDistrict(e.target.value)}
                          placeholder="e.g. Nashik, Pune, State-wide"
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      id="apply-official-submit-btn"
                      disabled={isLoading}
                      className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm mt-2"
                    >
                      <Building className="w-4 h-4 text-emerald-400" />
                      <span>{isLoading ? 'Submitting Application...' : 'Submit Accreditation Request for Admin Approval'}</span>
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
