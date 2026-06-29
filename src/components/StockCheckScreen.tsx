import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, X, Package, AlertCircle, AlertTriangle, Info, MoreVertical, FileText, Keyboard, Search, CheckCircle2 } from 'lucide-react';
import { ItemCard, BaseItem } from './ItemCard';
import CameraScanner from './CameraScanner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { useMediaQuery } from './ui/use-mobile';

export interface StockItem {
  id: string;
  itemId: string;
  title: string;
  brand: string;
  size?: string;
  color?: string;
  price: number;
  status: 'Available' | 'Missing' | 'Broken';
  orderNumber: string;
  date: string;
  thumbnail?: string;
  isScanned: boolean;
  isSelected: boolean;
  category?: string;
  isExpired?: boolean;
  expiredFlaggedAt?: string;
  expiredPostponeWeeks?: number;
  boxLabel?: string;
  deliveryId?: string;
  lastInStoreAt?: string;
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

function TopAppBar({ onBack, title, onClose, onNavigateToReport, onManualEntry }: {
  onBack: () => void;
  title: string;
  onClose?: () => void;
  onNavigateToReport?: () => void;
  onManualEntry?: () => void;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');

  // Build the overflow menu options from the handlers that are wired up.
  const menuOptions = [
    onNavigateToReport && {
      key: 'view-reports',
      label: 'View reports',
      Icon: FileText,
      onClick: onNavigateToReport,
    },
    onManualEntry && {
      key: 'manual-entry',
      label: 'Enter Item ID manually',
      Icon: Keyboard,
      onClick: onManualEntry,
    },
  ].filter(Boolean) as Array<{ key: string; label: string; Icon: typeof FileText; onClick: () => void }>;

  const showMenu = menuOptions.length > 0;
  // Per design system: dropdown on desktop when ≤5 options, bottom sheet on mobile.
  const useDropdown = isLargeScreen && menuOptions.length <= 5;

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
          {/* More menu - far right */}
          {showMenu && (
            useDropdown ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
                    aria-label="More actions"
                  >
                    <MoreVertical className="w-6 h-6 text-on-surface" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={4}
                  className="bg-surface-container border border-outline-variant rounded-[12px] p-2 w-56 z-[10001]"
                >
                  {menuOptions.map(({ key, label, Icon, onClick }) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={onClick}
                      className="gap-3 px-3 py-2.5 rounded-[8px] hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer"
                    >
                      <Icon className="w-5 h-5 text-on-surface-variant" />
                      <span className="body-medium text-on-surface">{label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors touch-manipulation"
                aria-label="More actions"
              >
                <MoreVertical className="w-6 h-6 text-on-surface" />
              </button>
            )
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

      {/* Mobile bottom sheet for the more menu */}
      {showMenu && !useDropdown && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent
            side="bottom"
            className="max-h-[85vh] rounded-t-3xl bg-surface-container-high border-outline-variant p-0 gap-0 overflow-hidden flex flex-col"
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-8 h-1 bg-outline-variant rounded-full" />
            </div>
            <SheetHeader className="px-6 pb-4 flex-shrink-0">
              <SheetTitle className="title-large text-on-surface text-left">
                Stock check actions
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-2 pb-6">
              <div className="flex flex-col">
                {menuOptions.map(({ key, label, Icon, onClick }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onClick();
                      setSheetOpen(false);
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg min-h-[48px] touch-manipulation hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
                  >
                    <Icon className="w-5 h-5 text-on-surface-variant" />
                    <span className="body-large text-on-surface">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
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
              selected: isSelected,
              deliveryId: item.deliveryId,
              boxLabel: item.boxLabel,
              lastInStoreAt: item.lastInStoreAt
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

// Manual Item ID entry screen — lets staff find an item by its known Item ID (GTIN)
// when there is no scannable barcode, and add the matching item to the Scanned tab.
function ManualItemEntryView({
  items,
  onBack,
  onAddItem,
}: {
  items: StockItem[];
  onBack: () => void;
  onAddItem: (item: StockItem) => void;
}) {
  const [query, setQuery] = useState('');
  const trimmed = query.trim();

  // Match against the Item ID (GTIN). Cap results so a broad query stays scannable.
  const matches = trimmed.length === 0
    ? []
    : items
        .filter((item) => item.itemId.toLowerCase().includes(trimmed.toLowerCase()))
        .slice(0, 50);

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* Spacer for top nav on desktop */}
      <div className="hidden md:block h-16"></div>

      {/* Top App Bar */}
      <div className="sticky top-0 md:top-16 bg-surface z-[90] border-b border-outline-variant md:shadow-sm">
        <div className="flex items-center h-16 px-4 md:px-6">
          <button
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors mr-2"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
          <h1 className="title-large text-on-surface flex-1">
            Enter Item ID
          </h1>
        </div>
      </div>

      {/* Search field */}
      <div className="px-4 md:px-6 pt-4 pb-2 max-w-2xl w-full mx-auto">
        <label htmlFor="manual-item-id" className="body-medium text-on-surface-variant mb-2 block">
          Search for an item by its Item ID (GTIN)
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant pointer-events-none" />
          <input
            id="manual-item-id"
            type="text"
            inputMode="numeric"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 34780001"
            className="w-full h-[56px] pl-11 pr-12 rounded-[12px] bg-surface-container border border-outline-variant text-on-surface body-large placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high transition-colors touch-manipulation"
            >
              <X className="w-5 h-5 text-on-surface-variant" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 px-4 md:px-6 pb-6 max-w-2xl w-full mx-auto">
        {trimmed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <Search className="w-16 h-16 text-on-surface-variant mb-4" />
            <h3 className="title-medium text-on-surface mb-2">
              Search by Item ID
            </h3>
            <p className="body-medium text-on-surface-variant max-w-sm">
              Type a known Item ID (GTIN) to find the matching item and add it to the Scanned tab.
            </p>
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <Package className="w-16 h-16 text-on-surface-variant mb-4" />
            <h3 className="title-medium text-on-surface mb-2">
              No matching item
            </h3>
            <p className="body-medium text-on-surface-variant max-w-sm">
              No item in this stock check matches “{trimmed}”. Check the Item ID and try again.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pt-2">
            {matches.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={item.isScanned}
                onClick={() => onAddItem(item)}
                aria-label={item.isScanned ? `${item.itemId} already scanned` : `Add ${item.itemId} to scanned`}
                className="w-full text-left disabled:cursor-not-allowed touch-manipulation"
              >
                <div className={`bg-surface-container border border-outline-variant rounded-lg overflow-hidden transition-colors ${
                  item.isScanned ? 'opacity-60' : 'hover:bg-surface-container-high active:bg-surface-container-highest'
                }`}>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <ItemCard
                        item={{
                          id: item.id,
                          itemId: item.itemId,
                          title: item.title,
                          brand: item.brand,
                          category: 'General',
                          size: item.size,
                          color: item.color,
                          price: item.price,
                          status: item.status,
                          date: item.date,
                          thumbnail: item.thumbnail,
                          deliveryId: item.deliveryId,
                          boxLabel: item.boxLabel,
                          lastInStoreAt: item.lastInStoreAt
                        } as BaseItem}
                        variant="items-list"
                        showActions={false}
                        showSelection={false}
                      />
                    </div>
                    {item.isScanned ? (
                      <span className="label-small px-2 py-0.5 rounded-full bg-success-container text-on-success-container shrink-0 mr-1 whitespace-nowrap">
                        Scanned
                      </span>
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mr-1" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
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
  // Toggles the manual Item ID entry screen (for items without a scannable barcode).
  const [showManualEntry, setShowManualEntry] = useState(false);
  // Counts every scan in this session so we can simulate a "not found" result
  // on every other scan (see handleScan).
  const scanCountRef = useRef(0);
  // Holds the latest scan-result notice so we can surface it inline at the top of
  // the scan screen (more visible than a transient toast). The tone drives styling:
  //   error   → ID not found in this stock check
  //   warning → ID already scanned in this session
  //   info    → item added with a non-Available status (e.g. Missing)
  const [scanNotice, setScanNotice] = useState<{ tone: 'error' | 'warning' | 'info'; text: string } | null>(null);

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
      
      const boxLabels = ['BOX-123456', 'BOX-789012', 'BOX-987654', 'BOX-456789', 'BOX-234567'];
      const deliveryIds = ['DEL-0931', 'DEL-1130', 'DEL-0950', 'DEL-1001', 'DEL-1045'];
      const daysInStoreAgo = Math.floor(Math.random() * 30);
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
        isSelected: false,
        boxLabel: boxLabels[Math.floor(Math.random() * boxLabels.length)],
        deliveryId: deliveryIds[Math.floor(Math.random() * deliveryIds.length)],
        lastInStoreAt: new Date(Date.now() - daysInStoreAgo * 86400000).toISOString()
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

  const handleScan = (scannedCode?: string) => {
    // Prototype simulation of the different outcomes a scan can produce. The
    // running count lets us trigger each scenario predictably in the demo.
    scanCountRef.current += 1;
    const scanNumber = scanCountRef.current;

    // Every 5th scan: simulate re-scanning an ID that was already counted.
    if (scanNumber % 5 === 0) {
      const alreadyScanned = stockItems.find(item => item.isScanned);
      const scannedId = alreadyScanned?.itemId ?? scannedCode ?? `${34780000 + Math.floor(Math.random() * 100000)}`;
      setScanNotice({ tone: 'warning', text: `Item ID "${scannedId}" already scanned` });
      return;
    }

    // Every other scan: simulate an ID that isn't part of this stock check.
    if (scanNumber % 2 === 0) {
      const scannedId = scannedCode ?? `${34780000 + Math.floor(Math.random() * 100000)}`;
      setScanNotice({ tone: 'error', text: `Scanned Item ID "${scannedId}" not found` });
      return;
    }

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
      // Use a non-Available status (Missing/Broken) since they were not in the list
      const boxLabels = ['BOX-123456', 'BOX-789012', 'BOX-987654', 'BOX-456789', 'BOX-234567'];
      const deliveryIds = ['DEL-0931', 'DEL-1130', 'DEL-0950', 'DEL-1001', 'DEL-1045'];
      const nonAvailableStatuses: Array<StockItem['status']> = ['Missing', 'Broken'];
      const unexpectedStatus = nonAvailableStatuses[Math.floor(Math.random() * nonAvailableStatuses.length)]!;
      const newItem: StockItem = {
        id: `unexpected-item-${Date.now()}`,
        itemId: `${34780000 + Math.floor(Math.random() * 10000)}`,
        title: `Unexpected Item`,
        brand: brands[Math.floor(Math.random() * brands.length)]!,
        size: sizes[Math.floor(Math.random() * sizes.length)]!,
        color: colors[Math.floor(Math.random() * colors.length)]!,
        price: Math.floor(Math.random() * 50) + 10,
        status: unexpectedStatus, // Unexpected items were not in the list, so they're Missing/Broken
        orderNumber: `ORD-${Math.floor(1000000 + Math.random() * 9000000)}`,
        date: getToday(),
        isScanned: true,
        isSelected: false,
        category: 'Clothing',
        boxLabel: boxLabels[Math.floor(Math.random() * boxLabels.length)],
        deliveryId: deliveryIds[Math.floor(Math.random() * deliveryIds.length)],
        lastInStoreAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString()
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

      // Item has a non-Available status but is still added to the Scanned list —
      // surface that so the user knows why it was flagged.
      setScanNotice({
        tone: 'info',
        text: `Item ID "${newItem.itemId}" added to Scanned — status ${newItem.status}`,
      });
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

        // A clean, expected (Available) scan — clear any previous notice.
        setScanNotice(null);
      }
    }
    
    // Keep scanning active for more items
    // In real implementation, camera would continue running
  };


  // Manually add an item (found via Item ID search) to the Scanned tab.
  const handleManualAdd = (item: StockItem) => {
    if (item.isScanned) {
      setShowManualEntry(false);
      return;
    }
    setStockItems((prev) => {
      const updated = prev.map((it) =>
        it.id === item.id ? { ...it, isScanned: true } : it
      );
      // Auto-save, mirroring the scan flow.
      saveSessionToStorage(updated);
      return updated;
    });
    setSelectedItems((prev) => new Set([...prev, item.id]));
    setActiveTab('scanned');
    setScanNotice({
      tone: 'info',
      text: `Item ID "${item.itemId}" added to Scanned`,
    });
    setShowManualEntry(false);
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

  // Manual Item ID entry is a focused sub-screen with its own top app bar.
  if (showManualEntry) {
    return (
      <ManualItemEntryView
        items={stockItems}
        onBack={() => setShowManualEntry(false)}
        onAddItem={handleManualAdd}
      />
    );
  }

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* Spacer for top nav on desktop */}
      <div className="hidden md:block h-16"></div>
      {/* Top App Bar */}
      <TopAppBar
        onBack={onBack}
        title="Stock Check"
        onNavigateToReport={onNavigateToReport}
        onManualEntry={() => setShowManualEntry(true)}
      />
      
      {/* Sticky Scan View Container - Always Active */}
      <div className="sticky top-16 mx-4 mb-4 z-20">
        <CameraScanner
          onScan={handleScan}
          scanMessage="Click to scan"
          autoStart={true}
          enableFakeScan={true}
          height="16rem"
        />

        {/* Scan-result banner — surfaces the latest scan outcome inline at the top */}
        {scanNotice && (() => {
          const tone = {
            error: { bg: 'bg-error-container', fg: 'text-on-error-container', Icon: AlertCircle },
            warning: { bg: 'bg-warning-container', fg: 'text-on-warning-container', Icon: AlertTriangle },
            info: { bg: 'bg-secondary-container', fg: 'text-on-secondary-container', Icon: Info },
          }[scanNotice.tone];
          const Icon = tone.Icon;
          return (
            <div role="alert" className={`mt-3 flex items-start gap-3 rounded-[12px] px-4 py-3 ${tone.bg}`}>
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${tone.fg}`} />
              <p className={`flex-1 body-medium ${tone.fg}`}>{scanNotice.text}</p>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setScanNotice(null)}
                className={`w-12 h-12 -my-2 -mr-2 flex items-center justify-center rounded-full shrink-0 hover:opacity-70 transition-opacity touch-manipulation ${tone.fg}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          );
        })()}
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
          {/* Items List */}
          <ItemsList
            items={currentItems}
            selectedItems={selectedItems}
          />
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
