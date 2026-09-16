import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, AlertCircle, Sparkles, Check, SwitchCamera } from 'lucide-react';
import { LanguageCode } from '../types';

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  currentLanguage: LanguageCode;
}

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  currentLanguage
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  const isHindi = currentLanguage === 'hi';

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Initialize camera stream
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    stopStream();
    setIsLoading(true);
    setCameraError(null);
    setCapturedPreview(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        isHindi
          ? 'आपके ब्राउज़र में कैमरा सपोर्ट उपलब्ध नहीं है। कृपया गैलरी या फाइल विकल्प का उपयोग करें।'
          : 'Camera access is not supported by your device browser. Please use file upload.'
      );
      setIsLoading(false);
      return;
    }

    try {
      // Check for available video devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      } catch {
        // ignore device enumeration errors
      }

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err: any) {
        // If ideal constraints failed (e.g. on older mobile browsers or desktops), try plain video: true
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play();
          } catch {
            // ignore autoplay race conditions
          }
          setIsLoading(false);
        };
      } else {
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Camera initialization error:', err);
      let errorMsg = isHindi
        ? 'कैमरा खोलने में असमर्थ। कृपया ब्राउज़र सेटिंग्स में कैमरा परमिशन की अनुमति (Allow) दें।'
        : 'Could not access device camera. Please grant camera permission in your browser.';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = isHindi
          ? 'कैमरा परमिशन अस्वीकृत है। कृपया ब्राउज़र URL बार पर ताला/परमिशन आइकॉन पर क्लिक करके कैमरा की अनुमति दें।'
          : 'Camera permission denied. Please allow camera access in browser permissions.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = isHindi
          ? 'डिवाइस पर कोई कैमरा नहीं मिला। कृपया गैलरी से फोटो चुनें।'
          : 'No camera hardware found on this device. Please choose a photo from files.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = isHindi
          ? 'कैमरा किसी अन्य ऐप द्वारा उपयोग में है। कृपया अन्य ऐप्स बंद करके पुनः प्रयास करें।'
          : 'Camera is currently in use by another application.';
      }

      setCameraError(errorMsg);
      setIsLoading(false);
    }
  }, [isHindi, stopStream]);

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopStream();
      setCapturedPreview(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, startCamera, stopStream]);

  // Flip camera between front and back
  const handleToggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Capture frame from video to canvas
  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If using user (front) camera, flip horizontally for mirror effect match
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPreview(dataUrl);
    stopStream();
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPreview(null);
    startCamera(facingMode);
  };

  // Confirm photo and send to parent
  const handleConfirm = () => {
    if (capturedPreview) {
      onCapture(capturedPreview);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-stone-950 rounded-3xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col max-h-[96vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-stone-900/90 border-b border-stone-800 text-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {isHindi ? 'लाइव कैमरा (फसल की फोटो लें)' : 'Live Crop Health Camera'}
              </h3>
              <p className="text-[11px] text-stone-400">
                {isHindi ? 'पत्ती या बीमारी के धब्बे पर फोकस करें' : 'Focus closely on affected leaves or lesions'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition"
            title={isHindi ? 'बंद करें' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Video Canvas Area */}
        <div className="relative flex-1 bg-black min-h-[360px] sm:min-h-[460px] flex items-center justify-center overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 text-white gap-3 p-4 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="text-sm font-semibold">
                {isHindi ? 'कैमरा शुरू हो रहा है, कृपया प्रतीक्षा करें...' : 'Starting live camera stream...'}
              </p>
              <p className="text-xs text-stone-400 max-w-xs">
                {isHindi ? 'यदि ब्राउज़र परमिशन मांगे तो Allow करें।' : 'Please grant camera access if prompted.'}
              </p>
            </div>
          )}

          {cameraError ? (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-stone-950 text-white">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-stone-200 text-sm mb-1">
                {isHindi ? 'कैमरा खोलने में समस्या' : 'Camera Access Error'}
              </h4>
              <p className="text-xs text-stone-400 max-w-sm mb-4 leading-relaxed">
                {cameraError}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'पुनः प्रयास करें' : 'Try Again'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopStream();
                    onClose();
                  }}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition"
                >
                  {isHindi ? 'गैलरी से चुनें' : 'Choose from Gallery'}
                </button>
              </div>
            </div>
          ) : capturedPreview ? (
            /* Captured Snapshot Preview */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedPreview}
                alt="Captured crop leaf"
                className="max-h-[460px] w-auto max-w-full object-contain rounded-lg"
              />
              <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Check className="w-3.5 h-3.5" />
                <span>{isHindi ? 'फोटो खींच ली गई है' : 'Photo Captured'}</span>
              </div>
            </div>
          ) : (
            /* Active Live Video Stream with Viewfinder Framing */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Viewfinder Overlay Guide */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6">
                {/* Target Framing Box */}
                <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-square my-auto border-2 border-dashed border-emerald-400/80 rounded-3xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
                  {/* Four Corner Accents */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

                  {/* Center Plus Reticle */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-40">
                    <div className="w-6 h-0.5 bg-white" />
                    <div className="h-6 w-0.5 bg-white absolute" />
                  </div>
                </div>

                <div className="bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-3 py-1 rounded-full border border-stone-700/60 shadow-md">
                  {isHindi
                    ? 'पौधे की खराब पत्ती को हरे बॉक्स के बीच में रखें'
                    : 'Place affected leaf in the center frame'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="px-6 py-4 bg-stone-900 border-t border-stone-800 flex items-center justify-between gap-3 text-white">
          {capturedPreview ? (
            /* Actions after capturing */
            <div className="w-full flex items-center justify-between gap-3">
              <button
                type="button"
                id="retake-photo-btn"
                onClick={handleRetake}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{isHindi ? 'दोबारा फोटो लें' : 'Retake'}</span>
              </button>

              <button
                type="button"
                id="use-photo-btn"
                onClick={handleConfirm}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition"
              >
                <Check className="w-4 h-4" />
                <span>{isHindi ? 'इस फोटो की जांच करें' : 'Use Photo & Diagnose'}</span>
              </button>
            </div>
          ) : (
            /* Actions during live video */
            <div className="w-full flex items-center justify-between">
              {/* Camera Switch (Flip) */}
              <div className="w-16 flex justify-start">
                <button
                  type="button"
                  id="flip-camera-btn"
                  onClick={handleToggleCamera}
                  disabled={isLoading || Boolean(cameraError)}
                  className="p-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-30 transition"
                  title={isHindi ? 'कैमरा बदलें (फ्रंट/बैक)' : 'Flip Camera'}
                >
                  <SwitchCamera className="w-5 h-5" />
                </button>
              </div>

              {/* Shutter Button */}
              <div className="flex-1 flex justify-center">
                <button
                  type="button"
                  id="shutter-capture-btn"
                  onClick={handleSnap}
                  disabled={isLoading || Boolean(cameraError)}
                  className="w-16 h-16 rounded-full border-4 border-white bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-stone-950 shadow-xl flex items-center justify-center transition disabled:opacity-30 disabled:pointer-events-none"
                  title={isHindi ? 'फोटो खींचें' : 'Take Photo'}
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                    <Camera className="w-6 h-6 text-emerald-800" />
                  </div>
                </button>
              </div>

              {/* Cancel Button */}
              <div className="w-16 flex justify-end">
                <button
                  type="button"
                  id="cancel-camera-btn"
                  onClick={() => {
                    stopStream();
                    onClose();
                  }}
                  className="text-xs font-semibold text-stone-400 hover:text-white px-2 py-1"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
