# Base de Données Relationnelle SQL - CertiMœurs RDC
## Ministère de la Justice & Garde des Sceaux - République Démocratique du Congo

Ce dossier contient l'ensemble des scripts de migration DDL, les schémas relationnels et les jeux de données d'initialisation (seeds) pour le déploiement local ou en production, conformément au **Modèle Conceptuel de Données (MCD) - Section 7.3** et aux exigences de traçabilité (**RG01 à RG06**).

---

### Architecture des Scripts de Migration

```
database/
├── migrations/
│   ├── 001_create_tables_mysql.sql   # Script complet DDL pour MySQL 8.0+ / MariaDB 10.5+
│   └── 001_create_tables_sqlite.sql  # Script DDL pour SQLite (Moteur local 100% autonome)
├── seeds/
│   └── 001_seed_initial_data.sql     # Utilisateurs par rôle, paramètres provinciaux & dossiers
└── certimoeurs.sqlite                 # Base de données locale active (auto-générée au démarrage)
```

---

### 1. Mode Local Autonome (Zero-Configuration, 100% Fonctionnel)
L'application démarre automatiquement sur un moteur SQL relationnel persistant (`certimoeurs.sqlite`) géré par le backend Express (`server.ts` via `node:sqlite`).
- **Aucune installation de serveur tiers requise** pour faire tourner le prototype complet.
- Supporte toutes les transactions, clés étrangères (`PRAGMA foreign_keys = ON;`), tables relationnelles strictes et journalisation d'audit en temps réel.
- Le fichier se trouve à la racine dans `./database/certimoeurs.sqlite`.

---

### 2. Déploiement sur Serveur MySQL 8 / MariaDB (Production ou Environnement Local Dédié)

Pour déployer sur un serveur MySQL ou MariaDB local (ex: via XAMPP, WampServer, Docker ou MySQL natif) :

#### Étape A : Exécuter la migration
```bash
mysql -u root -p < database/migrations/001_create_tables_mysql.sql
```

#### Étape B : Charger le jeu de données initial
```bash
mysql -u root -p certimoeurs_rdc < database/seeds/001_seed_initial_data.sql
```

#### Étape C : Configurer le fichier `.env`
Définir les variables d'environnement dans votre fichier `.env` :
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=certimoeurs_rdc
DB_USER=votre_utilisateur_mysql
DB_PASSWORD=votre_mot_de_passe
PORT=3000
```

---

### 3. Schéma et Tables Principales (MCD Figure 8)

1. `utilisateurs` : Gestion des comptes sécurisés et contrôle d'accès basé sur les rôles (RBAC).
   - Rôles : `citoyen`, `guichet`, `agent_instructeur`, `responsable_valideur`, `administrateur`, `organisme_verificateur`.
2. `demandes` : Dossiers officiels de demande avec cycle de vie horodaté et références certifiées.
3. `pieces_jointes` : Pièces justificatives avec empreinte numérique (SHA-256) et contrôle antivirus.
4. `biometrie` : Données de reconnaissance faciale, vivacité (liveness test) et score de concordance.
5. `paiements` : Intégration Mobile Money (M-Pesa, Orange, Airtel, Afrimoney) et quittance DGRAD.
6. `instructions` : Instruction judiciaire, vérification du Casier Judiciaire Central (B2/B3) et avis motivé.
7. `decisions` : Décision souveraine du Magistrat (Approbation scellée ou Rejet motivé avec voies de recours).
8. `certificats` : Certificat officiel émis avec QR Code scellé et durée légale de 90 jours.
9. `verifications` : Traçabilité des consultations publiques effectuées par les tiers.
10. `actions_audit` : Journal infalsifiable de non-répudiation (Règle RG04).
11. `parametres_territoriaux` : Tarifs en Francs Congolais (CDF), délais et juridictions paramétrables sans toucher au code.
