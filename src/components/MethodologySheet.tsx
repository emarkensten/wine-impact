'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useClimate } from '@/context/ClimateContext';
import { DEFAULT_CLIMATE_SETTINGS } from '@/lib/climate-calculator';
import type { PackagingType, ProductionMethod, TransportMethod } from '@/types';
import {
  Settings,
  Package,
  Truck,
  Leaf,
  RotateCcw,
  Info,
  Wine,
  Box,
  Droplets,
  Calculator,
  X,
  HelpCircle,
  Trash2,
} from 'lucide-react';

const PACKAGING_CONFIG: { key: PackagingType; label: string; icon: React.ReactNode }[] = [
  { key: 'glass_heavy', label: 'Tung glasflaska', icon: <Wine className="w-4 h-4" /> },
  { key: 'glass_light', label: 'Lätt glasflaska', icon: <Wine className="w-4 h-4" /> },
  { key: 'aluminum_can', label: 'Aluminiumburk', icon: <Box className="w-4 h-4" /> },
  { key: 'pet', label: 'PET-flaska', icon: <Droplets className="w-4 h-4" /> },
  { key: 'bag_in_box', label: 'Bag-in-box', icon: <Package className="w-4 h-4" /> },
  { key: 'tetra', label: 'Tetra Pak', icon: <Package className="w-4 h-4" /> },
];

const TRANSPORT_CONFIG: { key: TransportMethod; label: string }[] = [
  { key: 'road', label: 'Vägtransport' },
  { key: 'sea', label: 'Sjöfart' },
  { key: 'air', label: 'Flyg' },
];

const PRODUCTION_CONFIG: { key: ProductionMethod; label: string }[] = [
  { key: 'conventional', label: 'Konventionell' },
  { key: 'organic', label: 'Ekologisk' },
  { key: 'biodynamic', label: 'Biodynamisk' },
];

interface MethodologySheetProps {
  trigger?: React.ReactNode;
}

export function MethodologySheet({ trigger }: MethodologySheetProps) {
  const { settings, updateSettings, resetSettings, comparisonList, clearList } = useClimate();

  const handlePackagingChange = (key: PackagingType, value: number[]) => {
    updateSettings({
      packaging: {
        ...settings.packaging,
        [key]: value[0],
      },
    });
  };

  const handleTransportChange = (key: TransportMethod, value: number[]) => {
    updateSettings({
      transport: {
        ...settings.transport,
        [key]: value[0],
      },
    });
  };

  const handleProductionChange = (key: ProductionMethod, value: number[]) => {
    updateSettings({
      production: {
        ...settings.production,
        [key]: value[0],
      },
    });
  };

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full hover:bg-eco-green/10"
    >
      <Settings className="w-5 h-5 text-foreground" />
    </Button>
  );

  return (
    <Drawer>
      <DrawerTrigger asChild>
        {trigger || defaultTrigger}
      </DrawerTrigger>

      <DrawerContent className="max-h-[calc(100dvh-40px)] rounded-t-3xl">
        <div className="overflow-y-auto pb-8">
          <DrawerHeader className="pb-2 px-6">
            <DrawerTitle className="flex items-center gap-2 text-lg">
              <Calculator className="w-5 h-5 text-eco-green" />
              Hur räknar vi?
            </DrawerTitle>
          </DrawerHeader>

          <div className="space-y-6 px-6">
            {/* Methodology Explanation */}
            <section className="p-4 rounded-2xl bg-eco-sage/10 border border-eco-sage/20">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-eco-green flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm text-foreground font-medium">
                    Klimatpoängen baseras på tre faktorer:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1.5">
                    <li className="flex items-start gap-2">
                      <Package className="w-3.5 h-3.5 mt-0.5 text-[#D4A574]" />
                      <span><strong>Förpackning</strong> - CO₂ för tillverkning av glas, kartong, etc.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Truck className="w-3.5 h-3.5 mt-0.5 text-[#6B9E7A]" />
                      <span><strong>Transport</strong> - Avståndet från ursprungslandet till Sverige</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Leaf className="w-3.5 h-3.5 mt-0.5 text-eco-green" />
                      <span><strong>Produktion</strong> - Ekologisk odling ger lägre klimatpåverkan</span>
                    </li>
                  </ul>
                  <p className="text-xs text-muted-foreground pt-2 border-t border-eco-sage/20 mt-3">
                    Värden baseras på branschstandarder och Systembolagets klimatdata.
                    Du kan justera beräkningarna nedan.
                  </p>
                </div>
              </div>
            </section>

            {/* Packaging Section */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-eco-green" />
                Förpackning (kg CO₂e)
              </h3>
              <div className="space-y-5">
                {PACKAGING_CONFIG.map(({ key, label, icon }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-muted-foreground flex items-center gap-2">
                        {icon}
                        {label}
                      </label>
                      <span className="text-sm font-medium text-foreground">
                        {settings.packaging[key].toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[settings.packaging[key]]}
                      onValueChange={(value) => handlePackagingChange(key, value)}
                      min={0}
                      max={1.5}
                      step={0.05}
                      className="[&_[role=slider]]:bg-eco-green [&_[role=slider]]:border-eco-green [&_.bg-primary]:bg-eco-green"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Transport Section */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4 text-eco-green" />
                Transport (kg CO₂e/km/l)
              </h3>
              <div className="space-y-5">
                {TRANSPORT_CONFIG.map(({ key, label }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-muted-foreground">{label}</label>
                      <span className="text-sm font-medium text-foreground">
                        {settings.transport[key].toFixed(3)}
                      </span>
                    </div>
                    <Slider
                      value={[settings.transport[key]]}
                      onValueChange={(value) => handleTransportChange(key, value)}
                      min={0}
                      max={key === 'air' ? 1 : 0.2}
                      step={key === 'air' ? 0.05 : 0.005}
                      className="[&_[role=slider]]:bg-eco-green [&_[role=slider]]:border-eco-green [&_.bg-primary]:bg-eco-green"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Production Section */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-eco-green" />
                Produktion (multiplikator)
              </h3>
              <div className="space-y-5">
                {PRODUCTION_CONFIG.map(({ key, label }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-muted-foreground">{label}</label>
                      <span className="text-sm font-medium text-foreground">
                        {settings.production[key].toFixed(2)}x
                      </span>
                    </div>
                    <Slider
                      value={[settings.production[key]]}
                      onValueChange={(value) => handleProductionChange(key, value)}
                      min={0.5}
                      max={1.5}
                      step={0.05}
                      className="[&_[role=slider]]:bg-eco-green [&_[role=slider]]:border-eco-green [&_.bg-primary]:bg-eco-green"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Reset Button */}
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl border-muted-foreground/20"
              onClick={resetSettings}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Återställ standardvärden
            </Button>

            {/* Clear List Button */}
            {comparisonList.length > 0 && (
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-destructive/30 text-destructive
                  hover:bg-destructive/10 mt-3"
                onClick={clearList}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Töm hela listan ({comparisonList.length} produkter)
              </Button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
