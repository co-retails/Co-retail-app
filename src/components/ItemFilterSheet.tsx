import React, { useMemo, useState } from 'react';
import { sortOptionsAlpha, sortStoreItemSizes } from '../utils/spreadsheetUtils';
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
import MultiPicker, { MultiPickerOption } from './MultiPicker';

export interface ItemFilters {
  /** Empty array = no filter (show all). */
  brand: string[];
  category: string[];
  status: string[];
  colour: string[];
  size: string[];
  priceRange: [number, number];
  sortBy: 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';
}

export const defaultFilters: ItemFilters = {
  brand: [],
  category: [],
  status: [],
  colour: [],
  size: [],
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

const FILTER_CATEGORY_VALUES = sortOptionsAlpha([
  'Tops',
  'Bottoms',
  'Dresses',
  'Outerwear',
  'Shoes',
  'Accessories',
]);

const FILTER_COLOUR_VALUES = sortOptionsAlpha([
  'Black',
  'White',
  'Blue',
  'Red',
  'Green',
  'Gray',
  'Beige',
]);

/** Same universe as item details (ItemDetailsDialog AVAILABLE_SIZES). */
const FILTER_SIZE_VALUES = sortStoreItemSizes([
  'XXS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '32',
  '34',
  '36',
  '38',
  '40',
  '42',
  '44',
  '46',
  'One size',
]);

const FILTER_STATUS_VALUES = sortOptionsAlpha([
  'Available',
  'Draft',
  'In transit',
  'Sold',
  'Returned',
  'Missing',
  'Broken',
  'Rejected',
]);

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
    if (key === 'priceRange') {
      const [lo, hi] = value as [number, number];
      return lo !== 0 || hi !== 1000;
    }
    return Array.isArray(value) && value.length > 0;
  }).length;

  const selectableBrands = useMemo(() => {
    const source = brandOptions && brandOptions.length > 0 ? brandOptions : DEFAULT_BRAND_OPTIONS;
    return Array.from(new Set(source.map(name => name.trim()).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [brandOptions]);

  // Build MultiPicker option lists once per render.
  const brandPickerOptions: MultiPickerOption[] = useMemo(
    () => selectableBrands.map(b => ({ id: b, label: b })),
    [selectableBrands]
  );
  const categoryPickerOptions: MultiPickerOption[] = useMemo(
    () => FILTER_CATEGORY_VALUES.map(c => ({ id: c, label: c })),
    []
  );
  const statusPickerOptions: MultiPickerOption[] = useMemo(
    () => FILTER_STATUS_VALUES.map(s => ({ id: s, label: s })),
    []
  );
  const colourPickerOptions: MultiPickerOption[] = useMemo(
    () => FILTER_COLOUR_VALUES.map(c => ({ id: c, label: c })),
    []
  );
  const sizePickerOptions: MultiPickerOption[] = useMemo(
    () => FILTER_SIZE_VALUES.map(s => ({ id: s, label: s })),
    []
  );

  const filterTriggerClass =
    'w-full bg-surface-container border border-outline-variant rounded-lg text-left min-h-[48px] body-large';

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
            <MultiPicker
              options={brandPickerOptions}
              selectedIds={localFilters.brand}
              onChange={(v) => updateFilter('brand', v)}
              placeholder="All brands"
              searchPlaceholder="Search brands..."
              emptyText="No brands found."
              title="Select brands"
              triggerId="brand"
              triggerClassName={filterTriggerClass}
            />
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label htmlFor="category" className="label-large text-on-surface">
              Category
            </Label>
            <MultiPicker
              options={categoryPickerOptions}
              selectedIds={localFilters.category}
              onChange={(v) => updateFilter('category', v)}
              placeholder="All categories"
              searchPlaceholder="Search categories..."
              emptyText="No categories found."
              title="Select categories"
              triggerId="category"
              triggerClassName={filterTriggerClass}
              compact
              hideSearch
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status" className="label-large text-on-surface">
              Status
            </Label>
            <MultiPicker
              options={statusPickerOptions}
              selectedIds={localFilters.status}
              onChange={(v) => updateFilter('status', v)}
              placeholder="All statuses"
              searchPlaceholder="Search statuses..."
              emptyText="No statuses found."
              title="Select statuses"
              triggerId="status"
              triggerClassName={filterTriggerClass}
              compact
              hideSearch
            />
          </div>

          {/* Colour Filter */}
          <div className="space-y-2">
            <Label htmlFor="colour" className="label-large text-on-surface">
              Colour
            </Label>
            <MultiPicker
              options={colourPickerOptions}
              selectedIds={localFilters.colour}
              onChange={(v) => updateFilter('colour', v)}
              placeholder="All colours"
              searchPlaceholder="Search colours..."
              emptyText="No colours found."
              title="Select colours"
              triggerId="colour"
              triggerClassName={filterTriggerClass}
              compact
              hideSearch
            />
          </div>

          {/* Size Filter */}
          <div className="space-y-2">
            <Label htmlFor="size" className="label-large text-on-surface">
              Size
            </Label>
            <MultiPicker
              options={sizePickerOptions}
              selectedIds={localFilters.size}
              onChange={(v) => updateFilter('size', v)}
              placeholder="All sizes"
              searchPlaceholder="Search sizes..."
              emptyText="No sizes found."
              title="Select sizes"
              triggerId="size"
              triggerClassName={filterTriggerClass}
              compact
              hideSearch
            />
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
                <SelectItem value="date-desc" className="body-large min-h-[48px] md:min-h-0 py-3 md:py-1.5 touch-manipulation">Date (newest first)</SelectItem>
                <SelectItem value="date-asc" className="body-large min-h-[48px] md:min-h-0 py-3 md:py-1.5 touch-manipulation">Date (oldest first)</SelectItem>
                <SelectItem value="name-asc" className="body-large min-h-[48px] md:min-h-0 py-3 md:py-1.5 touch-manipulation">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc" className="body-large min-h-[48px] md:min-h-0 py-3 md:py-1.5 touch-manipulation">Name (Z-A)</SelectItem>
                <SelectItem value="price-asc" className="body-large min-h-[48px] md:min-h-0 py-3 md:py-1.5 touch-manipulation">Price (low to high)</SelectItem>
                <SelectItem value="price-desc" className="body-large min-h-[48px] md:min-h-0 py-3 md:py-1.5 touch-manipulation">Price (high to low)</SelectItem>
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
