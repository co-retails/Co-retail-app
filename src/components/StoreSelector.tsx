import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { ChevronRight, Check, ChevronLeft } from 'lucide-react';
import { useMediaQuery } from './ui/use-mobile';

export interface Store {
  id: string;
  name: string;
  code: string;
  countryId: string;
  brandId: string;
}

export interface Country {
  id: string;
  name: string;
  brandId: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface StoreSelection {
  brandId: string;
  countryId: string;
  storeId: string;
  storeCode?: string;
}

interface StoreSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selection: StoreSelection) => void;
  brands: Brand[];
  countries: Country[];
  stores: Store[];
  currentSelection?: StoreSelection;
}

// Selection step types
type SelectionStep = 'brand' | 'country' | 'store';

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

export default function StoreSelector({ 
  isOpen, 
  onClose, 
  onConfirm, 
  brands, 
  countries, 
  stores, 
  currentSelection 
}: StoreSelectorProps) {
  const [selectedBrandId, setSelectedBrandId] = useState(currentSelection?.brandId || '');
  const [selectedCountryId, setSelectedCountryId] = useState(currentSelection?.countryId || '');
  const [selectedStoreId, setSelectedStoreId] = useState(currentSelection?.storeId || '');
  const [currentStep, setCurrentStep] = useState<SelectionStep>('brand');
  
  // Detect screen size for responsive sheet behavior
  const isLargeScreen = useMediaQuery('(min-width: 640px)');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedBrandId(currentSelection?.brandId || '');
      setSelectedCountryId(currentSelection?.countryId || '');
      setSelectedStoreId(currentSelection?.storeId || '');
      setCurrentStep('brand');
    }
  }, [isOpen, currentSelection]);

  // Filter countries based on selected brand
  const filteredCountries = countries.filter(country => 
    !selectedBrandId || country.brandId === selectedBrandId
  );

  // Filter stores based on selected country
  const filteredStores = stores.filter(store => 
    !selectedCountryId || store.countryId === selectedCountryId
  );

  // Reset dependent selections when parent changes
  useEffect(() => {
    if (selectedBrandId && !filteredCountries.find(c => c.id === selectedCountryId)) {
      setSelectedCountryId('');
      setSelectedStoreId('');
    }
  }, [selectedBrandId, filteredCountries, selectedCountryId]);

  useEffect(() => {
    if (selectedCountryId && !filteredStores.find(s => s.id === selectedStoreId)) {
      setSelectedStoreId('');
    }
  }, [selectedCountryId, filteredStores, selectedStoreId]);

  const handleBrandSelect = (brandId: string) => {
    setSelectedBrandId(brandId);
    setSelectedCountryId('');
    setSelectedStoreId('');
    setCurrentStep('country');
  };

  const handleCountrySelect = (countryId: string) => {
    setSelectedCountryId(countryId);
    setSelectedStoreId('');
    setCurrentStep('store');
  };

  const handleStoreSelect = (storeId: string) => {
    setSelectedStoreId(storeId);
    
    // Immediately confirm the selection
    if (selectedBrandId && selectedCountryId) {
      onConfirm({
        brandId: selectedBrandId,
        countryId: selectedCountryId,
        storeId: storeId
      });
      onClose();
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'country':
        setCurrentStep('brand');
        break;
      case 'store':
        setCurrentStep('country');
        break;
      default:
        onClose();
    }
  };



  const getStepTitle = () => {
    switch (currentStep) {
      case 'brand': return 'Select Brand';
      case 'country': return 'Select Country';
      case 'store': return 'Select Store';
      default: return 'Store selector';
    }
  };



  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side={isLargeScreen ? "right" : "bottom"}
        containerZIndex={10000}
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
            {currentStep !== 'brand' && (
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
          <SheetDescription className="sr-only">
            Multi-step store selection dialog. Choose your brand, country, and store.
          </SheetDescription>
        </SheetHeader>

        {/* Content - Scrollable area */}
        <div className="flex-1 overflow-y-auto">
          {currentStep === 'brand' && (
            <div className={isLargeScreen ? 'px-6 pb-6' : 'px-6 pb-6'}>
              <p className="body-small text-on-surface-variant mb-6">
                Choose your brand
              </p>
              <div className="space-y-1">
                {brands.map((brand) => (
                  <SelectionListItem
                    key={brand.id}
                    id={brand.id}
                    label={brand.name}
                    isSelected={selectedBrandId === brand.id}
                    onClick={() => handleBrandSelect(brand.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {currentStep === 'country' && (
            <div className={isLargeScreen ? 'px-6 pb-6' : 'px-6 pb-6'}>
              <p className="body-small text-on-surface-variant mb-6">
                Choose your country ({filteredCountries.length} available)
              </p>
              <div className="space-y-1">
                {filteredCountries.map((country) => (
                  <SelectionListItem
                    key={country.id}
                    id={country.id}
                    label={country.name}
                    isSelected={selectedCountryId === country.id}
                    onClick={() => handleCountrySelect(country.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {currentStep === 'store' && (
            <div className={isLargeScreen ? 'px-6 pb-6' : 'px-6 pb-6'}>
              <p className="body-small text-on-surface-variant mb-6">
                Choose your store ({filteredStores.length} available)
              </p>
              <div className="space-y-1">
                {filteredStores.map((store) => (
                  <SelectionListItem
                    key={store.id}
                    id={store.id}
                    label={store.name}
                    sublabel={store.code}
                    isSelected={selectedStoreId === store.id}
                    onClick={() => handleStoreSelect(store.id)}
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