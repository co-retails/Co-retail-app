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
import { ItemCard, BaseItem } from './ItemCard';
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
  status: 'In Store' | 'Pending' | 'To return' | 'Archived' | 'In Store 2nd try' | 'Sold' | 'Pick up' | 'Charity' | 'In transit' | 'Expired' | 'Missing' | 'Broken' | 'Return - In transit' | 'Rejected';
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
}

const STORE_HIDDEN_STATUSES: ReadonlyArray<Item['status']> = [
  'In transit',
  'Return - In transit'
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
    { id: 'in-shipment', label: 'In shipment', count: itemCounts.inShipment },
    { id: 'in-store', label: 'In store', count: itemCounts.inStore },
    { id: 'sold', label: 'Sold', count: itemCounts.sold },
    { id: 'return-in-transit', label: 'Return in transit', count: itemCounts.returnInTransit }
  ] : [
    { id: 'all', label: 'All', count: itemCounts.all },
    { id: 'in-store', label: 'In Store', count: itemCounts.inStore },
    { id: 'expired', label: 'To return', count: itemCounts.expired }
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
                <SelectItem value="In Store">In Store</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="To return">To return</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
                <SelectItem value="In Store 2nd try">In Store 2nd try</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Category Field */}
          <div className="space-y-2">
            <Label htmlFor="category" className="label-large text-on-surface">
              Category
            </Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-surface-container-high border border-outline rounded-lg min-h-[48px] body-large"
              placeholder="e.g. Hoodie, Dress, Shorts"
            />
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
    if (item.status !== 'In Store') return false;
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
    if (!isPartnerPortal && quickFilter === 'pending') {
      setQuickFilter('all');
    }
  }, [isPartnerPortal, quickFilter]);

  const [items, setItems] = useState<Item[]>([
    {
      id: '1',
      itemId: '684755',
      title: 'The bread and butter collection',
      brand: 'H&M',
      category: 'Hoodie',
      size: 'M',
      color: 'Gray',
      price: 10,
      status: 'In Store',
      date: '2022-06-09',
      deliveryId: '10000005',
      sellerName: 'Sellpy Operations',
      source: 'Sellpy Operations',
      thumbnail: 'https://images.unsplash.com/photo-1732475530169-70c2cda1712f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob29kaWUlMjBmYXNoaW9ufGVufDF8fHx8MTc2MTE5NDA5MHww&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      statusHistory: [
        { status: 'Pending', timestamp: '2022-06-09 10:30', user: 'Anna S.', note: 'Item received' },
        { status: 'In Store', timestamp: '2022-06-09 14:22', user: 'Anna S.', note: 'Ready for sale' }
      ],
      daysRemaining: 37
    },
    {
      id: '2',
      itemId: '684754',
      title: 'Summer dress collection',
      brand: 'Weekday',
      category: 'Dresses',
      size: '36',
      color: 'Blue',
      price: 12,
      status: 'In transit',
      date: '2022-06-09',
      sellerName: 'Sellpy Operations',
      source: 'Sellpy Operations',
      thumbnail: 'https://images.unsplash.com/photo-1613966570650-add3cf83aa83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBkcmVzc3xlbnwxfHx8fDE3NjEyMDc5MjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      statusHistory: [
        { status: 'Pending', timestamp: '2022-06-09 11:15', user: 'Anna S.' }
      ],
      daysRemaining: 37
    },
    {
      id: '3',
      itemId: '684753',
      title: 'Lucy Wood',
      brand: 'COS',
      category: 'Shorts',
      size: 'M',
      color: 'Black',
      price: 8,
      status: 'In Store',
      date: '2022-06-09',
      deliveryId: 'DEL-20220609-001',
      sellerName: 'Sellpy Operations',
      source: 'Sellpy Operations',
      thumbnail: 'https://images.unsplash.com/photo-1534445347662-670a224a28ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9ydHMlMjBmYXNoaW9ufGVufDF8fHx8MTc2MTI4OTQ0OHww&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      statusHistory: [
        { status: 'Pending', timestamp: '2022-06-09 09:45', user: 'Anna S.' },
        { status: 'In Store', timestamp: '2022-06-09 13:30', user: 'Anna S.' }
      ],
      daysRemaining: 37
    },
    {
      id: '4',
      itemId: '684752',
      title: 'John Smith',
      brand: 'ARKET',
      category: 'Shorts',
      size: 'M',
      color: 'White',
      price: 5,
      status: 'In Store 2nd try',
      date: '2022-06-10',
      deliveryId: 'DEL-20220608-002',
      sellerName: 'Thrifted',
      source: 'Thrifted',
      thumbnail: 'https://images.unsplash.com/photo-1566228015669-35f772688809?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHNob3J0c3xlbnwxfHx8fDE3NjEyODk0NDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      statusHistory: [
        { status: 'Pending', timestamp: '2022-06-08 14:20', user: 'John D.' },
        { status: 'In Store', timestamp: '2022-06-08 16:45', user: 'John D.' },
        { status: 'To return', timestamp: '2022-06-09 10:00', user: 'Anna S.', note: 'Not sold within time limit' },
        { status: 'In Store 2nd try', timestamp: '2022-06-10 09:15', user: 'Anna S.', note: 'Second attempt' }
      ],
      daysRemaining: 30
    },
    {
      id: '5',
      itemId: '684751',
      title: 'Thrifted items',
      brand: 'Monki',
      category: 'Tops',
      size: 'S',
      color: 'Red',
      price: 40,
      status: 'To return',
      date: '2022-06-10',
      deliveryId: 'DEL-20220605-003',
      sellerName: 'Thrifted',
      source: 'Thrifted',
      thumbnail: 'https://images.unsplash.com/photo-1761090617068-f1b3257d27ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwdG9wc3xlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      statusHistory: [
        { status: 'In transit', timestamp: '2022-06-05 11:00', user: 'John D.' },
        { status: 'In Store', timestamp: '2022-06-05 15:20', user: 'John D.' },
        { status: 'To return', timestamp: '2022-06-10 09:30', user: 'Anna S.', note: 'Expired - not sold' }
      ],
      daysRemaining: 30
    },
    {
      id: '6',
      itemId: '684750',
      title: 'Shenzhen Fashion Item',
      brand: 'H&M',
      category: 'Tops',
      size: 'L',
      color: 'Green',
      price: 15,
      status: 'In Store',
      date: '2022-06-11',
      deliveryId: 'DEL-20220611-001',
      sellerName: 'Shenzhen Fashion Manufacturing',
      source: 'Shenzhen Fashion Manufacturing',
      thumbnail: 'https://images.unsplash.com/photo-1761090617068-f1b3257d27ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwdG9wc3xlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      statusHistory: [
        { status: 'Pending', timestamp: '2022-06-11 08:00', user: 'Anna S.' },
        { status: 'In Store', timestamp: '2022-06-11 12:00', user: 'Anna S.' }
      ],
      daysRemaining: 40
    },
    {
      id: '7',
      itemId: '684749',
      title: 'Pending Fashion Item',
      brand: 'COS',
      category: 'Dresses',
      size: 'S',
      color: 'Pink',
      price: 20,
      status: 'In transit',
      date: '2022-06-12',
      sellerName: 'Shenzhen Fashion Manufacturing',
      source: 'Shenzhen Fashion Manufacturing',
      thumbnail: 'https://images.unsplash.com/photo-1613966570650-add3cf83aa83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBkcmVzc3xlbnwxfHx8fDE3NjEyMDc5MjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      statusHistory: [
        { status: 'Pending', timestamp: '2022-06-12 10:00', user: 'Anna S.' }
      ],
      daysRemaining: 45
    },
    {
      id: '8',
      itemId: '684748',
      title: 'Expired Item',
      brand: 'H&M',
      category: 'Tops',
      size: 'L',
      color: 'Green',
      price: 15,
      status: 'Expired',
      date: '2022-06-11',
      deliveryId: 'DEL-20220611-002',
      sellerName: 'Sellpy Operations',
      source: 'Sellpy Operations',
      thumbnail: 'https://images.unsplash.com/photo-1761090617068-f1b3257d27ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwdG9wc3xlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      statusHistory: [
        { status: 'In Store', timestamp: '2022-06-11 08:00', user: 'Anna S.' },
        { status: 'Expired', timestamp: '2022-06-25 12:00', user: 'System' }
      ],
      daysRemaining: 0
    },
    {
      id: '9',
      itemId: '684747',
      title: 'Missing Item',
      brand: 'COS',
      category: 'Shorts',
      size: 'M',
      color: 'Black',
      price: 18,
      status: 'Missing',
      date: '2022-06-10',
      deliveryId: 'DEL-20220610-001',
      sellerName: 'Sellpy Operations',
      source: 'Sellpy Operations',
      thumbnail: 'https://images.unsplash.com/photo-1534445347662-670a224a28ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9ydHMlMjBmYXNoaW9ufGVufDF8fHx8MTc2MTI4OTQ0OHww&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      statusHistory: [
        { status: 'Pending', timestamp: '2022-06-10 09:00', user: 'Anna S.' },
        { status: 'Missing', timestamp: '2022-06-10 14:00', user: 'John D.' }
      ],
      daysRemaining: 30
    },
    {
      id: '10',
      itemId: '684746',
      title: 'Broken Item',
      brand: 'ARKET',
      category: 'Tops',
      size: 'S',
      color: 'White',
      price: 22,
      status: 'Broken',
      date: '2022-06-11',
      deliveryId: 'DEL-20220611-003',
      sellerName: 'Sellpy Operations',
      source: 'Sellpy Operations',
      thumbnail: 'https://images.unsplash.com/photo-1761090617068-f1b3257d27ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwdG9wc3xlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      statusHistory: [
        { status: 'Pending', timestamp: '2022-06-11 10:00', user: 'Anna S.' },
        { status: 'Broken', timestamp: '2022-06-11 15:00', user: 'John D.' }
      ],
      daysRemaining: 35
    },
    {
      id: '11',
      itemId: '684745',
      title: 'Sold Item',
      brand: 'Monki',
      category: 'Dresses',
      size: 'M',
      color: 'Red',
      price: 25,
      status: 'Sold',
      date: '2022-06-08',
      deliveryId: 'DEL-20220608-001',
      sellerName: 'Sellpy Operations',
      source: 'Sellpy Operations',
      thumbnail: 'https://images.unsplash.com/photo-1613966570650-add3cf83aa83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBkcmVzc3xlbnwxfHx8fDE3NjEyMDc5MjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      statusHistory: [
        { status: 'In Store', timestamp: '2022-06-08 09:00', user: 'Anna S.' },
        { status: 'Sold', timestamp: '2022-06-08 16:30', user: 'System' }
      ],
      daysRemaining: 0
    },
    {
      id: '12',
      itemId: '684744',
      title: 'Item Without Image 1',
      brand: 'H&M',
      category: 'Tops',
      size: 'M',
      color: 'Blue',
      price: 18,
      status: 'In Store',
      date: '2022-06-12',
      deliveryId: 'DEL-20220612-001',
      sellerName: 'Sellpy Operations',
      source: 'Sellpy Operations',
      selected: false,
      statusHistory: [
        { status: 'Pending', timestamp: '2022-06-12 08:00', user: 'Anna S.' },
        { status: 'In Store', timestamp: '2022-06-12 14:00', user: 'Anna S.' }
      ],
      daysRemaining: 42
    },
    {
      id: '13',
      itemId: '684743',
      title: 'Item Without Image 2',
      brand: 'COS',
      category: 'Dresses',
      size: 'S',
      color: 'Black',
      price: 30,
      status: 'Pending',
      date: '2022-06-13',
      sellerName: 'Thrifted',
      source: 'Thrifted',
      selected: false,
      statusHistory: [
        { status: 'Pending', timestamp: '2022-06-13 09:00', user: 'John D.' }
      ],
      daysRemaining: 45
    },
    {
      id: '14',
      itemId: '684742',
      title: 'Item Without Image 3',
      brand: 'Weekday',
      category: 'Shorts',
      size: 'L',
      color: 'Gray',
      price: 12,
      status: 'In Store',
      date: '2022-06-13',
      deliveryId: 'DEL-20220613-001',
      sellerName: 'Sellpy Operations',
      source: 'Sellpy Operations',
      selected: false,
      statusHistory: [
        { status: 'Pending', timestamp: '2022-06-13 10:00', user: 'Anna S.' },
        { status: 'In Store', timestamp: '2022-06-13 16:00', user: 'Anna S.' }
      ],
      daysRemaining: 43
    },
    {
      id: '15',
      itemId: '684741',
      title: 'Return In Transit Item',
      brand: 'H&M',
      category: 'Hoodie',
      size: 'L',
      color: 'Gray',
      price: 30,
      status: 'In transit',
      date: '2022-06-13',
      orderType: 'return',
      sellerName: 'Sellpy Operations',
      source: 'Sellpy Operations',
      thumbnail: 'https://images.unsplash.com/photo-1732475530169-70c2cda1712f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob29kaWUlMjBmYXNoaW9ufGVufDF8fHx8MTc2MTE5NDA5MHww&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      statusHistory: [
        { status: 'To return', timestamp: '2022-06-13 08:00', user: 'Anna S.' },
        { status: 'In transit', timestamp: '2022-06-13 12:00', user: 'System' }
      ],
      daysRemaining: 40
    },
    // Additional items for Weekday Sweden Drottninggatan with various statuses
    {
      id: '13',
      itemId: '684743',
      title: 'Striped T-Shirt',
      brand: 'Weekday',
      category: 'Tops',
      size: 'M',
      color: 'Navy/White',
      price: 12,
      status: 'In Store',
      date: '2022-06-13',
      deliveryId: 'DEL-20220613-001',
      sellerName: 'Sellpy Operations',
      source: 'Sellpy Operations',
      thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0c2hpcnQlMjBzdHJpcGVkfGVufDF8fHx8MTc2MTI4OTQ0OXww&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      statusHistory: [
        { status: 'In transit', timestamp: '2022-06-13 08:00', user: 'System' },
        { status: 'In Store', timestamp: '2022-06-13 14:30', user: 'Anna S.' }
      ],
      daysRemaining: 42
    },
    {
      id: '14',
      itemId: '684742',
      title: 'Wide Leg Jeans',
      brand: 'Weekday',
      category: 'Jeans',
      size: '29/32',
      color: 'Dark Blue',
      price: 28,
      status: 'In transit',
      date: '2022-06-14',
      sellerName: 'Sellpy Operations',
      source: 'Sellpy Operations',
      thumbnail: 'https://images.unsplash.com/photo-1542272604-787c3835535d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZWFucyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      statusHistory: [
        { status: 'Pending', timestamp: '2022-06-14 09:00', user: 'System' }
      ],
      daysRemaining: 45
    },
    {
      id: '15',
      itemId: '684741',
      title: 'Knit Cardigan',
      brand: 'Weekday',
      category: 'Knitwear',
      size: 'L',
      color: 'Beige',
      price: 35,
      status: 'In Store',
      date: '2022-06-13',
      deliveryId: 'DEL-20220613-002',
      sellerName: 'Thrifted',
      source: 'Thrifted',
      thumbnail: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJkaWdhbiUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      statusHistory: [
        { status: 'In transit', timestamp: '2022-06-13 07:00', user: 'System' },
        { status: 'In Store', timestamp: '2022-06-13 13:45', user: 'John D.' }
      ],
      daysRemaining: 41
    },
    {
      id: '16',
      itemId: '684740',
      title: 'Midi Skirt',
      brand: 'Weekday',
      category: 'Skirts',
      size: 'S',
      color: 'Black',
      price: 22,
      status: 'To return',
      date: '2022-06-07',
      deliveryId: 'DEL-20220607-001',
      sellerName: 'Sellpy Operations',
      source: 'Sellpy Operations',
      thumbnail: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2lydCUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      statusHistory: [
        { status: 'In Store', timestamp: '2022-06-07 10:00', user: 'Anna S.' },
        { status: 'To return', timestamp: '2022-06-14 16:00', user: 'System', note: 'Expired - not sold' }
      ],
      daysRemaining: 0
    },
    {
      id: '17',
      itemId: '684739',
      title: 'Oversized Blazer',
      brand: 'Weekday',
      category: 'Jackets',
      size: 'M',
      color: 'Charcoal',
      price: 45,
      status: 'In Store 2nd try',
      date: '2022-06-08',
      deliveryId: 'DEL-20220608-003',
      sellerName: 'Thrifted',
      source: 'Thrifted',
      thumbnail: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGF6ZXIlMjBmYXNoaW9ufGVufDF8fHx8MTc2MTI4OTQ0OXww&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      statusHistory: [
        { status: 'In Store', timestamp: '2022-06-08 11:00', user: 'Anna S.' },
        { status: 'To return', timestamp: '2022-06-13 09:00', user: 'System', note: 'Not sold within time limit' },
        { status: 'In Store 2nd try', timestamp: '2022-06-14 10:00', user: 'John D.', note: 'Second attempt' }
      ],
      daysRemaining: 25
    },
    {
      id: '18',
      itemId: '684738',
      title: 'Leather Ankle Boots',
      brand: 'Weekday',
      category: 'Shoes',
      size: '38',
      color: 'Black',
      price: 55,
      status: 'Sold',
      date: '2022-06-10',
      deliveryId: 'DEL-20220610-002',
      sellerName: 'Sellpy Operations',
      source: 'Sellpy Operations',
      thumbnail: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib290cyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      statusHistory: [
        { status: 'In Store', timestamp: '2022-06-10 09:30', user: 'Anna S.' },
        { status: 'Sold', timestamp: '2022-06-12 15:20', user: 'System' }
      ],
      daysRemaining: 0
    },
    {
      id: '19',
      itemId: '684737',
      title: 'Cropped Hoodie',
      brand: 'Weekday',
      category: 'Hoodies',
      size: 'XS',
      color: 'Light Grey',
      price: 18,
      status: 'Missing',
      date: '2022-06-11',
      deliveryId: 'DEL-20220611-004',
      sellerName: 'Sellpy Operations',
      source: 'Sellpy Operations',
      thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob29kaWUlMjBmYXNoaW9ufGVufDF8fHx8MTc2MTI4OTQ0OXww&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      statusHistory: [
        { status: 'In transit', timestamp: '2022-06-11 08:00', user: 'System' },
        { status: 'Missing', timestamp: '2022-06-11 16:00', user: 'John D.', note: 'Item not found during receiving' }
      ],
      daysRemaining: 38
    },
    {
      id: '20',
      itemId: '684736',
      title: 'Denim Jacket',
      brand: 'Weekday',
      category: 'Jackets',
      size: 'M',
      color: 'Light Wash',
      price: 38,
      status: 'In transit',
      date: '2022-06-14',
      sellerName: 'Sellpy Operations',
      source: 'Sellpy Operations',
      thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldHxlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      statusHistory: [
        { status: 'Pending', timestamp: '2022-06-14 07:30', user: 'System' }
      ],
      daysRemaining: 45
    },
    {
      id: '21',
      itemId: '684735',
      title: 'Turtleneck Sweater',
      brand: 'Weekday',
      category: 'Knitwear',
      size: 'M',
      color: 'Cream',
      price: 30,
      status: 'Broken',
      date: '2022-06-12',
      deliveryId: 'DEL-20220612-002',
      sellerName: 'Thrifted',
      source: 'Thrifted',
      thumbnail: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2VhdGVyJTIwZmFzaGlvbnxlbnwxfHx8fDE3NjEyODk0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      statusHistory: [
        { status: 'In transit', timestamp: '2022-06-12 08:00', user: 'System' },
        { status: 'Broken', timestamp: '2022-06-12 14:00', user: 'Anna S.', note: 'Damaged during shipping' }
      ],
      daysRemaining: 40
    },
    {
      id: '22',
      itemId: '684734',
      title: 'High Waist Trousers',
      brand: 'Weekday',
      category: 'Trousers',
      size: '28',
      color: 'Olive',
      price: 32,
      status: 'Rejected',
      date: '2022-06-13',
      deliveryId: 'DEL-20220613-003',
      sellerName: 'Sellpy Operations',
      source: 'Sellpy Operations',
      lastInStoreAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      thumbnail: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm91c2VycyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMjg5NDQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      selected: false,
      rejectReason: 'Broken on arrival',
      statusHistory: [
        { status: 'In Store', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), user: 'John D.' },
        { status: 'Rejected', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), user: 'John D.', note: 'Broken on arrival' }
      ],
      daysRemaining: 0
    }
  ]);

  useEffect(() => {
    setItems(prev =>
      prev.map(item => {
        if (item.status === 'In Store' && !item.lastInStoreAt) {
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
        // Partner portal filters
        if (quickFilter === 'in-shipment') {
          matchesQuickFilter = item.status === 'In transit' || item.status === 'Return - In transit';
        } else if (quickFilter === 'in-store') {
          matchesQuickFilter = item.status === 'In Store' || 
                               item.status === 'In Store 2nd try' || 
                               item.status === 'Expired' || 
                               item.status === 'Missing' || 
                               item.status === 'Broken';
        } else if (quickFilter === 'sold') {
          matchesQuickFilter = item.status === 'Sold';
        } else if (quickFilter === 'return-in-transit') {
          matchesQuickFilter = (item.status === 'In transit' || item.status === 'Return - In transit') && item.orderType === 'return';
        }
      } else {
        // Store app filters
        matchesQuickFilter = 
          (quickFilter === 'in-store' && (
            item.status === 'In Store' || 
            item.status === 'In Store 2nd try' ||
            item.status === 'Missing' ||
            item.status === 'Broken' ||
            item.status === 'Sold' ||
            item.status === 'Expired'
          )) ||
          (quickFilter === 'expired' && (item.status === 'To return' || item.status === 'Rejected'));
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
      // Remove deliveryId from items with status "Pending"
      if (item.status === 'Pending') {
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
      return matchesPartner && visibleInStore;
    });

    if (isPartnerPortal) {
      return {
        all: baseItems.length,
        inShipment: baseItems.filter(item => item.status === 'In transit' || item.status === 'Return - In transit').length,
        inStore: baseItems.filter(item => 
          item.status === 'In Store' || 
          item.status === 'In Store 2nd try' || 
          item.status === 'Expired' || 
          item.status === 'Missing' || 
          item.status === 'Broken'
        ).length,
        sold: baseItems.filter(item => item.status === 'Sold').length,
        returnInTransit: baseItems.filter(item => (item.status === 'In transit' || item.status === 'Return - In transit') && item.orderType === 'return').length,
        // Keep old keys for backward compatibility
        pending: baseItems.filter(item => item.status === 'In transit' || item.status === 'Return - In transit').length,
        expired: baseItems.filter(item => item.status === 'To return' || item.status === 'Rejected').length
      };
    } else {
      // Store app filter counts - need to count all items in their proper categories
      return {
        all: baseItems.length,
        inStore: baseItems.filter(item => 
          item.status === 'In Store' || 
          item.status === 'In Store 2nd try' ||
          item.status === 'Missing' || 
          item.status === 'Broken' ||
          item.status === 'Sold' ||
          item.status === 'Expired'
        ).length,
        expired: baseItems.filter(item => 
          item.status === 'To return' || 
          item.status === 'Rejected'
        ).length,
        // Partner portal keys (for compatibility)
        inShipment: 0,
        sold: 0,
        returnInTransit: 0
      };
    }
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
          if (existingTimestamp !== undefined && existingTimestamp >= incomingTimestamp && item.status === 'In Store') {
            return item;
          }
          return {
            ...item,
            status: 'In Store',
            date: isoTimestamp.slice(0, 10),
            lastInStoreAt: isoTimestamp,
            rejectReason: undefined,
            statusHistory: [
              ...(item.statusHistory || []),
              {
                status: 'In Store',
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
      (item) => item.status !== 'In transit' && item.status !== 'Return - In transit' && item.status !== 'Rejected'
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
      status: 'Return - In transit' as Item['status'],
      orderType: 'return' as Item['orderType']
    }));

    const selectedIds = new Set(itemsForReturn.map((item) => item.id));

    setItems((prev) =>
      prev.map((item) =>
        selectedIds.has(item.id)
          ? ({
              ...item,
              status: 'Return - In transit',
              orderType: 'return' as Item['orderType'],
              selected: false
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

  const handleMoreActions = (item: Item, action: 'in-store' | 'store-transfer' | 'sold' | 'missing' | 'broken' | 'rejected' | 'in-store-2nd-try') => {
    const fullItem = items.find(i => i.id === item.id);
    if (!fullItem) return;

    let newStatus: Item['status'];
    let successMessage: string;

    switch (action) {
      case 'in-store':
        newStatus = 'In Store';
        successMessage = `Item ${item.itemId || item.id} marked as In Store`;
        break;
      case 'store-transfer':
        newStatus = 'In transit'; // Store transfer might need a different status, using In transit for now
        successMessage = `Item ${item.itemId || item.id} marked for store transfer`;
        break;
      case 'sold':
        newStatus = 'Sold';
        successMessage = `Item ${item.itemId || item.id} marked as Sold`;
        break;
      case 'missing':
        newStatus = 'Missing';
        successMessage = `Item ${item.itemId || item.id} marked as Missing`;
        break;
      case 'broken':
        newStatus = 'Broken';
        successMessage = `Item ${item.itemId || item.id} marked as Broken`;
        break;
      case 'rejected':
        if (!canRejectItem(fullItem)) {
          toast.error('Item can only be rejected within 24 hours of arriving in store.');
          return;
        }
        setItemToReject(fullItem);
        setRejectReason(rejectReasons[0]);
        setShowRejectDialog(true);
        return;
      case 'in-store-2nd-try':
        newStatus = 'In Store 2nd try';
        successMessage = `Item ${item.itemId || item.id} marked as In Store 2nd try`;
        break;
      default:
        return;
    }

    handleSaveItemDetails(fullItem.id, { status: newStatus });
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
    setItems(prev => prev.map(item => 
      selectedIds.includes(item.id) 
        ? ({ ...item, status: 'Archived', selected: false } as Item)
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
      
      // Update lastInStoreAt if status changed to 'In Store'
      if (statusChange === 'In Store') {
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

          if (updates.status === 'In Store') {
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
            ...(batchNewStatus === 'In Store' ? { lastInStoreAt: new Date().toISOString() } : {})
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
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Store">In Store</SelectItem>
                  <SelectItem value="In Store 2nd try">In Store 2nd try</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                  <SelectItem value="To return">To return</SelectItem>
                  <SelectItem value="Pick up">Pick up</SelectItem>
                  <SelectItem value="Charity">Charity</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
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