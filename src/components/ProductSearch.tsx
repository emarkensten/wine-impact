'use client';

import { useState, useEffect } from 'react';
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
import { getCacheStatus, type CacheStatus } from '@/lib/api';

interface ProductSearchProps {
  onProductSelect?: () => void;
}

export function ProductSearch({ onProductSelect }: ProductSearchProps) {
  const { query, setQuery, results, isLoading, error, clearSearch } =
    useProductSearch();
  const { addProduct, comparisonList } = useClimate();
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check cache status on mount
  useEffect(() => {
    let mounted = true;

    async function checkStatus() {
      try {
        const status = await getCacheStatus();
        if (mounted) {
          setCacheStatus(status);
          if (status.isLoaded) {
            setIsInitializing(false);
          } else if (status.isLoading) {
            // Poll while loading
            setTimeout(checkStatus, 500);
          } else {
            setIsInitializing(false);
          }
        }
      } catch {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    }

    checkStatus();
    return () => { mounted = false; };
  }, []);

  const handleSelect = (product: Product) => {
    addProduct(product);
    clearSearch();
    onProductSelect?.();
  };

  const isInList = (product: Product) =>
    comparisonList.some((p) => p.id === product.id);

  // Show loading state during initial catalog load
  if (isInitializing && cacheStatus?.isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-eco-sage/20 flex items-center justify-center mb-4">
            <Database className="w-7 h-7 text-eco-green animate-pulse" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            Laddar produktkatalog...
          </p>
          <p className="text-xs text-muted-foreground">
            Första gången tar det lite längre tid
          </p>
          <div className="mt-4 w-32 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-eco-green rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Sök produkt..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 h-12 bg-secondary/50 border-0 rounded-xl focus-visible:ring-eco-green"
        />
        {query && (
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

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive px-1">{error}</p>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-2 pb-2">
          {results.map((product) => {
            const alreadyAdded = isInList(product);
            return (
              <button
                key={product.id}
                onClick={() => !alreadyAdded && handleSelect(product)}
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

      {/* Empty State */}
      {query && !isLoading && results.length === 0 && !error && (
        <div className="text-center py-8 text-muted-foreground">
          <Wine className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Inga produkter hittades</p>
        </div>
      )}
    </div>
  );
}
