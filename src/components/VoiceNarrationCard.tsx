import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw, Sparkles, Mic, Radio } from 'lucide-react';
import { LanguageCode } from '../types';
import { buildAudioNarrationText, getHindiPathology } from '../utils/hindiPathology';

interface VoiceNarrationCardProps {
  diseaseName: string;
  description: string;
  ipmAdvisory: any;
  cropName: string;
  currentLanguage: LanguageCode;
}

export const VoiceNarrationCard: React.FC<VoiceNarrationCardProps> = ({
  diseaseName,
  description,
  ipmAdvisory,
  cropName,
  currentLanguage
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(0.85); // slightly slower pace for clear Hindi comprehension
  const [supported, setSupported] = useState<boolean>(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isHindi = currentLanguage === 'hi';

  const narrationText = buildAudioNarrationText(
    diseaseName,
    description,
    ipmAdvisory,
    currentLanguage,
    cropName
  );

  const hindiData = isHindi ? getHindiPathology(diseaseName) : null;

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSupported(false);
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop audio if props change
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  }, [diseaseName, currentLanguage]);

  const handleSpeak = () => {
    if (!supported) {
      alert(isHindi ? 'आपके ब्राउज़र में आवाज़ (TTS) सपोर्ट नहीं है।' : 'Text-to-speech is not supported.');
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(narrationText);
    utteranceRef.current = utterance;

    // Pick best available voice
    const voices = window.speechSynthesis.getVoices();
    if (isHindi) {
      utterance.lang = 'hi-IN';
      const hindiVoice = voices.find((v) => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi') || v.lang === 'hi-IN');
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
    } else {
      utterance.lang = 'en-IN';
      const indianVoice = voices.find((v) => v.lang === 'en-IN' || v.name.includes('India'));
      if (indianVoice) {
        utterance.voice = indianVoice;
      }
    }

    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    setIsPlaying(true);
    setIsPaused(false);
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if ('speechSynthesis' in window && isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleRestart = () => {
    handleStop();
    setTimeout(() => {
      handleSpeak();
    }, 150);
  };

  if (!supported) return null;

  return (
    <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-emerald-950 text-white p-4 sm:p-5 rounded-2xl border border-emerald-500/30 shadow-xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shadow-inner">
            <Radio className={`w-5 h-5 ${isPlaying && !isPaused ? 'animate-pulse text-emerald-300' : ''}`} />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base text-emerald-300 flex items-center gap-1.5">
              <span>{isHindi ? 'आवाज़ में सुनें: दिक्कत और समाधान' : 'Listen Aloud: Problem & Remedy'}</span>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                {isHindi ? 'बोल के सुनाए' : 'Voice Narration'}
              </span>
            </h4>
            <p className="text-xs text-stone-300 mt-0.5">
              {isHindi
                ? 'फसल की बीमारी (दिक्कत) और उसके संपूर्ण उपचार (समाधान) को बोलकर सुनें'
                : 'Listen to the diagnosis problem and complete treatment plan spoken aloud'}
            </p>
          </div>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 bg-stone-800/80 p-1 rounded-xl border border-stone-700 text-xs">
          <button
            type="button"
            onClick={() => setSpeechRate(0.8)}
            className={`px-2 py-1 rounded-lg transition font-medium text-[11px] ${
              speechRate <= 0.85
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            {isHindi ? 'धीमी गति (0.8x)' : 'Slow (0.8x)'}
          </button>
          <button
            type="button"
            onClick={() => setSpeechRate(1.0)}
            className={`px-2 py-1 rounded-lg transition font-medium text-[11px] ${
              speechRate > 0.85
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            {isHindi ? 'सामान्य (1.0x)' : 'Normal (1.0x)'}
          </button>
        </div>
      </div>

      {/* Spoken Text Preview / Transcription Box */}
      <div className="bg-stone-950/60 rounded-xl p-3 border border-stone-800/80 text-xs sm:text-sm text-stone-200 leading-relaxed mb-4 max-h-32 overflow-y-auto">
        <div className="text-[11px] font-bold text-emerald-400 mb-1 flex items-center gap-1">
          <Mic className="w-3.5 h-3.5" />
          <span>{isHindi ? 'बोले जाने वाले शब्द (दिक्कत व समाधान):' : 'Spoken Script:'}</span>
        </div>
        <p className="font-sans">
          {narrationText}
        </p>
      </div>

      {/* Visual Audio Waveform + Playback Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-stone-800">
        {/* Animated Waveform Equalizer when playing */}
        <div className="flex items-center gap-1.5 h-6">
          {isPlaying && !isPaused ? (
            <>
              <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-5 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-6 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="w-1 h-4 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
              <span className="w-1 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              <span className="text-[11px] text-emerald-300 font-semibold ml-1.5">
                {isHindi ? 'आवाज़ चल रही है...' : 'Speaking aloud...'}
              </span>
            </>
          ) : isPaused ? (
            <span className="text-[11px] text-amber-300 font-medium">
              {isHindi ? 'आवाज़ रुकी हुई है (Pause)' : 'Speech Paused'}
            </span>
          ) : (
            <span className="text-[11px] text-stone-400">
              {isHindi ? 'आवाज़ सुनने के लिए बटन दबाएं' : 'Click Play to hear speech'}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <button
              type="button"
              id="voice-narration-play-btn"
              onClick={handleSpeak}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-stone-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-950"
            >
              <Volume2 className="w-4 h-4 text-stone-950" />
              <span>{isHindi ? '🔊 बोल के सुनाएं (Play)' : '🔊 Read Aloud (Play)'}</span>
            </button>
          ) : (
            <>
              {!isPaused ? (
                <button
                  type="button"
                  id="voice-narration-pause-btn"
                  onClick={handlePause}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl text-xs flex items-center gap-1 transition"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'रोकें (Pause)' : 'Pause'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="voice-narration-resume-btn"
                  onClick={handleSpeak}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'जारी रखें (Resume)' : 'Resume'}</span>
                </button>
              )}

              <button
                type="button"
                id="voice-narration-restart-btn"
                onClick={handleRestart}
                className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition"
                title={isHindi ? 'शुरू से दोबारा सुनें' : 'Restart Audio'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                id="voice-narration-stop-btn"
                onClick={handleStop}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>{isHindi ? 'बंद करें (Stop)' : 'Stop'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
