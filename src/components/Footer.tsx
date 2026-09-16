import React from 'react';
import { Mail, Phone, ShieldCheck, HeartHandshake, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenAbout: () => void;
  onScrollTo?: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAbout, onScrollTo }) => {
  const scrollTo = (id: string) => {
    if (onScrollTo) {
      onScrollTo(id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="app-footer" className="bg-stone-950 text-stone-300 border-t border-stone-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          {/* Main Brand & Mandatory Attribution */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-xl tracking-tight">Agropari</span>
              <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                ICAR Vetted Platform
              </span>
            </div>
            <p className="text-stone-300 font-semibold text-sm">
              Developed by Team Tech Giants | devp3987@gmail.com | +91 8081774848
            </p>
            <p className="text-stone-400 text-xs leading-relaxed max-w-lg">
              AI-Powered Crop Health Management, Multimodal Foliar Pathology, Vernacular Audio IPM Guidance & 10km GPS Geofenced Epidemic Early-Warning System for Farmers & Agronomists.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-emerald-400">
              <button type="button" onClick={() => scrollTo('hero')} className="hover:underline">Home</button>
              <button type="button" onClick={() => scrollTo('about')} className="hover:underline">About</button>
              <button type="button" onClick={() => scrollTo('how-it-works')} className="hover:underline">How It Works</button>
              <button type="button" onClick={() => scrollTo('diagnose')} className="hover:underline">AI Camera</button>
              <button type="button" onClick={() => scrollTo('field-sentinel')} className="hover:underline">Field Alerts</button>
              <button type="button" onClick={() => scrollTo('outbreak-radar')} className="hover:underline">Outbreak Radar</button>
              <button type="button" onClick={() => scrollTo('portals')} className="hover:underline">Official Portals</button>
            </div>
          </div>

          {/* Quick Contact and KVK Helpline */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-stone-100 uppercase tracking-wider text-[11px]">Direct Support</div>
            <div className="flex items-center gap-2 text-stone-300">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>devp3987@gmail.com</span>
            </div>
            <div className="flex items-center gap-2 text-stone-300">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>+91 8081774848 (Support Desk)</span>
            </div>
            <div className="flex items-center gap-2 text-stone-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Kisan Call Centre: 1800-180-1551</span>
            </div>
          </div>

          {/* Guidelines and About Trigger */}
          <div className="space-y-3">
            <div className="font-bold text-stone-100 uppercase tracking-wider text-[11px]">Governance & Trust</div>
            <button
              id="footer-about-btn"
              onClick={onOpenAbout}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition underline underline-offset-4 text-left"
            >
              <HeartHandshake className="w-4 h-4 shrink-0" />
              <span>About Team Tech Giants & Architecture</span>
            </button>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Diagnostic advisory follows ICAR and State Department IPM protocols. Pre-harvest safety intervals (PHI) must be strictly observed before harvest.
            </p>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-8 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            Developed by Team Tech Giants | devp3987@gmail.com | +91 8081774848 &copy; {new Date().getFullYear()} Agropari. All rights reserved.
          </div>
          <button
            type="button"
            onClick={() => scrollTo('hero')}
            className="text-emerald-400 hover:text-emerald-300 font-bold"
          >
            Back to Top &uarr;
          </button>
        </div>
      </div>
    </footer>
  );
};
