'use client';

import { useState } from 'react';
import { ComparisonList } from '@/components/ComparisonList';
import { FloatingToolbar } from '@/components/FloatingToolbar';
import { SearchDrawer } from '@/components/SearchDrawer';
import { ManualDrawer } from '@/components/ManualDrawer';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { MethodologySheet } from '@/components/MethodologySheet';
import { useClimate } from '@/context/ClimateContext';
import { Leaf, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { comparisonList, clearList } = useClimate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);

  return (
    <main className="min-h-dvh flex flex-col bg-background texture-grain">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-eco-green to-eco-forest flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                VinKollen
              </h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">
                Jämför klimatpåverkan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {comparisonList.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                onClick={clearList}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <MethodologySheet />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-4 pb-32">
        <ComparisonList />
      </div>

      {/* Floating Toolbar */}
      <FloatingToolbar
        onSearchClick={() => setIsSearchOpen(true)}
        onScanClick={() => setIsScannerOpen(true)}
        onManualClick={() => setIsManualOpen(true)}
      />

      {/* Drawers */}
      <SearchDrawer isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} />
      <ManualDrawer isOpen={isManualOpen} onOpenChange={setIsManualOpen} />
      <BarcodeScanner isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </main>
  );
}
