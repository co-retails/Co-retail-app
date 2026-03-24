import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './ui/sheet';
import { useMediaQuery } from './ui/use-mobile';
import { Check, ChevronRight } from 'lucide-react';

export interface WarehouseOption {
  id: string;
  name: string;
  location?: string;
  partnerId: string;
}

interface WarehouseSelectorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (warehouseId: string, warehouseName: string) => void;
  warehouses: WarehouseOption[];
  currentWarehouseId?: string;
}

function WarehouseListItem({
  label,
  sublabel,
  isSelected,
  onClick,
}: {
  label: string;
  sublabel?: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center justify-between p-4 bg-surface-container 
        hover:bg-surface-container-high active:bg-surface-container-highest
        ${isSelected ? 'bg-secondary-container' : ''}
      `}
    >
      <div className="flex-1 text-left">
        <div
          className={`body-large ${isSelected ? 'text-on-secondary-container' : 'text-on-surface'}`}
        >
          {label}
        </div>
        {sublabel && (
          <div
            className={`body-small ${isSelected ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}
          >
            {sublabel}
          </div>
        )}
      </div>
      {isSelected ? (
        <Check
          className={`h-5 w-5 shrink-0 ${isSelected ? 'text-on-secondary-container' : 'text-on-surface'}`}
        />
      ) : (
        <ChevronRight className="h-5 w-5 shrink-0 text-on-surface-variant" />
      )}
    </button>
  );
}

/**
 * Side sheet for picking a sending warehouse (same stacking as StoreSelector for full-screen parents).
 */
export default function WarehouseSelectorSheet({
  isOpen,
  onClose,
  onConfirm,
  warehouses,
  currentWarehouseId,
}: WarehouseSelectorSheetProps) {
  const isLargeScreen = useMediaQuery('(min-width: 640px)');

  const handlePick = (id: string, name: string) => {
    onConfirm(id, name);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={isLargeScreen ? 'right' : 'bottom'}
        containerZIndex={10000}
        className={`
          bg-surface-container-high border-outline-variant p-0 gap-0 overflow-hidden flex flex-col
          ${
            isLargeScreen
              ? 'h-full w-full max-w-md'
              : 'rounded-t-3xl max-h-[90vh]'
          }
        `}
      >
        {!isLargeScreen && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-8 h-1 bg-outline-variant rounded-full" />
          </div>
        )}

        <SheetHeader
          className={`relative flex-shrink-0 ${isLargeScreen ? 'px-6 pt-6 pb-4' : 'px-6 pb-4'}`}
        >
          <SheetTitle className="text-on-surface text-left title-large">
            Select warehouse
          </SheetTitle>
          <SheetDescription className="sr-only">
            Choose the partner warehouse that sends this order.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <p className="body-small text-on-surface-variant mb-6">
            Choose the sending warehouse ({warehouses.length} available)
          </p>
          <div className="space-y-1">
            {warehouses.map((w) => (
              <WarehouseListItem
                key={w.id}
                label={w.name}
                sublabel={w.location}
                isSelected={currentWarehouseId === w.id}
                onClick={() => handlePick(w.id, w.name)}
              />
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
