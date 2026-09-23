export type Role = 'citoyen' | 'agent_instructeur' | 'responsable_valideur' | 'administrateur' | 'guichet' | 'organisme_verificateur';

export type StatutDemande = 
  | 'brouillon'
  | 'soumis'
  | 'en_cours_instruction'
  | 'verification_judiciaire'
  | 'complement_requis'
  | 'avis_favorable'
  | 'avis_defavorable'
  | 'approuve'
  | 'rejete';

export type TypePieceIdentite = 'carte_electeur' | 'passeport' | 'permis_conduire' | 'attestation_identite';

export type OperateurMobile = 'mpesa' | 'orange_money' | 'airtel_money' | 'afrimoney';

export interface PieceJointe {
  id: string;
  type: 'piece_identite' | 'photo_identite' | 'attestation_residence' | 'complement';
  nomFichier: string;
  dateUpload: string;
  statut: 'valide' | 'a_verifier' | 'rejete';
  taille: string;
  empreinteHash: string;
  previewUrl?: string;
  commentaire?: string;
}

export interface VerificationBiometrique {
  effectuee: boolean;
  dateCapture: string;
  scoreConcordance: number; // e.g. 96.8%
  vivaciteVerifiee: boolean; // Liveness test
  etapesVivacite: {
    clignementYeux: boolean;
    sourire: boolean;
    mouvementTete: boolean;
  };
  typeVerification: 'facial_liveness_match';
  referenceScan: string;
  photoCaptureUrl?: string;
  empreinteFacialeHash: string;
}

export interface PaiementMobile {
  statut: 'non_initie' | 'en_cours' | 'paye' | 'echoue';
  operateur: OperateurMobile;
  numeroTelephone: string;
  montantCDF: number;
  montantUSD: number;
  referenceTransaction: string;
  datePaiement?: string;
  referenceQuittance?: string;
}

export interface HistoriqueStatut {
  id: string;
  statut: StatutDemande;
  dateChangement: string;
  auteur: string;
  roleAuteur: string;
  commentaire: string;
}

export interface VerificationCasier {
  effectue: boolean;
  dateVerification: string;
  mentionCasier: 'NEANT' | 'CONDAMNATION_EXISTANTE';
  registreRef: string;
  parquetLieu: string;
  agentMatricule: string;
}

export interface InstructionDossier {
  agentId?: string;
  nomAgent?: string;
  datePriseEnCharge?: string;
  verificationCasier?: VerificationCasier;
  noteInstruction?: string;
  complementDemande?: {
    motif: string;
    dateDemande: string;
    piecesDemandees: string[];
    traite: boolean;
  };
  avisPropose?: 'FAVORABLE' | 'DEFAVORABLE';
  dateProposition?: string;
}

export interface DecisionDossier {
  id?: string;
  typeDecision?: 'APPROUVE' | 'REJETE';
  dateDecision?: string;
  responsableId?: string;
  nomResponsable?: string;
  titreResponsable?: string;
  motif?: string;
  voiesRecours?: string;
  scelleElectroniqueHash?: string;
}

export interface CertificatDelivre {
  id: string;
  numeroCertificat: string; // Ex: RDC-JUS-CBVM-2026-KIN-004812
  dateEmission: string;
  dateExpiration: string;
  codeVerificationQR: string;
  empreinteHashSHA256: string;
  autoriteEmettrice: string;
  lieuDelivrance: string;
  statut: 'VALIDE' | 'REVOQUE' | 'EXPIRE';
  signataireNom: string;
  signataireQualite: string;
}

export interface DemandeCertificat {
  id: string;
  numeroReference: string; // Ex: CBVM-2026-KIN-008492
  dateCreation: string;
  derniereMiseAJour: string;
  statutActuel: StatutDemande;
  modeDepot: 'en_ligne' | 'guichet_assiste';
  
  demandeur: {
    nom: string;
    postnom: string;
    prenom: string;
    dateNaissance: string;
    lieuNaissance: string;
    sexe: 'M' | 'F';
    etatCivil: 'Célibataire' | 'Marié(e)' | 'Divorcé(e)' | 'Veuf(ve)';
    nationalite: 'Congolaise';
    numeroNationalIdentite: string;
    typePieceIdentite: TypePieceIdentite;
    adresse: string;
    commune: string;
    villeProvince: string;
    telephone: string;
    email: string;
    profession: string;
    motifDemande: 'Emploi' | 'Études / Bourse' | 'Voyage / Visa' | 'Mariage' | 'Concours Administratif' | 'Autre';
    motifPrecision?: string;
  };

  piecesJointes: PieceJointe[];
  biometrie?: VerificationBiometrique;
  paiement: PaiementMobile;
  historiqueStatuts: HistoriqueStatut[];
  instructions?: InstructionDossier;
  decision?: DecisionDossier;
  certificat?: CertificatDelivre;
}

export interface ActionAudit {
  id: string;
  acteur: string;
  roleActeur: string;
  typeAction: 'CREATION_DOSSIER' | 'TELEVERSEMENT_PIECE' | 'VERIF_BIOMETRIQUE' | 'PAIEMENT' | 'INSTRUCTION' | 'DEMANDE_COMPLEMENT' | 'DECISION_VALIDATION' | 'DECISION_REJET' | 'CONSULTATION' | 'VERIFICATION_TIERS' | 'EXPORT_CERTIFICAT' | 'CONNEXION' | 'DECONNEXION';
  objetId: string;
  horodatage: string;
  adresseIP: string;
  details: string;
}

export interface ParametrageTerritorial {
  province: string;
  communes: string[];
  autoriteDeleguee: string;
  montantTaxeCDF: number;
  delaiCibleHeures: number;
  piecesObligatoires: string[];
  telephoneAssistance: string;
}

export interface VerificationPubliqueResult {
  trouve: boolean;
  numeroCertificat?: string;
  nomCompletMasque?: string;
  dateEmission?: string;
  dateExpiration?: string;
  statut?: 'VALIDE' | 'REVOQUE' | 'EXPIRE';
  autoriteEmettrice?: string;
  lieuDelivrance?: string;
  empreinteSHA256?: string;
  mentionLegale?: string;
}
