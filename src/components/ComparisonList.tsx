'use client';

import { useState } from 'react';
import { useClimate } from '@/context/ClimateContext';
import { ProductCard } from './ProductCard';
import { ProductDetailSheet } from './ProductDetailSheet';
import { MethodologySheet } from './MethodologySheet';
import type { Product } from '@/types';
import { Wine, ArrowDown, Sparkles, Info } from 'lucide-react';

export function ComparisonList() {
  const { comparisonList, getSortedProducts, isLoaded } = useClimate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  // Get sorted products from context
  const sortedList = getSortedProducts();

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-eco-amber" />
            <h2 className="text-sm font-medium text-muted-foreground">
              {comparisonList.length} {comparisonList.length === 1 ? 'produkt' : 'produkter'}
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Tryck för detaljer
          </span>
        </div>

        <div className="space-y-3">
          {sortedList.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
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

      <ProductDetailSheet
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
