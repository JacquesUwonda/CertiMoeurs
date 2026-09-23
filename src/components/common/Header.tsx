import React, { useState } from 'react';
import { Role } from '../../types';
import { useCertiStore } from '../../services/store';
import { RdcEmblem } from './RdcEmblem';
import { AuthModal } from '../auth/AuthModal';
import { 
  ShieldCheck, 
  User, 
  FileText, 
  Search, 
  Sliders, 
  Building2, 
  ChevronDown,
  Database,
  CheckCircle2,
  Lock,
  ArrowRightLeft,
  KeyRound,
  LogOut,
  LogIn
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentRole: Role;
  setRole: (role: Role) => void;
  onOpenAssistedKiosk: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentRole,
  setRole,
  onOpenAssistedKiosk
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { currentUser, dbStatus, logout, isAuthenticated } = useCertiStore();

  const roleDefinitions: Record<Role, { label: string; title: string; desc: string; icon: any; color: string }> = {
    citoyen: { 
      label: 'Citoyen / Demandeur', 
      title: 'Espace Citoyen',
      desc: 'Dépôt de demande, pièces et suivi personnel', 
      icon: User,
      color: 'bg-sky-50 text-sky-700 border-sky-200'
    },
    guichet: { 
      label: 'Guichet Communal Assisté', 
      title: 'Guichet d\'Accueil',
      desc: 'Inclusion numérique, numérisation & récépissé papier', 
      icon: Building2,
      color: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    agent_instructeur: { 
      label: 'Agent Instructeur (Greffe)', 
      title: 'Greffe Parquet',
      desc: 'Contrôle recevabilité, casier B2/B3 & compléments', 
      icon: FileText,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    responsable_valideur: { 
      label: 'Responsable Valideur (Magistrat)', 
      title: 'Procureur / Valideur',
      desc: 'Décision souveraine, signature officielle & scellé', 
      icon: ShieldCheck,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    administrateur: { 
      label: 'Administrateur National', 
      title: 'DSI Justice',
      desc: 'KPIs, Base SQL, RBAC & Paramétrage sans code', 
      icon: Sliders,
      color: 'bg-slate-900 text-white border-slate-700'
    },
    organisme_verificateur: { 
      label: 'Organisme Tiers Vérificateur', 
      title: 'Portail Tiers',
      desc: 'Ambassades, employeurs & contrôle d\'authenticité', 
      icon: Search,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    }
  };

  const handleRoleSelect = (role: Role) => {
    setRole(role);
    setRoleMenuOpen(false);

    if (role === 'citoyen') setCurrentTab('citizen');
    else if (role === 'guichet') setCurrentTab('guichet');
    else if (role === 'agent_instructeur') setCurrentTab('instructor');
    else if (role === 'responsable_valideur') setCurrentTab('validator');
    else if (role === 'administrateur') setCurrentTab('admin');
    else if (role === 'organisme_verificateur') setCurrentTab('verify');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* DRC Republic Top Ribbon */}
      <div className="h-1 w-full bg-linear-to-r from-sky-500 via-amber-400 to-rose-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (currentRole === 'guichet') setCurrentTab('guichet');
                else if (currentRole === 'agent_instructeur') setCurrentTab('instructor');
                else if (currentRole === 'responsable_valideur') setCurrentTab('validator');
                else if (currentRole === 'administrateur') setCurrentTab('admin');
                else if (currentRole === 'organisme_verificateur') setCurrentTab('verify');
                else setCurrentTab('citizen');
              }} 
              className="flex items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-sky-600 rounded-lg group"
            >
              <RdcEmblem size="sm" />
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors font-display">
                  CertiMœurs<span className="text-sky-600">.cd</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  RDC · Ministère de la Justice
                </span>
              </div>
            </button>
          </div>

          {/* Role-Specific Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600">
            {currentRole === 'citoyen' && (
              <>
                <button
                  onClick={() => setCurrentTab('citizen')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'citizen' ? 'text-sky-700 bg-sky-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Mes Démarches
                </button>
                <button
                  onClick={() => setCurrentTab('new-demande')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'new-demande' ? 'text-sky-700 bg-sky-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  + Nouvelle Demande
                </button>
                <button
                  onClick={() => setCurrentTab('tracking')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'tracking' ? 'text-sky-700 bg-sky-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Suivi par Référence
                </button>
                <button
                  onClick={() => setCurrentTab('verify')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'verify' ? 'text-sky-700 bg-sky-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Contrôle d'Authenticité
                </button>
              </>
            )}

            {currentRole === 'guichet' && (
              <>
                <button
                  onClick={() => setCurrentTab('guichet')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'guichet' ? 'text-amber-800 bg-amber-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Poste Guichet Communal
                </button>
                <button
                  onClick={onOpenAssistedKiosk}
                  className="px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap text-amber-700 bg-amber-100 hover:bg-amber-200 font-bold flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Enrôler un Citoyen</span>
                </button>
                <button
                  onClick={() => setCurrentTab('tracking')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'tracking' ? 'text-amber-800 bg-amber-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Recherche & Récépissé
                </button>
              </>
            )}

            {currentRole === 'agent_instructeur' && (
              <>
                <button
                  onClick={() => setCurrentTab('instructor')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'instructor' ? 'text-indigo-800 bg-indigo-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Chambre d'Instruction Judiciaire
                </button>
                <button
                  onClick={() => setCurrentTab('verify')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'verify' ? 'text-indigo-800 bg-indigo-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Contrôle de Sécurité
                </button>
              </>
            )}

            {currentRole === 'responsable_valideur' && (
              <>
                <button
                  onClick={() => setCurrentTab('validator')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'validator' ? 'text-purple-800 bg-purple-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Chambre de Validation & Signature (Magistrat)
                </button>
                <button
                  onClick={() => setCurrentTab('verify')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'verify' ? 'text-purple-800 bg-purple-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Contrôle Sceau Numérique
                </button>
              </>
            )}

            {currentRole === 'administrateur' && (
              <>
                <button
                  onClick={() => setCurrentTab('admin')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'admin' ? 'text-slate-900 bg-slate-100 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Tableau de Bord & KPIs
                </button>
                <button
                  onClick={() => setCurrentTab('admin')}
                  className="px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap text-sky-700 bg-sky-50 font-semibold flex items-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Base SQL & Migrations</span>
                </button>
              </>
            )}

            {currentRole === 'organisme_verificateur' && (
              <>
                <button
                  onClick={() => setCurrentTab('verify')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'verify' ? 'text-emerald-800 bg-emerald-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Portail Public d'Authenticité (Ambassades / Banques)
                </button>
              </>
            )}
          </nav>

          {/* Authenticated User & Database Auth Controls */}
          <div className="flex items-center gap-2">
            {/* Direct Database Auth Button */}
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition-colors shadow-2xs"
              title="Connexion ou changement d'acteur dans la base SQL"
            >
              <KeyRound className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden md:inline">Authentification SQL</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline text-slate-500 font-normal">Session :</span>
                <span className="font-bold text-slate-900 max-w-[130px] sm:max-w-none truncate">
                  {currentUser.prenom} {currentUser.nom}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold uppercase">
                  {currentRole.replace('_', ' ')}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Role & Auth Dropdown */}
              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-84 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-2">
                  {/* Authenticated User DB Summary */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Compte Actif (Base SQL)</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {currentUser.id}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">
                      {currentUser.prenom} {currentUser.nom}
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono truncate">
                      {currentUser.email}
                    </div>
                    {currentUser.juridiction_deleguee && (
                      <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                        Juridiction : {currentUser.juridiction_deleguee}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => {
                          setRoleMenuOpen(false);
                          setAuthModalOpen(true);
                        }}
                        className="py-1 px-2 text-[11px] font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg flex items-center justify-center gap-1 transition-colors"
                      >
                        <LogIn className="w-3 h-3 text-sky-600" />
                        <span>Changer compte</span>
                      </button>
                      <button
                        onClick={async () => {
                          await logout();
                          setRole('citoyen');
                          setCurrentTab('citizen');
                          setRoleMenuOpen(false);
                        }}
                        className="py-1 px-2 text-[11px] font-semibold bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-lg flex items-center justify-center gap-1 transition-colors"
                      >
                        <LogOut className="w-3 h-3 text-rose-600" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  </div>

                  <div className="px-2 pt-1 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      BASCULER D'ACTEUR (AUTHENTIFICATION SQL AUTO)
                    </span>
                  </div>

                  <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                    {Object.entries(roleDefinitions).map(([key, def]) => {
                      const RoleIcon = def.icon;
                      const isCurrent = currentRole === key;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            handleRoleSelect(key as Role);
                            setRoleMenuOpen(false);
                          }}
                          className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors ${
                            isCurrent ? 'bg-sky-50/80 border border-sky-200' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                            <RoleIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {def.label}
                              </span>
                              {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {def.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'authentification SQL et sélection des comptes */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          if (currentRole === 'guichet') setCurrentTab('guichet');
          else if (currentRole === 'agent_instructeur') setCurrentTab('instructor');
          else if (currentRole === 'responsable_valideur') setCurrentTab('validator');
          else if (currentRole === 'administrateur') setCurrentTab('admin');
          else if (currentRole === 'organisme_verificateur') setCurrentTab('verify');
          else setCurrentTab('citizen');
        }}
      />
    </header>
  );
};
