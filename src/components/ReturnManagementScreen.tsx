import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
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
            {new Date().toISOString().split('T')[0]}, In transit
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

function ActiveScanner({ 
  onScan, 
  isScanning,
  unscannedCount 
}: { 
  onScan: () => void;
  isScanning: boolean;
  unscannedCount: number;
}) {
  return (
    <div className="mx-4 mb-4 bg-surface-container border border-outline-variant rounded-[12px] overflow-hidden">
      {/* Camera Preview Area */}
      <div className="relative bg-surface-variant h-64 flex items-center justify-center">
        {/* Camera preview placeholder */}
        <div className="absolute inset-4 border-2 border-primary rounded-lg flex items-center justify-center">
          <div className="w-16 h-16 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
            <QrCode className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        {/* Active Scanning overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button 
            className="w-48 h-48 border-2 border-primary rounded-lg relative hover:bg-primary/5 focus:bg-primary/10 active:bg-primary/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onScan}
            disabled={isScanning || unscannedCount === 0}
            aria-label="Tap to scan"
          >
            {/* Animated scanning line */}
            {!isScanning && unscannedCount > 0 && (
              <>
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary animate-pulse"></div>
                <div className="absolute top-8 left-0 right-0 h-px bg-primary/30 animate-bounce" style={{animationDelay: '0.5s'}}></div>
              </>
            )}
            
            {/* Corner indicators */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
            
            {/* Status indicator */}
            {unscannedCount > 0 && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 bg-primary px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-on-primary rounded-full animate-pulse"></div>
                  <span className="label-small text-on-primary">
                    {isScanning ? 'SCANNING...' : 'READY TO SCAN'}
                  </span>
                </div>
              </div>
            )}
            
            {unscannedCount === 0 && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 bg-surface-container px-3 py-1 rounded-full">
                  <span className="label-small text-on-surface-variant">
                    NO ITEMS TO SCAN
                  </span>
                </div>
              </div>
            )}
            
            {/* Scan message overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="bg-primary/90 backdrop-blur-sm rounded-lg px-4 py-2 opacity-0 hover:opacity-100 transition-opacity">
                <span className="label-medium text-on-primary">
                  {unscannedCount > 0 ? 'Tap to scan items' : 'No items available'}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
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
      <div className="flex items-start gap-3 px-4 py-3">
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
        
        {/* Trailing element */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="flex-shrink-0 w-12 h-12 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors touch-manipulation min-w-[48px] min-h-[48px] md:min-w-0 md:min-h-0"
              onClick={(event) => event.stopPropagation()}
              aria-label="More actions"
            >
              <MoreVertical className="w-5 h-5 text-on-surface-variant" />
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
  );
}

function EmptyState({ 
  type
}: { 
  type: 'scanned' | 'unscanned';
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="text-center space-y-4">
        {type === 'scanned' ? (
          <>
            <QrCode className="w-16 h-16 text-on-surface-variant mx-auto mb-4" />
            <h3 className="title-medium text-on-surface">
              No items scanned yet
            </h3>
            <p className="body-medium text-on-surface-variant max-w-sm">
              Use the SCAN ITEMS button to include items in this return
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
  
  // Update tab when items change (e.g., when opening a pending return)
  useEffect(() => {
    const newInitialTab = unscannedItems.length > 0 ? 'unscanned' : 'scanned';
    setActiveTab(newInitialTab);
  }, [unscannedItems.length]);
  
  const currentItems = activeTab === 'scanned' ? scannedItems : unscannedItems;
  const selectedItems = partnerItems.filter(item => item.selected);
  const hasSelectedItems = selectedItems.length > 0;
  const hasScannedItems = scannedItems.length > 0;

  const handleScan = () => {
    if (unscannedItems.length === 0) {
      alert('No items available to scan');
      return;
    }

    setIsScanning(true);

    // Simulate scanning a random item
    setTimeout(() => {
      const randomItem = unscannedItems[Math.floor(Math.random() * unscannedItems.length)];
      if (!randomItem) {
        setIsScanning(false);
        return;
      }
      onUpdateItem(randomItem.id, 'scan');
      onUpdateItem(randomItem.id, 'select');
      setIsScanning(false);
      setActiveTab('scanned');
    }, 2000);
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
          onTabChange={setActiveTab}
          scannedCount={scannedItems.length}
          unscannedCount={unscannedItems.length}
        />
        
        {/* Content Area */}
        <div className="pt-4 md:pt-6">
          {/* Item count */}
          <div className="px-4 md:px-6 mb-4">
            <span className="body-medium text-on-surface-variant">
              {currentItems.length} items
            </span>
          </div>
          
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