import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, X, QrCode, Package, MoreVertical, CheckCircle, Circle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import svgPaths from "../imports/svg-7un8q74kd7";
import { ItemCard, BaseItem } from './ItemCard';

export interface StockItem {
  id: string;
  itemId: string;
  title: string;
  brand: string;
  size?: string;
  color?: string;
  price: number;
  status: 'In Store' | 'Missing' | 'Scanned';
  orderNumber: string;
  date: string;
  thumbnail?: string;
  isScanned: boolean;
  isSelected: boolean;
  category?: string;
}

export interface StockCheckSession {
  id: string;
  date: string;
  totalItems: number;
  scannedItems: number;
  notFoundItems: number;
  status: 'In Progress' | 'Completed';
  reportGenerated: boolean;
  items?: StockItem[];
}

interface StockCheckScreenProps {
  onBack: () => void;
  onGenerateReport: (session: StockCheckSession) => void;
}

function TopAppBar({ onBack, title, onClose }: { 
  onBack: () => void; 
  title: string;
  onClose?: () => void;
}) {
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
          {title}
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

function TabBar({ 
  activeTab, 
  onTabChange, 
  scannedCount, 
  notScannedCount,
  onAddManually,
  showManualAdd,
  totalCount 
}: { 
  activeTab: string; 
  onTabChange: (tab: string) => void;
  scannedCount: number;
  notScannedCount: number;
  onAddManually: () => void;
  showManualAdd: boolean;
  totalCount: number;
}) {
  const tabs = [
    { id: 'not-scanned', label: 'Not scanned', count: notScannedCount },
    { id: 'scanned', label: 'Scanned', count: scannedCount }
  ];

  const percentage = totalCount > 0 ? (scannedCount / totalCount) * 100 : 0;
  
  return (
    <div className="bg-surface border-b border-outline-variant">
      {/* Progress Bar */}

      
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className="flex-1 pb-3 pt-2 px-4 relative hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
            onClick={() => onTabChange(tab.id)}
          >
            <span className={`title-small ${
              activeTab === tab.id ? 'text-primary' : 'text-on-surface-variant'
            }`}>
              {tab.label} ({tab.count})
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
        
        {/* Compromised Manual Add Button */}
        <button
          onClick={onAddManually}
          className={`pb-3 pt-2 px-3 relative hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors border-l border-outline-variant ${
            showManualAdd ? 'bg-primary-container' : ''
          }`}
        >
          <span className={`label-medium ${
            showManualAdd ? 'text-on-primary-container' : 'text-primary'
          }`}>
            Add
          </span>
          {showManualAdd && (
            <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>
    </div>
  );
}

function StockItemCard({ 
  item, 
  onToggleSelect,
  onMoreActions,
  isSelected 
}: { 
  item: StockItem; 
  onToggleSelect: (itemId: string) => void;
  onMoreActions: (itemId: string) => void;
  isSelected: boolean;
}) {
  return (
    <div className="bg-surface-container border-b border-outline-variant last:border-b-0">
      <div className="flex items-center gap-3 px-3 py-2">
        {/* Leading Element - Checkbox */}
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
        
        {/* Main Content using standardized ItemCard */}
        <div className="flex-1">
          <ItemCard
            item={{
              id: item.id,
              itemId: item.itemId,
              title: item.title,
              brand: item.brand,
              category: 'General', // Stock items don't have category, using default
              size: item.size,
              color: item.color,
              price: item.price,
              status: item.status,
              date: item.date,
              thumbnail: item.thumbnail,
              selected: isSelected
            } as BaseItem}
            variant="items-list"
            showActions={false}
            showSelection={false}
            onMoreActions={(_, action) => onMoreActions(item.id)}
          />
        </div>
        
        {/* Trailing Elements */}
        <div className="flex-shrink-0 flex items-center gap-1">
          {item.isScanned && (
            <div className="text-[10px] text-primary leading-tight">
              Scanned
            </div>
          )}
          
          {/* More Actions */}
          <button 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
            onClick={() => onMoreActions(item.id)}
            aria-label="More actions"
          >
            <svg className="w-5 h-5" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path d={svgPaths.p1aa02900} fill="var(--on-surface)" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function ItemsList({ 
  items, 
  onToggleSelect,
  onMoreActions,
  selectedItems 
}: {
  items: StockItem[];
  onToggleSelect: (itemId: string) => void;
  onMoreActions: (itemId: string) => void;
  selectedItems: Set<string>;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <Package className="w-16 h-16 text-on-surface-variant mb-4" />
        <h3 className="title-medium text-on-surface mb-2">
          No items in this category
        </h3>
        <p className="body-medium text-on-surface-variant text-center">
          Use the scan button or manual entry to process items
        </p>
      </div>
    );
  }

  return (
    <Card className="mx-4 mb-4 bg-surface-container border border-outline-variant overflow-hidden">
      {items.map((item) => (
        <StockItemCard 
          key={item.id}
          item={item} 
          onToggleSelect={onToggleSelect}
          onMoreActions={onMoreActions}
          isSelected={selectedItems.has(item.id)}
        />
      ))}
    </Card>
  );
}

export default function StockCheckScreen({ onBack, onGenerateReport }: StockCheckScreenProps) {
  const [activeTab, setActiveTab] = useState<'scanned' | 'not-scanned'>('not-scanned');
  const [isScanning, setIsScanning] = useState(true); // Always start scanning
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Mock stock items
  const [stockItems, setStockItems] = useState<StockItem[]>(() => {
    const mockItems: StockItem[] = [];
    for (let i = 1; i <= 250; i++) {
      const brands = ['H&M', 'Weekday', 'COS', 'Monki', 'ARKET'];
      const colors = ['Black', 'White', 'Blue', 'Red', 'Gray', 'Green'];
      const sizes = ['XS', 'S', 'M', 'L', 'XL'];
      
      mockItems.push({
        id: `item-${i}`,
        itemId: `${34780000 + i}`,
        title: `Item ${i}`,
        brand: brands[Math.floor(Math.random() * brands.length)],
        size: sizes[Math.floor(Math.random() * sizes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        price: Math.floor(Math.random() * 50) + 10,
        status: 'In Store',
        orderNumber: `ORD-${Math.floor(1000000 + Math.random() * 9000000)}`,
        date: '2024-12-09',
        isScanned: false,
        isSelected: false
      });
    }
    return mockItems;
  });

  const scannedItems = stockItems.filter(item => item.isScanned);
  const notScannedItems = stockItems.filter(item => !item.isScanned);
  
  const currentItems = activeTab === 'scanned' ? scannedItems : notScannedItems;
  const canComplete = scannedItems.length > 0;

  // Auto-scan effect - simulates continuous scanning readiness
  useEffect(() => {
    let scanTimeout: NodeJS.Timeout;
    
    if (isScanning && notScannedItems.length > 0) {
      // Simulate finding and scanning QR codes periodically (for demo purposes)
      scanTimeout = setTimeout(() => {
        // In real implementation, this would be triggered by actual QR code detection
        // For demo, we'll randomly scan an item every 5-8 seconds
        if (Math.random() > 0.7) { // 30% chance to scan on each interval
          handleScan();
        }
      }, 5000 + Math.random() * 3000); // 5-8 second intervals
    }

    return () => {
      if (scanTimeout) {
        clearTimeout(scanTimeout);
      }
    };
  }, [isScanning, notScannedItems.length]);

  const handleScan = () => {
    // Randomly decide if we're scanning an existing item or a new item not in the list
    // This simulates scanning items with any status (Missing, Sold, In Transit, Expired, etc.)
    const scanNewItem = Math.random() > 0.7; // 30% chance to scan a new/unexpected item
    
    if (scanNewItem || notScannedItems.length === 0) {
      // Simulate scanning an item that wasn't in the expected list
      // This could be an item with status Missing, Sold, In Transit, Expired, Damaged, etc.
      const brands = ['H&M', 'Weekday', 'COS', 'Monki', 'ARKET'];
      const colors = ['Black', 'White', 'Blue', 'Red', 'Gray', 'Green'];
      const sizes = ['XS', 'S', 'M', 'L', 'XL'];
      
      const newItem: StockItem = {
        id: `unexpected-item-${Date.now()}`,
        itemId: `${34780000 + Math.floor(Math.random() * 10000)}`,
        title: `Unexpected Item`,
        brand: brands[Math.floor(Math.random() * brands.length)],
        size: sizes[Math.floor(Math.random() * sizes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        price: Math.floor(Math.random() * 50) + 10,
        status: 'Scanned',
        orderNumber: `ORD-${Math.floor(1000000 + Math.random() * 9000000)}`,
        date: new Date().toISOString().split('T')[0],
        isScanned: true,
        isSelected: false,
        category: 'Clothing'
      };
      
      // Add this new item to the stock check
      setStockItems(prev => [...prev, newItem]);
      setSelectedItems(prev => new Set([...prev, newItem.id]));
      setActiveTab('scanned');
      
      // Show success feedback for unexpected item
      const event = new CustomEvent('toast', {
        detail: { 
          message: `Scanned unexpected item: ${newItem.itemId} (not in expected list)`, 
          type: 'success' 
        }
      });
      window.dispatchEvent(event);
    } else {
      // Simulate scanning an item from the expected list
      const randomItem = notScannedItems[Math.floor(Math.random() * notScannedItems.length)];
      setStockItems(prev => prev.map(item => 
        item.id === randomItem.id 
          ? { ...item, isScanned: true, status: 'Scanned' as const }
          : item
      ));
      setSelectedItems(prev => new Set([...prev, randomItem.id]));
      setActiveTab('scanned');
      
      // Show success feedback
      const event = new CustomEvent('toast', {
        detail: { message: `Scanned: ${randomItem.itemId}`, type: 'success' }
      });
      window.dispatchEvent(event);
    }
    
    // Keep scanning active for more items
    // In real implementation, camera would continue running
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

  const handleMoreActions = (itemId: string) => {
    // Handle more actions like marking as missing, etc.
    const item = stockItems.find(i => i.id === itemId);
    if (item) {
      const actions = ['Mark as Missing', 'Move to Different Location', 'Mark as Damaged'];
      alert(`More actions for ${item.itemId}: ${actions.join(', ')}`);
    }
  };

  const handleComplete = () => {
    if (canComplete) {
      const session: StockCheckSession = {
        id: `SC-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        totalItems: stockItems.length,
        scannedItems: scannedItems.length,
        notFoundItems: 0, // In real implementation, this would track not found items
        status: 'Completed',
        reportGenerated: true,
        items: stockItems
      };
      
      onGenerateReport(session);
    }
  };

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* Top App Bar */}
      <TopAppBar onBack={onBack} title="Stock Check" />
      
      {/* Sticky Scan View Container - Always Active */}
      <div className="sticky top-16 mx-4 mb-4 bg-surface-container border border-outline-variant rounded-[12px] overflow-hidden z-20">
        {/* Camera Preview Area */}
        <div className="relative bg-surface-variant h-64 flex items-center justify-center">
          {/* Camera preview placeholder - in real implementation, this would show camera feed */}
          <div className="absolute inset-4 border-2 border-primary rounded-lg flex items-center justify-center">
            <div className="w-16 h-16 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
              <QrCode className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          {/* Active Scanning overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button 
              className="w-48 h-48 border-2 border-primary rounded-lg relative hover:bg-primary/5 focus:bg-primary/10 active:bg-primary/20 transition-colors cursor-pointer"
              onClick={handleScan}
              aria-label="Tap to simulate scan"
            >
              {/* Animated scanning line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary animate-pulse"></div>
              <div className="absolute top-8 left-0 right-0 h-px bg-primary/30 animate-bounce" style={{animationDelay: '0.5s'}}></div>
              
              {/* Corner indicators */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
              
              {/* Status indicator */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 bg-primary px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-on-primary rounded-full animate-pulse"></div>
                  <span className="label-small text-on-primary">SCANNING</span>
                </div>
              </div>
              
              {/* Dev hint overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-primary/90 backdrop-blur-sm rounded-lg px-3 py-2 opacity-0 hover:opacity-100 transition-opacity">
                  <span className="label-small text-on-primary">Click to scan</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1">
        
        {/* Tab Bar */}
        <TabBar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          scannedCount={scannedItems.length}
          notScannedCount={notScannedItems.length}
          totalCount={stockItems.length}
          onAddManually={() => setShowManualAdd(!showManualAdd)}
          showManualAdd={showManualAdd}
        />
        
        {/* Content Area */}
        <div className="pt-4 md:pt-6 pb-4">
          {/* Item count */}
          <div className="px-4 md:px-6 mb-4">
            <span className="body-medium text-on-surface-variant">
              {currentItems.length} items
            </span>
          </div>
          
          {/* Items List */}
          <ItemsList 
            items={currentItems}
            onToggleSelect={handleToggleSelect}
            onMoreActions={handleMoreActions}
            selectedItems={selectedItems}
          />
          
          {/* Progress Indicator and Action Button */}
          {scannedItems.length > 0 && (
            <div className="px-4 md:px-6 mt-6">
              <div className="text-center mb-2">
                <span className="body-small text-on-surface-variant">
                  {scannedItems.length}/{stockItems.length} items scanned
                </span>
              </div>
              <div className="w-full bg-surface-variant rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stockItems.length > 0 ? (scannedItems.length / stockItems.length) * 100 : 0}%` }}
                />
              </div>
              
              {/* Continue Button */}
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={handleComplete}
                  disabled={!canComplete}
                  className="bg-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 disabled:bg-on-surface/12 disabled:text-on-surface/38 text-on-primary transition-colors px-8 py-3 rounded-lg min-h-[40px] flex items-center justify-center label-large"
                >
                  Generate Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
