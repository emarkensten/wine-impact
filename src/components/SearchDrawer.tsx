'use client';

import { useRef, useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { useProductSearch } from '@/hooks/useProductSearch';
import { useClimate } from '@/context/ClimateContext';
import type { Product } from '@/types';
import {
  Search,
  Loader2,
  Wine,
  MapPin,
  Plus,
  X,
  Package,
  Database,
} from 'lucide-react';
import { getPackagingLabel } from '@/lib/climate-calculator';

interface SearchDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDrawer({ isOpen, onOpenChange }: SearchDrawerProps) {
  const { query, setQuery, results, isLoading, error, clearSearch } =
    useProductSearch();
  const { addProduct, comparisonList } = useClimate();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleProductSelect = (product: Product) => {
    addProduct(product);
    clearSearch();
    onOpenChange(false);
  };

  const isInList = (product: Product) =>
    comparisonList.some((p) => p.id === product.id);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to let the drawer animate in
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      clearSearch();
    }
  }, [isOpen, clearSearch]);

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[calc(100dvh-40px)] rounded-t-3xl flex flex-col">
        {/* Fixed header with search input */}
        <div className="flex-shrink-0 bg-background rounded-t-3xl">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-lg font-semibold text-center">
              Sök produkt
            </DrawerTitle>
          </DrawerHeader>

          {/* Search Input - always visible */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                inputMode="search"
                enterKeyHint="search"
                placeholder="Sök produkt..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10 h-12 bg-secondary/50 border-0 rounded-xl focus-visible:ring-eco-green"
              />
              {query && !isLoading && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-eco-green animate-spin" />
              )}
            </div>
          </div>
        </div>

        {/* Scrollable results area */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-8">
          {/* Error Message */}
          {error && (
            <p className="text-sm text-destructive px-1 mb-3">{error}</p>
          )}

          {/* Search Results */}
          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((product) => {
                const alreadyAdded = isInList(product);
                return (
                  <button
                    key={product.id}
                    onClick={() => !alreadyAdded && handleProductSelect(product)}
                    disabled={alreadyAdded}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      alreadyAdded
                        ? 'bg-eco-sage/10 opacity-60 cursor-not-allowed'
                        : 'bg-card hover:bg-secondary active:scale-[0.98]'
                    }`}
                  >
                    {/* Product Icon */}
                    <div className="w-12 h-14 flex-shrink-0 bg-gradient-to-b from-eco-cream to-secondary rounded-lg flex items-center justify-center">
                      <Wine className="w-5 h-5 text-muted-foreground/40" />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-foreground truncate text-sm">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {product.originCountry}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {getPackagingLabel(product.packagingType)}
                        </span>
                      </div>
                    </div>

                    {/* Add Button */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        alreadyAdded
                          ? 'bg-eco-sage/20 text-eco-green'
                          : 'bg-eco-green/10 text-eco-green'
                      }`}
                    >
                      {alreadyAdded ? (
                        <span className="text-xs">✓</span>
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty State - no query */}
          {!query && !isLoading && (
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-eco-sage/10 flex items-center justify-center">
                <Database className="w-8 h-8 text-eco-green/40" />
              </div>
              <p className="text-sm">Skriv för att söka bland produkter</p>
            </div>
          )}

          {/* Empty State - no results */}
          {query && !isLoading && results.length === 0 && !error && (
            <div className="text-center py-12 text-muted-foreground">
              <Wine className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Inga produkter hittades</p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
