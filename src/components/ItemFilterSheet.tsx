import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from './ui/sheet';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { ChevronDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';

export interface ItemFilters {
  brand: string;
  category: string;
  status: string;
  colour: string;
  priceRange: [number, number];
  sortBy: 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';
}

export const defaultFilters: ItemFilters = {
  brand: 'all',
  category: 'all',
  status: 'all',
  colour: 'all',
  priceRange: [0, 1000],
  sortBy: 'date-desc'
};

interface ItemFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ItemFilters;
  onApplyFilters: (filters: ItemFilters) => void;
  onResetFilters: () => void;
  brandOptions?: string[];
}

const DEFAULT_BRAND_OPTIONS = ['Nike', 'Adidas', 'H&M', 'Zara', 'Uniqlo', "Levi's"];

export default function ItemFilterSheet({
  open,
  onOpenChange,
  filters,
  onApplyFilters,
  onResetFilters,
  brandOptions
}: ItemFilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<ItemFilters>(filters);
  const [isMobile, setIsMobile] = React.useState(false);
  const [brandPickerOpen, setBrandPickerOpen] = useState(false);

  // Detect mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update local filters when sheet opens with new filter values
  React.useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [open, filters]);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalFilters(defaultFilters);
    onResetFilters();
    onOpenChange(false);
  };

  const updateFilter = <K extends keyof ItemFilters>(key: K, value: ItemFilters[K]) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  // Calculate active filter count
  const activeFilterCount = Object.entries(localFilters).filter(([key, value]) => {
    if (key === 'sortBy') return false;
    if (key === 'priceRange') return value[0] !== 0 || value[1] !== 1000;
    return value !== 'all';
  }).length;

  const selectableBrands = React.useMemo(() => {
    const source = brandOptions && brandOptions.length > 0 ? brandOptions : DEFAULT_BRAND_OPTIONS;
    return Array.from(new Set(source.map(name => name.trim()).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [brandOptions]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"} 
        className="bg-surface border-outline-variant p-0 flex flex-col md:max-w-[400px] md:h-full max-h-[85vh] md:max-h-full"
      >
        {/* Header - Fixed */}
        <SheetHeader className="border-b border-outline-variant px-4 pt-6 pb-4 pr-12 flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="title-large text-on-surface">
              Filter items
            </SheetTitle>
            {activeFilterCount > 0 && (
              <span className="label-small text-on-surface-variant">
                {activeFilterCount} active
              </span>
            )}
          </div>
          <SheetDescription className="body-medium text-on-surface-variant">
            Apply filters to refine your item search
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Brand Filter */}
          <div className="space-y-2">
            <Label htmlFor="brand" className="label-large text-on-surface">
              Brand
            </Label>
            <Popover open={brandPickerOpen} onOpenChange={setBrandPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  role="combobox"
                  aria-expanded={brandPickerOpen}
                  className="w-full justify-between bg-surface-container border border-outline-variant rounded-lg text-left"
                  id="brand"
                >
                  <span className="truncate">
                    {localFilters.brand === 'all' ? 'All brands' : localFilters.brand}
                  </span>
                  <ChevronDown className="w-4 h-4 opacity-60 flex-shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0 w-[calc(100vw-2rem)] sm:w-72"
                align="start"
              >
                <Command>
                  <CommandInput placeholder="Search brands..." />
                  <CommandList>
                    <CommandEmpty>No brand found.</CommandEmpty>
                    <CommandGroup heading="Brands">
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          updateFilter('brand', 'all');
                          setBrandPickerOpen(false);
                        }}
                        className="flex items-center justify-between"
                      >
                        <span>All brands</span>
                        {localFilters.brand === 'all' && <Check className="w-4 h-4 opacity-70" />}
                      </CommandItem>
                      {selectableBrands.map((brand) => (
                        <CommandItem
                          key={brand}
                          value={brand.toLowerCase()}
                          onSelect={() => {
                            updateFilter('brand', brand);
                            setBrandPickerOpen(false);
                          }}
                          className="flex items-center justify-between"
                        >
                          <span>{brand}</span>
                          {localFilters.brand === brand && <Check className="w-4 h-4 opacity-70" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label htmlFor="category" className="label-large text-on-surface">
              Category
            </Label>
            <Select
              value={localFilters.category}
              onValueChange={(value) => updateFilter('category', value)}
            >
              <SelectTrigger 
                id="category"
                className="bg-surface-container border border-outline-variant rounded-lg min-h-[48px] body-large"
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-surface-container-high border border-outline">
                <SelectItem value="all" className="body-large">All categories</SelectItem>
                <SelectItem value="Tops" className="body-large">Tops</SelectItem>
                <SelectItem value="Bottoms" className="body-large">Bottoms</SelectItem>
                <SelectItem value="Dresses" className="body-large">Dresses</SelectItem>
                <SelectItem value="Outerwear" className="body-large">Outerwear</SelectItem>
                <SelectItem value="Shoes" className="body-large">Shoes</SelectItem>
                <SelectItem value="Accessories" className="body-large">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status" className="label-large text-on-surface">
              Status
            </Label>
            <Select
              value={localFilters.status}
              onValueChange={(value) => updateFilter('status', value)}
            >
              <SelectTrigger 
                id="status"
                className="bg-surface-container border border-outline-variant rounded-lg min-h-[48px] body-large"
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-surface-container-high border border-outline">
                <SelectItem value="all" className="body-large">All statuses</SelectItem>
                <SelectItem value="Available" className="body-large">Available</SelectItem>
                <SelectItem value="Draft" className="body-large">Draft</SelectItem>
                <SelectItem value="In transit" className="body-large">In transit</SelectItem>
                <SelectItem value="Storage" className="body-large">Storage</SelectItem>
                <SelectItem value="Sold" className="body-large">Sold</SelectItem>
                <SelectItem value="Returned" className="body-large">Returned</SelectItem>
                <SelectItem value="Missing" className="body-large">Missing</SelectItem>
                <SelectItem value="Broken" className="body-large">Broken</SelectItem>
                <SelectItem value="Rejected" className="body-large">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Colour Filter */}
          <div className="space-y-2">
            <Label htmlFor="colour" className="label-large text-on-surface">
              Colour
            </Label>
            <Select
              value={localFilters.colour}
              onValueChange={(value) => updateFilter('colour', value)}
            >
              <SelectTrigger 
                id="colour"
                className="bg-surface-container border border-outline-variant rounded-lg min-h-[48px] body-large"
              >
                <SelectValue placeholder="Select colour" />
              </SelectTrigger>
              <SelectContent className="bg-surface-container-high border border-outline">
                <SelectItem value="all" className="body-large">All colours</SelectItem>
                <SelectItem value="Black" className="body-large">Black</SelectItem>
                <SelectItem value="White" className="body-large">White</SelectItem>
                <SelectItem value="Blue" className="body-large">Blue</SelectItem>
                <SelectItem value="Red" className="body-large">Red</SelectItem>
                <SelectItem value="Green" className="body-large">Green</SelectItem>
                <SelectItem value="Gray" className="body-large">Gray</SelectItem>
                <SelectItem value="Beige" className="body-large">Beige</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <Label className="label-large text-on-surface">
              Price range: ${localFilters.priceRange[0]} - ${localFilters.priceRange[1]}
            </Label>
            <Slider
              min={0}
              max={1000}
              step={10}
              value={localFilters.priceRange}
              onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
              className="py-2"
            />
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label htmlFor="sortBy" className="label-large text-on-surface">
              Sort by
            </Label>
            <Select
              value={localFilters.sortBy}
              onValueChange={(value) => updateFilter('sortBy', value as ItemFilters['sortBy'])}
            >
              <SelectTrigger 
                id="sortBy"
                className="bg-surface-container border border-outline-variant rounded-lg min-h-[48px] body-large"
              >
                <SelectValue placeholder="Select sort order" />
              </SelectTrigger>
              <SelectContent className="bg-surface-container-high border border-outline">
                <SelectItem value="date-desc" className="body-large">Date (newest first)</SelectItem>
                <SelectItem value="date-asc" className="body-large">Date (oldest first)</SelectItem>
                <SelectItem value="name-asc" className="body-large">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc" className="body-large">Name (Z-A)</SelectItem>
                <SelectItem value="price-asc" className="body-large">Price (low to high)</SelectItem>
                <SelectItem value="price-desc" className="body-large">Price (high to low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <SheetFooter className="border-t border-outline-variant px-4 pt-4 pb-6 flex-shrink-0 flex-row gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={handleReset}
            className="flex-1 bg-surface border border-outline text-on-surface hover:bg-surface-container-high rounded-lg touch-manipulation"
          >
            Reset
          </Button>
          <Button
            onClick={handleApply}
            size="lg"
            className="flex-1 bg-primary hover:bg-primary/90 text-on-primary rounded-lg touch-manipulation"
          >
            Apply filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
