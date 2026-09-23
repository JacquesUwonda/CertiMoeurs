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

const STORAGE_KEYS = {
  DEMANDES: 'certimoeurs_rdc_demandes_v1',
  AUDIT: 'certimoeurs_rdc_audit_v1',
  PARAMETRES: 'certimoeurs_rdc_parametres_v1',
  ROLE: 'certimoeurs_rdc_current_role_v1',
  CURRENT_USER_NAME: 'certimoeurs_rdc_user_name_v1'
};

export class CertiStore {
  private static listeners: Array<() => void> = [];

  static subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notify() {
    this.listeners.forEach(l => l());
  }

  static getDemandes(): DemandeCertificat[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEMANDES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_DEMANDES;
  }

  static saveDemandes(demandes: DemandeCertificat[]) {
    localStorage.setItem(STORAGE_KEYS.DEMANDES, JSON.stringify(demandes));
    this.notify();
  }

  static getAuditLogs(): ActionAudit[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_AUDIT_LOGS;
  }

  static logAudit(action: Omit<ActionAudit, 'id' | 'horodatage' | 'adresseIP'>) {
    const logs = this.getAuditLogs();
    const newEntry: ActionAudit = {
      ...action,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      horodatage: new Date().toISOString(),
      adresseIP: '197.157.210.' + Math.floor(Math.random() * 200 + 1)
    };
    const updated = [newEntry, ...logs];
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(updated));
    this.notify();
  }

  static getParametres(): ParametrageTerritorial[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PARAMETRES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return PARAMETRAGES_PROVINCES;
  }

  static updateParametres(params: ParametrageTerritorial[]) {
    localStorage.setItem(STORAGE_KEYS.PARAMETRES, JSON.stringify(params));
    this.notify();
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

  static setRole(role: Role) {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
    this.notify();
  }

  static getUserName(): string {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_NAME);
      if (saved) return saved;
    } catch {
      // ignore
    }
    return 'Citoyen';
  }

  static setUserName(name: string) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_NAME, name);
    this.notify();
  }

  // --- Opérations Métier ---

  static creerDemande(nouvelleDemande: Omit<DemandeCertificat, 'id' | 'numeroReference' | 'dateCreation' | 'derniereMiseAJour' | 'historiqueStatuts'>): DemandeCertificat {
    const provinceCode = nouvelleDemande.demandeur.villeProvince.slice(0, 3).toUpperCase() || 'RDC';
    const randNum = Math.floor(100000 + Math.random() * 900000);
    const ref = `CBVM-2026-${provinceCode}-${randNum}`;
    const now = new Date().toISOString();

    const demande: DemandeCertificat = {
      ...nouvelleDemande,
      id: `dem-${Date.now()}`,
      numeroReference: ref,
      dateCreation: now,
      derniereMiseAJour: now,
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

    const demandes = this.getDemandes();
    this.saveDemandes([demande, ...demandes]);

    this.logAudit({
      acteur: `${demande.demandeur.prenom} ${demande.demandeur.nom}`,
      roleActeur: demande.modeDepot === 'guichet_assiste' ? 'Guichet' : 'Demandeur',
      typeAction: 'CREATION_DOSSIER',
      objetId: demande.numeroReference,
      details: `Création du dossier de demande [${demande.numeroReference}] pour ${demande.demandeur.nom} ${demande.demandeur.prenom} (${demande.demandeur.commune}, ${demande.demandeur.villeProvince})`
    });

    return demande;
  }

  static getDemandeParReference(refOrPhone: string): DemandeCertificat | undefined {
    const cleaned = refOrPhone.trim().toLowerCase();
    const demandes = this.getDemandes();
    return demandes.find(d => 
      d.numeroReference.toLowerCase() === cleaned || 
      d.id.toLowerCase() === cleaned ||
      d.demandeur.telephone.replace(/\s+/g, '') === cleaned.replace(/\s+/g, '') ||
      d.demandeur.numeroNationalIdentite.toLowerCase() === cleaned ||
      (d.certificat && d.certificat.numeroCertificat.toLowerCase() === cleaned)
    );
  }

  static updateStatut(id: string, nouveauStatut: StatutDemande, auteur: string, roleAuteur: string, commentaire: string) {
    const demandes = this.getDemandes();
    const now = new Date().toISOString();
    const updated = demandes.map(d => {
      if (d.id === id) {
        return {
          ...d,
          statutActuel: nouveauStatut,
          derniereMiseAJour: now,
          historiqueStatuts: [
            ...d.historiqueStatuts,
            {
              id: `hist-${Date.now()}`,
              statut: nouveauStatut,
              dateChangement: now,
              auteur,
              roleAuteur,
              commentaire
            }
          ]
        };
      }
      return d;
    });

    this.saveDemandes(updated);
  }

  static agentPrendreEnCharge(id: string, agentNom: string, agentId: string) {
    const demandes = this.getDemandes();
    const now = new Date().toISOString();
    const target = demandes.find(d => d.id === id);
    if (!target) return;

    const updated = demandes.map(d => {
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

    this.saveDemandes(updated);
    this.logAudit({
      acteur: agentNom,
      roleActeur: 'Agent Instructeur',
      typeAction: 'INSTRUCTION',
      objetId: target.numeroReference,
      details: `Prise en charge du dossier ${target.numeroReference}`
    });
  }

  static agentVerifierCasier(id: string, agentNom: string, mention: 'NEANT' | 'CONDAMNATION_EXISTANTE', registreRef: string, parquetLieu: string) {
    const demandes = this.getDemandes();
    const now = new Date().toISOString();
    const target = demandes.find(d => d.id === id);
    if (!target) return;

    const updated = demandes.map(d => {
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

    this.saveDemandes(updated);
    this.logAudit({
      acteur: agentNom,
      roleActeur: 'Agent Instructeur',
      typeAction: 'INSTRUCTION',
      objetId: target.numeroReference,
      details: `Vérification du casier judiciaire central: Mention [${mention}] (Réf: ${registreRef})`
    });
  }

  static agentDemanderComplement(id: string, agentNom: string, motif: string, piecesDemandees: string[]) {
    const demandes = this.getDemandes();
    const now = new Date().toISOString();
    const target = demandes.find(d => d.id === id);
    if (!target) return;

    const updated = demandes.map(d => {
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

    this.saveDemandes(updated);
    this.logAudit({
      acteur: agentNom,
      roleActeur: 'Agent Instructeur',
      typeAction: 'DEMANDE_COMPLEMENT',
      objetId: target.numeroReference,
      details: `Demande de complément de dossier: ${motif}`
    });
  }

  static citoyenDeposerComplement(id: string, pieces: PieceJointe[], noteCitoyen: string) {
    const demandes = this.getDemandes();
    const now = new Date().toISOString();
    const target = demandes.find(d => d.id === id);
    if (!target) return;

    const updated = demandes.map(d => {
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

    this.saveDemandes(updated);
    this.logAudit({
      acteur: `${target.demandeur.prenom} ${target.demandeur.nom}`,
      roleActeur: 'Demandeur',
      typeAction: 'TELEVERSEMENT_PIECE',
      objetId: target.numeroReference,
      details: `Dépôt de ${pieces.length} pièce(s) complémentaire(s)`
    });
  }

  static agentProposerDecision(id: string, agentNom: string, avis: 'FAVORABLE' | 'DEFAVORABLE', note: string) {
    const demandes = this.getDemandes();
    const now = new Date().toISOString();
    const target = demandes.find(d => d.id === id);
    if (!target) return;

    const nouveauStatut: StatutDemande = avis === 'FAVORABLE' ? 'avis_favorable' : 'avis_defavorable';

    const updated = demandes.map(d => {
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

    this.saveDemandes(updated);
    this.logAudit({
      acteur: agentNom,
      roleActeur: 'Agent Instructeur',
      typeAction: 'INSTRUCTION',
      objetId: target.numeroReference,
      details: `Avis d'instruction émis: [${avis}] - ${note}`
    });
  }

  static responsableValiderEtDelivrer(id: string, responsableNom: string, titreResponsable: string, autoriteEmettrice: string) {
    const demandes = this.getDemandes();
    const now = new Date();
    const nowISO = now.toISOString();
    const target = demandes.find(d => d.id === id);
    if (!target) return;

    // Expiration à 3 mois (90 jours) légale
    const expiration = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const numCert = `RDC-JUS-CBVM-2026-${target.numeroReference.split('-').pop() || Date.now()}`;
    const hash = `sha256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    const qrUrl = `https://justice.gouv.cd/verifier?ref=${numCert}&h=${hash.substring(7, 15)}`;

    const updated = demandes.map(d => {
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

    this.saveDemandes(updated);
    this.logAudit({
      acteur: responsableNom,
      roleActeur: 'Responsable Valideur',
      typeAction: 'DECISION_VALIDATION',
      objetId: target.numeroReference,
      details: `Validation et signature du certificat ${numCert} pour ${target.demandeur.nom} ${target.demandeur.prenom}`
    });
  }

  static responsableRejeter(id: string, responsableNom: string, titreResponsable: string, motif: string, voiesRecours: string) {
    const demandes = this.getDemandes();
    const now = new Date().toISOString();
    const target = demandes.find(d => d.id === id);
    if (!target) return;

    const updated = demandes.map(d => {
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

    this.saveDemandes(updated);
    this.logAudit({
      acteur: responsableNom,
      roleActeur: 'Responsable Valideur',
      typeAction: 'DECISION_REJET',
      objetId: target.numeroReference,
      details: `Demande rejetée: ${motif}`
    });
  }

  // --- Vérification Publique Tiers (RG05) ---
  static verifierCertificatPublic(codeOuRef: string): VerificationPubliqueResult {
    const cleaned = codeOuRef.trim().toLowerCase();
    const demandes = this.getDemandes();

    this.logAudit({
      acteur: 'Organisme Vérificateur Externe',
      roleActeur: 'Vérificateur',
      typeAction: 'VERIFICATION_TIERS',
      objetId: codeOuRef,
      details: `Tentative de vérification publique pour le code/référence [${codeOuRef}]`
    });

    const match = demandes.find(d => 
      (d.certificat && d.certificat.numeroCertificat.toLowerCase() === cleaned) ||
      d.numeroReference.toLowerCase() === cleaned ||
      (d.certificat && d.certificat.empreinteHashSHA256.toLowerCase().includes(cleaned))
    );

    if (!match || !match.certificat) {
      return { trouve: false };
    }

    const { certificat, demandeur } = match;
    const prenom = demandeur.prenom;
    const nom = demandeur.nom;
    // Masquage respectueux RG05
    const nomMasque = `${nom} ${prenom.charAt(0)}.`;

    // Calcul de validité
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

  static resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.DEMANDES);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
    localStorage.removeItem(STORAGE_KEYS.PARAMETRES);
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
    currentRole: CertiStore.getRole(),
    userName: CertiStore.getUserName(),
    setRole: (role: Role) => CertiStore.setRole(role),
    setUserName: (name: string) => CertiStore.setUserName(name),
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
    logAudit: (log: any) => CertiStore.logAudit(log),
    updateParametres: (params: ParametrageTerritorial[]) => CertiStore.updateParametres(params),
    resetToDefault: () => CertiStore.resetToDefault()
  };
}
