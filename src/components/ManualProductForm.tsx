'use client';

import { useState, useMemo } from 'react';
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
  Beer,
  GlassWater,
  Martini,
} from 'lucide-react';

interface ManualProductFormProps {
  onSuccess: () => void;
}

type DrinkType = 'red_wine' | 'white_wine' | 'rose_wine' | 'sparkling' | 'beer' | 'cider' | 'spirits';

const DRINK_TYPE_OPTIONS: { value: DrinkType; label: string; icon: React.ReactNode }[] = [
  { value: 'red_wine', label: 'Rött vin', icon: <Wine className="w-4 h-4" /> },
  { value: 'white_wine', label: 'Vitt vin', icon: <Wine className="w-4 h-4" /> },
  { value: 'rose_wine', label: 'Rosévin', icon: <Wine className="w-4 h-4" /> },
  { value: 'sparkling', label: 'Mousserande', icon: <GlassWater className="w-4 h-4" /> },
  { value: 'beer', label: 'Öl', icon: <Beer className="w-4 h-4" /> },
  { value: 'cider', label: 'Cider', icon: <Beer className="w-4 h-4" /> },
  { value: 'spirits', label: 'Sprit', icon: <Martini className="w-4 h-4" /> },
];

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

const ALL_COUNTRIES = [
  'Sverige', 'Frankrike', 'Italien', 'Spanien', 'Tyskland', 'Portugal',
  'Australien', 'Chile', 'Argentina', 'USA', 'Sydafrika', 'Nya Zeeland',
  'Österrike', 'Grekland', 'Ungern', 'Belgien', 'England', 'Irland',
  'Skottland', 'Japan', 'Mexiko', 'Brasilien', 'Uruguay', 'Kanada',
  'Schweiz', 'Nederländerna', 'Danmark', 'Norge', 'Finland', 'Polen',
  'Tjeckien', 'Slovenien', 'Kroatien', 'Rumänien', 'Bulgarien', 'Georgien',
  'Libanon', 'Israel', 'Turkiet', 'Kina', 'Indien', 'Thailand',
];

const QUICK_COUNTRIES = ['Sverige', 'Frankrike', 'Italien', 'Spanien', 'Tyskland', 'Chile'];

export function ManualProductForm({ onSuccess }: ManualProductFormProps) {
  const { addProduct } = useClimate();
  const [drinkType, setDrinkType] = useState<DrinkType | null>(null);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [countryInput, setCountryInput] = useState('');
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [packaging, setPackaging] = useState<PackagingType>('glass_heavy');
  const [production, setProduction] = useState<ProductionMethod>('conventional');
  const [volume, setVolume] = useState('750');

  // Filter countries based on input
  const filteredCountries = useMemo(() => {
    if (!countryInput.trim()) return [];
    const search = countryInput.toLowerCase();
    return ALL_COUNTRIES.filter(c =>
      c.toLowerCase().startsWith(search) ||
      c.toLowerCase().includes(search)
    ).slice(0, 6);
  }, [countryInput]);

  const handleCountrySelect = (c: string) => {
    setCountry(c);
    setCountryInput(c);
    setShowCountrySuggestions(false);
  };

  const getDisplayName = () => {
    if (name.trim()) return name.trim();
    const drinkLabel = DRINK_TYPE_OPTIONS.find(d => d.value === drinkType)?.label;
    return drinkLabel || 'Produkt';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!drinkType || !country.trim()) return;

    const product = {
      id: `manual-${Date.now()}`,
      name: getDisplayName(),
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

  const isValid = drinkType && country.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Drink Type - Required */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
          <Wine className="w-4 h-4 text-eco-green" />
          Typ av dryck *
        </label>
        <div className="flex flex-wrap gap-2">
          {DRINK_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDrinkType(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl transition-all ${
                drinkType === opt.value
                  ? 'bg-eco-green text-white'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Name - Optional */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Produktnamn <span className="text-muted-foreground font-normal">(valfritt)</span>
        </label>
        <Input
          type="text"
          placeholder={drinkType ? `T.ex. ${DRINK_TYPE_OPTIONS.find(d => d.value === drinkType)?.label} från...` : 'T.ex. Château Margaux 2015'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 rounded-xl bg-secondary/50 border-0"
        />
      </div>

      {/* Country */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
          <MapPin className="w-4 h-4 text-eco-green" />
          Ursprungsland *
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {QUICK_COUNTRIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleCountrySelect(c)}
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
        <div className="relative">
          <Input
            type="text"
            placeholder="Eller sök land..."
            value={countryInput}
            onChange={(e) => {
              setCountryInput(e.target.value);
              setCountry(e.target.value);
              setShowCountrySuggestions(true);
            }}
            onFocus={() => setShowCountrySuggestions(true)}
            onBlur={() => setTimeout(() => setShowCountrySuggestions(false), 150)}
            className="h-10 rounded-xl bg-secondary/50 border-0"
          />
          {/* Autocomplete dropdown */}
          {showCountrySuggestions && filteredCountries.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-20">
              {filteredCountries.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleCountrySelect(c)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
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
        disabled={!isValid}
      >
        <Check className="w-4 h-4 mr-2" />
        Lägg till {drinkType ? getDisplayName() : 'produkt'}
      </Button>
    </form>
  );
}
