import { DemandeCertificat, ActionAudit, ParametrageTerritorial } from '../types';

export const PARAMETRAGES_PROVINCES: ParametrageTerritorial[] = [
  {
    province: 'Kinshasa',
    communes: ['Gombe', 'Kintambo', 'Lingwala', 'Ngaliema', 'Limete', 'Bandalungwa', 'Barumbu', 'Kalamu', 'Kasavubu', 'Lemba', 'Matete', 'Ndjili', 'Masina', 'Kimbanseke', 'Mont-Ngafula'],
    autoriteDeleguee: 'Parquet de Grande Instance de Kinshasa / Gombe',
    montantTaxeCDF: 25000,
    delaiCibleHeures: 48,
    piecesObligatoires: ['Carte d’électeur CENI ou Passeport biométrique', 'Photo d’identité passeport récente', 'Attestation de résidence communale'],
    telephoneAssistance: '+243 81 000 0001'
  },
  {
    province: 'Haut-Katanga',
    communes: ['Lubumbashi', 'Kamalondo', 'Kenya', 'Katuba', 'Kampemba', 'Ruashi', 'Annexe'],
    autoriteDeleguee: 'Parquet de Grande Instance de Lubumbashi',
    montantTaxeCDF: 25000,
    delaiCibleHeures: 48,
    piecesObligatoires: ['Carte d’électeur CENI ou Passeport biométrique', 'Photo d’identité passeport récente', 'Attestation de résidence communale'],
    telephoneAssistance: '+243 82 000 0002'
  },
  {
    province: 'Nord-Kivu',
    communes: ['Goma', 'Karisimbi', 'Beni', 'Butembo'],
    autoriteDeleguee: 'Maison de Justice et Parquet de Goma',
    montantTaxeCDF: 20000,
    delaiCibleHeures: 48,
    piecesObligatoires: ['Carte d’électeur CENI ou Passeport biométrique', 'Photo d’identité passeport récente', 'Attestation de résidence communale'],
    telephoneAssistance: '+243 83 000 0003'
  },
  {
    province: 'Kongo-Central',
    communes: ['Matadi', 'Boma', 'Mbanza-Ngungu'],
    autoriteDeleguee: 'Parquet de Grande Instance de Matadi',
    montantTaxeCDF: 22000,
    delaiCibleHeures: 72,
    piecesObligatoires: ['Carte d’électeur CENI ou Passeport biométrique', 'Photo d’identité passeport récente', 'Attestation de résidence communale'],
    telephoneAssistance: '+243 84 000 0004'
  }
];

export const INITIAL_DEMANDES: DemandeCertificat[] = [
  {
    id: 'dem-001',
    numeroReference: 'CBVM-2026-KIN-001842',
    dateCreation: '2026-09-20T09:14:00Z',
    derniereMiseAJour: '2026-09-21T14:30:00Z',
    statutActuel: 'approuve',
    modeDepot: 'en_ligne',
    demandeur: {
      nom: 'MUKENDI',
      postnom: 'TSHILUMBA',
      prenom: 'Alain',
      dateNaissance: '1992-06-14',
      lieuNaissance: 'Kinshasa',
      sexe: 'M',
      etatCivil: 'Marié(e)',
      nationalite: 'Congolaise',
      numeroNationalIdentite: 'CENI-9842104-KIN',
      typePieceIdentite: 'carte_electeur',
      adresse: '12 Avenue des Aviateurs, Q. Résidentiel',
      commune: 'Gombe',
      villeProvince: 'Kinshasa',
      telephone: '+243 81 445 8890',
      email: 'alain.mukendi@email.cd',
      profession: 'Ingénieur Télécoms',
      motifDemande: 'Emploi',
      motifPrecision: 'Recrutement Cadre Supérieur Société Minière'
    },
    piecesJointes: [
      {
        id: 'pj-001',
        type: 'piece_identite',
        nomFichier: 'carte_electeur_mukendi.pdf',
        dateUpload: '2026-09-20T09:15:00Z',
        statut: 'valide',
        taille: '1.4 Mo',
        empreinteHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      },
      {
        id: 'pj-002',
        type: 'photo_identite',
        nomFichier: 'photo_passeport_alain.jpg',
        dateUpload: '2026-09-20T09:16:00Z',
        statut: 'valide',
        taille: '820 Ko',
        empreinteHash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
      },
      {
        id: 'pj-003',
        type: 'attestation_residence',
        nomFichier: 'attestation_residence_gombe.pdf',
        dateUpload: '2026-09-20T09:18:00Z',
        statut: 'valide',
        taille: '1.1 Mo',
        empreinteHash: '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d'
      }
    ],
    biometrie: {
      effectuee: true,
      dateCapture: '2026-09-20T09:20:00Z',
      scoreConcordance: 97.4,
      vivaciteVerifiee: true,
      etapesVivacite: {
        clignementYeux: true,
        sourire: true,
        mouvementTete: true
      },
      typeVerification: 'facial_liveness_match',
      referenceScan: 'BIO-2026-KIN-MATCH-974',
      empreinteFacialeHash: 'f4b238a9bc6810c9201948ba8123def8761234'
    },
    paiement: {
      statut: 'paye',
      operateur: 'mpesa',
      numeroTelephone: '+243 81 445 8890',
      montantCDF: 25000,
      montantUSD: 10,
      referenceTransaction: 'MPESA-TXN-20260920-8812',
      datePaiement: '2026-09-20T09:22:00Z',
      referenceQuittance: 'QUIT-DGRAD-2026-00918'
    },
    historiqueStatuts: [
      {
        id: 'hist-001',
        statut: 'soumis',
        dateChangement: '2026-09-20T09:23:00Z',
        auteur: 'Demandeur (Alain MUKENDI)',
        roleAuteur: 'Demandeur',
        commentaire: 'Dossier complet soumis en ligne avec contrôle biométrique et quittance DGRAD'
      },
      {
        id: 'hist-002',
        statut: 'en_cours_instruction',
        dateChangement: '2026-09-20T11:00:00Z',
        auteur: 'Agent Dieudonné MBAYA',
        roleAuteur: 'Agent Instructeur',
        commentaire: 'Prise en charge du dossier. Pièces conformes. Interrogation du casier judiciaire central.'
      },
      {
        id: 'hist-003',
        statut: 'avis_favorable',
        dateChangement: '2026-09-20T16:15:00Z',
        auteur: 'Agent Dieudonné MBAYA',
        roleAuteur: 'Agent Instructeur',
        commentaire: 'Bulletin n°2 néant. Aucune condamnation ni poursuite en cours. Proposition favorable transmise.'
      },
      {
        id: 'hist-004',
        statut: 'approuve',
        dateChangement: '2026-09-21T14:30:00Z',
        auteur: 'Me Jean-Pierre KALALA (Officier du Ministère Public)',
        roleAuteur: 'Responsable Valideur',
        commentaire: 'Certificat validé et scellé électroniquement. Délivrance autorisée.'
      }
    ],
    instructions: {
      agentId: 'AGT-042',
      nomAgent: 'Dieudonné MBAYA',
      datePriseEnCharge: '2026-09-20T11:00:00Z',
      verificationCasier: {
        effectue: true,
        dateVerification: '2026-09-20T14:00:00Z',
        mentionCasier: 'NEANT',
        registreRef: 'REG-CASIER-2026-KIN-4891',
        parquetLieu: 'Parquet de Grande Instance de Kinshasa / Gombe',
        agentMatricule: 'MAT-99201-JUS'
      },
      noteInstruction: 'Identité certifiée conforme aux registres de la CENI et dossier sans antécédent judiciaire.',
      avisPropose: 'FAVORABLE',
      dateProposition: '2026-09-20T16:15:00Z'
    },
    decision: {
      id: 'DEC-2026-001842',
      typeDecision: 'APPROUVE',
      dateDecision: '2026-09-21T14:30:00Z',
      responsableId: 'VAL-007',
      nomResponsable: 'Jean-Pierre KALALA KABONGO',
      titreResponsable: 'Officier du Ministère Public près le Parquet de Grande Instance',
      scelleElectroniqueHash: 'sha256:d8a2fe619c0b1e847aa1f29b47cf2e51928374a5e4b3c2d1'
    },
    certificat: {
      id: 'CERT-2026-001842',
      numeroCertificat: 'RDC-JUS-CBVM-2026-001842',
      dateEmission: '2026-09-21T14:30:00Z',
      dateExpiration: '2026-12-21T23:59:59Z',
      codeVerificationQR: 'https://justice.gouv.cd/verifier?ref=RDC-JUS-CBVM-2026-001842&h=d8a2fe61',
      empreinteHashSHA256: 'd8a2fe619c0b1e847aa1f29b47cf2e51928374a5e4b3c2d1',
      autoriteEmettrice: 'Ministère de la Justice - Parquet de Grande Instance de Kinshasa / Gombe',
      lieuDelivrance: 'Kinshasa, Gombe',
      statut: 'VALIDE',
      signataireNom: 'Jean-Pierre KALALA KABONGO',
      signataireQualite: 'Officier du Ministère Public'
    }
  },
  {
    id: 'dem-002',
    numeroReference: 'CBVM-2026-LSH-002319',
    dateCreation: '2026-09-22T08:30:00Z',
    derniereMiseAJour: '2026-09-22T10:15:00Z',
    statutActuel: 'en_cours_instruction',
    modeDepot: 'en_ligne',
    demandeur: {
      nom: 'KABEDI',
      postnom: 'MWAMBA',
      prenom: 'Syntiche',
      dateNaissance: '1998-11-03',
      lieuNaissance: 'Kolwezi',
      sexe: 'F',
      etatCivil: 'Célibataire',
      nationalite: 'Congolaise',
      numeroNationalIdentite: 'CENI-4412091-LSH',
      typePieceIdentite: 'carte_electeur',
      adresse: '45 Avenue Mama Yemo, Q. Makomeno',
      commune: 'Lubumbashi',
      villeProvince: 'Haut-Katanga',
      telephone: '+243 99 712 3456',
      email: 'syntiche.kabedi@univ-lsh.cd',
      profession: 'Étudiante en Médecine',
      motifDemande: 'Études / Bourse',
      motifPrecision: 'Dossier de candidature spécialisation hospitalière'
    },
    piecesJointes: [
      {
        id: 'pj-010',
        type: 'piece_identite',
        nomFichier: 'ceni_kabedi_syntiche.jpg',
        dateUpload: '2026-09-22T08:32:00Z',
        statut: 'valide',
        taille: '1.8 Mo',
        empreinteHash: '7a12b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4'
      },
      {
        id: 'pj-011',
        type: 'photo_identite',
        nomFichier: 'photo_identite_fond_blanc.png',
        dateUpload: '2026-09-22T08:34:00Z',
        statut: 'valide',
        taille: '650 Ko',
        empreinteHash: '8b23c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5'
      },
      {
        id: 'pj-012',
        type: 'attestation_residence',
        nomFichier: 'residence_makomeno.pdf',
        dateUpload: '2026-09-22T08:35:00Z',
        statut: 'valide',
        taille: '920 Ko',
        empreinteHash: '9c34d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6'
      }
    ],
    biometrie: {
      effectuee: true,
      dateCapture: '2026-09-22T08:38:00Z',
      scoreConcordance: 98.1,
      vivaciteVerifiee: true,
      etapesVivacite: {
        clignementYeux: true,
        sourire: true,
        mouvementTete: true
      },
      typeVerification: 'facial_liveness_match',
      referenceScan: 'BIO-2026-LSH-MATCH-981',
      empreinteFacialeHash: 'a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7'
    },
    paiement: {
      statut: 'paye',
      operateur: 'orange_money',
      numeroTelephone: '+243 99 712 3456',
      montantCDF: 25000,
      montantUSD: 10,
      referenceTransaction: 'OM-TXN-20260922-3301',
      datePaiement: '2026-09-22T08:40:00Z',
      referenceQuittance: 'QUIT-DGRAD-2026-01044'
    },
    historiqueStatuts: [
      {
        id: 'hist-010',
        statut: 'soumis',
        dateChangement: '2026-09-22T08:42:00Z',
        auteur: 'Demandeur (Syntiche KABEDI)',
        roleAuteur: 'Demandeur',
        commentaire: 'Dossier téléversé avec succès. Quittance Orange Money n°OM-TXN-20260922-3301 validée.'
      },
      {
        id: 'hist-011',
        statut: 'en_cours_instruction',
        dateChangement: '2026-09-22T10:15:00Z',
        auteur: 'Agent Christine ILUNGA',
        roleAuteur: 'Agent Instructeur',
        commentaire: 'Dossier assigné pour vérification judiciaire au Parquet de Lubumbashi.'
      }
    ]
  },
  {
    id: 'dem-003',
    numeroReference: 'CBVM-2026-KIN-003108',
    dateCreation: '2026-09-21T15:20:00Z',
    derniereMiseAJour: '2026-09-22T11:45:00Z',
    statutActuel: 'avis_favorable',
    modeDepot: 'en_ligne',
    demandeur: {
      nom: 'KANYINDA',
      postnom: 'ILUNGA',
      prenom: 'Patrick',
      dateNaissance: '1987-03-29',
      lieuNaissance: 'Kananga',
      sexe: 'M',
      etatCivil: 'Marié(e)',
      nationalite: 'Congolaise',
      numeroNationalIdentite: 'PASS-RDC-0891238',
      typePieceIdentite: 'passeport',
      adresse: '88 Boulevard du 30 Juin, Q. Golf',
      commune: 'Kintambo',
      villeProvince: 'Kinshasa',
      telephone: '+243 82 555 7711',
      email: 'p.kanyinda@consulting.cd',
      profession: 'Directeur Financier',
      motifDemande: 'Voyage / Visa',
      motifPrecision: 'Demande de visa diplomatique / mission de service'
    },
    piecesJointes: [
      {
        id: 'pj-020',
        type: 'piece_identite',
        nomFichier: 'passeport_biometrique_kanyinda.pdf',
        dateUpload: '2026-09-21T15:22:00Z',
        statut: 'valide',
        taille: '2.1 Mo',
        empreinteHash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'
      },
      {
        id: 'pj-021',
        type: 'photo_identite',
        nomFichier: 'photo_norme_oaci.jpg',
        dateUpload: '2026-09-21T15:24:00Z',
        statut: 'valide',
        taille: '780 Ko',
        empreinteHash: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c'
      },
      {
        id: 'pj-022',
        type: 'attestation_residence',
        nomFichier: 'certificat_residence_kintambo.pdf',
        dateUpload: '2026-09-21T15:25:00Z',
        statut: 'valide',
        taille: '1.3 Mo',
        empreinteHash: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d'
      }
    ],
    biometrie: {
      effectuee: true,
      dateCapture: '2026-09-21T15:28:00Z',
      scoreConcordance: 96.2,
      vivaciteVerifiee: true,
      etapesVivacite: {
        clignementYeux: true,
        sourire: true,
        mouvementTete: true
      },
      typeVerification: 'facial_liveness_match',
      referenceScan: 'BIO-2026-KIN-MATCH-962',
      empreinteFacialeHash: '4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e'
    },
    paiement: {
      statut: 'paye',
      operateur: 'airtel_money',
      numeroTelephone: '+243 82 555 7711',
      montantCDF: 25000,
      montantUSD: 10,
      referenceTransaction: 'AIRTEL-TXN-20260921-9921',
      datePaiement: '2026-09-21T15:30:00Z',
      referenceQuittance: 'QUIT-DGRAD-2026-00994'
    },
    historiqueStatuts: [
      {
        id: 'hist-020',
        statut: 'soumis',
        dateChangement: '2026-09-21T15:32:00Z',
        auteur: 'Demandeur (Patrick KANYINDA)',
        roleAuteur: 'Demandeur',
        commentaire: 'Dossier soumis avec succès.'
      },
      {
        id: 'hist-021',
        statut: 'en_cours_instruction',
        dateChangement: '2026-09-22T08:00:00Z',
        auteur: 'Agent Dieudonné MBAYA',
        roleAuteur: 'Agent Instructeur',
        commentaire: 'Examen des documents d’identité et vérification casier.'
      },
      {
        id: 'hist-022',
        statut: 'avis_favorable',
        dateChangement: '2026-09-22T11:45:00Z',
        auteur: 'Agent Dieudonné MBAYA',
        roleAuteur: 'Agent Instructeur',
        commentaire: 'Casier judiciaire vérifié néant. Avis favorable proposé au magistrat valideur.'
      }
    ],
    instructions: {
      agentId: 'AGT-042',
      nomAgent: 'Dieudonné MBAYA',
      datePriseEnCharge: '2026-09-22T08:00:00Z',
      verificationCasier: {
        effectue: true,
        dateVerification: '2026-09-22T11:30:00Z',
        mentionCasier: 'NEANT',
        registreRef: 'REG-CASIER-2026-KIN-4902',
        parquetLieu: 'Parquet de Grande Instance de Kinshasa / Gombe',
        agentMatricule: 'MAT-99201-JUS'
      },
      noteInstruction: 'Passeport biométrique authentique, concordance faciale à 96.2%, bulletin n°2 vierge.',
      avisPropose: 'FAVORABLE',
      dateProposition: '2026-09-22T11:45:00Z'
    }
  },
  {
    id: 'dem-004',
    numeroReference: 'CBVM-2026-GOM-004190',
    dateCreation: '2026-09-21T10:00:00Z',
    derniereMiseAJour: '2026-09-22T09:20:00Z',
    statutActuel: 'complement_requis',
    modeDepot: 'guichet_assiste',
    demandeur: {
      nom: 'BAHATI',
      postnom: 'KABUO',
      prenom: 'Espérance',
      dateNaissance: '1995-04-18',
      lieuNaissance: 'Goma',
      sexe: 'F',
      etatCivil: 'Célibataire',
      nationalite: 'Congolaise',
      numeroNationalIdentite: 'CENI-3918231-GOM',
      typePieceIdentite: 'carte_electeur',
      adresse: '14 Avenue des Volcans, Q. Himbi',
      commune: 'Goma',
      villeProvince: 'Nord-Kivu',
      telephone: '+243 97 001 2233',
      email: 'esperance.bahati@ong-rdc.org',
      profession: 'Animatrice Communautaire',
      motifDemande: 'Emploi',
      motifPrecision: 'Recrutement auprès d’une organisation humanitaire'
    },
    piecesJointes: [
      {
        id: 'pj-030',
        type: 'piece_identite',
        nomFichier: 'ceni_recto_bahati.jpg',
        dateUpload: '2026-09-21T10:05:00Z',
        statut: 'valide',
        taille: '1.2 Mo',
        empreinteHash: '5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f'
      },
      {
        id: 'pj-031',
        type: 'photo_identite',
        nomFichier: 'photo_floue.jpg',
        dateUpload: '2026-09-21T10:06:00Z',
        statut: 'rejete',
        taille: '310 Ko',
        empreinteHash: '6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a',
        commentaire: 'Photo trop floue et contre-jour. Veuillez fournir une photo nette sur fond blanc uni.'
      }
    ],
    biometrie: {
      effectuee: true,
      dateCapture: '2026-09-21T10:10:00Z',
      scoreConcordance: 92.0,
      vivaciteVerifiee: true,
      etapesVivacite: {
        clignementYeux: true,
        sourire: true,
        mouvementTete: true
      },
      typeVerification: 'facial_liveness_match',
      referenceScan: 'BIO-2026-GOM-MATCH-920',
      empreinteFacialeHash: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b'
    },
    paiement: {
      statut: 'paye',
      operateur: 'afrimoney',
      numeroTelephone: '+243 97 001 2233',
      montantCDF: 20000,
      montantUSD: 8,
      referenceTransaction: 'AFRI-TXN-20260921-1189',
      datePaiement: '2026-09-21T10:12:00Z',
      referenceQuittance: 'QUIT-DGRAD-2026-00877'
    },
    historiqueStatuts: [
      {
        id: 'hist-030',
        statut: 'soumis',
        dateChangement: '2026-09-21T10:15:00Z',
        auteur: 'Guichetier Aimé KASOKI',
        roleAuteur: 'Guichet Assisté',
        commentaire: 'Enregistrement assisté pour la citoyenne au guichet physique de Goma.'
      },
      {
        id: 'hist-031',
        statut: 'complement_requis',
        dateChangement: '2026-09-22T09:20:00Z',
        auteur: 'Agent Christine ILUNGA',
        roleAuteur: 'Agent Instructeur',
        commentaire: 'Photo d’identité non conforme aux normes officielles (fond non uni et flou). Nouveau téléversement requis.'
      }
    ],
    instructions: {
      agentId: 'AGT-055',
      nomAgent: 'Christine ILUNGA',
      datePriseEnCharge: '2026-09-22T09:00:00Z',
      complementDemande: {
        motif: 'La photo d’identité fournie est floue et ne respecte pas les critères d’admissibilité biométriques.',
        dateDemande: '2026-09-22T09:20:00Z',
        piecesDemandees: ['Photo d’identité passeport récente sur fond blanc clair'],
        traite: false
      }
    }
  }
];

export const INITIAL_AUDIT_LOGS: ActionAudit[] = [
  {
    id: 'aud-001',
    acteur: 'Alain MUKENDI',
    roleActeur: 'Demandeur',
    typeAction: 'CREATION_DOSSIER',
    objetId: 'CBVM-2026-KIN-001842',
    horodatage: '2026-09-20T09:14:00Z',
    adresseIP: '197.157.210.14',
    details: 'Création initiale du dossier de demande et enregistrement de l’identité citoyen'
  },
  {
    id: 'aud-002',
    acteur: 'Système Biométrique',
    roleActeur: 'Système',
    typeAction: 'VERIF_BIOMETRIQUE',
    objetId: 'CBVM-2026-KIN-001842',
    horodatage: '2026-09-20T09:20:00Z',
    adresseIP: '197.157.210.14',
    details: 'Test de vivacité validé (clignement, sourire). Taux de concordance faciale: 97.4%'
  },
  {
    id: 'aud-003',
    acteur: 'M-Pesa Gateway',
    roleActeur: 'Opérateur Mobile',
    typeAction: 'PAIEMENT',
    objetId: 'CBVM-2026-KIN-001842',
    horodatage: '2026-09-20T09:22:00Z',
    adresseIP: '41.243.12.98',
    details: 'Paiement confirmé de 25.000 CDF. Réf: MPESA-TXN-20260920-8812. Quittance DGRAD émise.'
  },
  {
    id: 'aud-004',
    acteur: 'Dieudonné MBAYA',
    roleActeur: 'Agent Instructeur',
    typeAction: 'INSTRUCTION',
    objetId: 'CBVM-2026-KIN-001842',
    horodatage: '2026-09-20T14:00:00Z',
    adresseIP: '10.0.12.44',
    details: 'Consultation registre casier judiciaire central. Bulletin n°2 vérifié néant.'
  },
  {
    id: 'aud-005',
    acteur: 'Jean-Pierre KALALA KABONGO',
    roleActeur: 'Responsable Valideur',
    typeAction: 'DECISION_VALIDATION',
    objetId: 'CBVM-2026-KIN-001842',
    horodatage: '2026-09-21T14:30:00Z',
    adresseIP: '10.0.12.80',
    details: 'Signature électronique et émission du certificat RDC-JUS-CBVM-2026-001842'
  }
];
