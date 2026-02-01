'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Product } from '@/types';
import { searchProducts } from '@/lib/api';

export function useProductSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const products = await searchProducts(searchQuery);
      setResults(products);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kunde inte söka. Försök igen.';
      setError(message);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);

      // Debounce search
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        search(newQuery);
      }, 300);
    },
    [search]
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    query,
    setQuery: handleQueryChange,
    results,
    isLoading,
    error,
    clearSearch,
  };
}
