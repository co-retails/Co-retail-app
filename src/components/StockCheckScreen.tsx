import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, X, QrCode, Package } from 'lucide-react';
import { ItemCard, BaseItem } from './ItemCard';
import CameraScanner from './CameraScanner';

export interface StockItem {
  id: string;
  itemId: string;
  title: string;
  brand: string;
  size?: string;
  color?: string;
  price: number;
  status: 'Available' | 'Missing' | 'Scanned' | 'Broken';
  orderNumber: string;
  date: string;
  thumbnail?: string;
  isScanned: boolean;
  isSelected: boolean;
  category?: string;
  isExpired?: boolean;
  expiredFlaggedAt?: string;
  expiredPostponeWeeks?: number;
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
  onNavigateToReport?: () => void;
}

function TopAppBar({ onBack, title, onClose, onNavigateToReport }: { 
  onBack: () => void; 
  title: string;
  onClose?: () => void;
  onNavigateToReport?: () => void;
}) {
  return (
    <div className="sticky top-0 md:top-16 bg-surface z-[90] border-b border-outline-variant md:shadow-sm">
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
        
        {/* Trailing actions */}
        <div className="flex items-center gap-2">
          {/* Report link */}
          {onNavigateToReport && (
            <button
              onClick={onNavigateToReport}
              className="px-4 py-2 rounded-lg hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors label-medium text-primary"
              aria-label="View stock check report"
            >
              View report
            </button>
          )}
          
          {/* Close button (optional) */}
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
    </div>
  );
}

function TabBar({ 
  activeTab, 
  onTabChange, 
  scannedCount, 
  notScannedCount
}: { 
  activeTab: 'scanned' | 'not-scanned'; 
  onTabChange: (tab: 'scanned' | 'not-scanned') => void;
  scannedCount: number;
  notScannedCount: number;
}) {
  const tabs = [
    { id: 'not-scanned' as const, label: 'Not scanned', count: notScannedCount },
    { id: 'scanned' as const, label: 'Scanned', count: scannedCount }
  ];
  
  return (
    <div className="bg-surface border-b border-outline-variant">
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
      </div>
    </div>
  );
}

function StockItemCard({ 
  item, 
  isSelected
}: { 
  item: StockItem; 
  isSelected: boolean;
}) {
  // Checkboxes and more menu removed from item cards in Stock check scan screen
  
  return (
    <div className="bg-surface-container border border-outline-variant rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2">
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
          />
        </div>
      </div>
    </div>
  );
}

function ItemsList({ 
  items, 
  selectedItems
}: {
  items: StockItem[];
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
    <div className="mx-4 mb-4">
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <StockItemCard 
            key={item.id}
            item={item} 
            isSelected={selectedItems.has(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

const STOCK_CHECK_STORAGE_KEY = 'stockCheckSession';

// Get today's date string
const getToday = (): string => new Date().toISOString().split('T')[0]!;

// Load saved session from localStorage for today
const loadSavedSession = (): StockItem[] | null => {
  try {
    const today = getToday();
    const saved = localStorage.getItem(`${STOCK_CHECK_STORAGE_KEY}_${today}`);
    if (saved) {
      const data = JSON.parse(saved);
      return data.items || null;
    }
  } catch (e) {
    console.error('Failed to load saved session:', e);
  }
  return null;
};

// Save session to localStorage
const saveSessionToStorage = (items: StockItem[]) => {
  try {
    const today = getToday();
    const data = {
      date: today,
      items,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(`${STOCK_CHECK_STORAGE_KEY}_${today}`, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save session:', e);
  }
};

// Load accumulated items for today (from multiple users)
const loadAccumulatedItems = (): StockItem[] => {
  try {
    const today = getToday();
    const saved = localStorage.getItem(`${STOCK_CHECK_STORAGE_KEY}_${today}`);
    if (saved) {
      const data = JSON.parse(saved);
      return data.items || [];
    }
  } catch (e) {
    console.error('Failed to load accumulated items:', e);
  }
  return [];
};

export default function StockCheckScreen({ onBack, onGenerateReport, onNavigateToReport }: StockCheckScreenProps) {
  const [activeTab, setActiveTab] = useState<'scanned' | 'not-scanned'>('not-scanned');
  const [isScanning] = useState(true); // Always start scanning
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Load accumulated items from today's session
  const accumulatedItems = loadAccumulatedItems();
  const accumulatedScannedIds = new Set(accumulatedItems.filter(item => item.isScanned).map(item => item.itemId));

  // Mock stock items - initialize with saved items if available
  const [stockItems, setStockItems] = useState<StockItem[]>(() => {
    // First, try to load saved session
    const savedItems = loadSavedSession();
    if (savedItems && savedItems.length > 0) {
      return savedItems;
    }

    // Otherwise, start fresh but merge with accumulated items
    const mockItems: StockItem[] = [];
    for (let i = 1; i <= 250; i++) {
      const itemId = `${34780000 + i}`;
      // Check if this item was already scanned by another user today
      const isAlreadyScanned = accumulatedScannedIds.has(itemId);
      
      const brands = ['H&M', 'Weekday', 'COS', 'Monki', 'ARKET'];
      const colors = ['Black', 'White', 'Blue', 'Red', 'Gray', 'Green'];
      const sizes = ['XS', 'S', 'M', 'L', 'XL'];
      
      mockItems.push({
        id: `item-${i}`,
        itemId,
        title: `Item ${i}`,
        brand: brands[Math.floor(Math.random() * brands.length)]!,
        size: sizes[Math.floor(Math.random() * sizes.length)]!,
        color: colors[Math.floor(Math.random() * colors.length)]!,
        price: Math.floor(Math.random() * 50) + 10,
        status: 'Available',
        orderNumber: `ORD-${Math.floor(1000000 + Math.random() * 9000000)}`,
        date: getToday(),
        isScanned: isAlreadyScanned,
        isSelected: false
      });
    }
    
    // Merge with accumulated items (items scanned by other users)
    const mergedItems = [...mockItems];
    accumulatedItems.forEach(accItem => {
      // Only add items that aren't already in the list
      if (!mergedItems.find(item => item.itemId === accItem.itemId)) {
        // Ensure all required fields are present
        mergedItems.push({
          ...accItem,
          orderNumber: accItem.orderNumber ?? `ORD-${Math.floor(1000000 + Math.random() * 9000000)}`,
          date: accItem.date ?? getToday(),
        });
      }
    });
    
    return mergedItems;
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

  const handleScan = (scannedCode: string) => {
    // Randomly decide if we're scanning an existing item or a new item not in the list
    // This simulates scanning items with any status (Missing, Sold, In Transit, Expired, etc.)
    const scanNewItem = Math.random() > 0.7; // 30% chance to scan a new/unexpected item
    
    if (scanNewItem || notScannedItems.length === 0) {
      // Simulate scanning an item that wasn't in the expected list
      // This could be an item with status Missing, Sold, In Transit, Expired, Damaged, etc.
      const brands = ['H&M', 'Weekday', 'COS', 'Monki', 'ARKET'];
      const colors = ['Black', 'White', 'Blue', 'Red', 'Gray', 'Green'];
      const sizes = ['XS', 'S', 'M', 'L', 'XL'];
      
      // For unexpected items, they could be Missing items that were found
      // Use 'Missing' as default status for unexpected items (they were not in the list)
      const newItem: StockItem = {
        id: `unexpected-item-${Date.now()}`,
        itemId: `${34780000 + Math.floor(Math.random() * 10000)}`,
        title: `Unexpected Item`,
        brand: brands[Math.floor(Math.random() * brands.length)]!,
        size: sizes[Math.floor(Math.random() * sizes.length)]!,
        color: colors[Math.floor(Math.random() * colors.length)]!,
        price: Math.floor(Math.random() * 50) + 10,
        status: 'Missing', // Unexpected items were not in the list, so they're Missing
        orderNumber: `ORD-${Math.floor(1000000 + Math.random() * 9000000)}`,
        date: getToday(),
        isScanned: true,
        isSelected: false,
        category: 'Clothing'
      };
      
      // Add this new item to the stock check
      setStockItems(prev => {
        const updated = [...prev, newItem];
        // Auto-save on scan
        saveSessionToStorage(updated);
        return updated;
      });
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
      // Keep the original status, don't change it to 'Scanned'
      const randomItem = notScannedItems[Math.floor(Math.random() * notScannedItems.length)];
      if (randomItem) {
        setStockItems(prev => {
          const updated = prev.map(item => 
            item.id === randomItem.id 
              ? { ...item, isScanned: true }
              : item
          );
          // Auto-save on scan
          saveSessionToStorage(updated);
          return updated;
        });
        setSelectedItems(prev => new Set([...prev, randomItem.id]));
        setActiveTab('scanned');
        
        // Show success feedback
        const event = new CustomEvent('toast', {
          detail: { message: `Scanned: ${randomItem.itemId}`, type: 'success' }
        });
        window.dispatchEvent(event);
      }
    }
    
    // Keep scanning active for more items
    // In real implementation, camera would continue running
  };


  const handleComplete = () => {
    if (canComplete) {
      // Load accumulated items for the report
      const accumulated = loadAccumulatedItems();
      const currentScanned = stockItems.filter(item => item.isScanned);
      
      // Merge all scanned items from today
      const itemMap = new Map<string, StockItem>();
      accumulated.forEach(item => {
        if (item.isScanned) {
          itemMap.set(item.itemId, item);
        }
      });
      currentScanned.forEach(item => {
        itemMap.set(item.itemId, item);
      });
      
      const allScannedItems = Array.from(itemMap.values());
      
      const session: StockCheckSession = {
        id: `SC-${Date.now()}`,
        date: getToday(),
        totalItems: Math.max(stockItems.length, allScannedItems.length),
        scannedItems: allScannedItems.length,
        notFoundItems: 0, // In real implementation, this would track not found items
        status: 'Completed',
        reportGenerated: true,
        items: allScannedItems
      };
      
      onGenerateReport(session);
    }
  };

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* Spacer for top nav on desktop */}
      <div className="hidden md:block h-16"></div>
      {/* Top App Bar */}
      <TopAppBar onBack={onBack} title="Stock Check" onNavigateToReport={onNavigateToReport} />
      
      {/* Sticky Scan View Container - Always Active */}
      <div className="sticky top-16 mx-4 mb-4 z-20">
        <CameraScanner
          onScan={handleScan}
          scanMessage="Click to scan"
          autoStart={true}
          enableFakeScan={true}
          height="16rem"
        />
      </div>
      
      {/* Content */}
      <div className="flex-1">
        
        {/* Tab Bar */}
        <TabBar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          scannedCount={scannedItems.length}
          notScannedCount={notScannedItems.length}
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
            selectedItems={selectedItems}
          />
          
          {/* Progress Indicator */}
          {scannedItems.length > 0 && (
            <div className="px-4 md:px-6 mt-6 mb-24 md:mb-6">
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
            </div>
          )}
        </div>
      </div>
      
      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant p-4 md:py-6 z-20">
        <div className="w-full max-w-6xl mx-auto flex flex-row flex-wrap gap-3 md:gap-4 justify-end">
          {/* Add to todays count Button - full width on mobile, positioned far right on desktop */}
          <Button 
            onClick={handleComplete}
            disabled={!canComplete}
            className="flex-1 md:flex-none min-w-[220px] h-[56px] bg-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 disabled:bg-on-surface/12 disabled:text-on-surface/38 text-on-primary transition-colors px-8 py-3 rounded-lg flex items-center justify-center label-large"
          >
            Add to todays count
          </Button>
        </div>
      </div>
    </div>
  );
}
