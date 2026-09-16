import React from 'react';
import { Sprout, ShieldCheck, Cpu, Volume2, MapPin, Users, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { LanguageCode } from '../types';

interface AboutSectionProps {
  currentLanguage: LanguageCode;
  onScrollTo: (sectionId: string) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ currentLanguage, onScrollTo }) => {
  const isHindi = currentLanguage === 'hi';

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-100 border-b border-stone-300">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs">
            <Sprout className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isHindi ? 'प्लेटफॉर्म के बारे में' : 'About Agropari'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-950 tracking-tight font-display">
            {isHindi
              ? 'आधुनिक कृषि तकनीक एवं कृषक सशक्तिकरण'
              : 'Bridging Smallholder Farmers with ICAR Agronomic Science'}
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            {isHindi
              ? 'एग्रोपरी एक व्यापक फसल स्वास्थ्य प्रबंधन और महामारी रोकथाम प्लेटफॉर्म है, जिसे भारतीय कृषि की वास्तविक चुनौतियों को ध्यान में रखकर तैयार किया गया है।'
              : 'Agropari is a field-tested, multi-tier crop pathology and pest containment platform built to eliminate diagnostic delays, prevent toxic chemical overuse, and halt regional crop epidemics before they devastate harvest yields.'}
          </p>
        </div>

        {/* 3 Core Impact Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-7 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-stone-900">
              {isHindi ? 'मल्टीमॉडल विजन एआई' : 'Multimodal Vision AI'}
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              {isHindi
                ? 'गूगल जेमिनी 3.8 / 2.5 फ्लैश और आईसीएआर पैथोलॉजी रेफरेंस मॉडल के संयोजन से पत्तियों, तनों और फलों पर लगने वाले 40+ फंगल, बैक्टीरियल व कीट रोगों की तुरंत पहचान होती है।'
                : 'Harnesses multimodal AI combined with ICAR disease taxonomy to diagnose foliar blights, fungal rusts, bacterial wilts, and pest damage with sub-second turnaround.'}
            </p>
            <div className="pt-2 text-xs font-bold text-emerald-700 flex items-center gap-1">
              <span>{isHindi ? 'सटीक नैदानिक परीक्षण' : 'Gated Clinical Gating'}</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-stone-900">
              {isHindi ? 'बोलकर समझाएं (ऑडियो समाधान)' : 'Vernacular Voice Assistance'}
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              {isHindi
                ? 'कम साक्षरता वाले या बुजुर्ग किसानों के लिए वेब स्पीच इंजन द्वारा पूरी रिपोर्ट — "फसल में क्या दिक्कत है" और "उसका क्या जैविक व सस्य समाधान है" — स्पष्ट हिंदी में बोलकर सुनाई जाती है।'
                : 'Ensures zero literacy barriers. The Web Speech synthesis reads aloud the precise diagnosis and sequential IPM remedy in Hindi and regional languages.'}
            </p>
            <div className="pt-2 text-xs font-bold text-amber-700 flex items-center gap-1">
              <span>{isHindi ? 'आसान व सुलभ आवाज' : 'High Accessibility Voice'}</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-stone-900">
              {isHindi ? '10 किमी महामारी रिंग फेंस' : '10km Outbreak Containment'}
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              {isHindi
                ? 'जब किसी खेत में कोई संक्रामक रोग पुष्टि पाता है, तो जीपीएस टेलीमेट्री द्वारा 10 किलोमीटर के दायरे में स्थित सभी किसान भाइयों को सतर्कता संदेश भेजा जाता है ताकि रोग फैलने न पाए।'
                : 'Employs Haversine geospatial calculations to establish a 10km surveillance ring around confirmed disease hotspots, warning neighboring farms before spore dispersal.'}
            </p>
            <div className="pt-2 text-xs font-bold text-blue-700 flex items-center gap-1">
              <span>{isHindi ? 'समय पूर्व सुरक्षा कवच' : 'Early Warning Buffer'}</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Detailed Architecture & Technical Governance */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              {isHindi ? 'प्रणाली की विशिष्टताएं' : 'Platform Architecture & Governance'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight">
              {isHindi
                ? 'किसानों, वैज्ञानिकों और अधिकारियों का साझा मंच'
                : 'Multi-Role Accountability from Farm to District HQ'}
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              {isHindi
                ? 'एग्रोपरी केवल एक ऐप नहीं है, बल्कि एक संपूर्ण कृषि प्रणाली है। इसमें किसानों के लिए खुला पंजीकरण, विशेषज्ञों के लिए प्रशासनिक अनुमोदन द्वारा प्रमाणीकरण, तथा कृषि विभाग के लिए वास्तविक समय में प्रकोप विश्लेषण उपलब्ध है।'
                : 'Agropari delivers an end-to-end operational pipeline. It links field diagnostics directly with district agronomist verification queues, prevents unvetted chemical recommendations, and offers administrative control over disease risk thresholds.'}
            </p>

            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700 pt-2">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>{isHindi ? 'आईसीएआर 5-स्तरीय अनुक्रम:' : 'Strict ICAR 5-Stage Sequencing:'}</strong>{' '}
                  {isHindi ? 'निगरानी ➔ सस्य ➔ जैविक ➔ भौतिक ➔ अंतिम विकल्प रासायनिक।' : 'Monitoring ➔ Cultural ➔ Biological ➔ Mechanical ➔ Chemical as Last Resort.'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>{isHindi ? 'विशेषज्ञ सत्यापन (<60%):' : 'Expert Verification (<60%):'}</strong>{' '}
                  {isHindi ? 'संदेहास्पद मामलों में स्वतः केवीके व विश्वविद्यालय के पैथोलॉजिस्ट को सूचना।' : 'Ambiguous leaf symptoms automatically routed to senior agronomists.'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>{isHindi ? 'सुरक्षित प्रमाणीकरण:' : 'Role-Based Authentication:'}</strong>{' '}
                  {isHindi ? 'अधिकारियों और वैज्ञानिकों के लिए पासवर्ड लॉक व मुख्य व्यवस्थापक द्वारा अनुमोदन।' : 'Password locks for officials & agronomists, reviewed by verified admin.'}
                </span>
              </li>
            </ul>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onScrollTo('diagnose')}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition"
              >
                <span>{isHindi ? 'निदान उपकरण पर जाएं' : 'Try Diagnostic Tool'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onScrollTo('portals')}
                className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs sm:text-sm border border-stone-300 transition"
              >
                <span>{isHindi ? 'अधिकारी एवं विशेषज्ञ पोर्टल' : 'Official Portal'}</span>
              </button>
            </div>
          </div>

          {/* Right Card: Credited to Team Tech Giants */}
          <div className="bg-stone-900 text-white p-7 rounded-2xl border border-stone-800 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="font-extrabold text-sm text-stone-100">Team Tech Giants</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded">
                ICAR Vetted Protocol
              </span>
            </div>

            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              {isHindi
                ? 'यह प्रणाली "टीम टेक जायंट्स" द्वारा भारतीय किसानों को रोग मुक्त और उच्च उत्पादकता वाली फसलें प्रदान करने के उद्देश्य से विकसित की गई है। इसमें स्थानीय जलवायु, तापमान, आर्द्रता और मिट्टी के डेटा को जोड़कर पूर्वानुमान लगाया जाता है।'
                : 'Architected and engineered by Team Tech Giants under the National Agricultural Digital Transformation Mission. Developed in active consultation with field plant pathologists and Krishi Vigyan Kendra extension specialists.'}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
                <div className="text-stone-400 font-medium">{isHindi ? 'समर्थित भाषाएँ' : 'Supported Languages'}</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">7+ Regional</div>
              </div>
              <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
                <div className="text-stone-400 font-medium">{isHindi ? 'निगरानी परिधि' : 'Alert Radius'}</div>
                <div className="text-base font-bold text-amber-400 mt-0.5">10 Kilometers</div>
              </div>
            </div>

            <div className="text-[11px] text-stone-400 pt-1 border-t border-stone-800">
              {isHindi
                ? 'तकनीकी सहायता एवं प्रशासनिक संपर्क: devp3987@gmail.com'
                : 'System Administrator & Governance Contact: devp3987@gmail.com'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
