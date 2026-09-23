import React, { useState } from 'react';
import { useCertiStore } from '../../services/store';
import { VerificationPubliqueResult } from '../../types';
import { RdcEmblem } from '../common/RdcEmblem';
import { 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  QrCode, 
  Building2, 
  Calendar,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const PublicVerificationPortal: React.FC = () => {
  const { verifierCertificatPublic } = useCertiStore();
  const [codeQuery, setCodeQuery] = useState('');
  const [result, setResult] = useState<VerificationPubliqueResult | null>(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!codeQuery.trim()) return;

    const res = verifierCertificatPublic(codeQuery.trim());
    setResult(res);
    setSearched(true);
  };

  const handleFillDemo = (demoRef: string) => {
    setCodeQuery(demoRef);
    const res = verifierCertificatPublic(demoRef);
    setResult(res);
    setSearched(true);
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Top Card */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-4">
        <div className="inline-flex items-center justify-center mx-auto">
          <RdcEmblem size="lg" />
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
            Vérification Publique d'Authenticité
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
            Portail dédié aux Ambassades, Employeurs, Banques et Établissements universitaires pour contrôler l'authenticité d'un Certificat de Bonne Vie et Mœurs délivré en RDC.
          </p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="max-w-lg mx-auto flex gap-2 pt-2">
          <div className="relative flex-1">
            <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={codeQuery}
              onChange={(e) => setCodeQuery(e.target.value)}
              placeholder="N° Certificat (ex: RDC-JUS-CBVM-2026-001842)..."
              className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            Vérifier le statut
          </button>
        </form>

        {/* Quick Demo Fillers */}
        <div className="pt-2 text-xs text-slate-500 flex flex-wrap items-center justify-center gap-2">
          <span>Exemples rapides :</span>
          <button
            type="button"
            onClick={() => handleFillDemo('RDC-JUS-CBVM-2026-001842')}
            className="text-[11px] font-mono text-sky-700 hover:underline bg-sky-50 px-2 py-0.5 rounded border border-sky-100"
          >
            RDC-JUS-CBVM-2026-001842 (Valide)
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('CBVM-2026-KIN-001842')}
            className="text-[11px] font-mono text-sky-700 hover:underline bg-sky-50 px-2 py-0.5 rounded border border-sky-100"
          >
            Par référence dossier
          </button>
        </div>
      </div>

      {/* Result Display */}
      {searched && (
        <div className="animate-in fade-in duration-200">
          {result?.trouve ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
              
              {/* Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    result.statut === 'VALIDE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {result.statut === 'VALIDE' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-slate-400">REGISTRE NATIONAL OFFICIEL</span>
                    <h2 className="text-base font-bold text-slate-900">
                      Document Authentique & Enregistré
                    </h2>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                    result.statut === 'VALIDE' 
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>STATUT : {result.statut}</span>
                  </span>
                </div>
              </div>

              {/* Minimized attributes (RG05: Le statut peut être contrôlé sans exposer de données excessives) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 block">Titulaire (Nom masqué RG05)</span>
                  <div className="text-sm font-bold text-slate-900 uppercase">
                    {result.nomCompletMasque}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 block">Numéro du Certificat</span>
                  <div className="text-sm font-mono font-bold text-sky-800">
                    {result.numeroCertificat}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 block">Date d'Émission</span>
                  <div className="font-semibold text-slate-800">
                    {formatDate(result.dateEmission)}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 block">Date d'Expiration Légale (3 mois)</span>
                  <div className="font-semibold text-slate-800">
                    {formatDate(result.dateExpiration)}
                  </div>
                </div>

                <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 block">Autorité Judiciaire Émettrice</span>
                  <div className="font-semibold text-slate-900">
                    {result.autoriteEmettrice} ({result.lieuDelivrance})
                  </div>
                </div>
              </div>

              {/* Cryptographic hash info */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Empreinte cryptographique de signature (SHA-256)</span>
                  </span>
                  <span className="text-emerald-400 font-bold">Intégrité Vérifiée</span>
                </div>
                <div className="font-mono text-[10px] text-sky-300 break-all bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  {result.empreinteSHA256}
                </div>
              </div>

              {/* Privacy mention according to RG05 */}
              <div className="text-[11px] text-slate-500 text-center leading-relaxed">
                Ce service protège la vie privée du titulaire selon les dispositions légales de la RDC. Seules les données strictes d'authenticité et de validité sont exposées aux tiers habilités.
              </div>
            </div>
          ) : (
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-rose-950">
                Aucun Certificat Officiel Correspondant Trouvé
              </h3>
              <p className="text-xs text-rose-700 max-w-md mx-auto">
                Le numéro ou code saisi ne correspond à aucun certificat délivré au Registre National des Certificats de Bonne Vie et Mœurs de la RDC. Attention aux tentatives de fraude documentaire.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Explanation of Security Shield */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-2">
        <h3 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          <span>Garantie de Sécurité Documentaire</span>
        </h3>
        <p className="leading-relaxed">
          Tout certificat de bonne vie et mœurs généré par cette plateforme intègre une signature électronique et un QR Code scellé relié à la base sécurisée du Ministère de la Justice. Toute tentative de contrefaçon est passible de sanctions conformément au Code Pénal Congolais.
        </p>
      </div>
    </div>
  );
};
