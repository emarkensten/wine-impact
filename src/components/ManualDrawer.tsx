'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ManualProductForm } from './ManualProductForm';

interface ManualDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManualDrawer({ isOpen, onOpenChange }: ManualDrawerProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[calc(100dvh-40px)] rounded-t-3xl flex flex-col">
        <DrawerHeader className="pb-2 flex-shrink-0">
          <DrawerTitle className="text-lg font-semibold text-center">
            Lägg till manuellt
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-8">
          <ManualProductForm onSuccess={handleSuccess} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
