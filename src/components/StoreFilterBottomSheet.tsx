import React, { useMemo } from 'react';
import { sortByNameAlpha, sortStoresByCode } from '../utils/spreadsheetUtils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FilterIcon, CheckIcon } from 'lucide-react';
import { Brand, Store, Country } from './StoreSelector';
import { useMediaQuery } from './ui/use-mobile';
import MultiPicker, { MultiPickerOption } from './MultiPicker';

export type ViewMode = 'all' | 'by-partner' | 'by-store';

export interface ViewFilter {
  mode: ViewMode;
  partnerId?: string;
  brandIds?: string[];
  storeIds?: string[];
  countryIds?: string[];
}

interface StoreFilterBottomSheetProps {
  viewFilter: ViewFilter;
  onViewAllStores: () => void;
  onBrandFilterChange: (brandIds: string[]) => void;
  onStoreFilterChange: (storeIds: string[]) => void;
  onCountryFilterChange: (countryIds: string[]) => void;
  currentPartnerId: string;
  partners: Array<{ id: string; name: string; code: string; }>;
  brands: Brand[];
  stores: Store[];
  countries: Country[];
  /** When omitted with controlled `open`/`onOpenChange`, triggers live outside this component. */
  children?: React.ReactNode;
  /** Controlled open state (e.g. multiple toolbar triggers). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function StoreFilterBottomSheet({
  viewFilter,
  onViewAllStores,
  onBrandFilterChange,
  onStoreFilterChange,
  onCountryFilterChange,
  currentPartnerId,
  partners,
  brands,
  stores,
  countries,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: StoreFilterBottomSheetProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const sheetOpen = isControlled ? controlledOpen : internalOpen;
  const setSheetOpen = React.useCallback(
    (next: boolean) => {
      if (isControlled) controlledOnOpenChange(next);
      else setInternalOpen(next);
    },
    [isControlled, controlledOnOpenChange]
  );
  const isMobile = useMediaQuery('(max-width: 640px)'); // sm breakpoint

  const sortedBrands = useMemo(() => sortByNameAlpha(brands), [brands]);

  const handleViewAllStores = () => {
    onViewAllStores();
    setSheetOpen(false);
  };



  const getFilterDisplayName = () => {
    const hasFilters = (viewFilter.brandIds?.length || 0) > 0 || 
                      (viewFilter.storeIds?.length || 0) > 0 || 
                      (viewFilter.countryIds?.length || 0) > 0;
    
    if (!hasFilters) {
      return 'All Stores';
    }
    
    const filterParts = [];
    
    // Add brand filters
    if (viewFilter.brandIds?.length) {
      const selectedBrands = brands.filter(b => viewFilter.brandIds!.includes(b.id));
      if (selectedBrands.length === 1) {
        filterParts.push(selectedBrands[0].name);
      } else {
        filterParts.push(`${selectedBrands.length} Brands`);
      }
    }
    
    // Add country filters
    if (viewFilter.countryIds?.length) {
      const selectedCountries = countries.filter(c => viewFilter.countryIds!.includes(c.id));
      if (selectedCountries.length === 1) {
        filterParts.push(selectedCountries[0].name);
      } else {
        filterParts.push(`${selectedCountries.length} Countries`);
      }
    }
    
    // Add store filters
    if (viewFilter.storeIds?.length) {
      const selectedStores = stores.filter(s => viewFilter.storeIds!.includes(s.id));
      if (selectedStores.length === 1) {
        filterParts.push(selectedStores[0].name);
      } else {
        filterParts.push(`${selectedStores.length} Stores`);
      }
    }
    
    return filterParts.join(' • ');
  };

  const clearFilters = () => {
    onBrandFilterChange([]);
    onStoreFilterChange([]);
    onCountryFilterChange([]);
    onViewAllStores();
  };

  // Get filtered stores based on selected brands and countries (order by store code)
  const getFilteredStores = () => {
    let filteredStores = stores;
    
    // Filter by selected brands
    if (viewFilter.brandIds?.length) {
      filteredStores = filteredStores.filter(store => 
        viewFilter.brandIds!.includes(store.brandId)
      );
    }
    
    // Filter by selected countries
    if (viewFilter.countryIds?.length) {
      filteredStores = filteredStores.filter(store => 
        viewFilter.countryIds!.includes(store.countryId)
      );
    }
    
    return sortStoresByCode(filteredStores);
  };

  // Get all countries (independent of brand selection)
  const getFilteredCountries = () => {
    // Return all unique countries (since some countries may appear in multiple brands)
    const uniqueCountries = countries.reduce((acc, country) => {
      const existingCountry = acc.find(c => c.name === country.name);
      if (!existingCountry) {
        acc.push(country);
      }
      return acc;
    }, [] as Country[]);

    return sortByNameAlpha(uniqueCountries);
  };

  // Options for the MultiPicker components.
  const brandOptions: MultiPickerOption[] = useMemo(
    () => sortedBrands.map((b) => ({ id: b.id, label: b.name })),
    [sortedBrands]
  );

  const countryOptions: MultiPickerOption[] = useMemo(
    () => getFilteredCountries().map((c) => ({ id: c.id, label: c.name })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [countries]
  );

  const storeOptions: MultiPickerOption[] = useMemo(
    () =>
      getFilteredStores().map((store) => {
        const brand = brands.find((b) => b.id === store.brandId);
        const country = countries.find((c) => c.id === store.countryId);
        const subtitleParts: string[] = [];
        if (brand) subtitleParts.push(brand.name);
        if (country) subtitleParts.push(`${country.name} • ${store.code}`);
        return {
          id: store.id,
          label: store.name,
          subtitle: subtitleParts.join(' • '),
          searchValue: `${store.name} ${brand?.name ?? ''} ${country?.name ?? ''} ${store.code}`,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stores, brands, countries, viewFilter.brandIds, viewFilter.countryIds]
  );

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      {children != null ? (
        <SheetTrigger asChild>{children}</SheetTrigger>
      ) : null}
      <SheetContent 
        side={isMobile ? "bottom" : "right"} 
        className={isMobile 
          ? "max-h-[85vh] flex flex-col" 
          : "w-full sm:max-w-md flex flex-col h-full"
        }
      >
        {/* Header - Compact */}
        <SheetHeader className={isMobile ? "flex-shrink-0 px-4 pt-4 pb-3 pr-12" : "flex-shrink-0 px-6 pt-6 pb-4 pr-12"}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FilterIcon className="h-5 w-5 text-on-surface-variant" />
              <SheetTitle className="title-large text-on-surface">Filter View</SheetTitle>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <SheetDescription className="body-medium text-on-surface-variant">
              Filter orders by brand, country, or specific store
            </SheetDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-primary hover:text-primary hover:bg-primary-container/50 h-10 md:h-8 px-3 ml-4 flex-shrink-0 min-h-[48px] md:min-h-0 touch-manipulation"
            >
              Clear all
            </Button>
          </div>
        </SheetHeader>

        {/* Content - Compact */}
        <div className={isMobile ? "flex-1 overflow-y-auto px-4" : "flex-1 overflow-y-auto px-6"}>
          {/* Current Filter Status - Compact */}
          <div className="mb-4">
            <div className="p-3 rounded-lg bg-surface-container border border-outline-variant">
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="body-medium text-on-surface flex-1">
                  {getFilterDisplayName()}
                </span>
              </div>
            </div>
          </div>

          {/* Multi-Filter Options */}
          <div className="space-y-3">{/* Removed margin bottom */}
              {/* Brand Selection Dropdown */}
              <div>
                <label className="body-small text-on-surface-variant mb-1 block">
                  Brands ({viewFilter.brandIds?.length || 0})
                </label>
                <MultiPicker
                  options={brandOptions}
                  selectedIds={viewFilter.brandIds || []}
                  onChange={onBrandFilterChange}
                  placeholder="Select brands..."
                  emptyText="No brands found."
                  title="Select brands"
                  triggerClassName="w-full h-12 md:h-10 text-left min-h-[48px] md:min-h-0 touch-manipulation"
                  compact
                  hideSearch
                />
                {(viewFilter.brandIds?.length || 0) > 0 && (
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex flex-wrap gap-1">
                      {viewFilter.brandIds?.slice(0, 3).map(brandId => {
                        const brand = brands.find(b => b.id === brandId);
                        return brand ? (
                          <Badge 
                            key={brandId} 
                            variant="secondary" 
                            className="body-small bg-primary-container text-on-primary-container px-2 py-0.5"
                          >
                            {brand.name}
                          </Badge>
                        ) : null;
                      })}
                      {(viewFilter.brandIds?.length || 0) > 3 && (
                        <Badge variant="secondary" className="body-small px-2 py-0.5">
                          +{(viewFilter.brandIds?.length || 0) - 3}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onBrandFilterChange([])}
                      className="text-primary hover:text-primary hover:bg-primary-container/50 h-10 md:h-6 px-2 min-h-[48px] md:min-h-0 touch-manipulation"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>

              {/* Country Selection Dropdown */}
              <div>
                <label className="body-small text-on-surface-variant mb-1 block">
                  Countries ({viewFilter.countryIds?.length || 0})
                </label>
                <MultiPicker
                  options={countryOptions}
                  selectedIds={viewFilter.countryIds || []}
                  onChange={onCountryFilterChange}
                  placeholder="Select countries..."
                  searchPlaceholder="Search countries..."
                  emptyText="No countries found."
                  title="Select countries"
                  triggerClassName="w-full h-12 md:h-10 text-left min-h-[48px] md:min-h-0 touch-manipulation"
                />
                {(viewFilter.countryIds?.length || 0) > 0 && (
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex flex-wrap gap-1">
                      {viewFilter.countryIds?.slice(0, 3).map(countryId => {
                        const country = countries.find(c => c.id === countryId);
                        return country ? (
                          <Badge 
                            key={countryId} 
                            variant="secondary" 
                            className="body-small bg-secondary-container text-on-secondary-container px-2 py-0.5"
                          >
                            {country.name}
                          </Badge>
                        ) : null;
                      })}
                      {(viewFilter.countryIds?.length || 0) > 3 && (
                        <Badge variant="secondary" className="body-small px-2 py-0.5">
                          +{(viewFilter.countryIds?.length || 0) - 3}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCountryFilterChange([])}
                      className="text-primary hover:text-primary hover:bg-primary-container/50 h-10 md:h-6 px-2 min-h-[48px] md:min-h-0 touch-manipulation"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>

              {/* Store Selection Dropdown */}
              <div>
                <label className="body-small text-on-surface-variant mb-1 block">
                  Stores ({viewFilter.storeIds?.length || 0})
                </label>
                <MultiPicker
                  options={storeOptions}
                  selectedIds={viewFilter.storeIds || []}
                  onChange={onStoreFilterChange}
                  placeholder="Select stores..."
                  searchPlaceholder="Search stores..."
                  emptyText="No stores found."
                  title="Select stores"
                  triggerClassName="w-full h-12 md:h-10 text-left min-h-[48px] md:min-h-0 touch-manipulation"
                />
                {(viewFilter.storeIds?.length || 0) > 0 && (
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex flex-wrap gap-1">
                      {viewFilter.storeIds?.slice(0, 2).map(storeId => {
                        const store = stores.find(s => s.id === storeId);
                        return store ? (
                          <Badge 
                            key={storeId} 
                            variant="secondary" 
                            className="body-small bg-tertiary-container text-on-tertiary-container px-2 py-0.5"
                          >
                            {store.name}
                          </Badge>
                        ) : null;
                      })}
                      {(viewFilter.storeIds?.length || 0) > 2 && (
                        <Badge variant="secondary" className="body-small px-2 py-0.5">
                          +{(viewFilter.storeIds?.length || 0) - 2}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStoreFilterChange([])}
                      className="text-primary hover:text-primary hover:bg-primary-container/50 h-10 md:h-6 px-2 min-h-[48px] md:min-h-0 touch-manipulation"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>

          </div>
        </div>

        {/* Action buttons - Compact */}
        <div className={isMobile 
          ? "flex-shrink-0 px-4 pt-3 pb-4 border-t border-outline-variant bg-surface-container" 
          : "flex-shrink-0 px-6 pt-4 pb-6 border-t border-outline-variant bg-surface-container"
        }>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-12 md:h-10 min-h-[48px] md:min-h-0 touch-manipulation"
              onClick={() => setSheetOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-12 md:h-10 min-h-[48px] md:min-h-0 touch-manipulation"
              onClick={() => setSheetOpen(false)}
              disabled={false}
            >
              Apply
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}