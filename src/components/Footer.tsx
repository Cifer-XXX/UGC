import React from 'react';

interface FooterProps {
  onNavigateTab: (tab: 'DASHBOARD' | 'RANKINGS' | 'FIGHTERS' | 'MATCHMAKING') => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenContact?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigateTab,
  onOpenPrivacy,
  onOpenTerms,
  onOpenContact
}) => {
  return (
    <footer className="bg-[#0e0e0e] text-[#ffb4ac] border-t border-[#333333] w-full bottom-0 z-40 flex flex-col md:flex-row justify-between items-center px-4 md:px-6 py-4 mt-auto relative">
      <div 
        onClick={() => onNavigateTab('DASHBOARD')}
        className="cursor-pointer group flex flex-col items-center md:items-start"
      >
        <div className="font-headline-sm text-xl text-[#e5e2e1] tracking-wider group-hover:text-[#e61c24] transition-colors leading-none">
          ULTIMATE GAKURAN CHAMPIONSHIP
        </div>
        <div className="font-label-caps text-[10px] tracking-[0.2em] text-[#a09e9e] uppercase font-bold mt-1 leading-none">
          MANAGER
        </div>
      </div>

      <div className="flex items-center space-x-6 my-3 md:my-0">
        <button 
          onClick={onOpenPrivacy}
          className="font-label-caps text-xs text-[#a09e9e] hover:text-[#ffb4ac] transition-colors uppercase"
        >
          Privacy Policy
        </button>
        <button 
          onClick={onOpenTerms}
          className="font-label-caps text-xs text-[#a09e9e] hover:text-[#ffb4ac] transition-colors uppercase"
        >
          Terms of Service
        </button>
        <button 
          onClick={onOpenContact}
          className="font-label-caps text-xs text-[#a09e9e] hover:text-[#ffb4ac] transition-colors uppercase"
        >
          Contact
        </button>
        <button 
          onClick={() => window.open('https://ufc.com', '_blank')}
          className="font-label-caps text-xs text-[#a09e9e] hover:text-[#ffb4ac] transition-colors uppercase"
        >
          Social
        </button>
      </div>

      <div className="font-body-md text-[#a09e9e] uppercase tracking-widest text-[11px]">
        © 2024 COMBAT SPORTS ARCHITECT. ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
};
