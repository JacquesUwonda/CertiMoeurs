-- =====================================================================
-- CERTICAT DE BONNE VIE ET MŒURS - RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
-- JEU DE DONNÉES INITIAL (SEEDS) - USAGERS, RÈGLES & DEMANDES DE DÉMONSTRATION
-- =====================================================================

-- 1. UTILISATEURS PAR RÔLE (Pour tester chaque séparation de rôle demandée)
-- Mot de passe par défaut pour tous les comptes de test: Justice2026!
INSERT OR IGNORE INTO utilisateurs (id, nom, prenom, email, telephone, role, statut, mot_de_passe_hash, juridiction_deleguee, date_creation) VALUES
('usr-citoyen-1', 'Mwamba', 'Dieudonné', 'dieudonne.mwamba@gmail.com', '+243810001234', 'citoyen', 'actif', '286703f3b9c460cd24d597eed3a6777eed3731af134b9212538135e361caf73b', 'Kinshasa', '2026-02-01T08:00:00Z'),
('usr-citoyen-2', 'Mukendi', 'Gisèle', 'gisele.mukendi@yahoo.fr', '+243990005678', 'citoyen', 'actif', '286703f3b9c460cd24d597eed3a6777eed3731af134b9212538135e361caf73b', 'Haut-Katanga', '2026-02-05T09:15:00Z'),
('usr-guichet-1', 'Tshimanga', 'Mireille', 'guichet.lingwala@justice.gouv.cd', '+243820009911', 'guichet', 'actif', '286703f3b9c460cd24d597eed3a6777eed3731af134b9212538135e361caf73b', 'Commune de Lingwala (Kinshasa)', '2026-01-15T08:00:00Z'),
('usr-agent-1', 'Kabasele', 'Jean-Paul', 'jp.kabasele@justice.gouv.cd', '+243815554321', 'agent_instructeur', 'actif', '286703f3b9c460cd24d597eed3a6777eed3731af134b9212538135e361caf73b', 'Parquet de Grande Instance de Kinshasa / Gombe', '2026-01-10T08:00:00Z'),
('usr-agent-2', 'Kalala', 'Nathalie', 'n.kalala@justice.gouv.cd', '+243818887766', 'agent_instructeur', 'actif', '286703f3b9c460cd24d597eed3a6777eed3731af134b9212538135e361caf73b', 'Parquet de Grande Instance de Lubumbashi', '2026-01-10T08:00:00Z'),
('usr-valideur-1', 'Malamba', 'Antoine', 'a.malamba@justice.gouv.cd', '+243890002233', 'responsable_valideur', 'actif', '286703f3b9c460cd24d597eed3a6777eed3731af134b9212538135e361caf73b', 'Procureur de la République près le TGI Kinshasa/Gombe', '2026-01-05T08:00:00Z'),
('usr-admin-1', 'Kasongo', 'Patrick', 'admin.dsi@justice.gouv.cd', '+243840000001', 'administrateur', 'actif', '286703f3b9c460cd24d597eed3a6777eed3731af134b9212538135e361caf73b', 'Direction des Systèmes d''Information - Ministère de la Justice', '2026-01-01T08:00:00Z'),
('usr-verif-1', 'Dubois', 'Claire', 'visas.rdc@diplomatie.be', '+3225018111', 'organisme_verificateur', 'actif', '286703f3b9c460cd24d597eed3a6777eed3731af134b9212538135e361caf73b', 'Section Consulaire - Ambassade de Belgique à Kinshasa', '2026-01-20T08:00:00Z');

-- 2. PARAMETRES TERRITORIAUX (Section 3.2, 5.1 & 10.4)
INSERT OR IGNORE INTO parametres_territoriaux (province, communes_json, autorite_deleguee, montant_taxe_cdf, delai_cible_heures, pieces_obligatoires_json, telephone_assistance, derniere_mise_a_jour) VALUES
('Kinshasa', 
 '["Gombe", "Lingwala", "Barumbu", "Kinshasa", "Kalamu", "Kasa-Vubu", "Ngiri-Ngiri", "Bandalungwa", "Kintambo", "Ngaliema", "Mont-Ngafula", "Selembao", "Bumbu", "Makala", "Lemba", "Ngaba", "Matete", "Limete", "Masina", "Ndjili", "Kimbanseke", "Nsele", "Maluku", "Kisenso"]',
 'Parquet de Grande Instance de Kinshasa / Gombe',
 45000,
 48,
 '["Carte d''électeur ou Passeport valide", "Photo d''identité récente 4x4", "Attestation de résidence communale"]',
 '+243 81 000 0001',
 '2026-02-15T10:00:00Z'),

('Haut-Katanga',
 '["Lubumbashi", "Kampemba", "Kenya", "Katuba", "Kamalondo", "Ruashi", "Annexe"]',
 'Parquet de Grande Instance de Lubumbashi',
 50000,
 48,
 '["Carte d''électeur ou Passeport valide", "Photo d''identité récente 4x4", "Attestation de résidence communale"]',
 '+243 81 000 0002',
 '2026-02-15T10:00:00Z'),

('Nord-Kivu',
 '["Goma", "Karisimbi", "Beni", "Butembo"]',
 'Parquet de Grande Instance de Goma',
 40000,
 72,
 '["Carte d''électeur ou Passeport valide", "Photo d''identité récente 4x4", "Attestation de résidence communale"]',
 '+243 81 000 0003',
 '2026-02-15T10:00:00Z'),

('Kongo-Central',
 '["Matadi", "Boma", "Mbanza-Ngungu", "Moanda", "Kasangulu"]',
 'Parquet de Grande Instance de Matadi',
 45000,
 48,
 '["Carte d''électeur ou Passeport valide", "Photo d''identité récente 4x4", "Attestation de résidence communale"]',
 '+243 81 000 0004',
 '2026-02-15T10:00:00Z');

-- 3. AUDIT LOG INITIAL
INSERT OR IGNORE INTO actions_audit (id, acteur, role_acteur, type_action, objet_id, horodatage, adresse_ip, details) VALUES
('aud-init-1', 'Système CertiMœurs RDC', 'Système', 'CREATION_DOSSIER', 'SYS-INIT', '2026-02-01T08:00:00Z', '127.0.0.1', 'Initialisation du registre relationnel SQL et des rôles d''accès administratifs');
