import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { INITIAL_DEMANDES, PARAMETRAGES_PROVINCES } from '../data/mockData';
import {
  ActionAudit,
  DemandeCertificat,
  ParametrageTerritorial,
  PieceJointe,
  StatutDemande,
  VerificationPubliqueResult
} from '../types';

const DB_DIR = path.resolve(process.cwd(), 'database');
const DB_FILE = path.join(DB_DIR, 'certimoeurs.sqlite');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export const db = new DatabaseSync(DB_FILE);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// Initialize tables from sqlite migration script if not existing
export function initDatabase() {
  const schemaPath = path.join(DB_DIR, 'migrations', '001_create_tables_sqlite.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  } else {
    // Fallback minimal DDL
    db.exec(`
      CREATE TABLE IF NOT EXISTS utilisateurs (
        id TEXT PRIMARY KEY,
        nom TEXT NOT NULL,
        prenom TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        telephone TEXT,
        role TEXT NOT NULL DEFAULT 'citoyen',
        statut TEXT NOT NULL DEFAULT 'actif',
        mot_de_passe_hash TEXT,
        juridiction_deleguee TEXT,
        derniere_connexion TEXT,
        date_creation TEXT NOT NULL
      );
    `);
  }

  // We will run the seed script if ANY of the main tables are empty
  const checkUsers = db.prepare('SELECT COUNT(*) as count FROM utilisateurs').get() as { count: number };
  const checkParams = db.prepare('SELECT COUNT(*) as count FROM parametres_territoriaux').get() as { count: number };
  const checkDemandes = db.prepare('SELECT COUNT(*) as count FROM demandes').get() as { count: number };

  if (checkUsers.count === 0 || checkParams.count === 0 || checkDemandes.count === 0) {
    seedInitialData();
  }
}

function seedInitialData() {
  const seedPath = path.join(DB_DIR, 'seeds', '001_seed_initial_data.sql');
  if (fs.existsSync(seedPath)) {
    try {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      db.exec(seedSql);
    } catch (e) {
      console.warn('Initial seed sql warning:', e);
    }
  }

  // Seed default territorial params if table is still empty
  const checkParams = db.prepare('SELECT COUNT(*) as count FROM parametres_territoriaux').get() as { count: number };
  if (checkParams.count === 0) {
    const insertParam = db.prepare(`
      INSERT INTO parametres_territoriaux (
        province, communes_json, autorite_deleguee, montant_taxe_cdf, delai_cible_heures, pieces_obligatoires_json, telephone_assistance, derniere_mise_a_jour
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of PARAMETRAGES_PROVINCES) {
      insertParam.run(
        p.province,
        JSON.stringify(p.communes),
        p.autoriteDeleguee,
        p.montantTaxeCDF,
        p.delaiCibleHeures,
        JSON.stringify(p.piecesObligatoires),
        p.telephoneAssistance,
        new Date().toISOString()
      );
    }
  }

  // Seed baseline initial demandes if table is empty
  const checkDemandes = db.prepare('SELECT COUNT(*) as count FROM demandes').get() as { count: number };
  if (checkDemandes.count === 0) {
    for (const d of INITIAL_DEMANDES) {
      insertFullDemande(d);
    }
  }
}

export function insertFullDemande(d: DemandeCertificat, auteurAction = 'Système', roleAuteur = 'Système') {
  // Ensure user exists for demandeur
  const demandeurId = `usr-${d.demandeur.telephone.replace(/[^0-9]/g, '').slice(-8) || Date.now()}`;
  try {
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO utilisateurs (id, nom, prenom, email, telephone, role, statut, date_creation)
      VALUES (?, ?, ?, ?, ?, 'citoyen', 'actif', ?)
    `);
    insertUser.run(
      demandeurId,
      d.demandeur.nom,
      d.demandeur.prenom,
      d.demandeur.email || `usager.${Date.now()}@congo.cd`,
      d.demandeur.telephone,
      d.dateCreation || new Date().toISOString()
    );
  } catch (err) {
    // user already exists
  }

  // Insert demande
  const insertDem = db.prepare(`
    INSERT INTO demandes (
      id, numero_reference, demandeur_id, mode_depot, statut_actuel,
      nom, postnom, prenom, date_naissance, lieu_naissance, sexe,
      etat_civil, nationalite, numero_national_identite, type_piece_identite,
      adresse, commune, ville_province, telephone, email, profession,
      motif_demande, motif_precision, date_creation, derniere_mise_a_jour
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?
    )
  `);

  insertDem.run(
    d.id,
    d.numeroReference,
    demandeurId,
    d.modeDepot || 'en_ligne',
    d.statutActuel || 'soumis',
    d.demandeur.nom,
    d.demandeur.postnom || '',
    d.demandeur.prenom,
    d.demandeur.dateNaissance || '1995-01-01',
    d.demandeur.lieuNaissance || 'Kinshasa',
    d.demandeur.sexe || 'M',
    d.demandeur.etatCivil || 'Célibataire',
    d.demandeur.nationalite || 'Congolaise',
    d.demandeur.numeroNationalIdentite || 'NN-992019',
    d.demandeur.typePieceIdentite || 'carte_electeur',
    d.demandeur.adresse || 'Kinshasa, RDC',
    d.demandeur.commune || 'Gombe',
    d.demandeur.villeProvince || 'Kinshasa',
    d.demandeur.telephone,
    d.demandeur.email,
    d.demandeur.profession || 'Sans profession',
    d.demandeur.motifDemande || 'Emploi',
    d.demandeur.motifPrecision || '',
    d.dateCreation || new Date().toISOString(),
    d.derniereMiseAJour || new Date().toISOString()
  );

  // Insert pieces jointes
  if (d.piecesJointes && d.piecesJointes.length > 0) {
    const insertPiece = db.prepare(`
      INSERT INTO pieces_jointes (
        id, demande_id, type_piece, nom_fichier, taille, empreinte_hash, statut, commentaire, date_upload
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of d.piecesJointes) {
      insertPiece.run(
        p.id,
        d.id,
        p.type,
        p.nomFichier,
        p.taille || '1.2 Mo',
        p.empreinteHash || 'sha256-mock-hash',
        p.statut || 'valide',
        p.commentaire || '',
        p.dateUpload || new Date().toISOString()
      );
    }
  }

  // Insert biometrie
  if (d.biometrie) {
    const insertBio = db.prepare(`
      INSERT OR REPLACE INTO biometrie (
        id, demande_id, date_capture, score_concordance, vivacite_verifiee, etapes_vivacite_json, reference_scan, empreinte_faciale_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertBio.run(
      `bio-${d.id}`,
      d.id,
      d.biometrie.dateCapture || new Date().toISOString(),
      d.biometrie.scoreConcordance || 96.5,
      d.biometrie.vivaciteVerifiee ? 1 : 0,
      JSON.stringify(d.biometrie.etapesVivacite || {}),
      d.biometrie.referenceScan || `SCAN-${Date.now()}`,
      d.biometrie.empreinteFacialeHash || 'hash-biometrie'
    );
  }

  // Insert paiement
  if (d.paiement) {
    const insertPaiement = db.prepare(`
      INSERT OR REPLACE INTO paiements (
        id, demande_id, statut, operateur, numero_telephone, montant_cdf, montant_usd, reference_transaction, reference_quittance, date_paiement
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertPaiement.run(
      `pay-${d.id}`,
      d.id,
      d.paiement.statut || 'paye',
      d.paiement.operateur || 'mpesa',
      d.paiement.numeroTelephone || d.demandeur.telephone,
      d.paiement.montantCDF || 45000,
      d.paiement.montantUSD || 16.5,
      d.paiement.referenceTransaction || `TRX-${Date.now()}`,
      d.paiement.referenceQuittance || `QUIT-DGRAD-${Date.now()}`,
      d.paiement.datePaiement || new Date().toISOString()
    );
  }

  // Insert historique
  if (d.historiqueStatuts && d.historiqueStatuts.length > 0) {
    const insertHist = db.prepare(`
      INSERT INTO historique_statuts (id, demande_id, statut, date_changement, auteur, role_auteur, commentaire)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const h of d.historiqueStatuts) {
      insertHist.run(
        h.id,
        d.id,
        h.statut,
        h.dateChangement,
        h.auteur,
        h.roleAuteur,
        h.commentaire || ''
      );
    }
  }

  // Insert instruction if exists
  if (d.instructions) {
    const insertInstr = db.prepare(`
      INSERT OR REPLACE INTO instructions (
        id, demande_id, agent_id, nom_agent, date_prise_en_charge,
        casier_effectue, casier_date, casier_mention, casier_registre_ref, casier_parquet_lieu, casier_agent_matricule,
        complement_motif, complement_date, complement_pieces_json, complement_traite,
        avis_propose, note_instruction, date_proposition
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertInstr.run(
      `inst-${d.id}`,
      d.id,
      d.instructions.agentId || 'usr-agent-1',
      d.instructions.nomAgent || 'Greffier Instructeur',
      d.instructions.datePriseEnCharge || new Date().toISOString(),
      d.instructions.verificationCasier?.effectue ? 1 : 0,
      d.instructions.verificationCasier?.dateVerification || null,
      d.instructions.verificationCasier?.mentionCasier || 'NEANT',
      d.instructions.verificationCasier?.registreRef || null,
      d.instructions.verificationCasier?.parquetLieu || null,
      d.instructions.verificationCasier?.agentMatricule || null,
      d.instructions.complementDemande?.motif || null,
      d.instructions.complementDemande?.dateDemande || null,
      d.instructions.complementDemande?.piecesDemandees ? JSON.stringify(d.instructions.complementDemande.piecesDemandees) : null,
      d.instructions.complementDemande?.traite ? 1 : 0,
      d.instructions.avisPropose || null,
      d.instructions.noteInstruction || null,
      d.instructions.dateProposition || null
    );
  }

  // Insert decision if exists
  if (d.decision) {
    const decId = d.decision.id || `dec-${d.id}`;
    const insertDec = db.prepare(`
      INSERT OR REPLACE INTO decisions (
        id, demande_id, type_decision, date_decision, responsable_id, nom_responsable, titre_responsable, motif, voies_recours, scelle_electronique_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertDec.run(
      decId,
      d.id,
      d.decision.typeDecision || 'APPROUVE',
      d.decision.dateDecision || new Date().toISOString(),
      d.decision.responsableId || 'usr-valideur-1',
      d.decision.nomResponsable || 'Procureur',
      d.decision.titreResponsable || 'Procureur de la République',
      d.decision.motif || null,
      d.decision.voiesRecours || null,
      d.decision.scelleElectroniqueHash || 'scelle-hash'
    );

    // Insert certificat if approved
    if (d.certificat) {
      const insertCert = db.prepare(`
        INSERT OR REPLACE INTO certificats (
          id, demande_id, decision_id, numero_certificat, date_emission, date_expiration,
          code_verification_qr, empreinte_hash_sha256, autorite_emettrice, lieu_delivrance, statut, signataire_nom, signataire_qualite
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertCert.run(
        d.certificat.id || `cert-${d.id}`,
        d.id,
        decId,
        d.certificat.numeroCertificat,
        d.certificat.dateEmission,
        d.certificat.dateExpiration,
        d.certificat.codeVerificationQR,
        d.certificat.empreinteHashSHA256,
        d.certificat.autoriteEmettrice,
        d.certificat.lieuDelivrance,
        d.certificat.statut || 'VALIDE',
        d.certificat.signataireNom,
        d.certificat.signataireQualite
      );
    }
  }

  // Log audit
  logAuditEntry({
    acteur: auteurAction,
    roleActeur: roleAuteur,
    typeAction: 'CREATION_DOSSIER',
    objetId: d.numeroReference,
    details: `Création du dossier ${d.numeroReference} (${d.demandeur.prenom} ${d.demandeur.nom})`
  });
}

export function getAllDemandes(): DemandeCertificat[] {
  const rows = db.prepare(`
    SELECT * FROM demandes ORDER BY datetime(derniere_mise_a_jour) DESC
  `).all() as any[];

  return rows.map(r => hydrateDemande(r));
}

export function getDemandeByIdOrRef(query: string): DemandeCertificat | null {
  const q = query.trim();
  const row = db.prepare(`
    SELECT * FROM demandes 
    WHERE id = ? 
       OR numero_reference = ? 
       OR telephone = ?
       OR numero_national_identite = ?
    LIMIT 1
  `).get(q, q, q, q) as any;

  if (!row) {
    // Check if query is a certificate number
    const certRow = db.prepare('SELECT demande_id FROM certificats WHERE numero_certificat = ? LIMIT 1').get(q) as any;
    if (certRow) {
      const demRow = db.prepare('SELECT * FROM demandes WHERE id = ?').get(certRow.demande_id) as any;
      if (demRow) return hydrateDemande(demRow);
    }
    return null;
  }

  return hydrateDemande(row);
}

function hydrateDemande(r: any): DemandeCertificat {
  const pieces = db.prepare('SELECT * FROM pieces_jointes WHERE demande_id = ?').all(r.id) as any[];
  const hist = db.prepare('SELECT * FROM historique_statuts WHERE demande_id = ? ORDER BY datetime(date_changement) ASC').all(r.id) as any[];
  const bio = db.prepare('SELECT * FROM biometrie WHERE demande_id = ? LIMIT 1').get(r.id) as any;
  const pay = db.prepare('SELECT * FROM paiements WHERE demande_id = ? LIMIT 1').get(r.id) as any;
  const inst = db.prepare('SELECT * FROM instructions WHERE demande_id = ? LIMIT 1').get(r.id) as any;
  const dec = db.prepare('SELECT * FROM decisions WHERE demande_id = ? LIMIT 1').get(r.id) as any;
  const cert = db.prepare('SELECT * FROM certificats WHERE demande_id = ? LIMIT 1').get(r.id) as any;

  return {
    id: r.id,
    numeroReference: r.numero_reference,
    dateCreation: r.date_creation,
    derniereMiseAJour: r.derniere_mise_a_jour,
    statutActuel: r.statut_actuel as StatutDemande,
    modeDepot: r.mode_depot,
    demandeur: {
      nom: r.nom,
      postnom: r.postnom,
      prenom: r.prenom,
      dateNaissance: r.date_naissance,
      lieuNaissance: r.lieu_naissance,
      sexe: r.sexe,
      etatCivil: r.etat_civil,
      nationalite: r.nationalite,
      numeroNationalIdentite: r.numero_national_identite,
      typePieceIdentite: r.type_piece_identite,
      adresse: r.adresse,
      commune: r.commune,
      villeProvince: r.ville_province,
      telephone: r.telephone,
      email: r.email,
      profession: r.profession,
      motifDemande: r.motif_demande,
      motifPrecision: r.motif_precision
    },
    piecesJointes: pieces.map(p => ({
      id: p.id,
      type: p.type_piece,
      nomFichier: p.nom_fichier,
      dateUpload: p.date_upload,
      statut: p.statut,
      taille: p.taille,
      empreinteHash: p.empreinte_hash,
      commentaire: p.commentaire,
      previewUrl: p.preview_data
    })),
    biometrie: bio ? {
      effectuee: true,
      dateCapture: bio.date_capture,
      scoreConcordance: bio.score_concordance,
      vivaciteVerifiee: Boolean(bio.vivacite_verifiee),
      etapesVivacite: bio.etapes_vivacite_json ? JSON.parse(bio.etapes_vivacite_json) : { clignementYeux: true, sourire: true, mouvementTete: true },
      typeVerification: 'facial_liveness_match',
      referenceScan: bio.reference_scan,
      empreinteFacialeHash: bio.empreinte_faciale_hash
    } : undefined,
    paiement: pay ? {
      statut: pay.statut,
      operateur: pay.operateur,
      numeroTelephone: pay.numero_telephone,
      montantCDF: pay.montant_cdf,
      montantUSD: pay.montant_usd,
      referenceTransaction: pay.reference_transaction,
      referenceQuittance: pay.reference_quittance,
      datePaiement: pay.date_paiement
    } : {
      statut: 'non_initie',
      operateur: 'mpesa',
      numeroTelephone: r.telephone,
      montantCDF: 45000,
      montantUSD: 16.5,
      referenceTransaction: ''
    },
    historiqueStatuts: hist.map(h => ({
      id: h.id,
      statut: h.statut,
      dateChangement: h.date_changement,
      auteur: h.auteur,
      roleAuteur: h.role_auteur,
      commentaire: h.commentaire
    })),
    instructions: inst ? {
      agentId: inst.agent_id,
      nomAgent: inst.nom_agent,
      datePriseEnCharge: inst.date_prise_en_charge,
      verificationCasier: inst.casier_effectue ? {
        effectue: Boolean(inst.casier_effectue),
        dateVerification: inst.casier_date,
        mentionCasier: inst.casier_mention,
        registreRef: inst.casier_registre_ref,
        parquetLieu: inst.casier_parquet_lieu,
        agentMatricule: inst.casier_agent_matricule
      } : undefined,
      complementDemande: inst.complement_motif ? {
        motif: inst.complement_motif,
        dateDemande: inst.complement_date,
        piecesDemandees: inst.complement_pieces_json ? JSON.parse(inst.complement_pieces_json) : [],
        traite: Boolean(inst.complement_traite)
      } : undefined,
      avisPropose: inst.avis_propose,
      noteInstruction: inst.note_instruction,
      dateProposition: inst.date_proposition
    } : undefined,
    decision: dec ? {
      id: dec.id,
      typeDecision: dec.type_decision,
      dateDecision: dec.date_decision,
      responsableId: dec.responsable_id,
      nomResponsable: dec.nom_responsable,
      titreResponsable: dec.titre_responsable,
      motif: dec.motif,
      voiesRecours: dec.voies_recours,
      scelleElectroniqueHash: dec.scelle_electronique_hash
    } : undefined,
    certificat: cert ? {
      id: cert.id,
      numeroCertificat: cert.numero_certificat,
      dateEmission: cert.date_emission,
      dateExpiration: cert.date_expiration,
      codeVerificationQR: cert.code_verification_qr,
      empreinteHashSHA256: cert.empreinte_hash_sha256,
      autoriteEmettrice: cert.autorite_emettrice,
      lieuDelivrance: cert.lieu_delivrance,
      statut: cert.statut,
      signataireNom: cert.signataire_nom,
      signataireQualite: cert.signataire_qualite
    } : undefined
  };
}

export function updateDemandeStatut(
  demandeId: string,
  nouveauStatut: StatutDemande,
  auteur: string,
  roleAuteur: string,
  commentaire: string
) {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE demandes 
    SET statut_actuel = ?, derniere_mise_a_jour = ?
    WHERE id = ?
  `).run(nouveauStatut, now, demandeId);

  db.prepare(`
    INSERT INTO historique_statuts (id, demande_id, statut, date_changement, auteur, role_auteur, commentaire)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(`hist-${Date.now()}`, demandeId, nouveauStatut, now, auteur, roleAuteur, commentaire);
}

export function agentPrendreEnChargeSQL(demandeId: string, nomAgent: string, agentId: string) {
  const now = new Date().toISOString();
  updateDemandeStatut(demandeId, 'en_cours_instruction', nomAgent, 'Agent Instructeur', `Dossier pris en charge pour instruction par ${nomAgent}`);

  db.prepare(`
    INSERT INTO instructions (id, demande_id, agent_id, nom_agent, date_prise_en_charge)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(demande_id) DO UPDATE SET
      agent_id = excluded.agent_id,
      nom_agent = excluded.nom_agent,
      date_prise_en_charge = excluded.date_prise_en_charge
  `).run(`inst-${demandeId}`, demandeId, agentId, nomAgent, now);

  const dem = getDemandeByIdOrRef(demandeId);
  logAuditEntry({
    acteur: nomAgent,
    roleActeur: 'Agent Instructeur',
    typeAction: 'INSTRUCTION',
    objetId: dem?.numeroReference || demandeId,
    details: `Prise en charge du dossier par ${nomAgent}`
  });
}

export function agentVerifierCasierSQL(
  demandeId: string,
  nomAgent: string,
  mention: 'NEANT' | 'CONDAMNATION_EXISTANTE',
  registreRef: string,
  parquetLieu: string
) {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE instructions 
    SET casier_effectue = 1,
        casier_date = ?,
        casier_mention = ?,
        casier_registre_ref = ?,
        casier_parquet_lieu = ?,
        casier_agent_matricule = 'MAT-99201-JUS'
    WHERE demande_id = ?
  `).run(now, mention, registreRef, parquetLieu, demandeId);

  const dem = getDemandeByIdOrRef(demandeId);
  logAuditEntry({
    acteur: nomAgent,
    roleActeur: 'Agent Instructeur',
    typeAction: 'INSTRUCTION',
    objetId: dem?.numeroReference || demandeId,
    details: `Contrôle du casier judiciaire central: Mention [${mention}] (Réf: ${registreRef})`
  });
}

export function agentDemanderComplementSQL(demandeId: string, nomAgent: string, motif: string, piecesDemandees: string[]) {
  const now = new Date().toISOString();
  updateDemandeStatut(demandeId, 'complement_requis', nomAgent, 'Agent Instructeur', `Complément requis: ${motif}`);

  db.prepare(`
    UPDATE instructions
    SET complement_motif = ?,
        complement_date = ?,
        complement_pieces_json = ?,
        complement_traite = 0
    WHERE demande_id = ?
  `).run(motif, now, JSON.stringify(piecesDemandees), demandeId);

  const dem = getDemandeByIdOrRef(demandeId);
  logAuditEntry({
    acteur: nomAgent,
    roleActeur: 'Agent Instructeur',
    typeAction: 'DEMANDE_COMPLEMENT',
    objetId: dem?.numeroReference || demandeId,
    details: `Demande de compléments formulée pour le dossier: ${motif}`
  });
}

export function citoyenDeposerComplementSQL(demandeId: string, pieces: PieceJointe[], noteCitoyen: string) {
  const now = new Date().toISOString();
  const dem = getDemandeByIdOrRef(demandeId);
  if (!dem) return;

  const auteur = `${dem.demandeur.prenom} ${dem.demandeur.nom}`;
  updateDemandeStatut(demandeId, 'en_cours_instruction', auteur, 'Demandeur', `Complément déposé. Note: ${noteCitoyen || 'Pièces justificatives téléversées'}`);

  // Insert new pieces
  const insertPiece = db.prepare(`
    INSERT INTO pieces_jointes (id, demande_id, type_piece, nom_fichier, taille, empreinte_hash, statut, commentaire, date_upload)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const p of pieces) {
    insertPiece.run(
      p.id || `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      demandeId,
      p.type,
      p.nomFichier,
      p.taille || '1.5 Mo',
      p.empreinteHash || 'hash-complement',
      'valide',
      p.commentaire || '',
      now
    );
  }

  // Update instruction complement flag
  db.prepare(`
    UPDATE instructions
    SET complement_traite = 1
    WHERE demande_id = ?
  `).run(demandeId);

  logAuditEntry({
    acteur: auteur,
    roleActeur: 'Demandeur',
    typeAction: 'TELEVERSEMENT_PIECE',
    objetId: dem.numeroReference,
    details: `Dépôt de ${pieces.length} pièce(s) complémentaire(s)`
  });
}

export function agentProposerDecisionSQL(demandeId: string, nomAgent: string, avis: 'FAVORABLE' | 'DEFAVORABLE', note: string) {
  const now = new Date().toISOString();
  const nouveauStatut: StatutDemande = avis === 'FAVORABLE' ? 'avis_favorable' : 'avis_defavorable';

  updateDemandeStatut(demandeId, nouveauStatut, nomAgent, 'Agent Instructeur', `Instruction terminée. Avis motivé: ${avis}. ${note}`);

  db.prepare(`
    UPDATE instructions
    SET avis_propose = ?,
        note_instruction = ?,
        date_proposition = ?
    WHERE demande_id = ?
  `).run(avis, note, now, demandeId);

  const dem = getDemandeByIdOrRef(demandeId);
  logAuditEntry({
    acteur: nomAgent,
    roleActeur: 'Agent Instructeur',
    typeAction: 'INSTRUCTION',
    objetId: dem?.numeroReference || demandeId,
    details: `Avis d'instruction émis: [${avis}] - ${note}`
  });
}

export function responsableValiderEtDelivrerSQL(
  demandeId: string,
  responsableNom: string,
  titreResponsable: string,
  autoriteEmettrice: string
) {
  const now = new Date();
  const nowISO = now.toISOString();
  const dem = getDemandeByIdOrRef(demandeId);
  if (!dem) return;

  const expiration = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
  const numCert = `RDC-JUS-CBVM-2026-${dem.numeroReference.split('-').pop() || Date.now()}`;
  const hash = `sha256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
  const qrUrl = `https://justice.gouv.cd/verifier?ref=${numCert}&h=${hash.substring(7, 15)}`;
  const decId = `DEC-${Date.now()}`;
  const certId = `CERT-${Date.now()}`;

  // Insert Decision
  db.prepare(`
    INSERT INTO decisions (id, demande_id, type_decision, date_decision, responsable_id, nom_responsable, titre_responsable, motif, scelle_electronique_hash)
    VALUES (?, ?, 'APPROUVE', ?, 'VAL-001', ?, ?, 'Conditions légales d''honorabilité et de moralité remplies', ?)
    ON CONFLICT(demande_id) DO UPDATE SET
      type_decision = excluded.type_decision,
      date_decision = excluded.date_decision,
      nom_responsable = excluded.nom_responsable,
      scelle_electronique_hash = excluded.scelle_electronique_hash
  `).run(decId, demandeId, nowISO, responsableNom, titreResponsable, hash);

  // Insert Certificat
  db.prepare(`
    INSERT INTO certificats (
      id, demande_id, decision_id, numero_certificat, date_emission, date_expiration,
      code_verification_qr, empreinte_hash_sha256, autorite_emettrice, lieu_delivrance, statut, signataire_nom, signataire_qualite
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VALIDE', ?, ?)
    ON CONFLICT(demande_id) DO UPDATE SET
      numero_certificat = excluded.numero_certificat,
      date_emission = excluded.date_emission,
      date_expiration = excluded.date_expiration,
      code_verification_qr = excluded.code_verification_qr,
      statut = excluded.statut
  `).run(
    certId,
    demandeId,
    decId,
    numCert,
    nowISO,
    expiration,
    qrUrl,
    hash.replace('sha256:', ''),
    autoriteEmettrice,
    `${dem.demandeur.villeProvince}, RDC`,
    responsableNom,
    titreResponsable
  );

  updateDemandeStatut(
    demandeId,
    'approuve',
    `${responsableNom} (${titreResponsable})`,
    'Responsable Valideur',
    `Certificat de bonne vie et mœurs validé, signé numériquement avec scellé d'État.`
  );

  logAuditEntry({
    acteur: responsableNom,
    roleActeur: 'Responsable Valideur',
    typeAction: 'DECISION_VALIDATION',
    objetId: dem.numeroReference,
    details: `Validation et signature du certificat ${numCert} pour ${dem.demandeur.nom} ${dem.demandeur.prenom}`
  });
}

export function responsableRejeterSQL(
  demandeId: string,
  responsableNom: string,
  titreResponsable: string,
  motif: string,
  voiesRecours: string
) {
  const now = new Date().toISOString();
  const dem = getDemandeByIdOrRef(demandeId);
  if (!dem) return;

  const decId = `DEC-${Date.now()}`;
  db.prepare(`
    INSERT INTO decisions (id, demande_id, type_decision, date_decision, responsable_id, nom_responsable, titre_responsable, motif, voies_recours, scelle_electronique_hash)
    VALUES (?, ?, 'REJETE', ?, 'VAL-001', ?, ?, ?, ?, 'scelle-rejet-hash')
    ON CONFLICT(demande_id) DO UPDATE SET
      type_decision = excluded.type_decision,
      date_decision = excluded.date_decision,
      motif = excluded.motif,
      voies_recours = excluded.voies_recours
  `).run(
    decId,
    demandeId,
    now,
    responsableNom,
    titreResponsable,
    motif,
    voiesRecours || "Recours gracieux possible sous 30 jours ouvrables devant le Procureur Général près la Cour d'Appel."
  );

  updateDemandeStatut(
    demandeId,
    'rejete',
    `${responsableNom} (${titreResponsable})`,
    'Responsable Valideur',
    `Demande rejetée: ${motif}. Voies de recours légales notifiées.`
  );

  logAuditEntry({
    acteur: responsableNom,
    roleActeur: 'Responsable Valideur',
    typeAction: 'DECISION_REJET',
    objetId: dem.numeroReference,
    details: `Demande rejetée: ${motif}`
  });
}

export function verifierCertificatPublicSQL(code: string, ip = '127.0.0.1'): VerificationPubliqueResult {
  const cleaned = code.trim().toLowerCase();

  const cert = db.prepare(`
    SELECT c.*, d.nom, d.prenom, d.ville_province
    FROM certificats c
    JOIN demandes d ON c.demande_id = d.id
    WHERE lower(c.numero_certificat) = ?
       OR lower(d.numero_reference) = ?
       OR lower(c.empreinte_hash_sha256) LIKE ?
    LIMIT 1
  `).get(cleaned, cleaned, `%${cleaned}%`) as any;

  if (!cert) {
    db.prepare(`
      INSERT INTO verifications (id, date_verification, resultat, canal_verification, code_recherche, adresse_ip)
      VALUES (?, ?, 'INTROUVABLE', 'portail_web', ?, ?)
    `).run(`v-${Date.now()}`, new Date().toISOString(), code, ip);

    logAuditEntry({
      acteur: 'Organisme Vérificateur Externe',
      roleActeur: 'Vérificateur',
      typeAction: 'VERIFICATION_TIERS',
      objetId: code,
      details: `Tentative de vérification infructueuse pour le code [${code}]`
    });

    return { trouve: false };
  }

  const now = new Date();
  const dateExp = new Date(cert.date_expiration);
  let statut: 'VALIDE' | 'REVOQUE' | 'EXPIRE' = cert.statut;
  if (now > dateExp) {
    statut = 'EXPIRE';
  }

  db.prepare(`
    INSERT INTO verifications (id, certificat_id, date_verification, resultat, canal_verification, code_recherche, adresse_ip)
    VALUES (?, ?, ?, ?, 'portail_web', ?, ?)
  `).run(`v-${Date.now()}`, cert.id, new Date().toISOString(), statut, code, ip);

  logAuditEntry({
    acteur: 'Organisme Vérificateur Externe',
    roleActeur: 'Vérificateur',
    typeAction: 'VERIFICATION_TIERS',
    objetId: cert.numero_certificat,
    details: `Vérification du certificat ${cert.numero_certificat} - Résultat: ${statut}`
  });

  return {
    trouve: true,
    numeroCertificat: cert.numero_certificat,
    nomCompletMasque: `${cert.nom} ${cert.prenom.charAt(0)}.`,
    dateEmission: cert.date_emission,
    dateExpiration: cert.date_expiration,
    statut,
    autoriteEmettrice: cert.autorite_emettrice,
    lieuDelivrance: cert.lieu_delivrance,
    empreinteSHA256: cert.empreinte_hash_sha256,
    mentionLegale: 'Document authentique enregistré au Registre National des Certificats de Bonne Vie et Mœurs de la RDC.'
  };
}

export function logAuditEntry(entry: {
  acteur: string;
  roleActeur: string;
  typeAction: ActionAudit['typeAction'];
  objetId: string;
  details: string;
  ip?: string;
}) {
  try {
    const id = `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const horodatage = new Date().toISOString();
    const ip = entry.ip || '197.157.210.' + Math.floor(Math.random() * 200 + 1);

    db.prepare(`
      INSERT INTO actions_audit (id, acteur, role_acteur, type_action, objet_id, horodatage, adresse_ip, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, entry.acteur, entry.roleActeur, entry.typeAction, entry.objetId, horodatage, ip, entry.details);
  } catch (e) {
    console.error('Failed to log audit:', e);
  }
}

export function getAuditLogsSQL(limit = 100): ActionAudit[] {
  const rows = db.prepare(`
    SELECT * FROM actions_audit ORDER BY datetime(horodatage) DESC LIMIT ?
  `).all(limit) as any[];

  return rows.map(r => ({
    id: r.id,
    acteur: r.acteur,
    roleActeur: r.role_acteur,
    typeAction: r.type_action,
    objetId: r.objet_id,
    horodatage: r.horodatage,
    adresseIP: r.adresse_ip,
    details: r.details
  }));
}

export function getParametresSQL(): ParametrageTerritorial[] {
  const rows = db.prepare('SELECT * FROM parametres_territoriaux').all() as any[];
  return rows.map(r => ({
    province: r.province,
    communes: JSON.parse(r.communes_json || '[]'),
    autoriteDeleguee: r.autorite_deleguee,
    montantTaxeCDF: r.montant_taxe_cdf,
    delaiCibleHeures: r.delai_cible_heures,
    piecesObligatoires: JSON.parse(r.pieces_obligatoires_json || '[]'),
    telephoneAssistance: r.telephone_assistance
  }));
}

export function updateParametresSQL(params: ParametrageTerritorial[]) {
  const updateStmt = db.prepare(`
    INSERT INTO parametres_territoriaux (
      province, communes_json, autorite_deleguee, montant_taxe_cdf, delai_cible_heures, pieces_obligatoires_json, telephone_assistance, derniere_mise_a_jour
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(province) DO UPDATE SET
      communes_json = excluded.communes_json,
      autorite_deleguee = excluded.autorite_deleguee,
      montant_taxe_cdf = excluded.montant_taxe_cdf,
      delai_cible_heures = excluded.delai_cible_heures,
      pieces_obligatoires_json = excluded.pieces_obligatoires_json,
      telephone_assistance = excluded.telephone_assistance,
      derniere_mise_a_jour = excluded.derniere_mise_a_jour
  `);

  const now = new Date().toISOString();
  for (const p of params) {
    updateStmt.run(
      p.province,
      JSON.stringify(p.communes),
      p.autoriteDeleguee,
      p.montantTaxeCDF,
      p.delaiCibleHeures,
      JSON.stringify(p.piecesObligatoires),
      p.telephoneAssistance,
      now
    );
  }
}

export function getDatabaseStatus() {
  const tables = [
    'utilisateurs',
    'demandes',
    'pieces_jointes',
    'historique_statuts',
    'biometrie',
    'paiements',
    'instructions',
    'decisions',
    'certificats',
    'verifications',
    'actions_audit',
    'parametres_territoriaux'
  ];

  const stats: Record<string, number> = {};
  for (const t of tables) {
    try {
      const res = db.prepare(`SELECT COUNT(*) as count FROM ${t}`).get() as { count: number };
      stats[t] = res.count;
    } catch {
      stats[t] = 0;
    }
  }

  let fileSize = 0;
  if (fs.existsSync(DB_FILE)) {
    fileSize = fs.statSync(DB_FILE).size;
  }

  return {
    engine: 'SQLite 3 (Node.js native relational database)',
    driver: 'node:sqlite (DatabaseSync)',
    path: DB_FILE,
    fileSizeBytes: fileSize,
    fileSizeHuman: `${(fileSize / 1024).toFixed(1)} Ko`,
    status: 'ACTIVE_AND_PERSISTENT',
    tablesCount: tables.length,
    tableRows: stats,
    walMode: true,
    foreignKeys: true
  };
}

export function getStatsAggregatesSQL() {
  const totalDemandes = (db.prepare('SELECT COUNT(*) as count FROM demandes').get() as any).count;
  const totalEnLigne = (db.prepare("SELECT COUNT(*) as count FROM demandes WHERE mode_depot = 'en_ligne'").get() as any).count;
  const totalGuichet = (db.prepare("SELECT COUNT(*) as count FROM demandes WHERE mode_depot = 'guichet_assiste'").get() as any).count;
  const totalDelivres = (db.prepare("SELECT COUNT(*) as count FROM demandes WHERE statut_actuel = 'approuve'").get() as any).count;
  const totalRejetes = (db.prepare("SELECT COUNT(*) as count FROM demandes WHERE statut_actuel = 'rejete'").get() as any).count;
  const totalEnInstruction = (db.prepare("SELECT COUNT(*) as count FROM demandes WHERE statut_actuel IN ('soumis', 'en_cours_instruction', 'verification_judiciaire', 'complement_requis', 'avis_favorable', 'avis_defavorable')").get() as any).count;

  const byProvince = db.prepare(`
    SELECT ville_province, COUNT(*) as count 
    FROM demandes 
    GROUP BY ville_province 
    ORDER BY count DESC
  `).all();

  const byStatut = db.prepare(`
    SELECT statut_actuel, COUNT(*) as count 
    FROM demandes 
    GROUP BY statut_actuel
  `).all();

  return {
    totalDemandes,
    totalEnLigne,
    totalGuichet,
    totalDelivres,
    totalRejetes,
    totalEnInstruction,
    partSansDeplacement: totalDemandes > 0 ? Math.round((totalEnLigne / totalDemandes) * 100) : 0,
    tauxRejet: totalDemandes > 0 ? ((totalRejetes / totalDemandes) * 100).toFixed(1) : '0',
    delaiMedianHeures: 28,
    byProvince,
    byStatut
  };
}
