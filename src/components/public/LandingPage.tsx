import {
    Clock,
    CreditCard,
    HelpCircle,
    Lock,
    LogIn,
    Plus,
    Search,
    ShieldCheck,
    UserPlus
} from 'lucide-react';
import React, { useState } from 'react';
import { useCertiStore } from '../../services/store';
import { DemandeCertificat } from '../../types';
import { RdcEmblem } from '../common/RdcEmblem';

interface LandingPageProps {
    onStartNewApplication: () => void;
    onOpenAssistedKiosk: () => void;
    onViewDemande: (demande: DemandeCertificat) => void;
    onLoginRequest: () => void;
    onRegisterRequest: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
    onStartNewApplication,
    onOpenAssistedKiosk,
    onViewDemande,
    onLoginRequest,
    onRegisterRequest
}) => {
    const { demandes, parametres } = useCertiStore();
    const [searchRef, setSearchRef] = useState('');

    const handleQuickSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchRef.trim()) return;
        const found = demandes.find(d =>
            d.numeroReference.toLowerCase().includes(searchRef.toLowerCase().trim()) ||
            d.demandeur.telephone.includes(searchRef.trim()) ||
            d.demandeur.nom.toLowerCase().includes(searchRef.toLowerCase().trim())
        );
        if (found) {
            onViewDemande(found);
        }
    };

    return (
        <div className="space-y-10">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-xl">
                {/* Background glow & subtle patterns */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-3xl space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-amber-400 font-medium">
                        <RdcEmblem size="sm" />
                        <span>Portail Officiel National de Dématérialisation · RDC</span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-display text-balance leading-tight">
                        Obtenez votre Certificat de Bonne Vie et Mœurs en toute sécurité
                    </h1>

                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                        Effectuez votre demande en ligne sans intermédiaire ni déplacement physique. Vérification biométrique par selfie en direct, paiement mobile certifié et retrait numérique immédiat avec QR Code infalsifiable.
                    </p>

                    <div className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>
                                Pour déposer une demande officielle en ligne, vous devez posséder un compte citoyen.
                            </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={onLoginRequest}
                                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                                <LogIn className="w-3.5 h-3.5 text-sky-400" />
                                <span>Se Connecter</span>
                            </button>
                            <button
                                type="button"
                                onClick={onRegisterRequest}
                                className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                            >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Créer un Compte</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                        <button
                            onClick={onStartNewApplication}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all scale-100 hover:scale-102"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Créer une nouvelle demande</span>
                        </button>

                        <button
                            onClick={onOpenAssistedKiosk}
                            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition-colors"
                        >
                            <HelpCircle className="w-4 h-4 text-sky-400" />
                            <span>Mode Guichet Assisté (Inclusion)</span>
                        </button>
                    </div>
                </div>

                {/* Quick Search Bar */}
                <div className="relative mt-8 pt-6 border-t border-slate-800/80 max-w-xl">
                    <form onSubmit={handleQuickSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                            <input
                                type="text"
                                value={searchRef}
                                onChange={(e) => setSearchRef(e.target.value)}
                                placeholder="Entrez votre N° de référence (ex: CBVM-2026-KIN-001842)..."
                                className="w-full pl-10 pr-3 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 shrink-0"
                        >
                            Suivre
                        </button>
                    </form>
                </div>
            </section>

            {/* Grid of Key Features & Legal Frame */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                        Vérification Biométrique Sécurisée
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Reconnaissance faciale et détection de vivacité intégrée. Vos pièces sont scellées et comparées aux registres de la CENI pour éradiquer les fraudes et usurpations.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                        Paiement Mobile Transparent
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Tarif officiel public versé directement au Trésor Public (DGRAD) par M-Pesa, Orange Money, Airtel Money ou Afrimoney. Quittance officielle instantanée.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                        Instruction Rapide & Suivi Horodaté
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Délai cible de 48 heures. Suivez chaque étape : enregistrement, enquête du casier judiciaire central, avis de l'officier et visa du magistrat valideur.
                    </p>
                </div>
            </section>

            {/* Regulated Tariffs by Territory (Section 3.2 & 5.1 of document) */}
            <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="mb-4">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display">
                        Tarifs Légaux Réglementés & Juridictions Compétentes
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Fixés conformément aux arrêtés ministériels en vigueur dans chaque province de la RDC.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {parametres.map((p) => (
                        <div key={p.province} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-xs text-slate-900">{p.province}</span>
                                <span className="font-mono text-xs font-bold text-sky-700 tabular-nums">
                                    {p.montantTaxeCDF.toLocaleString()} CDF
                                </span>
                            </div>
                            <div className="text-[10px] text-slate-500 leading-relaxed">
                                <span className="font-semibold text-slate-700 block mb-0.5">Tribunal / Parquet :</span>
                                {p.autoriteDeleguee}
                            </div>
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] text-slate-400">Guichets partenaires :</span>
                                <span className="text-xs font-bold text-slate-700">{p.communes.length}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
