'use client';

import { Search, ScanBarcode, Plus } from 'lucide-react';

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
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-8 pt-4 pointer-events-none z-50">
      <div
        className="
          pointer-events-auto
          flex items-center gap-1 p-1.5
          rounded-2xl
          bg-white/70 dark:bg-black/40
          backdrop-blur-xl
          border border-white/50 dark:border-white/10
          shadow-[0_8px_32px_rgba(74,124,89,0.15),0_2px_8px_rgba(0,0,0,0.08)]
          dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        "
      >
        {/* Search button */}
        <button
          onClick={onSearchClick}
          className="
            group relative flex flex-col items-center justify-center
            w-16 h-16 rounded-xl
            bg-eco-green/10 hover:bg-eco-green
            transition-all duration-200 ease-out
            active:scale-95
          "
          aria-label="Sök produkt"
        >
          <Search
            className="
              w-6 h-6 text-eco-green group-hover:text-white
              transition-colors duration-200
            "
          />
          <span
            className="
              text-[10px] font-medium mt-0.5
              text-eco-green/80 group-hover:text-white/90
              transition-colors duration-200
            "
          >
            Sök
          </span>
        </button>

        {/* Scan button - primary/larger */}
        <button
          onClick={onScanClick}
          className="
            group relative flex flex-col items-center justify-center
            w-[72px] h-[72px] -my-1 rounded-2xl
            bg-gradient-to-b from-eco-green to-eco-forest
            shadow-[0_4px_16px_rgba(74,124,89,0.4)]
            hover:shadow-[0_6px_20px_rgba(74,124,89,0.5)]
            hover:scale-105
            transition-all duration-200 ease-out
            active:scale-95
          "
          aria-label="Skanna streckkod"
        >
          <ScanBarcode className="w-7 h-7 text-white" />
          <span className="text-[10px] font-medium mt-0.5 text-white/90">
            Skanna
          </span>
        </button>

        {/* Manual button */}
        <button
          onClick={onManualClick}
          className="
            group relative flex flex-col items-center justify-center
            w-16 h-16 rounded-xl
            bg-eco-amber/10 hover:bg-eco-amber
            transition-all duration-200 ease-out
            active:scale-95
          "
          aria-label="Lägg till manuellt"
        >
          <Plus
            className="
              w-6 h-6 text-eco-amber group-hover:text-white
              transition-colors duration-200
            "
          />
          <span
            className="
              text-[10px] font-medium mt-0.5
              text-eco-amber/80 group-hover:text-white/90
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
