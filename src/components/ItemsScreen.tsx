import { useState, useMemo, useEffect } from 'react';
import svgPaths from "../imports/svg-7un8q74kd7";
import svgPathsNew from "../imports/svg-9jzmb4i3sv";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { X, FilterIcon, Package as PackageIcon, ArrowUp, ArrowDown, QrCode } from "lucide-react";
import ItemFilterSheet, { ItemFilters, defaultFilters } from './ItemFilterSheet';
import StoreFilterBottomSheet, { ViewFilter } from './StoreFilterBottomSheet';
import { ItemCard, BaseItem, ItemQuickAction, getItemListQuickActions, quickActionIcon } from './ItemCard';
import { HIGHLIGHT_NEW } from '../config/featureHighlights';
import ItemDetailsDialog, { ItemDetails, StatusHistoryEntry } from './ItemDetailsDialog';
import RejectedReasonBottomSheet, { RejectedReason } from './RejectedReasonBottomSheet';
import { StatusUpdateDialog, ItemStatus as StatusUpdateItemStatus } from './StatusUpdateDialog';
import { UserRole } from './ItemCard';
import { toast } from 'sonner';
import { getSekPriceOptions } from '../data/partnerPricing';
import type { Store as StoreRecord, Country as CountryRecord, Brand as BrandRecord } from './StoreSelector';
import { useMediaQuery } from './ui/use-mobile';
import { ImageWithFallback } from './figma/ImageWithFallback';

export interface Item extends BaseItem {
  id: string;
  itemId: string;
  title: string;
  brand: string;
  category: string;
  subcategory?: string;
  size?: string;
  color?: string;
  price: number;
  status: 'Draft' | 'In transit' | 'Available' | 'Sold' | 'Returned' | 'Missing' | 'Broken' | 'Rejected';
  date: string;
  deliveryId?: string;
  boxLabel?: string;
  sellerName?: string;
  thumbnail?: string;
  daysRemaining?: number;
  source?: string;
  orderNumber?: string;
  orderType?: 'order' | 'return';
  selected: boolean;
  statusHistory?: StatusHistoryEntry[];
  rejectReason?: 'Rejected - Broken on arrival' | 'Rejected - Dirty' | 'Rejected - Not accepted brand' | 'Rejected - Not accepted material' | 'Rejected - Not in season' | 'Rejected - Wrong store';
  lastInStoreAt?: string;
  location?: 'Warehouse' | 'In transit' | 'Store';
  isExpired?: boolean;
  expiredFlaggedAt?: string;
  expiredPostponeWeeks?: number;
  isArchived?: boolean;
  archivedAt?: string;
}

function getDaysInStore(item: Item): number | null {
  const parse = (value?: string) => {
    if (!value) return null;
    const ts = Date.parse(value);
    return Number.isNaN(ts) ? null : ts;
  };

  const fromLastInStore = parse(item.lastInStoreAt);
  const fromHistory = (() => {
    const hist = item.statusHistory || [];
    for (let i = hist.length - 1; i >= 0; i--) {
      const entry = hist[i];
      const status = entry?.status?.toLowerCase?.() ?? '';
      if (status === 'in store' || status === 'available') {
        return parse(entry.timestamp);
      }
    }
    return null;
  })();

  const from = fromLastInStore ?? fromHistory;
  if (from == null) return null;
  const days = Math.floor((Date.now() - from) / (1000 * 60 * 60 * 24));
  return days >= 0 ? days : 0;
}

const STORE_HIDDEN_STATUSES: ReadonlyArray<Item['status']> = [
  'In transit',
  'Draft'
] as const;

const STORE_HIDDEN_STATUS_SET = new Set<Item['status']>(STORE_HIDDEN_STATUSES);

interface ItemsScreenProps {
  onBack: () => void;
  onNavigateToHome?: () => void;
  onNavigateToShipping?: () => void;
  onNavigateToScan?: () => void;
  onNavigateToSellers?: () => void;
  userRole?: UserRole;
  currentPartnerWarehouseSelection?: { partnerId: string; warehouseId: string };
  partners?: { id: string; name: string }[];
  // Shared filter state for partner portal
  viewFilter?: ViewFilter;
  onViewFilterChange?: (filter: ViewFilter) => void;
  brands?: BrandRecord[];
  countries?: CountryRecord[];
  stores?: StoreRecord[];
  onCreateReturn?: (items: Item[]) => void;
  expireTimeWeeks?: number; // Expire time setting for the store (in weeks)
}

function SearchBar({ searchTerm, onSearchChange, onFilterClick, placeholder = 'Search by name or ID' }: { 
  searchTerm: string; 
  onSearchChange: (value: string) => void;
  onFilterClick?: () => void;
  placeholder?: string;
}) {
  const hasText = searchTerm.length > 0;
  // Calculate right padding based on which buttons are visible
  let rightPadding = 'pr-4';
  if (hasText && onFilterClick) {
    rightPadding = 'pr-20'; // Space for both buttons
  } else if (hasText) {
    rightPadding = 'pr-12'; // Space for clear button
  } else if (onFilterClick) {
    rightPadding = 'pr-12'; // Space for filter button
  }

  return (
    <div className="relative w-full mb-0">
      <div className="relative">
        {/* Search icon on the left */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10">
          <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
            <path clipRule="evenodd" d={svgPaths.p3938ac00} fill="var(--on-surface-variant)" fillRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          id="items-search"
          name="items-search"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`w-full h-12 pl-10 ${rightPadding} bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-on-surface body-large`}
        />
        {/* Right side buttons container */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 z-20">
          {/* Clear button - only shown when there's text */}
          {hasText && (
            <button
              onClick={() => onSearchChange('')}
              className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity touch-manipulation"
              aria-label="Clear search"
            >
              <X className="w-5 h-5 text-on-surface-variant" />
            </button>
          )}
          {/* Filter button */}
          {onFilterClick && (
            <button
              onClick={onFilterClick}
              className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity touch-manipulation text-on-surface-variant"
              aria-label="Advanced search"
            >
              <FilterIcon size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickFilterChips({ 
  activeFilter, 
  onFilterChange,
  itemCounts,
  isPartnerPortal = false
}: { 
  activeFilter: string; 
  onFilterChange: (filter: string) => void;
  itemCounts: Record<string, number>;
  isPartnerPortal?: boolean;
}) {
  const getAvailableLabel = () => {
    return 'Available';
  };

  const handleAvailableClick = () => {
    if (activeFilter === 'available') {
      onFilterChange('available');
    } else {
      onFilterChange('available');
    }
  };

  const filters = isPartnerPortal ? [
    { id: 'all', label: 'All', count: itemCounts.all },
    { id: 'in-shipment', label: 'In transit', count: itemCounts.inShipment },
    { id: 'available', label: getAvailableLabel(), count: itemCounts.available },
    { id: 'sold', label: 'Sold', count: itemCounts.sold },
    { id: 'return-in-transit', label: 'Return in transit', count: itemCounts.returnInTransit }
  ] : [
    { id: 'all', label: 'All', count: itemCounts.all },
    { id: 'available', label: getAvailableLabel(), count: itemCounts.available },
    { id: 'expired', label: 'Expired flag', count: itemCounts.expired }
  ];

  return (
    <div className="px-4 py-3 bg-surface border-b border-outline-variant">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`flex-shrink-0 min-h-[44px] flex items-center px-4 py-2 rounded-lg border transition-colors ${
              activeFilter === filter.id || activeFilter.startsWith(`${filter.id}-`)
                ? 'bg-secondary-container border-secondary text-on-secondary-container'
                : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest'
            }`}
            onClick={() => filter.id === 'available' ? handleAvailableClick() : onFilterChange(filter.id)}
          >
            <span className="label-medium whitespace-nowrap">
              {filter.label} ({filter.count})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function UnflagExpiredSheet({ isOpen, onClose, item, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  onSave: (updates: Partial<Item>) => void;
}) {
  const [option, setOption] = useState<'reset' | 'postpone-4' | 'postpone-8'>('reset');
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setOption('reset'); // Reset to default when sheet opens
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!item) return;

    const updates: Partial<Item> = {};

    if (option === 'reset') {
      // Reset expired time - clear all expired flags
      updates.isExpired = false;
      updates.expiredFlaggedAt = undefined;
      updates.expiredPostponeWeeks = undefined;
    } else if (option === 'postpone-4') {
      // Flag as expired again after 4 weeks
      updates.expiredPostponeWeeks = 4;
      // Keep isExpired as true but update the postpone weeks
    } else if (option === 'postpone-8') {
      // Flag as expired again after 8 weeks
      updates.expiredPostponeWeeks = 8;
      // Keep isExpired as true but update the postpone weeks
    }

    onSave(updates);
    onClose();
  };

  if (!item) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"} 
        className="bg-surface border-outline-variant p-0 flex flex-col md:max-w-[400px] md:h-full max-h-[85vh] md:max-h-full"
      >
        {/* Header - Fixed */}
        <SheetHeader className="border-b border-outline-variant px-4 pt-6 pb-4 pr-12 flex-shrink-0">
          <SheetTitle className="title-large text-on-surface">
            Unflag Expired Item
          </SheetTitle>
          <SheetDescription className="body-medium text-on-surface-variant">
            Choose how to handle the expired flag for this item.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {/* Reset Option (Default) */}
          <button
            onClick={() => setOption('reset')}
            className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
              option === 'reset'
                ? 'border-primary bg-primary-container text-on-primary-container'
                : 'border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                option === 'reset'
                  ? 'border-on-primary-container bg-on-primary-container'
                  : 'border-on-surface-variant'
              }`}>
                {option === 'reset' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-container" />
                )}
              </div>
              <div className="flex-1">
                <div className="title-small text-on-surface mb-1">
                  Reset expired time
                </div>
                <div className="body-small text-on-surface-variant">
                  Remove the expired flag and reset the timer as if this is a new item
                </div>
              </div>
            </div>
          </button>

          {/* Postpone 4 Weeks Option */}
          <button
            onClick={() => setOption('postpone-4')}
            className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
              option === 'postpone-4'
                ? 'border-primary bg-primary-container text-on-primary-container'
                : 'border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                option === 'postpone-4'
                  ? 'border-on-primary-container bg-on-primary-container'
                  : 'border-on-surface-variant'
              }`}>
                {option === 'postpone-4' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-container" />
                )}
              </div>
              <div className="flex-1">
                <div className="title-small text-on-surface mb-1">
                  Flag as expired again after 4 weeks
                </div>
                <div className="body-small text-on-surface-variant">
                  Keep the expired flag but extend the timer by 4 weeks
                </div>
              </div>
            </div>
          </button>

          {/* Postpone 8 Weeks Option */}
          <button
            onClick={() => setOption('postpone-8')}
            className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
              option === 'postpone-8'
                ? 'border-primary bg-primary-container text-on-primary-container'
                : 'border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                option === 'postpone-8'
                  ? 'border-on-primary-container bg-on-primary-container'
                  : 'border-on-surface-variant'
              }`}>
                {option === 'postpone-8' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-container" />
                )}
              </div>
              <div className="flex-1">
                <div className="title-small text-on-surface mb-1">
                  Flag as expired again after 8 weeks
                </div>
                <div className="body-small text-on-surface-variant">
                  Keep the expired flag but extend the timer by 8 weeks
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Footer - Fixed at bottom */}
        <SheetFooter className="border-t border-outline-variant px-4 pt-4 pb-6 flex-shrink-0 flex-row gap-3">
          <Button 
            variant="outline" 
            size="lg"
            onClick={onClose}
            className="flex-1 bg-surface border border-outline text-on-surface hover:bg-surface-container-high rounded-lg min-h-[48px] label-large touch-manipulation"
          >
            Cancel
          </Button>
          <Button 
            size="lg"
            onClick={handleSave}
            className="flex-1 bg-primary hover:bg-primary/90 text-on-primary rounded-lg min-h-[48px] label-large touch-manipulation"
          >
            Confirm
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

type ActiveFilter = { key: keyof ItemFilters; label: string };

function EmptyState({ 
  hasItems, 
  hasSearchOrFilters,
  availableBrands,
  onSearchChange
}: { 
  hasItems: boolean;
  hasSearchOrFilters: boolean;
  availableBrands: string[];
  onSearchChange: (value: string) => void;
}) {
  // If there are items but no search/filters, show suggestions
  if (hasItems && !hasSearchOrFilters) {
    const suggestedBrands = availableBrands.slice(0, 3);
    const suggestedSearches = ['Hoodie', 'Dress', 'Jacket', 'Tops'];
    
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <h3 className="title-large text-on-surface mb-3">Search for items</h3>
          <p className="body-medium text-on-surface-variant mb-6">
            Use the search bar above or apply filters to find specific items. With many items in the system, searching helps you find what you need faster.
          </p>
          
          {suggestedBrands.length > 0 && (
            <div className="mb-6">
              <p className="label-medium text-on-surface-variant mb-3">Try searching by brand:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => onSearchChange(brand)}
                    className="px-4 py-2 bg-surface-container border border-outline-variant rounded-lg label-medium text-on-surface hover:bg-surface-container-high transition-colors"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <p className="label-medium text-on-surface-variant mb-3">Or try searching by item type:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => onSearchChange(term)}
                  className="px-4 py-2 bg-surface-container border border-outline-variant rounded-lg label-medium text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // No items found with search/filters
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center">
        <h3 className="title-medium text-on-surface mb-2">No items found</h3>
        <p className="body-medium text-on-surface-variant">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    </div>
  );
}

function ActiveFiltersDisplay({ 
  filters, 
  onRemoveFilter, 
  onClearAll 
}: { 
  filters: ItemFilters;
  onRemoveFilter: (filterKey: keyof ItemFilters) => void;
  onClearAll: () => void;
}) {
  const activeFilters: ActiveFilter[] = [];
  
  if (filters.brand !== 'all') activeFilters.push({ key: 'brand', label: filters.brand });
  if (filters.category !== 'all') activeFilters.push({ key: 'category', label: filters.category });
  if (filters.status !== 'all') activeFilters.push({ key: 'status', label: filters.status });
  if (filters.colour !== 'all') activeFilters.push({ key: 'colour', label: filters.colour });
  if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1000) {
    activeFilters.push({ 
      key: 'priceRange', 
      label: `${filters.priceRange[0]} - ${filters.priceRange[1]}` 
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant">
      <div className="flex items-center gap-2 mb-2">
        <span className="label-medium text-on-surface-variant">Active filters:</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-primary hover:bg-primary-container/50 focus:bg-primary-container/50 active:bg-primary-container/70 transition-colors px-2 py-1 rounded-[12px] min-h-[28px]"
        >
          Clear all
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter) => (
          <Badge
            key={filter.key}
            variant="secondary"
            className="bg-primary-container text-on-primary-container pr-1 py-1 gap-1"
          >
            <span>{filter.label}</span>
            <button
              onClick={() => onRemoveFilter(filter.key)}
              className="w-4 h-4 rounded-full hover:bg-on-primary-container/20 flex items-center justify-center"
              aria-label={`Remove ${filter.label} filter`}
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

export const initialItems: Item[] = [
  {
    id: 'itm-1001',
    itemId: '684755',
    title: 'Everyday Hoodie',
    brand: 'H&M',
    category: 'Hoodie',
    size: 'M',
    color: 'Gray',
    price: 10,
    status: 'Available',
    date: '2024-11-29',
    deliveryId: 'DEL-1001',
    boxLabel: 'BOX-123456',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1732475530169-70c2cda1712f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob29kaWUlMjBmYXNoaW9ufGVufDF8fHx8MTc2MTE5NDA5MHww&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    daysRemaining: 28,
    lastInStoreAt: '2024-11-29T10:30:00.000Z',
    statusHistory: [
      { status: 'Draft', timestamp: '2024-11-27 09:15', user: 'Anna S.' },
      { status: 'In transit', timestamp: '2024-11-28 15:45', user: 'System' },
      { status: 'Available', timestamp: '2024-11-29 10:30', user: 'Anna S.', note: 'Ready for sale' }
    ]
  },
  {
    id: 'itm-1002',
    itemId: '684754',
    title: 'Summer Dress Capsule',
    brand: 'Weekday',
    category: 'Dresses',
    size: '36',
    color: 'Blue',
    price: 12,
    status: 'In transit',
    date: '2024-12-02',
    deliveryId: 'DEL-1002',
    boxLabel: 'BOX-789012',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1613966570650-add3cf83aa83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBkcmVzc3xlbnwxfHx8fDE3NjEyMDc5MjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'In transit',
    daysRemaining: 32,
    statusHistory: [
      { status: 'Draft', timestamp: '2024-11-30 11:00', user: 'Anna S.' },
      { status: 'In transit', timestamp: '2024-12-02 08:15', user: 'System', note: 'Partner dispatched shipment' }
    ]
  },
  {
    id: 'itm-1003',
    itemId: '684752',
    title: 'Second Chance Shorts',
    brand: 'ARKET',
    category: 'Shorts',
    size: 'M',
    color: 'White',
    price: 5,
    status: 'Available',
    date: '2024-11-20',
    deliveryId: 'DEL-0981',
    sellerName: 'Thrifted',
    source: 'Thrifted',
    thumbnail: 'https://images.unsplash.com/photo-1566228015669-35f772688809?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHNob3J0c3xlbnwxfHx8fDE3NjEyODk0NDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Back of House',
    daysRemaining: 14,
    statusHistory: [
      { status: 'Draft', timestamp: '2024-11-15 14:20', user: 'John D.' },
      { status: 'In transit', timestamp: '2024-11-16 07:10', user: 'System' },
      { status: 'Available', timestamp: '2024-11-17 10:45', user: 'John D.' },
      { status: 'Available', timestamp: '2024-12-01 09:00', user: 'Anna S.', note: 'Temporarily removed from floor' }
    ]
  },
  {
    id: 'itm-1004',
    itemId: '684751',
    title: 'Weekend Tops Bundle',
    brand: 'Monki',
    category: 'Tops',
    size: 'S',
    color: 'Red',
    price: 40,
    status: 'Sold',
    date: '2024-11-10',
    deliveryId: 'DEL-0850',
    sellerName: 'Thrifted',
    source: 'Thrifted',
    thumbnail: 'https://images.unsplash.com/photo-1761090617068-f1b3257d27ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwdG9wc3xlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    daysRemaining: 0,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-05 12:30', user: 'Anna S.' },
      { status: 'Sold', timestamp: '2024-11-08 15:10', user: 'System' }
    ]
  },
  {
    id: 'itm-1005',
    itemId: '684750',
    title: 'Returned Knit Set',
    brand: 'H&M',
    category: 'Tops',
    size: 'L',
    color: 'Green',
    price: 15,
    status: 'Returned',
    date: '2024-11-18',
    deliveryId: 'DEL-0872',
    boxLabel: 'BOX-987654',
    sellerName: 'Shenzhen Fashion Manufacturing',
    source: 'Shenzhen Fashion Manufacturing',
    thumbnail: 'https://images.unsplash.com/photo-1761090617068-f1b3257d27ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwdG9wc3xlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Partner',
    daysRemaining: 0,
    orderType: 'return',
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-07 11:20', user: 'Anna S.' },
      { status: 'Available', timestamp: '2024-11-25 09:00', user: 'System', note: 'Marked for return' },
      { status: 'In transit', timestamp: '2024-11-27 08:45', user: 'System', note: 'Return shipment' },
      { status: 'Returned', timestamp: '2024-12-01 16:32', user: 'Partner Warehouse' }
    ]
  },
  {
    id: 'itm-1006',
    itemId: '684747',
    title: 'Missing Shorts',
    brand: 'COS',
    category: 'Shorts',
    size: 'M',
    color: 'Black',
    price: 18,
    status: 'Missing',
    date: '2024-11-22',
    deliveryId: 'DEL-0902',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1534445347662-670a224a28ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9ydHMlMjBmYXNoaW9ufGVufDF8fHx8MTc2MTI4OTQ0OHww&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    daysRemaining: 18,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-19 09:00', user: 'Anna S.' },
      { status: 'Missing', timestamp: '2024-11-22 14:00', user: 'John D.', note: 'Not found during stock check' }
    ]
  },
  {
    id: 'itm-1007',
    itemId: '684746',
    title: 'Damaged Tee',
    brand: 'ARKET',
    category: 'Tops',
    size: 'S',
    color: 'White',
    price: 22,
    status: 'Broken',
    date: '2024-11-24',
    deliveryId: 'DEL-0910',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1761090617068-f1b3257d27ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwdG9wc3xlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Back of House',
    daysRemaining: 0,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-20 10:00', user: 'Anna S.' },
      { status: 'Broken', timestamp: '2024-11-24 15:00', user: 'John D.', note: 'Zipper damaged' }
    ]
  },
  {
    id: 'itm-1008',
    itemId: '684734',
    title: 'High Waist Trousers',
    brand: 'Weekday',
    category: 'Trousers',
    size: '28',
    color: 'Olive',
    price: 32,
    status: 'Rejected',
    date: '2024-12-02',
    deliveryId: 'DEL-0950',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    lastInStoreAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    thumbnail: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm91c2VycyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    daysRemaining: 0,
    rejectReason: 'Rejected - Broken on arrival',
    statusHistory: [
      { status: 'Available', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), user: 'John D.' },
      { status: 'Rejected', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), user: 'John D.', note: 'Rejected - Broken on arrival' }
    ]
  },
  {
    id: 'itm-1009',
    itemId: '684733',
    title: 'Unshipped Denim Jacket',
    brand: 'Weekday',
    category: 'Jackets',
    size: 'M',
    color: 'Blue',
    price: 38,
    status: 'Draft',
    date: '2024-12-05',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldHxlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Warehouse',
    daysRemaining: 45,
    statusHistory: [
      { status: 'Draft', timestamp: '2024-12-05 08:00', user: 'System', note: 'Awaiting quality check before shipping' }
    ]
  },
  {
    id: 'itm-1010',
    itemId: '684741',
    title: 'Return In Transit Hoodie',
    brand: 'H&M',
    category: 'Hoodie',
    size: 'L',
    color: 'Gray',
    price: 30,
    status: 'In transit',
    date: '2024-12-03',
    orderType: 'return',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1732475530169-70c2cda1712f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob29kaWUlMjBmYXNoaW9ufGVufDF8fHx8MTc2MTE5NDA5MHww&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'In transit',
    daysRemaining: 40,
    statusHistory: [
      { status: 'Available', timestamp: '2024-12-01 08:00', user: 'Anna S.', note: 'Marked for return shipment' },
      { status: 'In transit', timestamp: '2024-12-03 12:00', user: 'System', note: 'Return pickup completed' }
    ]
  },
  {
    id: 'itm-1011',
    itemId: '684742',
    title: 'Postponed Midi Skirt',
    brand: 'Weekday',
    category: 'Skirts',
    size: 'S',
    color: 'Black',
    price: 22,
    status: 'Available',
    date: '2024-06-24',
    deliveryId: 'DEL-0820',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2lydCUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    daysRemaining: 5,
    isExpired: true,
    lastInStoreAt: '2024-06-24T10:00:00.000Z',
    expiredFlaggedAt: '2024-11-30T10:00:00.000Z',
    expiredPostponeWeeks: 8,
    statusHistory: [
      { status: 'Available', timestamp: '2024-06-24 10:00', user: 'Anna S.' },
      { status: 'Available', timestamp: '2024-11-30 10:00', user: 'System', note: 'Expired flag applied' }
    ]
  },
  // Weekday Sweden Drottninggatan items with different statuses
  {
    id: 'itm-1012',
    itemId: '684731',
    title: 'Classic Denim Jacket',
    brand: 'Weekday',
    category: 'Jackets',
    size: 'L',
    color: 'Light Wash',
    price: 45,
    status: 'Available',
    date: '2024-11-28',
    deliveryId: 'DEL-0920',
    boxLabel: 'BOX-456789',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldHxlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Back of House',
    daysRemaining: 12,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-20 10:00', user: 'Anna S.' },
      { status: 'Available', timestamp: '2024-11-28 14:30', user: 'Anna S.', note: 'Temporarily moved to storage' }
    ]
  },
  {
    id: 'itm-1013',
    itemId: '684730',
    title: 'Oversized T-Shirt',
    brand: 'Weekday',
    category: 'Tops',
    size: 'M',
    color: 'White',
    price: 12,
    status: 'Available',
    date: '2024-12-01',
    deliveryId: 'DEL-0930',
    boxLabel: 'BOX-234567',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0c2hpcnQlMjBzdHJpcGVkfGVufDF8fHx8MTc2MTI4OTQ0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    lastInStoreAt: '2024-12-01T10:00:00.000Z',
    daysRemaining: 39,
    statusHistory: [
      { status: 'Draft', timestamp: '2024-11-28 08:00', user: 'System' },
      { status: 'In transit', timestamp: '2024-11-30 09:15', user: 'System' },
      { status: 'Available', timestamp: '2024-12-01 10:00', user: 'Anna S.' }
    ]
  },
  // Weekday Drottninggatan - item that can be rejected (Available, within 24h of lastInStoreAt)
  {
    id: 'itm-1013b',
    itemId: '684729b',
    title: 'Striped Cotton Blouse',
    brand: 'Weekday',
    category: 'Tops',
    size: 'S',
    color: 'Navy',
    price: 18,
    status: 'Available',
    date: new Date().toISOString().slice(0, 10),
    deliveryId: 'DEL-0931',
    boxLabel: 'BOX-234568',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1564257631407-2f7691c9d78d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    lastInStoreAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    daysRemaining: 42,
    statusHistory: (() => {
      const availTs = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const transitTs = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return [
        { status: 'In transit', timestamp: transitTs.toISOString().slice(0, 16).replace('T', ' '), user: 'System' },
        { status: 'Available', timestamp: availTs.toISOString().slice(0, 16).replace('T', ' '), user: 'Anna S.' }
      ];
    })()
  },
  {
    id: 'itm-1014',
    itemId: '684729',
    title: 'Wide Leg Jeans',
    brand: 'Weekday',
    category: 'Trousers',
    size: '30/32',
    color: 'Dark Blue',
    price: 35,
    status: 'Available',
    date: '2024-11-25',
    deliveryId: 'DEL-0910',
    boxLabel: 'BOX-111222',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1542272604-787c3835535d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZWFucyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Back of House',
    daysRemaining: 15,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-18 11:00', user: 'Anna S.' },
      { status: 'Available', timestamp: '2024-11-25 16:00', user: 'John D.', note: 'Seasonal rotation' }
    ]
  },
  {
    id: 'itm-1015',
    itemId: '684728',
    title: 'Knit Cardigan',
    brand: 'Weekday',
    category: 'Knitwear',
    size: 'S',
    color: 'Beige',
    price: 28,
    status: 'Sold',
    date: '2024-11-22',
    deliveryId: 'DEL-0890',
    boxLabel: 'BOX-333444',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJkaWdhbiUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    daysRemaining: 0,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-15 09:30', user: 'Anna S.' },
      { status: 'Sold', timestamp: '2024-11-22 14:20', user: 'System' }
    ]
  },
  {
    id: 'itm-1016',
    itemId: '684727',
    title: 'Midi Skirt',
    brand: 'Weekday',
    category: 'Skirts',
    size: 'M',
    color: 'Black',
    price: 20,
    status: 'Available',
    date: '2024-11-20',
    deliveryId: 'DEL-0880',
    boxLabel: 'BOX-555666',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2lydCUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Back of House',
    daysRemaining: 20,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-12 10:00', user: 'Anna S.' },
      { status: 'Available', timestamp: '2024-11-20 15:00', user: 'Anna S.', note: 'Space optimization' }
    ]
  },
  {
    id: 'itm-1017',
    itemId: '684726',
    title: 'Cropped Hoodie',
    brand: 'Weekday',
    category: 'Hoodie',
    size: 'XS',
    color: 'Light Grey',
    price: 22,
    status: 'In transit',
    date: '2024-12-04',
    deliveryId: 'DEL-0940',
    boxLabel: 'BOX-112233',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob29kaWUlMjBmYXNoaW9ufGVufDF8fHx8MTc2MTI4OTQ0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'In transit',
    daysRemaining: 36,
    statusHistory: [
      { status: 'Draft', timestamp: '2024-12-01 08:00', user: 'System' },
      { status: 'In transit', timestamp: '2024-12-04 07:30', user: 'System', note: 'Partner dispatched shipment' }
    ]
  },
  {
    id: 'itm-1018',
    itemId: '684725',
    title: 'Denim Jacket',
    brand: 'Weekday',
    category: 'Jackets',
    size: 'M',
    color: 'Light Wash',
    price: 40,
    status: 'Missing',
    date: '2024-11-15',
    deliveryId: 'DEL-0860',
    boxLabel: 'BOX-777888',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldHxlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    daysRemaining: 25,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-10 09:00', user: 'Anna S.' },
      { status: 'Missing', timestamp: '2024-11-15 16:00', user: 'John D.', note: 'Item not found during inventory check' }
    ]
  },
  {
    id: 'itm-1019',
    itemId: '684724',
    title: 'Turtleneck Sweater',
    brand: 'Weekday',
    category: 'Knitwear',
    size: 'M',
    color: 'Cream',
    price: 30,
    status: 'Broken',
    date: '2024-11-18',
    deliveryId: 'DEL-0870',
    boxLabel: 'BOX-999000',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2VhdGVyJTIwZmFzaGlvbnxlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    daysRemaining: 22,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-12 10:00', user: 'Anna S.' },
      { status: 'Broken', timestamp: '2024-11-18 14:00', user: 'Anna S.', note: 'Damaged during handling' }
    ]
  },
  {
    id: 'itm-1020',
    itemId: '684723',
    title: 'High Waist Trousers',
    brand: 'Weekday',
    category: 'Trousers',
    size: '28',
    color: 'Olive',
    price: 32,
    status: 'Draft',
    date: '2024-12-05',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm91c2VycyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Warehouse',
    daysRemaining: 45,
    statusHistory: [
      { status: 'Draft', timestamp: '2024-12-05 08:00', user: 'System', note: 'Awaiting quality check' }
    ]
  },
  {
    id: 'itm-1021',
    itemId: '684722',
    title: 'Basic White Tee',
    brand: 'Weekday',
    category: 'Tops',
    size: 'S',
    color: 'White',
    price: 8,
    status: 'Available',
    date: '2024-12-03',
    deliveryId: 'DEL-0950',
    boxLabel: 'BOX-445566',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0c2hpcnQlMjBzdHJpcGVkfGVufDF8fHx8MTc2MTI4OTQ0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    lastInStoreAt: '2024-12-03T09:00:00.000Z',
    daysRemaining: 37,
    statusHistory: [
      { status: 'Draft', timestamp: '2024-11-30 10:00', user: 'System' },
      { status: 'In transit', timestamp: '2024-12-02 08:00', user: 'System' },
      { status: 'Available', timestamp: '2024-12-03 09:00', user: 'Anna S.' }
    ]
  },
  {
    id: 'itm-1022',
    itemId: '684721',
    title: 'Straight Leg Jeans',
    brand: 'Weekday',
    category: 'Trousers',
    size: '32',
    color: 'Black',
    price: 38,
    status: 'Available',
    date: '2024-11-30',
    deliveryId: 'DEL-0960',
    boxLabel: 'BOX-667788',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1542272604-787c3835535d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZWFucyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    lastInStoreAt: '2024-11-30T11:00:00.000Z',
    daysRemaining: 40,
    statusHistory: [
      { status: 'Draft', timestamp: '2024-11-27 09:00', user: 'System' },
      { status: 'In transit', timestamp: '2024-11-29 07:00', user: 'System' },
      { status: 'Available', timestamp: '2024-11-30 11:00', user: 'Anna S.' }
    ]
  },
  {
    id: 'itm-1023',
    itemId: '684720',
    title: 'Oversized Blazer',
    brand: 'Weekday',
    category: 'Jackets',
    size: 'M',
    color: 'Navy',
    price: 55,
    status: 'Available',
    date: '2024-12-01',
    deliveryId: 'DEL-0970',
    boxLabel: 'BOX-889900',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldHxlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    lastInStoreAt: '2024-12-01T10:30:00.000Z',
    daysRemaining: 39,
    statusHistory: [
      { status: 'Draft', timestamp: '2024-11-28 08:00', user: 'System' },
      { status: 'In transit', timestamp: '2024-11-30 09:00', user: 'System' },
      { status: 'Available', timestamp: '2024-12-01 10:30', user: 'Anna S.' }
    ]
  },
  {
    id: 'itm-1024',
    itemId: '684719',
    title: 'Ribbed Tank Top',
    brand: 'Weekday',
    category: 'Tops',
    size: 'L',
    color: 'Beige',
    price: 10,
    status: 'In transit',
    date: '2024-12-05',
    deliveryId: 'DEL-0980',
    boxLabel: 'BOX-001122',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0c2hpcnQlMjBzdHJpcGVkfGVufDF8fHx8MTc2MTI4OTQ0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'In transit',
    daysRemaining: 45,
    statusHistory: [
      { status: 'Draft', timestamp: '2024-12-02 08:00', user: 'System' },
      { status: 'In transit', timestamp: '2024-12-05 07:00', user: 'System', note: 'Partner dispatched shipment' }
    ]
  },
  {
    id: 'itm-1025',
    itemId: '684718',
    title: 'Cargo Pants',
    brand: 'Weekday',
    category: 'Trousers',
    size: '30',
    color: 'Olive',
    price: 42,
    status: 'Available',
    date: '2024-11-22',
    deliveryId: 'DEL-0990',
    boxLabel: 'BOX-334455',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm91c2VycyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Back of House',
    daysRemaining: 18,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-15 10:00', user: 'Anna S.' },
      { status: 'Available', timestamp: '2024-11-22 14:00', user: 'John D.', note: 'Seasonal storage' }
    ]
  },
  {
    id: 'itm-1026',
    itemId: '684717',
    title: 'Knit Sweater',
    brand: 'Weekday',
    category: 'Knitwear',
    size: 'M',
    color: 'Gray',
    price: 32,
    status: 'Sold',
    date: '2024-11-20',
    deliveryId: 'DEL-1000',
    boxLabel: 'BOX-556677',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2VhdGVyJTIwZmFzaGlvbnxlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    daysRemaining: 0,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-13 09:00', user: 'Anna S.' },
      { status: 'Sold', timestamp: '2024-11-20 15:30', user: 'System' }
    ]
  },
  {
    id: 'itm-1027',
    itemId: '684716',
    title: 'Mini Skirt',
    brand: 'Weekday',
    category: 'Skirts',
    size: 'S',
    color: 'Pink',
    price: 18,
    status: 'Available',
    date: '2024-11-28',
    deliveryId: 'DEL-1010',
    boxLabel: 'BOX-778899',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2lydCUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    lastInStoreAt: '2024-11-28T10:00:00.000Z',
    daysRemaining: 32,
    statusHistory: [
      { status: 'Draft', timestamp: '2024-11-25 08:00', user: 'System' },
      { status: 'In transit', timestamp: '2024-11-27 07:00', user: 'System' },
      { status: 'Available', timestamp: '2024-11-28 10:00', user: 'Anna S.' }
    ]
  },
  {
    id: 'itm-1028',
    itemId: '684715',
    title: 'Zip Hoodie',
    brand: 'Weekday',
    category: 'Hoodie',
    size: 'L',
    color: 'Black',
    price: 28,
    status: 'Missing',
    date: '2024-11-18',
    deliveryId: 'DEL-1020',
    boxLabel: 'BOX-990011',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob29kaWUlMjBmYXNoaW9ufGVufDF8fHx8MTc2MTI4OTQ0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    daysRemaining: 22,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-12 09:00', user: 'Anna S.' },
      { status: 'Missing', timestamp: '2024-11-18 16:00', user: 'John D.', note: 'Not found during inventory check' }
    ]
  },
  {
    id: 'itm-1029',
    itemId: '684714',
    title: 'Wool Coat',
    brand: 'Weekday',
    category: 'Coats',
    size: 'M',
    color: 'Camel',
    price: 75,
    status: 'Broken',
    date: '2024-11-25',
    deliveryId: 'DEL-1030',
    boxLabel: 'BOX-223344',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldHxlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    daysRemaining: 15,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-18 10:00', user: 'Anna S.' },
      { status: 'Broken', timestamp: '2024-11-25 13:00', user: 'Anna S.', note: 'Button missing' }
    ]
  },
  {
    id: 'itm-1028',
    itemId: '684713',
    title: 'Crop Top',
    brand: 'Weekday',
    category: 'Tops',
    size: 'XS',
    color: 'Red',
    price: 9,
    status: 'Returned',
    date: '2024-11-15',
    deliveryId: 'DEL-1040',
    boxLabel: 'BOX-445566',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0c2hpcnQlMjBzdHJpcGVkfGVufDF8fHx8MTc2MTI4OTQ0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Partner',
    daysRemaining: 0,
    orderType: 'return',
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-05 10:00', user: 'Anna S.' },
      { status: 'Sold', timestamp: '2024-11-08 14:00', user: 'System' },
      { status: 'In transit', timestamp: '2024-11-12 08:00', user: 'System', note: 'Return shipment' },
      { status: 'Returned', timestamp: '2024-11-15 16:00', user: 'Partner Warehouse' }
    ]
  },
  {
    id: 'itm-1031',
    itemId: '684712',
    title: 'Denim Shorts',
    brand: 'Weekday',
    category: 'Shorts',
    size: '28',
    color: 'Light Blue',
    price: 25,
    status: 'Available',
    date: '2024-12-02',
    deliveryId: 'DEL-1050',
    boxLabel: 'BOX-667788',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1566228015669-35f772688809?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHNob3J0c3xlbnwxfHx8fDE3NjEyODk0NDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    lastInStoreAt: '2024-12-02T09:30:00.000Z',
    daysRemaining: 38,
    statusHistory: [
      { status: 'Draft', timestamp: '2024-11-29 08:00', user: 'System' },
      { status: 'In transit', timestamp: '2024-12-01 07:00', user: 'System' },
      { status: 'Available', timestamp: '2024-12-02 09:30', user: 'Anna S.' }
    ]
  },
  {
    id: 'itm-1032',
    itemId: '684711',
    title: 'Puffer Jacket',
    brand: 'Weekday',
    category: 'Jackets',
    size: 'L',
    color: 'Black',
    price: 65,
    status: 'Draft',
    date: '2024-12-06',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldHxlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Warehouse',
    daysRemaining: 45,
    statusHistory: [
      { status: 'Draft', timestamp: '2024-12-06 08:00', user: 'System', note: 'Awaiting quality check' }
    ]
  },
  {
    id: 'itm-1033',
    itemId: '684710',
    title: 'Striped Shirt',
    brand: 'Weekday',
    category: 'Tops',
    size: 'M',
    color: 'Blue/White',
    price: 15,
    status: 'Available',
    date: '2024-11-26',
    deliveryId: 'DEL-1060',
    boxLabel: 'BOX-889900',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0c2hpcnQlMjBzdHJpcGVkfGVufDF8fHx8MTc2MTI4OTQ0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Back of House',
    daysRemaining: 14,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-19 10:00', user: 'Anna S.' },
      { status: 'Available', timestamp: '2024-11-26 15:00', user: 'John D.', note: 'Space optimization' }
    ]
  },
  {
    id: 'itm-1034',
    itemId: '684709',
    title: 'Pleated Skirt',
    brand: 'Weekday',
    category: 'Skirts',
    size: 'M',
    color: 'Navy',
    price: 22,
    status: 'Sold',
    date: '2024-11-19',
    deliveryId: 'DEL-1070',
    boxLabel: 'BOX-001122',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2lydCUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    daysRemaining: 0,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-12 09:00', user: 'Anna S.' },
      { status: 'Sold', timestamp: '2024-11-19 16:00', user: 'System' }
    ]
  },
  {
    id: 'itm-1035',
    itemId: '684708',
    title: 'Cable Knit Sweater',
    brand: 'Weekday',
    category: 'Knitwear',
    size: 'L',
    color: 'Cream',
    price: 35,
    status: 'In transit',
    date: '2024-12-05',
    deliveryId: 'DEL-1080',
    boxLabel: 'BOX-334455',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2VhdGVyJTIwZmFzaGlvbnxlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'In transit',
    daysRemaining: 45,
    statusHistory: [
      { status: 'Draft', timestamp: '2024-12-02 08:00', user: 'System' },
      { status: 'In transit', timestamp: '2024-12-05 07:00', user: 'System', note: 'Partner dispatched shipment' }
    ]
  },
  {
    id: 'itm-1036',
    itemId: '684707',
    title: 'Wide Leg Trousers',
    brand: 'Weekday',
    category: 'Trousers',
    size: '32',
    color: 'Beige',
    price: 40,
    status: 'Available',
    date: '2024-11-29',
    deliveryId: 'DEL-1090',
    boxLabel: 'BOX-556677',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm91c2VycyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    lastInStoreAt: '2024-11-29T10:00:00.000Z',
    daysRemaining: 31,
    statusHistory: [
      { status: 'Draft', timestamp: '2024-11-26 08:00', user: 'System' },
      { status: 'In transit', timestamp: '2024-11-28 07:00', user: 'System' },
      { status: 'Available', timestamp: '2024-11-29 10:00', user: 'Anna S.' }
    ]
  },
  {
    id: 'itm-1037',
    itemId: '684706',
    title: 'Bomber Jacket',
    brand: 'Weekday',
    category: 'Jackets',
    size: 'S',
    color: 'Green',
    price: 48,
    status: 'Missing',
    date: '2024-11-20',
    deliveryId: 'DEL-1100',
    boxLabel: 'BOX-778899',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldHxlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    daysRemaining: 20,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-14 09:00', user: 'Anna S.' },
      { status: 'Missing', timestamp: '2024-11-20 17:00', user: 'John D.', note: 'Not found during inventory check' }
    ]
  },
  {
    id: 'itm-1038',
    itemId: '684705',
    title: 'Turtleneck Top',
    brand: 'Weekday',
    category: 'Tops',
    size: 'M',
    color: 'Black',
    price: 14,
    status: 'Broken',
    date: '2024-11-23',
    deliveryId: 'DEL-1110',
    boxLabel: 'BOX-990011',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0c2hpcnQlMjBzdHJpcGVkfGVufDF8fHx8MTc2MTI4OTQ0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    daysRemaining: 17,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-16 10:00', user: 'Anna S.' },
      { status: 'Broken', timestamp: '2024-11-23 14:00', user: 'Anna S.', note: 'Seam coming apart' }
    ]
  },
  {
    id: 'itm-1039',
    itemId: '684704',
    title: 'Corduroy Pants',
    brand: 'Weekday',
    category: 'Trousers',
    size: '30',
    color: 'Brown',
    price: 36,
    status: 'Available',
    date: '2024-11-24',
    deliveryId: 'DEL-1120',
    boxLabel: 'BOX-223344',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm91c2VycyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Back of House',
    daysRemaining: 16,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-17 10:00', user: 'Anna S.' },
      { status: 'Available', timestamp: '2024-11-24 15:00', user: 'John D.', note: 'Seasonal storage' }
    ]
  },
  {
    id: 'itm-1040',
    itemId: '684703',
    title: 'Long Sleeve Tee',
    brand: 'Weekday',
    category: 'Tops',
    size: 'L',
    color: 'Gray',
    price: 12,
    status: 'Available',
    date: '2024-12-04',
    deliveryId: 'DEL-1130',
    boxLabel: 'BOX-445566',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0c2hpcnQlMjBzdHJpcGVkfGVufDF8fHx8MTc2MTI4OTQ0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    lastInStoreAt: '2024-12-04T09:00:00.000Z',
    daysRemaining: 36,
    statusHistory: [
      { status: 'Draft', timestamp: '2024-12-01 08:00', user: 'System' },
      { status: 'In transit', timestamp: '2024-12-03 07:00', user: 'System' },
      { status: 'Available', timestamp: '2024-12-04 09:00', user: 'Anna S.' }
    ]
  },
  // H&M Sweden Sergels Torg items with different statuses
  {
    id: 'itm-1052',
    itemId: '684710',
    title: 'Basic T-Shirt',
    brand: 'H&M',
    category: 'Tops',
    size: 'L',
    color: 'White',
    price: 8,
    status: 'Available',
    date: '2024-11-25',
    deliveryId: 'DEL-1020',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0c2hpcnQlMjBzdHJpcGVkfGVufDF8fHx8MTc2MTI4OTQ0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Back of House',
    daysRemaining: 15,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-18 10:00', user: 'Anna S.' },
      { status: 'Available', timestamp: '2024-11-25 16:00', user: 'John D.', note: 'Overstock management' }
    ]
  },
  {
    id: 'itm-1053',
    itemId: '684709',
    title: 'Denim Jacket',
    brand: 'H&M',
    category: 'Jackets',
    size: 'M',
    color: 'Blue',
    price: 35,
    status: 'Available',
    date: '2024-12-02',
    deliveryId: 'DEL-1030',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldHxlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    lastInStoreAt: '2024-12-02T10:00:00.000Z',
    daysRemaining: 38,
    statusHistory: [
      { status: 'Draft', timestamp: '2024-11-30 08:00', user: 'System' },
      { status: 'In transit', timestamp: '2024-12-01 09:15', user: 'System' },
      { status: 'Available', timestamp: '2024-12-02 10:00', user: 'Anna S.' }
    ]
  },
  {
    id: 'itm-1054',
    itemId: '684708',
    title: 'Slim Fit Jeans',
    brand: 'H&M',
    category: 'Trousers',
    size: '32/32',
    color: 'Dark Blue',
    price: 25,
    status: 'Available',
    date: '2024-11-20',
    deliveryId: 'DEL-1015',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1542272604-787c3835535d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZWFucyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Back of House',
    daysRemaining: 20,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-12 11:00', user: 'Anna S.' },
      { status: 'Available', timestamp: '2024-11-20 15:00', user: 'John D.', note: 'Inventory rotation' }
    ]
  },
  {
    id: 'itm-1055',
    itemId: '684707',
    title: 'Knit Cardigan',
    brand: 'H&M',
    category: 'Knitwear',
    size: 'S',
    color: 'Beige',
    price: 22,
    status: 'Sold',
    date: '2024-11-18',
    deliveryId: 'DEL-1005',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJkaWdhbiUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    daysRemaining: 0,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-10 09:30', user: 'Anna S.' },
      { status: 'Sold', timestamp: '2024-11-18 14:20', user: 'System' }
    ]
  },
  {
    id: 'itm-1056',
    itemId: '684706',
    title: 'Midi Dress',
    brand: 'H&M',
    category: 'Dresses',
    size: 'M',
    color: 'Black',
    price: 18,
    status: 'Available',
    date: '2024-11-22',
    deliveryId: 'DEL-1012',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmVzcyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Back of House',
    daysRemaining: 18,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-15 10:00', user: 'Anna S.' },
      { status: 'Available', timestamp: '2024-11-22 14:00', user: 'Anna S.', note: 'Space optimization' }
    ]
  },
  {
    id: 'itm-1057',
    itemId: '684705',
    title: 'Hooded Sweatshirt',
    brand: 'H&M',
    category: 'Hoodie',
    size: 'XL',
    color: 'Navy',
    price: 15,
    status: 'In transit',
    date: '2024-12-05',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob29kaWUlMjBmYXNoaW9ufGVufDF8fHx8MTc2MTI4OTQ0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'In transit',
    daysRemaining: 35,
    statusHistory: [
      { status: 'Draft', timestamp: '2024-12-02 08:00', user: 'System' },
      { status: 'In transit', timestamp: '2024-12-05 07:30', user: 'System', note: 'Partner dispatched shipment' }
    ]
  },
  {
    id: 'itm-1058',
    itemId: '684704',
    title: 'Leather Jacket',
    brand: 'H&M',
    category: 'Jackets',
    size: 'L',
    color: 'Black',
    price: 45,
    status: 'Missing',
    date: '2024-11-12',
    deliveryId: 'DEL-0995',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldHxlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    daysRemaining: 28,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-08 09:00', user: 'Anna S.' },
      { status: 'Missing', timestamp: '2024-11-12 16:00', user: 'John D.', note: 'Item not found during inventory check' }
    ]
  },
  {
    id: 'itm-1059',
    itemId: '684703',
    title: 'Wool Sweater',
    brand: 'H&M',
    category: 'Knitwear',
    size: 'M',
    color: 'Gray',
    price: 20,
    status: 'Broken',
    date: '2024-11-15',
    deliveryId: 'DEL-1000',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2VhdGVyJTIwZmFzaGlvbnxlbnwxfHx8MTc2MTI4OTQ0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    daysRemaining: 25,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-10 10:00', user: 'Anna S.' },
      { status: 'Broken', timestamp: '2024-11-15 14:00', user: 'Anna S.', note: 'Damaged during handling' }
    ]
  },
  {
    id: 'itm-1060',
    itemId: '684702',
    title: 'Chino Pants',
    brand: 'H&M',
    category: 'Trousers',
    size: '30',
    color: 'Khaki',
    price: 28,
    status: 'Draft',
    date: '2024-12-06',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm91c2VycyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Warehouse',
    daysRemaining: 44,
    statusHistory: [
      { status: 'Draft', timestamp: '2024-12-06 08:00', user: 'System', note: 'Awaiting quality check' }
    ]
  },
  {
    id: 'itm-1061',
    itemId: '684701',
    title: 'Striped T-Shirt',
    brand: 'H&M',
    category: 'Tops',
    size: 'S',
    color: 'Blue/White',
    price: 9,
    status: 'Available',
    date: '2024-11-30',
    deliveryId: 'DEL-1025',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0c2hpcnQlMjBzdHJpcGVkfGVufDF8fHx8MTc2MTI4OTQ0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    lastInStoreAt: '2024-11-30T10:00:00.000Z',
    daysRemaining: 30,
    statusHistory: [
      { status: 'Draft', timestamp: '2024-11-27 08:00', user: 'System' },
      { status: 'In transit', timestamp: '2024-11-29 09:15', user: 'System' },
      { status: 'Available', timestamp: '2024-11-30 10:00', user: 'Anna S.' }
    ]
  },
  {
    id: 'itm-1062',
    itemId: '684700',
    title: 'A-Line Skirt',
    brand: 'H&M',
    category: 'Skirts',
    size: 'M',
    color: 'Navy',
    price: 12,
    status: 'Returned',
    date: '2024-11-10',
    deliveryId: 'DEL-0985',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2lydCUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Shopfloor',
    daysRemaining: 40,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-05 09:00', user: 'Anna S.' },
      { status: 'Sold', timestamp: '2024-11-08 14:00', user: 'System' },
      { status: 'Returned', timestamp: '2024-11-10 16:00', user: 'System', note: 'Customer return' }
    ]
  }
];
function MultiSelectActions({
  selectedCount,
  totalCount,
  isAllSelected,
  onSelectAll,
  bulkQuickActions,
  onBulkQuickAction,
}: {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  onSelectAll: () => void;
  bulkQuickActions: Array<{ action: ItemQuickAction; label: string; className?: string }>;
  onBulkQuickAction: (action: ItemQuickAction) => void;
}) {
  // Don't show if there are no items
  if (totalCount === 0) return null;

  const hasSelectedItems = selectedCount > 0;

  return (
    <div className="border-t border-outline-variant">
      <div className="flex items-center justify-between px-1 py-3 min-h-[48px]">
        {/* Left side - Select all and count */}
        <div className="flex items-center gap-3">
          <button 
            className="p-3 rounded-lg hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors min-w-[48px] min-h-[48px] touch-manipulation"
            onClick={onSelectAll}
            aria-label={isAllSelected ? "Deselect all items" : "Select all items"}
          >
            <div className="relative w-6 h-6">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
                <path 
                  clipRule="evenodd" 
                  d={isAllSelected ? svgPaths.p181a1800 : svgPaths.p3e435600} 
                  fill={isAllSelected ? "var(--primary)" : "var(--outline-variant)"} 
                  fillRule="evenodd" 
                />
              </svg>
              {isAllSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="white" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
          
          <div className="body-medium text-on-surface font-normal">
            {hasSelectedItems 
              ? `${selectedCount} selected`
              : `${totalCount} ${totalCount === 1 ? 'item' : 'items'}`
            }
          </div>
        </div>
        
        {hasSelectedItems && bulkQuickActions.length > 0 && (
        <div className="flex items-center justify-center h-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="p-3 rounded-lg hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
                aria-label="Bulk actions"
              >
                <svg className="w-6 h-6" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                  <path d={svgPathsNew.p3fdba000} fill="var(--on-surface)" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Bulk actions{HIGHLIGHT_NEW && <span className="new-badge">NEW</span>}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {bulkQuickActions.map(({ action, label, className }) => (
                <DropdownMenuItem
                  key={action}
                  onClick={() => onBulkQuickAction(action)}
                  className={className}
                >
                  {quickActionIcon(action)}
                  <span>{label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        )}
      </div>
    </div>
  );
}

export default function ItemsScreen({
  userRole = 'store-staff',
  currentPartnerWarehouseSelection,
  partners,
  viewFilter: externalViewFilter,
  onViewFilterChange: externalOnViewFilterChange,
  brands = [] as BrandRecord[],
  countries = [] as CountryRecord[],
  stores = [] as StoreRecord[],
  onCreateReturn,
  expireTimeWeeks,
  onNavigateToScan
}: ItemsScreenProps) {
  const [quickFilter, setQuickFilter] = useState('all');
  const [quickSearchTerm, setQuickSearchTerm] = useState('');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [itemFilters, setItemFilters] = useState<ItemFilters>(defaultFilters);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<Item | null>(null);
  const [bulkUnflagItemIds, setBulkUnflagItemIds] = useState<string[] | null>(null);
  const [bulkRejectItemIds, setBulkRejectItemIds] = useState<string[] | null>(null);
  const isDesktop = useMediaQuery('(min-width: 1024px)'); // Tailwind lg

  // Desktop table sorting (store app Items screen)
  type SortDirection = 'asc' | 'desc' | null;
  type ItemsSortField =
    | 'date'
    | 'itemId'
    | 'brand'
    | 'category'
    | 'size'
    | 'color'
    | 'delivery'
    | 'boxLabel'
    | 'partner'
    | 'daysInStore'
    | 'price'
    | 'status';

  const [itemsSort, setItemsSort] = useState<{ field: ItemsSortField; direction: SortDirection }>({
    field: 'date',
    direction: null,
  });

  const handleItemsSort = (field: ItemsSortField) => {
    setItemsSort((prev) => ({
      field,
      direction:
        prev.field === field
          ? (prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc')
          : 'asc',
    }));
  };

  const SortableHeader = ({
    field,
    label,
    align = 'left',
  }: {
    field: ItemsSortField;
    label: string;
    align?: 'left' | 'right';
  }) => {
    const isActive = itemsSort.field === field;
    const direction = isActive ? itemsSort.direction : null;
    return (
      <th
        className={`px-3 py-3 ${align === 'right' ? 'text-right' : 'text-left'} title-small text-on-surface cursor-pointer hover:bg-surface-container transition-colors`}
        onClick={() => handleItemsSort(field)}
      >
        <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : ''}`}>
          <span>{label}</span>
          <div className="flex flex-col">
            <ArrowUp
              size={12}
              className={direction === 'asc' ? 'text-primary' : 'text-on-surface-variant opacity-30'}
            />
            <ArrowDown
              size={12}
              className={direction === 'desc' ? 'text-primary' : 'text-on-surface-variant opacity-30'}
              style={{ marginTop: '-4px' }}
            />
          </div>
        </div>
      </th>
    );
  };
  
  // Pagination state for performance with large item lists
  const [loadedItemsCount, setLoadedItemsCount] = useState(50);
  const ITEMS_PER_PAGE = 50;

  const partnerIdForPricing = currentPartnerWarehouseSelection?.partnerId;

  const partnerOptions = useMemo(
    () =>
      (partners ?? []).map((partner) => ({
        ...partner,
        code: (partner as { code?: string }).code ?? partner.id
      })),
    [partners]
  );

  const partnerPriceOptions = useMemo(() => {
    if (!selectedItemForDetails || !partnerIdForPricing) {
      return [];
    }
    return getSekPriceOptions(partnerIdForPricing, selectedItemForDetails.brand);
  }, [partnerIdForPricing, selectedItemForDetails]);
  const [showStatusUpdateDialog, setShowStatusUpdateDialog] = useState(false);
  const [itemToUpdateStatus, setItemToUpdateStatus] = useState<Item | null>(null);
  const [showRejectSheet, setShowRejectSheet] = useState(false);
  const [itemToReject, setItemToReject] = useState<Item | null>(null);
  const [showUnflagExpiredSheet, setShowUnflagExpiredSheet] = useState(false);
  const [itemToUnflagExpired, setItemToUnflagExpired] = useState<Item | null>(null);
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

  const formatTimestamp = (date: Date | string = new Date()) => {
    const value = typeof date === 'string' ? normalizeTimestamp(date) : date;
    return new Date(value).toLocaleString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  };

  const normalizeTimestamp = (value: string) => {
    if (value.includes('T')) return value;
    const sanitized = value.replace(' ', 'T');
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(sanitized) ? `${sanitized}:00` : sanitized;
  };

  const getLastInStoreTimestamp = (item: Item): number | undefined => {
    if (item.lastInStoreAt) {
      const parsed = Date.parse(item.lastInStoreAt);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    if (item.statusHistory && item.statusHistory.length) {
      for (let i = item.statusHistory.length - 1; i >= 0; i--) {
        const entry = item.statusHistory[i];
        if (!entry) {
          continue;
        }
        if (entry.status?.toLowerCase() === 'in store' && entry.timestamp) {
          const parsed = Date.parse(normalizeTimestamp(entry.timestamp));
          if (!Number.isNaN(parsed)) {
            return parsed;
          }
        }
      }
    }
    return undefined;
  };

  const canRejectItem = (item: Item) => {
    if (userRole !== 'admin') return false;
    if (item.status !== 'Available') return false;
    const timestamp = getLastInStoreTimestamp(item);
    if (timestamp === undefined) return false;
    return Date.now() - timestamp <= TWENTY_FOUR_HOURS_MS;
  };
  
  // Use shared filter state for partner portal, local state for store staff
  const [localViewFilter, setLocalViewFilter] = useState<ViewFilter>({
    mode: 'by-partner',
    partnerId: currentPartnerWarehouseSelection?.partnerId
  });
  
  // Use external filter if provided (partner portal), otherwise use local
  const viewFilter = externalViewFilter || localViewFilter;
  const setViewFilter = externalOnViewFilterChange || setLocalViewFilter;
  
  // Get current partner name for filtering
  const currentPartnerName = useMemo(() => {
    if (!currentPartnerWarehouseSelection?.partnerId || !partners) return null;
    const partner = partners.find(p => p.id === currentPartnerWarehouseSelection.partnerId);
    return partner?.name || null;
  }, [currentPartnerWarehouseSelection, partners]);

  // Check if we're in partner portal mode - only show filter if viewFilter/onViewFilterChange are provided
  // These props are only provided for partner portal, not for store app
  const isPartnerPortal = !!(externalViewFilter && externalOnViewFilterChange);

  useEffect(() => {
    if (
      !isPartnerPortal &&
      quickFilter !== 'all' &&
      quickFilter !== 'available' &&
      quickFilter !== 'storage' &&
      quickFilter !== 'expired'
    ) {
      setQuickFilter('all');
    }
  }, [isPartnerPortal, quickFilter]);

  // Initialize items with a deep copy to prevent mutations to initialItems
  // Also ensure no duplicate items by ID
  const [items, setItems] = useState<Item[]>(() => {
    const copied = JSON.parse(JSON.stringify(initialItems));
    // Remove duplicates by ID (keep first occurrence)
    const seen = new Set<string>();
    return copied.filter((item: Item) => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });
  });

  useEffect(() => {
    setItems(prev => {
      // Ensure no duplicates before processing
      const seen = new Set<string>();
      const unique = prev.filter(item => {
        if (seen.has(item.id)) {
          return false;
        }
        seen.add(item.id);
        return true;
      });
      
      return unique.map(item => {
        if (item.status === 'Available' && !item.lastInStoreAt) {
          const timestamp = getLastInStoreTimestamp(item);
          const iso = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();
          return { ...item, lastInStoreAt: iso };
        }
        return item;
      });
    });
  }, []);

  // Apply all filters and search
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (item.isArchived) {
        return false;
      }
      if (!isPartnerPortal && item.status && STORE_HIDDEN_STATUS_SET.has(item.status)) {
        return false;
      }
      // Partner filter: only apply in partner portal mode
      // In store app mode, show all items regardless of sellerName
      const matchesPartner = isPartnerPortal 
        ? (!currentPartnerName || !item.sellerName || item.sellerName === currentPartnerName)
        : true;
      
      // Quick search
      const matchesQuickSearch = quickSearchTerm === '' || 
        item.itemId.toLowerCase().includes(quickSearchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(quickSearchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(quickSearchTerm.toLowerCase());
      
      // Quick filter chips
      let matchesQuickFilter = false;
      if (quickFilter === 'all') {
        matchesQuickFilter = true;
      } else if (isPartnerPortal) {
        switch (quickFilter) {
          case 'in-shipment':
            matchesQuickFilter = item.status === 'In transit';
            break;
          case 'available':
            matchesQuickFilter = item.status === 'Available';
            break;
          case 'sold':
            matchesQuickFilter = item.status === 'Sold';
            break;
          case 'return-in-transit':
            matchesQuickFilter = item.status === 'In transit' && item.orderType === 'return';
            break;
          default:
            matchesQuickFilter = true;
        }
      } else {
        if (quickFilter === 'available') {
          matchesQuickFilter = item.status === 'Available';
        } else if (quickFilter === 'available-shopfloor') {
          matchesQuickFilter = item.status === 'Available' && item.location === 'Shopfloor';
        } else if (quickFilter === 'available-back-of-house') {
          matchesQuickFilter = item.status === 'Available' && item.location === 'Back of House';
        } else if (quickFilter === 'expired') {
          matchesQuickFilter = Boolean(item.isExpired);
        } else {
          matchesQuickFilter = true;
        }
      }
      
      // Advanced filter sheet filters
      const matchesBrand = itemFilters.brand === 'all' || item.brand === itemFilters.brand;
      const matchesCategory = itemFilters.category === 'all' || item.category === itemFilters.category;
      const matchesStatus = itemFilters.status === 'all' || item.status === itemFilters.status;
      const matchesColour = itemFilters.colour === 'all' || item.color === itemFilters.colour;
      const matchesPrice = item.price >= itemFilters.priceRange[0] && item.price <= itemFilters.priceRange[1];
      
      // ViewFilter filters (for partner portal - filter by brand/store/country)
      let matchesViewFilter = true;
      if (isPartnerPortal && viewFilter) {
        // Filter by brandIds if specified
        if (viewFilter.brandIds && viewFilter.brandIds.length > 0) {
          const itemBrand = brands.find(b => b.name === item.brand);
          if (!itemBrand || !viewFilter.brandIds.includes(itemBrand.id)) {
            matchesViewFilter = false;
          }
        }
        
        // Filter by storeIds if specified (items don't have storeId, so we can't filter by store directly)
        // Store filtering would need items to have a storeId field
        
        // Filter by countryIds if specified (items don't have countryId, so we can't filter by country directly)
        // Country filtering would need items to have a countryId or storeId field
      }
      
      return matchesPartner && matchesQuickSearch && matchesQuickFilter && 
             matchesBrand && matchesCategory && matchesStatus && matchesColour && matchesPrice && matchesViewFilter;
    }).map(item => {
      // Set location based on status if not already set
      let itemWithLocation = item;
      if (item.status === 'Draft' || item.status === 'Returned') {
        if (!item.location || item.location !== 'Warehouse') {
          itemWithLocation = { ...item, location: 'Warehouse' };
        }
      } else if (item.status === 'In transit') {
        if (!item.location || item.location !== 'In transit') {
          itemWithLocation = { ...item, location: 'In transit' };
        }
      } else if (item.status === 'Available' && !item.location) {
        // Default available items to Shopfloor if no location set
        itemWithLocation = { ...item, location: 'Shopfloor' };
      } else if ((item.status === 'Broken' || item.status === 'Rejected') && item.location !== 'Back of House') {
        itemWithLocation = { ...item, location: 'Back of House' };
      } else {
        itemWithLocation = item;
      }
      
      // Remove deliveryId from items with status "Draft"
      if (itemWithLocation.status === 'Draft') {
        const { deliveryId, ...itemWithoutDeliveryId } = itemWithLocation;
        return itemWithoutDeliveryId;
      }
      return itemWithLocation;
    }).sort((a, b) => {
      // Apply sorting
      switch (itemFilters.sortBy) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });
  }, [items, quickSearchTerm, quickFilter, itemFilters, isPartnerPortal, currentPartnerName, viewFilter, brands]);

  const sortedItemsForDisplay = useMemo(() => {
    // Keep existing ordering on mobile/tablet; enable column sorting on desktop.
    if (!isDesktop || !itemsSort.direction) return filteredItems;

    const dir = itemsSort.direction === 'asc' ? 1 : -1;
    const normalize = (v: unknown): string => (v == null ? '' : String(v)).toLowerCase();

    return [...filteredItems].sort((a, b) => {
      const aDays = getDaysInStore(a);
      const bDays = getDaysInStore(b);

      const aVal = (() => {
        switch (itemsSort.field) {
          case 'date': return new Date(a.date).getTime();
          case 'itemId': return normalize(a.itemId);
          case 'brand': return normalize(a.brand);
          case 'category': return normalize(a.category);
          case 'size': return normalize(a.size);
          case 'color': return normalize(a.color);
          case 'delivery': return normalize(a.deliveryId);
          case 'boxLabel': return normalize(a.boxLabel);
          case 'partner': return normalize(a.sellerName);
          case 'daysInStore': return aDays ?? Number.NEGATIVE_INFINITY;
          case 'price': return a.price ?? 0;
          case 'status': return normalize(a.status);
          default: return 0;
        }
      })();

      const bVal = (() => {
        switch (itemsSort.field) {
          case 'date': return new Date(b.date).getTime();
          case 'itemId': return normalize(b.itemId);
          case 'brand': return normalize(b.brand);
          case 'category': return normalize(b.category);
          case 'size': return normalize(b.size);
          case 'color': return normalize(b.color);
          case 'delivery': return normalize(b.deliveryId);
          case 'boxLabel': return normalize(b.boxLabel);
          case 'partner': return normalize(b.sellerName);
          case 'daysInStore': return bDays ?? Number.NEGATIVE_INFINITY;
          case 'price': return b.price ?? 0;
          case 'status': return normalize(b.status);
          default: return 0;
        }
      })();

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return dir * aVal.localeCompare(bVal);
      }
      return dir * ((aVal as number) - (bVal as number));
    });
  }, [filteredItems, isDesktop, itemsSort.field, itemsSort.direction]);

  // Paginated items - only paginate when showing "All" filter with many items
  const paginatedItems = useMemo(() => {
    const shouldPaginate = quickFilter === 'all' && sortedItemsForDisplay.length > ITEMS_PER_PAGE;
    return shouldPaginate ? sortedItemsForDisplay.slice(0, loadedItemsCount) : sortedItemsForDisplay;
  }, [sortedItemsForDisplay, quickFilter, loadedItemsCount]);

  // Reset loaded items count when filters change
  useEffect(() => {
    setLoadedItemsCount(ITEMS_PER_PAGE);
  }, [quickFilter, quickSearchTerm, itemFilters]);

  // Handle scroll to load more items
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (quickFilter !== 'all' || filteredItems.length <= ITEMS_PER_PAGE) return;
    
    const target = e.currentTarget;
    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    
    // Load more when within 200px of bottom
    if (scrollBottom < 200 && loadedItemsCount < filteredItems.length) {
      setLoadedItemsCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredItems.length));
    }
  };

  // Calculate item counts for filter chips - based on items that match partner/viewFilter, but not other filters
  // This should match exactly what would be shown when clicking each filter chip
  const itemCounts = useMemo(() => {
    // Filter items using the same base logic as filteredItems, but without search/quickFilter/advanced filters
    const baseItems = items.filter(item => {
      if (item.isArchived) return false;
      
      // Hide 'In transit' and 'Draft' items in store app mode (same as filteredItems)
      if (!isPartnerPortal && item.status && STORE_HIDDEN_STATUS_SET.has(item.status)) {
        return false;
      }
      
      // Partner filter: only apply in partner portal mode
      const matchesPartner = isPartnerPortal 
        ? (!currentPartnerName || !item.sellerName || item.sellerName === currentPartnerName)
        : true;
      
      // ViewFilter filters (for partner portal - filter by brand/store/country)
      let matchesViewFilter = true;
      if (isPartnerPortal && viewFilter) {
        // Filter by brandIds if specified
        if (viewFilter.brandIds && viewFilter.brandIds.length > 0) {
          const itemBrand = brands.find(b => b.name === item.brand);
          if (!itemBrand || !viewFilter.brandIds.includes(itemBrand.id)) {
            matchesViewFilter = false;
          }
        }
      }
      
      return matchesPartner && matchesViewFilter;
    });

    if (isPartnerPortal) {
      return {
        all: baseItems.length,
        available: baseItems.filter(item => item.status === 'Available').length,
        sold: baseItems.filter(item => item.status === 'Sold').length,
        inShipment: baseItems.filter(item => item.status === 'In transit').length,
        returnInTransit: baseItems.filter(item => item.status === 'In transit' && item.orderType === 'return').length,
        expired: baseItems.filter(item => item.isExpired).length
      };
    }

    return {
      all: baseItems.length,
      available: baseItems.filter(item => item.status === 'Available').length,
      expired: baseItems.filter(item => item.isExpired).length,
      inShipment: 0,
      sold: baseItems.filter(item => item.status === 'Sold').length,
      returnInTransit: baseItems.filter(item => item.status === 'In transit' && item.orderType === 'return').length
    };
  }, [items, isPartnerPortal, currentPartnerName, viewFilter, brands]);

  const availableBrandOptions = useMemo(() => {
    const brandSet = new Set<string>();
    (brands ?? []).forEach(brandRecord => {
      if (brandRecord?.name) {
        brandSet.add(brandRecord.name);
      }
    });
    items.forEach(item => {
      if (item.brand) {
        brandSet.add(item.brand);
      }
    });
    return Array.from(brandSet).sort((a, b) => a.localeCompare(b));
  }, [brands, items]);

  useEffect(() => {
    const handleDeliveryRegistered = (event: Event) => {
      const customEvent = event as CustomEvent<{ deliveryId?: string; timestamp?: string }>;
      const { deliveryId, timestamp } = customEvent.detail || {};
      if (!deliveryId) {
        return;
      }
      const isoTimestamp = timestamp || new Date().toISOString();
      const formatted = formatTimestamp(isoTimestamp);
      setItems(prev =>
        prev.map(item => {
          if (item.deliveryId !== deliveryId) {
            return item;
          }
          const existingTimestamp = item.lastInStoreAt ? Date.parse(item.lastInStoreAt) : undefined;
          const incomingTimestamp = Date.parse(isoTimestamp);
          if (existingTimestamp !== undefined && existingTimestamp >= incomingTimestamp && item.status === 'Available') {
            return item;
          }
          return {
            ...item,
            status: 'Available',
            date: isoTimestamp.slice(0, 10),
            lastInStoreAt: isoTimestamp,
            location: 'Shopfloor',
            rejectReason: undefined,
            statusHistory: [
              ...(item.statusHistory || []),
              {
                status: 'Available',
                timestamp: formatted,
                user: 'System',
                note: 'Registered in store'
              }
            ]
          } as Item;
        })
      );
    };

    window.addEventListener('delivery-registered', handleDeliveryRegistered as EventListener);
    return () => {
      window.removeEventListener('delivery-registered', handleDeliveryRegistered as EventListener);
    };
  }, []);

  /** Selection scoped to the current chip/filter so bulk actions match visible rows (avoids stale picks from other tabs). */
  const selectedItemsInCurrentFilter = useMemo(
    () => filteredItems.filter((item) => item.selected),
    [filteredItems],
  );

  const bulkQuickActions = useMemo(() => {
    if (selectedItemsInCurrentFilter.length === 0) return [];
    const role = userRole ?? 'store-staff';
    const lists = selectedItemsInCurrentFilter.map((i) => getItemListQuickActions(i, role));
    const first = lists[0];
    if (!first?.length) return [];
    const actionSets = lists.map((l) => new Set(l.map((x) => x.action)));
    return first.filter((entry) => actionSets.every((s) => s.has(entry.action)));
  }, [selectedItemsInCurrentFilter, userRole]);

  const deselectIds = (ids: string[]) => {
    const idSet = new Set(ids);
    setItems((prev) => prev.map((item) => (idSet.has(item.id) ? { ...item, selected: false } : item)));
  };

  const handleToggleSelect = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const handleSelectAll = () => {
    const allSelected = paginatedItems.every(item => item.selected);
    setItems(prev => prev.map(item => 
      paginatedItems.some(filtered => filtered.id === item.id) 
        ? { ...item, selected: !allSelected }
        : item
    ));
  };

  const handleRemoveFilter = (filterKey: keyof ItemFilters) => {
    const newFilters = { ...itemFilters };
    
    switch (filterKey) {
      case 'brand':
      case 'category':
      case 'status':
      case 'colour':
      case 'location':
        newFilters[filterKey] = 'all';
        break;
      case 'priceRange':
        newFilters.priceRange = [0, 1000];
        break;
    }
    
    setItemFilters(newFilters);
  };

  const handleClearAllFilters = () => {
    setItemFilters(defaultFilters);
    setQuickSearchTerm('');
  };

  const hasActiveFilters = () => {
    return itemFilters.brand !== 'all' ||
           itemFilters.category !== 'all' ||
           itemFilters.status !== 'all' ||
           itemFilters.colour !== 'all' ||
           itemFilters.location !== 'all' ||
           itemFilters.priceRange[0] !== 0 ||
           itemFilters.priceRange[1] !== 1000 ||
           itemFilters.sortBy !== 'date-desc';
  };

  const handleMoreActions = (item: Item, action: ItemQuickAction) => {
    const fullItem = items.find(i => i.id === item.id);
    if (!fullItem) return;

    let newStatus: Item['status'];
    let successMessage: string;
    let extraUpdates: Partial<Item> = {};

    switch (action) {
      case 'mark-available':
        newStatus = 'Available';
        successMessage = `Item ${item.itemId || item.id} marked as Available`;
        extraUpdates = {
          lastInStoreAt: new Date().toISOString(),
          location: 'Shopfloor',
          isExpired: false
        };
        break;
      case 'store-transfer':
        newStatus = 'In transit';
        successMessage = `Item ${item.itemId || item.id} marked for store transfer`;
        extraUpdates = {
          location: 'In transit',
          orderType: 'order'
        };
        break;
      case 'mark-sold':
        newStatus = 'Sold';
        successMessage = `Item ${item.itemId || item.id} marked as Sold`;
        // Keep current location when marking as sold
        break;
      case 'mark-missing':
        newStatus = 'Missing';
        successMessage = `Item ${item.itemId || item.id} marked as Missing`;
        break;
      case 'mark-broken':
        newStatus = 'Broken';
        successMessage = `Item ${item.itemId || item.id} marked as Broken`;
        extraUpdates = {
          location: 'Back of House'
        };
        break;
      case 'mark-rejected':
        if (!canRejectItem(fullItem)) {
          toast.error('Item can only be rejected within 24 hours of arriving in store.');
          return;
        }
        setItemToReject(fullItem);
        setShowRejectSheet(true);
        return;
      case 'mark-return-transit':
        newStatus = 'In transit';
        successMessage = `Item ${item.itemId || item.id} scheduled for return transit`;
        extraUpdates = {
          orderType: 'return',
          location: 'In transit',
          isExpired: false
        };
        break;
      case 'unflag-expired':
        setItemToUnflagExpired(fullItem);
        setShowUnflagExpiredSheet(true);
        return;
      default:
        return;
    }

    handleSaveItemDetails(fullItem.id, { status: newStatus, ...extraUpdates });
    toast.success(successMessage);
  };
  
  const handleStatusUpdateConfirm = (newStatus: StatusUpdateItemStatus, note?: string) => {
    if (itemToUpdateStatus) {
      handleSaveItemDetails(itemToUpdateStatus.id, { 
        status: newStatus as Item['status'],
        ...(note && { statusHistory: [...(itemToUpdateStatus.statusHistory || []), {
          status: newStatus,
          timestamp: new Date().toLocaleString('sv-SE', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
          }).replace(',', ''),
          user: 'Current User',
          note
        }]})
      });
      toast.success(`Item ${itemToUpdateStatus.itemId} status updated to ${newStatus}`);
      setShowStatusUpdateDialog(false);
      setItemToUpdateStatus(null);
    }
  };

  const handleRejectSheetClose = () => {
    setShowRejectSheet(false);
    setItemToReject(null);
    setBulkRejectItemIds(null);
  };

  const handleConfirmReject = (reason: RejectedReason) => {
    const bulkIds = bulkRejectItemIds;
    if (bulkIds && bulkIds.length > 0) {
      bulkIds.forEach((id) => {
        handleSaveItemDetails(id, {
          status: 'Rejected',
          rejectReason: reason,
          location: 'Back of House',
        });
      });
      toast.info(`${bulkIds.length} items marked as rejected (${reason})`);
      deselectIds(bulkIds);
      setBulkRejectItemIds(null);
      setShowRejectSheet(false);
      setItemToReject(null);
      return;
    }

    if (!itemToReject) return;
    handleSaveItemDetails(itemToReject.id, {
      status: 'Rejected',
      rejectReason: reason,
      location: 'Back of House'
    });
    toast.info(`Item ${itemToReject.itemId} marked as rejected (${reason})`);
    handleRejectSheetClose();
  };

  const handleBulkQuickAction = (action: ItemQuickAction) => {
    const targets = selectedItemsInCurrentFilter
      .map((s) => items.find((i) => i.id === s.id))
      .filter((x): x is Item => Boolean(x));
    if (targets.length === 0) return;

    if (action === 'unflag-expired') {
      const expired = targets.filter((i) => i.isExpired);
      if (expired.length === 0) return;
      setBulkUnflagItemIds(expired.map((i) => i.id));
      setItemToUnflagExpired(expired[0]);
      setShowUnflagExpiredSheet(true);
      return;
    }

    if (action === 'mark-rejected') {
      const eligible = targets.filter(canRejectItem);
      if (eligible.length === 0) {
        toast.error('No selected items can be rejected (within 24 hours of arriving in store).');
        return;
      }
      if (eligible.length < targets.length) {
        toast.info(`Reject applies to ${eligible.length} of ${targets.length} selected items.`);
      }
      setBulkRejectItemIds(eligible.map((i) => i.id));
      setItemToReject(eligible[0]);
      setShowRejectSheet(true);
      return;
    }

    const ids = targets.map((t) => t.id);
    let message = '';

    switch (action) {
      case 'mark-available':
        targets.forEach((fullItem) => {
          handleSaveItemDetails(fullItem.id, {
            status: 'Available',
            lastInStoreAt: new Date().toISOString(),
            location: 'Shopfloor',
            isExpired: false,
          });
        });
        message = `${targets.length} items marked as in store`;
        break;
      case 'store-transfer':
        targets.forEach((fullItem) => {
          handleSaveItemDetails(fullItem.id, {
            status: 'In transit',
            location: 'In transit',
            orderType: 'order',
          });
        });
        message = `${targets.length} items marked for store transfer`;
        break;
      case 'mark-sold':
        targets.forEach((fullItem) => {
          handleSaveItemDetails(fullItem.id, { status: 'Sold' });
        });
        message = `${targets.length} items marked as sold`;
        break;
      case 'mark-missing':
        targets.forEach((fullItem) => {
          handleSaveItemDetails(fullItem.id, { status: 'Missing' });
        });
        message = `${targets.length} items marked as missing`;
        break;
      case 'mark-broken':
        targets.forEach((fullItem) => {
          handleSaveItemDetails(fullItem.id, { status: 'Broken', location: 'Back of House' });
        });
        message = `${targets.length} items marked as broken`;
        break;
      case 'mark-return-transit':
        targets.forEach((fullItem) => {
          handleSaveItemDetails(fullItem.id, {
            status: 'In transit',
            orderType: 'return',
            location: 'In transit',
            isExpired: false,
          });
        });
        message = `${targets.length} items scheduled for return transit`;
        break;
      default:
        return;
    }

    toast.success(message);
    deselectIds(ids);
  };

  const handleItemClick = (item: Item) => {
    setSelectedItemForDetails(item);
  };

  const handleSaveItemDetails = (itemId: string, updates: Partial<ItemDetails>) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, ...updates };
        
        // Set location based on status if status changed
        if (updates.status && updates.status !== item.status) {
          if (updates.status === 'Draft' || updates.status === 'Returned') {
            updatedItem.location = 'Warehouse';
          } else if (updates.status === 'In transit') {
            updatedItem.location = 'In transit';
          } else if (updates.status === 'Available') {
            updatedItem.location = updates.location || 'Shopfloor';
            updatedItem.lastInStoreAt = new Date().toISOString();
          } else if (updates.status === 'Broken' || updates.status === 'Rejected') {
            updatedItem.location = 'Back of House';
          }
          
          const newHistoryEntry: StatusHistoryEntry = {
            status: updates.status,
            timestamp: formatTimestamp(),
            user: 'Current User',
            ...(updates.status === 'Rejected' && updates.rejectReason && { note: updates.rejectReason })
          };
          
          updatedItem.statusHistory = [
            ...(item.statusHistory || []),
            newHistoryEntry
          ];
        }
        
        return updatedItem as Item;
      }
      return item;
    }));
    
    // Update the selected item for details to reflect changes
    setSelectedItemForDetails(prev => prev ? { ...prev, ...updates } as Item : null);
  };

  const handleUnflagExpired = (updates: Partial<Item>) => {
    const bulkIds = bulkUnflagItemIds;
    if (bulkIds && bulkIds.length > 0) {
      bulkIds.forEach((id) => handleSaveItemDetails(id, updates));
      const n = bulkIds.length;
      const successMessage =
        updates.isExpired === false
          ? `Expired flag removed for ${n} items`
          : updates.expiredPostponeWeeks === 4
            ? `${n} items will be flagged as expired again after 4 weeks`
            : `${n} items will be flagged as expired again after 8 weeks`;
      toast.success(successMessage);
      deselectIds(bulkIds);
      setBulkUnflagItemIds(null);
      setShowUnflagExpiredSheet(false);
      setItemToUnflagExpired(null);
      return;
    }

    if (!itemToUnflagExpired) return;

    const successMessage = updates.isExpired === false
      ? `Item ${itemToUnflagExpired.itemId || itemToUnflagExpired.id} expired flag removed`
      : updates.expiredPostponeWeeks === 4
      ? `Item ${itemToUnflagExpired.itemId || itemToUnflagExpired.id} will be flagged as expired again after 4 weeks`
      : `Item ${itemToUnflagExpired.itemId || itemToUnflagExpired.id} will be flagged as expired again after 8 weeks`;

    handleSaveItemDetails(itemToUnflagExpired.id, updates);
    toast.success(successMessage);
    setShowUnflagExpiredSheet(false);
    setItemToUnflagExpired(null);
  };

  return (
    <div className="bg-surface relative size-full">
      {/* Spacer for top nav on desktop */}
      <div className="hidden md:block h-16"></div>
      {/* Header */}
      <div className="sticky top-0 md:top-16 bg-surface z-[90] border-b border-outline-variant md:shadow-sm">
        <div className="px-4 md:px-6 py-4 md:pt-4">
          <div className="flex items-center justify-between">
            <h3 className="headline-small text-on-surface">Items</h3>
          </div>
        </div>
      </div>

      {/* Content - M3 Grid: 16px mobile, 24px tablet+ */}
      <div 
        className="px-4 md:px-6 pt-4 md:pt-6 h-full overflow-y-auto"
        onScroll={handleScroll}
      >
        
        {/* Search row (search + store filter) */}
        <div className="mb-4">
          <div className="flex gap-3 items-start">
            <div className={isPartnerPortal ? 'flex-1' : 'flex-1 md:max-w-2xl'}>
              <SearchBar
                searchTerm={quickSearchTerm}
                onSearchChange={setQuickSearchTerm}
                onFilterClick={() => setShowFilterSheet(true)}
                placeholder={isPartnerPortal ? 'Search by name or ID' : 'Search'}
              />
            </div>

            {!isPartnerPortal && onNavigateToScan && (
              <button
                onClick={onNavigateToScan}
                aria-label="Scan"
                className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
              >
                <QrCode className="w-5 h-5 text-on-surface-variant" />
              </button>
            )}

            {isPartnerPortal && (
              <StoreFilterBottomSheet
                viewFilter={viewFilter}
                onViewAllStores={() => {
                  setViewFilter({ 
                    mode: 'by-partner', 
                    partnerId: currentPartnerWarehouseSelection?.partnerId 
                  });
                }}
                onBrandFilterChange={(brandIds) => {
                  setViewFilter({ 
                    mode: 'by-store', 
                    brandIds, 
                    storeIds: viewFilter.storeIds,
                    countryIds: viewFilter.countryIds,
                    partnerId: viewFilter.partnerId
                  });
                }}
                onStoreFilterChange={(storeIds) => {
                  setViewFilter({ 
                    mode: 'by-store', 
                    brandIds: viewFilter.brandIds,
                    storeIds, 
                    countryIds: viewFilter.countryIds,
                    partnerId: viewFilter.partnerId
                  });
                }}
                onCountryFilterChange={(countryIds) => {
                  setViewFilter({ 
                    mode: 'by-store', 
                    brandIds: viewFilter.brandIds,
                    storeIds: viewFilter.storeIds, 
                    countryIds,
                    partnerId: viewFilter.partnerId
                  });
                }}
                currentPartnerId={currentPartnerWarehouseSelection?.partnerId || ''}
                partners={partnerOptions}
                brands={brands}
                stores={stores}
                countries={countries}
              >
                <button
                  type="button"
                  className={`
                    h-12 px-2 sm:px-3 border transition-colors flex items-center gap-2 flex-shrink-0 rounded-[8px]
                    ${(viewFilter.brandIds?.length || 0) > 0 || 
                      (viewFilter.countryIds?.length || 0) > 0 || 
                      (viewFilter.storeIds?.length || 0) > 0
                      ? 'bg-secondary-container border-outline text-on-secondary-container'
                      : 'bg-surface border-outline text-on-surface-variant hover:bg-surface-container-high'
                    }
                  `}
                >
                  <FilterIcon size={20} />
                  <span className="label-medium hidden sm:inline">
                    {((viewFilter.brandIds?.length || 0) > 0 || 
                      (viewFilter.countryIds?.length || 0) > 0 || 
                      (viewFilter.storeIds?.length || 0) > 0)
                      ? 'Filtered'
                      : 'Filter'
                    }
                  </span>
                  {((viewFilter.brandIds?.length || 0) > 0 || 
                    (viewFilter.countryIds?.length || 0) > 0 || 
                    (viewFilter.storeIds?.length || 0) > 0) && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              </StoreFilterBottomSheet>
            )}
          </div>

          {/* Active view filters as blue bubbles (one per category) */}
          {isPartnerPortal && ((viewFilter.brandIds?.length || 0) > 0 || 
            (viewFilter.countryIds?.length || 0) > 0 || 
            (viewFilter.storeIds?.length || 0) > 0) && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {(viewFilter.brandIds?.length || 0) > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container text-on-primary-container label-small">
                  <span className="whitespace-nowrap">
                    {viewFilter.brandIds!.length === 1
                      ? (brands.find(b => b.id === viewFilter.brandIds![0])?.name ?? 'Brand')
                      : `Brand (${viewFilter.brandIds!.length})`}
                  </span>
                  <button
                    type="button"
                    aria-label="Clear brand filters"
                    className="hover:opacity-70"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewFilter({ ...viewFilter, brandIds: [] });
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {(viewFilter.countryIds?.length || 0) > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container text-on-primary-container label-small">
                  <span className="whitespace-nowrap">
                    {viewFilter.countryIds!.length === 1
                      ? (countries.find(c => c.id === viewFilter.countryIds![0])?.name ?? 'Country')
                      : `Country (${viewFilter.countryIds!.length})`}
                  </span>
                  <button
                    type="button"
                    aria-label="Clear country filters"
                    className="hover:opacity-70"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewFilter({ ...viewFilter, countryIds: [] });
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {(viewFilter.storeIds?.length || 0) > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container text-on-primary-container label-small">
                  <span className="whitespace-nowrap">
                    {viewFilter.storeIds!.length === 1
                      ? (stores.find(s => s.id === viewFilter.storeIds![0])?.name ?? 'Store')
                      : `Store (${viewFilter.storeIds!.length})`}
                  </span>
                  <button
                    type="button"
                    aria-label="Clear store filters"
                    className="hover:opacity-70"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewFilter({ ...viewFilter, storeIds: [] });
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Quick Filter Chips */}
        <QuickFilterChips 
          activeFilter={quickFilter}
          onFilterChange={setQuickFilter}
          itemCounts={itemCounts}
          isPartnerPortal={isPartnerPortal}
        />
        
        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <ActiveFiltersDisplay 
            filters={itemFilters}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
          />
        )}
        
        {/* Item count row for 'All' filter - matches MultiSelectActions height */}
        {quickFilter === 'all' && filteredItems.length > 0 && (
          <div className="border-t border-outline-variant">
            <div className="flex items-center justify-between px-1 py-3 min-h-[48px]">
              <div className="body-medium text-on-surface font-normal px-3 md:px-5">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              </div>
            </div>
          </div>
        )}
        
        {/* Multi-select Actions - Only show when not on 'all' filter */}
        {quickFilter !== 'all' && (
          <MultiSelectActions 
            selectedCount={selectedItemsInCurrentFilter.length}
            totalCount={filteredItems.length}
            isAllSelected={paginatedItems.length > 0 && paginatedItems.every(item => item.selected)}
            onSelectAll={handleSelectAll}
            bulkQuickActions={bulkQuickActions}
            onBulkQuickAction={handleBulkQuickAction}
          />
        )}
        
        {/* Items List */}
        <div className="space-y-0 mb-4">
          {filteredItems.length === 0 ? (
            <EmptyState 
              hasItems={items.length > 0}
              hasSearchOrFilters={quickSearchTerm !== '' || hasActiveFilters()}
              availableBrands={availableBrandOptions}
              onSearchChange={setQuickSearchTerm}
            />
          ) : (
            <>
              {isDesktop ? (
                <div className="hidden lg:block w-full" data-desktop-table>
                  <div className="overflow-x-auto rounded-lg border border-outline-variant bg-surface">
                    <table className="w-full min-w-[1400px] table-fixed border-collapse">
                      <colgroup>
                        {quickFilter !== 'all' && <col style={{ width: '3.25rem' }} />}
                        <col style={{ width: '4.5rem' }} /> {/* Image */}
                        <col style={{ width: '7.5rem' }} /> {/* Date */}
                        <col style={{ width: '9rem' }} /> {/* Item ID */}
                        <col style={{ width: '10rem' }} /> {/* Brand */}
                        <col style={{ width: '8.5rem' }} /> {/* Category */}
                        <col style={{ width: '5.5rem' }} /> {/* Size */}
                        <col style={{ width: '6.5rem' }} /> {/* Color */}
                        <col style={{ width: '8.5rem' }} /> {/* Delivery */}
                        <col style={{ width: '8.5rem' }} /> {/* Box label */}
                        <col style={{ width: '9rem' }} /> {/* Partner */}
                        <col style={{ width: '6.5rem' }} /> {/* Days in store */}
                        <col style={{ width: '7.5rem' }} /> {/* Price */}
                        <col style={{ width: '7.5rem' }} /> {/* Status */}
                      </colgroup>
                      <thead className="bg-surface-container">
                        <tr className="border-b border-outline-variant">
                          {quickFilter !== 'all' && (
                            <th className="px-3 py-3 text-left">
                              <span className="label-medium text-on-surface"> </span>
                            </th>
                          )}
                          <th className="px-3 py-3 text-left title-small text-on-surface">
                            <span>Image</span>
                          </th>
                          <SortableHeader field="date" label="Date" />
                          <SortableHeader field="itemId" label="Item ID" />
                          <SortableHeader field="brand" label="Item brand" />
                          <SortableHeader field="category" label="Category" />
                          <SortableHeader field="size" label="Size" />
                          <SortableHeader field="color" label="Color" />
                          <SortableHeader field="delivery" label="Delivery" />
                          <SortableHeader field="boxLabel" label="Box label" />
                          <SortableHeader field="partner" label="Partner" />
                          <SortableHeader field="daysInStore" label="Days in store" align="right" />
                          <SortableHeader field="price" label="Price" align="right" />
                          <SortableHeader field="status" label="Status" />
                        </tr>
                      </thead>
                      <tbody className="bg-surface">
                        {paginatedItems.map((item, index) => {
                          const daysInStore = getDaysInStore(item);
                          return (
                            <tr
                              key={item.id}
                              className={`${index !== paginatedItems.length - 1 ? 'border-b border-outline-variant' : ''} hover:bg-surface-container/50 transition-colors`}
                              role="button"
                              tabIndex={0}
                              onClick={() => handleItemClick(item)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleItemClick(item);
                                }
                              }}
                            >
                              {quickFilter !== 'all' && (
                                <td className="px-3 py-3 align-middle">
                                  <input
                                    type="checkbox"
                                    checked={!!item.selected}
                                    onChange={() => handleToggleSelect(item.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-4 w-4 accent-primary"
                                    aria-label={item.selected ? 'Deselect item' : 'Select item'}
                                  />
                                </td>
                              )}
                              <td className="px-3 py-3 align-middle">
                                <div className="w-12 h-12 rounded overflow-hidden bg-surface-container flex items-center justify-center mx-auto">
                                  <ImageWithFallback
                                    src={item.thumbnail || item.image}
                                    alt={item.title || item.brand}
                                    className="w-full h-full object-cover"
                                    fallback={<PackageIcon className="w-5 h-5 text-on-surface-variant/60" />}
                                  />
                                </div>
                              </td>
                              <td className="px-3 py-3 body-small text-on-surface-variant align-middle">{item.date || '—'}</td>
                              <td className="px-3 py-3 body-medium text-on-surface align-middle">{item.itemId || '—'}</td>
                              <td className="px-3 py-3 body-medium text-on-surface align-middle">{item.brand || '—'}</td>
                              <td className="px-3 py-3 body-medium text-on-surface align-middle">{item.category || '—'}</td>
                              <td className="px-3 py-3 body-medium text-on-surface align-middle">{item.size || '—'}</td>
                              <td className="px-3 py-3 body-medium text-on-surface align-middle">{item.color || '—'}</td>
                              <td className="px-3 py-3 body-medium text-on-surface align-middle">{item.deliveryId || '—'}</td>
                              <td className="px-3 py-3 body-medium text-on-surface align-middle">{item.boxLabel || '—'}</td>
                              <td className="px-3 py-3 body-medium text-on-surface align-middle">{item.sellerName || '—'}</td>
                              <td className="px-3 py-3 body-medium text-on-surface text-right align-middle">
                                {daysInStore == null ? '—' : daysInStore}
                              </td>
                              <td className="px-3 py-3 body-medium text-on-surface text-right align-middle">
                                €{(item.price ?? 0).toFixed(2)}
                              </td>
                              <td className="px-3 py-3 align-middle">
                                {(() => {
                                  const status = (item.status || '').toLowerCase();
                                  const chipClass =
                                    status === 'sold' ? 'bg-chart-2 text-on-chart-2' :
                                    status === 'available' ? 'bg-chart-1 text-on-chart-1' :
                                    status === 'returned' ? 'bg-chart-3 text-on-chart-3' :
                                    status === 'in transit' ? 'bg-chart-4 text-on-chart-4' :
                                    status === 'rejected' || status === 'broken' || status === 'missing'
                                      ? 'bg-error-container text-on-error-container'
                                      : 'bg-surface-container-high text-on-surface';
                                  return (
                                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${chipClass}`}>
                                      {item.status || '—'}
                                    </span>
                                  );
                                })()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {paginatedItems.map((item) => (
                    <div key={item.id} className="bg-surface-container border border-outline-variant rounded-lg overflow-hidden">
                      <ItemCard
                        item={item}
                        onToggleSelect={handleToggleSelect}
                        onMoreActions={(baseItem, action) => handleMoreActions(baseItem as Item, action)}
                        onClick={(baseItem) => handleItemClick(baseItem as Item)}
                        showActions={true}
                        showSelection={quickFilter !== 'all'}
                        userRole={userRole ?? 'store-staff'}
                      />
                    </div>
                  ))}
                </div>
              )}
              {quickFilter === 'all' && filteredItems.length > ITEMS_PER_PAGE && loadedItemsCount < filteredItems.length && (
                <div className="text-center py-4">
                  <p className="body-small text-on-surface-variant">
                    Showing {loadedItemsCount} of {filteredItems.length} items. Scroll to load more.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Item Filter Sheet */}
      <ItemFilterSheet 
        open={showFilterSheet}
        onOpenChange={setShowFilterSheet}
        filters={itemFilters}
        onApplyFilters={setItemFilters}
        onResetFilters={handleClearAllFilters}
        brandOptions={availableBrandOptions}
      />
      
      {/* Item Details Dialog */}
      <ItemDetailsDialog
        item={selectedItemForDetails as ItemDetails | null}
        isOpen={!!selectedItemForDetails}
        onClose={() => setSelectedItemForDetails(null)}
        onSave={handleSaveItemDetails}
        statusHistory={selectedItemForDetails?.statusHistory}
        priceOptions={partnerPriceOptions}
        priceCurrency={partnerPriceOptions.length ? 'SEK' : undefined}
        expireTimeWeeks={expireTimeWeeks}
        userRole={userRole}
        onRequestRejectReason={(item) => {
          setItemToReject(items.find(i => i.id === item.id) ?? (item as Item));
          setShowRejectSheet(true);
        }}
      />

      {/* Status Update Dialog */}
      <StatusUpdateDialog
        isOpen={showStatusUpdateDialog}
        onClose={() => {
          setShowStatusUpdateDialog(false);
          setItemToUpdateStatus(null);
        }}
        onConfirm={handleStatusUpdateConfirm}
        currentStatus={itemToUpdateStatus?.status}
        itemId={itemToUpdateStatus?.itemId}
        itemTitle={itemToUpdateStatus?.title}
        userRole={userRole}
      />

      {/* Rejected Reason Bottom Sheet */}
      <RejectedReasonBottomSheet
        isOpen={showRejectSheet}
        onClose={handleRejectSheetClose}
        onConfirm={handleConfirmReject}
        itemId={itemToReject?.itemId}
      />

      {/* Unflag Expired Sheet */}
      <UnflagExpiredSheet
        isOpen={showUnflagExpiredSheet}
        onClose={() => {
          setShowUnflagExpiredSheet(false);
          setItemToUnflagExpired(null);
          setBulkUnflagItemIds(null);
        }}
        item={itemToUnflagExpired}
        onSave={handleUnflagExpired}
      />
    </div>
  );
}