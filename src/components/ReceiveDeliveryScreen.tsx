import { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { ArrowLeft, MoreVertical, Package, XCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Delivery } from './ShippingScreen';
import ActiveScanner from './ActiveScanner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import svgPaths from "../imports/svg-7un8q74kd7";

export interface Box {
  id: string;
  boxId: string;
  orderNumber: string;
  externalOrder: string;
  items: number;
  status: 'In transit' | 'Delivered' | 'Cancelled' | 'Rejected';
  date: string;
  isScanned: boolean;
  deliveryId?: string;
  deliveryLabel?: string; // Display label for delivery (e.g., deliveryId)
  partnerId?: string;
  partnerName?: string; // Sender/partner name
  warehouseId?: string;
  warehouseName?: string;
  cancellationReason?: 'Missing box';
}

type ReceiveUserRole = 'admin' | 'store-staff' | 'store-manager' | 'partner' | 'buyer';

interface ReceiveDeliveryScreenProps {
  delivery: Delivery;
  onBack: () => void;
  onRegister: (delivery: Delivery, scannedBoxes: Box[]) => void;
  boxes?: Box[];
  userRole?: ReceiveUserRole;
  onBoxesChange?: (boxes: Box[]) => void;
  onUpdateDeliveryStatus?: (deliveryId: string, status: Delivery['status'], reason?: string) => void;
  allDeliveries?: Delivery[]; // All deliveries for matching scanned boxes
  currentStoreSelection?: { storeId: string; storeCode?: string }; // Current store for filtering deliveries
}

function TopAppBarWithDeliveryInfo({ 
  onBack, 
  delivery,
  userRole,
  onCancelDelivery,
  canCancelDelivery
}: { 
  onBack: () => void;
  delivery: Delivery;
  userRole?: ReceiveUserRole;
  onCancelDelivery?: () => void;
  canCancelDelivery: boolean;
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
        
        {/* Delivery Info - Compact */}
        <div className="flex-1 min-w-0">
          <h1 className="title-medium text-on-surface truncate">
            Delivery: {delivery.deliveryId}
          </h1>
        </div>

        {userRole === 'admin' && canCancelDelivery && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="w-12 h-12 ml-2 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
                aria-label="Delivery actions"
              >
                <MoreVertical className="w-5 h-5 text-on-surface-variant" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-surface-container border border-outline-variant rounded-[12px] p-2 w-64">
              <DropdownMenuItem
                onClick={onCancelDelivery}
                className="px-3 py-2 rounded-[8px] hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer text-error"
              >
                <XCircle className="w-4 h-4 mr-2" />
                <span className="body-medium">Mark delivery as cancelled (Missing delivery)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

type ReceiveTab = 'scanned' | 'not-scanned';

function TabBar({ 
  activeTab, 
  onTabChange, 
  scannedCount, 
  notScannedCount 
}: { 
  activeTab: ReceiveTab; 
  onTabChange: (tab: ReceiveTab) => void;
  scannedCount: number;
  notScannedCount: number;
}) {
  const tabs: { id: ReceiveTab; label: string; count: number }[] = [
    { id: 'scanned', label: 'Scanned', count: scannedCount },
    { id: 'not-scanned', label: 'Not scanned', count: notScannedCount }
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
              activeTab === tab.id ? 'text-on-surface' : 'text-on-surface-variant'
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

function BoxCard({
  box,
  onMarkScanned,
  onMarkUnscanned,
  onMarkCancelled,
  onMarkRejected,
  selectable = false,
  isSelected = false,
  onToggleSelect,
  deliveryStatus,
  isAdmin = false
}: {
  box: Box;
  onMarkScanned: () => void;
  onMarkUnscanned?: () => void;
  onMarkCancelled?: () => void;
  onMarkRejected?: () => void;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  deliveryStatus: Delivery['status'];
  isAdmin?: boolean;
}) {
  const canScan = deliveryStatus === 'In transit';
  const canCancelBox = Boolean(isAdmin && deliveryStatus === 'In transit' && box.status !== 'Cancelled' && onMarkCancelled);
  const canRejectBox = Boolean(isAdmin && deliveryStatus === 'In transit' && box.isScanned && box.status !== 'Rejected' && box.status !== 'Cancelled' && onMarkRejected);
  const showMarkScanned = canScan && !box.isScanned && box.status !== 'Cancelled';
  const showMarkUnscanned = canScan && box.isScanned && box.status !== 'Cancelled';
  const showMenu = showMarkScanned || showMarkUnscanned || canCancelBox || canRejectBox;

  let statusLabel = 'In transit';
  let statusClass = 'bg-surface-container-high text-on-surface-variant';

  if (box.status === 'Cancelled') {
    statusLabel = `Cancelled${box.cancellationReason ? ` • ${box.cancellationReason}` : ''}`;
    statusClass = 'bg-error-container text-error';
  } else if (box.status === 'Rejected') {
    statusLabel = 'Rejected';
    statusClass = 'bg-error-container text-error';
  } else if (deliveryStatus === 'Delivered' || box.status === 'Delivered') {
    statusLabel = 'Delivered';
    statusClass = 'bg-secondary-container text-on-secondary-container';
  } else if (box.isScanned) {
    statusLabel = 'Scanned';
    statusClass = 'bg-primary-container text-primary';
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-surface-container hover:bg-surface-container-high transition-colors">
      {selectable && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
          aria-label={`Select ${box.boxId}`}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      )}
      {/* Leading Element - Box Icon */}
      <div className="flex-shrink-0 w-10 h-10 bg-surface-container-highest rounded-full flex items-center justify-center">
        <Package className="w-5 h-5 text-on-surface-variant" />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Line - Created date and Box status */}
        <div className="label-small text-on-surface-variant mb-1">
          {box.date} • <span className={(deliveryStatus === 'Delivered' || box.status === 'Delivered') ? 'text-tertiary' : ''}>{box.status}</span>
        </div>
        
        {/* Second Line - Box Label */}
        <div className="body-medium text-on-surface mb-1">
          <span className="label-small text-on-surface-variant">Box Label: </span>
          {box.boxId}
        </div>
        
        {/* Third Line - Box ID */}
        <div className="label-small text-on-surface-variant mb-1">
          <span className="label-small text-on-surface-variant">Box ID: </span>
          {box.id}
        </div>
        
        {/* Fourth Line - Order nr */}
        <div className="body-small text-on-surface-variant mb-1">
          <span className="label-small text-on-surface-variant">Order nr: </span>
          {box.orderNumber}
        </div>
        
        {/* Fifth Line - Sender/Partner and Delivery (if available) */}
        {(box.partnerName || box.deliveryLabel) && (
          <div className="body-small text-on-surface-variant">
            {box.partnerName && (
              <span className="label-small text-on-surface-variant">Sender: </span>
            )}
            {box.partnerName || ''}
            {box.partnerName && box.deliveryLabel && ' • '}
            {box.deliveryLabel && (
              <>
                <span className="label-small text-on-surface-variant">Delivery: </span>
                {box.deliveryLabel}
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Trailing Element - Items count or More menu */}
      <div className="flex-shrink-0 flex items-center gap-2">
        <div className="body-small text-on-surface-variant">
          {box.items} {box.items === 1 ? 'item' : 'items'}
        </div>
        {showMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="w-12 h-12 md:w-8 md:h-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest focus:bg-surface-container-highest active:bg-surface transition-colors touch-manipulation min-w-[48px] min-h-[48px] md:min-w-0 md:min-h-0"
                aria-label="More actions"
              >
                <MoreVertical className="w-4 h-4 text-on-surface-variant" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-surface-container border border-outline-variant rounded-[12px] p-2 w-64">
              {showMarkScanned && (
                <DropdownMenuItem 
                  onClick={onMarkScanned}
                  className="px-3 py-2 rounded-[8px] hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer"
                >
                  <span className="body-medium text-on-surface">Mark as scanned</span>
                </DropdownMenuItem>
              )}
              {showMarkUnscanned && (
                <DropdownMenuItem
                  onClick={onMarkUnscanned}
                  className="px-3 py-2 rounded-[8px] hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer"
                >
                  <span className="body-medium text-on-surface">Mark as not scanned</span>
                </DropdownMenuItem>
              )}
              {canRejectBox && (
                <DropdownMenuItem
                  onClick={onMarkRejected}
                  className="px-3 py-2 rounded-[8px] hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer text-error"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  <span className="body-medium">Reject box</span>
                </DropdownMenuItem>
              )}
              {canCancelBox && (
                <DropdownMenuItem
                  onClick={onMarkCancelled}
                  className="px-3 py-2 rounded-[8px] hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer text-error"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  <span className="body-medium">Mark as cancelled (Missing box)</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

function BoxesList({
  boxes,
  deliveryStatus,
  onMarkScanned,
  onMarkUnscanned,
  onMarkCancelled,
  onMarkRejected,
  selectableIds = [],
  onToggleSelect,
  showSelection = false,
  isAdmin = false
}: {
  boxes: Box[];
  deliveryStatus: Delivery['status'];
  onMarkScanned: (boxId: string) => void;
  onMarkUnscanned?: (boxId: string) => void;
  onMarkCancelled?: (boxId: string) => void;
  onMarkRejected?: (boxId: string) => void;
  selectableIds?: string[];
  onToggleSelect?: (boxId: string) => void;
  showSelection?: boolean;
  isAdmin?: boolean;
}) {
  if (boxes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <Package className="w-16 h-16 text-on-surface-variant mb-4" />
        <h3 className="title-medium text-on-surface mb-2">
          No boxes in this category
        </h3>
        <p className="body-medium text-on-surface-variant text-center">
          Use the scan button to process boxes
        </p>
      </div>
    );
  }

  return (
    <Card className="mx-4 md:mx-6 mb-4 bg-surface-container border border-outline-variant overflow-hidden">
      <div className="divide-y divide-outline-variant">
        {boxes.map((box) => (
          <BoxCard 
            key={box.id}
            box={box} 
            onMarkScanned={() => onMarkScanned(box.id)}
            onMarkUnscanned={onMarkUnscanned ? () => onMarkUnscanned(box.id) : undefined}
            onMarkCancelled={onMarkCancelled ? () => onMarkCancelled(box.id) : undefined}
            onMarkRejected={onMarkRejected ? () => onMarkRejected(box.id) : undefined}
            selectable={showSelection}
            isSelected={selectableIds.includes(box.id)}
            onToggleSelect={onToggleSelect ? () => onToggleSelect(box.id) : undefined}
            deliveryStatus={deliveryStatus}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </Card>
  );
}

function BottomActions({ 
  onRegister, 
  canRegister,
  scannedCount,
  totalBoxes 
}: { 
  onRegister: () => void; 
  canRegister: boolean;
  scannedCount: number;
  totalBoxes: number;
}) {
  return (
    <div className="sticky bottom-0 bg-surface border-t border-outline-variant p-4 md:p-6">
      <div className="flex justify-end">
        <div className="w-full md:max-w-md">
          <Button 
            onClick={onRegister}
            disabled={!canRegister}
            className="w-full bg-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 disabled:bg-on-surface/12 disabled:text-on-surface/38 text-on-primary transition-colors px-6 py-3 rounded-lg h-[56px] flex items-center justify-center label-large"
          >
            Register
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ReceiveDeliveryScreen({ 
  delivery, 
  onBack, 
  onRegister,
  boxes: initialBoxes,
  userRole,
  onBoxesChange,
  onUpdateDeliveryStatus,
  allDeliveries = [],
  currentStoreSelection
}: ReceiveDeliveryScreenProps) {
  const [activeTab, setActiveTab] = useState<'scanned' | 'not-scanned'>('not-scanned');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedBoxIds, setSelectedBoxIds] = useState<string[]>([]);
  const isAdmin = userRole === 'admin';
  const canScan = delivery.status === 'In transit';

  // Generate boxes from all in-transit deliveries to the current store
  const generateAllInTransitBoxes = useMemo(() => {
    const allBoxes: Box[] = [];
    
    // Get all in-transit deliveries to the current store
    const inTransitDeliveries = allDeliveries.filter(d => {
      if (d.status !== 'In transit') return false;
      // Match by storeId or storeCode
      if (currentStoreSelection?.storeId && d.receivingStoreId === currentStoreSelection.storeId) return true;
      if (currentStoreSelection?.storeCode) {
        // Try to match by store code if available
        const storeCode = currentStoreSelection.storeCode;
        // This is a simple match - in real app, you'd have storeCode in delivery
        return true; // Include all in-transit deliveries when scanning from home
      }
      // If no store selection, include all in-transit deliveries
      return true;
    });

    // Generate boxes for each in-transit delivery
    inTransitDeliveries.forEach(deliveryItem => {
      for (let i = 1; i <= deliveryItem.boxes; i++) {
        allBoxes.push({
          id: `box-${deliveryItem.id}-${i}`,
          boxId: `BOX-${deliveryItem.deliveryId.slice(-6)}-${i.toString().padStart(3, '0')}`,
          orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          externalOrder: `EXT-${Math.floor(10000 + Math.random() * 90000)}`,
          items: Math.floor(20 + Math.random() * 100),
          status: 'In transit',
          date: deliveryItem.date,
          isScanned: false,
          deliveryId: deliveryItem.id,
          deliveryLabel: deliveryItem.deliveryId,
          partnerId: deliveryItem.partnerId,
          partnerName: deliveryItem.partnerName || deliveryItem.sender,
          warehouseId: deliveryItem.warehouseId,
          warehouseName: deliveryItem.warehouseName
        });
      }
    });

    return allBoxes;
  }, [allDeliveries, currentStoreSelection]);

  // Generate mock boxes for the delivery or use provided boxes
  const [boxes, setBoxes] = useState<Box[]>(() => {
    if (initialBoxes && initialBoxes.length > 0) {
      // Ensure boxes have partner/delivery info if missing
      return initialBoxes.map(box => ({
        ...box,
        deliveryId: box.deliveryId || delivery.id,
        deliveryLabel: box.deliveryLabel || delivery.deliveryId,
        partnerId: box.partnerId || delivery.partnerId,
        partnerName: box.partnerName || delivery.partnerName || delivery.sender,
        warehouseId: box.warehouseId || delivery.warehouseId,
        warehouseName: box.warehouseName || delivery.warehouseName
      }));
    }
    
    const mockBoxes: Box[] = [];
    for (let i = 1; i <= delivery.boxes; i++) {
      mockBoxes.push({
        id: `box-${i}`,
        boxId: `BOX-${delivery.deliveryId.slice(-6)}-${i.toString().padStart(3, '0')}`,
        orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        externalOrder: `EXT-${Math.floor(10000 + Math.random() * 90000)}`,
        items: Math.floor(20 + Math.random() * 100),
        status: 'In transit',
        date: delivery.date,
        isScanned: false,
        deliveryId: delivery.id,
        deliveryLabel: delivery.deliveryId,
        partnerId: delivery.partnerId,
        partnerName: delivery.partnerName || delivery.sender,
        warehouseId: delivery.warehouseId,
        warehouseName: delivery.warehouseName
      });
    }
    return mockBoxes;
  });


  const applyBoxUpdate = (updater: (prev: Box[]) => Box[]) => {
    setBoxes(prev => {
      const next = updater(prev);
      onBoxesChange?.(next);
      return next;
    });
  };

  useEffect(() => {
    setSelectedBoxIds([]);
  }, [activeTab, boxes]);

  const scannedBoxes = boxes.filter(box => box.isScanned);
  
  // For "Not scanned" tab: show all in-transit boxes from all deliveries (not scanned)
  // Merge boxes from all deliveries with currently scanned boxes
  const allNotScannedBoxes = useMemo(() => {
    // Get all boxes from in-transit deliveries
    const allInTransitBoxes = generateAllInTransitBoxes;
    
    // Get scanned box IDs to exclude them
    const scannedBoxIds = new Set(boxes.filter(b => b.isScanned).map(b => b.id));
    
    // Filter out already scanned boxes and merge with existing boxes
    const existingBoxIds = new Set(boxes.map(b => b.id));
    const newBoxes = allInTransitBoxes.filter(box => 
      !scannedBoxIds.has(box.id) && !existingBoxIds.has(box.id)
    );
    
    // Combine existing unscanned boxes with new boxes from all deliveries
    const existingNotScanned = boxes.filter(box => !box.isScanned);
    return [...existingNotScanned, ...newBoxes];
  }, [boxes, generateAllInTransitBoxes]);
  
  const notScannedBoxes = activeTab === 'not-scanned' && delivery.deliveryId === 'SCAN' 
    ? allNotScannedBoxes 
    : boxes.filter(box => !box.isScanned);
  const currentBoxes = activeTab === 'scanned' ? scannedBoxes : notScannedBoxes;
  const canRegister = canScan && scannedBoxes.length > 0;

  const markBoxesAsScanned = (boxIds: string[]) => {
    if (!boxIds.length) return;
    console.log('[ReceiveDeliveryScreen] markBoxesAsScanned called with:', boxIds);
    console.log('[ReceiveDeliveryScreen] Current boxes before update:', boxes.map(b => ({ id: b.id, boxId: b.boxId, isScanned: b.isScanned })));
    
    applyBoxUpdate(prev => {
      const updated = prev.map(box =>
        boxIds.includes(box.id)
          ? { ...box, isScanned: true, status: 'In transit' as const, cancellationReason: undefined }
          : box
      );
      console.log('[ReceiveDeliveryScreen] Updated boxes:', updated.map(b => ({ id: b.id, boxId: b.boxId, isScanned: b.isScanned })));
      return updated;
    });
  };

  const markBoxesAsUnscanned = (boxIds: string[]) => {
    if (!boxIds.length) return;
    applyBoxUpdate(prev =>
      prev.map(box =>
        boxIds.includes(box.id)
          ? { ...box, isScanned: false, status: 'In transit' as const, cancellationReason: undefined }
          : box
      )
    );
    setSelectedBoxIds(prev => prev.filter(id => !boxIds.includes(id)));
  };

  const handleToggleBoxSelection = (boxId: string) => {
    setSelectedBoxIds(prev =>
      prev.includes(boxId) ? prev.filter(id => id !== boxId) : [...prev, boxId]
    );
  };

  const handleSelectAllNotScanned = () => {
    if (selectedBoxIds.length === notScannedBoxes.length) {
      setSelectedBoxIds([]);
    } else {
      setSelectedBoxIds(notScannedBoxes.map(box => box.id));
    }
  };

  const handleBulkMarkScanned = () => {
    if (!canScan || !selectedBoxIds.length) return;
    markBoxesAsScanned(selectedBoxIds);
    toast.success(`Marked ${selectedBoxIds.length} box${selectedBoxIds.length === 1 ? '' : 'es'} as scanned`);
    setSelectedBoxIds([]);
    setActiveTab('scanned');
  };

  const handleScan = (scannedCode: string) => {
    console.log('[ReceiveDeliveryScreen] handleScan called with code:', scannedCode);
    console.log('[ReceiveDeliveryScreen] canScan:', canScan);
    console.log('[ReceiveDeliveryScreen] Current boxes:', boxes.map(b => ({ id: b.id, boxId: b.boxId, isScanned: b.isScanned })));
    
    if (!canScan) {
      console.log('[ReceiveDeliveryScreen] Cannot scan - canScan is false');
      return;
    }
    
    // Find the box that matches the scanned code from all boxes
    // Try to match by boxId first, then by any part of the scanned code
    const matchingBox = boxes.find(box => {
      // Only consider unscanned boxes
      if (box.isScanned) return false;
      // Exact match on boxId
      if (box.boxId === scannedCode) return true;
      // Match if scanned code contains boxId
      if (scannedCode.includes(box.boxId)) return true;
      // Match if boxId contains scanned code
      if (box.boxId.includes(scannedCode)) return true;
      return false;
    });
    
    // If no match found, use the first unscanned box (fallback for testing)
    const unscannedBoxes = boxes.filter(box => !box.isScanned);
    let boxToScan = matchingBox || unscannedBoxes[0];
    
    // If no box exists or no match found (scan any box mode from home screen), try to match with existing deliveries
    if (!boxToScan) {
      // Try to find a matching delivery from scanned code
      let matchedDelivery: Delivery | null = null;
      
      // Try to match by deliveryId in scanned code
      if (allDeliveries.length > 0) {
        matchedDelivery = allDeliveries.find(d => {
          // Check if scanned code contains deliveryId or vice versa
          return scannedCode.includes(d.deliveryId) || 
                 d.deliveryId.includes(scannedCode) ||
                 scannedCode.includes(d.id) ||
                 d.id.includes(scannedCode);
        }) || null;
      }
      
      // If no delivery match, try to find by box pattern in existing boxes from other deliveries
      // For now, create a new box with partner/delivery info if matched, or generic if not
      const newBox: Box = {
        id: `box-${Date.now()}`,
        boxId: scannedCode, // Use scanned code as boxId
        orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        externalOrder: `EXT-${Math.floor(10000 + Math.random() * 90000)}`,
        items: Math.floor(20 + Math.random() * 100),
        status: 'In transit',
        date: matchedDelivery?.date || delivery.date || new Date().toISOString().split('T')[0],
        isScanned: true, // Mark as scanned immediately since we're creating it from a scan
        deliveryId: matchedDelivery?.id,
        deliveryLabel: matchedDelivery?.deliveryId || 'Unknown Delivery',
        partnerId: matchedDelivery?.partnerId,
        partnerName: matchedDelivery?.partnerName || matchedDelivery?.sender || 'Unknown Partner',
        warehouseId: matchedDelivery?.warehouseId,
        warehouseName: matchedDelivery?.warehouseName
      };
      
      console.log('[ReceiveDeliveryScreen] Creating new box:', newBox);
      applyBoxUpdate(prev => [...prev, newBox]);
      setActiveTab('scanned');
      return;
    }
    
    console.log('[ReceiveDeliveryScreen] Matching box:', matchingBox);
    console.log('[ReceiveDeliveryScreen] Box to scan:', boxToScan);
    console.log('[ReceiveDeliveryScreen] Unscanned boxes count:', unscannedBoxes.length);
    
    if (!boxToScan) {
      console.log('[ReceiveDeliveryScreen] No box to scan found');
      return;
    }
    
    // Mark the box as scanned immediately
    markBoxesAsScanned([boxToScan.id]);
    // Switch to scanned tab to show the result
    setActiveTab('scanned');
    // Toast message removed - visual feedback already shown in scan area
  };

  const handleMarkScanned = (boxId: string) => {
    if (!canScan) return;
    markBoxesAsScanned([boxId]);
    const box = boxes.find(b => b.id === boxId);
    toast.success(`Marked ${box?.boxId ?? 'box'} as scanned`);
    setActiveTab('scanned');
  };

  const handleMarkUnscanned = (boxId: string) => {
    if (!canScan) return;
    markBoxesAsUnscanned([boxId]);
    const box = boxes.find(b => b.id === boxId);
    toast.info(`Moved ${box?.boxId ?? 'box'} back to Not scanned`);
    setActiveTab('not-scanned');
  };

  const handleMarkBoxCancelled = (boxId: string) => {
    if (!isAdmin || delivery.status === 'Cancelled') return;
    const targetBox = boxes.find(b => b.id === boxId);
    applyBoxUpdate(prev =>
      prev.map(box =>
        box.id === boxId
          ? { ...box, status: 'Cancelled' as const, isScanned: false, cancellationReason: 'Missing box' }
          : box
      )
    );
    setSelectedBoxIds(prev => prev.filter(id => id !== boxId));
    if (targetBox) {
      toast.info(`Marked ${targetBox.boxId} as cancelled (Missing box)`);
    } else {
      toast.info('Marked box as cancelled (Missing box)');
    }
  };

  const handleMarkBoxRejected = (boxId: string) => {
    if (!isAdmin || delivery.status === 'Cancelled') return;
    const targetBox = boxes.find(b => b.id === boxId);
    applyBoxUpdate(prev =>
      prev.map(box =>
        box.id === boxId
          ? { ...box, status: 'Rejected' as const, isScanned: false }
          : box
      )
    );
    setSelectedBoxIds(prev => prev.filter(id => id !== boxId));
    if (targetBox) {
      toast.info(`Rejected ${targetBox.boxId}`);
    } else {
      toast.info('Box rejected');
    }
  };

  const handleCancelDelivery = () => {
    if (!isAdmin || delivery.status === 'Cancelled') return;
    applyBoxUpdate(prev =>
      prev.map(box => ({
        ...box,
        status: 'Cancelled' as const,
        isScanned: false,
        cancellationReason: 'Missing box'
      }))
    );
    setSelectedBoxIds([]);
    setActiveTab('not-scanned');
    setIsScanning(false);
    onUpdateDeliveryStatus?.(delivery.id, 'Cancelled', 'Missing delivery');
    toast.info('Delivery marked as cancelled (Missing delivery)');
  };

  const handleRegister = () => {
    if (canRegister) {
      onRegister(delivery, scannedBoxes);
      applyBoxUpdate(prev =>
        prev.map(box =>
          box.isScanned
            ? { ...box, status: 'Delivered' as const, isScanned: true, cancellationReason: undefined }
            : box
        )
      );
      setSelectedBoxIds([]);
      setActiveTab('scanned');
      setIsScanning(false);
      onUpdateDeliveryStatus?.(delivery.id, 'Delivered');
    }
  };

  // Auto-scan effect - simulates continuous scanning
  useEffect(() => {
    let scanTimeout: NodeJS.Timeout;
    
    if (canScan && notScannedBoxes.length > 0 && !isScanning) {
      // Simulate finding and scanning boxes periodically (for demo purposes)
      scanTimeout = setTimeout(() => {
        // 30% chance to auto-scan on each interval
        if (Math.random() > 0.7) {
          handleScan();
        }
      }, 3000 + Math.random() * 2000); // 3-5 second intervals
    }

    return () => {
      if (scanTimeout) {
        clearTimeout(scanTimeout);
      }
    };
  }, [canScan, notScannedBoxes.length, isScanning]);

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* Spacer for top nav on desktop */}
      <div className="hidden md:block h-16"></div>
      {/* Top App Bar with Delivery Info */}
      <TopAppBarWithDeliveryInfo 
        onBack={onBack} 
        delivery={delivery} 
        userRole={userRole}
        onCancelDelivery={handleCancelDelivery}
        canCancelDelivery={isAdmin && delivery.status === 'In transit'}
      />
      
      {/* Content */}
      <div className="flex-1 pb-32">
        {/* Active Scanner - Only when delivery is in transit */}
        {canScan && (
          <div className="mx-4 md:mx-6 my-6">
            <ActiveScanner 
              onScan={handleScan}
              isScanning={isScanning}
              showManualEntry={false}
            />
          </div>
        )}

        {/* Tab Bar */}
        <TabBar 
          activeTab={activeTab} 
          onTabChange={(tab) => setActiveTab(tab)}
          scannedCount={scannedBoxes.length}
          notScannedCount={notScannedBoxes.length}
        />
        
        {/* Content Area */}
        <div className="pt-4">
          {/* Box count */}
          <div className="px-4 md:px-6 mb-4">
            <span className="body-medium text-on-surface-variant">
              {activeTab === 'scanned' 
                ? `${scannedBoxes.length} ${scannedBoxes.length === 1 ? 'box' : 'boxes'} scanned`
                : `${notScannedBoxes.length} ${notScannedBoxes.length === 1 ? 'box' : 'boxes'} not scanned`
              }
            </span>
          </div>

          {canScan && activeTab === 'not-scanned' && notScannedBoxes.length > 0 && (
            <div className="border-t border-outline-variant">
              <div className="flex items-center justify-between px-4 md:px-6 py-3">
                {/* Left side - Select all checkbox and count */}
                <div className="flex items-center gap-3">
                  <button 
                    className="p-3 ml-4 rounded-lg hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
                    onClick={handleSelectAllNotScanned}
                    aria-label={selectedBoxIds.length === notScannedBoxes.length ? "Deselect all boxes" : "Select all boxes"}
                  >
                    <div className="relative w-6 h-6">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
                        <path 
                          clipRule="evenodd" 
                          d={selectedBoxIds.length === notScannedBoxes.length ? svgPaths.p181a1800 : svgPaths.p3e435600} 
                          fill={selectedBoxIds.length === notScannedBoxes.length ? "var(--primary)" : "var(--outline-variant)"} 
                          fillRule="evenodd" 
                        />
                      </svg>
                      {selectedBoxIds.length === notScannedBoxes.length && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-4 h-4 text-on-primary" />
                        </div>
                      )}
                    </div>
                  </button>
                  
                  <div className="title-small text-on-surface">
                    {selectedBoxIds.length > 0 
                      ? `${selectedBoxIds.length} selected`
                      : `${notScannedBoxes.length} ${notScannedBoxes.length === 1 ? 'box' : 'boxes'}`
                    }
                  </div>
                </div>
                
                {/* Right side - More Actions Menu (only show when boxes are selected) */}
                {selectedBoxIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
                          aria-label="More actions"
                        >
                          <MoreVertical className="w-5 h-5 text-on-surface" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={handleBulkMarkScanned}>
                          <Package className="mr-2 h-4 w-4" />
                          <span>Mark as scanned</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Boxes List */}
          <BoxesList 
            boxes={currentBoxes}
            deliveryStatus={delivery.status}
            onMarkScanned={handleMarkScanned}
            onMarkUnscanned={handleMarkUnscanned}
            onMarkCancelled={handleMarkBoxCancelled}
            onMarkRejected={handleMarkBoxRejected}
            selectableIds={selectedBoxIds}
            onToggleSelect={handleToggleBoxSelection}
            showSelection={activeTab === 'not-scanned' && canScan}
            isAdmin={isAdmin}
          />
        </div>
      </div>
      
      {/* Bottom Actions */}
      <BottomActions 
        onRegister={handleRegister}
        canRegister={canRegister}
        scannedCount={scannedBoxes.length}
        totalBoxes={delivery.boxes}
      />
    </div>
  );
}
