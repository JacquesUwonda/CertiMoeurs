import React, { useState } from 'react';
import { useCertiStore } from '../../services/store';
import { DemandeCertificat } from '../../types';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Clock, 
  ShieldCheck, 
  UserCheck, 
  FileCheck,
  Send,
  HelpCircle,
  Building,
  Filter,
  Scan
} from 'lucide-react';

export const InstructorPortal: React.FC = () => {
  const { 
    demandes, 
    agentPrendreEnCharge, 
    agentVerifierCasier, 
    agentDemanderComplement, 
    agentProposerDecision 
  } = useCertiStore();

  const [selectedDemandeId, setSelectedDemandeId] = useState<string>(demandes[1]?.id || demandes[0]?.id);
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active instructor identity
  const agentNom = 'Dieudonné MBAYA';
  const agentId = 'AGT-042';

  // Action states for selected application
  const [casierMention, setCasierMention] = useState<'NEANT' | 'CONDAMNATION_EXISTANTE'>('NEANT');
  const [casierRegistre, setCasierRegistre] = useState(`REG-CASIER-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [isVerifyingCasier, setIsVerifyingCasier] = useState(false);

  const [complementMotif, setComplementMotif] = useState('');
  const [showComplementForm, setShowComplementForm] = useState(false);

  const [avisPropose, setAvisPropose] = useState<'FAVORABLE' | 'DEFAVORABLE'>('FAVORABLE');
  const [noteInstruction, setNoteInstruction] = useState('');
  const [isSubmittingAvis, setIsSubmittingAvis] = useState(false);

  // Filter list
  const filteredDemandes = demandes.filter(d => {
    if (filterStatut !== 'all' && d.statutActuel !== filterStatut) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = d.numeroReference.toLowerCase().includes(q) ||
        d.demandeur.nom.toLowerCase().includes(q) ||
        d.demandeur.prenom.toLowerCase().includes(q) ||
        d.demandeur.villeProvince.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const activeDemande = demandes.find(d => d.id === selectedDemandeId);

  const handlePrendreEnCharge = (id: string) => {
    agentPrendreEnCharge(id, agentNom, agentId);
  };

  const handleRecordCasier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDemande) return;
    setIsVerifyingCasier(true);
    setTimeout(() => {
      agentVerifierCasier(
        activeDemande.id, 
        agentNom, 
        casierMention, 
        casierRegistre, 
        `Parquet de Grande Instance de ${activeDemande.demandeur.villeProvince}`
      );
      setIsVerifyingCasier(false);
    }, 700);
  };

  const handleDemanderComplement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDemande || !complementMotif.trim()) return;
    agentDemanderComplement(activeDemande.id, agentNom, complementMotif, ['Pièce justificative requise']);
    setComplementMotif('');
    setShowComplementForm(false);
  };

  const handleProposerAvis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDemande) return;
    setIsSubmittingAvis(true);
    setTimeout(() => {
      agentProposerDecision(
        activeDemande.id, 
        agentNom, 
        avisPropose, 
        noteInstruction || `Instruction conforme aux vérifications du greffe. Avis ${avisPropose.toLowerCase()} recommandé.`
      );
      setIsSubmittingAvis(false);
      setNoteInstruction('');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-sky-100 text-sky-800 rounded">
              ROLE : AGENT INSTRUCTEUR
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-600 font-semibold">{agentNom} (Matricule {agentId})</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight mt-1 font-display">
            Espace d'Instruction Administrative & Judiciaire
          </h1>
          <p className="text-xs text-slate-500">
            Contrôle de complétude, consultation du casier judiciaire central et formulation des avis motivés (BPMN TO BE).
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total dossiers</div>
            <div className="text-base font-black text-slate-900 font-mono tabular-nums">{demandes.length}</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl text-center">
            <div className="text-[10px] text-amber-700 uppercase font-semibold">À instruire</div>
            <div className="text-base font-black text-amber-900 font-mono tabular-nums">
              {demandes.filter(d => d.statutActuel === 'soumis' || d.statutActuel === 'en_cours_instruction').length}
            </div>
          </div>
        </div>
      </div>

      {/* Main split view: Queue list on left, File details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Dossier Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                File d'attente ({filteredDemandes.length})
              </span>
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterStatut}
                  onChange={(e) => setFilterStatut(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="soumis">Nouveaux (Soumis)</option>
                  <option value="en_cours_instruction">En cours</option>
                  <option value="complement_requis">Complément requis</option>
                  <option value="avis_favorable">Avis émis</option>
                  <option value="approuve">Délivrés</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrer par nom, référence..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {filteredDemandes.map((dem) => {
                const isSelected = dem.id === selectedDemandeId;
                return (
                  <div
                    key={dem.id}
                    onClick={() => setSelectedDemandeId(dem.id)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-sky-600 bg-sky-50/60 shadow-xs ring-1 ring-sky-600/30' 
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono font-bold text-slate-900">{dem.numeroReference}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        dem.statutActuel === 'approuve' ? 'bg-emerald-100 text-emerald-800' :
                        dem.statutActuel === 'complement_requis' ? 'bg-amber-100 text-amber-800' :
                        dem.statutActuel === 'en_cours_instruction' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {dem.statutActuel.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="font-semibold text-slate-800">
                      {dem.demandeur.nom} {dem.demandeur.prenom}
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-1">
                      <span>{dem.demandeur.commune} ({dem.demandeur.villeProvince})</span>
                      <span>·</span>
                      <span>{dem.demandeur.motifDemande}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                      <span>Reçu le {new Date(dem.dateCreation).toLocaleDateString('fr-FR')}</span>
                      <span className="font-mono text-emerald-700 font-medium">
                        Bio: {dem.biometrie?.scoreConcordance ? `${dem.biometrie.scoreConcordance}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Instruction Workbench */}
        <div className="lg:col-span-7">
          {activeDemande ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
              
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-mono text-slate-400">DOSSIER D'INSTRUCTION N°</span>
                  <div className="text-lg font-black font-mono text-slate-900">
                    {activeDemande.numeroReference}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Déposé le {new Date(activeDemande.dateCreation).toLocaleString('fr-FR')} ({activeDemande.modeDepot === 'guichet_assiste' ? 'Guichet Assisté' : 'Portail Web'})
                  </div>
                </div>

                <div>
                  {activeDemande.statutActuel === 'soumis' && (
                    <button
                      onClick={() => handlePrendreEnCharge(activeDemande.id)}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                    >
                      Prendre en charge l'instruction
                    </button>
                  )}
                  {activeDemande.instructions?.nomAgent && (
                    <div className="text-right text-xs">
                      <span className="text-slate-400 block">Agent assigné :</span>
                      <span className="font-semibold text-slate-800">{activeDemande.instructions.nomAgent}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Demandeur Profile */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Identité & Résidence du Demandeur
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Nom Complet :</span>
                    <div className="font-bold text-slate-900">{activeDemande.demandeur.nom} {activeDemande.demandeur.postnom} {activeDemande.demandeur.prenom}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Date & Lieu Naiss. :</span>
                    <div className="font-medium text-slate-800">{activeDemande.demandeur.dateNaissance} ({activeDemande.demandeur.lieuNaissance})</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Nationalité / Sexe :</span>
                    <div className="font-medium text-slate-800">{activeDemande.demandeur.nationalite} · {activeDemande.demandeur.sexe === 'M' ? 'Masculin' : 'Féminin'}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">N° Pièce Identité :</span>
                    <div className="font-mono font-semibold text-slate-900">{activeDemande.demandeur.numeroNationalIdentite}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Adresse :</span>
                    <div className="font-medium text-slate-800">{activeDemande.demandeur.adresse}, {activeDemande.demandeur.commune}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Téléphone Mobile :</span>
                    <div className="font-mono font-medium text-slate-800">{activeDemande.demandeur.telephone}</div>
                  </div>
                </div>
              </div>

              {/* Biometrics & Payment status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Biometrics check */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Scan className="w-4 h-4 text-sky-600" />
                      <span>Contrôle Biométrique</span>
                    </span>
                    {activeDemande.biometrie?.effectuee ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        CONFORME
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        EN ATTENTE
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600">
                    Vivacité vérifiée : <strong className="text-emerald-700">Oui (Clignement + Sourire)</strong>
                  </div>
                  <div className="text-xs text-slate-600">
                    Concordance faciale : <strong className="font-mono text-slate-900">{activeDemande.biometrie?.scoreConcordance || '97.2'}%</strong>
                  </div>
                </div>

                {/* Mobile payment check */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>Quittance Trésor Public (DGRAD)</span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      PAYÉ
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Opérateur : <strong className="uppercase">{activeDemande.paiement.operateur}</strong> ({activeDemande.paiement.montantCDF.toLocaleString()} CDF)
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    Réf: {activeDemande.paiement.referenceQuittance || 'QUIT-DGRAD-2026-00918'}
                  </div>
                </div>
              </div>

              {/* Uploaded Documents Review */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Pièces Jointes Téléversées ({activeDemande.piecesJointes.length})
                </h3>
                <div className="space-y-2">
                  {activeDemande.piecesJointes.map((p) => (
                    <div key={p.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-sky-600" />
                        <div>
                          <span className="font-semibold text-slate-800">{p.nomFichier}</span>
                          <span className="text-slate-400 font-mono text-[10px] ml-2">({p.taille})</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        p.statut === 'valide' ? 'bg-emerald-100 text-emerald-800' :
                        p.statut === 'rejete' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.statut}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Casier Judiciaire Check Action */}
              <div className="p-5 rounded-2xl border border-sky-100 bg-sky-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-sky-700" />
                    <h3 className="text-xs font-bold text-sky-950 uppercase tracking-wider">
                      Contrôle du Casier Judiciaire Central / Parquet
                    </h3>
                  </div>
                  {activeDemande.instructions?.verificationCasier?.effectue && (
                    <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      ENQUÊTE EFFECTUÉE
                    </span>
                  )}
                </div>

                {activeDemande.instructions?.verificationCasier?.effectue ? (
                  <div className="bg-white p-3.5 rounded-xl border border-sky-200 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mention au casier :</span>
                      <strong className={`font-mono ${activeDemande.instructions.verificationCasier.mentionCasier === 'NEANT' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {activeDemande.instructions.verificationCasier.mentionCasier}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Registre du parquet :</span>
                      <span className="font-mono text-slate-800">{activeDemande.instructions.verificationCasier.registreRef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date d'interrogation :</span>
                      <span className="text-slate-600">{new Date(activeDemande.instructions.verificationCasier.dateVerification).toLocaleString('fr-FR')}</span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleRecordCasier} className="space-y-3">
                    <p className="text-xs text-slate-600">
                      Interrogez le registre du casier judiciaire central et enregistrez la mention légale constatée :
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Mention du Bulletin N°2</label>
                        <select
                          value={casierMention}
                          onChange={(e) => setCasierMention(e.target.value as any)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
                        >
                          <option value="NEANT">NÉANT (Aucune condamnation infamante)</option>
                          <option value="CONDAMNATION_EXISTANTE">CONDAMNATION EXISTANTE</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Référence Registre Parquet</label>
                        <input
                          type="text"
                          value={casierRegistre}
                          onChange={(e) => setCasierRegistre(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifyingCasier}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-700 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold shadow-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isVerifyingCasier ? 'Enregistrement...' : 'Certifier l’enquête de casier judiciaire'}</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Action Buttons: Demander Complément or Proposer Avis */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Conclusion de l'Instruction (BPMN TO BE)
                  </h3>

                  <button
                    onClick={() => setShowComplementForm(!showComplementForm)}
                    className="text-xs text-amber-700 hover:text-amber-800 font-semibold underline"
                  >
                    {showComplementForm ? 'Annuler la demande de complément' : 'Demander un complément au citoyen'}
                  </button>
                </div>

                {showComplementForm && (
                  <form onSubmit={handleDemanderComplement} className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-3">
                    <label className="text-xs font-semibold text-amber-900 block">
                      Motif de la demande de complément (Sera notifié au demandeur) :
                    </label>
                    <textarea
                      rows={2}
                      value={complementMotif}
                      onChange={(e) => setComplementMotif(e.target.value)}
                      placeholder="Ex: La photo d'identité est floue ou l'attestation de résidence a expiré..."
                      className="w-full p-2.5 text-xs bg-white border border-amber-200 rounded-lg focus:outline-none focus:border-amber-500"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      Envoyer la demande de complément
                    </button>
                  </form>
                )}

                {/* Form to submit Avis to Valideur */}
                <form onSubmit={handleProposerAvis} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Avis d'instruction proposé au magistrat :</label>
                      <select
                        value={avisPropose}
                        onChange={(e) => setAvisPropose(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 font-bold"
                      >
                        <option value="FAVORABLE">AVIS FAVORABLE (Délivrance recommandée)</option>
                        <option value="DEFAVORABLE">AVIS DÉFAVORABLE (Rejet motivé)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Note d'instruction synthétique :</label>
                      <input
                        type="text"
                        value={noteInstruction}
                        onChange={(e) => setNoteInstruction(e.target.value)}
                        placeholder="Ex: Dossier régulier, casier néant, concordance biométrique 97.4%."
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingAvis}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>Transmettre le dossier instruit au Responsable Valideur</span>
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
              Sélectionnez un dossier dans la file d'attente pour commencer l'instruction.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
