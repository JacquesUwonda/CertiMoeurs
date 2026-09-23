import { useState, useEffect } from 'react';
import { 
  DemandeCertificat, 
  ActionAudit, 
  ParametrageTerritorial, 
  Role, 
  StatutDemande, 
  VerificationPubliqueResult,
  PieceJointe
} from '../types';
import { INITIAL_DEMANDES, INITIAL_AUDIT_LOGS, PARAMETRAGES_PROVINCES } from '../data/mockData';

export interface DatabaseStatusInfo {
  engine: string;
  driver: string;
  path: string;
  fileSizeBytes: number;
  fileSizeHuman: string;
  status: string;
  tablesCount: number;
  tableRows: Record<string, number>;
  walMode: boolean;
  foreignKeys: boolean;
}

export interface UserProfile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: Role;
  juridiction_deleguee?: string;
}

const STORAGE_KEYS = {
  ROLE: 'certimoeurs_rdc_current_role_v2',
  CURRENT_USER: 'certimoeurs_rdc_user_profile_v2',
  AUTH_TOKEN: 'certimoeurs_rdc_auth_token_v2'
};

const DEFAULT_USERS: Record<Role, UserProfile> = {
  citoyen: {
    id: 'usr-citoyen-1',
    nom: 'Mwamba',
    prenom: 'Dieudonné',
    email: 'dieudonne.mwamba@gmail.com',
    telephone: '+243 81 234 5678',
    role: 'citoyen',
    juridiction_deleguee: 'Kinshasa / Gombe'
  },
  guichet: {
    id: 'usr-guichet-1',
    nom: 'Tshimanga',
    prenom: 'Mireille',
    email: 'guichet.lingwala@justice.gouv.cd',
    telephone: '+243 82 000 9911',
    role: 'guichet',
    juridiction_deleguee: 'Maison Communale de Lingwala (Kinshasa)'
  },
  agent_instructeur: {
    id: 'usr-agent-1',
    nom: 'Kabasele',
    prenom: 'Jean-Paul',
    email: 'jp.kabasele@justice.gouv.cd',
    telephone: '+243 81 555 4321',
    role: 'agent_instructeur',
    juridiction_deleguee: 'Parquet de Grande Instance de Kinshasa / Gombe'
  },
  responsable_valideur: {
    id: 'usr-valideur-1',
    nom: 'Malamba',
    prenom: 'Antoine',
    email: 'a.malamba@justice.gouv.cd',
    telephone: '+243 89 000 2233',
    role: 'responsable_valideur',
    juridiction_deleguee: 'Procureur de la République près le TGI Kinshasa/Gombe'
  },
  administrateur: {
    id: 'usr-admin-1',
    nom: 'Kasongo',
    prenom: 'Patrick',
    email: 'admin.dsi@justice.gouv.cd',
    telephone: '+243 84 000 0001',
    role: 'administrateur',
    juridiction_deleguee: "Direction des Systèmes d'Information - Ministère de la Justice"
  },
  organisme_verificateur: {
    id: 'usr-verif-1',
    nom: 'Dubois',
    prenom: 'Claire',
    email: 'visas.rdc@diplomatie.be',
    telephone: '+32 2 501 8111',
    role: 'organisme_verificateur',
    juridiction_deleguee: 'Section Consulaire - Ambassade de Belgique'
  }
};

export class CertiStore {
  private static listeners: Array<() => void> = [];
  private static inMemoryDemandes: DemandeCertificat[] = INITIAL_DEMANDES;
  private static inMemoryAuditLogs: ActionAudit[] = INITIAL_AUDIT_LOGS;
  private static inMemoryParametres: ParametrageTerritorial[] = PARAMETRAGES_PROVINCES;
  private static dbStatus: DatabaseStatusInfo | null = null;
  private static isInitialized = false;

  static subscribe(listener: () => void) {
    this.listeners.push(listener);
    if (!this.isInitialized) {
      this.init();
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notify() {
    this.listeners.forEach(l => l());
  }

  static async init() {
    this.isInitialized = true;
    await this.fetchFromBackend();
  }

  static async fetchFromBackend() {
    try {
      const [resDemandes, resAudit, resParams, resStatus] = await Promise.all([
        fetch('/api/demandes'),
        fetch('/api/audit'),
        fetch('/api/parametres'),
        fetch('/api/db/status')
      ]);

      if (resDemandes.ok) {
        this.inMemoryDemandes = await resDemandes.json();
      }
      if (resAudit.ok) {
        this.inMemoryAuditLogs = await resAudit.json();
      }
      if (resParams.ok) {
        this.inMemoryParametres = await resParams.json();
      }
      if (resStatus.ok) {
        this.dbStatus = await resStatus.json();
      }
      this.notify();
    } catch (err) {
      console.warn('Backend API connection check (running with local cache if needed):', err);
    }
  }

  static getDemandes(): DemandeCertificat[] {
    return this.inMemoryDemandes;
  }

  static getAuditLogs(): ActionAudit[] {
    return this.inMemoryAuditLogs;
  }

  static getParametres(): ParametrageTerritorial[] {
    return this.inMemoryParametres;
  }

  static getDbStatus(): DatabaseStatusInfo | null {
    return this.dbStatus;
  }

  static getAuthToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  static getRole(): Role {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
      if (saved) return saved as Role;
    } catch {
      // ignore
    }
    return 'citoyen';
  }

  static async setRole(role: Role) {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
    const defaultUser = DEFAULT_USERS[role];
    if (defaultUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
      // Authenticate against database API to log session and update last connection
      try {
        await this.login(defaultUser.email, 'Justice2026!');
      } catch {
        // fallback
      }
    }
    this.notify();
  }

  static async login(identifier: string, password = 'Justice2026!'): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Identifiant ou mot de passe incorrect' };
      }

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.ROLE, data.user.role);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(data.user));

      await this.fetchFromBackend();
      this.notify();
      return { success: true, user: data.user };
    } catch (e: any) {
      return { success: false, error: e.message || 'Erreur réseau de connexion' };
    }
  }

  static async register(data: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    password: string;
    commune?: string;
    villeProvince?: string;
  }): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Erreur lors de la création du compte' };
      }

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, resData.token);
      localStorage.setItem(STORAGE_KEYS.ROLE, resData.user.role);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(resData.user));

      await this.fetchFromBackend();
      this.notify();
      return { success: true, user: resData.user };
    } catch (e: any) {
      return { success: false, error: e.message || 'Erreur réseau de création' };
    }
  }

  static async logout() {
    const user = this.getCurrentUser();
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          nomComplet: `${user?.prenom} ${user?.nom}`,
          role: user?.role
        })
      });
    } catch {
      // ignore
    }

    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.setItem(STORAGE_KEYS.ROLE, 'citoyen');
    this.notify();
  }

  static getCurrentUser(): UserProfile {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_USERS[this.getRole()];
  }

  static setCurrentUser(user: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.notify();
  }

  static getUserName(): string {
    const user = this.getCurrentUser();
    return `${user.prenom} ${user.nom}`;
  }

  // --- Opérations Métier SQL Backend ---

  static async creerDemande(nouvelleDemande: Omit<DemandeCertificat, 'id' | 'numeroReference' | 'dateCreation' | 'derniereMiseAJour' | 'historiqueStatuts'>): Promise<DemandeCertificat> {
    const provinceCode = nouvelleDemande.demandeur.villeProvince.slice(0, 3).toUpperCase() || 'RDC';
    const randNum = Math.floor(100000 + Math.random() * 900000);
    const ref = `CBVM-2026-${provinceCode}-${randNum}`;
    const now = new Date().toISOString();

    const payload: DemandeCertificat = {
      ...nouvelleDemande,
      id: `dem-${Date.now()}`,
      numeroReference: ref,
      dateCreation: now,
      derniereMiseAJour: now,
      statutActuel: nouvelleDemande.statutActuel || 'soumis',
      historiqueStatuts: [
        {
          id: `hist-${Date.now()}`,
          statut: nouvelleDemande.statutActuel || 'soumis',
          dateChangement: now,
          auteur: `${nouvelleDemande.demandeur.prenom} ${nouvelleDemande.demandeur.nom}`,
          roleAuteur: nouvelleDemande.modeDepot === 'guichet_assiste' ? 'Guichetier Assisté' : 'Demandeur',
          commentaire: nouvelleDemande.modeDepot === 'guichet_assiste' 
            ? 'Dossier créé et assisté au guichet physique communal'
            : 'Création et soumission en ligne de la demande de certificat'
        }
      ]
    };

    // Optimistic UI update
    this.inMemoryDemandes = [payload, ...this.inMemoryDemandes];
    this.notify();

    try {
      const res = await fetch('/api/demandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        this.fetchFromBackend();
        return saved;
      }
    } catch (e) {
      console.error('Error saving to SQL backend:', e);
    }

    return payload;
  }

  static getDemandeParReference(refOrPhone: string): DemandeCertificat | undefined {
    const cleaned = refOrPhone.trim().toLowerCase();
    return this.inMemoryDemandes.find(d => 
      d.numeroReference.toLowerCase() === cleaned || 
      d.id.toLowerCase() === cleaned ||
      d.demandeur.telephone.replace(/\s+/g, '') === cleaned.replace(/\s+/g, '') ||
      d.demandeur.numeroNationalIdentite.toLowerCase() === cleaned ||
      (d.certificat && d.certificat.numeroCertificat.toLowerCase() === cleaned)
    );
  }

  static async agentPrendreEnCharge(id: string, agentNom: string, agentId: string) {
    const now = new Date().toISOString();
    this.inMemoryDemandes = this.inMemoryDemandes.map(d => {
      if (d.id === id) {
        return {
          ...d,
          statutActuel: 'en_cours_instruction' as StatutDemande,
          derniereMiseAJour: now,
          instructions: {
            ...d.instructions,
            agentId,
            nomAgent: agentNom,
            datePriseEnCharge: now
          },
          historiqueStatuts: [
            ...d.historiqueStatuts,
            {
              id: `hist-${Date.now()}`,
              statut: 'en_cours_instruction' as StatutDemande,
              dateChangement: now,
              auteur: agentNom,
              roleAuteur: 'Agent Instructeur',
              commentaire: `Dossier pris en charge pour instruction par ${agentNom}`
            }
          ]
        };
      }
      return d;
    });
    this.notify();

    try {
      await fetch(`/api/demandes/${id}/instruction`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'PRENDRE_EN_CHARGE',
          nomAgent: agentNom,
          agentId
        })
      });
      this.fetchFromBackend();
    } catch (e) {
      console.error(e);
    }
  }

  static async agentVerifierCasier(id: string, agentNom: string, mention: 'NEANT' | 'CONDAMNATION_EXISTANTE', registreRef: string, parquetLieu: string) {
    const now = new Date().toISOString();
    this.inMemoryDemandes = this.inMemoryDemandes.map(d => {
      if (d.id === id) {
        return {
          ...d,
          derniereMiseAJour: now,
          instructions: {
            ...d.instructions,
            nomAgent: agentNom,
            verificationCasier: {
              effectue: true,
              dateVerification: now,
              mentionCasier: mention,
              registreRef,
              parquetLieu,
              agentMatricule: 'MAT-99201-JUS'
            }
          }
        };
      }
      return d;
    });
    this.notify();

    try {
      await fetch(`/api/demandes/${id}/instruction`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'VERIFIER_CASIER',
          nomAgent: agentNom,
          mentionCasier: mention,
          registreRef,
          parquetLieu
        })
      });
      this.fetchFromBackend();
    } catch (e) {
      console.error(e);
    }
  }

  static async agentDemanderComplement(id: string, agentNom: string, motif: string, piecesDemandees: string[]) {
    const now = new Date().toISOString();
    this.inMemoryDemandes = this.inMemoryDemandes.map(d => {
      if (d.id === id) {
        return {
          ...d,
          statutActuel: 'complement_requis' as StatutDemande,
          derniereMiseAJour: now,
          instructions: {
            ...d.instructions,
            complementDemande: {
              motif,
              dateDemande: now,
              piecesDemandees,
              traite: false
            }
          },
          historiqueStatuts: [
            ...d.historiqueStatuts,
            {
              id: `hist-${Date.now()}`,
              statut: 'complement_requis' as StatutDemande,
              dateChangement: now,
              auteur: agentNom,
              roleAuteur: 'Agent Instructeur',
              commentaire: `Complément requis: ${motif}`
            }
          ]
        };
      }
      return d;
    });
    this.notify();

    try {
      await fetch(`/api/demandes/${id}/instruction`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'DEMANDER_COMPLEMENT',
          nomAgent: agentNom,
          motif,
          piecesDemandees
        })
      });
      this.fetchFromBackend();
    } catch (e) {
      console.error(e);
    }
  }

  static async citoyenDeposerComplement(id: string, pieces: PieceJointe[], noteCitoyen: string) {
    const now = new Date().toISOString();
    this.inMemoryDemandes = this.inMemoryDemandes.map(d => {
      if (d.id === id) {
        return {
          ...d,
          statutActuel: 'en_cours_instruction' as StatutDemande,
          derniereMiseAJour: now,
          piecesJointes: [...d.piecesJointes, ...pieces],
          instructions: {
            ...d.instructions,
            complementDemande: d.instructions?.complementDemande ? {
              ...d.instructions.complementDemande,
              traite: true
            } : undefined
          },
          historiqueStatuts: [
            ...d.historiqueStatuts,
            {
              id: `hist-${Date.now()}`,
              statut: 'en_cours_instruction' as StatutDemande,
              dateChangement: now,
              auteur: `${d.demandeur.prenom} ${d.demandeur.nom}`,
              roleAuteur: 'Demandeur',
              commentaire: `Complément déposé par le demandeur. ${noteCitoyen ? `Note: "${noteCitoyen}"` : ''}`
            }
          ]
        };
      }
      return d;
    });
    this.notify();

    try {
      await fetch(`/api/demandes/${id}/complement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pieces,
          noteCitoyen
        })
      });
      this.fetchFromBackend();
    } catch (e) {
      console.error(e);
    }
  }

  static async agentProposerDecision(id: string, agentNom: string, avis: 'FAVORABLE' | 'DEFAVORABLE', note: string) {
    const now = new Date().toISOString();
    const nouveauStatut: StatutDemande = avis === 'FAVORABLE' ? 'avis_favorable' : 'avis_defavorable';

    this.inMemoryDemandes = this.inMemoryDemandes.map(d => {
      if (d.id === id) {
        return {
          ...d,
          statutActuel: nouveauStatut,
          derniereMiseAJour: now,
          instructions: {
            ...d.instructions,
            avisPropose: avis,
            noteInstruction: note,
            dateProposition: now
          },
          historiqueStatuts: [
            ...d.historiqueStatuts,
            {
              id: `hist-${Date.now()}`,
              statut: nouveauStatut,
              dateChangement: now,
              auteur: agentNom,
              roleAuteur: 'Agent Instructeur',
              commentaire: `Instruction terminée. Avis motivé: ${avis}. ${note}`
            }
          ]
        };
      }
      return d;
    });
    this.notify();

    try {
      await fetch(`/api/demandes/${id}/instruction`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'PROPOSER_DECISION',
          nomAgent: agentNom,
          avis,
          note
        })
      });
      this.fetchFromBackend();
    } catch (e) {
      console.error(e);
    }
  }

  static async responsableValiderEtDelivrer(id: string, responsableNom: string, titreResponsable: string, autoriteEmettrice: string) {
    const now = new Date();
    const nowISO = now.toISOString();
    const target = this.inMemoryDemandes.find(d => d.id === id);
    if (!target) return;

    const expiration = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const numCert = `RDC-JUS-CBVM-2026-${target.numeroReference.split('-').pop() || Date.now()}`;
    const hash = `sha256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    const qrUrl = `https://justice.gouv.cd/verifier?ref=${numCert}&h=${hash.substring(7, 15)}`;

    this.inMemoryDemandes = this.inMemoryDemandes.map(d => {
      if (d.id === id) {
        return {
          ...d,
          statutActuel: 'approuve' as StatutDemande,
          derniereMiseAJour: nowISO,
          decision: {
            id: `DEC-${Date.now()}`,
            typeDecision: 'APPROUVE' as const,
            dateDecision: nowISO,
            responsableId: 'VAL-001',
            nomResponsable: responsableNom,
            titreResponsable,
            scelleElectroniqueHash: hash
          },
          certificat: {
            id: `CERT-${Date.now()}`,
            numeroCertificat: numCert,
            dateEmission: nowISO,
            dateExpiration: expiration,
            codeVerificationQR: qrUrl,
            empreinteHashSHA256: hash.replace('sha256:', ''),
            autoriteEmettrice,
            lieuDelivrance: `${d.demandeur.villeProvince}, RDC`,
            statut: 'VALIDE' as const,
            signataireNom: responsableNom,
            signataireQualite: titreResponsable
          },
          historiqueStatuts: [
            ...d.historiqueStatuts,
            {
              id: `hist-${Date.now()}`,
              statut: 'approuve' as StatutDemande,
              dateChangement: nowISO,
              auteur: `${responsableNom} (${titreResponsable})`,
              roleAuteur: 'Responsable Valideur',
              commentaire: `Certificat de bonne vie et mœurs validé, signé numériquement et délivré avec succès.`
            }
          ]
        };
      }
      return d;
    });
    this.notify();

    try {
      await fetch(`/api/demandes/${id}/decision`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionType: 'APPROUVE',
          responsableNom,
          titreResponsable,
          autoriteEmettrice
        })
      });
      this.fetchFromBackend();
    } catch (e) {
      console.error(e);
    }
  }

  static async responsableRejeter(id: string, responsableNom: string, titreResponsable: string, motif: string, voiesRecours: string) {
    const now = new Date().toISOString();
    this.inMemoryDemandes = this.inMemoryDemandes.map(d => {
      if (d.id === id) {
        return {
          ...d,
          statutActuel: 'rejete' as StatutDemande,
          derniereMiseAJour: now,
          decision: {
            id: `DEC-${Date.now()}`,
            typeDecision: 'REJETE' as const,
            dateDecision: now,
            responsableId: 'VAL-001',
            nomResponsable: responsableNom,
            titreResponsable,
            motif,
            voiesRecours: voiesRecours || 'Recours gracieux possible sous 30 jours ouvrables devant le Procureur de la République.'
          },
          historiqueStatuts: [
            ...d.historiqueStatuts,
            {
              id: `hist-${Date.now()}`,
              statut: 'rejete' as StatutDemande,
              dateChangement: now,
              auteur: `${responsableNom} (${titreResponsable})`,
              roleAuteur: 'Responsable Valideur',
              commentaire: `Rejet motivé de la demande. Motif: ${motif}. Voies de recours notifiées.`
            }
          ]
        };
      }
      return d;
    });
    this.notify();

    try {
      await fetch(`/api/demandes/${id}/decision`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionType: 'REJETE',
          responsableNom,
          titreResponsable,
          motif,
          voiesRecours
        })
      });
      this.fetchFromBackend();
    } catch (e) {
      console.error(e);
    }
  }

  // --- Vérification Publique Tiers (RG05) ---
  static verifierCertificatPublic(codeOuRef: string): VerificationPubliqueResult {
    const cleaned = codeOuRef.trim().toLowerCase();
    const match = this.inMemoryDemandes.find(d => 
      (d.certificat && d.certificat.numeroCertificat.toLowerCase() === cleaned) ||
      d.numeroReference.toLowerCase() === cleaned ||
      (d.certificat && d.certificat.empreinteHashSHA256.toLowerCase().includes(cleaned))
    );

    // Call backend async for audit logging
    fetch(`/api/verify/${encodeURIComponent(codeOuRef)}`).catch(() => {});

    if (!match || !match.certificat) {
      return { trouve: false };
    }

    const { certificat, demandeur } = match;
    const nomMasque = `${demandeur.nom} ${demandeur.prenom.charAt(0)}.`;
    const now = new Date();
    const dateExp = new Date(certificat.dateExpiration);
    let statut: 'VALIDE' | 'REVOQUE' | 'EXPIRE' = certificat.statut;
    if (now > dateExp) {
      statut = 'EXPIRE';
    }

    return {
      trouve: true,
      numeroCertificat: certificat.numeroCertificat,
      nomCompletMasque: nomMasque,
      dateEmission: certificat.dateEmission,
      dateExpiration: certificat.dateExpiration,
      statut,
      autoriteEmettrice: certificat.autoriteEmettrice,
      lieuDelivrance: certificat.lieuDelivrance,
      empreinteSHA256: certificat.empreinteHashSHA256,
      mentionLegale: 'Document authentique enregistré au Registre National des Certificats de Bonne Vie et Mœurs de la RDC.'
    };
  }

  static async updateParametres(params: ParametrageTerritorial[]) {
    this.inMemoryParametres = params;
    this.notify();

    try {
      await fetch('/api/parametres', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      this.fetchFromBackend();
    } catch (e) {
      console.error(e);
    }
  }

  static resetToDefault() {
    this.inMemoryDemandes = INITIAL_DEMANDES;
    this.inMemoryAuditLogs = INITIAL_AUDIT_LOGS;
    this.inMemoryParametres = PARAMETRAGES_PROVINCES;
    this.notify();
  }
}

export function useCertiStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return CertiStore.subscribe(() => setTick(t => t + 1));
  }, []);

  return {
    demandes: CertiStore.getDemandes(),
    auditLogs: CertiStore.getAuditLogs(),
    parametres: CertiStore.getParametres(),
    dbStatus: CertiStore.getDbStatus(),
    currentRole: CertiStore.getRole(),
    currentUser: CertiStore.getCurrentUser(),
    userName: CertiStore.getUserName(),
    isAuthenticated: CertiStore.isAuthenticated(),
    authToken: CertiStore.getAuthToken(),
    login: (id: string, pwd?: string) => CertiStore.login(id, pwd),
    register: (data: any) => CertiStore.register(data),
    logout: () => CertiStore.logout(),
    setRole: (role: Role) => CertiStore.setRole(role),
    setCurrentUser: (user: UserProfile) => CertiStore.setCurrentUser(user),
    refreshData: () => CertiStore.fetchFromBackend(),
    creerDemande: (d: any) => CertiStore.creerDemande(d),
    getDemandeParReference: (ref: string) => CertiStore.getDemandeParReference(ref),
    agentPrendreEnCharge: (id: string, nom: string, agtId: string) => CertiStore.agentPrendreEnCharge(id, nom, agtId),
    agentVerifierCasier: (id: string, nom: string, mention: 'NEANT' | 'CONDAMNATION_EXISTANTE', reg: string, pqt: string) => CertiStore.agentVerifierCasier(id, nom, mention, reg, pqt),
    agentDemanderComplement: (id: string, nom: string, motif: string, pieces: string[]) => CertiStore.agentDemanderComplement(id, nom, motif, pieces),
    citoyenDeposerComplement: (id: string, pieces: PieceJointe[], note: string) => CertiStore.citoyenDeposerComplement(id, pieces, note),
    agentProposerDecision: (id: string, nom: string, avis: 'FAVORABLE' | 'DEFAVORABLE', note: string) => CertiStore.agentProposerDecision(id, nom, avis, note),
    responsableValiderEtDelivrer: (id: string, respNom: string, titre: string, aut: string) => CertiStore.responsableValiderEtDelivrer(id, respNom, titre, aut),
    responsableRejeter: (id: string, respNom: string, titre: string, motif: string, recours: string) => CertiStore.responsableRejeter(id, respNom, titre, motif, recours),
    verifierCertificatPublic: (code: string) => CertiStore.verifierCertificatPublic(code),
    updateParametres: (params: ParametrageTerritorial[]) => CertiStore.updateParametres(params),
    resetToDefault: () => CertiStore.resetToDefault()
  };
}
