import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, QrCode, Package, Truck, MoreVertical } from 'lucide-react';
import { Delivery } from './ShippingScreen';
import { Box } from './ReceiveDeliveryScreen';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import type { MouseEvent as ReactMouseEvent } from 'react';

interface DeliveryDetailsScreenProps {
  delivery: Delivery;
  boxes: Box[];
  onBack: () => void;
  onScanToReceive: () => void;
  onSelectBox: (box: Box) => void;
  onMarkBoxScanned: (boxId: string) => void;
}

function TopAppBar({ onBack }: { onBack: () => void }) {
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
          Delivery details
        </h1>
      </div>
    </div>
  );
}

function DeliveryAndSenderCard({ delivery }: { delivery: Delivery }) {
  const statusDisplay = delivery.status === 'Cancelled' && delivery.cancellationReason
    ? `${delivery.status} • ${delivery.cancellationReason}`
    : delivery.status;

  return (
    <Card className="mx-4 md:mx-6 mb-6 bg-surface-container border border-outline-variant">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Leading visual */}
          <div className="w-12 h-12 bg-primary-container rounded-[12px] flex items-center justify-center flex-shrink-0">
            <Truck className="w-6 h-6 text-on-primary-container" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Supporting text - Date and Status */}
            <div className="label-small text-on-surface-variant mb-2">
              <span>{delivery.date}, New - {statusDisplay}</span>
            </div>
            
            {/* Primary text - Delivery ID */}
            <h3 className="title-medium text-on-surface mb-2">
              Delivery ID: {delivery.deliveryId}
            </h3>
            
            {/* Secondary text - Details */}
            <div className="body-small text-on-surface-variant mb-3">
              <span>Boxes: {delivery.boxes} • Items: {delivery.items}</span>
            </div>

            {/* Sender Information */}
            <div className="border-t border-outline-variant pt-3">
              <div className="label-small text-on-surface-variant mb-1">
                Sender
              </div>
              <div className="body-medium text-on-surface">
                {delivery.sender} (PL000001)
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BoxCard({ 
  box, 
  onSelect,
  onMarkScanned,
  isScanned,
  canScan
}: { 
  box: Box; 
  onSelect: () => void;
  onMarkScanned: () => void;
  isScanned: boolean;
  canScan: boolean;
}) {
  let statusLabel = 'In transit';
  let statusClass = 'label-small text-on-surface-variant px-2 py-1 bg-surface-container rounded-[8px]';

  if (box.status === 'Delivered') {
    statusLabel = 'Delivered';
    statusClass = 'label-small text-on-secondary-container px-2 py-1 bg-secondary-container rounded-[8px]';
  } else if (box.status === 'Cancelled') {
    statusLabel = `Cancelled${box.cancellationReason ? ` • ${box.cancellationReason}` : ''}`;
    statusClass = 'label-small text-error px-2 py-1 bg-error-container rounded-[8px]';
  } else if (isScanned) {
    statusLabel = 'Scanned';
    statusClass = 'label-small text-primary px-2 py-1 bg-primary-container rounded-[8px]';
  }

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-4 py-3 text-left bg-surface-container hover:bg-surface-container-high transition-colors"
    >
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
        <div className="title-small text-on-surface">
          {box.boxId}
        </div>
        
        {/* Third Line - Details */}
        <div className="body-small text-on-surface-variant">
          Items: {box.items} • Order: {box.orderNumber}
        </div>
      </div>
      
      {/* Trailing Element - More menu or status */}
      <div className="flex-shrink-0 flex items-center gap-2">
        <div className={statusClass}>{statusLabel}</div>
        {!isScanned && canScan && box.status !== 'Delivered' && box.status !== 'Cancelled' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest focus:bg-surface-container-highest active:bg-surface transition-colors"
                onClick={(e: ReactMouseEvent<HTMLButtonElement>) => e.stopPropagation()}
                aria-label="More actions"
              >
                <MoreVertical className="w-4 h-4 text-on-surface-variant" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-surface-container border border-outline-variant rounded-[12px] p-2">
              <DropdownMenuItem 
                onClick={(e: ReactMouseEvent<HTMLDivElement>) => {
                  e.stopPropagation();
                  onMarkScanned();
                }}
                className="px-3 py-2 rounded-[8px] hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer"
              >
                <span className="body-medium text-on-surface">Mark as scanned</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </button>
  );
}

function BoxesList({ 
  boxes,
  onSelectBox,
  onMarkBoxScanned,
  canScan
}: { 
  boxes: Box[];
  onSelectBox: (box: Box) => void;
  onMarkBoxScanned: (boxId: string) => void;
  canScan: boolean;
}) {
  if (boxes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <Package className="w-16 h-16 text-on-surface-variant mb-4" />
        <h3 className="title-medium text-on-surface mb-2">
          No boxes found
        </h3>
        <p className="body-medium text-on-surface-variant text-center">
          This delivery has no boxes
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
            onSelect={() => onSelectBox(box)}
            onMarkScanned={() => onMarkBoxScanned(box.id)}
            isScanned={box.isScanned}
            canScan={canScan}
          />
        ))}
      </div>
    </Card>
  );
}

export default function DeliveryDetailsScreen({ 
  delivery, 
  boxes,
  onBack, 
  onScanToReceive,
  onSelectBox,
  onMarkBoxScanned
}: DeliveryDetailsScreenProps) {
  const scannedBoxes = boxes.filter(b => b.isScanned);
  const canScan = delivery.status === 'In transit';

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* Top App Bar */}
      <TopAppBar onBack={onBack} />
      
      {/* Content */}
      <div className="flex-1 pt-6">
        {/* Delivery & Sender Info */}
        <DeliveryAndSenderCard delivery={delivery} />
        
        {/* Instructions */}
        <div className="px-4 md:px-6 mb-4">
          <p className="body-medium text-on-surface-variant">
            {canScan
              ? 'Click on a box to view items, or use scan to receive to start scanning.'
              : 'Review the boxes for this delivery. Scanning is disabled because this delivery is no longer in transit.'}
          </p>
        </div>
        
        {/* Boxes count */}
        <div className="px-4 md:px-6 mb-4">
          <span className="body-medium text-on-surface-variant">
            {boxes.length} boxes ({scannedBoxes.length} scanned)
          </span>
        </div>
        
        {/* Boxes List */}
        <BoxesList 
          boxes={boxes}
          onSelectBox={onSelectBox}
          onMarkBoxScanned={onMarkBoxScanned}
          canScan={canScan}
        />
      </div>
      
      {/* Fixed Bottom Action Button */}
      {canScan && (
        <div className="sticky bottom-0 bg-surface border-t border-outline-variant p-4 md:p-6">
          <Button 
            onClick={onScanToReceive}
          className="w-full bg-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 text-on-primary transition-colors px-6 py-3 rounded-lg min-h-[40px] flex items-center justify-center label-large"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Scan to receive
          </Button>
        </div>
      )}
    </div>
  );
}
