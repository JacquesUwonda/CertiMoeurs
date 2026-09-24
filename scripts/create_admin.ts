import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

// Ensure database directory exists
const dbDir = path.resolve(process.cwd(), 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'certimoeurs.sqlite');
const db = new DatabaseSync(dbPath);

db.exec('PRAGMA foreign_keys = ON;');

// Salt identical to auth.ts
const PASSWORD_SALT = 'rdc_justice_certimoeurs_salt_2026';
function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, PASSWORD_SALT, 1000, 32, 'sha256').toString('hex');
}

// Parse arguments or use defaults
const args = process.argv.slice(2);
const email = args[0] || 'admin.jacques@justice.gouv.cd';
const password = args[1] || 'Jacques2026!';
const nom = args[2] || 'Jacques';
const prenom = args[3] || 'Uwonda';
const telephone = args[4] || '+243 81 234 5678';
const adminId = 'usr-admin-1';
const jurisdiction = 'Direction des Systèmes d\'Information - Ministère de la Justice (RDC)';

console.log('==================================================================');
console.log('🏛️  MINISTÈRE DE LA JUSTICE - RÉPUBLIQUE DÉMOCRATIQUE DU CONGO');
console.log('🔐  SCRIPT DE PROVISIONNEMENT DU COMPTE ADMINISTRATEUR (CLI)');
console.log('==================================================================');

try {
  // Ensure table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS utilisateurs (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      telephone TEXT,
      role TEXT NOT NULL CHECK(role IN ('citoyen', 'guichet', 'agent_instructeur', 'responsable_valideur', 'administrateur', 'organisme_verificateur')),
      statut TEXT NOT NULL DEFAULT 'actif' CHECK(statut IN ('actif', 'suspendu', 'inactif')),
      mot_de_passe_hash TEXT,
      juridiction_deleguee TEXT,
      derniere_connexion TEXT,
      date_creation TEXT NOT NULL
    );

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
  `);

  const passwordHash = hashPassword(password);
  const now = new Date().toISOString();

  // Check if exists
  const existing = db.prepare('SELECT id, email, role FROM utilisateurs WHERE id = ? OR lower(email) = lower(?)').get(adminId, email) as any;

  if (existing) {
    db.prepare(`
      UPDATE utilisateurs
      SET nom = ?, prenom = ?, email = ?, telephone = ?, role = 'administrateur',
          statut = 'actif', mot_de_passe_hash = ?, juridiction_deleguee = ?, derniere_connexion = ?
      WHERE id = ?
    `).run(nom, prenom, email, telephone, passwordHash, jurisdiction, now, existing.id);

    console.log(`✅ Compte Administrateur mis à jour avec succès : [${existing.id}]`);
  } else {
    db.prepare(`
      INSERT INTO utilisateurs (
        id, nom, prenom, email, telephone, role, statut, mot_de_passe_hash, juridiction_deleguee, date_creation
      ) VALUES (?, ?, ?, ?, ?, 'administrateur', 'actif', ?, ?, ?)
    `).run(adminId, nom, prenom, email, telephone, passwordHash, jurisdiction, now);

    console.log(`✅ Compte Administrateur créé avec succès : [${adminId}]`);
  }

  // Audit log
  db.prepare(`
    INSERT INTO actions_audit (id, acteur, role_acteur, type_action, objet_id, horodatage, adresse_ip, details)
    VALUES (?, ?, 'administrateur', 'CREATION_DOSSIER', ?, ?, '127.0.0.1 (CLI)', ?)
  `).run(
    `aud-cli-${Date.now()}`,
    `${nom} ${prenom}`,
    adminId,
    now,
    `Création / réinitialisation du compte Super-Administrateur DSI via script CLI.`
  );

  console.log('\n📋 Identifiants de connexion :');
  console.log(`   - Identifiant / Email : ${email}`);
  console.log(`   - Mot de passe        : ${password}`);
  console.log(`   - Nom complet         : ${prenom} ${nom}`);
  console.log(`   - Rôle attribué       : ADMINISTRATEUR NATIONAL`);
  console.log(`   - Juridiction         : ${jurisdiction}`);
  console.log(`   - Base de données     : ${dbPath}`);
  console.log('==================================================================');
  console.log('ℹ️  L\'administrateur peut maintenant se connecter et créer');
  console.log('   les agents (Greffiers, Magistrats, Guichetiers, Vérificateurs)');
  console.log('   directement depuis son Tableau de Bord > Onglet Utilisateurs & Rôles.');
  console.log('==================================================================\n');
} catch (err: any) {
  console.error('❌ Erreur lors de la création de l\'administrateur :', err.message);
  process.exit(1);
}
