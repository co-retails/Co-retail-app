import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent } from './ui/sheet';
import { useMediaQuery } from './ui/use-mobile';

export interface Brand {
  id: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
  brandId: string;
}

export interface RetailerCountrySelection {
  brandId?: string;
  countryId?: string;
}

interface RetailerCountrySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selection: RetailerCountrySelection) => void;
  brands: Brand[];
  countries: Country[];
  currentSelection: RetailerCountrySelection;
}

type SelectionStep = 'brand' | 'country';

export default function RetailerCountrySelector({
  isOpen,
  onClose,
  onConfirm,
  brands,
  countries,
  currentSelection
}: RetailerCountrySelectorProps) {
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(currentSelection.brandId);
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(currentSelection.countryId);
  const [currentStep, setCurrentStep] = useState<SelectionStep>('brand');
  
  // Detect screen size for responsive sheet behavior
  const isLargeScreen = useMediaQuery('(min-width: 640px)');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedBrand(currentSelection.brandId);
      setSelectedCountry(currentSelection.countryId);
      setCurrentStep('brand');
    }
  }, [isOpen, currentSelection]);

  // Filter countries by selected brand
  const filteredCountries = selectedBrand
    ? countries.filter(country => country.brandId === selectedBrand)
    : countries;

  // Reset dependent selections when parent changes
  useEffect(() => {
    if (selectedBrand && selectedCountry) {
      const country = countries.find(c => c.id === selectedCountry);
      if (country && country.brandId !== selectedBrand) {
        setSelectedCountry(undefined);
      }
    }
  }, [selectedBrand, countries, selectedCountry]);

  const handleBrandSelect = (brandId: string) => {
    if (selectedBrand === brandId) {
      // Deselect brand and confirm "All Retailers"
      setSelectedBrand(undefined);
      setSelectedCountry(undefined);
      onConfirm({
        brandId: undefined,
        countryId: undefined
      });
      onClose();
    } else {
      // Select brand and move to country selection if there are countries
      setSelectedBrand(brandId);
      const brandCountries = countries.filter(c => c.brandId === brandId);
      if (brandCountries.length > 0) {
        setSelectedCountry(undefined);
        setCurrentStep('country');
      } else {
        // No countries, confirm immediately
        onConfirm({
          brandId: brandId,
          countryId: undefined
        });
        onClose();
      }
    }
  };

  const handleCountrySelect = (countryId: string) => {
    if (selectedCountry === countryId) {
      // Deselect country, keep brand only
      setSelectedCountry(undefined);
      onConfirm({
        brandId: selectedBrand,
        countryId: undefined
      });
      onClose();
    } else {
      // Select country and confirm
      setSelectedCountry(countryId);
      if (selectedBrand) {
        onConfirm({
          brandId: selectedBrand,
          countryId: countryId
        });
        onClose();
      }
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'country':
        setCurrentStep('brand');
        break;
      default:
        onClose();
    }
  };

  const handleClearAll = () => {
    setSelectedBrand(undefined);
    setSelectedCountry(undefined);
    onConfirm({
      brandId: undefined,
      countryId: undefined
    });
    onClose();
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'brand': return 'Select Retailer';
      case 'country': return 'Select Country';
      default: return 'Retailer & Country';
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
        {/* Header */}
        <div className="sticky top-0 bg-surface-container-high border-b border-outline-variant px-6 py-4 flex items-center gap-3 z-10 flex-shrink-0">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-highest transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
          <h2 className="title-large text-on-surface flex-1">
            {getStepTitle()}
          </h2>
          {(selectedBrand || selectedCountry) && currentStep === 'brand' && (
            <button
              onClick={handleClearAll}
              className="label-large text-primary hover:bg-primary-container px-3 py-1.5 rounded-lg transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Brand Selection */}
          {currentStep === 'brand' && (
            <div className="px-6 py-4">
              <div className="space-y-2">
                {brands.map(brand => (
                  <button
                    key={brand.id}
                    onClick={() => handleBrandSelect(brand.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                      selectedBrand === brand.id
                        ? 'bg-primary-container border border-primary'
                        : 'bg-surface-container border border-outline-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <span className={`body-large ${
                      selectedBrand === brand.id
                        ? 'text-on-primary-container'
                        : 'text-on-surface'
                    }`}>
                      {brand.name}
                    </span>
                    {selectedBrand === brand.id && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Country Selection */}
          {currentStep === 'country' && (
            <div className="px-6 py-4">
              <div className="space-y-2">
                {filteredCountries.map(country => (
                  <button
                    key={country.id}
                    onClick={() => handleCountrySelect(country.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                      selectedCountry === country.id
                        ? 'bg-secondary-container border border-outline'
                        : 'bg-surface-container border border-outline-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <span className={`body-large ${
                      selectedCountry === country.id
                        ? 'text-on-secondary-container'
                        : 'text-on-surface'
                    }`}>
                      {country.name}
                    </span>
                    {selectedCountry === country.id && (
                      <Check className="w-5 h-5 text-on-secondary-container" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with selection summary - only show when a selection is made */}
        {(selectedBrand || selectedCountry) && (
          <div className="sticky bottom-0 bg-surface-container-low border-t border-outline-variant px-6 py-4 flex-shrink-0">
            <div className="body-small text-on-surface-variant mb-2">Current selection:</div>
            <div className="body-medium text-on-surface">
              {brands.find(b => b.id === selectedBrand)?.name || 'All Retailers'}
              {selectedCountry && ` - ${countries.find(c => c.id === selectedCountry)?.name}`}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
