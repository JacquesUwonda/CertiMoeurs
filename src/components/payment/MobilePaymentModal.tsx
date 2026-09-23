import React, { useState } from 'react';
import { OperateurMobile, PaiementMobile } from '../../types';
import { 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight, 
  Loader2,
  Receipt,
  AlertCircle
} from 'lucide-react';

interface MobilePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  montantCDF: number;
  demandeurNom: string;
  telephoneInit: string;
  onPaymentSuccess: (paiement: PaiementMobile) => void;
}

export const MobilePaymentModal: React.FC<MobilePaymentModalProps> = ({
  isOpen,
  onClose,
  montantCDF,
  demandeurNom,
  telephoneInit,
  onPaymentSuccess
}) => {
  const [selectedOperateur, setSelectedOperateur] = useState<OperateurMobile>('mpesa');
  const [telephone, setTelephone] = useState(telephoneInit || '+243 81 445 8890');
  const [step, setStep] = useState<'selection' | 'push_ussd' | 'pin_entry' | 'confirmed'>('selection');
  const [pinCode, setPinCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const operators = [
    {
      id: 'mpesa' as OperateurMobile,
      nom: 'M-Pesa (Vodacom)',
      code: '*1122#',
      color: 'border-red-500/80 hover:bg-red-50/50 text-red-600',
      badge: 'bg-red-100 text-red-700',
      prefixHint: '+243 81... / 82...'
    },
    {
      id: 'orange_money' as OperateurMobile,
      nom: 'Orange Money',
      code: '*144#',
      color: 'border-orange-500/80 hover:bg-orange-50/50 text-orange-600',
      badge: 'bg-orange-100 text-orange-700',
      prefixHint: '+243 84... / 85... / 89...'
    },
    {
      id: 'airtel_money' as OperateurMobile,
      nom: 'Airtel Money',
      code: '*501#',
      color: 'border-rose-600/80 hover:bg-rose-50/50 text-rose-600',
      badge: 'bg-rose-100 text-rose-700',
      prefixHint: '+243 97... / 98... / 99...'
    },
    {
      id: 'afrimoney' as OperateurMobile,
      nom: 'Afrimoney (Africell)',
      code: '*111#',
      color: 'border-purple-600/80 hover:bg-purple-50/50 text-purple-600',
      badge: 'bg-purple-100 text-purple-700',
      prefixHint: '+243 90... / 91...'
    }
  ];

  const montantUSD = Math.round(montantCDF / 2500);

  const handleInitiatePush = () => {
    if (!telephone || telephone.length < 9) {
      setErrorMessage('Veuillez saisir un numéro de téléphone valide');
      return;
    }
    setErrorMessage('');
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setStep('push_ussd');
    }, 1200);
  };

  const handleSimulatePin = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('confirmed');

      const txnRef = `${selectedOperateur.toUpperCase()}-TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const quitRef = `QUIT-DGRAD-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      const paymentResult: PaiementMobile = {
        statut: 'paye',
        operateur: selectedOperateur,
        numeroTelephone: telephone,
        montantCDF,
        montantUSD,
        referenceTransaction: txnRef,
        datePaiement: new Date().toISOString(),
        referenceQuittance: quitRef
      };

      setTimeout(() => {
        onPaymentSuccess(paymentResult);
        onClose();
      }, 1800);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Paiement Mobile Money Sécurisé
              </h3>
              <p className="text-xs text-slate-500">
                Compte Trésor Public RDC · DGRAD
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm px-2 py-1 rounded-md"
          >
            Annuler
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Summary Banner */}
          <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-3.5 mb-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">Droit de chancellerie & timbre</div>
              <div className="text-xs font-semibold text-slate-800">Certificat de Bonne Vie et Mœurs</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-sky-900 font-mono tabular-nums">
                {montantCDF.toLocaleString('fr-FR')} CDF
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                ~ {montantUSD} USD
              </div>
            </div>
          </div>

          {step === 'selection' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Choisissez votre opérateur Mobile Money en RDC :
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {operators.map((op) => {
                    const isSelected = selectedOperateur === op.id;
                    return (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => setSelectedOperateur(op.id)}
                        className={`p-3 text-left rounded-xl border-2 transition-all flex flex-col justify-between ${
                          isSelected 
                            ? 'border-sky-600 bg-sky-50/50 shadow-xs ring-1 ring-sky-600/30' 
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs text-slate-900">{op.nom}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${op.badge}`}>
                            {op.code}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">{op.prefixHint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Numéro de téléphone du payeur
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="+243 81 000 0000"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Un push USSD interactif va être envoyé pour valider la transaction de {montantCDF.toLocaleString('fr-FR')} CDF.
                </p>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-2.5 bg-rose-50 text-rose-700 rounded-lg text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleInitiatePush}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connexion à la passerelle mobile...</span>
                  </>
                ) : (
                  <>
                    <span>Initier le paiement sécurisé</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'push_ussd' && (
            <div className="space-y-5 text-center py-2">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Smartphone className="w-7 h-7" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Notification USSD Push envoyée
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Une invite s’affiche sur le mobile <span className="font-mono font-semibold text-slate-800">{telephone}</span> ({selectedOperateur.toUpperCase()}).
                </p>
              </div>

              {/* Simulated Mobile Prompt */}
              <div className="bg-slate-900 text-white p-4 rounded-xl max-w-xs mx-auto text-left shadow-lg border border-slate-800 space-y-3">
                <div className="text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-1 flex justify-between">
                  <span>{selectedOperateur.toUpperCase()} RDC</span>
                  <span>USSD Flash</span>
                </div>
                <p className="text-xs text-slate-200">
                  Confirmez le paiement de <span className="font-bold text-amber-400">{montantCDF.toLocaleString()} CDF</span> à <span className="text-sky-300">DGRAD / CERT-RDC</span> ?
                </p>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Entrez votre code PIN secret :</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="****"
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-1.5 text-center text-sm font-mono tracking-widest text-amber-400 rounded focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => setStep('selection')}
                  className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Modifier le numéro
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleSimulatePin}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Validation en cours...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirmer le débit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'confirmed' && (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Paiement Validé avec Succès !
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                La quittance du Trésor Public DGRAD a été générée. Le dossier est immédiatement recevable pour l'instruction judiciaire.
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Quittance DGRAD certifiée</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
