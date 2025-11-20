import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, QrCode, Package, Truck, MoreVertical, CheckCircle2, XCircle } from 'lucide-react';
import { Delivery } from './ShippingScreen';
import { Box } from './ReceiveDeliveryScreen';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import type { MouseEvent as ReactMouseEvent } from 'react';

type DeliveryDetailsUserRole = 'admin' | 'store-staff' | 'store-manager' | 'partner' | 'buyer';

interface DeliveryDetailsScreenProps {
  delivery: Delivery;
  boxes: Box[];
  onBack: () => void;
  onScanToReceive: () => void;
  onSelectBox: (box: Box) => void;
  onMarkBoxScanned: (boxId: string) => void;
  userRole?: DeliveryDetailsUserRole;
  onUpdateDeliveryStatus?: (deliveryId: string, status: Delivery['status'], reason?: string) => void;
  onUpdateBoxStatus?: (boxId: string, status: Box['status']) => void;
}

function TopAppBar({ 
  onBack, 
  delivery, 
  userRole, 
  onUpdateDeliveryStatus 
}: { 
  onBack: () => void;
  delivery: Delivery;
  userRole?: DeliveryDetailsUserRole;
  onUpdateDeliveryStatus?: (deliveryId: string, status: Delivery['status'], reason?: string) => void;
}) {
  const isAdmin = userRole === 'admin';
  const canUpdateStatus = isAdmin && delivery.status === 'In transit' && onUpdateDeliveryStatus;

  const handleMarkDelivered = () => {
    if (onUpdateDeliveryStatus) {
      onUpdateDeliveryStatus(delivery.id, 'Delivered');
    }
  };

  const handleMarkCancelled = () => {
    if (onUpdateDeliveryStatus) {
      onUpdateDeliveryStatus(delivery.id, 'Cancelled', 'Missing delivery');
    }
  };

  const handleMarkRejected = () => {
    if (onUpdateDeliveryStatus) {
      onUpdateDeliveryStatus(delivery.id, 'Rejected');
    }
  };

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

        {/* More menu for admins on In transit deliveries */}
        {canUpdateStatus && (
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
                onClick={handleMarkDelivered}
                className="px-3 py-2 rounded-[8px] hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                <span className="body-medium text-on-surface">Mark as Delivered</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleMarkRejected}
                className="px-3 py-2 rounded-[8px] hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer text-error"
              >
                <XCircle className="w-4 h-4 mr-2" />
                <span className="body-medium">Mark as Rejected</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleMarkCancelled}
                className="px-3 py-2 rounded-[8px] hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer text-error"
              >
                <XCircle className="w-4 h-4 mr-2" />
                <span className="body-medium">Mark as Cancelled</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

function DeliveryAndSenderCard({ delivery }: { delivery: Delivery }) {
  const statusDisplay = delivery.status === 'Cancelled' && delivery.cancellationReason
    ? `${delivery.status} • ${delivery.cancellationReason}`
    : delivery.status;
  
  const getStatusBadgeClass = (status: Delivery['status']) => {
    if (status === 'Delivered') {
      return 'bg-success-container text-on-success-container';
    }
    return '';
  };

  const isDelivered = delivery.status === 'Delivered';

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
              <span>{delivery.date}, New - </span>
              {isDelivered ? (
                <span className={`label-small px-2 py-0.5 rounded-full ${getStatusBadgeClass(delivery.status)}`}>
                  {statusDisplay}
                </span>
              ) : (
                <span>{statusDisplay}</span>
              )}
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
  onMarkDelivered,
  onMarkRejected,
  isScanned,
  canScan,
  isAdmin = false
}: { 
  box: Box; 
  onSelect: () => void;
  onMarkDelivered?: () => void;
  onMarkRejected?: () => void;
  isScanned: boolean;
  canScan: boolean;
  isAdmin?: boolean;
}) {
  let statusLabel = 'In transit';
  let statusClass = 'label-small text-on-surface-variant px-2 py-1 bg-surface-container rounded-[8px]';

  if (box.status === 'Delivered') {
    statusLabel = 'Delivered';
    statusClass = 'label-small text-on-success-container px-2 py-1 bg-success-container rounded-[8px]';
  } else if (box.status === 'Rejected') {
    statusLabel = 'Rejected';
    statusClass = 'label-small text-on-error-container px-2 py-1 bg-error-container rounded-[8px]';
  } else if (box.status === 'Cancelled') {
    statusLabel = `Cancelled${box.cancellationReason ? ` • ${box.cancellationReason}` : ''}`;
    statusClass = 'label-small text-error px-2 py-1 bg-error-container rounded-[8px]';
  } else if (isScanned) {
    statusLabel = 'Scanned';
    statusClass = 'label-small text-primary px-2 py-1 bg-primary-container rounded-[8px]';
  }

  const showMarkDelivered = isAdmin && canScan && box.status === 'In transit' && onMarkDelivered;
  const showMarkRejected = isAdmin && canScan && box.status === 'In transit' && onMarkRejected;
  const showMenu = showMarkDelivered || showMarkRejected;

  return (
    <div
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-4 py-3 text-left bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
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
        {showMenu && (
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
              {showMarkDelivered && (
                <DropdownMenuItem 
                  onClick={(e: ReactMouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    onMarkDelivered?.();
                  }}
                  className="px-3 py-2 rounded-[8px] hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer"
                >
                  <span className="body-medium text-on-surface">Mark as delivered</span>
                </DropdownMenuItem>
              )}
              {showMarkRejected && (
                <DropdownMenuItem 
                  onClick={(e: ReactMouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    onMarkRejected?.();
                  }}
                  className="px-3 py-2 rounded-[8px] hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer text-error"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  <span className="body-medium">Mark as Rejected</span>
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
  onSelectBox,
  onMarkBoxDelivered,
  onMarkBoxRejected,
  canScan,
  isAdmin = false
}: { 
  boxes: Box[];
  onSelectBox: (box: Box) => void;
  onMarkBoxDelivered?: (boxId: string) => void;
  onMarkBoxRejected?: (boxId: string) => void;
  canScan: boolean;
  isAdmin?: boolean;
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
            onMarkDelivered={onMarkBoxDelivered ? () => onMarkBoxDelivered(box.id) : undefined}
            onMarkRejected={onMarkBoxRejected ? () => onMarkBoxRejected(box.id) : undefined}
            isScanned={box.isScanned}
            canScan={canScan}
            isAdmin={isAdmin}
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
  onMarkBoxScanned,
  userRole,
  onUpdateDeliveryStatus,
  onUpdateBoxStatus
}: DeliveryDetailsScreenProps) {
  const scannedBoxes = boxes.filter(b => b.isScanned);
  const canScan = delivery.status === 'In transit';
  const isAdmin = userRole === 'admin';

  const handleMarkBoxDelivered = (boxId: string) => {
    if (onUpdateBoxStatus) {
      onUpdateBoxStatus(boxId, 'Delivered');
    } else {
      // Fallback: mark as scanned
      onMarkBoxScanned(boxId);
    }
  };

  const handleMarkBoxRejected = (boxId: string) => {
    if (onUpdateBoxStatus) {
      onUpdateBoxStatus(boxId, 'Rejected');
    }
  };

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* Top App Bar */}
      <TopAppBar 
        onBack={onBack} 
        delivery={delivery}
        userRole={userRole}
        onUpdateDeliveryStatus={onUpdateDeliveryStatus}
      />
      
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
          onMarkBoxDelivered={isAdmin && canScan ? handleMarkBoxDelivered : undefined}
          onMarkBoxRejected={isAdmin && canScan ? handleMarkBoxRejected : undefined}
          canScan={canScan}
          isAdmin={isAdmin}
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
