import React, { useState, useEffect } from 'react';
import { useCertiStore } from '../../services/store';
import { ParametrageTerritorial } from '../../types';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  ShieldCheck, 
  Download, 
  Search, 
  Building2, 
  Users,
  Smartphone,
  Save,
  RotateCcw,
  Database,
  Code,
  Copy,
  Terminal,
  Server,
  Key,
  UserPlus,
  Trash2,
  Power,
  Filter,
  Check,
  Lock,
  BadgeCheck
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { demandes, auditLogs, parametres, updateParametres, resetToDefault, dbStatus } = useCertiStore();

  const [activeTab, setActiveTab] = useState<'kpis' | 'parametres' | 'audit' | 'database' | 'utilisateurs'>('kpis');
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState('all');
  const [auditSearch, setAuditSearch] = useState('');

  // Editable parameters local state
  const [editingParams, setEditingParams] = useState<ParametrageTerritorial[]>(parametres);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Database migration scripts state
  const [migrationInfo, setMigrationInfo] = useState<{
    activeEngine: string;
    productionReady: string;
    mysqlScript: string;
    sqliteScript: string;
  } | null>(null);

  // System Users state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserError, setCreateUserError] = useState<string | null>(null);
  const [createUserSuccess, setCreateUserSuccess] = useState(false);

  // New agent form
  const [newUserData, setNewUserData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '+243 81 ',
    role: 'agent_instructeur',
    juridiction_deleguee: 'Parquet de Grande Instance de Kinshasa / Gombe',
    password: 'Justice2026!'
  });

  const fetchUsers = () => {
    fetch('/api/utilisateurs')
      .then(res => res.json())
      .then(data => setUsersList(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetch('/api/db/migrations')
      .then(res => res.json())
      .then(data => setMigrationInfo(data))
      .catch(() => {});

    fetchUsers();
  }, []);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserLoading(true);
    setCreateUserError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création de l\'agent');
      setCreateUserSuccess(true);
      fetchUsers();
      setTimeout(() => {
        setIsCreateUserOpen(false);
        setCreateUserSuccess(false);
        setNewUserData({
          nom: '',
          prenom: '',
          email: '',
          telephone: '+243 81 ',
          role: 'agent_instructeur',
          juridiction_deleguee: 'Parquet de Grande Instance de Kinshasa / Gombe',
          password: 'Justice2026!'
        });
      }, 1000);
    } catch (err: any) {
      setCreateUserError(err.message);
    } finally {
      setCreateUserLoading(false);
    }
  };

  const handleToggleStatus = async (user: any) => {
    const nextStatus = user.statut === 'actif' ? 'suspendu' : 'actif';
    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: nextStatus })
      });
      if (res.ok) fetchUsers();
    } catch (err) {}
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Confirmez-vous la suppression de ce compte de la base de données SQL ?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) fetchUsers();
    } catch (err) {}
  };

  // Compute aggregated indicators (EF07 & Section 10.4)
  const filteredDemandes = selectedProvinceFilter === 'all' 
    ? demandes 
    : demandes.filter(d => d.demandeur.villeProvince.toLowerCase() === selectedProvinceFilter.toLowerCase());

  const totalDemandes = filteredDemandes.length;
  const totalEnLigne = filteredDemandes.filter(d => d.modeDepot === 'en_ligne').length;
  const partSansDeplacement = totalDemandes > 0 ? Math.round((totalEnLigne / totalDemandes) * 100) : 0;

  const totalDelivres = filteredDemandes.filter(d => d.statutActuel === 'approuve').length;
  const totalRejetes = filteredDemandes.filter(d => d.statutActuel === 'rejete').length;
  const tauxRejet = totalDemandes > 0 ? ((totalRejetes / totalDemandes) * 100).toFixed(1) : '0';

  const totalCompletsPremierCoup = filteredDemandes.filter(d => d.statutActuel !== 'complement_requis').length;
  const tauxDossiersComplets = totalDemandes > 0 ? Math.round((totalCompletsPremierCoup / totalDemandes) * 100) : 0;

  const filteredAuditLogs = auditLogs.filter(log => {
    if (!auditSearch) return true;
    const q = auditSearch.toLowerCase();
    return log.acteur.toLowerCase().includes(q) ||
      log.typeAction.toLowerCase().includes(q) ||
      log.objetId.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q);
  });

  const handleParamChange = (index: number, field: keyof ParametrageTerritorial, value: any) => {
    const updated = [...editingParams];
    updated[index] = { ...updated[index], [field]: value };
    setEditingParams(updated);
  };

  const handleSaveParams = (e: React.FormEvent) => {
    e.preventDefault();
    updateParametres(editingParams);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-900 text-white rounded">
              ROLE : ADMINISTRATEUR NATIONAL
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-600 font-semibold">Direction des Systèmes d'Information (Ministère de la Justice)</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight mt-1 font-display">
            Tableau de Bord Décisionnel, Paramétrage, Base SQL & Audit
          </h1>
          <p className="text-xs text-slate-500">
            Pilotage par les données (Section 10.4), base de données relationnelle persistante, et journal d'audit cryptographique (RG04).
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('kpis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'kpis' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Indicateurs & KPI
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'database' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-sky-600" />
            <span>Base SQL & Migrations</span>
          </button>
          <button
            onClick={() => setActiveTab('utilisateurs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'utilisateurs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Rôles & Comptes (RBAC)</span>
          </button>
          <button
            onClick={() => setActiveTab('parametres')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'parametres' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Paramétrage Local
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit (RG04)
          </button>
        </div>
      </div>

      {/* TAB 1: INDICATEURS KPI (EF07 & Section 10.4) */}
      {activeTab === 'kpis' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Filtrer par Province / Juridiction :</span>
            <select
              value={selectedProvinceFilter}
              onChange={(e) => setSelectedProvinceFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-sky-500"
            >
              <option value="all">Toutes les provinces de la RDC</option>
              <option value="kinshasa">Kinshasa</option>
              <option value="haut-katanga">Haut-Katanga</option>
              <option value="nord-kivu">Nord-Kivu</option>
              <option value="kongo-central">Kongo-Central</option>
            </select>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex justify-between items-center text-slate-500 text-xs">
                <span>Sans déplacement</span>
                <Smartphone className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                {partSansDeplacement}%
              </div>
              <div className="text-[11px] text-slate-500">
                Demandes numériques vs guichet assisté
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex justify-between items-center text-slate-500 text-xs">
                <span>Dossiers complets 1er envoi</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                {tauxDossiersComplets}%
              </div>
              <div className="text-[11px] text-slate-500">
                Efficacité du formulaire guidé (RG02)
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex justify-between items-center text-slate-500 text-xs">
                <span>Délai médian de délivrance</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                28 heures
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">
                En dessous de la cible légale (48h)
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex justify-between items-center text-slate-500 text-xs">
                <span>Certificats scellés</span>
                <ShieldCheck className="w-4 h-4 text-sky-700" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                {totalDelivres}
              </div>
              <div className="text-[11px] text-slate-500">
                Taux de rejet : {tauxRejet}%
              </div>
            </div>
          </div>

          {/* Volume by Province Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Répartition Géographique & Performance par Parquet
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Province</th>
                    <th className="py-3 px-4 font-semibold">Juridiction Déléguée</th>
                    <th className="py-3 px-4 font-semibold">Tarif Réglementé</th>
                    <th className="py-3 px-4 font-semibold">Délai Cible</th>
                    <th className="py-3 px-4 font-semibold">Dossiers Actifs</th>
                    <th className="py-3 px-4 font-semibold text-right">Statut Opérationnel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parametres.map((param) => {
                    const count = demandes.filter(d => d.demandeur.villeProvince.toLowerCase() === param.province.toLowerCase()).length;
                    return (
                      <tr key={param.province} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900">{param.province}</td>
                        <td className="py-3 px-4 text-slate-600">{param.autoriteDeleguee}</td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-800">{param.montantTaxeCDF.toLocaleString()} CDF</td>
                        <td className="py-3 px-4 font-mono">{param.delaiCibleHeures}h</td>
                        <td className="py-3 px-4 font-mono font-bold text-sky-800">{count}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Opérationnel</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BASE DE DONNÉES & SCRIPTS DE MIGRATION SQL */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Active DB Banner */}
          <div className="bg-linear-to-r from-slate-900 to-sky-950 text-white p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-sky-300">
                    INFRASTRUCTURE DE STOCKAGE RELATIONNEL ACTIF
                  </span>
                  <h2 className="text-base font-bold">
                    {dbStatus?.engine || 'SQLite 3 (Moteur Relational Embarqué)'}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{dbStatus?.status || 'OPÉRATIONNEL'}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-800 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Emplacement :</span>
                <span className="text-sky-200 truncate block">./database/certimoeurs.sqlite</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Taille fichier :</span>
                <span className="text-sky-200">{dbStatus?.fileSizeHuman || 'Calcul en cours'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Tables Actives :</span>
                <span className="text-emerald-400 font-bold">{dbStatus?.tablesCount || 12} tables SQL</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Mode Journal :</span>
                <span className="text-amber-300 font-bold">WAL (Write-Ahead Logging)</span>
              </div>
            </div>
          </div>

          {/* Table of Tables and Row Counts */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Tables du Modèle Conceptuel de Données (MCD Section 7.3)
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Total enregistrements synchronisés
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
              {dbStatus?.tableRows && Object.entries(dbStatus.tableRows).map(([tbl, count]) => (
                <div key={tbl} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-800 block">{tbl}</span>
                    <span className="text-[10px] text-slate-400">table relationnelle</span>
                  </div>
                  <span className="font-mono text-sm font-black text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Migration Scripts Section (MySQL & SQLite) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-sky-600" />
                  <span>Scripts de Migration SQL Prêts pour Déploiement Local / MySQL</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conformément aux exigences, le script DDL complet pour MySQL 8 / MariaDB est généré et prêt à être injecté.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(migrationInfo?.mysqlScript || '', 'mysql')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCode === 'mysql' ? 'Copié !' : 'Copier Script MySQL'}</span>
                </button>
              </div>
            </div>

            {/* Quick Command Instruction */}
            <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs space-y-2 border border-slate-800">
              <div className="text-slate-400 text-[11px] flex items-center justify-between">
                <span>COMMANDE D'EXÉCUTION SUR SERVEUR MYSQL LOCAL :</span>
                <span className="text-amber-400">Prêt à l'emploi</span>
              </div>
              <div className="text-sky-300 select-all">
                mysql -u root -p &lt; database/migrations/001_create_tables_mysql.sql
              </div>
              <div className="text-emerald-300 select-all">
                mysql -u root -p certimoeurs_rdc &lt; database/seeds/001_seed_initial_data.sql
              </div>
            </div>

            {/* Code Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Extrait DDL MySQL (001_create_tables_mysql.sql) :
              </span>
              <pre className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-800 overflow-x-auto max-h-64 overflow-y-auto">
                {migrationInfo?.mysqlScript || '-- Chargement du script SQL...'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RÔLES & COMPTES DU SYSTÈME (RBAC - Section 3.1 & RG03) */}
      {activeTab === 'utilisateurs' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Gestion des Rôles & Accès Sécurisés (RBAC - Règle RG03)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                "Seul un agent disposant du rôle requis peut consulter, modifier l'instruction ou décider."
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Identifiant</th>
                  <th className="py-2.5 px-3 font-semibold">Nom & Prénom</th>
                  <th className="py-2.5 px-3 font-semibold">Email / Contact</th>
                  <th className="py-2.5 px-3 font-semibold">Rôle Métier Attribué</th>
                  <th className="py-2.5 px-3 font-semibold">Juridiction / Délégation</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-sky-800">{u.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{u.nom} {u.prenom}</td>
                    <td className="py-2.5 px-3 text-slate-600">{u.email}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 uppercase">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">{u.juridiction_deleguee || 'Non assigné'}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Actif</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PARAMÉTRAGE DES RÈGLES (Section 5.1 & 3.2: Des règles configurables sans modifier le code) */}
      {activeTab === 'parametres' && (
        <form onSubmit={handleSaveParams} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight font-display">
                Paramétrage des Règles Locales par Province
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Conformément au document, les montants des taxes, délais cibles et juridictions sont configurables sans redéployer le code.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  resetToDefault();
                  setEditingParams(parametres);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser</span>
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer les paramètres</span>
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Paramètres territoriaux mis à jour avec succès dans le registre !</span>
            </div>
          )}

          <div className="space-y-6">
            {editingParams.map((p, idx) => (
              <div key={p.province} className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Province : {p.province}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">ID: PROV-{idx + 1}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Autorité Déléguée</label>
                    <input
                      type="text"
                      value={p.autoriteDeleguee}
                      onChange={(e) => handleParamChange(idx, 'autoriteDeleguee', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Montant Taxe Officielle (CDF)</label>
                    <input
                      type="number"
                      step={500}
                      value={p.montantTaxeCDF}
                      onChange={(e) => handleParamChange(idx, 'montantTaxeCDF', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Délai Cible (Heures)</label>
                    <input
                      type="number"
                      value={p.delaiCibleHeures}
                      onChange={(e) => handleParamChange(idx, 'delaiCibleHeures', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </form>
      )}

      {/* TAB 4: GESTION DES UTILISATEURS & ROLES (RBAC) */}
      {activeTab === 'utilisateurs' && (
        <div className="space-y-6">
          {/* Information & Architecture Notice */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                  <BadgeCheck className="w-3 h-3" />
                  <span>Architecture de Sécurité RBAC Conforme</span>
                </div>
                <h2 className="text-base font-bold text-white font-display">
                  Gestion Centralisée des Agents & Rôles Ministériels
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Le compte Super-Administrateur est provisionné exclusivement via le script CLI (<code className="text-amber-400 font-mono">npm run create:admin</code>). 
                  Seul l'Administrateur peut créer, affecter et révoquer les agents de l'État (Greffiers, Magistrats, Guichetiers, Vérificateurs). Les Citoyens créent quant à eux leur compte de façon autonome sur la page d'accueil du portail.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  onClick={() => setIsCreateUserOpen(true)}
                  className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Créer un Nouvel Agent</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Comptes SQL</span>
              <span className="text-xl font-bold font-mono text-slate-900">{usersList.length}</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Greffiers Instructeurs</span>
              <span className="text-xl font-bold font-mono text-indigo-700">
                {usersList.filter(u => u.role === 'agent_instructeur').length}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Magistrats Valideurs</span>
              <span className="text-xl font-bold font-mono text-purple-700">
                {usersList.filter(u => u.role === 'responsable_valideur').length}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Guichets Communaux</span>
              <span className="text-xl font-bold font-mono text-amber-700">
                {usersList.filter(u => u.role === 'guichet').length}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Vérificateurs Tiers</span>
              <span className="text-xl font-bold font-mono text-emerald-700">
                {usersList.filter(u => u.role === 'organisme_verificateur').length}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">Citoyens Inscrits</span>
              <span className="text-xl font-bold font-mono text-sky-700">
                {usersList.filter(u => u.role === 'citoyen').length}
              </span>
            </div>
          </div>

          {/* Form Modal for Creating Agent */}
          {isCreateUserOpen && (
            <div className="bg-white rounded-2xl border-2 border-sky-500 shadow-xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Création d'un Nouveau Compte Agent de l'État (RBAC)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Le compte sera inséré avec mot de passe haché dans la table relationnelle SQL <code className="text-sky-700 font-mono">utilisateurs</code>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateUserOpen(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Fermer
                </button>
              </div>

              {createUserError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{createUserError}</span>
                </div>
              )}

              {createUserSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Compte agent créé et provisionné en base SQL avec succès !</span>
                </div>
              )}

              <form onSubmit={handleCreateAgent} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Prénom de l'agent *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Jean-Paul"
                      value={newUserData.prenom}
                      onChange={(e) => setNewUserData({ ...newUserData, prenom: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Nom de famille *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Kabasele"
                      value={newUserData.nom}
                      onChange={(e) => setNewUserData({ ...newUserData, nom: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Adresse Email Professionnelle *</label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: jp.kabasele@justice.gouv.cd"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Numéro de Téléphone Professionnel</label>
                    <input
                      type="text"
                      value={newUserData.telephone}
                      onChange={(e) => setNewUserData({ ...newUserData, telephone: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Rôle Attribué (RBAC) *</label>
                    <select
                      value={newUserData.role}
                      onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-semibold"
                    >
                      <option value="agent_instructeur">Agent Instructeur (Greffe du Parquet)</option>
                      <option value="responsable_valideur">Responsable Valideur (Magistrat / Procureur)</option>
                      <option value="guichet">Agent Guichet Communal (Accueil & Numérisation)</option>
                      <option value="organisme_verificateur">Organisme Vérificateur (Ambassade / Banque)</option>
                      <option value="administrateur">Administrateur DSI</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Juridiction / Tribunal / Commune d'Affectation *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Parquet de Grande Instance de Kinshasa / Gombe"
                      value={newUserData.juridiction_deleguee}
                      onChange={(e) => setNewUserData({ ...newUserData, juridiction_deleguee: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Mot de Passe Initial *</label>
                  <input
                    type="password"
                    required
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    className="w-full max-w-sm px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Sera haché cryptographiquement en PBKDF2 SHA-256 avec sel avant insertion.
                  </span>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateUserOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createUserLoading}
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {createUserLoading ? 'Enregistrement SQL...' : 'Créer & Enregistrer en Base SQL'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users List & Search Controls */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight font-display">
                  Annuaire des Utilisateurs de la Base de Données SQL
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualisez les comptes, modifiez leur statut d'activité ou révoquez les accès.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Filtrer par nom, email..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Role Filter */}
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 font-semibold"
                >
                  <option value="all">Tous les rôles ({usersList.length})</option>
                  <option value="agent_instructeur">Greffiers Instructeurs</option>
                  <option value="responsable_valideur">Magistrats Valideurs</option>
                  <option value="guichet">Agents Guichet</option>
                  <option value="organisme_verificateur">Vérificateurs Tiers</option>
                  <option value="administrateur">Administrateurs</option>
                  <option value="citoyen">Citoyens</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Identifiant SQL</th>
                    <th className="py-2.5 px-3 font-semibold">Nom & Prénom</th>
                    <th className="py-2.5 px-3 font-semibold">Email & Téléphone</th>
                    <th className="py-2.5 px-3 font-semibold">Rôle RBAC</th>
                    <th className="py-2.5 px-3 font-semibold">Juridiction / Affectation</th>
                    <th className="py-2.5 px-3 font-semibold">Statut</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList
                    .filter((u) => {
                      if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
                      if (!userSearch) return true;
                      const q = userSearch.toLowerCase();
                      return (
                        u.nom.toLowerCase().includes(q) ||
                        u.prenom.toLowerCase().includes(q) ||
                        u.email.toLowerCase().includes(q) ||
                        u.id.toLowerCase().includes(q) ||
                        (u.juridiction_deleguee && u.juridiction_deleguee.toLowerCase().includes(q))
                      );
                    })
                    .map((user) => {
                      const isSuperAdmin = user.id === 'usr-admin-1';
                      return (
                        <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-700">
                            {user.id}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {user.prenom} {user.nom}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-mono text-slate-700 text-[11px]">{user.email}</div>
                            <div className="text-slate-400 text-[10px]">{user.telephone}</div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              user.role === 'administrateur' ? 'bg-slate-900 text-white' :
                              user.role === 'responsable_valideur' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'agent_instructeur' ? 'bg-indigo-100 text-indigo-800' :
                              user.role === 'guichet' ? 'bg-amber-100 text-amber-800' :
                              user.role === 'organisme_verificateur' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-sky-100 text-sky-800'
                            }`}>
                              {user.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs truncate">
                            {user.juridiction_deleguee || '—'}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              user.statut === 'actif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${user.statut === 'actif' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span>{user.statut === 'actif' ? 'Actif' : 'Suspendu'}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            {!isSuperAdmin ? (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => handleToggleStatus(user)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors ${
                                    user.statut === 'actif' 
                                      ? 'border-amber-200 text-amber-700 hover:bg-amber-50' 
                                      : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                  }`}
                                  title={user.statut === 'actif' ? 'Suspendre l\'accès' : 'Réactiver le compte'}
                                >
                                  {user.statut === 'actif' ? 'Suspendre' : 'Réactiver'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Supprimer définitivement de la base SQL"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono">Protégé (CLI)</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: JOURNAL D'AUDIT COMPLET (RG04) */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight font-display">
                Journal d'Audit et de Non-Répudiation (Règle RG04)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Toute consultation sensible, modification, décision et délivrance est journalisée de manière infalsifiable.
              </p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Rechercher dans les logs..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Horodatage</th>
                  <th className="py-2.5 px-3 font-semibold">Acteur / Rôle</th>
                  <th className="py-2.5 px-3 font-semibold">Action</th>
                  <th className="py-2.5 px-3 font-semibold">Objet Réf</th>
                  <th className="py-2.5 px-3 font-semibold">Adresse IP</th>
                  <th className="py-2.5 px-3 font-semibold">Détails Traitement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 text-[11px]">
                    <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.horodatage).toLocaleString('fr-FR')}
                    </td>
                    <td className="py-2 px-3 font-sans font-semibold text-slate-800 whitespace-nowrap">
                      {log.acteur} <span className="text-slate-400 font-normal">({log.roleActeur})</span>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {log.typeAction}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sky-800 font-bold whitespace-nowrap">
                      {log.objetId}
                    </td>
                    <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                      {log.adresseIP}
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-600">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
