'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useClimate } from '@/context/ClimateContext';
import type { PackagingType, ProductionMethod } from '@/types';
import {
  Wine,
  Package,
  MapPin,
  Leaf,
  Droplets,
  Check,
} from 'lucide-react';

interface ManualProductFormProps {
  onSuccess: () => void;
}

const PACKAGING_OPTIONS: { value: PackagingType; label: string; icon: React.ReactNode }[] = [
  { value: 'glass_heavy', label: 'Tung glas', icon: <Wine className="w-4 h-4" /> },
  { value: 'glass_light', label: 'Lätt glas', icon: <Wine className="w-4 h-4" /> },
  { value: 'aluminum_can', label: 'Burk', icon: <Package className="w-4 h-4" /> },
  { value: 'bag_in_box', label: 'Bag-in-box', icon: <Package className="w-4 h-4" /> },
  { value: 'pet', label: 'PET', icon: <Droplets className="w-4 h-4" /> },
  { value: 'tetra', label: 'Tetra', icon: <Package className="w-4 h-4" /> },
];

const PRODUCTION_OPTIONS: { value: ProductionMethod; label: string }[] = [
  { value: 'conventional', label: 'Konventionell' },
  { value: 'organic', label: 'Ekologisk' },
  { value: 'biodynamic', label: 'Biodynamisk' },
];

const COMMON_COUNTRIES = [
  'Sverige',
  'Frankrike',
  'Italien',
  'Spanien',
  'Tyskland',
  'Portugal',
  'Australien',
  'Chile',
  'Argentina',
  'USA',
  'Sydafrika',
  'Nya Zeeland',
];

export function ManualProductForm({ onSuccess }: ManualProductFormProps) {
  const { addProduct } = useClimate();
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [packaging, setPackaging] = useState<PackagingType>('glass_heavy');
  const [production, setProduction] = useState<ProductionMethod>('conventional');
  const [volume, setVolume] = useState('750');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !country.trim()) return;

    const product = {
      id: `manual-${Date.now()}`,
      name: name.trim(),
      imageUrl: '/placeholder-bottle.svg',
      packagingType: packaging,
      originCountry: country.trim(),
      productionMethod: production,
      volumeMl: parseInt(volume) || 750,
      price: 0,
    };

    addProduct(product);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Product Name */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Produktnamn
        </label>
        <Input
          type="text"
          placeholder="T.ex. Château Margaux 2015"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 rounded-xl bg-secondary/50 border-0"
          required
        />
      </div>

      {/* Country */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
          <MapPin className="w-4 h-4 text-eco-green" />
          Ursprungsland
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {COMMON_COUNTRIES.slice(0, 6).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCountry(c)}
              className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                country === c
                  ? 'bg-eco-green text-white'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <Input
          type="text"
          placeholder="Eller skriv land..."
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="h-10 rounded-xl bg-secondary/50 border-0"
          required
        />
      </div>

      {/* Packaging Type */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
          <Package className="w-4 h-4 text-eco-green" />
          Förpackning
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PACKAGING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPackaging(opt.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                packaging === opt.value
                  ? 'bg-eco-green text-white'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {opt.icon}
              <span className="text-xs">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Production Method */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
          <Leaf className="w-4 h-4 text-eco-green" />
          Produktionsmetod
        </label>
        <div className="flex gap-2">
          {PRODUCTION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setProduction(opt.value)}
              className={`flex-1 py-2.5 px-3 text-sm rounded-xl transition-all ${
                production === opt.value
                  ? 'bg-eco-green text-white'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Volume */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Volym (ml)
        </label>
        <div className="flex gap-2">
          {['330', '500', '750', '1000', '3000'].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVolume(v)}
              className={`flex-1 py-2 text-sm rounded-xl transition-all ${
                volume === v
                  ? 'bg-eco-green text-white'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full h-12 rounded-xl bg-eco-green hover:bg-eco-forest text-white"
        disabled={!name.trim() || !country.trim()}
      >
        <Check className="w-4 h-4 mr-2" />
        Lägg till produkt
      </Button>
    </form>
  );
}
