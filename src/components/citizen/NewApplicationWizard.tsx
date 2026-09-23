import React, { useState } from 'react';
import { useCertiStore } from '../../services/store';
import { 
  DemandeCertificat, 
  PieceJointe, 
  TypePieceIdentite, 
  VerificationBiometrique, 
  PaiementMobile 
} from '../../types';
import { BiometricVerificationModal } from '../biometrics/BiometricVerificationModal';
import { MobilePaymentModal } from '../payment/MobilePaymentModal';
import { 
  User, 
  UploadCloud, 
  Scan, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  FileText, 
  Trash2, 
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

interface NewApplicationWizardProps {
  onSuccess: (demande: DemandeCertificat) => void;
  onCancel: () => void;
  isAssistedKiosk?: boolean;
}

export const NewApplicationWizard: React.FC<NewApplicationWizardProps> = ({
  onSuccess,
  onCancel,
  isAssistedKiosk = false
}) => {
  const { parametres, creerDemande, currentUser } = useCertiStore();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nom: currentUser?.role === 'citoyen' ? currentUser.nom : '',
    postnom: '',
    prenom: currentUser?.role === 'citoyen' ? currentUser.prenom : '',
    dateNaissance: '1995-05-12',
    lieuNaissance: 'Kinshasa',
    sexe: 'M' as 'M' | 'F',
    etatCivil: 'Célibataire' as 'Célibataire' | 'Marié(e)' | 'Divorcé(e)' | 'Veuf(ve)',
    nationalite: 'Congolaise' as const,
    numeroNationalIdentite: '',
    typePieceIdentite: 'carte_electeur' as TypePieceIdentite,
    adresse: '',
    commune: 'Gombe',
    villeProvince: 'Kinshasa',
    telephone: currentUser?.role === 'citoyen' && currentUser.telephone ? currentUser.telephone : '+243 81 ',
    email: currentUser?.role === 'citoyen' ? currentUser.email : '',
    profession: '',
    motifDemande: 'Emploi' as 'Emploi' | 'Études / Bourse' | 'Voyage / Visa' | 'Mariage' | 'Concours Administratif' | 'Autre',
    motifPrecision: ''
  });

  React.useEffect(() => {
    if (currentUser && currentUser.role === 'citoyen') {
      setFormData(prev => ({
        ...prev,
        nom: prev.nom || currentUser.nom,
        prenom: prev.prenom || currentUser.prenom,
        email: prev.email || currentUser.email,
        telephone: prev.telephone && prev.telephone !== '+243 81 ' ? prev.telephone : (currentUser.telephone || '+243 81 ')
      }));
    }
  }, [currentUser]);

  // Pieces jointes
  const [pieces, setPieces] = useState<PieceJointe[]>([
    {
      id: 'pj-init-ceni',
      type: 'piece_identite',
      nomFichier: 'piece_identite_ceni.pdf',
      dateUpload: new Date().toISOString(),
      statut: 'valide',
      taille: '1.2 Mo',
      empreinteHash: 'a71829bc019283fae'
    },
    {
      id: 'pj-init-photo',
      type: 'photo_identite',
      nomFichier: 'photo_passeport_fond_blanc.jpg',
      dateUpload: new Date().toISOString(),
      statut: 'valide',
      taille: '540 Ko',
      empreinteHash: 'bc9018274fe9012da'
    },
    {
      id: 'pj-init-residence',
      type: 'attestation_residence',
      nomFichier: 'certificat_residence_commune.pdf',
      dateUpload: new Date().toISOString(),
      statut: 'valide',
      taille: '890 Ko',
      empreinteHash: 'fe01928374ba9182c'
    }
  ]);

  // Biometrics & Payment state
  const [biometrie, setBiometrie] = useState<VerificationBiometrique | undefined>(undefined);
  const [paiement, setPaiement] = useState<PaiementMobile>({
    statut: 'non_initie',
    operateur: 'mpesa',
    numeroTelephone: '',
    montantCDF: 25000,
    montantUSD: 10,
    referenceTransaction: ''
  });

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [createdDemande, setCreatedDemande] = useState<DemandeCertificat | null>(null);

  // Active province configuration
  const currentParam = parametres.find(p => p.province.toLowerCase() === formData.villeProvince.toLowerCase()) || parametres[0];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (prov: string) => {
    const found = parametres.find(p => p.province === prov);
    if (found) {
      setFormData(prev => ({
        ...prev,
        villeProvince: prov,
        commune: found.communes[0] || 'Centre'
      }));
      setPaiement(prev => ({
        ...prev,
        montantCDF: found.montantTaxeCDF,
        montantUSD: Math.round(found.montantTaxeCDF / 2500)
      }));
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const errors: string[] = [];
    if (!formData.nom.trim()) errors.push('Le nom de famille est obligatoire');
    if (!formData.prenom.trim()) errors.push('Le prénom est obligatoire');
    if (!formData.numeroNationalIdentite.trim()) errors.push('Le numéro de la pièce d’identité est obligatoire');
    if (!formData.adresse.trim()) errors.push('L’adresse de résidence est obligatoire');
    if (!formData.telephone.trim() || formData.telephone.length < 9) errors.push('Le numéro de téléphone valide est obligatoire');
    setFormErrors(errors);
    return errors.length === 0;
  };

  // Step 2 Validation: Check completeness (RG02)
  const validateStep2 = () => {
    const hasPiece = pieces.some(p => p.type === 'piece_identite');
    const hasPhoto = pieces.some(p => p.type === 'photo_identite');
    const hasResidence = pieces.some(p => p.type === 'attestation_residence');

    const errors: string[] = [];
    if (!hasPiece) errors.push('La pièce d’identité (Carte d’électeur / Passeport) est manquante');
    if (!hasPhoto) errors.push('La photo d’identité récente est manquante');
    if (!hasResidence) errors.push('Le certificat ou attestation de résidence est manquant');

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleAddSimulatedFile = (type: PieceJointe['type'], nomFichier: string) => {
    const newPiece: PieceJointe = {
      id: `pj-${Date.now()}`,
      type,
      nomFichier,
      dateUpload: new Date().toISOString(),
      statut: 'valide',
      taille: `${(0.8 + Math.random() * 1.5).toFixed(1)} Mo`,
      empreinteHash: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
    };
    setPieces(prev => [...prev.filter(p => p.type !== type), newPiece]);
  };

  const handleRemoveFile = (id: string) => {
    setPieces(prev => prev.filter(p => p.id !== id));
  };

  const handleFinalSubmit = async () => {
    // RG01: Toute demande reçoit un identifiant unique, un horodatage et un statut initial
    const nouvelle = await creerDemande({
      statutActuel: 'soumis',
      modeDepot: isAssistedKiosk ? 'guichet_assiste' : 'en_ligne',
      demandeur: formData,
      piecesJointes: pieces,
      biometrie,
      paiement
    });

    setCreatedDemande(nouvelle);
    setCurrentStep(5);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Wizard Progress Stepper */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs mb-6">
        <div className="flex items-center justify-between">
          {[
            { num: 1, title: 'Identité', icon: User },
            { num: 2, title: 'Pièces', icon: UploadCloud },
            { num: 3, title: 'Biométrie', icon: Scan },
            { num: 4, title: 'Paiement', icon: CreditCard },
            { num: 5, title: 'Dépôt', icon: CheckCircle2 }
          ].map((st, idx) => {
            const Icon = st.icon;
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;
            return (
              <div key={st.num} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-sky-600 text-white shadow-md ring-4 ring-sky-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[11px] mt-1.5 font-medium hidden sm:block ${isCurrent ? 'text-sky-700 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                    {st.title}
                  </span>
                </div>
                {idx < 4 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-colors ${
                      currentStep > st.num ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error messages if any */}
      {formErrors.length > 0 && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl">
          <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs mb-1">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Veuillez compléter les informations requises avant de poursuivre (Règle RG02) :</span>
          </div>
          <ul className="list-disc list-inside text-xs text-rose-700 space-y-0.5">
            {formErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* STEP 1: INFORMATIONS D'IDENTITÉ */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight font-display">
              1. Informations du Demandeur & Localisation
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Renseignez vos coordonnées exactes telles qu'inscrites sur vos pièces d'identité officielles de la RDC.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nom de famille *</label>
              <input
                type="text"
                name="nom"
                placeholder="Ex: MUKENDI"
                value={formData.nom}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Post-nom</label>
              <input
                type="text"
                name="postnom"
                placeholder="Ex: TSHILUMBA"
                value={formData.postnom}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prénom *</label>
              <input
                type="text"
                name="prenom"
                placeholder="Ex: Alain"
                value={formData.prenom}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date de naissance *</label>
              <input
                type="date"
                name="dateNaissance"
                value={formData.dateNaissance}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lieu de naissance *</label>
              <input
                type="text"
                name="lieuNaissance"
                placeholder="Ex: Kinshasa"
                value={formData.lieuNaissance}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sexe *</label>
              <select
                name="sexe"
                value={formData.sexe}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
              >
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Type de pièce d’identité *</label>
              <select
                name="typePieceIdentite"
                value={formData.typePieceIdentite}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
              >
                <option value="carte_electeur">Carte d'Électeur CENI</option>
                <option value="passeport">Passeport Biométrique RDC</option>
                <option value="permis_conduire">Permis de Conduire RDC</option>
                <option value="attestation_identite">Attestation tenant lieu de pièce d'identité</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">N° de la pièce officielle *</label>
              <input
                type="text"
                name="numeroNationalIdentite"
                placeholder="Ex: CENI-9842104-KIN ou PASS-RDC-0891238"
                value={formData.numeroNationalIdentite}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 font-mono uppercase"
              />
            </div>
          </div>

          {/* Localisation RDC */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Compétence Territoriale & Juridiction
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Province d'enregistrement *</label>
                <select
                  value={formData.villeProvince}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
                >
                  {parametres.map(p => (
                    <option key={p.province} value={p.province}>{p.province}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Commune / Ville *</label>
                <select
                  name="commune"
                  value={formData.commune}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
                >
                  {currentParam.communes.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse de résidence complète *</label>
              <input
                type="text"
                name="adresse"
                placeholder="Ex: 12 Avenue des Aviateurs, Q. Résidentiel"
                value={formData.adresse}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
              />
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>Dossier instruit par : <strong className="text-slate-700">{currentParam.autoriteDeleguee}</strong></span>
            </div>
          </div>

          {/* Contact & Motif */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone mobile (SMS de suivi) *</label>
              <input
                type="text"
                name="telephone"
                placeholder="+243 81 000 0000"
                value={formData.telephone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse e-mail</label>
              <input
                type="email"
                name="email"
                placeholder="citoyen@email.cd"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Motif de la demande *</label>
              <select
                name="motifDemande"
                value={formData.motifDemande}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
              >
                <option value="Emploi">Emploi / Recrutement</option>
                <option value="Études / Bourse">Études universitaires / Bourse</option>
                <option value="Voyage / Visa">Voyage international / Demande de Visa</option>
                <option value="Mariage">Mariage civil</option>
                <option value="Concours Administratif">Concours Fonction Publique / Magistrature</option>
                <option value="Autre">Autre formalité administrative</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Précision sur le motif</label>
              <input
                type="text"
                name="motifPrecision"
                placeholder="Ex: Candidature Ministère ou Ambassade"
                value={formData.motifPrecision}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={() => {
                if (validateStep1()) {
                  setCurrentStep(2);
                }
              }}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
            >
              <span>Continuer vers les pièces</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DÉPÔT SÉCURISÉ DES PIÈCES (RG02) */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight font-display">
              2. Dépôt Sécurisé des Pièces Justificatives
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Selon la règle de recevabilité RG02, le dossier ne peut être soumis s'il est incomplet. Veuillez vérifier les 3 pièces requises ci-dessous.
            </p>
          </div>

          <div className="space-y-4">
            {/* Pièce 1 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Pièce d'Identité Officielle (CENI ou Passeport) *
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Scan lisible recto-verso ou page biométrique (PDF, JPG, PNG)
                  </div>
                  {pieces.find(p => p.type === 'piece_identite') && (
                    <div className="mt-1 text-xs font-mono text-emerald-700 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{pieces.find(p => p.type === 'piece_identite')?.nomFichier} ({pieces.find(p => p.type === 'piece_identite')?.taille})</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                {pieces.find(p => p.type === 'piece_identite') ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(pieces.find(p => p.type === 'piece_identite')!.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 p-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAddSimulatedFile('piece_identite', `ceni_${formData.nom.toLowerCase() || 'demandeur'}.pdf`)}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs"
                  >
                    Téléverser la pièce
                  </button>
                )}
              </div>
            </div>

            {/* Pièce 2 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Photo d'Identité Récente (Norme Passeport) *
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Format portrait sur fond blanc uni sans lunettes teintées
                  </div>
                  {pieces.find(p => p.type === 'photo_identite') && (
                    <div className="mt-1 text-xs font-mono text-emerald-700 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{pieces.find(p => p.type === 'photo_identite')?.nomFichier} ({pieces.find(p => p.type === 'photo_identite')?.taille})</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                {pieces.find(p => p.type === 'photo_identite') ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(pieces.find(p => p.type === 'photo_identite')!.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 p-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAddSimulatedFile('photo_identite', `photo_portrait_${formData.prenom.toLowerCase() || 'demandeur'}.jpg`)}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs"
                  >
                    Téléverser la photo
                  </button>
                )}
              </div>
            </div>

            {/* Pièce 3 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Certificat ou Attestation de Résidence *
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Délivré par le Bourgmestre ou Chef de quartier de {formData.commune}
                  </div>
                  {pieces.find(p => p.type === 'attestation_residence') && (
                    <div className="mt-1 text-xs font-mono text-emerald-700 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{pieces.find(p => p.type === 'attestation_residence')?.nomFichier} ({pieces.find(p => p.type === 'attestation_residence')?.taille})</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                {pieces.find(p => p.type === 'attestation_residence') ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(pieces.find(p => p.type === 'attestation_residence')!.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 p-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAddSimulatedFile('attestation_residence', `certificat_residence_${formData.commune.toLowerCase()}.pdf`)}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs"
                  >
                    Téléverser l'attestation
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (validateStep2()) {
                  setCurrentStep(3);
                }
              }}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
            >
              <span>Continuer vers la biométrie</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: VÉRIFICATION BIOMÉTRIQUE SÉCURISÉE */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight font-display">
              3. Vérification Biométrique Sécurisée
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Cette étape vérifie votre présence physique en direct (test de vivacité) et compare vos traits avec la photo de votre pièce d'identité officielle.
            </p>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 text-center space-y-5">
            <div className="w-20 h-20 bg-sky-500/10 rounded-2xl border border-sky-400/30 flex items-center justify-center mx-auto text-sky-400 shadow-inner">
              <Scan className="w-10 h-10 animate-pulse" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                Module de Contrôle Biométrique RDC
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto">
                Le dispositif garantit la non-répudiation et empêche l'usurpation d'identité pour le citoyen <span className="text-slate-200 font-semibold">{formData.prenom} {formData.nom}</span>.
              </p>
            </div>

            {biometrie?.effectuee ? (
              <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-xl max-w-md mx-auto space-y-2">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Vérification Biométrique Validée</span>
                </div>
                <div className="text-xs text-slate-300">
                  Taux de concordance faciale : <span className="font-mono font-bold text-emerald-300">{biometrie.scoreConcordance}%</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Réf: {biometrie.referenceScan}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setIsBiometricModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all scale-100 hover:scale-102"
                >
                  <Scan className="w-4 h-4" />
                  <span>Lancer la vérification biométrique en direct</span>
                </button>
                <p className="text-[11px] text-slate-400">
                  Requiert une caméra ou le simulateur biométrique certifié
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>

            <button
              type="button"
              disabled={!biometrie?.effectuee}
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continuer vers le paiement mobile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PAIEMENT MOBILE MONEY EN LIGNE SIMULÉ */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight font-display">
              4. Paiement Mobile Money en Ligne (Trésor Public RDC)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Règlement officiel des droits de chancellerie pour la province de {formData.villeProvince}.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Montant officiel réglementé</span>
                <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                  {currentParam.montantTaxeCDF.toLocaleString('fr-FR')} CDF
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  ~ {Math.round(currentParam.montantTaxeCDF / 2500)} USD
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Bénéficiaire</span>
                <div className="text-xs font-bold text-slate-800">Compte DGRAD / Trésor Public</div>
                <div className="text-[11px] text-slate-500">Réf : Ordonnance Tarifaire RDC</div>
              </div>
            </div>

            {paiement.statut === 'paye' ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Paiement confirmé par {paiement.operateur.toUpperCase()}</span>
                </div>
                <div className="text-xs text-emerald-700 font-mono">
                  Transaction : <span className="font-semibold">{paiement.referenceTransaction}</span>
                </div>
                <div className="text-xs text-emerald-700 font-mono">
                  Quittance DGRAD : <span className="font-semibold">{paiement.referenceQuittance}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Le paiement peut être simulé instantanément via M-Pesa, Orange Money, Airtel Money ou Afrimoney avec réception d'un push USSD et quittance dématérialisée.
                </p>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Payer {currentParam.montantTaxeCDF.toLocaleString()} CDF via Mobile Money</span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>

            <button
              type="button"
              disabled={paiement.statut !== 'paye'}
              onClick={handleFinalSubmit}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Soumettre définitivement le dossier (RG01)</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: ACCUSÉ DE RÉCEPTION OFFICIEL (RG01) */}
      {currentStep === 5 && createdDemande && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight font-display">
              Demande Soumise avec Succès !
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Votre dossier a été enregistré au Registre National des Certificats de Bonne Vie et Mœurs avec un horodatage certifié (RG01).
            </p>
          </div>

          {/* Reference Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-lg mx-auto text-left space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <span className="text-xs text-slate-500 font-medium">Numéro de Référence Unique</span>
              <span className="text-sm font-black font-mono text-sky-800 tracking-wide bg-sky-100/70 px-2.5 py-1 rounded-md">
                {createdDemande.numeroReference}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400">Demandeur :</span>
                <div className="font-semibold text-slate-800">{createdDemande.demandeur.nom} {createdDemande.demandeur.prenom}</div>
              </div>
              <div>
                <span className="text-slate-400">Juridiction :</span>
                <div className="font-semibold text-slate-800">{createdDemande.demandeur.commune}, {createdDemande.demandeur.villeProvince}</div>
              </div>
              <div>
                <span className="text-slate-400">Statut initial :</span>
                <div className="font-semibold text-sky-700">Soumis / En attente d'instruction</div>
              </div>
              <div>
                <span className="text-slate-400">Délai indicatif :</span>
                <div className="font-semibold text-slate-800">{currentParam.delaiCibleHeures} heures</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onSuccess(createdDemande)}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
            >
              <Clock className="w-4 h-4" />
              <span>Suivre mon dossier en temps réel</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold"
            >
              <span>Imprimer l'accusé de réception</span>
            </button>
          </div>
        </div>
      )}

      {/* Biometric Modal */}
      <BiometricVerificationModal
        isOpen={isBiometricModalOpen}
        onClose={() => setIsBiometricModalOpen(false)}
        demandeurNom={`${formData.prenom} ${formData.nom}`}
        onSuccess={(bio) => {
          setBiometrie(bio);
          setIsBiometricModalOpen(false);
        }}
      />

      {/* Payment Modal */}
      <MobilePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        montantCDF={currentParam.montantTaxeCDF}
        demandeurNom={`${formData.prenom} ${formData.nom}`}
        telephoneInit={formData.telephone}
        onPaymentSuccess={(pmt) => {
          setPaiement(pmt);
          setIsPaymentModalOpen(false);
        }}
      />
    </div>
  );
};
