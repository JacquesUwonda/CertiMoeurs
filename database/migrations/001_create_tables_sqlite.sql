-- =====================================================================
-- CERTICAT DE BONNE VIE ET MŒURS - RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
-- SCRIPT DE MIGRATION SQL POUR SQLITE EMBEDDED / LOCAL DEV
-- Conforme au Modèle Conceptuel de Données (MCD) - Section 7.3 du Rapport
-- =====================================================================

PRAGMA foreign_keys = ON;

-- 1. TABLE UTILISATEURS
CREATE TABLE IF NOT EXISTS utilisateurs (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telephone TEXT,
  role TEXT NOT NULL DEFAULT 'citoyen', -- 'citoyen', 'guichet', 'agent_instructeur', 'responsable_valideur', 'administrateur', 'organisme_verificateur'
  statut TEXT NOT NULL DEFAULT 'actif',
  mot_de_passe_hash TEXT,
  juridiction_deleguee TEXT,
  derniere_connexion TEXT,
  date_creation TEXT NOT NULL
);

-- 2. TABLE PARAMETRAGE TERRITORIAL DES PROVINCES
CREATE TABLE IF NOT EXISTS parametres_territoriaux (
  province TEXT PRIMARY KEY,
  communes_json TEXT NOT NULL,
  autorite_deleguee TEXT NOT NULL,
  montant_taxe_cdf INTEGER NOT NULL DEFAULT 45000,
  delai_cible_heures INTEGER NOT NULL DEFAULT 48,
  pieces_obligatoires_json TEXT NOT NULL,
  telephone_assistance TEXT,
  derniere_mise_a_jour TEXT NOT NULL
);

-- 3. TABLE DEMANDES
CREATE TABLE IF NOT EXISTS demandes (
  id TEXT PRIMARY KEY,
  numero_reference TEXT NOT NULL UNIQUE,
  demandeur_id TEXT NOT NULL,
  mode_depot TEXT NOT NULL DEFAULT 'en_ligne', -- 'en_ligne' ou 'guichet_assiste'
  statut_actuel TEXT NOT NULL DEFAULT 'soumis',
  nom TEXT NOT NULL,
  postnom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  date_naissance TEXT NOT NULL,
  lieu_naissance TEXT NOT NULL,
  sexe TEXT NOT NULL,
  etat_civil TEXT NOT NULL DEFAULT 'Célibataire',
  nationalite TEXT NOT NULL DEFAULT 'Congolaise',
  numero_national_identite TEXT NOT NULL,
  type_piece_identite TEXT NOT NULL,
  adresse TEXT NOT NULL,
  commune TEXT NOT NULL,
  ville_province TEXT NOT NULL,
  telephone TEXT NOT NULL,
  email TEXT NOT NULL,
  profession TEXT NOT NULL,
  motif_demande TEXT NOT NULL,
  motif_precision TEXT,
  date_creation TEXT NOT NULL,
  derniere_mise_a_jour TEXT NOT NULL,
  FOREIGN KEY (demandeur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_demande_ref ON demandes(numero_reference);
CREATE INDEX IF NOT EXISTS idx_demande_statut ON demandes(statut_actuel);
CREATE INDEX IF NOT EXISTS idx_demande_province ON demandes(ville_province);

-- 4. TABLE PIECES JOINTES
CREATE TABLE IF NOT EXISTS pieces_jointes (
  id TEXT PRIMARY KEY,
  demande_id TEXT NOT NULL,
  type_piece TEXT NOT NULL,
  nom_fichier TEXT NOT NULL,
  taille TEXT,
  empreinte_hash TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'a_verifier',
  commentaire TEXT,
  emplacement_storage TEXT,
  preview_data TEXT,
  date_upload TEXT NOT NULL,
  FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE
);

-- 5. TABLE HISTORIQUE STATUTS
CREATE TABLE IF NOT EXISTS historique_statuts (
  id TEXT PRIMARY KEY,
  demande_id TEXT NOT NULL,
  statut TEXT NOT NULL,
  date_changement TEXT NOT NULL,
  auteur TEXT NOT NULL,
  role_auteur TEXT NOT NULL,
  commentaire TEXT,
  FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE
);

-- 6. TABLE BIOMETRIE
CREATE TABLE IF NOT EXISTS biometrie (
  id TEXT PRIMARY KEY,
  demande_id TEXT NOT NULL UNIQUE,
  date_capture TEXT NOT NULL,
  score_concordance REAL NOT NULL DEFAULT 95.00,
  vivacite_verifiee INTEGER NOT NULL DEFAULT 1,
  etapes_vivacite_json TEXT,
  reference_scan TEXT NOT NULL,
  empreinte_faciale_hash TEXT NOT NULL,
  photo_capture_url TEXT,
  FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE
);

-- 7. TABLE PAIEMENTS
CREATE TABLE IF NOT EXISTS paiements (
  id TEXT PRIMARY KEY,
  demande_id TEXT NOT NULL UNIQUE,
  statut TEXT NOT NULL DEFAULT 'non_initie',
  operateur TEXT NOT NULL,
  numero_telephone TEXT NOT NULL,
  montant_cdf INTEGER NOT NULL,
  montant_usd REAL NOT NULL,
  reference_transaction TEXT NOT NULL,
  reference_quittance TEXT,
  date_paiement TEXT,
  FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE
);

-- 8. TABLE INSTRUCTIONS
CREATE TABLE IF NOT EXISTS instructions (
  id TEXT PRIMARY KEY,
  demande_id TEXT NOT NULL UNIQUE,
  agent_id TEXT,
  nom_agent TEXT,
  date_prise_en_charge TEXT,
  casier_effectue INTEGER NOT NULL DEFAULT 0,
  casier_date TEXT,
  casier_mention TEXT DEFAULT 'NEANT',
  casier_registre_ref TEXT,
  casier_parquet_lieu TEXT,
  casier_agent_matricule TEXT,
  complement_motif TEXT,
  complement_date TEXT,
  complement_pieces_json TEXT,
  complement_traite INTEGER NOT NULL DEFAULT 0,
  avis_propose TEXT,
  note_instruction TEXT,
  date_proposition TEXT,
  FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE
);

-- 9. TABLE DECISIONS
CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  demande_id TEXT NOT NULL UNIQUE,
  type_decision TEXT NOT NULL,
  date_decision TEXT NOT NULL,
  responsable_id TEXT NOT NULL,
  nom_responsable TEXT NOT NULL,
  titre_responsable TEXT NOT NULL,
  motif TEXT,
  voies_recours TEXT,
  scelle_electronique_hash TEXT NOT NULL,
  FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE
);

-- 10. TABLE CERTIFICATS
CREATE TABLE IF NOT EXISTS certificats (
  id TEXT PRIMARY KEY,
  demande_id TEXT NOT NULL UNIQUE,
  decision_id TEXT NOT NULL,
  numero_certificat TEXT NOT NULL UNIQUE,
  date_emission TEXT NOT NULL,
  date_expiration TEXT NOT NULL,
  code_verification_qr TEXT NOT NULL,
  empreinte_hash_sha256 TEXT NOT NULL,
  autorite_emettrice TEXT NOT NULL,
  lieu_delivrance TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'VALIDE',
  signataire_nom TEXT NOT NULL,
  signataire_qualite TEXT NOT NULL,
  FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE,
  FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_certificat_num ON certificats(numero_certificat);

-- 11. TABLE VERIFICATIONS
CREATE TABLE IF NOT EXISTS verifications (
  id TEXT PRIMARY KEY,
  certificat_id TEXT,
  date_verification TEXT NOT NULL,
  resultat TEXT NOT NULL,
  canal_verification TEXT NOT NULL DEFAULT 'portail_web',
  code_recherche TEXT NOT NULL,
  adresse_ip TEXT
);

-- 12. TABLE AUDIT
CREATE TABLE IF NOT EXISTS actions_audit (
  id TEXT PRIMARY KEY,
  acteur TEXT NOT NULL,
  role_acteur TEXT NOT NULL,
  type_action TEXT NOT NULL,
  objet_id TEXT NOT NULL,
  horodatage TEXT NOT NULL,
  adresse_ip TEXT NOT NULL,
  details TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_time ON actions_audit(horodatage);
