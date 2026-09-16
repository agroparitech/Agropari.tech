import React, { useState } from 'react';
import {
  Sprout,
  ShieldAlert,
  Settings,
  Globe,
  Radio,
  Info,
  Lock,
  KeyRound,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Camera,
  MapPin,
  HelpCircle
} from 'lucide-react';
import { LanguageCode, UserRole, UserAccount } from '../types';
import { MULTILINGUAL_DICTIONARY } from '../data/mockAndReferenceData';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingReviewCount: number;
  activeAlertsCount: number;
  onOpenAbout: () => void;
  isOnline: boolean;
  currentUser: UserAccount | null;
  onOpenAuth: (tab?: 'login' | 'farmer_register' | 'official_apply' | 'admin_login') => void;
  onLogout: () => void;
  pendingApprovalsCount?: number;
  onScrollTo?: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  currentLanguage,
  onLanguageChange,
  activeTab,
  onTabChange,
  pendingReviewCount,
  activeAlertsCount,
  onOpenAbout,
  isOnline,
  currentUser,
  onOpenAuth,
  onLogout,
  pendingApprovalsCount = 0,
  onScrollTo
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dict = MULTILINGUAL_DICTIONARY[currentLanguage] || MULTILINGUAL_DICTIONARY.en;
  const isHindi = currentLanguage === 'hi';

  const scrollTo = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    if (onScrollTo) {
      onScrollTo(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const isApprovedOfficialOrExpert = Boolean(
    currentUser &&
    currentUser.status === 'approved' &&
    (currentUser.role === 'official' || currentUser.role === 'agronomist' || currentUser.role === 'admin')
  );

  const isApprovedAdmin = Boolean(
    currentUser &&
    currentUser.status === 'approved' &&
    currentUser.role === 'admin' &&
    currentUser.email.toLowerCase() === 'devp3987@gmail.com'
  );

  const navLinks = [
    { id: 'hero', label: isHindi ? 'होम' : 'Home' },
    { id: 'about', label: isHindi ? 'प्लेटफॉर्म के बारे में' : 'About' },
    { id: 'how-it-works', label: isHindi ? 'कार्यप्रणाली' : 'How It Works' },
    { id: 'diagnose', label: isHindi ? 'एआई जांच (कैमरा)' : 'AI Diagnosis' },
    { id: 'field-sentinel', label: isHindi ? 'खेत अलर्ट (10 किमी)' : 'Field Alerts' },
    { id: 'outbreak-radar', label: isHindi ? 'प्रकोप मैप' : 'Outbreak Radar' },
    { id: 'portals', label: isHindi ? 'अधिकारी पोर्टल' : 'Official Portal' }
  ];

  return (
    <header className="bg-emerald-950 text-white shadow-lg sticky top-0 z-50 border-b border-emerald-800/80 backdrop-blur-md bg-emerald-950/95">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          onClick={() => scrollTo('hero')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md font-bold text-2xl group-hover:scale-105 transition">
            <Sprout className="w-6 h-6 text-emerald-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight font-display text-white">
                {dict.appTitle || 'Agropari'}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded border border-emerald-700">
                ICAR AI
              </span>
            </div>
            <p className="text-[11px] text-emerald-300 font-medium hidden sm:block">
              {isHindi ? 'फसल स्वास्थ्य एवं 10 किमी सुरक्षा नेटवर्क' : 'AI Crop Pathology & 10km Radar'}
            </p>
          </div>
        </div>

        {/* Desktop Website Navigation Links (Scrolls smoothly to sections) */}
        <nav className="hidden lg:flex items-center gap-1 bg-emerald-900/60 p-1 rounded-xl border border-emerald-800/80 text-xs font-bold">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollTo(link.id)}
              className="px-3 py-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800/80 transition"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Tools: Auth, Language, Connectivity, Mobile Toggle */}
        <div className="flex items-center gap-2">
          {/* User Account or Register/Login Buttons */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-emerald-900/80 border border-emerald-700 rounded-xl px-2.5 py-1 text-xs">
              <div className="flex items-center gap-1.5">
                {currentUser.role === 'admin' ? (
                  <span className="text-amber-400 font-black flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </span>
                ) : currentUser.role === 'official' ? (
                  <span className="text-blue-300 font-black flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Official</span>
                  </span>
                ) : currentUser.role === 'agronomist' ? (
                  <span className="text-purple-300 font-black flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Agronomist</span>
                  </span>
                ) : (
                  <span className="text-emerald-300 font-black flex items-center gap-1">
                    <Sprout className="w-3.5 h-3.5" />
                    <span>Farmer</span>
                  </span>
                )}
                <span className="text-stone-200 font-bold max-w-[100px] sm:max-w-[140px] truncate">
                  {currentUser.name}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="ml-1 text-[11px] text-emerald-400 hover:text-white underline font-semibold flex items-center gap-0.5"
                title="Log out"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                id="header-farmer-register-btn"
                onClick={() => onOpenAuth('farmer_register')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
              >
                <Sprout className="w-3.5 h-3.5 text-emerald-100" />
                <span>{isHindi ? 'किसान पंजीकरण' : 'Register'}</span>
              </button>

              <button
                type="button"
                id="header-login-btn"
                onClick={() => onOpenAuth('login')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-200 border border-emerald-700 text-xs font-bold flex items-center gap-1 transition"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                <span>{isHindi ? 'लॉगिन' : 'Login'}</span>
              </button>
            </div>
          )}

          {/* Online Sync Indicator */}
          <div
            className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
              isOnline ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-200 border border-amber-600'
            }`}
            title={isOnline ? 'Online - Live Cloud & AI Sync' : 'Offline Mode - Photos Queued Locally'}
          >
            <Radio className={`w-3 h-3 ${isOnline ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-[11px]">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Language Selector */}
          <div className="relative flex items-center bg-emerald-900/90 rounded-lg px-2 py-1 border border-emerald-700 text-xs">
            <Globe className="w-3.5 h-3.5 text-emerald-300 mr-1" />
            <select
              id="language-select"
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="en" className="bg-emerald-950 text-white">EN (English)</option>
              <option value="hi" className="bg-emerald-950 text-white">HI (हिन्दी)</option>
              <option value="pa" className="bg-emerald-950 text-white">PA (ਪੰਜਾਬੀ)</option>
              <option value="mr" className="bg-emerald-950 text-white">MR (मराठी)</option>
              <option value="te" className="bg-emerald-950 text-white">TE (తెలుగు)</option>
              <option value="ta" className="bg-emerald-950 text-white">TA (தமிழ்)</option>
              <option value="bn" className="bg-emerald-950 text-white">BN (বাংলা)</option>
            </select>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-emerald-900 text-emerald-200 hover:text-white transition"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-emerald-950 border-t border-emerald-800 px-4 py-3 space-y-2 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollTo(link.id)}
                className="p-2.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-left text-emerald-100 flex items-center justify-between"
              >
                <span>{link.label}</span>
              </button>
            ))}
          </div>

          {!currentUser && (
            <div className="pt-2 border-t border-emerald-800 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuth('farmer_register');
                }}
                className="flex-1 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs text-center"
              >
                {isHindi ? 'किसान पंजीकरण' : 'Farmer Register'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="flex-1 py-2 rounded-lg bg-emerald-800 text-emerald-200 border border-emerald-700 font-bold text-xs text-center"
              >
                {isHindi ? 'लॉगिन' : 'Login'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sub-Bar: Quick Role Switcher and Jump-to-Portals Bar */}
      <div className="bg-emerald-900/90 border-t border-emerald-800/60 py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold">
            <span className="hidden sm:inline">
              {isHindi ? 'कार्यक्षेत्र चुनें:' : 'Active Role Mode:'}
            </span>
            <div className="flex items-center bg-emerald-950 p-0.5 rounded-lg border border-emerald-800">
              <button
                type="button"
                id="role-farmer-button"
                onClick={() => {
                  onRoleChange('farmer');
                  onTabChange('diagnose');
                  scrollTo('diagnose');
                }}
                className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 ${
                  currentRole === 'farmer'
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                <Sprout className="w-3.5 h-3.5 text-emerald-200" />
                <span>{isHindi ? 'किसान' : 'Farmer'}</span>
              </button>

              <button
                type="button"
                id="role-expert-button"
                onClick={() => {
                  onRoleChange('expert');
                  onTabChange(isApprovedOfficialOrExpert ? 'expertQueue' : 'officialDash');
                  scrollTo('portals');
                }}
                className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 relative ${
                  currentRole === 'expert'
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                <span>{isHindi ? 'वैज्ञानिक / अधिकारी' : 'Official / Expert'}</span>
                {!isApprovedOfficialOrExpert && <Lock className="w-3 h-3 text-amber-300/80" />}
                {pendingReviewCount > 0 && (
                  <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-1 rounded-full">
                    {pendingReviewCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                id="role-admin-button"
                onClick={() => {
                  onRoleChange('admin');
                  onTabChange('adminApprovals');
                  scrollTo('portals');
                }}
                className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 ${
                  currentRole === 'admin'
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-emerald-200" />
                <span>{isHindi ? 'व्यवस्थापक' : 'Admin'}</span>
                {!isApprovedAdmin && <Lock className="w-3 h-3 text-amber-300/80" />}
                {pendingApprovalsCount > 0 && isApprovedAdmin && (
                  <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-1 rounded-full">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-emerald-300">
            <button
              type="button"
              onClick={() => scrollTo('how-it-works')}
              className="hover:text-white underline flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3" />
              <span>{isHindi ? 'निर्देशिका' : 'User Guide'}</span>
            </button>
            <button
              type="button"
              onClick={onOpenAbout}
              className="hover:text-white underline flex items-center gap-1"
            >
              <Info className="w-3 h-3" />
              <span>Team Tech Giants</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
