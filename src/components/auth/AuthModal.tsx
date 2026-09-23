import React, { useState } from 'react';
import { useCertiStore } from '../../services/store';
import { Role } from '../../types';
import { RdcEmblem } from '../common/RdcEmblem';
import { 
  Lock, 
  User, 
  Building2, 
  FileText, 
  ShieldCheck, 
  Sliders, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  LogIn, 
  UserPlus, 
  X,
  KeyRound,
  Database,
  ArrowRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, register, currentUser, currentRole, isAuthenticated } = useCertiStore();

  const [authMode, setAuthMode] = useState<'login' | 'quick_roles' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Register form state
  const [registerData, setRegisterData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '+243 ',
    password: '',
    commune: 'Gombe',
    villeProvince: 'Kinshasa'
  });

  if (!isOpen) return null;

  const testAccounts: Array<{
    id: string;
    role: Role;
    label: string;
    nomComplet: string;
    email: string;
    juridiction: string;
    icon: any;
    color: string;
  }> = [
    {
      id: 'usr-citoyen-1',
      role: 'citoyen',
      label: 'Citoyen / Demandeur',
      nomComplet: 'Dieudonné Mwamba',
      email: 'dieudonne.mwamba@gmail.com',
      juridiction: 'Kinshasa / Gombe',
      icon: User,
      color: 'bg-sky-50 text-sky-800 border-sky-200'
    },
    {
      id: 'usr-guichet-1',
      role: 'guichet',
      label: 'Guichetier Communal',
      nomComplet: 'Mireille Tshimanga',
      email: 'guichet.lingwala@justice.gouv.cd',
      juridiction: 'Commune de Lingwala (Kinshasa)',
      icon: Building2,
      color: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      id: 'usr-agent-1',
      role: 'agent_instructeur',
      label: 'Agent Instructeur (Greffier)',
      nomComplet: 'Jean-Paul Kabasele',
      email: 'jp.kabasele@justice.gouv.cd',
      juridiction: 'Parquet de Grande Instance de Kinshasa / Gombe',
      icon: FileText,
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200'
    },
    {
      id: 'usr-valideur-1',
      role: 'responsable_valideur',
      label: 'Magistrat / Procureur',
      nomComplet: 'Antoine Malamba',
      email: 'a.malamba@justice.gouv.cd',
      juridiction: 'Procureur de la République près le TGI Gombe',
      icon: ShieldCheck,
      color: 'bg-purple-50 text-purple-800 border-purple-200'
    },
    {
      id: 'usr-admin-1',
      role: 'administrateur',
      label: 'Administrateur National',
      nomComplet: 'Patrick Kasongo',
      email: 'admin.dsi@justice.gouv.cd',
      juridiction: 'Direction des Systèmes d\'Information (Ministère Justice)',
      icon: Sliders,
      color: 'bg-slate-900 text-white border-slate-700'
    },
    {
      id: 'usr-verif-1',
      role: 'organisme_verificateur',
      label: 'Organisme Tiers Vérificateur',
      nomComplet: 'Claire Dubois',
      email: 'visas.rdc@diplomatie.be',
      juridiction: 'Section Consulaire - Ambassade de Belgique',
      icon: Search,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    }
  ];

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMsg('Veuillez renseigner votre identifiant et votre mot de passe.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const result = await login(identifier, password);
    setLoading(false);

    if (result.success) {
      setSuccessMsg(`Authentifié avec succès en tant que ${result.user?.prenom} ${result.user?.nom} (${result.user?.role.toUpperCase()}).`);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 800);
    } else {
      setErrorMsg(result.error || 'Authentification échouée. Vérifiez vos identifiants.');
    }
  };

  const handleQuickRoleSelect = async (account: typeof testAccounts[0]) => {
    setLoading(true);
    setErrorMsg(null);

    const result = await login(account.email, 'Justice2026!');
    setLoading(false);

    if (result.success) {
      setSuccessMsg(`Session authentifiée dans la base SQL pour ${account.nomComplet} (${account.label}).`);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 700);
    } else {
      setErrorMsg(result.error || 'Erreur d\'authentification dans la base de données.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.nom || !registerData.prenom || !registerData.email || !registerData.telephone) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const result = await register({
      ...registerData,
      password: registerData.password || 'Justice2026!'
    });
    setLoading(false);

    if (result.success) {
      setSuccessMsg('Compte citoyen créé et authentifié avec succès dans la base de données !');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } else {
      setErrorMsg(result.error || 'Erreur lors de l\'enregistrement dans la base de données.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Official Header */}
        <div className="text-center space-y-2 pb-5 border-b border-slate-100">
          <div className="inline-flex items-center justify-center mx-auto">
            <RdcEmblem size="md" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold text-sky-800 uppercase tracking-widest">
              <Database className="w-3.5 h-3.5 text-sky-600" />
              <span>AUTHENTIFICATION PAR BASE DE DONNÉES SQL</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-display mt-0.5">
              Système National d'Accès Sécurisé
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Contrôle d'accès basé sur les rôles (RBAC - Règle RG03). Les identifiants, rôles et juridictions sont vérifiés directement dans la table SQL <code className="text-sky-700 font-mono font-bold">utilisateurs</code>.
            </p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 my-4">
          <button
            onClick={() => { setAuthMode('login'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              authMode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Connexion Sécurisée</span>
          </button>
          <button
            onClick={() => { setAuthMode('quick_roles'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              authMode === 'quick_roles' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Sélection Rapide par Rôle</span>
          </button>
          <button
            onClick={() => { setAuthMode('register'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              authMode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Créer un Compte</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: STANDARD LOGIN */}
        {authMode === 'login' && (
          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Identifiant Officiel (Email ou Téléphone enregistré)
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="ex: jp.kabasele@justice.gouv.cd ou dieudonne.mwamba@gmail.com"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white font-mono"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Mot de Passe
                </label>
                <span className="text-[10px] text-slate-400">
                  Mot de passe démo: <strong className="text-slate-700 font-mono">Justice2026!</strong>
                </span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Vérification en base de données...' : 'Se Connecter & Vérifier les Droits'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Chaque tentative de connexion génère une trace d'audit non-répudiable dans la table SQL <code className="text-slate-600">actions_audit</code>.
            </p>
          </form>
        )}

        {/* TAB 2: QUICK TEST ACCOUNTS FROM DATABASE */}
        {authMode === 'quick_roles' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600 font-medium">
              Sélectionnez un acteur officiel pour vous authentifier avec son compte pré-enregistré dans la table SQL <code className="text-sky-800 font-mono font-bold">utilisateurs</code> :
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
              {testAccounts.map((acc) => {
                const IconComponent = acc.icon;
                const isSelected = currentUser?.id === acc.id;

                return (
                  <button
                    key={acc.id}
                    onClick={() => handleQuickRoleSelect(acc)}
                    disabled={loading}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 hover:border-sky-400 hover:shadow-xs ${
                      isSelected ? 'bg-sky-50/80 border-sky-300 ring-1 ring-sky-300' : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                            {acc.label}
                          </span>
                          <span className="text-xs font-bold text-slate-900 block truncate">
                            {acc.nomComplet}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 border-t border-slate-200/60 pt-1.5 flex items-center justify-between">
                      <span className="truncate max-w-[170px]">{acc.juridiction}</span>
                      <ArrowRight className="w-3 h-3 text-sky-600 shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: REGISTER NEW CITIZEN ACCOUNT IN DB */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nom</label>
                <input
                  type="text"
                  required
                  value={registerData.nom}
                  onChange={(e) => setRegisterData({ ...registerData, nom: e.target.value })}
                  placeholder="ex: Ilunga"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Prénom</label>
                <input
                  type="text"
                  required
                  value={registerData.prenom}
                  onChange={(e) => setRegisterData({ ...registerData, prenom: e.target.value })}
                  placeholder="ex: Christian"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Adresse Email</label>
                <input
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  placeholder="nom@domaine.cd"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  required
                  value={registerData.telephone}
                  onChange={(e) => setRegisterData({ ...registerData, telephone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Province</label>
                <select
                  value={registerData.villeProvince}
                  onChange={(e) => setRegisterData({ ...registerData, villeProvince: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
                >
                  <option value="Kinshasa">Kinshasa</option>
                  <option value="Haut-Katanga">Haut-Katanga</option>
                  <option value="Nord-Kivu">Nord-Kivu</option>
                  <option value="Kongo-Central">Kongo-Central</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Commune</label>
                <input
                  type="text"
                  value={registerData.commune}
                  onChange={(e) => setRegisterData({ ...registerData, commune: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Mot de Passe Sécurisé
              </label>
              <input
                type="password"
                required
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                placeholder="Minimum 6 caractères"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Création du compte en base...' : 'Créer mon Compte & Accéder'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
