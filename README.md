# 🏛️ CertiMœurs RDC — Plateforme Nationale de Dématérialisation du Certificat de Bonne Vie et Mœurs

> **Ministère de la Justice et Garde des Sceaux — République Démocratique du Congo**  
> Système Numérique National Intégré de Délivrance et de Vérification des Certificats de Bonne Vie et Mœurs avec Biométrie Sécurisée et Paiement Mobile.

---

## 📌 Présentation Générale

**CertiMœurs RDC** est la solution officielle de modernisation et de digitalisation intégrale du processus d'octroi du Certificat de Bonne Vie et Mœurs en République Démocratique du Congo. 

Conçue dans le respect strict des spécifications fonctionnelles ministérielles et de la modélisation BPMN 2.0, l'application élimine la lenteur administrative, la fraude documentaire et les tracasseries physiques grâce à :
1. **L'enrôlement et l'authentification sécurisée des citoyens** directement depuis le portail public.
2. **Le verrouillage d'accès (RBAC)** : toute initiation de demande exige un compte citoyen actif et authentifié dans la base de données.
3. **Le provisionnement sécurisé de l'Administrateur par script CLI** : seul le super-administrateur est provisionné en ligne de commande, et c'est lui qui crée et gère ensuite les comptes des agents de l'État (greffiers, magistrats, guichetiers, vérificateurs).
4. **La vérification biométrique faciale en direct** avec détection de vivacité (*liveness test*) et comparaison avec les registres de la CENI.
5. **Le paiement mobile réglementé** (M-Pesa, Orange Money, Airtel Money, Afrimoney) avec traçabilité comptable conforme aux arrêtés provinciaux.
6. **L'instruction collégiale** (Greffe du Parquet) et la **délivrance juridictionnelle** (Magistrat / Procureur) avec signature électronique et sceau numérique.
7. **La délivrance numérique instantanée** avec QR Code sécurisé et portail public d'authentification pour tiers (ambassades, banques, employeurs).
8. **Le journal d'audit de non-répudiation (Règle RG04)** où chaque action sensible est consignée de manière infalsifiable en base SQL.

---

## 🏗️ Architecture Technique

* **Frontend** : React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
* **Backend** : Node.js, Express, middleware RESTful sécurisé.
* **Base de Données Locale** : SQLite 3 natif (`node:sqlite`) sans compilation native C++, 100% fonctionnel en environnement local ou conteneurisé.
* **Base de Données Production** : Script DDL complet compatible **MySQL 8.0+ / MariaDB** (`database/migrations/001_create_tables_mysql.sql`).
* **Cryptographie & Sécurité** : 
  * Hachage des mots de passe en **PBKDF2 SHA-256** avec sel cryptographique.
  * Empreinte des documents et certificats par hachage **SHA-256**.
  * Ségrégation stricte des rôles (RBAC).

---

## 🚀 Procédure d'Installation et Exécution en Local

### 1. Prérequis
* **Node.js** version 20.x ou supérieure (recommandé Node 22+).
* **npm** version 9.x ou supérieure.

### 2. Cloner le projet et installer les dépendances
```bash
# Cloner le dépôt
git clone <url-du-depot>
cd certimoeurs

# Installer l'ensemble des dépendances
npm install
```

---

## 🔐 3. Création du Compte Super-Administrateur (Script CLI)

Conformément aux exigences de sécurité, **seul le compte Administrateur National peut être créé ou réinitialisé via un script système**.

Exécutez la commande dédiée :

```bash
npm run create:admin
```

> **Note :** Vous pouvez également créer un compte administrateur avec des paramètres personnalisés :
> ```bash
> npx tsx scripts/create_admin.ts <email> <mot_de_passe> <nom> <prenom> <telephone>
> # Exemple :
> npx tsx scripts/create_admin.ts dsi@justice.gouv.cd MonMotDePasse2026! Kasongo Patrick +243840000001
> ```

#### Identifiants Super-Administrateur par défaut :
* **Email / Identifiant** : `admin.dsi@justice.gouv.cd`
* **Mot de passe** : `Justice2026!`
* **Rôle** : `administrateur` (Direction des Systèmes d'Information)

---

## 💻 4. Lancement de l'Application en Local

Démarrez le serveur complet (Express API + Vite Frontend) :

```bash
npm run dev
```

L'application est immédiatement accessible dans votre navigateur à l'adresse :
👉 **http://localhost:3000**

---

## 👥 Séparation des Rôles & Parcours Fonctionnels (RBAC)

### 1. 🟢 Citoyen (Demandeur) — Portail Public
* **Création de Compte & Connexion** : Directement accessible sur la page d'accueil via le bouton *"Créer un Compte"* ou *"Se Connecter"*.
* **Verrouillage d'accès à la démarche** : Si un utilisateur non connecté clique sur *"Créer une nouvelle demande"*, le système intercepte immédiatement l'action et ouvre la modal d'authentification/inscription. Une fois connecté, le formulaire s'ouvre avec ses données d'état civil pré-remplies.
* **Formulaire Officiel en 4 Étapes** :
  1. État Civil & Résidence (Nom, Post-nom, Prénom, Pièce CENI, Commune, Province, Motif).
  2. Téléversement des Pièces Justificatives obligatoires.
  3. Vérification Biométrique faciale par webcam en direct avec contrôle de vivacité.
  4. Paiement Mobile de la taxe légale (ex: 25 000 CDF à Kinshasa) via M-Pesa / Orange / Airtel / Afrimoney.
* **Suivi de Dossier** : Recherche en direct de l'état d'avancement avec le code `CBVM-2026-XXX-XXXXXX`.
* **Retrait Numérique** : Téléchargement du certificat officiel PDF avec QR Code certifié.

### 2. 🔴 Administrateur National (DSI Ministère de la Justice)
* Accès réservé aux identifiants créés par le script CLI (`npm run create:admin`).
* **Gestion des Agents & Rôles (RBAC)** :
  * Création des comptes des agents de l'État :
    * Greffiers instructeurs (`agent_instructeur`)
    * Magistrats / Procureurs (`responsable_valideur`)
    * Agents d'accueil communal (`guichet`)
    * Officiers de contrôle tiers (`organisme_verificateur`)
  * Affectation à une juridiction territoriale (Parquet de Grande Instance, Maison Communale, etc.).
  * Activation, suspension ou révocation des comptes en base SQL.
* **Paramétrage Territorial** : Configuration province par province des tarifs en CDF, délais cibles et autorités compétentes.
* **Indicateurs & Décisionnel** : Taux de dématérialisation sans déplacement, taux de rejet, respect du délai cible 48h.
* **Journal d'Audit (RG04)** : Traçabilité infalsifiable de toutes les connexions, instructions et délivrances.

### 3. 🔵 Agent Instructeur (Greffier du Parquet)
* Prise en charge des dossiers assignés au parquet compétent.
* Contrôle de complétude et des pièces d'identité.
* Vérification des antécédents judiciaires (Casiers B2 et B3).
* Demande motivée de complément au citoyen ou transmission avec avis favorable / défavorable.

### 4. 🟣 Responsable Valideur (Magistrat / Procureur de la République)
* Examen de l'instruction du greffe.
* Décision finale juridictionnelle (approbation ou rejet motivé).
* Signature numérique et apposition du Sceau officiel de la République Démocratique du Congo.
* Déclenchement de la génération automatique du Certificat officiel avec QR Code scellé.

### 5. 🟡 Agent Guichet Communal (Inclusion Numérique)
* Kiosque d'accueil assisté pour les citoyens vulnérables ou sans connexion internet.
* Numérisation sur place des documents physiques et enregistrement assisté.
* Remise d'un récépissé papier sécurisé avec code de suivi.

### 6. 🌐 Organisme Tiers Vérificateur (Consulats, Banques, Entreprises)
* Portail public de contrôle d'authenticité.
* Scan du QR Code ou saisie du numéro de certificat.
* Vérification de l'empreinte SHA-256 et du statut de validité légale (sans exposer de données privées superflues).

---

## 🗄️ Structure de la Base de Données Relationnelle

Le modèle de données relationnel comprend 7 tables principales :

| Table | Description |
| :--- | :--- |
| `utilisateurs` | Comptes utilisateurs, rôles RBAC, mot de passe haché (PBKDF2), statut et juridiction |
| `demandes_certificat` | Dossiers de demande, état civil, motif, commune, statut du workflow BPMN |
| `pieces_jointes` | Métadonnées et empreintes cryptographiques des pièces téléversées |
| `verifications_biometriques` | Scores de vivacité faciale, similitude CENI et conformité ICAO |
| `paiements` | Transactions Mobile Money, référence opérateur, montant en CDF et horodatage |
| `certificats_delivres` | Certificats officiels, hash SHA-256, clé de signature magistrat et validité |
| `actions_audit` | Journal de non-répudiation (RG04) consignant chaque action, acteur, IP et objet |

### Migration vers MySQL / MariaDB en Production
Un script de migration complet est prêt dans le dossier `/database/migrations/001_create_tables_mysql.sql` :
```bash
# Pour déployer sur un serveur MySQL de production :
mysql -u root -p certimoeurs_db < database/migrations/001_create_tables_mysql.sql
```

---

## 📋 Commandes Utiles

| Commande | Action |
| :--- | :--- |
| `npm run dev` | Démarre le serveur backend Express + Vite en local sur le port 3000 |
| `npm run create:admin` | Exécute le script CLI pour provisionner le Super-Administrateur |
| `npm run build` | Compile l'application TypeScript et les assets pour la production |
| `npm run lint` | Valide le typage TypeScript et la cohérence du code |
| `npm run clean` | Réinitialise le cache et purge la base de données SQLite locale de test |

---

## 🛡️ Conformité Légale & Sécurité

* **RG01 (Unicité de la Demande)** : Contrôle d'unicité sur le numéro national d'identification et la pièce d'identité.
* **RG02 (Inviolabilité des Pièces)** : Hachage SHA-256 scellé à l'upload pour prévenir toute altération.
* **RG03 (Séparation Stricte des Pouvoirs - RBAC)** : L'instructeur ne peut pas valider, le valideur ne peut instruire seul son propre dossier.
* **RG04 (Non-Répudiation & Traçabilité)** : Tout accès, consultation de dossier et décision est consigné avec adresse IP, horodatage et identité de l'acteur.
* **RG05 (Authenticité Publique Sans Données Sensibles)** : La vérification publique atteste uniquement de la validité du certificat émis, protégeant la vie privée du demandeur.

---

**Ministère de la Justice — République Démocratique du Congo**  
*Justice — Paix — Travail*
