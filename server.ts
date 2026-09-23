import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { 
  initDatabase,
  getAllDemandes,
  getDemandeByIdOrRef,
  insertFullDemande,
  agentPrendreEnChargeSQL,
  agentVerifierCasierSQL,
  agentDemanderComplementSQL,
  citoyenDeposerComplementSQL,
  agentProposerDecisionSQL,
  responsableValiderEtDelivrerSQL,
  responsableRejeterSQL,
  verifierCertificatPublicSQL,
  getAuditLogsSQL,
  getParametresSQL,
  updateParametresSQL,
  getDatabaseStatus,
  getStatsAggregatesSQL,
  logAuditEntry,
  db
} from './src/server/db';
import { 
  authenticateUserSQL, 
  registerCitizenSQL, 
  getUserFromTokenSQL,
  hashPassword 
} from './src/server/auth';
import { DemandeCertificat } from './src/types';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Initialize Database (Schema & Seeds)
initDatabase();

app.use(express.json({ limit: '15mb' }));

// -------------------------------------------------------------
// REST API ROUTES - AUTHENTIFICATION PAR BASE DE DONNÉES
// -------------------------------------------------------------

// Connexion sécurisée avec vérification dans la table 'utilisateurs'
app.post('/api/auth/login', (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifiant (email ou téléphone) et mot de passe requis.' });
    }

    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const authResult = authenticateUserSQL(identifier, password, ip);

    if (!authResult) {
      return res.status(401).json({ error: 'Identifiant ou mot de passe invalide, ou compte inactif.' });
    }

    res.json(authResult);
  } catch (err: any) {
    console.error('Erreur API Login:', err);
    res.status(500).json({ error: err.message });
  }
});

// Création de compte citoyen dans la table 'utilisateurs'
app.post('/api/auth/register', (req, res) => {
  try {
    const { nom, prenom, email, telephone, password, commune, villeProvince } = req.body;
    if (!nom || !prenom || !email || !telephone) {
      return res.status(400).json({ error: 'Nom, prénom, email et téléphone obligatoires.' });
    }

    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const result = registerCitizenSQL({
      nom,
      prenom,
      email,
      telephone,
      password: password || 'Justice2026!',
      commune,
      villeProvince
    }, ip);

    res.status(201).json(result);
  } catch (err: any) {
    if (err.message?.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Un compte avec cette adresse email ou ce téléphone existe déjà.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Vérification de session active depuis la base de données
app.get('/api/auth/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    const user = getUserFromTokenSQL(token);

    if (!user) {
      return res.status(401).json({ error: 'Session expirée ou utilisateur introuvable.' });
    }

    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Déconnexion avec traçabilité dans actions_audit
app.post('/api/auth/logout', (req, res) => {
  try {
    const { userId, nomComplet, role } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';

    if (userId) {
      logAuditEntry({
        acteur: nomComplet || 'Utilisateur',
        roleActeur: role || 'Inconnu',
        typeAction: 'CONNEXION',
        objetId: userId,
        details: 'Déconnexion volontaire de la session sécurisée.',
        ip
      });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DB Status & System Information
app.get('/api/db/status', (_req, res) => {
  try {
    const status = getDatabaseStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DB Migration Scripts Info (Download/View)
app.get('/api/db/migrations', (_req, res) => {
  try {
    const migrationsDir = path.resolve(process.cwd(), 'database', 'migrations');
    const mysqlFile = path.join(migrationsDir, '001_create_tables_mysql.sql');
    const sqliteFile = path.join(migrationsDir, '001_create_tables_sqlite.sql');

    const mysqlSql = fs.existsSync(mysqlFile) ? fs.readFileSync(mysqlFile, 'utf8') : '';
    const sqliteSql = fs.existsSync(sqliteFile) ? fs.readFileSync(sqliteFile, 'utf8') : '';

    res.json({
      activeEngine: 'SQLite 3 (Mode Local Fonctionnel)',
      productionReady: 'MySQL 8 / MariaDB',
      mysqlScript: mysqlSql,
      sqliteScript: sqliteSql
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Utilisateurs (Pour la gestion des rôles et profils)
app.get('/api/utilisateurs', (_req, res) => {
  try {
    const users = db.prepare('SELECT id, nom, prenom, email, telephone, role, statut, juridiction_deleguee, date_creation, derniere_connexion FROM utilisateurs ORDER BY date_creation DESC').all();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Création d'un agent / collaborateur par l'Administrateur (RBAC)
app.post('/api/admin/users', (req, res) => {
  try {
    const { nom, prenom, email, telephone, role, juridiction_deleguee, password } = req.body;
    if (!nom || !prenom || !email || !role) {
      return res.status(400).json({ error: 'Nom, prénom, email et rôle sont obligatoires.' });
    }

    const validRoles = ['guichet', 'agent_instructeur', 'responsable_valideur', 'organisme_verificateur', 'administrateur', 'citoyen'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Rôle invalide. Rôles autorisés: ${validRoles.join(', ')}` });
    }

    const prefixMap: Record<string, string> = {
      guichet: 'usr-guichet',
      agent_instructeur: 'usr-agent',
      responsable_valideur: 'usr-valideur',
      organisme_verificateur: 'usr-verif',
      administrateur: 'usr-admin',
      citoyen: 'usr-citoyen'
    };

    const userId = `${prefixMap[role] || 'usr'}-${Date.now().toString().slice(-6)}`;
    const passHash = hashPassword(password || 'Justice2026!');
    const now = new Date().toISOString();
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';

    db.prepare(`
      INSERT INTO utilisateurs (
        id, nom, prenom, email, telephone, role, statut, mot_de_passe_hash, juridiction_deleguee, date_creation
      ) VALUES (?, ?, ?, ?, ?, ?, 'actif', ?, ?, ?)
    `).run(
      userId,
      nom,
      prenom,
      email.trim().toLowerCase(),
      telephone || '+243 80 000 0000',
      role,
      passHash,
      juridiction_deleguee || 'Ministère de la Justice',
      now
    );

    logAuditEntry({
      acteur: 'Administrateur DSI',
      roleActeur: 'administrateur',
      typeAction: 'CREATION_DOSSIER',
      objetId: userId,
      details: `Création du compte agent [${prenom} ${nom}] avec le rôle [${role}] rattaché à [${juridiction_deleguee || 'Siège'}]`,
      ip
    });

    res.status(201).json({
      id: userId,
      nom,
      prenom,
      email,
      telephone,
      role,
      statut: 'actif',
      juridiction_deleguee,
      date_creation: now
    });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Un utilisateur avec cette adresse email existe déjà.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Mise à jour du statut d'un agent (Actif / Suspendu)
app.patch('/api/admin/users/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    if (!statut || !['actif', 'suspendu', 'inactif'].includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide (actif ou suspendu attendu).' });
    }

    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    db.prepare('UPDATE utilisateurs SET statut = ? WHERE id = ?').run(statut, id);

    logAuditEntry({
      acteur: 'Administrateur DSI',
      roleActeur: 'administrateur',
      typeAction: 'INSTRUCTION',
      objetId: id,
      details: `Modification du statut de l'utilisateur ${id} vers: ${statut}`,
      ip
    });

    res.json({ success: true, id, statut });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Suppression d'un agent
app.delete('/api/admin/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';

    db.prepare('DELETE FROM utilisateurs WHERE id = ?').run(id);

    logAuditEntry({
      acteur: 'Administrateur DSI',
      roleActeur: 'administrateur',
      typeAction: 'DECISION_REJET',
      objetId: id,
      details: `Suppression du compte utilisateur/agent ${id} de la base de données.`,
      ip
    });

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Demandes - Liste complète ou filtrée
app.get('/api/demandes', (_req, res) => {
  try {
    const demandes = getAllDemandes();
    res.json(demandes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Demande par ID ou Référence
app.get('/api/demandes/:ref', (req, res) => {
  try {
    const dem = getDemandeByIdOrRef(req.params.ref);
    if (!dem) {
      return res.status(404).json({ error: 'Dossier introuvable' });
    }
    res.json(dem);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Création d'une nouvelle demande
app.post('/api/demandes', (req, res) => {
  try {
    const body = req.body;
    const provinceCode = body.demandeur?.villeProvince?.slice(0, 3).toUpperCase() || 'RDC';
    const randNum = Math.floor(100000 + Math.random() * 900000);
    const ref = body.numeroReference || `CBVM-2026-${provinceCode}-${randNum}`;
    const now = new Date().toISOString();

    const demandeComplete: DemandeCertificat = {
      ...body,
      id: body.id || `dem-${Date.now()}`,
      numeroReference: ref,
      dateCreation: now,
      derniereMiseAJour: now,
      statutActuel: body.statutActuel || 'soumis',
      historiqueStatuts: [
        {
          id: `hist-${Date.now()}`,
          statut: body.statutActuel || 'soumis',
          dateChangement: now,
          auteur: `${body.demandeur.prenom} ${body.demandeur.nom}`,
          roleAuteur: body.modeDepot === 'guichet_assiste' ? 'Guichetier Assisté' : 'Demandeur',
          commentaire: body.modeDepot === 'guichet_assiste' 
            ? 'Dossier enregistré au guichet communal assisté' 
            : 'Création et transmission du dossier en ligne'
        }
      ]
    };

    insertFullDemande(
      demandeComplete, 
      `${body.demandeur.prenom} ${body.demandeur.nom}`,
      body.modeDepot === 'guichet_assiste' ? 'Guichet' : 'Demandeur'
    );

    res.status(201).json(demandeComplete);
  } catch (err: any) {
    console.error('Erreur creation demande:', err);
    res.status(500).json({ error: err.message });
  }
});

// Agent Instructeur - Actions
app.put('/api/demandes/:id/instruction', (req, res) => {
  try {
    const { id } = req.params;
    const { actionType, nomAgent, agentId, mentionCasier, registreRef, parquetLieu, motif, piecesDemandees, avis, note } = req.body;

    if (actionType === 'PRENDRE_EN_CHARGE') {
      agentPrendreEnChargeSQL(id, nomAgent || 'Agent Parquet', agentId || 'usr-agent-1');
    } else if (actionType === 'VERIFIER_CASIER') {
      agentVerifierCasierSQL(id, nomAgent || 'Agent Parquet', mentionCasier || 'NEANT', registreRef || 'REG-2026-B2', parquetLieu || 'Kinshasa/Gombe');
    } else if (actionType === 'DEMANDER_COMPLEMENT') {
      agentDemanderComplementSQL(id, nomAgent || 'Agent Parquet', motif || 'Pièce illisible', piecesDemandees || []);
    } else if (actionType === 'PROPOSER_DECISION') {
      agentProposerDecisionSQL(id, nomAgent || 'Agent Parquet', avis || 'FAVORABLE', note || 'Avis favorable');
    }

    const updated = getDemandeByIdOrRef(id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Citoyen - Dépôt de compléments
app.post('/api/demandes/:id/complement', (req, res) => {
  try {
    const { id } = req.params;
    const { pieces, noteCitoyen } = req.body;
    citoyenDeposerComplementSQL(id, pieces || [], noteCitoyen || '');
    const updated = getDemandeByIdOrRef(id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Responsable Valideur (Magistrat) - Décision
app.put('/api/demandes/:id/decision', (req, res) => {
  try {
    const { id } = req.params;
    const { decisionType, responsableNom, titreResponsable, autoriteEmettrice, motif, voiesRecours } = req.body;

    if (decisionType === 'APPROUVE') {
      responsableValiderEtDelivrerSQL(
        id, 
        responsableNom || 'Antoine Malamba', 
        titreResponsable || 'Procureur de la République', 
        autoriteEmettrice || 'Parquet de Grande Instance de Kinshasa / Gombe'
      );
    } else if (decisionType === 'REJETE') {
      responsableRejeterSQL(
        id, 
        responsableNom || 'Antoine Malamba', 
        titreResponsable || 'Procureur de la République', 
        motif || 'Condamnation inscrite au casier judiciaire central.', 
        voiesRecours || 'Recours gracieux sous 30 jours ouvrables devant le Procureur Général.'
      );
    }

    const updated = getDemandeByIdOrRef(id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vérification Publique Tiers (Ambassades, Banques, etc. - RG05)
app.get('/api/verify/:code', (req, res) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const result = verifierCertificatPublicSQL(req.params.code, ip);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Audit Logs (RG04)
app.get('/api/audit', (_req, res) => {
  try {
    const logs = getAuditLogsSQL(150);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Paramétrage des règles territoriales
app.get('/api/parametres', (_req, res) => {
  try {
    const params = getParametresSQL();
    res.json(params);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/parametres', (req, res) => {
  try {
    updateParametresSQL(req.body);
    const params = getParametresSQL();
    res.json(params);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// KPIs et agrégations (Section 10.4)
app.get('/api/stats', (_req, res) => {
  try {
    const stats = getStatsAggregatesSQL();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// VITE OR STATIC ASSETS HANDLER
// -------------------------------------------------------------
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CertiMoeurs RDC] Server running on port ${PORT}`);
    console.log(`[CertiMoeurs RDC] Relational SQLite DB active at ./database/certimoeurs.sqlite`);
  });
}

setupViteOrStatic().catch(err => {
  console.error('Failed to start server:', err);
});
