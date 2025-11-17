import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, X, MoreVertical, CheckCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { StockItem, StockCheckSession } from './StockCheckScreen';
import { ItemCard, BaseItem } from './ItemCard';
import svgPaths from "../imports/svg-7un8q74kd7";

interface StockCheckReviewScreenProps {
  session: StockCheckSession;
  onBack: () => void;
  onUpdateItemStatus: (itemId: string, newStatus: 'Missing' | 'Found' | 'Scanned') => void;
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
    </div>
  );
}

function FilterChips({ 
  activeTab, 
  onTabChange, 
  counts 
}: { 
  activeTab: ReviewTab; 
  onTabChange: (tab: ReviewTab) => void;
  counts: Record<ReviewTab, number>;
}) {
  const filters: Array<{ id: ReviewTab; label: string }> = [
    { id: 'not-scanned', label: 'Not scanned' },
    { id: 'not-found', label: 'Not found' },
    { id: 'all-included', label: 'All included' },
    { id: 'scanned', label: 'Scanned' }
  ];

  return (
    <div className="px-4 md:px-6 py-3 bg-surface border-b border-outline-variant">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
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
    </div>
  );
}

function BulkActionsBar({
  selectedCount,
  totalCount,
  isAllSelected,
  onToggleAll,
  onMarkAsMissing,
  onMarkAsInStore,
  onClearSelection,
  activeTab
}: {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  onToggleAll: () => void;
  onMarkAsMissing: () => void;
  onMarkAsInStore: () => void;
  onClearSelection: () => void;
  activeTab: ReviewTab;
}) {
  // Show different actions based on active tab
  const showMarkInStore = activeTab === 'scanned';
  const showMarkMissing = activeTab === 'not-scanned';
  const hasSelectedItems = selectedCount > 0;

  return (
    <div className={`sticky top-0 z-10 border-b border-outline-variant px-4 py-3 ${
      hasSelectedItems ? 'bg-primary-container' : 'bg-surface-container'
    }`}>
      <div className="flex items-center gap-3">
        {/* Select all checkbox */}
        <button 
          className="flex items-center justify-center hover:opacity-80 focus:opacity-80 active:opacity-60 transition-opacity"
          onClick={onToggleAll}
          aria-label={isAllSelected ? "Deselect all items" : "Select all items"}
        >
          <div className="relative w-6 h-6 flex-shrink-0">
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

        {/* Count */}
        <span className={`body-medium flex-1 ${
          hasSelectedItems ? 'text-on-primary-container' : 'text-on-surface'
        }`}>
          {hasSelectedItems 
            ? `${selectedCount} item${selectedCount > 1 ? 's' : ''} selected`
            : `${totalCount} item${totalCount !== 1 ? 's' : ''}`
          }
        </span>

        {/* Actions - only show when items are selected */}
        {hasSelectedItems && (
          <>
            {showMarkInStore && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAsInStore}
                className="bg-tertiary-container text-on-tertiary-container border-0 hover:bg-tertiary-container/80 px-3 py-2 rounded-[16px] min-h-[32px] label-medium"
              >
                Mark In Store
              </Button>
            )}
            {showMarkMissing && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAsMissing}
                className="bg-error-container text-on-error-container border-0 hover:bg-error-container/80 px-3 py-2 rounded-[16px] min-h-[32px] label-medium"
              >
                Mark Missing
              </Button>
            )}
            <button
              onClick={onClearSelection}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
              aria-label="Clear selection"
            >
              <X className="w-5 h-5 text-on-primary-container" />
            </button>
          </>
        )}
      </div>
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
  onUpdateStatus: (itemId: string, status: 'Missing' | 'Found' | 'Scanned' | 'In Store') => void;
  onMoreActions: (itemId: string) => void;
  isSelected: boolean;
  onToggleSelect: (itemId: string) => void;
  activeTab: ReviewTab;
}) {
  const [showActions, setShowActions] = useState(false);

  // Show different action buttons based on active tab
  const getActionButtons = () => {
    if (activeTab === 'not-scanned') {
      // Not scanned items can be marked as Missing
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateStatus(item.id, 'Missing')}
          className="bg-error-container text-on-error-container border-0 hover:bg-error-container/80 px-3 py-2 rounded-[16px] min-h-[32px] label-medium"
        >
          Mark Missing
        </Button>
      );
    } else if (activeTab === 'scanned') {
      // For scanned items: if status is Missing, allow changing to In Store
      if (item.status === 'Missing') {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateStatus(item.id, 'In Store')}
            className="bg-tertiary-container text-on-tertiary-container border-0 hover:bg-tertiary-container/80 px-3 py-2 rounded-[16px] min-h-[32px] label-medium"
          >
            Mark In Store
          </Button>
        );
      }
      // For scanned items with other statuses, show both options
      return (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateStatus(item.id, 'Missing')}
            className="bg-error-container text-on-error-container border-0 hover:bg-error-container/80 px-3 py-2 rounded-[16px] min-h-[32px] label-medium"
          >
            Mark Missing
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateStatus(item.id, 'In Store')}
            className="bg-tertiary-container text-on-tertiary-container border-0 hover:bg-tertiary-container/80 px-3 py-2 rounded-[16px] min-h-[32px] label-medium"
          >
            Mark In Store
          </Button>
        </>
      );
    } else {
      // All other tabs show both options
      return (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateStatus(item.id, 'Missing')}
            className="bg-error-container text-on-error-container border-0 hover:bg-error-container/80 px-3 py-2 rounded-[16px] min-h-[32px] label-medium"
          >
            Mark Missing
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateStatus(item.id, 'In Store')}
            className="bg-tertiary-container text-on-tertiary-container border-0 hover:bg-tertiary-container/80 px-3 py-2 rounded-[16px] min-h-[32px] label-medium"
          >
            Mark In Store
          </Button>
        </>
      );
    }
  };

  return (
    <div className="bg-surface-container border-b border-outline-variant last:border-b-0">
      <div className="flex items-center gap-4 px-4 py-4">
        {/* Leading element - Checkbox for bulk selection */}
        <button 
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors rounded-full"
          onClick={() => onToggleSelect(item.id)}
          aria-label={isSelected ? 'Deselect item' : 'Select item'}
        >
          <div className="relative w-5 h-5">
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
        
        {/* Main content using standardized ItemCard */}
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
              orderNumber: item.orderNumber
            } as BaseItem}
            variant="items-list"
            showActions={false}
            showSelection={false}
          />
        </div>
        
        {/* Trailing element - Price and actions */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <span className="body-small text-on-surface">
            €{item.price}
          </span>
          <button 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
            onClick={() => setShowActions(!showActions)}
            aria-label="More actions"
          >
            <MoreVertical className="w-4 h-4 text-on-surface-variant" />
          </button>
        </div>
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="flex gap-2 px-4 pb-3">
          {getActionButtons()}
        </div>
      )}
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
  onUpdateStatus: (itemId: string, status: 'Missing' | 'Found' | 'Scanned' | 'In Store') => void;
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

  return (
    <Card className="mx-4 mb-4 bg-surface-container border border-outline-variant overflow-hidden">
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
    </Card>
  );
}

export default function StockCheckReviewScreen({ 
  session, 
  onBack, 
  onUpdateItemStatus 
}: StockCheckReviewScreenProps) {
  const [activeTab, setActiveTab] = useState<ReviewTab>('not-scanned');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Use items from session if available, otherwise generate mock data
  const [reviewItems, setReviewItems] = useState<StockItem[]>(() => {
    if (session.items && session.items.length > 0) {
      return session.items;
    }
    
    // Fallback to mock items for demonstration
    const mockItems: StockItem[] = [];
    const brands = ['H&M', 'Weekday', 'COS', 'Monki'];
    const statuses: Array<StockItem['status']> = ['In Store', 'Missing', 'Scanned'];
    
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
        isSelected: false
      });
    }
    return mockItems;
  });

  // Filter items by tab
  const getFilteredItems = (tab: ReviewTab): StockItem[] => {
    switch (tab) {
      case 'not-scanned':
        return reviewItems.filter(item => !item.isScanned && item.status === 'In Store');
      case 'not-found':
        return reviewItems.filter(item => item.status === 'Missing');
      case 'all-included':
        return reviewItems; // All items
      case 'scanned':
        return reviewItems.filter(item => item.isScanned || item.status === 'Scanned');
      default:
        return [];
    }
  };

  // Get counts for each tab
  const getCounts = (): Record<ReviewTab, number> => {
    return {
      'not-scanned': reviewItems.filter(item => !item.isScanned && item.status === 'In Store').length,
      'not-found': reviewItems.filter(item => item.status === 'Missing').length,
      'all-included': reviewItems.length,
      'scanned': reviewItems.filter(item => item.isScanned || item.status === 'Scanned').length
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

  const handleBulkMarkAsMissing = () => {
    setReviewItems(prev => prev.map(item => {
      if (selectedItems.has(item.id)) {
        const updatedItem = {
          ...item,
          status: 'Missing' as const,
          isScanned: false
        };
        onUpdateItemStatus(item.id, 'Missing');
        return updatedItem;
      }
      return item;
    }));
    setSelectedItems(new Set());
  };

  const handleBulkMarkAsInStore = () => {
    setReviewItems(prev => prev.map(item => {
      if (selectedItems.has(item.id)) {
        const updatedItem = {
          ...item,
          status: 'In Store' as const,
          isScanned: true
        };
        onUpdateItemStatus(item.id, 'Scanned');
        return updatedItem;
      }
      return item;
    }));
    setSelectedItems(new Set());
  };

  const handleUpdateStatus = (itemId: string, newStatus: 'Missing' | 'Found' | 'Scanned' | 'In Store') => {
    setReviewItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedItem = {
          ...item,
          status: newStatus,
          isScanned: newStatus === 'Scanned' || newStatus === 'Found' || newStatus === 'In Store'
        } as StockItem;
        return updatedItem;
      }
      return item;
    }));

    // Call parent handler - convert 'Found' and 'In Store' to appropriate status
    const parentStatus = newStatus === 'Found' || newStatus === 'In Store' ? 'Scanned' : newStatus;
    onUpdateItemStatus(itemId, parentStatus as 'Missing' | 'Found' | 'Scanned');
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
          }}
          counts={counts}
        />
        
        {/* Bulk Actions Bar - moved below tabs */}
        <BulkActionsBar
          selectedCount={selectedItems.size}
          totalCount={currentItems.length}
          isAllSelected={currentItems.length > 0 && currentItems.every(item => selectedItems.has(item.id))}
          onToggleAll={handleToggleAll}
          onMarkAsMissing={handleBulkMarkAsMissing}
          onMarkAsInStore={handleBulkMarkAsInStore}
          onClearSelection={() => setSelectedItems(new Set())}
          activeTab={activeTab}
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
    </div>
  );
}
