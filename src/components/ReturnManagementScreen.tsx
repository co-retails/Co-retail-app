import { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, MoreVertical, QrCode, Package, Calendar, User } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Partner } from './PartnerSelectionScreen';
import { ItemCard, BaseItem } from './ItemCard';

export interface ReturnItem {
  id: string;
  itemId: string;
  title: string;
  size?: string;
  color?: string;
  status: 'Rejected' | 'Available' | 'Broken' | 'In transit';
  partnerItemRef: string;
  partnerId?: string; // Partner ID to ensure items belong to the selected partner
  image?: string; // Full-size product image
  thumbnail?: string; // Thumbnail/fallback image
  selected: boolean;
  canExtend?: boolean;
  scanned?: boolean;
  daysInStore?: number;
  lastInStoreAt?: string;
  isExpired?: boolean;
}

// Helper function to normalize return item statuses
export function normalizeReturnItemStatus(status: string): ReturnItem['status'] {
  // Convert old statuses to new ones
  if (status === 'Expired B2B' || status === 'In store' || status === 'Expired' || status === 'Return - In transit') {
    return 'Available';
  }
  // Ensure status is one of the valid values
  const validStatuses: ReturnItem['status'][] = ['Rejected', 'Available', 'Broken', 'In transit'];
  if (validStatuses.includes(status as ReturnItem['status'])) {
    return status as ReturnItem['status'];
  }
  // Default to Available for unknown statuses
  return 'Available';
}

// Helper function to map Item status to ReturnItem status
export function mapItemStatusToReturnItemStatus(itemStatus: string): ReturnItem['status'] {
  // Map Item statuses to ReturnItem statuses
  const statusMap: Record<string, ReturnItem['status']> = {
    'Available': 'Available',
    'Rejected': 'Rejected',
    'Broken': 'Broken',
    'In transit': 'In transit',
    'Missing': 'Available', // Missing items can be returned as Available
    'Sold': 'Available', // Sold items can be returned as Available
    'Returned': 'Available', // Already returned items
    'Storage': 'Available', // Storage items can be returned
    'Draft': 'Available' // Draft items can be returned
  };
  
  return statusMap[itemStatus] || normalizeReturnItemStatus(itemStatus);
}

export interface ReturnOrder {
  id: string;
  partnerId: string;
  partnerName: string;
  status: 'Return - In transit' | 'Returned';
  createdDate: string;
  items: ReturnItem[];
  parcelId?: string;
}

interface ReturnManagementScreenProps {
  partner: Partner;
  items: ReturnItem[];
  onBack: () => void;
  onCreateReturn: (selectedItems: ReturnItem[]) => void;
  onContinue?: () => void; // New prop for Continue button
  onSaveAndClose?: () => void; // Handler for Save & close button
  onUpdateItem: (itemId: string, action: 'select' | 'deselect' | 'missing' | 'extend' | 'scan' | 'unscan') => void;
}

const getFallbackDaysFromId = (id: string) => {
  if (!id) return 1;
  const hash = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (hash % 45) + 1;
};

const getDaysInStoreForItem = (item: ReturnItem) => {
  if (typeof item.daysInStore === 'number' && !Number.isNaN(item.daysInStore)) {
    return Math.max(0, Math.round(item.daysInStore));
  }
  if (item.lastInStoreAt) {
    const parsed = Date.parse(item.lastInStoreAt);
    if (!Number.isNaN(parsed)) {
      const diffInMs = Date.now() - parsed;
      const diffInDays = Math.max(1, Math.round(diffInMs / (1000 * 60 * 60 * 24)));
      return diffInDays;
    }
  }
  return getFallbackDaysFromId(item.id);
};

function TopAppBar({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="sticky top-0 md:top-16 bg-surface z-[90] border-b border-outline-variant md:shadow-sm">
      <div className="flex items-center h-16 px-4 md:px-6">
        {/* Leading icon */}
        <button 
          className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors mr-2 touch-manipulation min-w-[48px] min-h-[48px]"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-on-surface" />
        </button>
        
        {/* Title */}
        <h1 className="title-large text-on-surface flex-1">
          {title}
        </h1>
      </div>
    </div>
  );
}

function ReturnOrderSummaryCard({ partner }: { partner: Partner }) {
  return (
    <Card className="mx-4 md:mx-6 mb-3 bg-transparent border-0 shadow-none">
      <CardContent className="p-3">
        {/* Metadata */}
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-on-surface-variant" />
          <span className="text-[10px] font-medium text-on-surface-variant tracking-[0.5px] leading-none">
            {new Date().toISOString().split('T')[0]}, Pending
          </span>
        </div>
        
        {/* Primary info */}
        <h2 className="title-medium text-on-surface mb-2">
          Return order: {Math.floor(1000000 + Math.random() * 9000000)}
        </h2>
        
        {/* Secondary info */}
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-on-surface-variant" />
          <span className="body-medium text-on-surface">
            To: {partner.name}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

import CameraScanner from './CameraScanner';

function ActiveScanner({ 
  onScan, 
  isScanning,
  unscannedCount 
}: { 
  onScan: (result: string) => void;
  isScanning: boolean;
  unscannedCount: number;
}) {
  return (
    <div className="mx-4 mb-4">
      <CameraScanner
        onScan={onScan}
        isScanning={isScanning}
        scanMessage={unscannedCount > 0 ? 'Tap to scan items' : 'No items available'}
        autoStart={true}
        enableFakeScan={true}
        height="16rem"
      />
    </div>
  );
}

function TabBar({ 
  activeTab, 
  onTabChange, 
  scannedCount, 
  unscannedCount 
}: { 
  activeTab: 'scanned' | 'unscanned'; 
  onTabChange: (tab: 'scanned' | 'unscanned') => void;
  scannedCount: number;
  unscannedCount: number;
}) {
  const tabs: Array<{ id: 'scanned' | 'unscanned'; label: string; count: number }> = [
    { id: 'scanned', label: `Scanned (${scannedCount})`, count: scannedCount },
    { id: 'unscanned', label: `Not scanned (${unscannedCount})`, count: unscannedCount }
  ];

  return (
    <div className="bg-surface border-b border-outline-variant">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className="flex-1 pb-3 pt-4 px-4 relative hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors touch-manipulation min-h-[48px]"
            onClick={() => onTabChange(tab.id)}
          >
            <span className={`title-small ${
              activeTab === tab.id ? 'text-primary' : 'text-on-surface-variant'
            }`}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReturnItemCard({ 
  item, 
  isScanned, 
  onToggleSelect, 
  onScanStatusChange,
  daysInStore
}: { 
  item: ReturnItem; 
  isScanned: boolean;
  onToggleSelect: (id: string) => void;
  onScanStatusChange: (id: string, markAsScanned: boolean) => void;
  daysInStore: number;
}) {
  const handleScanToggle = (markAsScanned: boolean) => {
    onScanStatusChange(item.id, markAsScanned);
  };

  // Extended item with missing fields for M3 compliance
  const extendedItem = {
    ...item,
    brand: 'H&M',
    category: 'Clothing',
    price: Math.floor(Math.random() * 50) + 5,
    date: new Date().toISOString().split('T')[0],
    daysRemaining: daysInStore
  };

  const handleCardClick = () => onToggleSelect(item.id);
  const selectionClasses = item.selected
    ? 'border border-primary/50 bg-primary-container/15'
    : 'border border-outline-variant';

  return (
    <div
      className={`relative overflow-hidden rounded-[12px] bg-surface-container transition-all duration-200 shadow-none ${selectionClasses}`}
      style={{ boxShadow: 'none' }}
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="[&>div]:!bg-transparent [&>div]:border-b-0 [&>div]:hover:!bg-transparent">
        <div className="flex items-center">
          {/* Main content using standardized ItemCard */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <ItemCard
              item={{
                id: item.id,
                itemId: item.itemId,
                title: item.title,
                brand: extendedItem.brand,
                category: extendedItem.category,
                size: item.size,
                color: item.color,
                price: extendedItem.price,
                status: item.status,
                date: extendedItem.date,
                thumbnail: item.thumbnail,
                selected: item.selected,
                canExtend: item.canExtend,
                partnerItemRef: item.partnerItemRef,
                daysRemaining: daysInStore
              } as BaseItem}
              variant="items-list"
              showActions={false}
              showSelection={false}
            />
          </div>
          
          {/* Trailing Elements - Match ItemCard's trailing elements positioning */}
          <div className="flex-shrink-0 flex items-center gap-0 h-full">
            {/* More Actions */}
            <div className="flex items-center justify-center h-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="p-3 rounded-lg hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
                    onClick={(event) => event.stopPropagation()}
                    aria-label="More actions"
                  >
                    <svg className="w-6 h-6" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="5" r="2" fill="var(--on-surface)" />
                      <circle cx="12" cy="12" r="2" fill="var(--on-surface)" />
                      <circle cx="12" cy="19" r="2" fill="var(--on-surface)" />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" onClick={(event: React.MouseEvent) => event.stopPropagation()}>
                  {!isScanned ? (
                    <DropdownMenuItem
                      onClick={(event: React.MouseEvent) => {
                        event.stopPropagation();
                        handleScanToggle(true);
                      }}
                    >
                      Mark as Scanned
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={(event: React.MouseEvent) => {
                        event.stopPropagation();
                        handleScanToggle(false);
                      }}
                    >
                      Mark as Not scanned
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ 
  type
}: { 
  type: 'scanned' | 'unscanned';
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-6">
      <div className="text-center space-y-2">
        {type === 'scanned' ? (
          <>
            <h3 className="title-medium text-on-surface">
              No items scanned yet
            </h3>
            <p className="body-medium text-on-surface-variant max-w-sm">
              Scan items to include them in this return
            </p>
          </>
        ) : (
          <>
            <Package className="w-16 h-16 text-on-surface-variant mx-auto mb-4" />
            <h3 className="title-medium text-on-surface">
              All items scanned
            </h3>
            <p className="body-medium text-on-surface-variant">
              All available items have been scanned and are ready for return
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function ItemsList({ 
  items, 
  isScanned, 
  onToggleSelect, 
  onScanStatusChange 
}: {
  items: ReturnItem[];
  isScanned: boolean;
  onToggleSelect: (id: string) => void;
  onScanStatusChange: (id: string, markAsScanned: boolean) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id}>
          <ReturnItemCard 
            item={item} 
            isScanned={isScanned}
            onToggleSelect={onToggleSelect}
            onScanStatusChange={onScanStatusChange}
            daysInStore={getDaysInStoreForItem(item)}
          />
        </div>
      ))}
    </div>
  );
}

function BottomActions({ 
  onSaveAndClose, 
  onCreateReturn, 
  onContinue,
  hasSelectedItems,
  hasScannedItems
}: { 
  onSaveAndClose: () => void; 
  onCreateReturn: () => void; 
  onContinue?: () => void;
  hasSelectedItems: boolean;
  hasScannedItems: boolean;
}) {
  // Show Continue button whenever onContinue is provided
  const showContinue = Boolean(onContinue);
  const buttonHeightClasses = "h-[56px] min-h-[56px]";

  return (
    <div className="sticky bottom-0 bg-surface border-t border-outline-variant p-4">
      <div className="flex gap-4">
        <Button 
          variant="outline"
          onClick={onSaveAndClose}
          className={`flex-1 border-outline text-on-surface hover:bg-surface-container-high touch-manipulation ${buttonHeightClasses}`}
        >
          Save & close
        </Button>
        {showContinue ? (
          <Button 
            onClick={onContinue}
            disabled={!hasScannedItems}
            className={`flex-1 bg-primary text-on-primary hover:bg-primary/90 disabled:bg-surface-container disabled:text-on-surface-variant touch-manipulation ${buttonHeightClasses}`}
          >
            Continue
          </Button>
        ) : (
          <Button 
            onClick={onCreateReturn}
            disabled={!hasSelectedItems}
            className={`flex-1 bg-primary text-on-primary hover:bg-primary/90 disabled:bg-surface-container disabled:text-on-surface-variant touch-manipulation ${buttonHeightClasses}`}
          >
            Return
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ReturnManagementScreen({ 
  partner, 
  items, 
  onBack, 
  onCreateReturn, 
  onContinue,
  onSaveAndClose,
  onUpdateItem 
}: ReturnManagementScreenProps) {
  // Filter items to only show items from the selected partner
  const partnerItems = items.filter(item => !item.partnerId || item.partnerId === partner.id);
  
  const scannedItems = partnerItems.filter(item => item.scanned);
  // Allow scanning items with any status, not just expired or rejected
  // Filter out "In transit" items from unscanned - they should only show if scanned
  const unscannedItems = partnerItems.filter(item => 
    !item.scanned && item.status !== 'In transit'
  );
  
  // Set initial tab: prefer 'unscanned' if there are unscanned items, otherwise 'scanned'
  const initialTab = unscannedItems.length > 0 ? 'unscanned' : 'scanned';
  const [activeTab, setActiveTab] = useState<'scanned' | 'unscanned'>(initialTab);
  const [isScanning, setIsScanning] = useState(false);
  const [unscannedFilter, setUnscannedFilter] = useState<'all' | 'expired' | 'rejected' | 'broken' | 'available'>('all');
  
  // Update tab when items change (e.g., when opening a pending return)
  useEffect(() => {
    const newInitialTab = unscannedItems.length > 0 ? 'unscanned' : 'scanned';
    setActiveTab(newInitialTab);
  }, [unscannedItems.length]);
  
  // Filter unscanned items based on selected filter
  const filteredUnscannedItems = useMemo(() => {
    if (activeTab !== 'unscanned' || unscannedFilter === 'all') {
      return unscannedItems;
    }
    
    return unscannedItems.filter(item => {
      switch (unscannedFilter) {
        case 'expired':
          return item.isExpired === true;
        case 'rejected':
          return item.status === 'Rejected';
        case 'broken':
          return item.status === 'Broken';
        case 'available':
          return item.status === 'Available';
        default:
          return true;
      }
    });
  }, [activeTab, unscannedFilter, unscannedItems]);
  
  const currentItems = activeTab === 'scanned' ? scannedItems : filteredUnscannedItems;
  const selectedItems = partnerItems.filter(item => item.selected);
  const hasSelectedItems = selectedItems.length > 0;
  const hasScannedItems = scannedItems.length > 0;

  const handleScan = (scannedCode: string) => {
    if (unscannedItems.length === 0) {
      return;
    }

    setIsScanning(true);

    // Try to find item by scanned code, otherwise pick random
    setTimeout(() => {
      let itemToScan = unscannedItems.find(item => 
        item.itemId === scannedCode || 
        item.id === scannedCode ||
        item.partnerItemRef === scannedCode
      );
      
      if (!itemToScan) {
        // If no match found, scan a random item
        itemToScan = unscannedItems[Math.floor(Math.random() * unscannedItems.length)];
      }
      
      if (!itemToScan) {
        setIsScanning(false);
        return;
      }
      
      onUpdateItem(itemToScan.id, 'scan');
      onUpdateItem(itemToScan.id, 'select');
      setIsScanning(false);
      setActiveTab('scanned');
    }, 500);
  };

  const handleToggleSelect = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      onUpdateItem(itemId, item.selected ? 'deselect' : 'select');
    }
  };

  const handleScanStatusChange = (itemId: string, markAsScanned: boolean) => {
    if (markAsScanned) {
      onUpdateItem(itemId, 'scan');
      onUpdateItem(itemId, 'select');
      setActiveTab('scanned');
    } else {
      onUpdateItem(itemId, 'unscan');
      onUpdateItem(itemId, 'deselect');
      setActiveTab('unscanned');
    }
  };

  const handleCreateReturn = () => {
    if (hasSelectedItems) {
      onCreateReturn(selectedItems);
    }
  };

  const handleSaveAndClose = () => {
    // If onSaveAndClose handler is provided, use it; otherwise just go back
    if (onSaveAndClose) {
      onSaveAndClose();
    } else {
      // Fallback: just go back
      onBack();
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      {/* Spacer for top nav on desktop */}
      <div className="hidden md:block h-16"></div>
      
      {/* Top App Bar */}
      <TopAppBar onBack={onBack} title="Return" />
      
      {/* Content - M3 Grid: 16px mobile, 24px tablet+ */}
      <div className="pb-20">
        {/* Active Scanner */}
        <div className="pt-4 md:pt-6">
          <ActiveScanner 
            onScan={handleScan}
            isScanning={isScanning}
            unscannedCount={unscannedItems.length}
          />
        </div>
        
        {/* Return Order Summary */}
        <div>
          <ReturnOrderSummaryCard partner={partner} />
        </div>
        
        {/* Tab Bar */}
        <TabBar 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            setActiveTab(tab);
            // Reset filter when switching tabs
            if (tab !== 'unscanned') {
              setUnscannedFilter('all');
            }
          }}
          scannedCount={scannedItems.length}
          unscannedCount={unscannedItems.length}
        />
        
        {/* Filter dropdown - positioned below tabs */}
        {activeTab === 'unscanned' && (
          <div className="px-4 md:px-6 pt-3 pb-3 bg-surface border-b border-outline-variant relative z-30">
            <Select value={unscannedFilter} onValueChange={(value) => {
              setUnscannedFilter(value as 'all' | 'expired' | 'rejected' | 'broken' | 'available');
            }} modal={true}>
              <SelectTrigger className="w-full md:w-auto md:min-w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent 
                position="item-aligned"
                className="bg-surface-container border border-outline-variant"
                style={{ zIndex: 10000 }}
              >
                <SelectItem value="all" className="min-h-[48px] md:min-h-0 py-3 md:py-1.5 touch-manipulation">All</SelectItem>
                <SelectItem value="expired" className="min-h-[48px] md:min-h-0 py-3 md:py-1.5 touch-manipulation">Expired flag</SelectItem>
                <SelectItem value="rejected" className="min-h-[48px] md:min-h-0 py-3 md:py-1.5 touch-manipulation">Rejected</SelectItem>
                <SelectItem value="broken" className="min-h-[48px] md:min-h-0 py-3 md:py-1.5 touch-manipulation">Broken</SelectItem>
                <SelectItem value="available" className="min-h-[48px] md:min-h-0 py-3 md:py-1.5 touch-manipulation">Available</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Content Area */}
        <div className="pt-4 md:pt-6">
          {/* Item count - only show when there are items */}
          {currentItems.length > 0 && (
            <div className="px-4 md:px-6 mb-4">
              <span className="body-medium text-on-surface-variant">
                {currentItems.length} items
              </span>
            </div>
          )}
          
          {/* Items or Empty State */}
          {currentItems.length > 0 ? (
            <div className="px-4 md:px-6 pb-4">
              <ItemsList 
                items={currentItems}
                isScanned={activeTab === 'scanned'}
                onToggleSelect={handleToggleSelect}
                onScanStatusChange={handleScanStatusChange}
              />
            </div>
          ) : (
            <EmptyState 
              type={activeTab as 'scanned' | 'unscanned'}
            />
          )}
        </div>
      </div>
      
      {/* Bottom Actions */}
      <BottomActions 
        onSaveAndClose={handleSaveAndClose}
        onCreateReturn={handleCreateReturn}
        onContinue={onContinue}
        hasSelectedItems={hasSelectedItems}
        hasScannedItems={hasScannedItems}
      />
    </div>
  );
}