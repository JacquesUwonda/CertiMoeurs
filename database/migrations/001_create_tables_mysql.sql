-- =====================================================================
-- CERTICAT DE BONNE VIE ET MŒURS - RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
-- SCRIPT DE MIGRATION SQL - BASE DE DONNÉES RELATIONNELLE (MYSQL 8+ / MARIADB)
-- Conforme au Modèle Conceptuel de Données (MCD) - Section 7.3 du Rapport
-- =====================================================================

CREATE DATABASE IF NOT EXISTS certimoeurs_rdc 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE certimoeurs_rdc;

-- 1. TABLE UTILISATEURS (Demandeurs, Agents, Valideurs, Administrateurs, Guichetiers)
CREATE TABLE IF NOT EXISTS utilisateurs (
  id VARCHAR(64) PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  telephone VARCHAR(50),
  role ENUM('citoyen', 'guichet', 'agent_instructeur', 'responsable_valideur', 'administrateur', 'organisme_verificateur') NOT NULL DEFAULT 'citoyen',
  statut ENUM('actif', 'inactif', 'suspendu') NOT NULL DEFAULT 'actif',
  mot_de_passe_hash VARCHAR(255),
  juridiction_deleguee VARCHAR(150),
  derniere_connexion DATETIME,
  date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLE PARAMETRAGE TERRITORIAL DES PROVINCES (Section 3.2, 5.1 & 10.4)
CREATE TABLE IF NOT EXISTS parametres_territoriaux (
  province VARCHAR(100) PRIMARY KEY,
  communes_json JSON NOT NULL,
  autorite_deleguee VARCHAR(150) NOT NULL,
  montant_taxe_cdf INT NOT NULL DEFAULT 45000,
  delai_cible_heures INT NOT NULL DEFAULT 48,
  pieces_obligatoires_json JSON NOT NULL,
  telephone_assistance VARCHAR(50),
  derniere_mise_a_jour DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABLE DEMANDES (Dossiers de demande de certificat de bonne vie et mœurs)
CREATE TABLE IF NOT EXISTS demandes (
  id VARCHAR(64) PRIMARY KEY,
  numero_reference VARCHAR(64) NOT NULL UNIQUE,
  demandeur_id VARCHAR(64) NOT NULL,
  mode_depot ENUM('en_ligne', 'guichet_assiste') NOT NULL DEFAULT 'en_ligne',
  statut_actuel ENUM('brouillon', 'soumis', 'en_cours_instruction', 'verification_judiciaire', 'complement_requis', 'avis_favorable', 'avis_defavorable', 'approuve', 'rejete') NOT NULL DEFAULT 'soumis',
  
  -- Identité civile et adresse du demandeur
  nom VARCHAR(100) NOT NULL,
  postnom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  date_naissance DATE NOT NULL,
  lieu_naissance VARCHAR(100) NOT NULL,
  sexe ENUM('M', 'F') NOT NULL,
  etat_civil VARCHAR(50) NOT NULL DEFAULT 'Célibataire',
  nationalite VARCHAR(50) NOT NULL DEFAULT 'Congolaise',
  numero_national_identite VARCHAR(100) NOT NULL,
  type_piece_identite VARCHAR(50) NOT NULL,
  adresse TEXT NOT NULL,
  commune VARCHAR(100) NOT NULL,
  ville_province VARCHAR(100) NOT NULL,
  telephone VARCHAR(50) NOT NULL,
  email VARCHAR(191) NOT NULL,
  profession VARCHAR(100) NOT NULL,
  motif_demande VARCHAR(100) NOT NULL,
  motif_precision TEXT,

  date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  derniere_mise_a_jour DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_demandeur (demandeur_id),
  INDEX idx_numero_reference (numero_reference),
  INDEX idx_statut (statut_actuel),
  INDEX idx_province (ville_province),
  INDEX idx_date_creation (date_creation),
  FOREIGN KEY (demandeur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABLE PIECES JOINTES (Preuves numérisées et pièces complémentaires)
CREATE TABLE IF NOT EXISTS pieces_jointes (
  id VARCHAR(64) PRIMARY KEY,
  demande_id VARCHAR(64) NOT NULL,
  type_piece ENUM('piece_identite', 'photo_identite', 'attestation_residence', 'complement') NOT NULL,
  nom_fichier VARCHAR(255) NOT NULL,
  taille VARCHAR(50),
  empreinte_hash VARCHAR(128) NOT NULL,
  statut ENUM('valide', 'a_verifier', 'rejete') NOT NULL DEFAULT 'a_verifier',
  commentaire TEXT,
  emplacement_storage VARCHAR(255),
  preview_data LONGTEXT,
  date_upload DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_piece_demande (demande_id),
  FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABLE HISTORIQUE DES STATUTS (Traçabilité du cycle de vie du dossier - RG01, RG03)
CREATE TABLE IF NOT EXISTS historique_statuts (
  id VARCHAR(64) PRIMARY KEY,
  demande_id VARCHAR(64) NOT NULL,
  statut VARCHAR(50) NOT NULL,
  date_changement DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  auteur VARCHAR(150) NOT NULL,
  role_auteur VARCHAR(100) NOT NULL,
  commentaire TEXT,
  
  INDEX idx_hist_demande (demande_id),
  FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABLE BIOMETRIE ET VIVACITÉ FACIALE
CREATE TABLE IF NOT EXISTS biometrie (
  id VARCHAR(64) PRIMARY KEY,
  demande_id VARCHAR(64) NOT NULL UNIQUE,
  date_capture DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  score_concordance DECIMAL(5,2) NOT NULL DEFAULT 95.00,
  vivacite_verifiee BOOLEAN NOT NULL DEFAULT TRUE,
  etapes_vivacite_json JSON,
  reference_scan VARCHAR(100) NOT NULL,
  empreinte_faciale_hash VARCHAR(128) NOT NULL,
  photo_capture_url LONGTEXT,
  
  FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABLE PAIEMENTS MOBILE MONEY ET QUITTANCES DU TRÉSOR
CREATE TABLE IF NOT EXISTS paiements (
  id VARCHAR(64) PRIMARY KEY,
  demande_id VARCHAR(64) NOT NULL UNIQUE,
  statut ENUM('non_initie', 'en_cours', 'paye', 'echoue') NOT NULL DEFAULT 'non_initie',
  operateur ENUM('mpesa', 'orange_money', 'airtel_money', 'afrimoney') NOT NULL,
  numero_telephone VARCHAR(50) NOT NULL,
  montant_cdf INT NOT NULL,
  montant_usd DECIMAL(10,2) NOT NULL,
  reference_transaction VARCHAR(100) NOT NULL,
  reference_quittance VARCHAR(100),
  date_paiement DATETIME,
  
  INDEX idx_ref_trans (reference_transaction),
  FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. TABLE INSTRUCTIONS JUDICIAIRES (Contrôle Casier Judiciaire et Avis Parquet - RG03)
CREATE TABLE IF NOT EXISTS instructions (
  id VARCHAR(64) PRIMARY KEY,
  demande_id VARCHAR(64) NOT NULL UNIQUE,
  agent_id VARCHAR(64),
  nom_agent VARCHAR(150),
  date_prise_en_charge DATETIME,
  casier_effectue BOOLEAN NOT NULL DEFAULT FALSE,
  casier_date DATETIME,
  casier_mention ENUM('NEANT', 'CONDAMNATION_EXISTANTE') DEFAULT 'NEANT',
  casier_registre_ref VARCHAR(100),
  casier_parquet_lieu VARCHAR(150),
  casier_agent_matricule VARCHAR(100),
  complement_motif TEXT,
  complement_date DATETIME,
  complement_pieces_json JSON,
  complement_traite BOOLEAN NOT NULL DEFAULT FALSE,
  avis_propose ENUM('FAVORABLE', 'DEFAVORABLE'),
  note_instruction TEXT,
  date_proposition DATETIME,
  
  FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TABLE DECISIONS SOUVERAINES (Magistrat / Responsable Valideur)
CREATE TABLE IF NOT EXISTS decisions (
  id VARCHAR(64) PRIMARY KEY,
  demande_id VARCHAR(64) NOT NULL UNIQUE,
  type_decision ENUM('APPROUVE', 'REJETE') NOT NULL,
  date_decision DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responsable_id VARCHAR(64) NOT NULL,
  nom_responsable VARCHAR(150) NOT NULL,
  titre_responsable VARCHAR(150) NOT NULL,
  motif TEXT,
  voies_recours TEXT,
  scelle_electronique_hash VARCHAR(128) NOT NULL,
  
  FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. TABLE CERTIFICATS DELIVRES (Certificat sécurisé avec QR Code scellé - RG05)
CREATE TABLE IF NOT EXISTS certificats (
  id VARCHAR(64) PRIMARY KEY,
  demande_id VARCHAR(64) NOT NULL UNIQUE,
  decision_id VARCHAR(64) NOT NULL,
  numero_certificat VARCHAR(100) NOT NULL UNIQUE,
  date_emission DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_expiration DATETIME NOT NULL,
  code_verification_qr TEXT NOT NULL,
  empreinte_hash_sha256 VARCHAR(128) NOT NULL,
  autorite_emettrice VARCHAR(200) NOT NULL,
  lieu_delivrance VARCHAR(150) NOT NULL,
  statut ENUM('VALIDE', 'REVOQUE', 'EXPIRE') NOT NULL DEFAULT 'VALIDE',
  signataire_nom VARCHAR(150) NOT NULL,
  signataire_qualite VARCHAR(150) NOT NULL,
  
  INDEX idx_num_certificat (numero_certificat),
  INDEX idx_statut_certificat (statut),
  FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE,
  FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. TABLE VERIFICATIONS PUBLIQUES (Ambassades, Banques, Employeurs - RG04, RG05)
CREATE TABLE IF NOT EXISTS verifications (
  id VARCHAR(64) PRIMARY KEY,
  certificat_id VARCHAR(64),
  date_verification DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resultat ENUM('VALIDE', 'INVALIDE', 'EXPIRE', 'INTROUVABLE') NOT NULL,
  canal_verification VARCHAR(50) NOT NULL DEFAULT 'portail_web',
  code_recherche VARCHAR(100) NOT NULL,
  adresse_ip VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. TABLE AUDIT ET NON-REPUDIATION (Règle RG04)
CREATE TABLE IF NOT EXISTS actions_audit (
  id VARCHAR(64) PRIMARY KEY,
  acteur VARCHAR(150) NOT NULL,
  role_acteur VARCHAR(100) NOT NULL,
  type_action VARCHAR(50) NOT NULL,
  objet_id VARCHAR(100) NOT NULL,
  horodatage DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  adresse_ip VARCHAR(50) NOT NULL,
  details TEXT NOT NULL,
  
  INDEX idx_audit_horodatage (horodatage),
  INDEX idx_audit_objet (objet_id),
  INDEX idx_audit_action (type_action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
