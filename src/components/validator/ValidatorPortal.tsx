import React, { useState } from 'react';
import { useCertiStore } from '../../services/store';
import { DemandeCertificat } from '../../types';
import { CertificateDocument } from '../certificate/CertificateDocument';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  FileText, 
  Lock, 
  Stamp, 
  UserCheck, 
  Scale,
  XCircle,
  FileCheck
} from 'lucide-react';

export const ValidatorPortal: React.FC = () => {
  const { demandes, responsableValiderEtDelivrer, responsableRejeter } = useCertiStore();

  const [selectedDemandeId, setSelectedDemandeId] = useState<string>(
    demandes.find(d => d.statutActuel === 'avis_favorable' || d.statutActuel === 'avis_defavorable')?.id || demandes[0]?.id
  );

  const [responsableNom, setResponsableNom] = useState('Jean-Pierre KALALA KABONGO');
  const [titreResponsable, setTitreResponsable] = useState('Officier du Ministère Public près le Parquet de Grande Instance');
  const [autoriteEmettrice, setAutoriteEmettrice] = useState('Ministère de la Justice - Parquet de Grande Instance de Kinshasa / Gombe');

  const [isSigning, setIsSigning] = useState(false);
  const [rejetMotif, setRejetMotif] = useState('');
  const [voiesRecours, setVoiesRecours] = useState('Recours gracieux sous 30 jours ouvrables devant le Procureur Général près la Cour d’Appel.');
  const [showRejetModal, setShowRejetModal] = useState(false);
  const [showPreviewCertificat, setShowPreviewCertificat] = useState(false);

  const dossiersAValider = demandes.filter(d => 
    d.statutActuel === 'avis_favorable' || 
    d.statutActuel === 'avis_defavorable' ||
    d.statutActuel === 'en_cours_instruction' ||
    d.statutActuel === 'approuve'
  );

  const activeDemande = demandes.find(d => d.id === selectedDemandeId);

  const handleValiderEtDelivrer = () => {
    if (!activeDemande) return;
    setIsSigning(true);

    setTimeout(() => {
      responsableValiderEtDelivrer(
        activeDemande.id,
        responsableNom,
        titreResponsable,
        autoriteEmettrice
      );
      setIsSigning(false);
    }, 1200);
  };

  const handleConfirmerRejet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDemande || !rejetMotif.trim()) return;

    responsableRejeter(
      activeDemande.id,
      responsableNom,
      titreResponsable,
      rejetMotif,
      voiesRecours
    );
    setShowRejetModal(false);
    setRejetMotif('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-100 text-amber-900 rounded">
              ROLE : RESPONSABLE VALIDEUR / MAGISTRAT
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-600 font-semibold">{responsableNom}</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight mt-1 font-display">
            Chambre de Validation & Délivrance des Certificats
          </h1>
          <p className="text-xs text-slate-500">
            Délégation de signature officielle, apposition du scellé cryptographique d'État et contrôle de légalité.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <Scale className="w-4 h-4 text-sky-700 shrink-0" />
          <span className="font-semibold text-slate-700">{titreResponsable}</span>
        </div>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Dossiers in validation queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Dossiers soumis à décision ({dossiersAValider.length})
              </span>
            </div>

            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {dossiersAValider.map((dem) => {
                const isSelected = dem.id === selectedDemandeId;
                const isPendingDecision = dem.statutActuel === 'avis_favorable' || dem.statutActuel === 'avis_defavorable';
                return (
                  <div
                    key={dem.id}
                    onClick={() => setSelectedDemandeId(dem.id)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-amber-600 bg-amber-50/50 shadow-xs ring-1 ring-amber-600/30' 
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono font-bold text-slate-900">{dem.numeroReference}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        dem.statutActuel === 'approuve' ? 'bg-emerald-100 text-emerald-800' :
                        dem.statutActuel === 'avis_favorable' ? 'bg-sky-100 text-sky-800 animate-pulse' :
                        dem.statutActuel === 'avis_defavorable' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {dem.statutActuel === 'avis_favorable' ? 'Avis favorable (À signer)' : dem.statutActuel.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="font-semibold text-slate-800">
                      {dem.demandeur.nom} {dem.demandeur.prenom}
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-1">
                      <span>{dem.demandeur.commune}</span>
                      <span>·</span>
                      <span>{dem.demandeur.motifDemande}</span>
                    </div>

                    {isPendingDecision && (
                      <div className="text-[11px] text-amber-800 bg-amber-100/70 p-1.5 rounded-md mt-2 font-medium">
                        Instructeur : {dem.instructions?.nomAgent || 'Dieudonné MBAYA'} · Avis : <strong>{dem.instructions?.avisPropose}</strong>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Validation Workbench */}
        <div className="lg:col-span-7">
          {activeDemande ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              
              {/* Status Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-mono text-slate-400">DOSSIER SOUMIS À DÉCISION</span>
                  <div className="text-lg font-black font-mono text-slate-900">
                    {activeDemande.numeroReference}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">AVIS DE L'INSTRUCTEUR</span>
                  <span className={`inline-flex items-center gap-1 font-bold text-xs ${
                    activeDemande.instructions?.avisPropose === 'FAVORABLE' ? 'text-emerald-700' : 'text-slate-700'
                  }`}>
                    {activeDemande.instructions?.avisPropose === 'FAVORABLE' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : null}
                    <span>{activeDemande.instructions?.avisPropose || 'Instruction en cours'}</span>
                  </span>
                </div>
              </div>

              {/* Demandeur summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-900 text-sm">
                  {activeDemande.demandeur.nom} {activeDemande.demandeur.postnom} {activeDemande.demandeur.prenom}
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>Né(e) le : <strong className="text-slate-800">{activeDemande.demandeur.dateNaissance}</strong> à {activeDemande.demandeur.lieuNaissance}</div>
                  <div>Pièce : <strong className="text-slate-800 font-mono">{activeDemande.demandeur.numeroNationalIdentite}</strong></div>
                  <div>Résidence : <strong className="text-slate-800">{activeDemande.demandeur.adresse}, {activeDemande.demandeur.commune}</strong></div>
                  <div>Nationalité : <strong className="text-slate-800">{activeDemande.demandeur.nationalite}</strong></div>
                </div>
              </div>

              {/* Instructor Findings & Criminal Record Check */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2 text-xs">
                <div className="flex items-center justify-between text-emerald-900 font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Rapport de Conformité de l'Instructeur</span>
                  </span>
                  <span className="font-mono text-[11px]">Score Biométrique : {activeDemande.biometrie?.scoreConcordance}%</span>
                </div>
                <div className="text-slate-700">
                  Casier judiciaire : <strong className="text-emerald-800">NÉANT (Aucun antécédent judiciaire infamant)</strong>
                </div>
                <div className="text-slate-600 italic">
                  Note d'instruction : "{activeDemande.instructions?.noteInstruction || 'Dossier complet, conforme aux exigences légales.'}"
                </div>
              </div>

              {/* Decision Section */}
              {activeDemande.statutActuel === 'approuve' ? (
                <div className="bg-emerald-50 border border-emerald-300 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Certificat Officiel Déjà Délivré et Signé Numériquement</span>
                  </div>
                  <div className="text-xs text-emerald-800">
                    N° Certificat : <span className="font-mono font-bold">{activeDemande.certificat?.numeroCertificat}</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Signé par : <strong>{activeDemande.certificat?.signataireNom}</strong> ({activeDemande.certificat?.signataireQualite})
                  </div>
                  <button
                    onClick={() => setShowPreviewCertificat(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Visualiser le certificat délivré</span>
                  </button>
                </div>
              ) : activeDemande.statutActuel === 'rejete' ? (
                <div className="bg-rose-50 border border-rose-300 p-5 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>Demande Rejetée</span>
                  </div>
                  <p className="text-rose-800"><strong>Motif :</strong> {activeDemande.decision?.motif}</p>
                  <p className="text-slate-600"><strong>Voies de recours :</strong> {activeDemande.decision?.voiesRecours}</p>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Décision de l'Autorité Compétente
                  </h3>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleValiderEtDelivrer}
                      disabled={isSigning}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all scale-100 hover:scale-102 disabled:opacity-50"
                    >
                      <Stamp className="w-4 h-4" />
                      <span>{isSigning ? 'Apposition du scellé numérique...' : 'Valider & Délivrer le Certificat (Signature)'}</span>
                    </button>

                    <button
                      onClick={() => setShowRejetModal(true)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Rejeter avec motif légal</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
              Sélectionnez un dossier pour examen.
            </div>
          )}
        </div>

      </div>

      {/* Rejet Modal */}
      {showRejetModal && activeDemande && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Rejet Officiel de la Demande ({activeDemande.numeroReference})</span>
            </h3>

            <form onSubmit={handleConfirmerRejet} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Motif formel du rejet (Obligatoire) *</label>
                <textarea
                  rows={3}
                  value={rejetMotif}
                  onChange={(e) => setRejetMotif(e.target.value)}
                  placeholder="Ex: Condamnation infamante constatée au registre pénal du Parquet..."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Voies de recours légal</label>
                <input
                  type="text"
                  value={voiesRecours}
                  onChange={(e) => setVoiesRecours(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejetModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  Confirmer le rejet motivé
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Certificate Modal */}
      {showPreviewCertificat && activeDemande && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-4 sm:p-8 flex items-center justify-center">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-100 rounded-2xl p-4">
            <CertificateDocument 
              demande={activeDemande} 
              onClose={() => setShowPreviewCertificat(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
