import React from 'react';
import { Sprout, Camera, Volume2, ShieldCheck, MapPin, ArrowDown, Sparkles, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { LanguageCode } from '../types';

interface HeroSectionProps {
  currentLanguage: LanguageCode;
  onScrollTo: (sectionId: string) => void;
  casesCount: number;
  alertsCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentLanguage,
  onScrollTo,
  casesCount,
  alertsCount
}) => {
  const isHindi = currentLanguage === 'hi';

  return (
    <section id="hero" className="relative bg-gradient-to-b from-emerald-900 via-emerald-950 to-stone-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle background ambient mesh */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-800/80 text-emerald-200 border border-emerald-600/60 shadow-xs backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isHindi ? 'राष्ट्रीय कृषि एआई स्वास्थ्य प्रणाली' : 'National AI Plant Pathology Network'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-200 border border-amber-500/40">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>{isHindi ? 'आईसीएआर प्रमाणित आईपीएम अनुक्रम' : 'ICAR-Standard IPM Sequencing'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-200 border border-blue-500/40">
            <Volume2 className="w-3.5 h-3.5 text-blue-300" />
            <span>{isHindi ? 'बोलकर समझाएं (ऑडियो सहायता)' : 'Hindi & Regional Voice Guidance'}</span>
          </span>
        </div>

        {/* Main Headline & Value Proposition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-8 space-y-5">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight font-display text-white leading-tight">
              {isHindi ? (
                <>
                  फसल रोगों की <span className="text-emerald-400 underline decoration-emerald-500/50">तुरंत पहचान</span>, बोलकर समाधान एवं 10 किमी अलर्ट प्रणाली
                </>
              ) : (
                <>
                  Intelligent Crop Pathology, <span className="text-emerald-400">Vernacular Voice</span> & 10km Epidemic Containment
                </>
              )}
            </h1>

            <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-3xl">
              {isHindi ? (
                <>
                  एग्रोपरी (Agropari) भारतीय किसानों, कृषि विज्ञान केंद्रों और ब्लॉक कृषि विशेषज्ञों के लिए तैयार किया गया संपूर्ण डिजिटल समाधान है। लाइव कैमरे से पत्ती की फोटो खींचें, रोग की सटीक जांच पाएं, और हिंदी में <strong>दिक्कत व उसका संपूर्ण समाधान बोलकर सुनें</strong>।
                </>
              ) : (
                <>
                  Agropari bridges field farmers with accredited ICAR agronomists through instant camera leaf diagnostics, verified multi-stage Integrated Pest Management (IPM), voice read-aloud advisory in regional dialects, and automated 10km GPS-gated epidemic warning rings.
                </>
              )}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                id="hero-start-diagnosis-btn"
                onClick={() => onScrollTo('diagnose')}
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black rounded-xl text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Camera className="w-5 h-5 text-stone-950" />
                <span>{isHindi ? 'अभी फसल की जांच करें' : 'Start Crop Diagnosis'}</span>
              </button>

              <button
                type="button"
                id="hero-view-map-btn"
                onClick={() => onScrollTo('outbreak-radar')}
                className="px-5 py-3.5 bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-600 font-bold rounded-xl text-sm sm:text-base flex items-center gap-2 transition"
              >
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span>{isHindi ? '10 किमी आउटब्रेक मैप देखें' : 'View Outbreak Radar'}</span>
              </button>

              <button
                type="button"
                id="hero-learn-about-btn"
                onClick={() => onScrollTo('about')}
                className="px-4 py-3.5 text-emerald-300 hover:text-white font-semibold text-sm flex items-center gap-1.5 transition"
              >
                <span>{isHindi ? 'प्लेटफॉर्म के बारे में जानें' : 'About Platform'}</span>
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-emerald-800/60">
              <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800/40">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Live Cam AI</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  {isHindi ? 'कैमरे से सीधी जांच' : 'Sub-second leaf triage'}
                </div>
              </div>

              <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800/40">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>बोलकर समाधान</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  {isHindi ? 'समस्या व समाधान सुनें' : 'Audio TTS guidance'}
                </div>
              </div>

              <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800/40">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>10km Alert Ring</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  {isHindi ? 'पड़ोसी खेतों को चेतावनी' : 'Proactive containment'}
                </div>
              </div>

              <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800/40">
                <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ICAR Protocol</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  {isHindi ? 'वैज्ञानिक स्प्रे चार्ट' : '5-tier IPM sequencing'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Platform Quick Telemetry & Status */}
          <div className="lg:col-span-4">
            <div className="bg-stone-900/90 border-2 border-emerald-600/40 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-extrabold text-xs uppercase tracking-wider text-emerald-300">
                    {isHindi ? 'सक्रिय प्रणाली स्थिति' : 'Active Telemetry'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-stone-400 bg-stone-800 px-2 py-0.5 rounded">
                  v3.8 Multi-Model
                </span>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-950/80 p-3.5 rounded-xl border border-stone-800">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                    {casesCount > 0 ? casesCount : '1,420+'}
                  </div>
                  <div className="text-xs font-semibold text-stone-400 mt-0.5">
                    {isHindi ? 'दर्ज फसल मामले' : 'Diagnosed Cases'}
                  </div>
                </div>

                <div className="bg-stone-950/80 p-3.5 rounded-xl border border-stone-800">
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                    {alertsCount > 0 ? alertsCount : '48'}
                  </div>
                  <div className="text-xs font-semibold text-stone-400 mt-0.5">
                    {isHindi ? 'सक्रिय 10 किमी अलर्ट' : '10km Epidemic Rings'}
                  </div>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2 text-xs text-stone-300 pt-1">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{isHindi ? 'सटीक एआई जांच:' : 'Sub-60% Confidence Gating:'}</strong>{' '}
                    {isHindi ? 'कम विश्वास वाले मामलों को स्वतः विशेषज्ञ समीक्षा में भेजा जाता है।' : 'Routes ambiguous leaf symptoms to district agronomists.'}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{isHindi ? 'सुरक्षित कीटनाशक नियम:' : 'Zero Brand Commercialism:'}</strong>{' '}
                    {isHindi ? 'केवल कृषि विभाग द्वारा स्वीकृत रासायनिक श्रेणी एवं प्री-हार्वेस्ट अंतराल (PHI)।' : 'Strict active-ingredient classes & Pre-Harvest Intervals.'}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{isHindi ? 'ऑफलाइन सहायता:' : 'Offline Resilient:'}</strong>{' '}
                    {isHindi ? 'नेटवर्क न होने पर भी फोटो स्थानीय रूप से सुरक्षित रहती है।' : 'Full local indexing & automatic sync upon reconnection.'}
                  </span>
                </div>
              </div>

              {/* Quick Jump Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onScrollTo('diagnose')}
                  className="w-full py-2.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>{isHindi ? 'कैमरा खोलें और तुरंत जांच करें' : 'Open Camera & Diagnose'}</span>
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
