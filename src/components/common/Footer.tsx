import React from 'react';
import { RdcEmblem } from './RdcEmblem';
import { ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-sm no-print mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <RdcEmblem size="sm" />
              <div>
                <div className="text-base font-bold text-white tracking-tight">
                  RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
                </div>
                <div className="text-xs text-amber-400 font-medium tracking-wider uppercase">
                  Ministère de la Justice et Garde des Sceaux
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              Plateforme nationale de dématérialisation et de sécurisation du Certificat de Bonne Vie et Mœurs. Conçue selon les standards BPMN et les normes de protection des données à caractère personnel pour garantir intégrité, transparence et célérité administrative.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <span>Devise nationale : Justice · Paix · Travail</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Cadre Légal & Sécurité
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Horodatage et scellé cryptographique SHA-256</span>
              </li>
              <li>Validité légale : 90 jours (3 mois)</li>
              <li>Contrôle d’authenticité par QR Code décentralisé</li>
              <li>Conformité RG01 à RG06 (Audit et Traçabilité)</li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Assistance & Guichets
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Kinshasa - Gombe, Palais de Justice</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Numéro vert : +243 (0) 81 000 0001</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>support.certimoeurs@justice.gouv.cd</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 République Démocratique du Congo · Tous droits réservés.</p>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <span>Mentions Légales</span>
            <span>·</span>
            <span>Protection des Données</span>
            <span>·</span>
            <span>Accompagnement Guichet</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
