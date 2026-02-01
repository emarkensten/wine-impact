'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClimate } from '@/context/ClimateContext';
import type { Product } from '@/types';
import {
  getPackagingLabel,
  getProductionMethodLabel,
} from '@/lib/climate-calculator';
import {
  Wine,
  MapPin,
  Package,
  Leaf,
  X,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  index: number;
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, index, onSelect }: ProductCardProps) {
  const { getProductWithScore, removeProduct } = useClimate();
  const [isRemoving, setIsRemoving] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const productWithScore = getProductWithScore(product);
  const { climateScore, badge } = productWithScore;

  const badgeConfig = {
    green: {
      bg: 'bg-score-green/10',
      border: 'border-score-green/30',
      text: 'text-score-green',
      fill: 'bg-score-green',
      label: 'Bra val',
    },
    yellow: {
      bg: 'bg-score-yellow/10',
      border: 'border-score-yellow/30',
      text: 'text-score-yellow',
      fill: 'bg-score-yellow',
      label: 'Okej',
    },
    red: {
      bg: 'bg-score-red/10',
      border: 'border-score-red/30',
      text: 'text-score-red',
      fill: 'bg-score-red',
      label: 'Tänk efter',
    },
  };

  const config = badgeConfig[badge];

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.touches[0].clientX;
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, 100));
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset > 60) {
      setIsRemoving(true);
      setTimeout(() => removeProduct(product.id), 300);
    } else {
      setSwipeOffset(0);
    }
    setTouchStart(null);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRemoving(true);
    setTimeout(() => removeProduct(product.id), 300);
  };

  const handleClick = () => {
    if (swipeOffset === 0) {
      onSelect(product);
    }
  };

  return (
    <div
      className={`relative transition-all duration-300 ${
        isRemoving ? 'opacity-0 -translate-x-full' : 'opacity-100'
      }`}
      style={{
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Delete indicator */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-end pr-4 bg-destructive/10 rounded-2xl w-full -z-10">
        <X className="w-5 h-5 text-destructive" />
      </div>

      <Card
        className="overflow-hidden border-0 shadow-sm bg-card/80 backdrop-blur-sm animate-slide-up cursor-pointer active:scale-[0.98] transition-transform"
        style={{
          transform: `translateX(-${swipeOffset}px)`,
          animationDelay: `${index * 80}ms`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div className="flex gap-4 p-4">
          {/* Product Image */}
          <div className="relative w-20 h-24 flex-shrink-0 bg-gradient-to-b from-eco-cream to-secondary rounded-xl overflow-hidden">
            {product.imageUrl && product.imageUrl !== '/placeholder-bottle.svg' ? (
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

          {/* Product Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div>
              <h3 className="font-semibold text-foreground truncate pr-8">
                {product.name}
              </h3>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {product.originCountry}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {getPackagingLabel(product.packagingType)}
                </span>
                {product.productionMethod !== 'conventional' && (
                  <span className="flex items-center gap-1 text-eco-green">
                    <Leaf className="w-3 h-3" />
                    {getProductionMethodLabel(product.productionMethod)}
                  </span>
                )}
              </div>
            </div>

            {/* Score Section */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                {/* Badge - mindre för att klimatcirkeln ska poppa */}
                <Badge
                  variant="outline"
                  className={`${config.bg} ${config.border} ${config.text} text-[9px] font-medium px-1.5 py-0`}
                >
                  {badge === 'green' && <Sparkles className="w-2 h-2 mr-0.5" />}
                  {config.label}
                </Badge>

                {/* Stoppljuscirkel med klimatvärde */}
                <div className="flex items-center gap-1.5">
                  <div className={`
                    w-9 h-9 rounded-full flex items-center justify-center
                    ${config.fill} shadow-md
                  `}>
                    <span className="text-sm font-bold text-white">{climateScore}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                </div>
              </div>

              {/* Fylld progress-bar (tjockare) */}
              <div className="relative h-2.5 rounded-full overflow-hidden bg-muted/40">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full ${config.fill}
                    transition-all duration-700 ease-out animate-score-fill`}
                  style={{ width: `${climateScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Remove Button (desktop) */}
          <button
            onClick={handleRemove}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-destructive/10 transition-colors hidden sm:flex"
            aria-label="Ta bort"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </Card>
    </div>
  );
}
