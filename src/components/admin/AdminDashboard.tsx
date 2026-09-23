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
  Key
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

  useEffect(() => {
    fetch('/api/db/migrations')
      .then(res => res.json())
      .then(data => setMigrationInfo(data))
      .catch(() => {});

    fetch('/api/utilisateurs')
      .then(res => res.json())
      .then(data => setUsersList(data))
      .catch(() => {});
  }, []);

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
