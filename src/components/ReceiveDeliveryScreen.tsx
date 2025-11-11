import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { ArrowLeft, MoreVertical, QrCode, Package, Truck } from 'lucide-react';
import { Delivery } from './ShippingScreen';
import ActiveScanner from './ActiveScanner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner@2.0.3';

export interface Box {
  id: string;
  boxId: string;
  orderNumber: string;
  externalOrder: string;
  items: number;
  status: 'In transit' | 'Delivered';
  date: string;
  isScanned: boolean;
}

interface ReceiveDeliveryScreenProps {
  delivery: Delivery;
  onBack: () => void;
  onRegister: (delivery: Delivery, scannedBoxes: Box[]) => void;
  boxes?: Box[];
}

function TopAppBarWithDeliveryInfo({ 
  onBack, 
  delivery 
}: { 
  onBack: () => void;
  delivery: Delivery;
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
        
        {/* Delivery Info - Compact */}
        <div className="flex-1 min-w-0">
          <h1 className="title-medium text-on-surface truncate">
            {delivery.deliveryId}
          </h1>
          <p className="body-small text-on-surface-variant truncate">
            {delivery.sender} • {delivery.boxes} boxes
          </p>
        </div>
      </div>
    </div>
  );
}

function ManualAddForm({ 
  isVisible, 
  boxId, 
  onBoxIdChange, 
  onCancel, 
  onAdd 
}: {
  isVisible: boolean;
  boxId: string;
  onBoxIdChange: (value: string) => void;
  onCancel: () => void;
  onAdd: () => void;
}) {
  if (!isVisible) return null;

  return (
    <Card className="mx-4 md:mx-6 mb-4 bg-surface-container-high border border-outline-variant">
      <CardContent className="p-4">
        <div className="space-y-4">
          <h3 className="title-medium text-on-surface">
            Add Box Manually
          </h3>
          <div className="space-y-2">
            <Label className="label-large text-on-surface">
              Box label
            </Label>
            <Input
              type="text"
              placeholder="Enter box label"
              value={boxId}
              onChange={(e) => onBoxIdChange(e.target.value)}
              className="w-full px-4 py-3 bg-surface-container border border-outline rounded-[12px] body-large text-on-surface placeholder:text-on-surface-variant"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-outline text-on-surface hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors px-6 py-3 rounded-lg min-h-[40px] flex items-center justify-center label-large"
            >
              Cancel
            </Button>
            <Button
              onClick={onAdd}
              className="bg-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 text-on-primary transition-colors px-6 py-3 rounded-lg min-h-[40px] flex items-center justify-center label-large"
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
  notScannedCount 
}: { 
  activeTab: string; 
  onTabChange: (tab: string) => void;
  scannedCount: number;
  notScannedCount: number;
}) {
  const tabs = [
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
  isScanned,
  selectable = false,
  isSelected = false,
  onToggleSelect
}: {
  box: Box;
  onMarkScanned: () => void;
  onMarkUnscanned?: () => void;
  isScanned: boolean;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}) {
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
        {/* Top Line - Date and Status */}
        <div className="label-small text-on-surface-variant">
          {box.date} • {box.status}
        </div>
        
        {/* Second Line - Box ID */}
        <div className="title-small text-on-surface truncate">
          {box.boxId}
        </div>
        
        {/* Third Line - Details */}
        <div className="body-small text-on-surface-variant">
          Items: {box.items} • Order: {box.orderNumber}
        </div>
      </div>
      
      {/* Trailing Element - Status or More menu */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {isScanned ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest focus:bg-surface-container-highest active:bg-surface transition-colors"
                aria-label="More actions"
              >
                <MoreVertical className="w-4 h-4 text-on-surface-variant" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-surface-container border border-outline-variant rounded-[12px] p-2"
            >
              <DropdownMenuItem
                onClick={onMarkUnscanned}
                className="px-3 py-2 rounded-[8px] hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer"
              >
                <span className="body-medium text-on-surface">Mark as not scanned</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest focus:bg-surface-container-highest active:bg-surface transition-colors"
                aria-label="More actions"
              >
                <MoreVertical className="w-4 h-4 text-on-surface-variant" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-surface-container border border-outline-variant rounded-[12px] p-2">
              <DropdownMenuItem 
                onClick={onMarkScanned}
                className="px-3 py-2 rounded-[8px] hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer"
              >
                <span className="body-medium text-on-surface">Mark as scanned</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

function BoxesList({
  boxes,
  onMarkScanned,
  onMarkUnscanned,
  selectableIds = [],
  onToggleSelect,
  showSelection = false
}: {
  boxes: Box[];
  onMarkScanned: (boxId: string) => void;
  onMarkUnscanned?: (boxId: string) => void;
  selectableIds?: string[];
  onToggleSelect?: (boxId: string) => void;
  showSelection?: boolean;
}) {
  if (boxes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <Package className="w-16 h-16 text-on-surface-variant mb-4" />
        <h3 className="title-medium text-on-surface mb-2">
          No boxes in this category
        </h3>
        <p className="body-medium text-on-surface-variant text-center">
          Use the scan button or manual entry to process boxes
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
            isScanned={box.isScanned}
            selectable={showSelection}
            isSelected={selectableIds.includes(box.id)}
            onToggleSelect={onToggleSelect ? () => onToggleSelect(box.id) : undefined}
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
      <Button 
        onClick={onRegister}
        disabled={!canRegister}
        className="w-full bg-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 disabled:bg-on-surface/12 disabled:text-on-surface/38 text-on-primary transition-colors px-6 py-3 rounded-lg min-h-[40px] flex items-center justify-center label-large"
      >
        Register
      </Button>
      {scannedCount > 0 && (
        <div className="text-center mt-2">
          <span className="body-small text-on-surface-variant">
            {scannedCount}/{totalBoxes} boxes scanned
          </span>
        </div>
      )}
    </div>
  );
}

export default function ReceiveDeliveryScreen({ 
  delivery, 
  onBack, 
  onRegister,
  boxes: initialBoxes
}: ReceiveDeliveryScreenProps) {
  const [activeTab, setActiveTab] = useState<'scanned' | 'not-scanned'>('not-scanned');
  const [isScanning, setIsScanning] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualBoxId, setManualBoxId] = useState('');
  const [selectedBoxIds, setSelectedBoxIds] = useState<string[]>([]);

  // Generate mock boxes for the delivery or use provided boxes
  const [boxes, setBoxes] = useState<Box[]>(() => {
    if (initialBoxes && initialBoxes.length > 0) {
      return initialBoxes;
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
        isScanned: false
      });
    }
    return mockBoxes;
  });

  useEffect(() => {
    setSelectedBoxIds([]);
  }, [activeTab, boxes]);

  const scannedBoxes = boxes.filter(box => box.isScanned);
  const notScannedBoxes = boxes.filter(box => !box.isScanned);
  const currentBoxes = activeTab === 'scanned' ? scannedBoxes : notScannedBoxes;
  const canRegister = scannedBoxes.length > 0;

  const markBoxesAsScanned = (boxIds: string[]) => {
    if (!boxIds.length) return;
    setBoxes(prev =>
      prev.map(box =>
        boxIds.includes(box.id)
          ? { ...box, isScanned: true, status: 'In transit' as const }
          : box
      )
    );
  };

  const markBoxesAsUnscanned = (boxIds: string[]) => {
    if (!boxIds.length) return;
    setBoxes(prev =>
      prev.map(box =>
        boxIds.includes(box.id)
          ? { ...box, isScanned: false, status: 'In transit' as const }
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
    if (!selectedBoxIds.length) return;
    markBoxesAsScanned(selectedBoxIds);
    toast.success(`Marked ${selectedBoxIds.length} box${selectedBoxIds.length === 1 ? '' : 'es'} as scanned`);
    setSelectedBoxIds([]);
    setActiveTab('scanned');
  };

  const handleScan = () => {
    if (notScannedBoxes.length === 0) {
      return;
    }
    
    setIsScanning(true);
    
    // Simulate scanning a random box
    setTimeout(() => {
      const randomBox = notScannedBoxes[Math.floor(Math.random() * notScannedBoxes.length)];
      markBoxesAsScanned([randomBox.id]);
      setIsScanning(false);
      setActiveTab('scanned');
      toast.success(`Scanned ${randomBox.boxId}`);
    }, 1500);
  };

  const handleMarkScanned = (boxId: string) => {
    markBoxesAsScanned([boxId]);
    const box = boxes.find(b => b.id === boxId);
    toast.success(`Marked ${box?.boxId ?? 'box'} as scanned`);
    setActiveTab('scanned');
  };

  const handleMarkUnscanned = (boxId: string) => {
    markBoxesAsUnscanned([boxId]);
    const box = boxes.find(b => b.id === boxId);
    toast.success(`Moved ${box?.boxId ?? 'box'} back to Not scanned`);
    setActiveTab('not-scanned');
  };

  const handleManualAdd = () => {
    if (!manualBoxId.trim()) {
      return;
    }

    const box = notScannedBoxes.find(box =>
      box.boxId.toLowerCase().includes(manualBoxId.toLowerCase())
    );

    if (box) {
      markBoxesAsScanned([box.id]);
      setManualBoxId('');
      setShowManualAdd(false);
      setActiveTab('scanned');
      toast.success(`Added ${box.boxId}`);
    } else {
      toast.error('Box not found. Please check the label and try again.');
    }
  };

  const handleRegister = () => {
    if (canRegister) {
      onRegister(delivery, scannedBoxes);
    }
  };

  // Auto-scan effect - simulates continuous scanning
  useEffect(() => {
    let scanTimeout: NodeJS.Timeout;
    
    if (notScannedBoxes.length > 0 && !isScanning && !showManualAdd) {
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
  }, [notScannedBoxes.length, isScanning, showManualAdd]);

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* Top App Bar with Delivery Info */}
      <TopAppBarWithDeliveryInfo onBack={onBack} delivery={delivery} />
      
      {/* Content */}
      <div className="flex-1 pb-32">
        {/* Active Scanner - Always visible */}
        <div className="mx-4 md:mx-6 my-6">
          <ActiveScanner 
            onScan={handleScan}
            isScanning={isScanning}
            showManualEntry={false}
          />
        </div>

        <div className="px-4 md:px-6 mb-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={showManualAdd}
            onClick={() => {
              setManualBoxId('');
              setShowManualAdd(true);
            }}
          >
            Add box manually
          </Button>
        </div>

        {/* Manual Add Form */}
        <ManualAddForm 
          isVisible={showManualAdd}
          boxId={manualBoxId}
          onBoxIdChange={setManualBoxId}
          onCancel={() => {
            setShowManualAdd(false);
            setManualBoxId('');
          }}
          onAdd={handleManualAdd}
        />
        
        {/* Tab Bar */}
        <TabBar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          scannedCount={scannedBoxes.length}
          notScannedCount={notScannedBoxes.length}
        />
        
        {/* Content Area */}
        <div className="pt-4">
          {/* Box count */}
          <div className="px-4 md:px-6 mb-4">
            <span className="body-medium text-on-surface-variant">
              {activeTab === 'scanned' 
                ? `${scannedBoxes.length}/${delivery.boxes} boxes`
                : `${notScannedBoxes.length}/${delivery.boxes} boxes`
              }
            </span>
          </div>

          {activeTab === 'not-scanned' && notScannedBoxes.length > 0 && (
            <div className="px-4 md:px-6 mb-3 flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllNotScanned}
              >
                {selectedBoxIds.length === notScannedBoxes.length ? 'Clear selection' : 'Select all'}
              </Button>
              <Button
                size="sm"
                onClick={handleBulkMarkScanned}
                disabled={selectedBoxIds.length === 0}
              >
                Mark selected as scanned
              </Button>
            </div>
          )}
          
          {/* Boxes List */}
          <BoxesList 
            boxes={currentBoxes}
            onMarkScanned={handleMarkScanned}
            onMarkUnscanned={handleMarkUnscanned}
            selectableIds={selectedBoxIds}
            onToggleSelect={handleToggleBoxSelection}
            showSelection={activeTab === 'not-scanned'}
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
