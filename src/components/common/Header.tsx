import {
  Building2,
  CheckCircle2,
  ChevronDown,
  Database,
  LogIn,
  LogOut
} from 'lucide-react';
import React, { useState } from 'react';
import { useCertiStore } from '../../services/store';
import { Role } from '../../types';
import { RdcEmblem } from './RdcEmblem';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentRole: Role;
  setRole: (role: Role) => void;
  onOpenAssistedKiosk: () => void;
  onLoginRequest: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentRole,
  setRole,
  onOpenAssistedKiosk,
  onLoginRequest
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const { currentUser, dbStatus, logout, isAuthenticated } = useCertiStore();

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
            {!isAuthenticated && (
              <>
                <button
                  onClick={() => setCurrentTab('landing')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${currentTab === 'landing' ? 'text-sky-700 bg-sky-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  Accueil
                </button>
                <button
                  onClick={() => setCurrentTab('verify')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${currentTab === 'verify' ? 'text-emerald-800 bg-emerald-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  Contrôle d'Authenticité
                </button>
              </>
            )}

            {isAuthenticated && currentRole === 'citoyen' && (
              <>
                <button
                  onClick={() => setCurrentTab('citizen')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${currentTab === 'citizen' ? 'text-sky-700 bg-sky-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  Mes Démarches
                </button>
                <button
                  onClick={() => setCurrentTab('new-demande')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${currentTab === 'new-demande' ? 'text-sky-700 bg-sky-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  + Nouvelle Demande
                </button>
                <button
                  onClick={() => setCurrentTab('tracking')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${currentTab === 'tracking' ? 'text-sky-700 bg-sky-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  Suivi par Référence
                </button>
                <button
                  onClick={() => setCurrentTab('verify')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${currentTab === 'verify' ? 'text-sky-700 bg-sky-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
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
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${currentTab === 'guichet' ? 'text-amber-800 bg-amber-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
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
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${currentTab === 'tracking' ? 'text-amber-800 bg-amber-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
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
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${currentTab === 'instructor' ? 'text-indigo-800 bg-indigo-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  Chambre d'Instruction Judiciaire
                </button>
                <button
                  onClick={() => setCurrentTab('verify')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${currentTab === 'verify' ? 'text-indigo-800 bg-indigo-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
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
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${currentTab === 'validator' ? 'text-purple-800 bg-purple-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  Chambre de Validation & Signature (Magistrat)
                </button>
                <button
                  onClick={() => setCurrentTab('verify')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${currentTab === 'verify' ? 'text-purple-800 bg-purple-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
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
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${currentTab === 'admin' ? 'text-slate-900 bg-slate-100 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
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
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${currentTab === 'verify' ? 'text-emerald-800 bg-emerald-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  Portail Public d'Authenticité (Ambassades / Banques)
                </button>
              </>
            )}
          </nav>

          {/* Authenticated User & Database Auth Controls */}
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <button
                onClick={onLoginRequest}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-sky-600 text-white hover:bg-sky-500 transition-colors shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Se Connecter</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden sm:inline text-slate-500 font-normal">Session :</span>
                  <span className="font-bold text-slate-900 max-w-[130px] sm:max-w-none truncate">
                    {currentUser?.prenom} {currentUser?.nom}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold uppercase">
                    {currentRole?.replace('_', ' ')}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile Dropdown */}
                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-2">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Compte Actif (Base SQL)</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {currentUser?.id}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        {currentUser?.prenom} {currentUser?.nom}
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono truncate">
                        {currentUser?.email}
                      </div>
                      {currentUser?.juridiction_deleguee && (
                        <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                          Juridiction : {currentUser.juridiction_deleguee}
                        </div>
                      )}

                      <div className="mt-2.5 pt-2 border-t border-slate-200">
                        <button
                          onClick={async () => {
                            await logout();
                            setRoleMenuOpen(false);
                            setCurrentTab('landing');
                          }}
                          className="w-full py-1.5 px-2 text-[11px] font-semibold bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-lg flex items-center justify-center gap-1 transition-colors"
                        >
                          <LogOut className="w-3 h-3 text-rose-600" />
                          <span>Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
