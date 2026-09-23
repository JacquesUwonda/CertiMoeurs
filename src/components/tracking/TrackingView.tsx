import React, { useState } from 'react';
import { useCertiStore } from '../../services/store';
import { DemandeCertificat, PieceJointe } from '../../types';
import { CertificateDocument } from '../certificate/CertificateDocument';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  UploadCloud, 
  ShieldCheck, 
  CreditCard, 
  Scan, 
  ChevronRight,
  Printer,
  ArrowLeft
} from 'lucide-react';

interface TrackingViewProps {
  initialDemande?: DemandeCertificat;
  onBack?: () => void;
}

export const TrackingView: React.FC<TrackingViewProps> = ({
  initialDemande,
  onBack
}) => {
  const { demandes, citoyenDeposerComplement } = useCertiStore();
  const [searchQuery, setSearchQuery] = useState(initialDemande?.numeroReference || '');
  const [selectedDemande, setSelectedDemande] = useState<DemandeCertificat | null>(initialDemande || null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Complement upload state
  const [complementNote, setComplementNote] = useState('');
  const [complementFileName, setComplementFileName] = useState('');
  const [isSubmittingComplement, setIsSubmittingComplement] = useState(false);
  const [complementSuccess, setComplementSuccess] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();
    const found = demandes.find(d => 
      d.numeroReference.toLowerCase() === query ||
      d.id.toLowerCase() === query ||
      d.demandeur.telephone.replace(/\s+/g, '') === query.replace(/\s+/g, '') ||
      d.demandeur.numeroNationalIdentite.toLowerCase() === query ||
      (d.certificat && d.certificat.numeroCertificat.toLowerCase() === query)
    );

    if (found) {
      setSelectedDemande(found);
      setComplementSuccess(false);
    } else {
      setSelectedDemande(null);
    }
  };

  const handleSendComplement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDemande) return;

    setIsSubmittingComplement(true);
    const newPiece: PieceJointe = {
      id: `pj-compl-${Date.now()}`,
      type: 'complement',
      nomFichier: complementFileName || 'document_complementaire_citoyen.pdf',
      dateUpload: new Date().toISOString(),
      statut: 'valide',
      taille: '1.2 Mo',
      empreinteHash: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
    };

    setTimeout(() => {
      citoyenDeposerComplement(selectedDemande.id, [newPiece], complementNote);
      setIsSubmittingComplement(false);
      setComplementSuccess(true);
      // Refresh local reference
      const refreshed = demandes.find(d => d.id === selectedDemande.id);
      if (refreshed) setSelectedDemande(refreshed);
    }, 1000);
  };

  // BPMN Stepper logic
  const getStepStatus = (stepKey: string) => {
    if (!selectedDemande) return 'pending';
    const st = selectedDemande.statutActuel;

    switch (stepKey) {
      case 'depot':
        return 'completed';
      case 'biometrie':
        return selectedDemande.biometrie?.effectuee ? 'completed' : 'pending';
      case 'paiement':
        return selectedDemande.paiement?.statut === 'paye' ? 'completed' : 'pending';
      case 'instruction':
        if (st === 'en_cours_instruction' || st === 'verification_judiciaire' || st === 'complement_requis') return 'current';
        if (st === 'avis_favorable' || st === 'avis_defavorable' || st === 'approuve' || st === 'rejete') return 'completed';
        return 'pending';
      case 'validation':
        if (st === 'approuve') return 'completed';
        if (st === 'rejete') return 'rejected';
        if (st === 'avis_favorable' || st === 'avis_defavorable') return 'current';
        return 'pending';
      default:
        return 'pending';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Search */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg mr-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <h2 className="text-base font-bold text-slate-900 tracking-tight font-display">
                Suivi du Dossier de Bonne Vie et Mœurs
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Consultez l'historique officiel et l'instruction en temps réel selon les règles RG01 à RG06.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Numéro de référence (ex: CBVM-2026-KIN-001842) ou N° téléphone..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-xs shrink-0"
          >
            Rechercher
          </button>
        </form>
      </div>

      {/* Selected Demande Details */}
      {selectedDemande ? (
        <div className="space-y-6">
          {/* Main Status Header Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-mono text-slate-400">RÉFÉRENCE UNIQUE HORODATÉE (RG01)</span>
                <div className="text-lg font-black font-mono text-slate-900">
                  {selectedDemande.numeroReference}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] text-slate-400 block">STATUT ACTUEL</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  selectedDemande.statutActuel === 'approuve' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : selectedDemande.statutActuel === 'rejete' 
                    ? 'bg-rose-100 text-rose-800' 
                    : selectedDemande.statutActuel === 'complement_requis'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-sky-100 text-sky-800'
                }`}>
                  {selectedDemande.statutActuel === 'approuve' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {selectedDemande.statutActuel === 'rejete' && <AlertCircle className="w-3.5 h-3.5" />}
                  {selectedDemande.statutActuel === 'complement_requis' && <Clock className="w-3.5 h-3.5" />}
                  <span className="capitalize">{selectedDemande.statutActuel.replace(/_/g, ' ')}</span>
                </span>
              </div>
            </div>

            {/* Stepper BPMN Visual */}
            <div className="py-2">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                {[
                  { id: 'depot', label: '1. Dépôt & Pièces' },
                  { id: 'biometrie', label: '2. Biométrie' },
                  { id: 'paiement', label: '3. Quittance Mobile' },
                  { id: 'instruction', label: '4. Casier Judiciaire' },
                  { id: 'validation', label: '5. Délivrance Sceau' }
                ].map((st) => {
                  const state = getStepStatus(st.id);
                  return (
                    <div
                      key={st.id}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        state === 'completed'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : state === 'current'
                          ? 'bg-sky-50 border-sky-300 text-sky-900 shadow-2xs ring-2 ring-sky-200'
                          : state === 'rejected'
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      {st.label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Demandeur summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400">Demandeur :</span>
                <div className="font-semibold text-slate-800">
                  {selectedDemande.demandeur.nom} {selectedDemande.demandeur.postnom} {selectedDemande.demandeur.prenom}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Commune / Ville :</span>
                <div className="font-semibold text-slate-800">
                  {selectedDemande.demandeur.commune}, {selectedDemande.demandeur.villeProvince}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Motif administratif :</span>
                <div className="font-semibold text-slate-800">
                  {selectedDemande.demandeur.motifDemande}
                </div>
              </div>
            </div>
          </div>

          {/* Action Callout if Approved */}
          {selectedDemande.statutActuel === 'approuve' && selectedDemande.certificat && (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">
                    Votre Certificat est Disponible et Scellé !
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Certificat N° <span className="font-mono font-bold">{selectedDemande.certificat.numeroCertificat}</span> délivré par {selectedDemande.certificat.autoriteEmettrice}.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCertificateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md transition-all shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Voir le certificat & Imprimer PDF</span>
              </button>
            </div>
          )}

          {/* Action Callout if Rejected */}
          {selectedDemande.statutActuel === 'rejete' && (
            <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl space-y-3">
              <div className="flex items-center gap-2.5 text-rose-900 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>Demande de certificat rejetée par l'autorité</span>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                <strong>Motif de la décision :</strong> {selectedDemande.decision?.motif || 'Non conformité ou antécédent judiciaire incompatible.'}
              </p>
              <div className="p-3 bg-white/80 rounded-xl border border-rose-200 text-xs text-slate-700">
                <span className="font-semibold text-rose-900">Voies de recours :</span>{' '}
                {selectedDemande.decision?.voiesRecours || 'Recours gracieux possible sous 30 jours devant le Procureur de la République.'}
              </div>
            </div>
          )}

          {/* Action Callout if Complement is requested */}
          {selectedDemande.statutActuel === 'complement_requis' && (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span>Action requise : Complément de dossier demandé par l'instructeur</span>
              </div>
              <p className="text-xs text-amber-800">
                <strong>Motif du complément :</strong> {selectedDemande.instructions?.complementDemande?.motif || 'Une pièce d’identité ou justificatif requiert une nouvelle transmission.'}
              </p>

              {complementSuccess ? (
                <div className="bg-emerald-100 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Complément transmis à l'instructeur avec succès ! Le dossier repasse en cours d'instruction.</span>
                </div>
              ) : (
                <form onSubmit={handleSendComplement} className="space-y-3 bg-white p-4 rounded-xl border border-amber-200">
                  <h4 className="text-xs font-bold text-slate-800">
                    Déposer la pièce rectificative :
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nom du fichier</label>
                      <input
                        type="text"
                        placeholder="Ex: nouvelle_photo_passeport.jpg"
                        value={complementFileName}
                        onChange={(e) => setComplementFileName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Explication pour l'agent instructeur</label>
                      <input
                        type="text"
                        placeholder="Ex: Photo refaite en studio sur fond blanc uni."
                        value={complementNote}
                        onChange={(e) => setComplementNote(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingComplement}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Transmettre le complément</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Audit History Timeline (RG04) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-display">
              Journal d'Instruction & Traçabilité Horodatée (RG01 - RG04)
            </h3>

            <div className="space-y-3">
              {selectedDemande.historiqueStatuts.map((item, idx) => (
                <div key={item.id || idx} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                  <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex flex-wrap justify-between items-center gap-1 mb-1">
                      <span className="font-semibold text-slate-900">{item.auteur} ({item.roleAuteur})</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.dateChangement).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{item.commentaire}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : searchQuery ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">Aucun dossier trouvé</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Vérifiez le numéro de référence (ex: <code className="font-mono text-slate-700">CBVM-2026-KIN-001842</code>) ou saisissez le numéro de téléphone utilisé lors de la demande.
          </p>
        </div>
      ) : null}

      {/* Modal View for Certificate */}
      {showCertificateModal && selectedDemande && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-4 sm:p-8 flex items-center justify-center">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-100 rounded-2xl p-4">
            <CertificateDocument 
              demande={selectedDemande} 
              onClose={() => setShowCertificateModal(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
