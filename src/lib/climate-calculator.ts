import type { PackagingType, Product, ClimateSettings, ScoreBadge } from '@/types';
import { getDistanceFromSweden } from './distance-calculator';

/**
 * Climate model, calibrated against published LCA data (June 2026).
 *
 * Sources:
 * - Systembolaget's sales-weighted packaging table (cradle-to-gate of empty
 *   container) — directly comparable to this Swedish-retail use case.
 * - DEFRA 2024 freight emission factors (kg CO₂e per tonne-km).
 * - Wine LCA review, ScienceDirect 2022 (avg ~1.2 kg CO₂e / 750 ml bottle).
 * - OIV / IFV 2024 for viticulture + vinification.
 *
 * Reference figures for a 750 ml bottle (cradle-to-retail): total ~1.2 kg
 * CO₂e (range 0.9–1.9), of which glass packaging is ~30–50% and transport
 * ~15–25%. Organic/biodynamic effects are small and contested in the
 * literature, so they are modelled as modest modifiers, not headline drivers.
 *
 * The score is computed per LITRE so different pack sizes (e.g. a 3 L
 * bag-in-box vs a 750 ml bottle) can be compared fairly; the breakdown is
 * reported per package for intuition.
 */

/** Viticulture + vinification, kg CO₂e per litre (≈0.30 per 750 ml bottle). */
export const PRODUCTION_CO2E_PER_LITER = 0.4;

/** Empty-container weight (kg), used to weight transport by tonne-km. */
export const PACKAGING_WEIGHT_KG: Record<PackagingType, number> = {
  glass_heavy: 0.55,
  glass_light: 0.4,
  aluminum_can: 0.015,
  pet: 0.04,
  bag_in_box: 0.15,
  tetra: 0.03,
};

// Per-litre CO₂e range used to map onto the 0–100 score.
const BEST_CO2E_PER_LITER = 0.6; // light pack, organic, nearby ≈ excellent
const WORST_CO2E_PER_LITER = 2.2; // heavy glass, long-haul ≈ poor

export const DEFAULT_CLIMATE_SETTINGS: ClimateSettings = {
  packaging: {
    glass_heavy: 0.5, // kg CO₂e - standard ~550 g wine bottle (Systembolaget)
    glass_light: 0.4, // kg CO₂e - lightweight ~400 g bottle
    aluminum_can: 0.06, // kg CO₂e - 33-50 cl can, high recycled content
    pet: 0.18, // kg CO₂e - PET plastic bottle
    bag_in_box: 0.2, // kg CO₂e - the full 3 L box (very low per litre)
    tetra: 0.08, // kg CO₂e - carton, lowest of the common formats
  },
  transport: {
    sea: 0.012, // kg CO₂e per tonne-km - container ship (DEFRA)
    road: 0.08, // kg CO₂e per tonne-km - articulated truck (DEFRA)
  },
  production: {
    conventional: 1.0, // baseline multiplier
    organic: 0.95, // small discount; evidence is mixed (often ~0)
    biodynamic: 0.9, // thin evidence; modest discount only
  },
};

export interface ImpactBreakdown {
  /** kg CO₂e for the whole package. */
  packaging: number;
  transport: number;
  production: number;
  total: number;
  /** kg CO₂e per litre — the basis for the score. */
  perLiter: number;
  /** 0–100, higher is better. */
  score: number;
}

export function calculateImpact(
  product: Product,
  settings: ClimateSettings
): ImpactBreakdown {
  const volumeLiters = product.volumeMl > 0 ? product.volumeMl / 1000 : 0.75;

  // Packaging: manufacturing of the empty container (independent of volume).
  const packaging = settings.packaging[product.packagingType] ?? 0.5;

  // Transport: weight (wine + empty container) × distance × tonne-km factor.
  const distance = getDistanceFromSweden(product.originCountry);
  const transportRate = settings.transport[getTransportMode(distance)];
  const weightTonnes =
    (volumeLiters + (PACKAGING_WEIGHT_KG[product.packagingType] ?? 0.4)) / 1000;
  const transport = weightTonnes * distance * transportRate;

  // Production: scales with the amount of wine, with a farming-method modifier.
  const productionMultiplier = settings.production[product.productionMethod] ?? 1;
  const production = PRODUCTION_CO2E_PER_LITER * volumeLiters * productionMultiplier;

  const total = packaging + transport + production;
  const perLiter = total / volumeLiters;

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (1 - (perLiter - BEST_CO2E_PER_LITER) / (WORST_CO2E_PER_LITER - BEST_CO2E_PER_LITER)) * 100
      )
    )
  );

  return { packaging, transport, production, total, perLiter, score };
}

export function calculateClimateScore(
  product: Product,
  settings: ClimateSettings
): number {
  return calculateImpact(product, settings).score;
}

export function getBadge(score: number): ScoreBadge {
  if (score >= 66) return 'green';
  if (score >= 33) return 'yellow';
  return 'red';
}

export function getPackagingLabel(type: string): string {
  const labels: Record<string, string> = {
    glass_heavy: 'Tung glasflaska',
    glass_light: 'Lätt glasflaska',
    aluminum_can: 'Aluminiumburk',
    pet: 'PET-flaska',
    bag_in_box: 'Bag-in-box',
    tetra: 'Tetra Pak',
  };
  return labels[type] || type;
}

export function getProductionMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    conventional: 'Konventionell',
    organic: 'Ekologisk',
    biodynamic: 'Biodynamisk',
  };
  return labels[method] || method;
}

export type TransportMode = 'sea' | 'road';

export function getTransportMode(distance: number): TransportMode {
  // Overseas = sea freight, Europe = road freight
  return distance > 3500 ? 'sea' : 'road';
}

export function getTransportModeLabel(mode: TransportMode): string {
  return mode === 'sea' ? 'båt' : 'lastbil';
}
