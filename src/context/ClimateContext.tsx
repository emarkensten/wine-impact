'use client';

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import type { ClimateSettings, Product, ProductWithScore } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  DEFAULT_CLIMATE_SETTINGS,
  calculateClimateScore,
  getBadge,
} from '@/lib/climate-calculator';

interface ClimateContextType {
  settings: ClimateSettings;
  updateSettings: (updates: Partial<ClimateSettings>) => void;
  resetSettings: () => void;
  comparisonList: Product[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  clearList: () => void;
  getProductWithScore: (product: Product) => ProductWithScore;
  isLoaded: boolean;
}

const ClimateContext = createContext<ClimateContextType | undefined>(undefined);

export function ClimateProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings, settingsLoaded] = useLocalStorage<ClimateSettings>(
    'ekokollen-settings',
    DEFAULT_CLIMATE_SETTINGS
  );

  const [comparisonList, setComparisonList, listLoaded] = useLocalStorage<Product[]>(
    'ekokollen-comparison',
    []
  );

  const isLoaded = settingsLoaded && listLoaded;

  const updateSettings = useCallback(
    (updates: Partial<ClimateSettings>) => {
      setSettings((prev) => ({
        ...prev,
        ...updates,
        packaging: {
          ...prev.packaging,
          ...(updates.packaging || {}),
        },
        transport: {
          ...prev.transport,
          ...(updates.transport || {}),
        },
        production: {
          ...prev.production,
          ...(updates.production || {}),
        },
      }));
    },
    [setSettings]
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_CLIMATE_SETTINGS);
  }, [setSettings]);

  const addProduct = useCallback(
    (product: Product) => {
      setComparisonList((prev) => {
        // Don't add duplicates
        if (prev.some((p) => p.id === product.id)) {
          return prev;
        }
        return [...prev, product];
      });
    },
    [setComparisonList]
  );

  const removeProduct = useCallback(
    (productId: string) => {
      setComparisonList((prev) => prev.filter((p) => p.id !== productId));
    },
    [setComparisonList]
  );

  const clearList = useCallback(() => {
    setComparisonList([]);
  }, [setComparisonList]);

  const getProductWithScore = useCallback(
    (product: Product): ProductWithScore => {
      const climateScore = calculateClimateScore(product, settings);
      const badge = getBadge(climateScore);
      return { ...product, climateScore, badge };
    },
    [settings]
  );

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      resetSettings,
      comparisonList,
      addProduct,
      removeProduct,
      clearList,
      getProductWithScore,
      isLoaded,
    }),
    [
      settings,
      updateSettings,
      resetSettings,
      comparisonList,
      addProduct,
      removeProduct,
      clearList,
      getProductWithScore,
      isLoaded,
    ]
  );

  return (
    <ClimateContext.Provider value={value}>{children}</ClimateContext.Provider>
  );
}

export function useClimate() {
  const context = useContext(ClimateContext);
  if (context === undefined) {
    throw new Error('useClimate must be used within a ClimateProvider');
  }
  return context;
}
