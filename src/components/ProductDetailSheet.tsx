'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useClimate } from '@/context/ClimateContext';
import { ProductDetailPanel } from './ProductDetailPanel';
import type { Product } from '@/types';

interface ProductDetailSheetProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailSheet({
  product,
  isOpen,
  onClose,
}: ProductDetailSheetProps) {
  const { removeProduct } = useClimate();

  if (!product) return null;

  const handleRemove = () => {
    removeProduct(product.id);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[calc(100dvh-40px)] rounded-t-3xl">
        <div className="overflow-y-auto pb-8">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="sr-only">Produktdetaljer</DrawerTitle>
          </DrawerHeader>
          <ProductDetailPanel product={product} onRemove={handleRemove} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
