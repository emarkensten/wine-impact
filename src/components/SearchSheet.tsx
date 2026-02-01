'use client';

import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ProductSearch } from './ProductSearch';
import { BarcodeScanner } from './BarcodeScanner';
import { ManualProductForm } from './ManualProductForm';
import {
  Search,
  ScanBarcode,
  Plus,
  ChevronUp,
} from 'lucide-react';

type ViewMode = 'search' | 'manual';

export function SearchSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('search');

  const handleProductSelect = () => {
    // Keep sheet open to allow adding more products
  };

  const handleManualAdd = () => {
    setViewMode('search');
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-2 bg-gradient-to-t from-background via-background to-transparent">
            <Button
              className="w-full h-14 rounded-2xl bg-eco-green hover:bg-eco-forest text-white shadow-lg shadow-eco-green/20 transition-all active:scale-[0.98]"
            >
              <Search className="w-5 h-5 mr-2" />
              Sök eller skanna produkt
              <ChevronUp className="w-4 h-4 ml-auto" />
            </Button>
          </div>
        </DrawerTrigger>

        <DrawerContent className="max-h-[calc(100dvh-40px)] rounded-t-3xl flex flex-col">
          <DrawerHeader className="pb-2 flex-shrink-0">
            <DrawerTitle className="text-lg font-semibold text-center">
              {viewMode === 'search' ? 'Lägg till produkt' : 'Lägg till manuellt'}
            </DrawerTitle>
          </DrawerHeader>

          <div className="px-4 pb-8 flex-1 overflow-y-auto min-h-0">
            {viewMode === 'search' ? (
              <>
                {/* Action Buttons */}
                <div className="flex gap-2 mb-4 flex-shrink-0">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-xl border-eco-green/30 text-eco-green hover:bg-eco-green/10"
                    onClick={() => setIsScannerOpen(true)}
                  >
                    <ScanBarcode className="w-4 h-4 mr-2" />
                    Skanna
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-xl"
                    onClick={() => setViewMode('manual')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Manuellt
                  </Button>
                </div>

                {/* Search Component */}
                <ProductSearch onProductSelect={handleProductSelect} />
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="mb-4 -ml-2 text-muted-foreground"
                  onClick={() => setViewMode('search')}
                >
                  ← Tillbaka till sök
                </Button>
                <ManualProductForm onSuccess={handleManualAdd} />
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </>
  );
}
