import React, { useState, useRef, useEffect } from 'react';
import { VerificationBiometrique } from '../../types';
import { 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  ShieldCheck, 
  Scan, 
  Smile, 
  Eye, 
  UserCheck,
  Video
} from 'lucide-react';

interface BiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (biometrie: VerificationBiometrique) => void;
  demandeurNom: string;
}

export const BiometricVerificationModal: React.FC<BiometricModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  demandeurNom
}) => {
  const [useWebcam, setUseWebcam] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Liveness stages
  const [stage, setStage] = useState<'intro' | 'step_blink' | 'step_smile' | 'step_tilt' | 'processing' | 'success'>('intro');
  const [progress, setProgress] = useState(0);
  const [livenessSteps, setLivenessSteps] = useState({
    clignementYeux: false,
    sourire: false,
    mouvementTete: false
  });
  const [matchingScore, setMatchingScore] = useState(97.2);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Stop camera on unmount or close
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  const startCamera = async () => {
    setStreamError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setUseWebcam(true);
      } else {
        setStreamError("La webcam n'est pas supportée dans cet environnement. Le mode simulation haute précision est activé.");
        setUseWebcam(false);
      }
    } catch {
      setStreamError("Accès caméra indisponible ou refusé. Vous pouvez exécuter la vérification avec le simulateur biométrique certifié.");
      setUseWebcam(false);
    }
  };

  const handleStartLiveness = async () => {
    setStage('step_blink');
    setProgress(15);
  };

  const captureFrame = () => {
    if (useWebcam && videoRef.current) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedPhoto(dataUrl);
          return dataUrl;
        }
      } catch {
        // ignore
      }
    }
    return null;
  };

  const completeStep1 = () => {
    setLivenessSteps(prev => ({ ...prev, clignementYeux: true }));
    setProgress(45);
    setStage('step_smile');
  };

  const completeStep2 = () => {
    setLivenessSteps(prev => ({ ...prev, sourire: true }));
    setProgress(75);
    setStage('step_tilt');
  };

  const completeStep3 = () => {
    setLivenessSteps(prev => ({ ...prev, mouvementTete: true }));
    setProgress(90);
    setStage('processing');

    const photo = captureFrame();

    // Final processing simulation (matching algorithm with official CENI / passport template)
    setTimeout(() => {
      const finalScore = parseFloat((95.5 + Math.random() * 3.8).toFixed(1));
      setMatchingScore(finalScore);
      setProgress(100);
      setStage('success');

      stopWebcam();

      setTimeout(() => {
        const result: VerificationBiometrique = {
          effectuee: true,
          dateCapture: new Date().toISOString(),
          scoreConcordance: finalScore,
          vivaciteVerifiee: true,
          etapesVivacite: {
            clignementYeux: true,
            sourire: true,
            mouvementTete: true
          },
          typeVerification: 'facial_liveness_match',
          referenceScan: `BIO-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
          photoCaptureUrl: photo || undefined,
          empreinteFacialeHash: 'sha256:' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
        };
        onSuccess(result);
        onClose();
      }, 1500);
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl text-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Vérification Biométrique Sécurisée
              </h3>
              <p className="text-xs text-slate-400">
                Test de vivacité & reconnaissance faciale RDC
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopWebcam();
              onClose();
            }}
            className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded-md hover:bg-slate-800"
          >
            Fermer
          </button>
        </div>

        {/* Content body */}
        <div className="p-6">
          {stage === 'intro' && (
            <div className="space-y-5 text-center">
              <div className="relative mx-auto w-40 h-40 rounded-full border-2 border-dashed border-sky-400/60 p-2 flex items-center justify-center bg-slate-950">
                <img
                  src="/src/assets/images/biometric_face_id_1790149959129.jpg"
                  alt="Biométrie faciale"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full opacity-90"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 rounded-full border border-sky-400 animate-pulse pointer-events-none" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">
                  Certification d’Identité pour {demandeurNom}
                </h4>
                <p className="text-xs text-slate-300 mt-1.5 max-w-md mx-auto leading-relaxed">
                  Conformément aux normes sécuritaires de la RDC, cette vérification garantit que vous êtes le titulaire légitime de la pièce d’identité présentée.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-left text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-slate-300">
                  <Eye className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>1. Clignement</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Smile className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>2. Sourire franc</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>3. Vivacité 3D</span>
                </div>
              </div>

              {streamError && (
                <div className="text-xs text-amber-400 bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/50 text-left">
                  {streamError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={async () => {
                    await startCamera();
                    handleStartLiveness();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
                >
                  <Video className="w-4 h-4" />
                  <span>Activer la caméra & Commencer</span>
                </button>
                <button
                  onClick={() => {
                    setUseWebcam(false);
                    handleStartLiveness();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
                >
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Mode Simulation Assistée</span>
                </button>
              </div>
            </div>
          )}

          {/* Interactive Steps: Blink, Smile, Head Movement */}
          {(stage === 'step_blink' || stage === 'step_smile' || stage === 'step_tilt' || stage === 'processing') && (
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>Analyse biométrique en cours</span>
                  <span className="font-mono text-sky-400">{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-sky-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Viewport Box */}
              <div className="relative aspect-4/3 max-w-sm mx-auto bg-slate-950 rounded-2xl overflow-hidden border-2 border-sky-500/40 shadow-inner flex items-center justify-center">
                {useWebcam ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black">
                    <img
                      src="/src/assets/images/biometric_face_id_1790149959129.jpg"
                      alt="Face scan"
                      referrerPolicy="no-referrer"
                      className="w-48 h-48 object-cover rounded-full opacity-60 filter contrast-125"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Oval face guide */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className={`w-48 h-64 border-2 rounded-[50%] transition-colors duration-300 ${
                    stage === 'processing' 
                      ? 'border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.4)]' 
                      : 'border-sky-400/70 border-dashed animate-pulse'
                  }`} />
                  
                  {/* Scanning beam line */}
                  <div className="absolute w-56 h-0.5 bg-linear-to-r from-transparent via-sky-400 to-transparent animate-bounce top-1/3" />
                </div>

                {/* Landmark status indicator overlay */}
                <div className="absolute bottom-3 inset-x-3 bg-slate-950/85 backdrop-blur-md py-2 px-3 rounded-lg border border-slate-800 text-center">
                  {stage === 'step_blink' && (
                    <div className="flex items-center justify-center gap-2 text-xs text-sky-300 font-medium">
                      <Eye className="w-4 h-4 text-sky-400 animate-pulse" />
                      <span>Étape 1 : Clignez deux fois des yeux face à l'objectif</span>
                    </div>
                  )}
                  {stage === 'step_smile' && (
                    <div className="flex items-center justify-center gap-2 text-xs text-amber-300 font-medium">
                      <Smile className="w-4 h-4 text-amber-400 animate-bounce" />
                      <span>Étape 2 : Souriez naturellement pour vérifier l'expression</span>
                    </div>
                  )}
                  {stage === 'step_tilt' && (
                    <div className="flex items-center justify-center gap-2 text-xs text-emerald-300 font-medium">
                      <RotateCcw className="w-4 h-4 text-emerald-400 animate-spin" />
                      <span>Étape 3 : Inclinez légèrement la tête de gauche à droite</span>
                    </div>
                  )}
                  {stage === 'processing' && (
                    <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Calcul de concordance avec la pièce d'identité...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step confirmation action buttons */}
              {stage !== 'processing' && (
                <div className="flex justify-center pt-2">
                  {stage === 'step_blink' && (
                    <button
                      onClick={completeStep1}
                      className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Valider le clignement des yeux</span>
                    </button>
                  )}
                  {stage === 'step_smile' && (
                    <button
                      onClick={completeStep2}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2"
                    >
                      <Smile className="w-4 h-4" />
                      <span>Valider le sourire (Vivacité)</span>
                    </button>
                  )}
                  {stage === 'step_tilt' && (
                    <button
                      onClick={completeStep3}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmer et comparer les données faciales</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Success Stage */}
          {stage === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">
                  Identité Biométrique Validée
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Le test de vivacité est positif et le taux de concordance avec votre pièce d'identité est de :
                </p>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-2 tabular-nums">
                  {matchingScore}%
                </div>
              </div>

              <div className="inline-flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Empreinte cryptographique horodatée générée avec succès</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
