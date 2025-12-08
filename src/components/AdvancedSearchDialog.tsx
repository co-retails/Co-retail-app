import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Check } from 'lucide-react';

// Hook to detect mobile devices
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

export interface SearchFilters {
  sortBy: 'date-asc' | 'date-desc' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';
  keyword: string;
  brand: string;
  category: string;
  status: string;
  colour: string;
  pattern: string;
  priceRange: [number, number];
}

export const defaultFilters: SearchFilters = {
  sortBy: 'date-desc',
  keyword: '',
  brand: 'all',
  category: 'all',
  status: 'all',
  colour: 'all',
  pattern: 'all',
  priceRange: [5, 250]
};

interface AdvancedSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: (filters: SearchFilters) => void;
}

function SortRadioGroup({ 
  value, 
  onChange 
}: { 
  value: 'date-asc' | 'date-desc'; 
  onChange: (value: 'date-asc' | 'date-desc') => void; 
}) {
  return (
    <div className="space-y-4">
      <label className="label-medium text-on-surface-variant">
        Sort date:
      </label>
      <div className="flex gap-6">
        <button
          type="button"
          className="flex items-center gap-3 hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors rounded-lg p-2"
          onClick={() => onChange('date-desc')}
        >
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            value === 'date-desc' 
              ? 'border-primary bg-primary' 
              : 'border-outline bg-surface-container'
          }`}>
            {value === 'date-desc' && (
              <div className="w-2 h-2 rounded-full bg-on-primary" />
            )}
          </div>
          <span className="body-medium text-on-surface">Z-A</span>
        </button>
        
        <button
          type="button"
          className="flex items-center gap-3 hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors rounded-lg p-2"
          onClick={() => onChange('date-asc')}
        >
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            value === 'date-asc' 
              ? 'border-primary bg-primary' 
              : 'border-outline bg-surface-container'
          }`}>
            {value === 'date-asc' && (
              <div className="w-2 h-2 rounded-full bg-on-primary" />
            )}
          </div>
          <span className="body-medium text-on-surface">A-Z</span>
        </button>
      </div>
    </div>
  );
}

function FilterField({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder 
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void; 
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <label className="label-medium text-on-surface-variant">
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-surface-container-high border border-outline rounded-lg min-h-[48px] body-large">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {label.toLowerCase()}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function PriceRangeField({ 
  value, 
  onChange 
}: { 
  value: [number, number]; 
  onChange: (value: [number, number]) => void; 
}) {
  const [localMin, setLocalMin] = useState(value[0].toString());
  const [localMax, setLocalMax] = useState(value[1].toString());

  const handleSliderChange = (newValue: number[]) => {
    const newRange: [number, number] = [newValue[0], newValue[1]];
    onChange(newRange);
    setLocalMin(newRange[0].toString());
    setLocalMax(newRange[1].toString());
  };

  const handleMinChange = (newMin: string) => {
    setLocalMin(newMin);
    const numMin = parseInt(newMin) || 0;
    if (numMin <= value[1]) {
      onChange([numMin, value[1]]);
    }
  };

  const handleMaxChange = (newMax: string) => {
    setLocalMax(newMax);
    const numMax = parseInt(newMax) || 250;
    if (numMax >= value[0]) {
      onChange([value[0], numMax]);
    }
  };

  return (
    <div className="space-y-4">
      <label className="label-medium text-on-surface-variant">
        Price range
      </label>
      
      {/* Min/Max Inputs */}
      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-2">
          <label className="label-small text-on-surface-variant">
            Min price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 body-large text-on-surface">€</span>
            <Input
              type="number"
              value={localMin}
              onChange={(e) => handleMinChange(e.target.value)}
              className="bg-surface-container-high border border-outline rounded-lg min-h-[48px] pl-8 body-large"
              min="5"
              max="250"
            />
          </div>
        </div>
        
        <div className="flex items-center pt-6">
          <span className="body-medium text-on-surface">to</span>
        </div>
        
        <div className="flex-1 space-y-2">
          <label className="label-small text-on-surface-variant">
            Max price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 body-large text-on-surface">€</span>
            <Input
              type="number"
              value={localMax}
              onChange={(e) => handleMaxChange(e.target.value)}
              className="bg-surface-container-high border border-outline rounded-lg min-h-[48px] pl-8 body-large"
              min="5"
              max="250"
            />
          </div>
        </div>
      </div>
      
      {/* Slider */}
      <div className="px-2 py-4">
        <Slider
          value={value}
          onValueChange={handleSliderChange}
          min={5}
          max={250}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between mt-2">
          <span className="label-small text-on-surface-variant">€5</span>
          <span className="label-small text-on-surface-variant">€250</span>
        </div>
      </div>
    </div>
  );
}

export default function AdvancedSearchDialog({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange, 
  onSearch 
}: AdvancedSearchDialogProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  // Available options for dropdowns
  const brands = ['H&M', 'Weekday', 'COS', 'Monki', 'ARKET', 'Sellpy', 'Kinda Kinks'];
  const categories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'];
  const statuses = ['Available', 'In transit', 'Storage', 'Draft', 'Rejected', 'Missing', 'Broken', 'Sold', 'Returned'];
  const colours = ['Black', 'White', 'Blue', 'Red', 'Gray', 'Green', 'Pink', 'Brown'];
  const patterns = ['Solid', 'Striped', 'Floral', 'Geometric', 'Animal Print', 'Abstract'];

  const handleFieldChange = <K extends keyof SearchFilters>(
    field: K, 
    value: SearchFilters[K]
  ) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setLocalFilters(filters); // Reset to original filters
    onClose();
  };

  const handleSearch = () => {
    onFiltersChange(localFilters);
    onSearch(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters(defaultFilters);
  };

  const hasActiveFilters = () => {
    return (
      localFilters.keyword !== '' ||
      localFilters.brand !== 'all' ||
      localFilters.category !== 'all' ||
      localFilters.status !== 'all' ||
      localFilters.colour !== 'all' ||
      localFilters.pattern !== 'all' ||
      localFilters.priceRange[0] !== 5 ||
      localFilters.priceRange[1] !== 250 ||
      localFilters.sortBy !== 'date-desc'
    );
  };

  const isMobile = useIsMobile();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`
        bg-surface border border-outline-variant overflow-hidden flex flex-col
        ${isMobile 
          ? 'fixed inset-0 max-w-full max-h-full w-full h-full rounded-none m-0 translate-x-0 translate-y-0' 
          : 'max-w-md mx-4 max-h-[90vh] rounded-lg'
        }
      `}>
        <DialogHeader className={`
          ${isMobile ? 'p-4' : 'pb-4'} border-b border-outline-variant
        `}>
          <DialogTitle className="title-large text-on-surface">
            Advanced search
          </DialogTitle>
          <DialogDescription className="sr-only">
            Filter and search items by multiple criteria including brand, category, price range, and status.
          </DialogDescription>
        </DialogHeader>
        
        <div className={`
          flex-1 overflow-y-auto space-y-6
          ${isMobile ? 'px-4 py-4' : 'px-6 py-4'}
        `}>
          {/* Sort Date */}
          <SortRadioGroup 
            value={localFilters.sortBy.includes('desc') ? 'date-desc' : 'date-asc'}
            onChange={(value) => handleFieldChange('sortBy', value)}
          />
          
          {/* Keyword */}
          <div className="space-y-2">
            <label className="label-medium text-on-surface-variant">
              Keyword
            </label>
            <Input
              type="text"
              placeholder="Search by name or ID"
              value={localFilters.keyword}
              onChange={(e) => handleFieldChange('keyword', e.target.value)}
              className="bg-surface-container-high border border-outline rounded-lg min-h-[48px] body-large"
            />
          </div>
          
          {/* Brand */}
          <FilterField
            label="Brand"
            value={localFilters.brand}
            onChange={(value) => handleFieldChange('brand', value)}
            options={brands}
            placeholder="Select brand"
          />
          
          {/* Category */}
          <FilterField
            label="Category"
            value={localFilters.category}
            onChange={(value) => handleFieldChange('category', value)}
            options={categories}
            placeholder="Select category"
          />
          
          {/* Price Range */}
          <PriceRangeField
            value={localFilters.priceRange}
            onChange={(value) => handleFieldChange('priceRange', value)}
          />
          
          {/* Status */}
          <FilterField
            label="Status"
            value={localFilters.status}
            onChange={(value) => handleFieldChange('status', value)}
            options={statuses}
            placeholder="Select status"
          />
          
          {/* Colour */}
          <FilterField
            label="Colour"
            value={localFilters.colour}
            onChange={(value) => handleFieldChange('colour', value)}
            options={colours}
            placeholder="Select colour"
          />
          
          {/* Pattern */}
          <FilterField
            label="Pattern"
            value={localFilters.pattern}
            onChange={(value) => handleFieldChange('pattern', value)}
            options={patterns}
            placeholder="Select pattern"
          />
        </div>
        
        {/* Bottom Actions */}
        <div className={`
          border-t border-outline-variant
          ${isMobile ? 'p-4 bg-surface' : 'p-4'}
        `}>
          {hasActiveFilters() && (
            <div className="flex justify-center mb-4">
              <Button
                variant="ghost"
                onClick={handleReset}
                className="text-primary hover:bg-primary-container/50 focus:bg-primary-container/50 active:bg-primary-container/70 transition-colors px-4 py-2 rounded-[16px] min-h-[48px]"
              >
                Reset all filters
              </Button>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={handleCancel}
              className="flex-1 border-outline text-on-surface hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors px-6 py-3 rounded-lg min-h-[48px] label-large uppercase"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSearch}
              className="flex-1 bg-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 text-on-primary transition-colors px-6 py-3 rounded-lg min-h-[48px] label-large uppercase"
            >
              Search
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}