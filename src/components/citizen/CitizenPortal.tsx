import {
  ArrowRight,
  Plus
} from 'lucide-react';
import React from 'react';
import { useCertiStore } from '../../services/store';
import { DemandeCertificat } from '../../types';

interface CitizenPortalProps {
  onStartNewApplication: () => void;
  onViewDemande: (demande: DemandeCertificat) => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  onStartNewApplication,
  onViewDemande
}) => {
  const { demandes, currentUser } = useCertiStore();

  const citizenDemandes = demandes.slice(0, 5);

  const getStatusLabel = (statut: DemandeCertificat['statutActuel']) => {
    switch (statut) {
      case 'brouillon': return { label: 'Brouillon', color: 'text-slate-500' };
      case 'soumis': return { label: 'Soumis · En attente', color: 'text-sky-700' };
      case 'en_cours_instruction': return { label: 'En cours d’instruction', color: 'text-blue-700' };
      case 'verification_judiciaire': return { label: 'Vérification casier judiciaire', color: 'text-indigo-700' };
      case 'complement_requis': return { label: 'Complément requis', color: 'text-amber-700' };
      case 'avis_favorable': return { label: 'Avis favorable émis', color: 'text-emerald-700' };
      case 'avis_defavorable': return { label: 'Avis défavorable émis', color: 'text-rose-700' };
      case 'approuve': return { label: 'Délivré · Valide', color: 'text-emerald-700 font-bold' };
      case 'rejete': return { label: 'Rejeté', color: 'text-rose-700' };
      default: return { label: statut, color: 'text-slate-600' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
            Tableau de bord Citoyen
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Bienvenue {currentUser?.prenom} {currentUser?.nom}. Gérez vos demandes de certificats.
          </p>
        </div>
        <button
          onClick={onStartNewApplication}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Demande</span>
        </button>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 tracking-tight font-display">
            Vos Demandes Récentes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Consultez l'avancement, téléversez un complément ou téléchargez votre certificat signé.
          </p>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {citizenDemandes.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Vous n'avez aucune demande récente.
            </div>
          ) : (
            citizenDemandes.map((d) => {
              const st = getStatusLabel(d.statutActuel);
              return (
                <div
                  key={d.id}
                  onClick={() => onViewDemande(d)}
                  className="p-5 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {d.numeroReference}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-600 font-medium">
                        {d.demandeur.nom} {d.demandeur.prenom}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500">
                        {d.demandeur.commune} ({d.demandeur.villeProvince})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Motif : {d.demandeur.motifDemande}</span>
                      <span aria-hidden="true">·</span>
                      <span>Déposé le {new Date(d.dateCreation).toLocaleDateString('fr-FR')}</span>
                      <span aria-hidden="true">·</span>
                      <span>{d.modeDepot === 'guichet_assiste' ? 'Guichet communal' : 'Portail en ligne'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className={`text-xs ${st.color}`}>
                        {st.label}
                      </div>
                      {d.certificat && (
                        <div className="text-[11px] font-mono text-emerald-600">
                          Certificat N° {d.certificat.numeroCertificat.split('-').pop()}
                        </div>
                      )}
                      {d.statutActuel === 'complement_requis' && (
                        <div className="text-[11px] text-amber-600 font-semibold">
                          Action requise !
                        </div>
                      )}
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
