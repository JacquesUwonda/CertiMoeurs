import React, { useState } from 'react';
import { Role } from '../../types';
import { RdcEmblem } from './RdcEmblem';
import { 
  ShieldCheck, 
  User, 
  FileText, 
  Search, 
  Sliders, 
  HelpCircle,
  Building2,
  ChevronDown
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

  const roleLabels: Record<Role, { label: string; desc: string; icon: any }> = {
    citoyen: { label: 'Espace Citoyen', desc: 'Demandeur particulier', icon: User },
    agent_instructeur: { label: 'Agent Instructeur', desc: 'Vérification et Casier', icon: FileText },
    responsable_valideur: { label: 'Responsable Valideur', desc: 'Magistrat / Autorité', icon: ShieldCheck },
    administrateur: { label: 'Administration', desc: 'Superviseur & Audit', icon: Sliders },
    guichet: { label: 'Guichet Assisté', desc: 'Accueil communal', icon: Building2 },
    organisme_verificateur: { label: 'Organisme Tiers', desc: 'Ambassade & Employeur', icon: Search }
  };

  const CurrentRoleIcon = roleLabels[currentRole].icon;

  const handleRoleSelect = (role: Role) => {
    setRole(role);
    setRoleMenuOpen(false);
    if (role === 'citoyen') setCurrentTab('citizen');
    else if (role === 'agent_instructeur') setCurrentTab('instructor');
    else if (role === 'responsable_valideur') setCurrentTab('validator');
    else if (role === 'administrateur') setCurrentTab('admin');
    else if (role === 'organisme_verificateur') setCurrentTab('verify');
    else if (role === 'guichet') {
      setCurrentTab('citizen');
      onOpenAssistedKiosk();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* DRC Republic Top Ribbon */}
      <div className="h-1 w-full bg-linear-to-r from-sky-500 via-amber-400 to-rose-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand title, single line */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentTab('citizen')} 
              className="flex items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-sky-600 rounded-lg group"
            >
              <RdcEmblem size="sm" />
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors font-display">
                  CertiMœurs<span className="text-sky-600">.cd</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  RDC · Justice & Intérieur
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4–6 nav links, 1–2 word labels, single-line */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            <button
              onClick={() => setCurrentTab('citizen')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'citizen' 
                  ? 'text-sky-700 bg-sky-50 font-semibold' 
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Démarches
            </button>
            <button
              onClick={() => setCurrentTab('new-demande')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'new-demande' 
                  ? 'text-sky-700 bg-sky-50 font-semibold' 
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Nouvelle demande
            </button>
            <button
              onClick={() => setCurrentTab('tracking')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'tracking' 
                  ? 'text-sky-700 bg-sky-50 font-semibold' 
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Suivi dossier
            </button>
            <button
              onClick={() => setCurrentTab('verify')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'verify' 
                  ? 'text-sky-700 bg-sky-50 font-semibold' 
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Vérifier certificat
            </button>
            <button
              onClick={() => setCurrentTab('instructor')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'instructor' || currentTab === 'validator'
                  ? 'text-sky-700 bg-sky-50 font-semibold' 
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Instruction
            </button>
            <button
              onClick={() => setCurrentTab('admin')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'admin' 
                  ? 'text-sky-700 bg-sky-50 font-semibold' 
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Tableau de bord
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions (Role Switcher & Guichet Assisté) */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAssistedKiosk}
              title="Guichet d'assistance pour personnes sans smartphone"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
              <span>Guichet Assisté</span>
            </button>

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-lg hover:border-slate-300 shadow-2xs hover:bg-slate-50 transition-all"
              >
                <div className="w-6 h-6 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center">
                  <CurrentRoleIcon className="w-3.5 h-3.5" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-slate-900 leading-tight">
                    {roleLabels[currentRole].label}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${roleMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {roleMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setRoleMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Changer de profil (Simulation BPMN)
                      </p>
                    </div>

                    {(Object.keys(roleLabels) as Role[]).map((rKey) => {
                      const item = roleLabels[rKey];
                      const Icon = item.icon;
                      const isSelected = currentRole === rKey;
                      return (
                        <button
                          key={rKey}
                          onClick={() => handleRoleSelect(rKey)}
                          className={`w-full flex items-start gap-2.5 px-3 py-2 text-left rounded-lg transition-colors text-xs ${
                            isSelected ? 'bg-sky-50 text-sky-900' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className={`mt-0.5 p-1 rounded-md ${isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{item.label}</div>
                            <div className="text-[11px] text-slate-500">{item.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
