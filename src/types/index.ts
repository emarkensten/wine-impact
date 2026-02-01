export type PackagingType =
  | 'glass_heavy'
  | 'glass_light'
  | 'aluminum_can'
  | 'pet'
  | 'bag_in_box'
  | 'tetra';

export type ProductionMethod = 'conventional' | 'organic' | 'biodynamic';

export type TransportMethod = 'sea' | 'road' | 'air';

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  packagingType: PackagingType;
  originCountry: string;
  productionMethod: ProductionMethod;
  volumeMl: number;
  price: number;
  category?: string;
  producer?: string;
  alcoholPercentage?: number;
}

export interface ClimateSettings {
  packaging: Record<PackagingType, number>;
  transport: Record<TransportMethod, number>;
  production: Record<ProductionMethod, number>;
  thresholds: {
    green_max: number;
    yellow_max: number;
  };
}

export type ScoreBadge = 'green' | 'yellow' | 'red';

export interface ProductWithScore extends Product {
  climateScore: number;
  badge: ScoreBadge;
}
