import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { ChevronRight, Check, ChevronLeft } from 'lucide-react';
import { useMediaQuery } from './ui/use-mobile';

// Partner and Warehouse data structures
export interface Partner {
  id: string;
  name: string;
  code: string;
  productType?: 'white-label' | 'resell' | 'wholesale' | 'other';
  brandIds?: string[];
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
  partnerId: string;
  brandIds?: string[];
}

export interface PartnerWarehouseSelection {
  partnerId: string;
  warehouseId: string;
}

interface PartnerWarehouseSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selection: PartnerWarehouseSelection) => void;
  partners: Partner[];
  warehouses: Warehouse[];
  currentSelection?: PartnerWarehouseSelection;
}

// Selection step types
type SelectionStep = 'partner' | 'warehouse';

// List item component for mobile-friendly selection
interface SelectionListItemProps {
  id: string;
  label: string;
  sublabel?: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function SelectionListItem({ id, label, sublabel, isSelected, onClick, disabled }: SelectionListItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center justify-between p-4 bg-surface-container 
        hover:bg-surface-container-high active:bg-surface-container-highest
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isSelected ? 'bg-secondary-container' : ''}
      `}
    >
      <div className="flex-1 text-left">
        <div className={`body-large ${isSelected ? 'text-on-secondary-container' : 'text-on-surface'}`}>
          {label}
        </div>
        {sublabel && (
          <div className={`body-small ${isSelected ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>
            {sublabel}
          </div>
        )}
      </div>
      {isSelected && (
        <Check className={`h-5 w-5 ${isSelected ? 'text-on-secondary-container' : 'text-on-surface'}`} />
      )}
      {!isSelected && (
        <ChevronRight className="h-5 w-5 text-on-surface-variant" />
      )}
    </button>
  );
}



export default function PartnerWarehouseSelector({
  isOpen,
  onClose,
  onConfirm,
  partners,
  warehouses,
  currentSelection
}: PartnerWarehouseSelectorProps) {
  const [selectedPartnerId, setSelectedPartnerId] = useState(currentSelection?.partnerId || '');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(currentSelection?.warehouseId || '');
  const [currentStep, setCurrentStep] = useState<SelectionStep>('partner');
  
  // Detect screen size for responsive sheet behavior
  const isLargeScreen = useMediaQuery('(min-width: 640px)');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedPartnerId(currentSelection?.partnerId || '');
      setSelectedWarehouseId(currentSelection?.warehouseId || '');
      setCurrentStep('partner');
    }
  }, [isOpen, currentSelection]);

  // Filter warehouses based on selected partner
  const filteredWarehouses = warehouses.filter(warehouse => 
    !selectedPartnerId || warehouse.partnerId === selectedPartnerId
  );

  // Reset dependent selections when parent changes
  useEffect(() => {
    if (selectedPartnerId && !filteredWarehouses.find(w => w.id === selectedWarehouseId)) {
      setSelectedWarehouseId('');
    }
  }, [selectedPartnerId, filteredWarehouses, selectedWarehouseId]);

  const handlePartnerSelect = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    setSelectedWarehouseId('');
    setCurrentStep('warehouse');
  };

  const handleWarehouseSelect = (warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
    
    // Immediately confirm the selection
    if (selectedPartnerId) {
      onConfirm({
        partnerId: selectedPartnerId,
        warehouseId: warehouseId
      });
      onClose();
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'warehouse':
        setCurrentStep('partner');
        break;
      default:
        onClose();
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'partner': return 'Select Partner';
      case 'warehouse': return 'Select Warehouse';
      default: return 'Partner & Warehouse';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side={isLargeScreen ? "right" : "bottom"}
        className={`
          bg-surface-container-high border-outline-variant p-0 gap-0 overflow-hidden flex flex-col
          ${isLargeScreen 
            ? 'h-full w-full max-w-md' 
            : 'rounded-t-3xl max-h-[90vh]'
          }
        `}
      >
        {/* Drag Handle - Only on mobile */}
        {!isLargeScreen && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-8 h-1 bg-outline-variant rounded-full" />
          </div>
        )}

        {/* Header */}
        <SheetHeader className={`relative flex-shrink-0 ${isLargeScreen ? 'px-6 pt-6 pb-4' : 'px-6 pb-4'}`}>
          <div className="flex items-center">
            {currentStep !== 'partner' && (
              <button
                onClick={handleBack}
                className="mr-3 p-2 rounded-full hover:bg-surface-container-highest transition-colors"
              >
                <ChevronLeft className="h-6 w-6 text-on-surface" />
              </button>
            )}
            <SheetTitle className={`text-on-surface text-left flex-1 ${isLargeScreen ? 'title-large' : 'title-large'}`}>
              {getStepTitle()}
            </SheetTitle>
          </div>
          <SheetDescription className="body-small text-on-surface-variant text-left">
            {currentStep === 'partner' 
              ? 'Select a partner organization to work with. This will determine which warehouses are available for your operations.'
              : `Select a warehouse from ${partners.find(p => p.id === selectedPartnerId)?.name || 'the selected partner'}. ${filteredWarehouses.length} warehouses are available.`
            }
          </SheetDescription>
        </SheetHeader>

        {/* Content - Scrollable area */}
        <div className="flex-1 overflow-y-auto">
          {currentStep === 'partner' && (
            <div className={isLargeScreen ? 'px-6 pb-6' : 'px-6 pb-6'}>
              <div className="space-y-1">
                {partners.map((partner) => (
                  <SelectionListItem
                    key={partner.id}
                    id={partner.id}
                    label={partner.name}
                    sublabel={partner.code}
                    isSelected={selectedPartnerId === partner.id}
                    onClick={() => handlePartnerSelect(partner.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {currentStep === 'warehouse' && (
            <div className={isLargeScreen ? 'px-6 pb-6' : 'px-6 pb-6'}>
              <div className="space-y-1">
                {filteredWarehouses.map((warehouse) => (
                  <SelectionListItem
                    key={warehouse.id}
                    id={warehouse.id}
                    label={warehouse.name}
                    sublabel={`${warehouse.code} • ${warehouse.location}`}
                    isSelected={selectedWarehouseId === warehouse.id}
                    onClick={() => handleWarehouseSelect(warehouse.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}