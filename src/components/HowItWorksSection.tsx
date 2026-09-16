import React from 'react';
import { Camera, Cpu, Volume2, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { LanguageCode } from '../types';

interface HowItWorksSectionProps {
  currentLanguage: LanguageCode;
  onScrollTo: (sectionId: string) => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ currentLanguage, onScrollTo }) => {
  const isHindi = currentLanguage === 'hi';

  const steps = [
    {
      number: '01',
      icon: Camera,
      iconColor: 'text-emerald-700 bg-emerald-100 border-emerald-300',
      title: isHindi ? '1. पत्ती की फोटो लें' : '1. Capture Leaf Photo',
      subtitle: isHindi ? 'लाइव कैमरा या गैलरी' : 'Live Camera or Upload',
      description: isHindi
        ? 'अपने मोबाइल या कंप्यूटर के लाइव कैमरे से रोगग्रस्त पत्ती या पौधे की स्पष्ट फोटो खींचें या सीधे अपलोड करें।'
        : 'Snap an image using the in-app Live Camera with viewfinder or upload directly from your field device.'
    },
    {
      number: '02',
      icon: Cpu,
      iconColor: 'text-blue-700 bg-blue-100 border-blue-300',
      title: isHindi ? '2. एआई व मौसम विश्लेषण' : '2. AI & Weather Cross-Check',
      subtitle: isHindi ? 'तुरंत पैथोलॉजी स्कैन' : 'Microclimate Correlation',
      description: isHindi
        ? 'विजन एआई मॉडल तापमान, आर्द्रता और बारिश के आधार पर रोग की संभावना व विश्वास स्तर (Confidence %) तय करता है।'
        : 'Vision AI cross-correlates symptoms with real-time temperature, humidity, and rainfall to detect fungal/bacterial pathogens.'
    },
    {
      number: '03',
      icon: Volume2,
      iconColor: 'text-amber-700 bg-amber-100 border-amber-300',
      title: isHindi ? '3. बोलकर समझें समाधान' : '3. Vernacular Voice Advisory',
      subtitle: isHindi ? 'दिक्कत व उपाय ऑडियो' : 'ICAR-Sequenced IPM',
      description: isHindi
        ? 'रोग की मुख्य दिक्कत और आईसीएआर मानक अनुसार सस्य, जैविक व रासायनिक उपचार को अपनी भाषा में बोलकर सुनें।'
        : 'Listen to the full diagnosis and sequential cultural, biological, and chemical remedies read aloud via audio speech synthesis.'
    },
    {
      number: '04',
      icon: ShieldAlert,
      iconColor: 'text-rose-700 bg-rose-100 border-rose-300',
      title: isHindi ? '4. विशेषज्ञ पुष्टि व 10 किमी अलर्ट' : '4. Verification & Alert Ring',
      subtitle: isHindi ? 'पड़ोसी खेतों की रक्षा' : '10km Epidemic Fence',
      description: isHindi
        ? 'संदेहास्पद मामलों में ब्लॉक कृषि वैज्ञानिक से सत्यापन, तथा 10 किमी में स्थित किसान भाइयों को रोग रोकथाम अलर्ट।'
        : 'Borderline cases are reviewed by district agronomists, and a 10km GPS quarantine ring alerts adjacent farms proactively.'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-stone-300">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            {isHindi ? 'कार्यप्रणाली' : 'Step-by-Step Workflow'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-950 tracking-tight font-display">
            {isHindi ? 'एग्रोपरी कैसे काम करता है?' : 'How Agropari Works in the Field'}
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            {isHindi
              ? 'खेत में रोग दिखने से लेकर सुरक्षित उपचार और आसपास के खेतों की सुरक्षा तक का 4-चरणीय वैज्ञानिक तरीका।'
              : 'From capturing the initial leaf symptom to listening to voice remedies and shielding neighboring farms within 10km.'}
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative bg-stone-50 p-6 rounded-2xl border border-stone-200 hover:border-emerald-500/60 transition shadow-2xs hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold ${step.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-stone-300 font-mono">
                      {step.number}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-stone-900 tracking-tight">
                      {step.title}
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                      {step.subtitle}
                    </span>
                  </div>

                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-200/80 flex items-center text-[11px] text-stone-500 font-semibold gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isHindi ? 'स्वचालित व सुरक्षित' : 'Automated & ICAR Verified'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA bar */}
        <div className="bg-emerald-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg sm:text-xl font-black">
              {isHindi ? 'क्या आपके खेत में किसी पौधे पर रोग दिख रहा है?' : 'Experiencing leaf spots or unusual crop damage?'}
            </h4>
            <p className="text-emerald-200 text-xs sm:text-sm">
              {isHindi
                ? 'अभी लाइव कैमरा खोलें और मात्र 3 सेकंड में पूरी जांच और बोलकर समाधान पाएं।'
                : 'Open the live camera now to get verified IPM recommendations and hear voice instructions.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onScrollTo('diagnose')}
            className="px-6 py-3 bg-white hover:bg-stone-100 text-emerald-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shrink-0 shadow-md transition"
          >
            <span>{isHindi ? 'कैमरा जांच शुरू करें' : 'Open Diagnostic Camera'}</span>
            <ArrowRight className="w-4 h-4 text-emerald-800" />
          </button>
        </div>
      </div>
    </section>
  );
};
