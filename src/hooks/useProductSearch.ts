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
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    // Cancel any in-flight request so a slower, older response can't
    // overwrite the results of a newer query.
    abortRef.current?.abort();

    if (!searchQuery.trim()) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const products = await searchProducts(searchQuery, controller.signal);
      setResults(products);
    } catch (err) {
      // Ignore aborts triggered by a newer search.
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      const message = err instanceof Error ? err.message : 'Kunde inte söka. Försök igen.';
      setError(message);
      setResults([]);
    } finally {
      // Only the latest request should clear the loading state.
      if (abortRef.current === controller) {
        setIsLoading(false);
      }
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
    setIsLoading(false);
    abortRef.current?.abort();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
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
