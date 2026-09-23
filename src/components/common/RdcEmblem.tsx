import React from 'react';

interface RdcEmblemProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const RdcEmblem: React.FC<RdcEmblemProps> = ({
  size = 'md',
  showText = false,
  className = ''
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const sealImg = '/src/assets/images/rdc_coat_of_arms_seal_1790149948388.jpg';

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeMap[size]} shrink-0 rounded-full overflow-hidden border border-amber-400/40 shadow-xs bg-slate-900`}>
        <img
          src={sealImg}
          alt="Armoiries de la République Démocratique du Congo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback SVG if image is blocked
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        {/* SVG Fallback */}
        <div className="absolute inset-0 flex items-center justify-center bg-radial from-sky-900 via-slate-900 to-slate-950 text-amber-400 p-1 pointer-events-none -z-10">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#F59E0B" strokeWidth="4" />
            <path d="M50 20 L58 40 L80 40 L62 54 L69 75 L50 62 L31 75 L38 54 L20 40 L42 40 Z" fill="#F59E0B" opacity="0.8" />
            <circle cx="50" cy="50" r="24" fill="#0284C7" />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-bold tracking-widest text-slate-800 uppercase">
            RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
          </span>
          <span className="text-[10px] text-slate-500 font-medium tracking-tight">
            Justice · Paix · Travail
          </span>
        </div>
      )}
    </div>
  );
};
