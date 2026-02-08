'use client';

import { useState, useEffect, useCallback } from 'react';
import { useClimate } from '@/context/ClimateContext';
import { ProductCard } from './ProductCard';
import { ProductDetailSheet } from './ProductDetailSheet';
import { ProductDetailPanel } from './ProductDetailPanel';
import { MethodologySheet } from './MethodologySheet';
import type { Product } from '@/types';
import { Wine, ArrowDown, Sparkles, Info, BarChart3 } from 'lucide-react';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isDesktop;
}

export function ComparisonList() {
  const { comparisonList, getSortedProducts, removeProduct, isLoaded } = useClimate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const isDesktop = useIsDesktop();

  const sortedList = isLoaded ? getSortedProducts() : [];

  // Auto-select first product on desktop when list changes
  useEffect(() => {
    if (!isDesktop || sortedList.length === 0) return;

    // If nothing is selected, or selected product was removed, select first
    if (!selectedProduct || !sortedList.find(p => p.id === selectedProduct.id)) {
      setSelectedProduct(sortedList[0]);
    }
  }, [isDesktop, sortedList, selectedProduct]);

  const handleRemoveSelected = useCallback(() => {
    if (!selectedProduct) return;
    removeProduct(selectedProduct.id);
    setSelectedProduct(null);
  }, [selectedProduct, removeProduct]);

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-eco-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (comparisonList.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-20 h-20 rounded-full bg-eco-sage/20 flex items-center justify-center mb-6">
          <Wine className="w-10 h-10 text-eco-green" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Ingen produkt vald
        </h2>
        <p className="text-muted-foreground text-sm max-w-xs mb-6">
          Sök efter en produkt eller skanna en streckkod för att börja jämföra
          klimatpåverkan
        </p>
        <div className="flex items-center gap-2 text-eco-green animate-bounce mb-8">
          <ArrowDown className="w-4 h-4" />
          <span className="text-sm font-medium">Börja söka nedan</span>
        </div>
        <MethodologySheet
          trigger={
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Info className="w-3 h-3" />
              Hur räknar vi?
            </button>
          }
        />
      </div>
    );
  }

  return (
    <>
      {/* Mobile: single column | Desktop: side-by-side master-detail */}
      <div className="flex-1 flex flex-col md:flex-row md:gap-6 overflow-hidden px-4 pb-4">
        {/* Left: Card list */}
        <div className="md:w-[380px] md:flex-shrink-0 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-eco-amber" />
              <h2 className="text-sm font-medium text-muted-foreground">
                {comparisonList.length} {comparisonList.length === 1 ? 'produkt' : 'produkter'}
              </h2>
            </div>
            <span className="text-xs text-muted-foreground md:hidden">
              Tryck för detaljer
            </span>
          </div>

          <div className="space-y-3">
            {sortedList.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                isSelected={isDesktop && selectedProduct?.id === product.id}
                onSelect={setSelectedProduct}
              />
            ))}
          </div>

          {/* Methodology link */}
          <div className="flex justify-center mt-6">
            <MethodologySheet
              trigger={
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="w-3 h-3" />
                  Hur räknar vi?
                </button>
              }
            />
          </div>
        </div>

        {/* Right: Detail panel (desktop only) */}
        <div className="hidden md:flex md:flex-1 md:min-w-0">
          {selectedProduct ? (
            <div className="flex-1 overflow-y-auto rounded-2xl bg-card/50 border border-border/50 py-6">
              <ProductDetailPanel
                key={selectedProduct.id}
                product={selectedProduct}
                onRemove={handleRemoveSelected}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center rounded-2xl bg-card/30 border border-border/30">
              <div className="w-16 h-16 rounded-full bg-eco-sage/15 flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-eco-green/50" />
              </div>
              <p className="text-sm text-muted-foreground">
                Välj en produkt för att se detaljer
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Drawer for detail view */}
      <div className="md:hidden">
        <ProductDetailSheet
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      </div>
    </>
  );
}
