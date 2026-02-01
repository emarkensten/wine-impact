'use client';

import { Search, ScanBarcode, PenLine } from 'lucide-react';

interface FloatingToolbarProps {
  onSearchClick: () => void;
  onScanClick: () => void;
  onManualClick: () => void;
}

export function FloatingToolbar({
  onSearchClick,
  onScanClick,
  onManualClick,
}: FloatingToolbarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-4 pointer-events-none z-50">
      <div
        className="
          pointer-events-auto
          flex items-center gap-3 p-2.5
          rounded-2xl
          bg-white/70 dark:bg-black/40
          backdrop-blur-xl
          border border-white/50 dark:border-white/10
          shadow-[0_8px_32px_rgba(74,124,89,0.15),0_2px_8px_rgba(0,0,0,0.08)]
          dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        "
      >
        {/* Search button - primary */}
        <button
          onClick={onSearchClick}
          className="
            group flex-1 flex items-center justify-center gap-2
            min-h-[56px] px-4 rounded-xl
            bg-gradient-to-b from-eco-green to-eco-forest
            shadow-[0_4px_16px_rgba(74,124,89,0.3)]
            hover:shadow-[0_6px_20px_rgba(74,124,89,0.4)]
            transition-all duration-200 ease-out
            active:scale-[0.98]
          "
          aria-label="Sök produkt"
        >
          <Search className="w-5 h-5 text-white flex-shrink-0" />
          <span className="text-sm font-medium text-white">
            Sök
          </span>
        </button>

        {/* TEMPORÄRT DOLD - aktivera när API fungerar
        <button
          onClick={onScanClick}
          className="
            group flex-1 flex items-center justify-center gap-2
            min-h-[56px] px-4 rounded-xl
            bg-gradient-to-b from-eco-green to-eco-forest
            shadow-[0_4px_16px_rgba(74,124,89,0.3)]
            hover:shadow-[0_6px_20px_rgba(74,124,89,0.4)]
            transition-all duration-200 ease-out
            active:scale-[0.98]
          "
          aria-label="Skanna streckkod"
        >
          <ScanBarcode className="w-5 h-5 text-white flex-shrink-0" />
          <span className="text-sm font-medium text-white">
            Skanna
          </span>
        </button>
        */}

        {/* Manual button */}
        <button
          onClick={onManualClick}
          className="
            group flex-1 flex items-center justify-center gap-2
            min-h-[56px] px-4 rounded-xl
            bg-eco-amber/20 hover:bg-eco-amber
            border border-eco-amber/30
            transition-all duration-200 ease-out
            active:scale-[0.98]
          "
          aria-label="Lägg till manuellt"
        >
          <PenLine
            className="
              w-5 h-5 text-eco-amber group-hover:text-white
              transition-colors duration-200 flex-shrink-0
            "
          />
          <span
            className="
              text-sm font-medium
              text-eco-amber group-hover:text-white
              transition-colors duration-200
            "
          >
            Manuell
          </span>
        </button>
      </div>
    </div>
  );
}
