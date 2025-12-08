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
import { Textarea } from "./ui/textarea";
import { Archive, Edit3, X, FilterIcon } from "lucide-react";
import ItemFilterSheet, { ItemFilters, defaultFilters } from './ItemFilterSheet';
import StoreFilterBottomSheet, { ViewFilter } from './StoreFilterBottomSheet';
import { ItemCard, BaseItem, ItemQuickAction } from './ItemCard';
import ItemDetailsDialog, { ItemDetails, StatusHistoryEntry } from './ItemDetailsDialog';
import { StatusUpdateDialog, ItemStatus as StatusUpdateItemStatus } from './StatusUpdateDialog';
import { UserRole } from './ItemCard';
import { toast } from 'sonner';
import { getSekPriceOptions } from '../data/partnerPricing';
import type { Store as StoreRecord, Country as CountryRecord, Brand as BrandRecord } from './StoreSelector';

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
  status: 'Draft' | 'In transit' | 'Available' | 'Storage' | 'Sold' | 'Returned' | 'Missing' | 'Broken' | 'Rejected';
  date: string;
  deliveryId?: string;
  sellerName?: string;
  thumbnail?: string;
  daysRemaining?: number;
  source?: string;
  orderNumber?: string;
  orderType?: 'order' | 'return';
  selected: boolean;
  statusHistory?: StatusHistoryEntry[];
  rejectReason?: 'Broken on arrival' | 'Not accepted brand' | 'Not in season';
  lastInStoreAt?: string;
  location?: 'Warehouse' | 'In Store' | 'Back of House' | 'Partner' | 'In transit';
  isExpired?: boolean;
  expiredFlaggedAt?: string;
  expiredPostponeWeeks?: number;
  isArchived?: boolean;
  archivedAt?: string;
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
}

function SearchBar({ searchTerm, onSearchChange, onFilterClick }: { 
  searchTerm: string; 
  onSearchChange: (value: string) => void;
  onFilterClick?: () => void;
}) {
  return (
    <div className="relative w-full mb-4 md:max-w-2xl">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5">
          <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
            <path clipRule="evenodd" d={svgPaths.p3938ac00} fill="var(--on-surface-variant)" fillRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          id="items-search"
          name="items-search"
          placeholder="Search by name or ID"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-12 pl-10 pr-12 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-on-surface body-large"
        />
        {onFilterClick && (
          <button
            onClick={onFilterClick}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
            aria-label="Advanced search"
          >
            <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path d={svgPaths.pe90e900} fill="var(--on-surface-variant)" />
            </svg>
          </button>
        )}
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
  const filters = isPartnerPortal ? [
    { id: 'all', label: 'All', count: itemCounts.all },
    { id: 'in-shipment', label: 'In transit', count: itemCounts.inShipment },
    { id: 'available', label: 'Available', count: itemCounts.available },
    { id: 'storage', label: 'Storage', count: itemCounts.storage },
    { id: 'sold', label: 'Sold', count: itemCounts.sold },
    { id: 'return-in-transit', label: 'Return in transit', count: itemCounts.returnInTransit }
  ] : [
    { id: 'all', label: 'All', count: itemCounts.all },
    { id: 'available', label: 'Available', count: itemCounts.available },
    { id: 'storage', label: 'Storage', count: itemCounts.storage },
    { id: 'expired', label: 'Expired flag', count: itemCounts.expired }
  ];

  return (
    <div className="px-4 py-3 bg-surface border-b border-outline-variant">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`flex-shrink-0 px-4 py-2 rounded-lg border transition-colors ${
              activeFilter === filter.id
                ? 'bg-secondary-container border-secondary text-on-secondary-container'
                : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest'
            }`}
            onClick={() => onFilterChange(filter.id)}
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

type ActiveFilter = { key: keyof ItemFilters; label: string };

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



function BulkEditModal({ isOpen, onClose, selectedItems, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: Item[];
  onSave: (updates: Partial<Item>) => void;
}) {
  const [formData, setFormData] = useState({
    status: 'none',
    category: '',
    priceReduction: 'none',
    comment: ''
  });
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

  const handleSave = () => {
    const updates: Partial<Item> = {};
    if (formData.status !== 'none') updates.status = formData.status as Item['status'];
    if (formData.category) updates.category = formData.category;
    if (formData.priceReduction !== 'none') {
      const reductionPercent = parseFloat(formData.priceReduction);
      // Store the reduction percentage - the actual price calculation will be done in handleBulkEditSave
      (updates as any).priceReduction = reductionPercent;
    }
    if (formData.comment) {
      (updates as any).comment = formData.comment;
    }
    
    onSave(updates);
    setFormData({ status: 'none', category: '', priceReduction: 'none', comment: '' });
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"} 
        className="bg-surface border-outline-variant p-0 flex flex-col md:max-w-[400px] md:h-full max-h-[85vh] md:max-h-full"
      >
        {/* Header - Fixed */}
        <SheetHeader className="border-b border-outline-variant px-4 pt-6 pb-4 pr-12 flex-shrink-0">
          <SheetTitle className="title-large text-on-surface">
            Bulk Edit Items
          </SheetTitle>
          <SheetDescription className="body-medium text-on-surface-variant">
            Edit properties for {selectedItems.length} selected items. Only filled fields will be updated.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Status Field */}
          <div className="space-y-2">
            <Label htmlFor="status" className="label-large text-on-surface">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: string) =>
                setFormData(prev => ({ ...prev, status: value as Item['status'] | 'none' }))
              }
            >
              <SelectTrigger className="w-full bg-surface-container-high border border-outline rounded-lg min-h-[48px] body-large">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No change</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="In transit">In transit</SelectItem>
                <SelectItem value="Storage">Storage</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
                <SelectItem value="Returned">Returned</SelectItem>
                <SelectItem value="Missing">Missing</SelectItem>
                <SelectItem value="Broken">Broken</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Category Field */}
          <div className="space-y-2">
            <Label htmlFor="category" className="label-large text-on-surface">
              Category
            </Label>
            <Select
              value={formData.category || 'none'}
              onValueChange={(value: string) =>
                setFormData(prev => ({ ...prev, category: value === 'none' ? '' : value }))
              }
            >
              <SelectTrigger className="w-full bg-surface-container-high border border-outline rounded-lg min-h-[48px] body-large">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No change</SelectItem>
                <SelectItem value="Tops">Tops</SelectItem>
                <SelectItem value="Bottoms">Bottoms</SelectItem>
                <SelectItem value="Dresses">Dresses</SelectItem>
                <SelectItem value="Outerwear">Outerwear</SelectItem>
                <SelectItem value="Shoes">Shoes</SelectItem>
                <SelectItem value="Accessories">Accessories</SelectItem>
                <SelectItem value="Hoodie">Hoodie</SelectItem>
                <SelectItem value="Shorts">Shorts</SelectItem>
                <SelectItem value="Trousers">Trousers</SelectItem>
                <SelectItem value="Jackets">Jackets</SelectItem>
                <SelectItem value="Skirts">Skirts</SelectItem>
                <SelectItem value="Knitwear">Knitwear</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Price % Reduction Field */}
          <div className="space-y-2">
            <Label htmlFor="priceReduction" className="label-large text-on-surface">
              Price % reduction
            </Label>
            <Select
              value={formData.priceReduction}
              onValueChange={(value: string) =>
                setFormData(prev => ({ ...prev, priceReduction: value }))
              }
            >
              <SelectTrigger className="w-full bg-surface-container-high border border-outline rounded-lg min-h-[48px] body-large">
                <SelectValue placeholder="Select reduction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No change</SelectItem>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="20">20%</SelectItem>
                <SelectItem value="30">30%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Comment Field */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="label-large text-on-surface">
              Comment (optional)
            </Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              className="w-full bg-surface-container-high border border-outline rounded-lg min-h-[80px] body-large resize-none"
              placeholder="Add a comment..."
              rows={3}
            />
          </div>
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
            Update items
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

const initialItems: Item[] = [
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
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1732475530169-70c2cda1712f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob29kaWUlMjBmYXNoaW9ufGVufDF8fHx8MTc2MTE5NDA5MHww&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'In Store',
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
    status: 'Storage',
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
      { status: 'Storage', timestamp: '2024-12-01 09:00', user: 'Anna S.', note: 'Temporarily removed from floor' }
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
    location: 'In Store',
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
    sellerName: 'Shenzhen Fashion Manufacturing',
    source: 'Shenzhen Fashion Manufacturing',
    thumbnail: 'https://images.unsplash.com/photo-1761090617068-f1b3257d27ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwdG9wc3xlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Partner',
    daysRemaining: 0,
    orderType: 'return',
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-07 11:20', user: 'Anna S.' },
      { status: 'Storage', timestamp: '2024-11-25 09:00', user: 'System', note: 'Marked for return' },
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
    location: 'In Store',
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
    location: 'In Store',
    daysRemaining: 0,
    rejectReason: 'Broken on arrival',
    statusHistory: [
      { status: 'Available', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), user: 'John D.' },
      { status: 'Rejected', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), user: 'John D.', note: 'Broken on arrival' }
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
      { status: 'Storage', timestamp: '2024-12-01 08:00', user: 'Anna S.', note: 'Marked for return shipment' },
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
    date: '2024-11-15',
    deliveryId: 'DEL-0820',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2lydCUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'In Store',
    daysRemaining: 5,
    isExpired: true,
    expiredFlaggedAt: '2024-11-30T10:00:00.000Z',
    expiredPostponeWeeks: 8,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-16 10:00', user: 'Anna S.' },
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
    status: 'Storage',
    date: '2024-11-28',
    deliveryId: 'DEL-0920',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldHxlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Back of House',
    daysRemaining: 12,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-20 10:00', user: 'Anna S.' },
      { status: 'Storage', timestamp: '2024-11-28 14:30', user: 'Anna S.', note: 'Temporarily moved to storage' }
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
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0c2hpcnQlMjBzdHJpcGVkfGVufDF8fHx8MTc2MTI4OTQ0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'In Store',
    lastInStoreAt: '2024-12-01T10:00:00.000Z',
    daysRemaining: 39,
    statusHistory: [
      { status: 'Draft', timestamp: '2024-11-28 08:00', user: 'System' },
      { status: 'In transit', timestamp: '2024-11-30 09:15', user: 'System' },
      { status: 'Available', timestamp: '2024-12-01 10:00', user: 'Anna S.' }
    ]
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
    status: 'Storage',
    date: '2024-11-25',
    deliveryId: 'DEL-0910',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1542272604-787c3835535d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZWFucyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Back of House',
    daysRemaining: 15,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-18 11:00', user: 'Anna S.' },
      { status: 'Storage', timestamp: '2024-11-25 16:00', user: 'John D.', note: 'Seasonal rotation' }
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
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJkaWdhbiUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'In Store',
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
    status: 'Storage',
    date: '2024-11-20',
    deliveryId: 'DEL-0880',
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2lydCUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'Back of House',
    daysRemaining: 20,
    statusHistory: [
      { status: 'Available', timestamp: '2024-11-12 10:00', user: 'Anna S.' },
      { status: 'Storage', timestamp: '2024-11-20 15:00', user: 'Anna S.', note: 'Space optimization' }
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
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldHxlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'In Store',
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
    sellerName: 'Sellpy Operations',
    source: 'Sellpy Operations',
    thumbnail: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2VhdGVyJTIwZmFzaGlvbnxlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    selected: false,
    location: 'In Store',
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
  }
];
function MultiSelectActions({
  selectedCount,
  totalCount,
  isAllSelected,
  onReturnToSeller,
  onSelectAll,
  onArchive,
  onBulkEdit,
  canReturn
}: {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  onReturnToSeller: () => void;
  onSelectAll: () => void;
  onArchive: () => void;
  onBulkEdit: () => void;
  canReturn: boolean;
}) {
  // Don't show if there are no items
  if (totalCount === 0) return null;

  const hasSelectedItems = selectedCount > 0;

  return (
    <div className="border-t border-outline-variant">
      <div className="flex items-center justify-between px-1 py-3">
        {/* Left side - Select all and count */}
        <div className="flex items-center gap-3">
          <button 
            className="p-3 rounded-lg hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
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
          
          <div className="title-small text-on-surface">
            {hasSelectedItems 
              ? `${selectedCount} selected`
              : `${totalCount} ${totalCount === 1 ? 'item' : 'items'}`
            }
          </div>
        </div>
        
        {/* Right side - Actions (only show when items are selected) */}
        {hasSelectedItems && (
        <div className="flex items-center gap-2">
          {canReturn && (
            <Button onClick={onReturnToSeller}>
              Return
            </Button>
          )}
          
          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
                aria-label="More actions"
              >
                <svg className="w-6 h-6" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                  <path d={svgPathsNew.p3fdba000} fill="var(--on-surface)" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onBulkEdit}>
                <Edit3 className="mr-2 h-4 w-4" />
                <span>Bulk edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onArchive}>
                <Archive className="mr-2 h-4 w-4" />
                <span>Archive selected</span>
              </DropdownMenuItem>
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
  onCreateReturn
}: ItemsScreenProps) {
  const [quickFilter, setQuickFilter] = useState('all');
  const [quickSearchTerm, setQuickSearchTerm] = useState('');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [itemFilters, setItemFilters] = useState<ItemFilters>(defaultFilters);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<Item | null>(null);

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
  const [showBatchStatusUpdate, setShowBatchStatusUpdate] = useState(false);
  const [batchNewStatus, setBatchNewStatus] = useState<string>('none');
  const [batchStatusNote, setBatchStatusNote] = useState('');
  const [showStatusUpdateDialog, setShowStatusUpdateDialog] = useState(false);
  const [itemToUpdateStatus, setItemToUpdateStatus] = useState<Item | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [itemToReject, setItemToReject] = useState<Item | null>(null);
  const rejectReasons = ['Broken on arrival', 'Not accepted brand', 'Not in season'] as const;
  type RejectReason = typeof rejectReasons[number];
  const [rejectReason, setRejectReason] = useState<RejectReason>(rejectReasons[0]);
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
      quickFilter !== 'expired'
    ) {
      setQuickFilter('all');
    }
  }, [isPartnerPortal, quickFilter]);

  const [items, setItems] = useState<Item[]>(initialItems);

  useEffect(() => {
    setItems(prev =>
      prev.map(item => {
        if (item.status === 'Available' && !item.lastInStoreAt) {
          const timestamp = getLastInStoreTimestamp(item);
          const iso = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();
          return { ...item, lastInStoreAt: iso };
        }
        return item;
      })
    );
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
      // Partner filter: if in partner portal, only show items from selected partner
      const matchesPartner = !currentPartnerName || !item.sellerName || item.sellerName === currentPartnerName;
      
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
          case 'storage':
            matchesQuickFilter = item.status === 'Storage';
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
        matchesQuickFilter =
          (quickFilter === 'available' &&
            (item.status === 'Available' ||
             item.status === 'Missing' ||
             item.status === 'Broken' ||
             item.status === 'Sold' ||
             item.status === 'Returned')) ||
          (quickFilter === 'storage' && item.status === 'Storage') ||
          (quickFilter === 'expired' && Boolean(item.isExpired));
      }
      
      // Advanced filter sheet filters
      const matchesBrand = itemFilters.brand === 'all' || item.brand === itemFilters.brand;
      const matchesCategory = itemFilters.category === 'all' || item.category === itemFilters.category;
      const matchesStatus = itemFilters.status === 'all' || item.status === itemFilters.status;
      const matchesColour = itemFilters.colour === 'all' || item.color === itemFilters.colour;
      const matchesPrice = item.price >= itemFilters.priceRange[0] && item.price <= itemFilters.priceRange[1];
      
      return matchesPartner && matchesQuickSearch && matchesQuickFilter && 
             matchesBrand && matchesCategory && matchesStatus && matchesColour && matchesPrice;
    }).map(item => {
      // Remove deliveryId from items with status "Draft"
      if (item.status === 'Draft') {
        const { deliveryId, ...itemWithoutDeliveryId } = item;
        return itemWithoutDeliveryId;
      }
      return item;
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
  }, [items, quickSearchTerm, quickFilter, itemFilters, isPartnerPortal, currentPartnerName]);

  // Calculate item counts for filter chips - based on items that match partner/viewFilter, but not other filters
  const itemCounts = useMemo(() => {
    // Filter items only by partner (for partner portal) to get base count
    const baseItems = items.filter(item => {
      const matchesPartner = !currentPartnerName || !item.sellerName || item.sellerName === currentPartnerName;
      const visibleInStore = isPartnerPortal || !item.status || !STORE_HIDDEN_STATUS_SET.has(item.status);
      return matchesPartner && visibleInStore && !item.isArchived;
    });

    if (isPartnerPortal) {
      return {
        all: baseItems.length,
        available: baseItems.filter(item => item.status === 'Available').length,
        storage: baseItems.filter(item => item.status === 'Storage').length,
        sold: baseItems.filter(item => item.status === 'Sold').length,
        inShipment: baseItems.filter(item => item.status === 'In transit').length,
        returnInTransit: baseItems.filter(item => item.status === 'In transit' && item.orderType === 'return').length,
        expired: baseItems.filter(item => item.isExpired).length
      };
    }

    return {
      all: baseItems.length,
      available: baseItems.filter(item =>
        item.status === 'Available' ||
        item.status === 'Missing' ||
        item.status === 'Broken' ||
        item.status === 'Sold' ||
        item.status === 'Returned'
      ).length,
      storage: baseItems.filter(item => item.status === 'Storage').length,
      expired: baseItems.filter(item => item.isExpired).length,
      inShipment: 0,
      sold: baseItems.filter(item => item.status === 'Sold').length,
      returnInTransit: baseItems.filter(item => item.status === 'In transit' && item.orderType === 'return').length
    };
  }, [items, isPartnerPortal, currentPartnerName]);

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

  const selectedItems = items.filter(item => item.selected);
  const canReturnSelectedItems =
    selectedItems.length > 0 &&
    selectedItems.every(
      (item) => !['In transit', 'Draft', 'Rejected', 'Returned'].includes(item.status)
    );

  const handleToggleSelect = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const handleSelectAll = () => {
    const allSelected = filteredItems.every(item => item.selected);
    setItems(prev => prev.map(item => 
      filteredItems.some(filtered => filtered.id === item.id) 
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
           itemFilters.priceRange[0] !== 0 ||
           itemFilters.priceRange[1] !== 1000 ||
           itemFilters.sortBy !== 'date-desc';
  };

  const handleReturnToSeller = () => {
    if (!canReturnSelectedItems) {
      toast.error('Items must be received before they can be returned.');
      return;
    }

    const itemsForReturn = selectedItems.map((item) => ({
      ...item,
      status: 'In transit' as Item['status'],
      orderType: 'return' as Item['orderType'],
      isExpired: false
    }));

    const selectedIds = new Set(itemsForReturn.map((item) => item.id));

    setItems((prev) =>
      prev.map((item) =>
        selectedIds.has(item.id)
          ? ({
              ...item,
              status: 'In transit',
              orderType: 'return' as Item['orderType'],
              selected: false,
              isExpired: false,
              location: 'In transit'
            } as Item)
          : item
      )
    );

    if (itemsForReturn.length > 0) {
      if (onCreateReturn) {
        onCreateReturn(itemsForReturn);
      } else {
        toast.success(`Returning ${itemsForReturn.length} items to seller`);
      }
    } else {
      toast.success('Return registered.');
    }
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
          location: 'In Store',
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
        break;
      case 'mark-missing':
        newStatus = 'Missing';
        successMessage = `Item ${item.itemId || item.id} marked as Missing`;
        break;
      case 'mark-broken':
        newStatus = 'Broken';
        successMessage = `Item ${item.itemId || item.id} marked as Broken`;
        break;
      case 'mark-rejected':
        if (!canRejectItem(fullItem)) {
          toast.error('Item can only be rejected within 24 hours of arriving in store.');
          return;
        }
        setItemToReject(fullItem);
        setRejectReason(rejectReasons[0]);
        setShowRejectDialog(true);
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

  const handleRejectDialogClose = () => {
    setShowRejectDialog(false);
    setItemToReject(null);
    setRejectReason(rejectReasons[0]);
  };

  const handleConfirmReject = () => {
    if (!itemToReject) return;
    const now = new Date();
    const isoTimestamp = now.toISOString();
    const formatted = formatTimestamp(now);
    setItems(prev =>
      prev.map(item =>
        item.id === itemToReject.id
          ? {
              ...item,
              status: 'Rejected',
              rejectReason,
              selected: false,
              date: item.date || isoTimestamp.slice(0, 10),
              statusHistory: [
                ...(item.statusHistory || []),
                {
                  status: 'Rejected',
                  timestamp: formatted,
                  user: 'Current User',
                  note: rejectReason
                }
              ]
            }
          : item
      )
    );
    toast.info(`Item ${itemToReject.itemId} marked as rejected (${rejectReason})`);
    handleRejectDialogClose();
  };

  const handleArchiveSelected = () => {
    const selectedIds = selectedItems.map(item => item.id);
    const archivedAt = new Date().toISOString();
    setItems(prev => prev.map(item => 
      selectedIds.includes(item.id) 
        ? ({ 
            ...item, 
            isArchived: true, 
            archivedAt, 
            selected: false,
            statusHistory: [
              ...(item.statusHistory || []),
              {
                status: item.status,
                timestamp: formatTimestamp(),
                user: 'Current User',
                note: 'Archive flag applied'
              }
            ]
          } as Item)
        : item
    ));
    toast.success(`${selectedItems.length} items archived successfully`);
  };

  const handleBulkEdit = () => {
    setShowBulkEditModal(true);
  };

  const handleBulkEditSave = (updates: Partial<Item>) => {
    const selectedIds = selectedItems.map(item => item.id);
    const priceReduction = (updates as any).priceReduction;
    const comment = (updates as any).comment;
    const statusChange = updates.status;
    
    setItems(prev => prev.map(item => {
      if (!selectedIds.includes(item.id)) return item;
      
      const itemUpdates: Partial<Item> = { ...updates, selected: false };
      
      // Calculate new price if price reduction is specified
      if (priceReduction && typeof priceReduction === 'number') {
        const reductionPercent = priceReduction / 100;
        itemUpdates.price = Math.round(item.price * (1 - reductionPercent) * 100) / 100;
        // Remove priceReduction from updates as it's not a real field
        delete (itemUpdates as any).priceReduction;
      }
      
      // Handle comment - add to statusHistory if status changed or if comment provided
      if (comment || (statusChange && statusChange !== item.status)) {
        const newHistoryEntry: StatusHistoryEntry = {
          status: (statusChange || item.status) as Item['status'],
          timestamp: formatTimestamp(),
          user: 'Current User',
          note: comment || undefined
        };
        
        itemUpdates.statusHistory = [
          ...(item.statusHistory || []),
          newHistoryEntry
        ];
        
        // Remove comment from updates as it's not a real field
        delete (itemUpdates as any).comment;
      }
      
      // Update lastInStoreAt if status changed to 'Available'
      if (statusChange === 'Available') {
        itemUpdates.lastInStoreAt = new Date().toISOString();
      }
      
      return { ...item, ...itemUpdates };
    }));
    
    const updateCount = Object.keys(updates).filter(key => 
      key !== 'priceReduction' && key !== 'comment' || 
      (key === 'priceReduction' && priceReduction) ||
      (key === 'comment' && comment)
    ).length;
    const reductionText = priceReduction ? ` with ${priceReduction}% price reduction` : '';
    toast.success(`${selectedItems.length} items updated${reductionText}`);
  };

  const handleItemClick = (item: Item) => {
    setSelectedItemForDetails(item);
  };

  const handleSaveItemDetails = (itemId: string, updates: Partial<ItemDetails>) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, ...updates };
        
        // If status changed, add to history
        if (updates.status && updates.status !== item.status) {
          const newHistoryEntry: StatusHistoryEntry = {
            status: updates.status,
            timestamp: formatTimestamp(),
            user: 'Current User'
          };
          
          updatedItem.statusHistory = [
            ...(item.statusHistory || []),
            newHistoryEntry
          ];

          if (updates.status === 'Available') {
            updatedItem.lastInStoreAt = new Date().toISOString();
          }
        }
        
        return updatedItem as Item;
      }
      return item;
    }));
    
    // Update the selected item for details to reflect changes
    setSelectedItemForDetails(prev => prev ? { ...prev, ...updates } as Item : null);
  };

  const handleBatchStatusUpdate = () => {
    if (batchNewStatus !== 'none') {
      const selectedIds = selectedItems.map(item => item.id);
      const timestamp = formatTimestamp();
      
      setItems(prev => prev.map(item => {
        if (selectedIds.includes(item.id)) {
          const newHistoryEntry: StatusHistoryEntry = {
            status: batchNewStatus,
            timestamp,
            user: 'Current User',
            note: batchStatusNote || undefined
          };
          
          return {
            ...item,
            status: batchNewStatus as Item['status'],
            selected: false,
            statusHistory: [
              ...(item.statusHistory || []),
              newHistoryEntry
            ],
            ...(batchNewStatus === 'Available' ? { lastInStoreAt: new Date().toISOString() } : {})
          } as Item;
        }
        return item;
      }));
      
      toast.success(`${selectedItems.length} items updated to ${batchNewStatus}`);
      setShowBatchStatusUpdate(false);
      setBatchNewStatus('none');
      setBatchStatusNote('');
    }
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
            
            {/* Filter Button - Partner Portal Only - Matching PartnerDashboard design */}
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
                  className={`
                    h-12 px-3 border transition-colors flex items-center gap-2 flex-shrink-0 rounded-[8px]
                    ${(viewFilter.brandIds?.length || 0) > 0 || 
                       (viewFilter.countryIds?.length || 0) > 0 || 
                       (viewFilter.storeIds?.length || 0) > 0
                      ? 'bg-secondary-container border-outline text-on-secondary-container'
                      : 'bg-surface border-outline text-on-surface-variant hover:bg-surface-container-high'
                    }
                  `}
                >
                  <FilterIcon size={20} />
                  <span className="label-medium">
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
          
          {/* Filter Chips Display - Partner Portal Only - Matching PartnerDashboard design */}
          {isPartnerPortal && ((viewFilter.brandIds?.length || 0) > 0 || 
            (viewFilter.countryIds?.length || 0) > 0 || 
            (viewFilter.storeIds?.length || 0) > 0) && (
            <div className="mt-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="label-small text-on-surface-variant">Active filters:</span>
                
                {/* Brand Filter Chips */}
                {viewFilter.brandIds && viewFilter.brandIds.length > 0 && 
                  brands.filter(b => viewFilter.brandIds!.includes(b.id)).map(brand => (
                    <div 
                      key={`brand-${brand.id}`} 
                      className="inline-flex items-center gap-1.5 px-2 py-1 bg-secondary-container text-on-secondary-container rounded-full label-small"
                    >
                      {brand.name}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewFilter({
                            ...viewFilter,
                            brandIds: viewFilter.brandIds?.filter(id => id !== brand.id)
                          });
                        }}
                        className="hover:opacity-70"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                }
                
                {/* Country Filter Chips */}
                {viewFilter.countryIds && viewFilter.countryIds.length > 0 && 
                  countries.filter(c => viewFilter.countryIds!.includes(c.id)).map(country => (
                    <div 
                      key={`country-${country.id}`} 
                      className="inline-flex items-center gap-1.5 px-2 py-1 bg-secondary-container text-on-secondary-container rounded-full label-small"
                    >
                      {country.name}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewFilter({
                            ...viewFilter,
                            countryIds: viewFilter.countryIds?.filter(id => id !== country.id)
                          });
                        }}
                        className="hover:opacity-70"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                }
                
                {/* Store Filter Chips */}
                {viewFilter.storeIds && viewFilter.storeIds.length > 0 && 
                  stores.filter(s => viewFilter.storeIds!.includes(s.id)).map(store => (
                    <div 
                      key={`store-${store.id}`} 
                      className="inline-flex items-center gap-1.5 px-2 py-1 bg-secondary-container text-on-secondary-container rounded-full label-small"
                    >
                      {store.name}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewFilter({
                            ...viewFilter,
                            storeIds: viewFilter.storeIds?.filter(id => id !== store.id)
                          });
                        }}
                        className="hover:opacity-70"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content - M3 Grid: 16px mobile, 24px tablet+ */}
      <div className="px-4 md:px-6 pt-4 md:pt-6">
        
        {/* Search Bar with Filter Icon */}
        <SearchBar 
          searchTerm={quickSearchTerm} 
          onSearchChange={setQuickSearchTerm}
          onFilterClick={() => setShowFilterSheet(true)}
        />
        
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
        
        {/* Multi-select Actions */}
        <MultiSelectActions 
          selectedCount={selectedItems.length}
          totalCount={filteredItems.length}
          isAllSelected={filteredItems.length > 0 && filteredItems.every(item => item.selected)}
          onReturnToSeller={handleReturnToSeller}
          onSelectAll={handleSelectAll}
          onArchive={handleArchiveSelected}
          onBulkEdit={handleBulkEdit}
        canReturn={canReturnSelectedItems}
        />
        
        {/* Items List */}
        <div className="space-y-0 mb-4">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="text-center">
                <h3 className="title-medium text-on-surface mb-2">No items found</h3>
                <p className="body-medium text-on-surface-variant">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {filteredItems.map((item) => (
                  <div key={item.id} className="bg-surface-container border border-outline-variant rounded-lg overflow-hidden">
                    <ItemCard
                      item={item}
                      onToggleSelect={handleToggleSelect}
                      onMoreActions={(baseItem, action) => handleMoreActions(baseItem as Item, action)}
                      onClick={(baseItem) => handleItemClick(baseItem as Item)}
                      showActions={true}
                      showSelection={true}
                      userRole={userRole ?? 'store-staff'}
                    />
                  </div>
                ))}
              </div>
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
      
      {/* Bulk Edit Modal */}
      <BulkEditModal 
        isOpen={showBulkEditModal}
        onClose={() => setShowBulkEditModal(false)}
        selectedItems={selectedItems}
        onSave={handleBulkEditSave}
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

      <Dialog open={showRejectDialog} onOpenChange={(open: boolean) => {
        if (!open) {
          handleRejectDialogClose();
        }
      }}>
        <DialogContent className="bg-surface border border-outline-variant rounded-xl max-w-[calc(100%-2rem)] sm:max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="title-large text-on-surface">
              Reject item
            </DialogTitle>
            <DialogDescription className="body-medium text-on-surface-variant">
              Select a reason to reject {itemToReject?.itemId || 'the item'}. Rejections are only allowed within 24 hours of receiving it in store.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {rejectReasons.map((reason) => (
              <label key={reason} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="reject-reason"
                  value={reason}
                  checked={rejectReason === reason}
                  onChange={() => setRejectReason(reason)}
                  className="accent-primary h-4 w-4"
                />
                <span className="body-medium text-on-surface">{reason}</span>
              </label>
            ))}
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleRejectDialogClose}
              className="w-full sm:w-auto sm:min-w-[120px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReject}
              className="w-full sm:w-auto sm:min-w-[140px] bg-error text-on-error hover:bg-error/90 focus:bg-error/90 active:bg-error/80"
            >
              Confirm rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Status Update Dialog */}
      <Dialog open={showBatchStatusUpdate} onOpenChange={setShowBatchStatusUpdate}>
        <DialogContent className="bg-surface border border-outline-variant rounded-xl max-w-[calc(100%-2rem)] sm:max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="title-large text-on-surface">
              Update status for {selectedItems.length} items
            </DialogTitle>
            <DialogDescription className="body-medium text-on-surface-variant">
              Change the status for all selected items at once
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* New Status */}
            <div>
              <label className="label-medium text-on-surface-variant mb-2 block">
                New status
              </label>
              <Select value={batchNewStatus} onValueChange={setBatchNewStatus}>
                <SelectTrigger className="bg-surface-container-high border border-outline rounded-lg min-h-[48px]">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select new status</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="In transit">In transit</SelectItem>
                  <SelectItem value="Storage">Storage</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                  <SelectItem value="Returned">Returned</SelectItem>
                  <SelectItem value="Missing">Missing</SelectItem>
                  <SelectItem value="Broken">Broken</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <label className="label-medium text-on-surface-variant mb-2 block">
                Add a note (optional)
              </label>
              <Textarea
                value={batchStatusNote}
                onChange={(e) => setBatchStatusNote(e.target.value)}
                placeholder="Add any additional notes..."
                className="bg-surface-container-high border border-outline rounded-lg resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowBatchStatusUpdate(false);
                setBatchNewStatus('none');
                setBatchStatusNote('');
              }}
              className="w-full sm:w-auto sm:min-w-[120px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBatchStatusUpdate}
              disabled={batchNewStatus === 'none'}
              className="w-full sm:w-auto sm:min-w-[120px]"
            >
              Update {selectedItems.length} items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}