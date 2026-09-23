import React from 'react';
import { DemandeCertificat } from '../../types';
import { RdcEmblem } from '../common/RdcEmblem';
import { QRCodeSVG } from '../common/QRCodeSVG';
import { 
  Printer, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  Share2,
  Calendar,
  Lock
} from 'lucide-react';

interface CertificateDocumentProps {
  demande: DemandeCertificat;
  onClose?: () => void;
}

export const CertificateDocument: React.FC<CertificateDocumentProps> = ({
  demande,
  onClose
}) => {
  const { demandeur, certificat, decision } = demande;

  if (!certificat) {
    return (
      <div className="p-8 text-center text-slate-500">
        Le certificat n'a pas encore été délivré pour ce dossier.
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Top action bar (hidden in print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Certificat Officiel Numérique Délivré
            </h3>
            <p className="text-xs text-slate-500">
              Réf: <span className="font-mono font-semibold text-slate-700">{certificat.numeroCertificat}</span> · Scellé cryptographique actif
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer / Télécharger PDF</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Fermer
            </button>
          )}
        </div>
      </div>

      {/* Official Certificate Paper Document */}
      <div 
        id="official-certificate-sheet"
        className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl border-4 border-double border-slate-300 shadow-xl relative overflow-hidden select-text"
        style={{ minHeight: '840px' }}
      >
        {/* DRC National Watermark background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
          <img
            src="/src/assets/images/rdc_coat_of_arms_seal_1790149948388.jpg"
            alt="Watermark RDC"
            className="w-[500px] h-[500px] object-contain filter grayscale"
          />
        </div>

        {/* Security Border Guilloche simulation */}
        <div className="absolute top-2 left-2 right-2 bottom-2 border border-slate-200 pointer-events-none" />

        {/* Header Official RDC */}
        <div className="relative text-center pb-6 border-b-2 border-slate-900/80">
          <div className="flex flex-col items-center justify-center space-y-1">
            <RdcEmblem size="lg" />
            <h1 className="text-sm sm:text-base font-black tracking-widest text-slate-950 uppercase font-display mt-2">
              RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
            </h1>
            <p className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase">
              PAIX · JUSTICE · TRAVAIL
            </p>
            <div className="w-24 h-0.5 bg-amber-500 my-1" />
            <p className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              MINISTÈRE DE LA JUSTICE ET GARDE DES SCEAUX
            </p>
            <p className="text-[11px] font-medium text-slate-600 uppercase">
              {certificat.autoriteEmettrice}
            </p>
          </div>

          <div className="mt-4 flex justify-between items-center text-[11px] text-slate-600 px-4 font-mono">
            <div>
              FOLIO : <span className="font-semibold text-slate-900">{certificat.numeroCertificat.split('-').pop()}</span>
            </div>
            <div>
              REGISTRE NATIONAL : <span className="font-semibold text-slate-900">CBVM-RDC-2026</span>
            </div>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="relative text-center my-8">
          <div className="inline-block border-y-2 border-slate-900 py-2 px-8">
            <h2 className="text-xl sm:text-2xl font-black tracking-wider text-slate-950 uppercase font-display">
              CERTIFICAT DE BONNE VIE ET MŒURS
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-500 mt-2">
            N° : <span className="font-bold text-slate-900">{certificat.numeroCertificat}</span>
          </p>
        </div>

        {/* Attestation Body */}
        <div className="relative space-y-4 text-justify text-sm leading-relaxed text-slate-800 px-2 sm:px-6">
          <p>
            Le soussigné, <span className="font-bold uppercase">{certificat.signataireNom}</span>, agissant en qualité de <span className="font-bold">{certificat.signataireQualite}</span>, certifie par la présente après consultation du casier judiciaire central et vérification d'identité biométrique sécurisée que :
          </p>

          <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl my-4 space-y-2 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500">Nom, Post-nom et Prénom :</span>{' '}
                <span className="font-bold text-slate-950 uppercase">{demandeur.nom} {demandeur.postnom} {demandeur.prenom}</span>
              </div>
              <div>
                <span className="text-slate-500">Sexe :</span>{' '}
                <span className="font-semibold text-slate-900">{demandeur.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>
              </div>
              <div>
                <span className="text-slate-500">Date et lieu de naissance :</span>{' '}
                <span className="font-semibold text-slate-900">Le {formatDate(demandeur.dateNaissance)} à {demandeur.lieuNaissance}</span>
              </div>
              <div>
                <span className="text-slate-500">Nationalité :</span>{' '}
                <span className="font-semibold text-slate-900">{demandeur.nationalite}</span>
              </div>
              <div>
                <span className="text-slate-500">Pièce d'identité :</span>{' '}
                <span className="font-mono font-semibold text-slate-900">{demandeur.numeroNationalIdentite}</span> ({demandeur.typePieceIdentite.replace('_', ' ').toUpperCase()})
              </div>
              <div>
                <span className="text-slate-500">État civil :</span>{' '}
                <span className="font-semibold text-slate-900">{demandeur.etatCivil}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500">Adresse de résidence :</span>{' '}
                <span className="font-semibold text-slate-900">{demandeur.adresse}, Commune de {demandeur.commune}, Ville de {demandeur.villeProvince} (RDC)</span>
              </div>
            </div>
          </div>

          <p className="font-medium text-slate-900">
            Est de <span className="font-bold underline uppercase">bonne vie et mœurs</span>.
          </p>

          <p>
            D'après les registres officiels des greffes, tribunaux et parquets de la République Démocratique du Congo, l'intéressé(e) n'a encouru aucune condamnation infamante, ni aucune peine privative de liberté, et ne fait l'objet d'aucune poursuite judiciaire à la date de signature des présentes.
          </p>

          <p>
            En foi de quoi le présent certificat lui est délivré pour servir et valoir ce que de droit, notamment pour son dossier de : <span className="font-bold italic text-slate-900">{demandeur.motifDemande}</span> {demandeur.motifPrecision ? `(${demandeur.motifPrecision})` : ''}.
          </p>

          <div className="pt-2 text-xs text-slate-500 italic">
            * Ce document a une durée de validité légale de <span className="font-semibold text-slate-700">trois (3) mois</span> à compter de sa date de délivrance. Date limite de validité : <span className="font-bold font-mono text-slate-900">{formatDate(certificat.dateExpiration)}</span>.
          </div>
        </div>

        {/* Footer with Signatures, QR Code and Electronic Seal */}
        <div className="relative mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end px-2 sm:px-6">
          {/* QR Code and verification link */}
          <div className="flex flex-col items-center sm:items-start space-y-1.5 text-center sm:text-left">
            <QRCodeSVG value={certificat.codeVerificationQR} size={110} />
            <div className="text-[10px] font-mono text-slate-500 mt-1 max-w-[150px] leading-tight">
              Scannez pour vérifier l'authenticité sur le registre national
            </div>
          </div>

          {/* Electronic Seal Info */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-50 px-2 py-1 rounded border border-sky-200">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>SCELLÉ NUMÉRIQUE RDC</span>
            </div>
            <div className="text-[9px] font-mono text-slate-400 break-all leading-tight max-w-[200px] mx-auto">
              SHA256 : {certificat.empreinteHashSHA256}
            </div>
            <div className="text-[10px] text-slate-500 pt-1">
              Horodaté : {formatDate(certificat.dateEmission)}
            </div>
          </div>

          {/* Official Signature and Cachet */}
          <div className="text-center sm:text-right space-y-2">
            <div className="text-xs text-slate-700">
              Fait à <span className="font-semibold">{certificat.lieuDelivrance}</span>, le {formatDate(certificat.dateEmission)}
            </div>
            <div className="text-xs font-bold text-slate-900 uppercase">
              Pour l'Autorité Compétente
            </div>
            <div className="text-xs font-semibold text-sky-950">
              {certificat.signataireQualite}
            </div>
            
            {/* Stamp simulation */}
            <div className="relative inline-block my-2">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-sky-800/80 p-1 flex items-center justify-center text-center rotate-[-8deg] mx-auto">
                <div className="text-[8px] font-black uppercase text-sky-900 tracking-tighter leading-snug">
                  PARQUET DE GRANDE INSTANCE<br />
                  ★ RÉPUBLIQUE DU CONGO ★<br />
                  SCEAU OFFICIEL
                </div>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-900 underline uppercase">
              {certificat.signataireNom}
            </div>
          </div>
        </div>

        {/* Security bar footer */}
        <div className="relative mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Document sécurisé contre la falsification - Art. 124 du Code Pénal Congolais</span>
          </div>
          <div>
            Réf Dossier : {demande.numeroReference}
          </div>
        </div>
      </div>
    </div>
  );
};
