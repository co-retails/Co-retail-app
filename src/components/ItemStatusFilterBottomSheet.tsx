import React, { useMemo } from 'react';
import { sortOptionsAlpha } from '../utils/spreadsheetUtils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { FilterIcon, CheckIcon, ChevronDownIcon } from 'lucide-react';
import { useMediaQuery } from './ui/use-mobile';
import MultiPicker, { MultiPickerOption } from './MultiPicker';

interface ItemStatusFilterBottomSheetProps {
  selectedStatuses: string[];
  selectedCategories: string[];
  selectedItemBrands: string[];
  selectedColors: string[];
  selectedPrices: number[];
  availableStatuses: string[];
  availableCategories: string[];
  availableItemBrands: string[];
  availableColors: string[];
  availablePricePoints: number[];
  onStatusChange: (statuses: string[]) => void;
  onCategoryChange: (categories: string[]) => void;
  onBrandChange: (brands: string[]) => void;
  onColorChange: (colors: string[]) => void;
  onPriceChange: (prices: number[]) => void;
  onClearAll: () => void;
  children: React.ReactNode;
}

export default function ItemStatusFilterBottomSheet({
  selectedStatuses,
  selectedCategories,
  selectedItemBrands,
  selectedColors,
  selectedPrices,
  availableStatuses,
  availableCategories,
  availableItemBrands,
  availableColors,
  availablePricePoints,
  onStatusChange,
  onCategoryChange,
  onBrandChange,
  onColorChange,
  onPriceChange,
  onClearAll,
  children
}: ItemStatusFilterBottomSheetProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isMobile = useMediaQuery('(max-width: 640px)'); // sm breakpoint

  const sortedStatuses = useMemo(
    () => sortOptionsAlpha(availableStatuses),
    [availableStatuses]
  );
  const sortedCategories = useMemo(
    () => sortOptionsAlpha(availableCategories),
    [availableCategories]
  );
  const sortedBrands = useMemo(
    () => sortOptionsAlpha(availableItemBrands),
    [availableItemBrands]
  );
  const sortedColors = useMemo(
    () => sortOptionsAlpha(availableColors),
    [availableColors]
  );
  const sortedPricePoints = useMemo(
    () => [...availablePricePoints].sort((a, b) => a - b),
    [availablePricePoints]
  );

  // Options for the MultiPicker brand dropdown (full-screen on mobile).
  const brandPickerOptions: MultiPickerOption[] = useMemo(
    () => sortedBrands.map((b) => ({ id: b, label: b })),
    [sortedBrands]
  );

  const handleStatusToggle = (status: string) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    onStatusChange(newStatuses);
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    onCategoryChange(newCategories);
  };

  const handleColorToggle = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color];
    onColorChange(newColors);
  };

  const handlePriceToggle = (price: number) => {
    const newPrices = selectedPrices.includes(price)
      ? selectedPrices.filter(p => p !== price)
      : [...selectedPrices, price];
    onPriceChange(newPrices);
  };

  const hasActiveFilters = selectedStatuses.length > 0 ||
    selectedCategories.length > 0 ||
    selectedItemBrands.length > 0 ||
    selectedColors.length > 0 ||
    selectedPrices.length > 0;

  const getFilterDisplayName = () => {
    if (!hasActiveFilters) {
      return 'All Filters';
    }
    
    const filterParts = [];
    
    if (selectedStatuses.length > 0) {
      filterParts.push(`${selectedStatuses.length} Status${selectedStatuses.length > 1 ? 'es' : ''}`);
    }
    if (selectedCategories.length > 0) {
      filterParts.push(`${selectedCategories.length} Categor${selectedCategories.length > 1 ? 'ies' : 'y'}`);
    }
    if (selectedItemBrands.length > 0) {
      filterParts.push(`${selectedItemBrands.length} Brand${selectedItemBrands.length > 1 ? 's' : ''}`);
    }
    if (selectedColors.length > 0) {
      filterParts.push(`${selectedColors.length} Color${selectedColors.length > 1 ? 's' : ''}`);
    }
    if (selectedPrices.length > 0) {
      filterParts.push(`${selectedPrices.length} Price${selectedPrices.length > 1 ? 's' : ''}`);
    }
    
    return filterParts.join(' • ');
  };

  const clearFilters = () => {
    onClearAll();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={isMobile
          ? "max-h-[85vh] flex flex-col"
          : "w-full sm:max-w-md flex flex-col h-full"
        }
      >
        <style>{`[data-status-filter-popover]{animation:none!important;transition:none!important;width:var(--radix-popover-trigger-width)!important}`}</style>
        {/* Header - Compact */}
        <SheetHeader className={isMobile ? "flex-shrink-0 px-4 pt-4 pb-3 pr-12" : "flex-shrink-0 px-6 pt-6 pb-4 pr-12"}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FilterIcon className="h-5 w-5 text-on-surface-variant" />
              <SheetTitle className="title-large text-on-surface">Filter Items</SheetTitle>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <SheetDescription className="body-medium text-on-surface-variant">
              Filter items by status, category, brand, color, or price
            </SheetDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-primary hover:text-primary hover:bg-primary-container/50 h-10 md:h-8 px-3 ml-4 flex-shrink-0 min-h-[48px] md:min-h-0 touch-manipulation"
              disabled={!hasActiveFilters}
            >
              Clear all
            </Button>
          </div>
        </SheetHeader>

        {/* Content - Compact */}
        <div className={isMobile ? "flex-1 overflow-y-auto px-4" : "flex-1 overflow-y-auto px-6"}>
          {/* Current Filter Status - Compact */}
          {hasActiveFilters && (
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
          )}

          {/* Multi-Filter Options */}
          <div className="space-y-3">
            {/* Status Selection Dropdown */}
            <div>
              <label className="body-small text-on-surface-variant mb-1 block">
                Item Status ({selectedStatuses.length})
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 md:h-10 justify-between text-left min-h-[48px] md:min-h-0 touch-manipulation"
                  >
                    <div className="flex items-center gap-2">
                      <span className="body-medium text-on-surface">
                        {selectedStatuses.length === 0 
                          ? "Select statuses..." 
                          : `${selectedStatuses.length} selected`
                        }
                      </span>
                    </div>
                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  data-status-filter-popover=""
                  className="p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Search statuses..." />
                    <CommandList>
                      <CommandEmpty>No statuses found.</CommandEmpty>
                      <CommandGroup>
                        {sortedStatuses.map((status) => (
                          <CommandItem
                            key={status}
                            value={status}
                            onSelect={() => handleStatusToggle(status)}
                            className="flex items-center gap-2 cursor-pointer py-3 md:py-1.5 min-h-[44px] md:min-h-0 touch-manipulation"
                          >
                            <Checkbox
                              checked={selectedStatuses.includes(status)}
                              className="pointer-events-none"
                            />
                            <span className="body-medium">{status}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedStatuses.length > 0 && (
                <div className="flex items-center justify-between mt-1">
                  <div className="flex flex-wrap gap-1">
                    {selectedStatuses.slice(0, 3).map(status => (
                      <Badge 
                        key={status} 
                        variant="secondary" 
                        className="body-small bg-primary-container text-on-primary-container px-2 py-0.5"
                      >
                        {status}
                      </Badge>
                    ))}
                    {selectedStatuses.length > 3 && (
                      <Badge variant="secondary" className="body-small px-2 py-0.5">
                        +{selectedStatuses.length - 3}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStatusChange([])}
                    className="text-primary hover:text-primary hover:bg-primary-container/50 h-10 md:h-6 px-2 min-h-[48px] md:min-h-0 touch-manipulation"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Category Selection Dropdown */}
            <div>
              <label className="body-small text-on-surface-variant mb-1 block">
                Categories ({selectedCategories.length})
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 md:h-10 justify-between text-left min-h-[48px] md:min-h-0 touch-manipulation"
                  >
                    <div className="flex items-center gap-2">
                      <span className="body-medium text-on-surface">
                        {selectedCategories.length === 0 
                          ? "Select categories..." 
                          : `${selectedCategories.length} selected`
                        }
                      </span>
                    </div>
                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  data-status-filter-popover=""
                  className="p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Search categories..." />
                    <CommandList>
                      <CommandEmpty>No categories found.</CommandEmpty>
                      <CommandGroup>
                        {sortedCategories.map((category) => (
                          <CommandItem
                            key={category}
                            value={category}
                            onSelect={() => handleCategoryToggle(category)}
                            className="flex items-center gap-2 cursor-pointer py-3 md:py-1.5 min-h-[44px] md:min-h-0 touch-manipulation"
                          >
                            <Checkbox
                              checked={selectedCategories.includes(category)}
                              className="pointer-events-none"
                            />
                            <span className="body-medium">{category}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedCategories.length > 0 && (
                <div className="flex items-center justify-between mt-1">
                  <div className="flex flex-wrap gap-1">
                    {selectedCategories.slice(0, 3).map(category => (
                      <Badge 
                        key={category} 
                        variant="secondary" 
                        className="body-small bg-secondary-container text-on-secondary-container px-2 py-0.5"
                      >
                        {category}
                      </Badge>
                    ))}
                    {selectedCategories.length > 3 && (
                      <Badge variant="secondary" className="body-small px-2 py-0.5">
                        +{selectedCategories.length - 3}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCategoryChange([])}
                    className="text-primary hover:text-primary hover:bg-primary-container/50 h-10 md:h-6 px-2 min-h-[48px] md:min-h-0 touch-manipulation"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Brand Selection Dropdown */}
            <div>
              <label className="body-small text-on-surface-variant mb-1 block">
                Item Brands ({selectedItemBrands.length})
              </label>
              <MultiPicker
                options={brandPickerOptions}
                selectedIds={selectedItemBrands}
                onChange={onBrandChange}
                placeholder="Select brands..."
                searchPlaceholder="Search brands..."
                emptyText="No brands found."
                title="Select brands"
                triggerClassName="w-full h-12 md:h-10 text-left min-h-[48px] md:min-h-0 touch-manipulation"
              />
              {selectedItemBrands.length > 0 && (
                <div className="flex items-center justify-between mt-1">
                  <div className="flex flex-wrap gap-1">
                    {selectedItemBrands.slice(0, 3).map(brand => (
                      <Badge 
                        key={brand} 
                        variant="secondary" 
                        className="body-small bg-tertiary-container text-on-tertiary-container px-2 py-0.5"
                      >
                        {brand}
                      </Badge>
                    ))}
                    {selectedItemBrands.length > 3 && (
                      <Badge variant="secondary" className="body-small px-2 py-0.5">
                        +{selectedItemBrands.length - 3}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onBrandChange([])}
                    className="text-primary hover:text-primary hover:bg-primary-container/50 h-10 md:h-6 px-2 min-h-[48px] md:min-h-0 touch-manipulation"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Color Selection Dropdown */}
            <div>
              <label className="body-small text-on-surface-variant mb-1 block">
                Colors ({selectedColors.length})
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 md:h-10 justify-between text-left min-h-[48px] md:min-h-0 touch-manipulation"
                  >
                    <div className="flex items-center gap-2">
                      <span className="body-medium text-on-surface">
                        {selectedColors.length === 0 
                          ? "Select colors..." 
                          : `${selectedColors.length} selected`
                        }
                      </span>
                    </div>
                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  data-status-filter-popover=""
                  className="p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Search colors..." />
                    <CommandList>
                      <CommandEmpty>No colors found.</CommandEmpty>
                      <CommandGroup>
                        {sortedColors.map((color) => (
                          <CommandItem
                            key={color}
                            value={color}
                            onSelect={() => handleColorToggle(color)}
                            className="flex items-center gap-2 cursor-pointer py-3 md:py-1.5 min-h-[44px] md:min-h-0 touch-manipulation"
                          >
                            <Checkbox
                              checked={selectedColors.includes(color)}
                              className="pointer-events-none"
                            />
                            <span className="body-medium">{color}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedColors.length > 0 && (
                <div className="flex items-center justify-between mt-1">
                  <div className="flex flex-wrap gap-1">
                    {selectedColors.slice(0, 3).map(color => (
                      <Badge 
                        key={color} 
                        variant="secondary" 
                        className="body-small bg-primary-container text-on-primary-container px-2 py-0.5"
                      >
                        {color}
                      </Badge>
                    ))}
                    {selectedColors.length > 3 && (
                      <Badge variant="secondary" className="body-small px-2 py-0.5">
                        +{selectedColors.length - 3}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onColorChange([])}
                    className="text-primary hover:text-primary hover:bg-primary-container/50 h-10 md:h-6 px-2 min-h-[48px] md:min-h-0 touch-manipulation"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Price Selection Dropdown */}
            <div>
              <label className="body-small text-on-surface-variant mb-1 block">
                Prices (SEK) ({selectedPrices.length})
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 md:h-10 justify-between text-left min-h-[48px] md:min-h-0 touch-manipulation"
                  >
                    <div className="flex items-center gap-2">
                      <span className="body-medium text-on-surface">
                        {selectedPrices.length === 0 
                          ? "Select prices..." 
                          : `${selectedPrices.length} selected`
                        }
                      </span>
                    </div>
                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  data-status-filter-popover=""
                  className="p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Search prices..." />
                    <CommandList>
                      <CommandEmpty>No prices found.</CommandEmpty>
                      <CommandGroup>
                        {sortedPricePoints.map((price) => (
                          <CommandItem
                            key={price}
                            value={price.toString()}
                            onSelect={() => handlePriceToggle(price)}
                            className="flex items-center gap-2 cursor-pointer py-3 md:py-1.5 min-h-[44px] md:min-h-0 touch-manipulation"
                          >
                            <Checkbox
                              checked={selectedPrices.includes(price)}
                              className="pointer-events-none"
                            />
                            <span className="body-medium">{price} SEK</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedPrices.length > 0 && (
                <div className="flex items-center justify-between mt-1">
                  <div className="flex flex-wrap gap-1">
                    {selectedPrices.slice(0, 3).map(price => (
                      <Badge 
                        key={price} 
                        variant="secondary" 
                        className="body-small bg-secondary-container text-on-secondary-container px-2 py-0.5"
                      >
                        {price} SEK
                      </Badge>
                    ))}
                    {selectedPrices.length > 3 && (
                      <Badge variant="secondary" className="body-small px-2 py-0.5">
                        +{selectedPrices.length - 3}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPriceChange([])}
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
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-12 md:h-10 min-h-[48px] md:min-h-0 touch-manipulation"
              onClick={() => setIsOpen(false)}
            >
              Apply
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

