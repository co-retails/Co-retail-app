import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ArrowLeft, X, MoreVertical, CheckCircle, RefreshCw } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { StockItem, StockCheckSession } from './StockCheckScreen';
import { ItemCard, BaseItem } from './ItemCard';
import svgPaths from "../imports/svg-7un8q74kd7";
import svgPathsNew from "../imports/svg-9jzmb4i3sv";
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from './ui/sheet';

interface StockCheckReviewScreenProps {
  session: StockCheckSession;
  onBack: () => void;
  onUpdateItemStatus: (itemId: string, newStatus: 'Missing' | 'Found' | 'Available' | 'Broken') => void;
}

type ReviewTab = 'not-scanned' | 'not-found' | 'all-included' | 'scanned';

function TopAppBar({ onBack, onClose }: { onBack: () => void; onClose?: () => void }) {
  return (
    <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
      <div className="flex items-center h-16 px-4 md:px-6">
        {/* Leading icon - Back button */}
        <button 
          className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors mr-2"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-on-surface" />
        </button>
        
        {/* Title */}
        <h1 className="title-large text-on-surface flex-1">
          Review items
        </h1>
        
        {/* Trailing icon - Close (optional) */}
        {onClose && (
          <button 
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-6 h-6 text-on-surface" />
          </button>
        )}
      </div>
    </div>
  );
}

function ReviewInstructions({ reportDate }: { reportDate: string }) {
  return (
    <div className="px-4 md:px-6 pt-4 md:pt-6 pb-6 space-y-2">
      <p className="body-medium text-on-surface-variant">
        Investigate and update item status below where needed
      </p>
      <p className="body-medium text-on-surface">
        Report date: {reportDate}
      </p>
      <p className="body-medium text-on-surface-variant">
        Item status: Current
      </p>
    </div>
  );
}

function FilterChips({ 
  activeTab, 
  onTabChange, 
  counts,
  showExpiredOnly,
  onToggleExpiredFilter
}: { 
  activeTab: ReviewTab; 
  onTabChange: (tab: ReviewTab) => void;
  counts: Record<ReviewTab, number>;
  showExpiredOnly: boolean;
  onToggleExpiredFilter: () => void;
}) {
  const filters: Array<{ id: ReviewTab; label: string }> = [
    { id: 'not-scanned', label: 'Not scanned' },
    { id: 'not-found', label: 'Not found' },
    { id: 'scanned', label: 'Scanned' }
  ];
  
  const allIncludedFilter = { id: 'all-included' as ReviewTab, label: 'All included' };

  return (
    <div className="px-4 md:px-6 py-3 bg-surface border-b border-outline-variant">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide justify-between">
        <div className="flex gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={`flex-shrink-0 px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                activeTab === filter.id
                  ? 'bg-secondary-container border-secondary text-on-secondary-container'
                  : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest'
              }`}
              onClick={() => onTabChange(filter.id)}
            >
              <span className="label-medium">
                {filter.label} ({counts[filter.id]})
              </span>
            </button>
          ))}
        </div>
        <button
          key={allIncludedFilter.id}
          className={`flex-shrink-0 px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${
            activeTab === allIncludedFilter.id
              ? 'bg-secondary-container border-secondary text-on-secondary-container'
              : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest'
          }`}
          onClick={() => onTabChange(allIncludedFilter.id)}
        >
          <span className="label-medium">
            {allIncludedFilter.label} ({counts[allIncludedFilter.id]})
          </span>
        </button>
      </div>
      {/* Expired filter toggle - only show in scanned tab */}
      {activeTab === 'scanned' && (
        <div className="mt-3 pt-3 border-t border-outline-variant">
          <div className="flex items-center gap-3">
            <Checkbox
              id="expired-filter"
              checked={showExpiredOnly}
              onCheckedChange={() => onToggleExpiredFilter()}
            />
            <Label htmlFor="expired-filter" className="body-medium text-on-surface cursor-pointer">
              Show only expired
            </Label>
          </div>
        </div>
      )}
    </div>
  );
}

function BulkActionsBar({
  selectedCount,
  totalCount,
  isAllSelected,
  onToggleAll,
  onBulkAction,
  onClearSelection,
  activeTab,
  onUnflagExpired
}: {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  onToggleAll: () => void;
  onBulkAction: (status: 'Missing' | 'Available' | 'Broken') => void;
  onClearSelection: () => void;
  activeTab: ReviewTab;
  onUnflagExpired: () => void;
}) {
  const hasSelectedItems = selectedCount > 0;
  
  // Don't show multiselect for 'all-included' and 'not-found' tabs
  if (activeTab === 'all-included' || activeTab === 'not-found') {
    return null;
  }

  // Get menu options based on active tab
  const getMenuOptions = () => {
    switch (activeTab) {
      case 'not-scanned':
        return [
          { label: 'Missing', status: 'Missing' as const, className: 'text-error' }
        ];
      case 'not-found':
        return [
          { label: 'Available', status: 'Available' as const, className: 'text-on-surface' }
        ];
      case 'scanned':
        return [
          { label: 'Available', status: 'Available' as const, className: 'text-on-surface' },
          { label: 'Broken', status: 'Broken' as const, className: 'text-error' }
        ];
      default:
        return [];
    }
  };

  const menuOptions = getMenuOptions();

  return (
    <div className={`sticky top-0 z-10 border-b border-outline-variant ${
      hasSelectedItems ? 'bg-primary-container' : 'bg-surface-container'
    }`}>
      <div className="flex items-center justify-between px-1 py-3 min-h-[48px]">
        {/* Left side - Select all and count */}
        <div className="flex items-center gap-3">
          <button 
            className="p-3 rounded-lg hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors min-w-[48px] min-h-[48px] touch-manipulation"
            onClick={onToggleAll}
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
          
          <div className={`body-medium font-normal ${
            hasSelectedItems ? 'text-on-primary-container' : 'text-on-surface'
          }`}>
            {hasSelectedItems 
              ? `${selectedCount} selected`
              : `${totalCount} ${totalCount === 1 ? 'item' : 'items'}`
            }
          </div>
        </div>
        
        {/* Right side - Actions (only show when items are selected) */}
        {hasSelectedItems && menuOptions.length > 0 && (
          <div className="flex items-center gap-2">
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
                {menuOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.status}
                    onClick={() => onBulkAction(option.status)}
                    className={`cursor-pointer ${option.className}`}
                  >
                    <span>{option.label}</span>
                  </DropdownMenuItem>
                ))}
                {/* Unflag expired option - only show in scanned tab */}
                {activeTab === 'scanned' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onUnflagExpired}
                      className="cursor-pointer"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      <span>Unflag expired</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}

function NotFoundItemCard({ itemId }: { itemId: string }) {
  return (
    <div className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3">
      <span className="body-large text-on-surface">{itemId}</span>
    </div>
  );
}

function ReviewItemCard({ 
  item, 
  onUpdateStatus,
  onMoreActions,
  isSelected,
  onToggleSelect,
  activeTab
}: { 
  item: StockItem; 
  onUpdateStatus: (itemId: string, status: 'Missing' | 'Found' | 'Available' | 'Broken') => void;
  onMoreActions: (itemId: string) => void;
  isSelected: boolean;
  onToggleSelect: (itemId: string) => void;
  activeTab: ReviewTab;
}) {
  // Get menu options based on active tab
  const getMenuOptions = () => {
    switch (activeTab) {
      case 'not-scanned':
        return [
          { label: 'Missing', status: 'Missing' as const, className: 'text-error' }
        ];
      case 'not-found':
        return []; // No actions for not-found items
      case 'scanned':
        return [
          { label: 'Available', status: 'Available' as const, className: 'text-on-surface' },
          { label: 'Broken', status: 'Broken' as const, className: 'text-error' }
        ];
      case 'all-included':
        return [];
      default:
        return [];
    }
  };

  const menuOptions = getMenuOptions();

  return (
    <div className="w-full bg-surface-container border border-outline-variant rounded-lg overflow-hidden">
      <div className={`flex items-center py-3 ${activeTab === 'all-included' ? 'px-4' : 'px-1'}`}>
        {/* Leading element - Checkbox for bulk selection (hidden for all-included and not-found tabs) */}
        {activeTab !== 'all-included' && activeTab !== 'not-found' && (
          <div className="flex items-center justify-center flex-shrink-0">
            <button 
              className="p-3 rounded-lg hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
              onClick={() => onToggleSelect(item.id)}
              aria-label={isSelected ? 'Deselect item' : 'Select item'}
            >
              <div className="relative w-6 h-6">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
                  <path 
                    clipRule="evenodd" 
                    d={isSelected ? svgPaths.p181a1800 : svgPaths.p3e435600} 
                    fill={isSelected ? "var(--primary)" : "var(--outline-variant)"} 
                    fillRule="evenodd" 
                  />
                </svg>
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-3 h-3" fill="white" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          </div>
        )}
        
        {/* Main content using standardized ItemCard - same as ItemsScreen */}
        <div className="flex-1">
          <ItemCard
            item={{
              id: item.id,
              itemId: item.itemId,
              title: item.title,
              brand: item.brand,
              category: item.category,
              size: item.size,
              color: item.color,
              price: item.price,
              status: item.status,
              date: item.date,
              thumbnail: item.thumbnail,
              orderNumber: item.orderNumber,
              boxLabel: item.boxLabel
            } as BaseItem}
            variant="items-list"
            showActions={false}
            showSelection={false}
          />
        </div>
        
        {/* Trailing element - Actions only (price removed) */}
        {menuOptions.length > 0 && (
          <div className="flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="p-3 rounded-lg hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
                  aria-label="More actions"
                >
                  <svg className="w-6 h-6" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                    <path d={svgPathsNew.p3fdba000} fill="var(--on-surface)" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Item actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {menuOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.status}
                    onClick={() => onUpdateStatus(item.id, option.status)}
                    className={`cursor-pointer ${option.className}`}
                  >
                    <span>{option.label}</span>
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

function ItemsList({ 
  items, 
  onUpdateStatus,
  onMoreActions,
  selectedItems,
  onToggleSelect,
  onToggleAll,
  activeTab
}: {
  items: StockItem[];
  onUpdateStatus: (itemId: string, status: 'Missing' | 'Found' | 'Available' | 'Broken') => void;
  onMoreActions: (itemId: string) => void;
  selectedItems: Set<string>;
  onToggleSelect: (itemId: string) => void;
  onToggleAll: () => void;
  activeTab: ReviewTab;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <CheckCircle className="w-16 h-16 text-on-surface-variant mb-4" />
        <h3 className="title-medium text-on-surface mb-2">
          No items in this category
        </h3>
        <p className="body-medium text-on-surface-variant text-center">
          All items have been processed
        </p>
      </div>
    );
  }

  // For not-found tab, show only item IDs
  if (activeTab === 'not-found') {
    return (
      <div className="mb-4 mx-4 md:mx-6">
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <NotFoundItemCard key={item.id} itemId={item.itemId} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-4 ${
      activeTab === 'all-included' ? 'mx-4 md:mx-6' : 'mx-4'
    }`}>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <ReviewItemCard 
            key={item.id}
            item={item} 
            onUpdateStatus={onUpdateStatus}
            onMoreActions={onMoreActions}
            isSelected={selectedItems.has(item.id)}
            onToggleSelect={onToggleSelect}
            activeTab={activeTab}
          />
        ))}
      </div>
    </div>
  );
}

function BulkExpiredFlagSheet({ 
  isOpen, 
  onClose, 
  expiredItemsCount,
  onUnflagExpired,
  onKeepExpiredFlag
}: {
  isOpen: boolean;
  onClose: () => void;
  expiredItemsCount: number;
  onUnflagExpired: () => void;
  onKeepExpiredFlag: () => void;
}) {
  const [option, setOption] = useState<'unflag' | 'keep'>('unflag');
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
      setOption('unflag'); // Reset to default when sheet opens
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (option === 'unflag') {
      onUnflagExpired();
    } else {
      onKeepExpiredFlag();
    }
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
            Handle Expired Flags
          </SheetTitle>
          <SheetDescription className="body-medium text-on-surface-variant">
            {expiredItemsCount} of the selected items have expired flags. Choose how to handle them.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {/* Unflag Expired Option (Default) */}
          <button
            onClick={() => setOption('unflag')}
            className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
              option === 'unflag'
                ? 'border-primary bg-primary-container text-on-primary-container'
                : 'border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                option === 'unflag'
                  ? 'border-on-primary-container bg-on-primary-container'
                  : 'border-on-surface-variant'
              }`}>
                {option === 'unflag' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-container" />
                )}
              </div>
              <div className="flex-1">
                <div className="title-small text-on-surface mb-1">
                  Unflag expired
                </div>
                <div className="body-small text-on-surface-variant">
                  Remove the expired flag from all selected items
                </div>
              </div>
            </div>
          </button>

          {/* Keep Expired Flag Option */}
          <button
            onClick={() => setOption('keep')}
            className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
              option === 'keep'
                ? 'border-primary bg-primary-container text-on-primary-container'
                : 'border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                option === 'keep'
                  ? 'border-on-primary-container bg-on-primary-container'
                  : 'border-on-surface-variant'
              }`}>
                {option === 'keep' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-container" />
                )}
              </div>
              <div className="flex-1">
                <div className="title-small text-on-surface mb-1">
                  Keep expired flag
                </div>
                <div className="body-small text-on-surface-variant">
                  Keep the expired flag on all selected items
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
            onClick={handleConfirm}
            className="flex-1 bg-primary hover:bg-primary/90 text-on-primary rounded-lg min-h-[48px] label-large touch-manipulation"
          >
            Confirm
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default function StockCheckReviewScreen({ 
  session, 
  onBack, 
  onUpdateItemStatus 
}: StockCheckReviewScreenProps) {
  const [activeTab, setActiveTab] = useState<ReviewTab>('not-scanned');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showExpiredFlagSheet, setShowExpiredFlagSheet] = useState(false);
  const [showExpiredOnly, setShowExpiredOnly] = useState(false);
  const [pendingBulkAction, setPendingBulkAction] = useState<{
    status: 'Missing' | 'Available' | 'Broken';
    expiredItemsCount: number;
  } | null>(null);

  // Use items from session if available, otherwise generate mock data
  const [reviewItems, setReviewItems] = useState<StockItem[]>(() => {
    if (session.items && session.items.length > 0) {
      return session.items;
    }
    
    // Fallback to mock items for demonstration
    const mockItems: StockItem[] = [];
    const brands = ['H&M', 'Weekday', 'COS', 'Monki'];
    const statuses: Array<StockItem['status']> = ['Available', 'Missing', 'Broken'];
    const boxLabels = ['BOX-123456', 'BOX-789012', 'BOX-987654', 'BOX-456789', 'BOX-234567'];
    
    for (let i = 1; i <= 20; i++) {
      mockItems.push({
        id: `review-item-${i}`,
        itemId: `${34780000 + i}`,
        title: `Review Item ${i}`,
        brand: brands[Math.floor(Math.random() * brands.length)],
        size: 'M',
        color: 'Various',
        price: Math.floor(Math.random() * 50) + 10,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        orderNumber: `${100000 + i}`,
        date: '2024-12-09',
        isScanned: Math.random() > 0.5,
        isSelected: false,
        boxLabel: boxLabels[Math.floor(Math.random() * boxLabels.length)]
      });
    }
    return mockItems;
  });

  // Filter items by tab
  const getFilteredItems = (tab: ReviewTab): StockItem[] => {
    let filtered: StockItem[] = [];
    switch (tab) {
      case 'not-scanned':
        // Show all items that are not scanned, regardless of status
        filtered = reviewItems.filter(item => !item.isScanned);
        break;
      case 'not-found':
        // Show scanned items that don't exist in the store app (unexpected items)
        filtered = reviewItems.filter(item => item.isScanned && item.id.startsWith('unexpected-item-'));
        break;
      case 'all-included':
        filtered = reviewItems; // All items
        break;
      case 'scanned':
        // Show all scanned items, regardless of status
        filtered = reviewItems.filter(item => item.isScanned && !item.id.startsWith('unexpected-item-'));
        // Apply expired filter if active
        if (showExpiredOnly) {
          filtered = filtered.filter(item => item.isExpired === true);
        }
        break;
      default:
        filtered = [];
    }
    return filtered;
  };

  // Get counts for each tab
  const getCounts = (): Record<ReviewTab, number> => {
    const scannedItems = reviewItems.filter(item => item.isScanned && !item.id.startsWith('unexpected-item-'));
    return {
      'not-scanned': reviewItems.filter(item => !item.isScanned).length,
      'not-found': reviewItems.filter(item => item.isScanned && item.id.startsWith('unexpected-item-')).length,
      'all-included': reviewItems.length,
      'scanned': showExpiredOnly 
        ? scannedItems.filter(item => item.isExpired === true).length
        : scannedItems.length
    };
  };

  const handleToggleSelect = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleToggleAll = () => {
    const currentItems = getFilteredItems(activeTab);
    const currentItemIds = currentItems.map(item => item.id);
    const allSelected = currentItemIds.every(id => selectedItems.has(id));
    
    if (allSelected) {
      // Deselect all items in current tab
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        currentItemIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    } else {
      // Select all items in current tab
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        currentItemIds.forEach(id => newSet.add(id));
        return newSet;
      });
    }
  };

  const handleBulkAction = (status: 'Missing' | 'Available' | 'Broken') => {
    // Check if we're marking items as 'Available' in the 'scanned' tab and if any have expired flags
    if (status === 'Available' && activeTab === 'scanned') {
      const selectedItemsList = Array.from(selectedItems);
      const expiredItems = reviewItems.filter(
        item => selectedItemsList.includes(item.id) && item.isExpired
      );
      
      if (expiredItems.length > 0) {
        // Show the expired flag sheet
        setPendingBulkAction({ status, expiredItemsCount: expiredItems.length });
        setShowExpiredFlagSheet(true);
        return;
      }
    }
    
    // Apply the status update directly if no expired flags
    applyBulkStatusUpdate(status, false);
  };

  const applyBulkStatusUpdate = (status: 'Missing' | 'Available' | 'Broken', unflagExpired: boolean) => {
    const selectedCount = selectedItems.size;
    let updatedCount = 0;
    
    setReviewItems(prev => prev.map(item => {
      if (selectedItems.has(item.id)) {
        updatedCount++;
        // Keep isScanned as is - don't change it based on status update
        // Items should stay in their current tab (Not scanned, Scanned, etc.)
        const updatedItem = {
          ...item,
          status: status,
          // isScanned remains unchanged so items stay in same tab
          ...(unflagExpired && item.isExpired ? {
            isExpired: false,
            expiredFlaggedAt: undefined,
            expiredPostponeWeeks: undefined
          } : {})
        } as StockItem;
        onUpdateItemStatus(item.id, status);
        return updatedItem;
      }
      return item;
    }));
    
    // Show success message for Available or Missing status updates
    if ((status === 'Available' || status === 'Missing') && updatedCount > 0) {
      const statusText = status === 'Available' ? 'Available' : 'Missing';
      toast.success(
        `${updatedCount} ${updatedCount === 1 ? 'item' : 'items'} successfully updated to ${statusText}`
      );
    }
    
    setSelectedItems(new Set());
    setPendingBulkAction(null);
  };

  const handleUnflagExpired = () => {
    if (pendingBulkAction) {
      applyBulkStatusUpdate(pendingBulkAction.status, true);
    }
  };

  const handleKeepExpiredFlag = () => {
    if (pendingBulkAction) {
      applyBulkStatusUpdate(pendingBulkAction.status, false);
    }
  };

  const handleUnflagExpiredBulk = () => {
    const selectedCount = selectedItems.size;
    let updatedCount = 0;
    
    setReviewItems(prev => prev.map(item => {
      if (selectedItems.has(item.id) && item.isExpired) {
        updatedCount++;
        return {
          ...item,
          isExpired: false,
          expiredFlaggedAt: undefined,
          expiredPostponeWeeks: undefined
        } as StockItem;
      }
      return item;
    }));
    
    if (updatedCount > 0) {
      toast.success(
        `${updatedCount} ${updatedCount === 1 ? 'item' : 'items'} successfully unflagged`
      );
    }
    
    setSelectedItems(new Set());
  };

  const handleUpdateStatus = (itemId: string, newStatus: 'Missing' | 'Found' | 'Available' | 'Broken') => {
    setReviewItems(prev => prev.map(item => {
      if (item.id === itemId) {
        // Keep isScanned as is - don't change it based on status update
        // Items should stay in their current tab (Not scanned, Scanned, etc.)
        const updatedItem = {
          ...item,
          status: newStatus
          // isScanned remains unchanged so item stays in same tab
        } as StockItem;
        return updatedItem;
      }
      return item;
    }));

    // Call parent handler - convert statuses appropriately
    const parentStatus = newStatus === 'Found' || newStatus === 'Available' 
      ? 'Available' 
      : newStatus;
    onUpdateItemStatus(itemId, parentStatus as 'Missing' | 'Found' | 'Available' | 'Broken');
  };

  const handleMoreActions = (itemId: string) => {
    const item = reviewItems.find(i => i.id === itemId);
    if (item) {
      alert(`More actions for ${item.itemId}: Update location, Mark as damaged, etc.`);
    }
  };

  const currentItems = getFilteredItems(activeTab);
  const counts = getCounts();

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* Top App Bar */}
      <TopAppBar onBack={onBack} />
      
      {/* Content */}
      <div className="flex-1">
        {/* Instructions */}
        <ReviewInstructions reportDate={session.date} />
        
        {/* Filter Chips */}
        <FilterChips 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            setActiveTab(tab);
            // Clear selection when changing tabs
            setSelectedItems(new Set());
            // Reset expired filter when leaving scanned tab
            if (tab !== 'scanned') {
              setShowExpiredOnly(false);
            }
          }}
          counts={counts}
          showExpiredOnly={showExpiredOnly}
          onToggleExpiredFilter={() => {
            setShowExpiredOnly(prev => !prev);
            // Clear selection when toggling filter
            setSelectedItems(new Set());
          }}
        />
        
        {/* Bulk Actions Bar - moved below tabs */}
        <BulkActionsBar
          selectedCount={selectedItems.size}
          totalCount={currentItems.length}
          isAllSelected={currentItems.length > 0 && currentItems.every(item => selectedItems.has(item.id))}
          onToggleAll={handleToggleAll}
          onBulkAction={handleBulkAction}
          onClearSelection={() => setSelectedItems(new Set())}
          activeTab={activeTab}
          onUnflagExpired={handleUnflagExpiredBulk}
        />
        
        {/* Content Area */}
        <div className="pt-4 md:pt-6">
          {/* Items List */}
          <ItemsList 
            items={currentItems}
            onUpdateStatus={handleUpdateStatus}
            onMoreActions={handleMoreActions}
            selectedItems={selectedItems}
            onToggleSelect={handleToggleSelect}
            onToggleAll={handleToggleAll}
            activeTab={activeTab}
          />
        </div>
      </div>

      {/* Bulk Expired Flag Sheet */}
      <BulkExpiredFlagSheet
        isOpen={showExpiredFlagSheet}
        onClose={() => {
          setShowExpiredFlagSheet(false);
          setPendingBulkAction(null);
        }}
        expiredItemsCount={pendingBulkAction?.expiredItemsCount || 0}
        onUnflagExpired={handleUnflagExpired}
        onKeepExpiredFlag={handleKeepExpiredFlag}
      />
    </div>
  );
}

