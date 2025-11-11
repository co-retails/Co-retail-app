import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, MoreVertical, QrCode, Package, Calendar, User } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import svgPaths from "../imports/svg-7un8q74kd7";
import { Partner } from './PartnerSelectionScreen';
import { ItemCard, BaseItem } from './ItemCard';

export interface ReturnItem {
  id: string;
  itemId: string;
  title: string;
  size?: string;
  color?: string;
  status: 'Expired B2B' | 'Rejected' | 'Return - In transit';
  partnerItemRef: string;
  image?: string; // Full-size product image
  thumbnail?: string; // Thumbnail/fallback image
  selected: boolean;
  canExtend?: boolean;
  scanned?: boolean;
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
  onUpdateItem: (itemId: string, action: 'select' | 'deselect' | 'missing' | 'extend' | 'scan') => void;
}

function TopAppBar({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="sticky top-0 bg-primary z-10">
      <div className="flex items-center h-16 px-4 md:px-6">
        {/* Leading icon */}
        <button 
          className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-on-primary/12 focus:bg-on-primary/12 active:bg-on-primary/20 transition-colors mr-2"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-on-primary" />
        </button>
        
        {/* Title */}
        <h1 className="title-large text-on-primary flex-1">
          {title}
        </h1>
        
        {/* Trailing icon */}
        <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-on-primary/12 focus:bg-on-primary/12 active:bg-on-primary/20 transition-colors">
          <MoreVertical className="w-6 h-6 text-on-primary" />
        </button>
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
  onManualEntry,
  isScanning,
  unscannedCount 
}: { 
  onScan: () => void;
  onManualEntry: () => void;
  isScanning: boolean;
  unscannedCount: number;
}) {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualItemId, setManualItemId] = useState('');

  const handleManualSubmit = () => {
    if (manualItemId.trim()) {
      onManualEntry(manualItemId.trim());
      setManualItemId('');
      setShowManualEntry(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualSubmit();
    }
  };

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
      
      {/* Manual Entry Section */}
      <div className="p-4 border-t border-outline-variant bg-surface">
        {!showManualEntry ? (
          <button 
            className="w-full text-primary hover:bg-primary-container/10 focus:bg-primary-container/10 active:bg-primary-container/20 transition-colors py-2 rounded-md label-medium"
            onClick={() => setShowManualEntry(true)}
          >
            Add box label manually
          </button>
        ) : (
          <div className="space-y-3">
            <div className="title-small text-on-surface text-center">
              Enter box label
            </div>
            <input
              type="text"
              value={manualItemId}
              onChange={(e) => setManualItemId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g. BOX-123456"
              className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-md focus:border-primary focus:outline-none text-on-surface body-large"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowManualEntry(false);
                  setManualItemId('');
                }}
                className="flex-1 border border-outline text-on-surface hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors px-4 py-2 rounded-lg min-h-[40px] label-large"
              >
                Cancel
              </button>
              <button
                onClick={handleManualSubmit}
                disabled={!manualItemId.trim()}
                className="flex-1 bg-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 text-on-primary transition-colors disabled:opacity-38 disabled:cursor-not-allowed px-4 py-2 rounded-lg min-h-[40px] label-large"
              >
                Add box
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButtons({ 
  onScanItems, 
  onAddManually, 
  isScanning, 
  showManualAdd 
}: { 
  onScanItems: () => void; 
  onAddManually: () => void;
  isScanning: boolean;
  showManualAdd: boolean;
}) {
  return (
    <div className="flex gap-3 mx-4 mb-6">
      <Button 
        onClick={onScanItems}
        disabled={isScanning}
        className="flex-1 bg-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 disabled:bg-on-surface/12 disabled:text-on-surface/38 text-on-primary transition-colors px-6 py-3 rounded-lg min-h-[40px] flex items-center justify-center"
      >
        <QrCode className="w-4 h-4 mr-2" />
        {isScanning ? 'Scanning...' : 'Scan items'}
      </Button>
      <Button 
        variant="outline"
        onClick={onAddManually}
        className={`flex-1 border-primary text-primary hover:bg-primary-container/50 focus:bg-primary-container/50 active:bg-primary-container/70 transition-colors px-6 py-3 rounded-lg min-h-[40px] flex items-center justify-center ${
          showManualAdd ? 'bg-primary-container' : ''
        }`}
      >
        Add manually
      </Button>
    </div>
  );
}

function ManualAddForm({ 
  isVisible, 
  itemId, 
  onItemIdChange, 
  onCancel, 
  onAdd 
}: {
  isVisible: boolean;
  itemId: string;
  onItemIdChange: (value: string) => void;
  onCancel: () => void;
  onAdd: () => void;
}) {
  if (!isVisible) return null;

  return (
    <Card className="mx-4 mb-4 bg-surface-container-high border border-outline-variant">
      <CardContent className="p-4">
        <div className="space-y-4">
          <h3 className="title-medium text-on-surface">
            Add Item Manually
          </h3>
          <div className="space-y-2">
            <label className="label-large text-on-surface">
              Item ID or Partner Reference
            </label>
            <input
              type="text"
              placeholder="Enter item ID"
              value={itemId}
              onChange={(e) => onItemIdChange(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container border border-outline rounded-lg body-large text-on-surface placeholder:text-on-surface-variant"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-outline text-on-surface hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors px-6 py-3 rounded-lg min-h-[40px] flex items-center justify-center"
            >
              Cancel
            </Button>
            <Button
              onClick={onAdd}
              className="bg-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 text-on-primary transition-colors px-6 py-3 rounded-lg min-h-[40px] flex items-center justify-center"
            >
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TabBar({ 
  activeTab, 
  onTabChange, 
  scannedCount, 
  unscannedCount 
}: { 
  activeTab: string; 
  onTabChange: (tab: string) => void;
  scannedCount: number;
  unscannedCount: number;
}) {
  const tabs = [
    { id: 'scanned', label: `Scanned (${scannedCount})` },
    { id: 'unscanned', label: `Not scanned (${unscannedCount})` }
  ];

  return (
    <div className="bg-surface border-b border-outline-variant">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className="flex-1 pb-3 pt-4 px-4 relative hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
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
  onMoreActions 
}: { 
  item: ReturnItem; 
  isScanned: boolean;
  onToggleSelect: (id: string) => void;
  onMoreActions: (id: string) => void;
}) {
  const [showActions, setShowActions] = useState(false);

  // Extended item with missing fields for M3 compliance
  const extendedItem = {
    ...item,
    brand: 'H&M',
    category: 'Clothing',
    price: Math.floor(Math.random() * 50) + 5,
    date: new Date().toISOString().split('T')[0],
    daysRemaining: isScanned ? undefined : Math.floor(Math.random() * 10) + 1
  };

  return (
    <div className="bg-surface-container hover:bg-surface-container-high border-b border-outline-variant last:border-b-0 transition-colors">
      <div className={`flex items-center gap-2 sm:gap-4 px-4 py-3 ${!isScanned ? 'opacity-60' : ''}`}>
        {/* Leading element - Checkbox */}
        <button 
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors rounded-full"
          onClick={() => onToggleSelect(item.id)}
          aria-label={item.selected ? 'Deselect item' : 'Select item'}
        >
          <div className="relative w-5 h-5">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
              <path 
                clipRule="evenodd" 
                d={item.selected ? svgPaths.p181a1800 : svgPaths.p3e435600} 
                fill={item.selected ? "var(--primary)" : "var(--outline-variant)"} 
                fillRule="evenodd" 
              />
            </svg>
            {item.selected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-3 h-3" fill="white" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </button>
        
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
              partnerItemRef: item.partnerItemRef
            } as BaseItem}
            variant="items-list"
            showActions={false}
            showSelection={false}
          />
          {extendedItem.daysRemaining && (
            <div className="ml-4 mt-1">
              <span className="label-small text-on-surface-variant">
                {extendedItem.daysRemaining}d remaining
              </span>
            </div>
          )}
        </div>
        
        {/* Trailing element */}
        <button 
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
          onClick={() => setShowActions(!showActions)}
          aria-label="More actions"
        >
          <MoreVertical className="w-5 h-5 text-on-surface-variant" />
        </button>
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="flex gap-2 px-4 pb-3">
          {item.canExtend && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMoreActions(item.id)}
              className="bg-tertiary-container text-on-tertiary-container border-0 hover:bg-tertiary-container/80 focus:bg-tertiary-container/80 active:bg-tertiary-container/60 transition-colors px-3 py-2 rounded-[16px] min-h-[32px]"
            >
              2nd Try
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMoreActions(item.id)}
            className="border-outline text-on-surface hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors px-3 py-2 rounded-[16px] min-h-[32px]"
          >
            Missing
          </Button>
        </div>
      )}
    </div>
  );
}

function EmptyState({ 
  type, 
  onScan, 
  onAddManually 
}: { 
  type: 'scanned' | 'unscanned'; 
  onScan: () => void;
  onAddManually: () => void;
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
              Use the SCAN ITEMS button or ADD MANUALLY to include items in this return
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
  onMoreActions 
}: {
  items: ReturnItem[];
  isScanned: boolean;
  onToggleSelect: (id: string) => void;
  onMoreActions: (id: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
          <ReturnItemCard 
            item={item} 
            isScanned={isScanned}
            onToggleSelect={onToggleSelect}
            onMoreActions={onMoreActions}
          />
        </div>
      ))}
    </div>
  );
}

function BottomActions({ 
  onSaveAndClose, 
  onCreateReturn, 
  hasSelectedItems 
}: { 
  onSaveAndClose: () => void; 
  onCreateReturn: () => void; 
  hasSelectedItems: boolean;
}) {
  return (
    <div className="sticky bottom-0 bg-surface border-t border-outline-variant p-4">
      <div className="flex gap-4">
        <Button 
          variant="outline"
          onClick={onSaveAndClose}
          className="flex-1 border-outline text-on-surface hover:bg-surface-container-high"
        >
          Save & close
        </Button>
        <Button 
          onClick={onCreateReturn}
          disabled={!hasSelectedItems}
          className="flex-1 bg-primary text-on-primary hover:bg-primary/90 disabled:bg-surface-container disabled:text-on-surface-variant"
        >
          Return
        </Button>
      </div>
    </div>
  );
}

export default function ReturnManagementScreen({ 
  partner, 
  items, 
  onBack, 
  onCreateReturn, 
  onUpdateItem 
}: ReturnManagementScreenProps) {
  const [activeTab, setActiveTab] = useState<'scanned' | 'unscanned'>('scanned');
  const [isScanning, setIsScanning] = useState(false);

  const scannedItems = items.filter(item => item.scanned);
  const unscannedItems = items.filter(item => !item.scanned && (item.status === 'Expired B2B' || item.status === 'Rejected'));
  
  const currentItems = activeTab === 'scanned' ? scannedItems : unscannedItems;
  const selectedItems = items.filter(item => item.selected);
  const hasSelectedItems = selectedItems.length > 0;

  const handleScan = () => {
    if (unscannedItems.length === 0) {
      alert('No items available to scan');
      return;
    }
    
    setIsScanning(true);
    
    // Simulate scanning a random item
    setTimeout(() => {
      const randomItem = unscannedItems[Math.floor(Math.random() * unscannedItems.length)];
      onUpdateItem(randomItem.id, 'scan');
      onUpdateItem(randomItem.id, 'select');
      setIsScanning(false);
      setActiveTab('scanned');
    }, 2000);
  };

  const handleManualAdd = (itemId: string) => {
    // Find item by ID and mark as scanned
    const item = unscannedItems.find(item => 
      item.itemId.toLowerCase().includes(itemId.toLowerCase()) ||
      item.partnerItemRef.toLowerCase().includes(itemId.toLowerCase())
    );
    
    if (item) {
      onUpdateItem(item.id, 'scan');
      onUpdateItem(item.id, 'select');
      setActiveTab('scanned');
    } else {
      alert('Item not found. Please check the ID and try again.');
    }
  };

  const handleToggleSelect = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      onUpdateItem(itemId, item.selected ? 'deselect' : 'select');
    }
  };

  const handleMoreActions = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      if (item.canExtend) {
        onUpdateItem(itemId, 'extend');
      } else {
        onUpdateItem(itemId, 'missing');
      }
    }
  };

  const handleCreateReturn = () => {
    if (hasSelectedItems) {
      onCreateReturn(selectedItems);
    }
  };

  const handleSaveAndClose = () => {
    // Save current state and return to home/previous screen
    onBack();
  };

  return (
    <div className="bg-surface min-h-screen">
      {/* Top App Bar */}
      <TopAppBar onBack={onBack} title="Return" />
      
      {/* Content - M3 Grid: 16px mobile, 24px tablet+ */}
      <div className="pb-20">
        {/* Active Scanner */}
        <div className="pt-4 md:pt-6">
          <ActiveScanner 
            onScan={handleScan}
            onManualEntry={handleManualAdd}
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
                onMoreActions={handleMoreActions}
              />
            </div>
          ) : (
            <EmptyState 
              type={activeTab as 'scanned' | 'unscanned'}
              onScan={handleScan}
              onAddManually={() => setShowManualAdd(true)}
            />
          )}
        </div>
      </div>
      
      {/* Bottom Actions */}
      <BottomActions 
        onSaveAndClose={handleSaveAndClose}
        onCreateReturn={handleCreateReturn}
        hasSelectedItems={hasSelectedItems}
      />
    </div>
  );
}