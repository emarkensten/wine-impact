import type { Product, ClimateSettings, ScoreBadge } from '@/types';
import { getDistanceFromSweden } from './distance-calculator';

/**
 * Default climate settings based on industry standards and research.
 *
 * Sources:
 * - Systembolagets klimatmärkning
 * - Livsmedelsverkets data (2024)
 * - EU Packaging and Packaging Waste Regulation
 * - IVL Svenska Miljöinstitutet
 *
 * Packaging values (kg CO₂e per package):
 * - Glass production is energy-intensive; weight is the primary factor
 * - Heavy wine bottle (500-600g): ~0.8 kg CO₂e
 * - Light wine bottle (350-400g): ~0.5 kg CO₂e
 * - Aluminum can: Low per unit, high recyclability factor
 * - PET: Lower production impact but recyclability varies
 * - Bag-in-box: Very efficient per liter of liquid
 * - Tetra Pak: Lowest impact for paper-based packaging
 *
 * Transport values (kg CO₂e per km per liter):
 * - Sea freight: ~0.01 (very efficient for bulk)
 * - Road freight: ~0.05 (typical truck transport)
 * - Air freight: ~0.5 (rarely used for beverages)
 *
 * Production multipliers:
 * - Conventional: 1.0 (baseline)
 * - Organic: 0.85 (reduced chemical inputs, often lower yields)
 * - Biodynamic: 0.75 (additional sustainable practices)
 */
/**
 * Base production CO₂e (vineyard, winery operations) per bottle.
 * This is what the organic/biodynamic multiplier applies to.
 */
export const BASE_PRODUCTION_CO2E = 0.4; // kg CO₂e per bottle

export const DEFAULT_CLIMATE_SETTINGS: ClimateSettings = {
  packaging: {
    glass_heavy: 0.8,    // kg CO₂e - standard 500-600g wine bottle
    glass_light: 0.5,    // kg CO₂e - lightweight 350-400g bottle
    aluminum_can: 0.2,   // kg CO₂e - 33-50cl can, high recyclability
    pet: 0.15,           // kg CO₂e - PET plastic bottle
    bag_in_box: 0.1,     // kg CO₂e - per liter equivalent, very efficient
    tetra: 0.08,         // kg CO₂e - Tetra Pak carton, most efficient
  },
  transport: {
    sea: 0.01,    // kg CO₂e/km/liter - container ship bulk transport
    road: 0.05,   // kg CO₂e/km/liter - standard truck transport
    air: 0.5,     // kg CO₂e/km/liter - air freight (seldom used)
  },
  production: {
    conventional: 1.0,   // baseline multiplier
    organic: 0.85,       // ~15% reduction vs conventional
    biodynamic: 0.75,    // ~25% reduction vs conventional
  },
  thresholds: {
    green_max: 100,  // Score >= 66 is green
    yellow_max: 50,  // Score 33-65 is yellow, < 33 is red
  },
};

export function calculateClimateScore(
  product: Product,
  settings: ClimateSettings
): number {
  // Get packaging impact (independent of production method)
  const packagingImpact = settings.packaging[product.packagingType] || 0.5;

  // Calculate transport impact (independent of production method)
  const distance = getDistanceFromSweden(product.originCountry);
  const transportMode = getTransportMode(distance);
  const transportRate = settings.transport[transportMode];

  // Convert volume to liters
  const volumeLiters = product.volumeMl / 1000;
  const transportImpact = distance * transportRate * volumeLiters / 1000; // Normalize

  // Production impact: base value * multiplier for organic/biodynamic
  const productionMultiplier = settings.production[product.productionMethod] || 1;
  const productionImpact = BASE_PRODUCTION_CO2E * productionMultiplier;

  // Calculate total CO2e impact (sum of independent factors)
  const totalCO2e = packagingImpact + transportImpact + productionImpact;

  // Normalize to 0-100 score (lower CO2e = higher score)
  // Typical range: 0.2 (best) to 2.5 (worst) kg CO2e
  const maxCO2e = 2.5;
  const score = Math.max(0, Math.min(100, Math.round((1 - totalCO2e / maxCO2e) * 100)));

  return score;
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
