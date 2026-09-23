import React, { useState } from 'react';
import { useCertiStore } from '../../services/store';
import { DemandeCertificat } from '../../types';
import { RdcEmblem } from '../common/RdcEmblem';
import { QRCodeSVG } from '../common/QRCodeSVG';
import { 
  Building2, 
  UserPlus, 
  Search, 
  Printer, 
  CheckCircle2, 
  Clock, 
  FileText, 
  HelpCircle, 
  Smartphone,
  Eye,
  ShieldCheck,
  Download
} from 'lucide-react';

interface GuichetPortalProps {
  onStartAssistedApplication: () => void;
  onViewDemande: (demande: DemandeCertificat) => void;
}

export const GuichetPortal: React.FC<GuichetPortalProps> = ({
  onStartAssistedApplication,
  onViewDemande
}) => {
  const { demandes, currentUser } = useCertiStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<DemandeCertificat | null>(null);

  // Filter demandes created via guichet or matching search
  const guichetDemandes = demandes.filter(d => d.modeDepot === 'guichet_assiste');

  const filtered = (searchTerm.trim() ? demandes : guichetDemandes).filter(d => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      d.numeroReference.toLowerCase().includes(q) ||
      d.demandeur.nom.toLowerCase().includes(q) ||
      d.demandeur.prenom.toLowerCase().includes(q) ||
      d.demandeur.telephone.includes(q) ||
      d.demandeur.numeroNationalIdentite.toLowerCase().includes(q)
    );
  });

  const dossiersPrets = guichetDemandes.filter(d => d.statutActuel === 'approuve').length;
  const dossiersEnCours = guichetDemandes.filter(d => d.statutActuel !== 'approuve' && d.statutActuel !== 'rejete').length;

  return (
    <div className="space-y-6">
      {/* Guichet Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded">
                ROLE : GUICHET D'ACCUEIL COMMUNAL ASSISTÉ
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-600 font-semibold">{currentUser.juridiction_deleguee || 'Maison Communale de Lingwala'}</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight mt-1 font-display">
              Poste d'Enrôlement & Assistance aux Usagers
            </h1>
            <p className="text-xs text-slate-500">
              Dispositif d'inclusion numérique (Section 10.2 du Rapport) : accueil physique, numérisation des pièces papier et délivrance de récépissés scellés.
            </p>
          </div>
        </div>

        <button
          onClick={onStartAssistedApplication}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nouvel Enrôlement Assisté</span>
        </button>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Dossiers Assistés Total</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {guichetDemandes.length}
          </div>
          <p className="text-[11px] text-slate-400">Enregistrés physiquement au guichet</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>En Cours d'Instruction</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {dossiersEnCours}
          </div>
          <p className="text-[11px] text-slate-400">Transmis au Parquet compétent</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Certificats Prêts à la Remise</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {dossiersPrets}
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold">Validés par le Magistrat</p>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, téléphone, n° national ou référence..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-sans"
          />
        </div>

        <span className="text-xs text-slate-500">
          Affichage de <strong className="text-slate-800">{filtered.length}</strong> dossier(s)
        </span>
      </div>

      {/* Table of Applications */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Registre des Citoyens Reçus au Guichet
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-semibold">Référence / Date</th>
                <th className="py-3 px-4 font-semibold">Citoyen(ne)</th>
                <th className="py-3 px-4 font-semibold">Contact & Identité</th>
                <th className="py-3 px-4 font-semibold">Mode de Dépôt</th>
                <th className="py-3 px-4 font-semibold">Statut Dossier</th>
                <th className="py-3 px-4 font-semibold text-right">Actions Guichet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-sky-800 block">{d.numeroReference}</span>
                    <span className="text-[10px] text-slate-400">{new Date(d.dateCreation).toLocaleDateString('fr-FR')}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{d.demandeur.nom} {d.demandeur.prenom}</span>
                    <span className="text-[11px] text-slate-500">{d.demandeur.commune}, {d.demandeur.villeProvince}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <div>{d.demandeur.telephone}</div>
                    <div className="text-slate-400 text-[10px]">{d.demandeur.numeroNationalIdentite}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      d.modeDepot === 'guichet_assiste' 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                        : 'bg-sky-100 text-sky-900 border border-sky-300'
                    }`}>
                      {d.modeDepot === 'guichet_assiste' ? 'Guichet Communal' : 'En Ligne'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                      {d.statutActuel.toUpperCase().replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      onClick={() => setSelectedReceipt(d)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                      title="Imprimer le récépissé de dépôt physique pour le citoyen"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Récépissé</span>
                    </button>
                    <button
                      onClick={() => onViewDemande(d)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-[11px] font-semibold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Consulter</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Modal (Récépissé de Dépôt Physique) */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="text-center space-y-2 border-b border-slate-100 pb-4">
              <div className="inline-flex items-center justify-center mx-auto">
                <RdcEmblem size="sm" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</span>
                <h3 className="text-sm font-black text-slate-900 font-display">
                  RÉCÉPISSÉ OFFICIEL DE DÉPÔT PHYSIQUE
                </h3>
                <p className="text-[11px] text-slate-500">Maison Communale / Guichet d'Assistance Judiciaire</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">N° de Référence :</span>
                <span className="font-mono font-bold text-sky-900">{selectedReceipt.numeroReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Citoyen :</span>
                <span className="font-bold text-slate-900">{selectedReceipt.demandeur.nom} {selectedReceipt.demandeur.prenom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Téléphone de Suivi :</span>
                <span className="font-mono text-slate-800">{selectedReceipt.demandeur.telephone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date de Dépôt :</span>
                <span className="font-medium text-slate-700">{new Date(selectedReceipt.dateCreation).toLocaleString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Juridiction Compétente :</span>
                <span className="font-medium text-slate-700">{selectedReceipt.demandeur.villeProvince}</span>
              </div>
            </div>

            {/* QR Code de Suivi */}
            <div className="text-center p-4 bg-white border border-slate-100 rounded-2xl space-y-2">
              <div className="flex justify-center">
                <QRCodeSVG value={`https://justice.gouv.cd/suivi?ref=${selectedReceipt.numeroReference}`} size={110} />
              </div>
              <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
                Flashez ce QR Code ou conservez ce numéro pour suivre l'avancement de votre dossier sans vous déplacer.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Fermer
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer pour le Citoyen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
