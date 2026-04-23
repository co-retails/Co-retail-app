import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, MoreVertical, QrCode, Package, Calendar, User, Download } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import svgPaths from "../imports/svg-7un8q74kd7";
import { ItemCard, BaseItem } from './ItemCard';
import { downloadCSV } from '../utils/spreadsheetUtils';

export interface ReturnOrderDetails {
  id: string;
  orderNumber: string;
  partnerId: string;
  partnerName: string;
  status: 'pending' | 'in-transit' | 'returned' | 'cancelled';
  createdDate: string;
  scannedItems: ReturnItemDetail[];
  unscannedItems: ReturnItemDetail[];
  totalItems: number;
}

export interface ReturnItemDetail {
  id: string;
  itemId: string;
  title: string;
  size?: string;
  color?: string;
  partnerItemRef: string;
  scanned: boolean;
  brand?: string;
  category?: string;
  price?: number;
  date?: string;
  selected?: boolean;
  status?: 'Rejected' | 'Available' | 'Broken' | 'In transit';
  isExpired?: boolean;
  deliveryId?: string;
  boxLabel?: string;
  lastInStoreAt?: string;
}

interface ReturnDetailsScreenProps {
  returnOrder: ReturnOrderDetails;
  onBack: () => void;
  onScan: () => void;
  onAddManually: () => void;
  onSaveAndClose: () => void;
  onReturn: () => void;
  userRole?: 'admin' | 'store-staff' | 'store-manager' | 'partner';
}

function TopAppBar({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="sticky top-0 bg-primary z-10">
      <div className="flex items-center h-16 px-4 md:px-6">
        {/* Leading icon */}
        <button 
          className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-on-primary/12 transition-colors mr-2 touch-manipulation min-w-[48px] min-h-[48px]"
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
        <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-on-primary/12 transition-colors touch-manipulation min-w-[48px] min-h-[48px]">
          <MoreVertical className="w-6 h-6 text-on-primary" />
        </button>
      </div>
    </div>
  );
}

function ReturnOrderSummaryCard({ returnOrder }: { returnOrder: ReturnOrderDetails }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-surface-container text-on-surface';
      case 'in-transit': return 'bg-tertiary-container text-on-tertiary-container';
      case 'returned': return 'bg-primary-container text-on-primary-container';
      case 'cancelled': return 'bg-error-container text-on-error-container';
      default: return 'bg-surface-container text-on-surface';
    }
  };

  return (
    <Card className="mx-4 md:mx-6 mb-6 bg-surface-container border border-outline-variant">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Leading visual */}
          <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-on-primary-container" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Metadata */}
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-on-surface-variant" />
              <span className="body-small text-on-surface-variant">
                {returnOrder.createdDate}, {returnOrder.status}
              </span>
            </div>
            
            {/* Primary info */}
            <h2 className="title-medium text-on-surface mb-3">
              Return order: {returnOrder.orderNumber}
            </h2>
            
            {/* Secondary info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-on-surface-variant" />
                <span className="body-medium text-on-surface">
                  To: {returnOrder.partnerName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReturnItemCard({ item, isScanned, onToggleSelect, onMoreActions, userRole = 'store-staff' }: { 
  item: ReturnItemDetail; 
  isScanned: boolean;
  onToggleSelect: (id: string) => void;
  onMoreActions: (id: string) => void;
  userRole?: 'admin' | 'store-staff' | 'store-manager' | 'partner';
}) {
  // Extend item with missing fields for M3 compliance
  const extendedItem = {
    ...item,
    brand: item.brand || 'H&M',
    category: item.category || 'Clothing',
    price: item.price || Math.floor(Math.random() * 50) + 5,
    date: item.date || '2024-12-09',
    status: isScanned ? 'Ready to return' : 'Pending scan',
    selected: isScanned,
    thumbnail: undefined,
    daysRemaining: isScanned ? undefined : Math.floor(Math.random() * 10) + 1,
    deliveryId: item.deliveryId || 'DEL-0931',
    boxLabel: item.boxLabel || 'Box A-12',
    lastInStoreAt: item.lastInStoreAt
  };

  return (
    <div 
      className="w-full bg-surface-container hover:bg-surface-container-high"
      style={{ backgroundColor: 'var(--surface-container)' }}
    >
      <div className="flex items-center gap-4 px-1 py-3">
        {/* Leading element - Checkbox */}
        <button 
          className="flex-shrink-0 w-12 h-12 md:w-10 md:h-10 flex items-center justify-center touch-manipulation min-w-[48px] min-h-[48px] md:min-w-0 md:min-h-0"
          onClick={() => onToggleSelect(item.id)}
          aria-label={extendedItem.selected ? 'Deselect item' : 'Select item'}
        >
          <div className="relative w-5 h-5">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
              <path 
                clipRule="evenodd" 
                d={extendedItem.selected ? svgPaths.p181a1800 : svgPaths.p3e435600} 
                fill={extendedItem.selected ? "var(--primary)" : "var(--outline-variant)"} 
                fillRule="evenodd" 
              />
            </svg>
            {extendedItem.selected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-3 h-3" fill="white" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </button>
        
        {/* Main content using standardized ItemCard - override its background */}
        <div className="flex-1">
          <div 
            className="[&>div]:!bg-transparent [&>div]:border-b-0 [&>div]:hover:!bg-transparent"
            style={{ 
              '--override-bg': 'transparent' 
            } as React.CSSProperties}
          >
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
                status: extendedItem.status,
                date: extendedItem.date,
                thumbnail: extendedItem.thumbnail,
                selected: extendedItem.selected,
                partnerItemRef: item.partnerItemRef,
                deliveryId: extendedItem.deliveryId,
                boxLabel: extendedItem.boxLabel,
                lastInStoreAt: extendedItem.lastInStoreAt
              } as BaseItem}
              variant="items-list"
              showActions={false}
              showSelection={false}
              userRole={userRole}
            />
          </div>
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
          className="flex-shrink-0 w-12 h-12 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors touch-manipulation min-w-[48px] min-h-[48px] md:min-w-0 md:min-h-0"
          onClick={() => onMoreActions(item.id)}
          aria-label="More actions"
        >
          <MoreVertical className="w-5 h-5 text-on-surface-variant" />
        </button>
      </div>
    </div>
  );
}

function TabBar({ activeTab, onTabChange, scannedCount, unscannedCount }: { 
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
            className="flex-1 pb-3 pt-4 px-4 relative min-h-[48px] md:min-h-0 touch-manipulation"
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

function EmptyState({ type, onScan, onAddManually }: { 
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
              Scan QR codes on hang tags to include items in this return
            </p>
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={onScan}
                className="bg-primary text-on-primary hover:bg-primary/90"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Scan items
              </Button>
              <Button 
                variant="outline"
                onClick={onAddManually}
                className="border-outline text-primary hover:bg-primary-container"
              >
                Add manually
              </Button>
            </div>
          </>
        ) : (
          <>
            <Package className="w-16 h-16 text-on-surface-variant mx-auto mb-4" />
            <h3 className="title-medium text-on-surface">
              All items scanned
            </h3>
            <p className="body-medium text-on-surface-variant">
              All items have been included in the return
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function ItemsList({ items, isScanned, onToggleSelect, onMoreActions, userRole = 'store-staff' }: {
  items: ReturnItemDetail[];
  isScanned: boolean;
  onToggleSelect: (id: string) => void;
  onMoreActions: (id: string) => void;
  userRole?: 'admin' | 'store-staff' | 'store-manager' | 'partner';
}) {
  if (items.length === 0) return null;

  return (
    <div className="mx-4 mb-4">
      {items.map((item, index) => (
        <div 
          key={item.id} 
          className={`mb-2 last:mb-0 ${isScanned ? '' : 'opacity-60'}`}
        >
          <div className="border border-outline-variant rounded-lg overflow-hidden">
            <ReturnItemCard 
              item={item} 
              isScanned={isScanned}
              onToggleSelect={onToggleSelect}
              onMoreActions={onMoreActions}
              userRole={userRole}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ActionButtons({ activeTab, hasItems, onScan, onAddManually }: {
  activeTab: string;
  hasItems: boolean;
  onScan: () => void;
  onAddManually: () => void;
}) {
  if (activeTab !== 'scanned' || !hasItems) return null;

  return (
    <div className="flex gap-3 mx-4 mb-6">
      <Button 
        onClick={onScan}
        className="flex-1 bg-primary text-on-primary hover:bg-primary/90"
      >
        <QrCode className="w-4 h-4 mr-2" />
        Scan more
      </Button>
      <Button 
        variant="outline"
        onClick={onAddManually}
        className="flex-1 border-outline text-primary hover:bg-primary-container"
      >
        Add manually
      </Button>
    </div>
  );
}

function BottomActions({ 
  onSaveAndClose, 
  onReturn, 
  hasScannedItems 
}: { 
  onSaveAndClose: () => void; 
  onReturn: () => void; 
  hasScannedItems: boolean;
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
          onClick={onReturn}
          disabled={!hasScannedItems}
          className="flex-1 bg-primary text-on-primary hover:bg-primary/90 disabled:bg-surface-container disabled:text-on-surface-variant"
        >
          Return
        </Button>
      </div>
    </div>
  );
}

type UnscannedFilter = 'all' | 'expired' | 'rejected' | 'broken' | 'available';

export default function ReturnDetailsScreen({
  returnOrder,
  onBack,
  onScan,
  onAddManually,
  onSaveAndClose,
  onReturn,
  userRole = 'store-staff'
}: ReturnDetailsScreenProps) {
  const [activeTab, setActiveTab] = useState('scanned');
  const [unscannedFilter, setUnscannedFilter] = useState<UnscannedFilter>('all');
  const hasScannedItems = returnOrder.scannedItems.length > 0;

  const escapeCSVValue = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const s = String(value);
    // Escape quotes by doubling them, and wrap values that contain separators/newlines.
    const needsQuotes = /[",\n\r]/.test(s);
    const escaped = s.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const exportReturnItemsToCsv = (items: Array<ReturnItemDetail & Record<string, unknown>>) => {
    if (!items.length) {
      return;
    }

    const preferredHeaderOrder = [
      'id',
      'itemId',
      'title',
      'partnerItemRef',
      'scanned',
      'brand',
      'category',
      'size',
      'color',
      'price',
      'date',
      'status',
      'isExpired',
    ];

    const keySet = new Set<string>();
    items.forEach((item) => {
      Object.keys(item).forEach((k) => keySet.add(k));
    });

    const allKeys = Array.from(keySet);
    const headers = [
      ...preferredHeaderOrder.filter((k) => keySet.has(k)),
      ...allKeys
        .filter((k) => !preferredHeaderOrder.includes(k))
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),
    ];

    const lines: string[] = [];
    lines.push(headers.map(escapeCSVValue).join(','));

    items.forEach((item) => {
      lines.push(
        headers
          .map((key) => escapeCSVValue((item as Record<string, unknown>)[key]))
          .join(',')
      );
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `return-order-${returnOrder.orderNumber}-${dateStr}.csv`;
    downloadCSV(lines.join('\n'), filename);
  };

  const handleToggleSelect = (id: string) => {
    // Toggle selection logic would go here
  };

  const handleMoreActions = (id: string) => {
    // More actions logic would go here
  };

  // Enhanced mock data with M3-compliant properties
  const enhancedScannedItems = returnOrder.scannedItems.map((item, index) => ({
    ...item,
    brand: ['H&M', 'Weekday', 'American Eagle Outfitters'][index % 3],
    category: ['Hoodie', 'Shorts', 'Dresses'][index % 3],
    price: [10, 8, 12][index % 3],
    date: '2024-12-09',
    status: item.status || 'Available',
    isExpired: item.isExpired || false
  }));

  const enhancedUnscannedItems = returnOrder.unscannedItems.map((item, index) => ({
    ...item,
    brand: ['H&M', 'Weekday', 'American Eagle Outfitters'][index % 3],
    category: ['Hoodie', 'Shorts', 'Dresses'][index % 3],
    price: [15, 20, 18][index % 3],
    date: '2024-12-09',
    status: item.status || (['Available', 'Rejected', 'Broken', 'Available'][index % 4] as 'Rejected' | 'Available' | 'Broken' | 'In transit'),
    isExpired: item.isExpired || (index % 5 === 0) // Some items are expired
  }));

  // Filter unscanned items based on selected filter
  const filteredUnscannedItems = useMemo(() => {
    if (activeTab !== 'unscanned' || unscannedFilter === 'all') {
      return activeTab === 'scanned' ? enhancedScannedItems : enhancedUnscannedItems;
    }
    
    return enhancedUnscannedItems.filter(item => {
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
  }, [activeTab, unscannedFilter, enhancedScannedItems, enhancedUnscannedItems]);

  const currentItems = activeTab === 'scanned' ? enhancedScannedItems : filteredUnscannedItems;

  return (
    <div className="bg-surface min-h-screen">
      {/* Top App Bar */}
      <TopAppBar onBack={onBack} title="Return Details" />
      
      {/* Content */}
      <div className="pb-20">
        {/* Return Order Summary */}
        <div className="pt-6">
          <ReturnOrderSummaryCard returnOrder={returnOrder} />
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
          scannedCount={returnOrder.scannedItems.length}
          unscannedCount={returnOrder.unscannedItems.length}
        />
        
        {/* Filter dropdown - positioned below tabs */}
        {activeTab === 'unscanned' && (
          <div className="px-4 md:px-6 pt-3 pb-3 bg-surface border-b border-outline-variant relative z-30">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <label className="body-medium text-on-surface-variant whitespace-nowrap">
                Filter items:
              </label>
              <Select value={unscannedFilter} onValueChange={(value) => {
                setUnscannedFilter(value as UnscannedFilter);
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
          </div>
        )}
        
        {/* Content Area */}
        <div className="pt-4 md:pt-6">
          {/* Item count */}
          <div className="px-4 md:px-6 mb-4 flex items-center justify-between gap-3">
            <span className="body-medium text-on-surface-variant">
              {currentItems.length} items
            </span>
            {userRole === 'partner' && (
              <Button
                variant="outline"
                onClick={() => {
                  const allItems = [
                    ...enhancedScannedItems.map((x) => ({ ...x, scanned: true })),
                    ...enhancedUnscannedItems.map((x) => ({ ...x, scanned: false })),
                  ];
                  exportReturnItemsToCsv(allItems);
                }}
                className="gap-2 border-outline text-on-surface hover:bg-surface-container-high"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            )}
          </div>
          
          {/* Items or Empty State */}
          {currentItems.length > 0 ? (
            <ItemsList 
              items={currentItems}
              isScanned={activeTab === 'scanned'}
              onToggleSelect={handleToggleSelect}
              onMoreActions={handleMoreActions}
              userRole={userRole}
            />
          ) : (
            <EmptyState 
              type={activeTab as 'scanned' | 'unscanned'}
              onScan={onScan}
              onAddManually={onAddManually}
            />
          )}
          
          {/* Action Buttons */}
          <ActionButtons 
            activeTab={activeTab}
            hasItems={currentItems.length > 0}
            onScan={onScan}
            onAddManually={onAddManually}
          />
        </div>
      </div>
      
      {/* Bottom Actions */}
      <BottomActions 
        onSaveAndClose={onSaveAndClose}
        onReturn={onReturn}
        hasScannedItems={hasScannedItems}
      />
    </div>
  );
}