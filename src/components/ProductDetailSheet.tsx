'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useClimate } from '@/context/ClimateContext';
import type { Product } from '@/types';
import { getDistanceFromSweden } from '@/lib/distance-calculator';
import {
  getPackagingLabel,
  getProductionMethodLabel,
  getTransportMode,
  getTransportModeLabel,
  BASE_PRODUCTION_CO2E,
} from '@/lib/climate-calculator';
import {
  Package,
  Truck,
  Ship,
  Leaf,
  Wine,
  MapPin,
  Trash2,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';

interface ProductDetailSheetProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ImpactBreakdown {
  packaging: number;
  transport: number;
  production: number;
  total: number;
  score: number;
}

function calculateBreakdown(
  product: Product,
  settings: ReturnType<typeof useClimate>['settings']
): ImpactBreakdown {
  // Packaging impact (independent of production method)
  const packagingImpact = settings.packaging[product.packagingType] || 0.5;

  // Transport impact (independent of production method)
  const distance = getDistanceFromSweden(product.originCountry);
  const transportMode = getTransportMode(distance);
  const transportRate = settings.transport[transportMode];
  const volumeLiters = product.volumeMl / 1000;
  const transportImpact = (distance * transportRate * volumeLiters) / 1000;

  // Production impact: base CO₂e * multiplier for organic/biodynamic
  const productionMultiplier = settings.production[product.productionMethod] || 1;
  const productionImpact = BASE_PRODUCTION_CO2E * productionMultiplier;

  // Total is sum of independent factors
  const total = packagingImpact + transportImpact + productionImpact;

  const maxCO2e = 2.5;
  const score = Math.max(0, Math.min(100, Math.round((1 - total / maxCO2e) * 100)));

  return {
    packaging: packagingImpact,
    transport: transportImpact,
    production: productionImpact,
    total,
    score,
  };
}

function ImpactRing({
  breakdown,
  score,
}: {
  breakdown: ImpactBreakdown;
  score: number;
}) {
  const total = breakdown.packaging + breakdown.transport + breakdown.production;
  const packagingPercent = total > 0 ? (breakdown.packaging / total) * 100 : 33;
  const transportPercent = total > 0 ? (breakdown.transport / total) * 100 : 33;
  const productionPercent = total > 0 ? (breakdown.production / total) * 100 : 34;

  // SVG ring parameters
  const size = 180;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const packagingDash = (packagingPercent / 100) * circumference;
  const transportDash = (transportPercent / 100) * circumference;
  const productionDash = (productionPercent / 100) * circumference;

  const badgeColor =
    score >= 66
      ? 'text-score-green'
      : score >= 33
        ? 'text-score-yellow'
        : 'text-score-red';

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))' }}
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-secondary"
        />

        {/* Packaging segment */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#D4A574"
          strokeWidth={strokeWidth}
          strokeDasharray={`${packagingDash} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />

        {/* Transport segment */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#6B9E7A"
          strokeWidth={strokeWidth}
          strokeDasharray={`${transportDash} ${circumference}`}
          strokeDashoffset={-packagingDash}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />

        {/* Production segment */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#4A7C59"
          strokeWidth={strokeWidth}
          strokeDasharray={`${productionDash} ${circumference}`}
          strokeDashoffset={-(packagingDash + transportDash)}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Center score */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${badgeColor}`}>{score}</span>
        <span className="text-xs text-muted-foreground mt-0.5">av 100</span>
      </div>
    </div>
  );
}

function ImpactFactor({
  icon: Icon,
  label,
  value,
  unit,
  color,
  description,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  unit: string;
  color: string;
  description: string;
  trend?: 'good' | 'bad' | 'neutral';
}) {
  const TrendIcon =
    trend === 'good' ? TrendingDown : trend === 'bad' ? TrendingUp : Minus;
  const trendColor =
    trend === 'good'
      ? 'text-score-green'
      : trend === 'bad'
        ? 'text-score-red'
        : 'text-muted-foreground';

  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border/50 transition-all hover:border-border">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold" style={{ color }}>
              {value}
            </span>
            <span className="text-xs text-muted-foreground">{unit}</span>
            {trend && (
              <TrendIcon className={`w-3.5 h-3.5 ml-1 ${trendColor}`} />
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export function ProductDetailSheet({
  product,
  isOpen,
  onClose,
}: ProductDetailSheetProps) {
  const { settings, removeProduct } = useClimate();

  if (!product) return null;

  const handleRemove = () => {
    removeProduct(product.id);
    onClose();
  };

  const breakdown = calculateBreakdown(product, settings);
  const distance = getDistanceFromSweden(product.originCountry);
  const transportMode = getTransportMode(distance);
  const transportModeLabel = getTransportModeLabel(transportMode);
  const TransportIcon = transportMode === 'sea' ? Ship : Truck;

  const packagingTrend =
    breakdown.packaging < 0.3 ? 'good' : breakdown.packaging > 0.6 ? 'bad' : 'neutral';
  const transportTrend =
    breakdown.transport < 0.2 ? 'good' : breakdown.transport > 0.5 ? 'bad' : 'neutral';
  const productionTrend =
    product.productionMethod === 'biodynamic'
      ? 'good'
      : product.productionMethod === 'organic'
        ? 'good'
        : 'neutral';

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[calc(100dvh-40px)] rounded-t-3xl">
        <div className="overflow-y-auto pb-8">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="sr-only">Produktdetaljer</DrawerTitle>
          </DrawerHeader>

          <div className="px-6">
            {/* Product Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="relative w-20 h-24 flex-shrink-0 bg-gradient-to-b from-eco-cream to-secondary rounded-xl overflow-hidden">
                {product.imageUrl &&
                product.imageUrl !== '/placeholder-bottle.svg' ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Wine className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h2 className="text-lg font-semibold text-foreground leading-tight">
                  {product.name}
                </h2>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{product.originCountry}</span>
                  <span className="text-border">•</span>
                  <span>{product.volumeMl} ml</span>
                </div>
              </div>
            </div>

            {/* Impact Ring */}
            <div className="flex justify-center mb-8">
              <ImpactRing breakdown={breakdown} score={breakdown.score} />
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 mb-6">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D4A574]" />
                <span className="text-xs text-muted-foreground">Förpackning</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#6B9E7A]" />
                <span className="text-xs text-muted-foreground">Transport</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#4A7C59]" />
                <span className="text-xs text-muted-foreground">Produktion</span>
              </div>
            </div>

            {/* Impact Breakdown */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Klimatpåverkan uppdelat
              </h3>

              <ImpactFactor
                icon={Package}
                label="Förpackning"
                value={breakdown.packaging.toFixed(2)}
                unit="kg CO₂e"
                color="#D4A574"
                description={`${getPackagingLabel(product.packagingType)} har ${
                  breakdown.packaging < 0.3
                    ? 'låg'
                    : breakdown.packaging > 0.6
                      ? 'hög'
                      : 'medel'
                } klimatpåverkan`}
                trend={packagingTrend}
              />

              <ImpactFactor
                icon={TransportIcon}
                label="Transport"
                value={breakdown.transport.toFixed(2)}
                unit="kg CO₂e"
                color="#6B9E7A"
                description={`${Math.round(distance).toLocaleString('sv-SE')} km från ${product.originCountry} till Sverige med ${transportModeLabel}`}
                trend={transportTrend}
              />

              <ImpactFactor
                icon={Leaf}
                label="Produktion"
                value={breakdown.production.toFixed(2)}
                unit="kg CO₂e"
                color="#4A7C59"
                description={`${getProductionMethodLabel(product.productionMethod)} odling${
                  product.productionMethod !== 'conventional'
                    ? ' ger lägre utsläpp'
                    : ''
                }`}
                trend={productionTrend}
              />
            </div>

            {/* Total */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-eco-sage/10 to-eco-green/5 border border-eco-green/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Total klimatpåverkan
                </span>
                <div className="text-right">
                  <span className="text-xl font-bold text-eco-green">
                    {breakdown.total.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">
                    kg CO₂e
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Beräknat per förpackning. Lägre är bättre.
              </p>
            </div>

            {/* Remove Button */}
            <Button
              variant="outline"
              className="w-full mt-6 h-12 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleRemove}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Ta bort från jämförelse
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
