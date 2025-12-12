import React from 'react';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, Package, MoreVertical, CheckCircle2, XCircle } from 'lucide-react';
import { Box } from './ReceiveDeliveryScreen';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ItemCard, BaseItem } from './ItemCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface BoxItem {
  id: string;
  itemId: string;
  title: string;
  brand: string;
  category: string;
  size?: string;
  color?: string;
  price: number;
  status: string;
  date: string;
  thumbnail?: string;
  orderNumber: string;
}

interface BoxDetailsScreenProps {
  box: Box;
  items: BoxItem[];
  onBack: () => void;
  onMarkDelivered?: () => void;
  onMarkRejected?: () => void;
  userRole?: 'admin' | 'store-staff' | 'store-manager' | 'partner' | 'buyer';
  deliveryStatus?: 'In transit' | 'Delivered' | 'Cancelled' | 'Rejected' | 'Pending' | 'Packing';
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
          Box details
        </h1>
      </div>
    </div>
  );
}

function BoxInfoCard({ 
  box, 
  onMarkDelivered, 
  onMarkRejected, 
  userRole,
  deliveryStatus
}: { 
  box: Box;
  onMarkDelivered?: () => void;
  onMarkRejected?: () => void;
  userRole?: 'admin' | 'store-staff' | 'store-manager' | 'partner' | 'buyer';
  deliveryStatus?: 'In transit' | 'Delivered' | 'Cancelled' | 'Rejected' | 'Pending' | 'Packing';
}) {
  const isAdmin = userRole === 'admin';
  const canScan = deliveryStatus === 'In transit' || !deliveryStatus; // If no deliveryStatus provided, assume it's in transit if box is
  const isInTransit = box.status === 'In transit';
  const showMarkDelivered = isAdmin && canScan && isInTransit && onMarkDelivered;
  const showMarkRejected = isAdmin && canScan && isInTransit && onMarkRejected;
  const showMenu = showMarkDelivered || showMarkRejected;

  return (
    <Card className="mx-4 md:mx-6 mb-6 bg-surface-container border border-outline-variant">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Leading visual */}
          <div className="w-12 h-12 bg-primary-container rounded-[12px] flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-on-primary-container" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Supporting text - Date and Status */}
            <div className="label-small text-on-surface-variant mb-2">
              {box.date} • {box.status === 'Delivered' ? (
                <span className="label-small px-2 py-0.5 rounded-full bg-success-container text-on-success-container">
                  {box.status}
                </span>
              ) : (
                box.status
              )}
            </div>
            
            {/* Primary text - Box ID */}
            <h3 className="title-medium text-on-surface mb-2">
              {box.boxId}
            </h3>

            {/* Order Information */}
            <div className="mb-3">
              <div className="label-small text-on-surface-variant mb-1">
                Order Number
              </div>
              <div className="body-medium text-on-surface">
                {box.orderNumber}
              </div>
            </div>

            {/* External Order */}
            {box.externalOrder && (
              <div className="mb-3">
                <div className="label-small text-on-surface-variant mb-1">
                  External Order
                </div>
                <div className="body-medium text-on-surface">
                  {box.externalOrder}
                </div>
              </div>
            )}
          </div>

          {/* More menu */}
          {showMenu && (
            <div className="flex-shrink-0 ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors touch-manipulation min-w-[48px] min-h-[48px]"
                    aria-label="More actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-5 h-5 text-on-surface-variant" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-surface-container border border-outline-variant rounded-[12px] p-2 w-64 z-50">
                  {showMarkDelivered && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkDelivered?.();
                      }}
                      className="px-3 py-2 rounded-[8px] hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      <span className="body-medium text-on-surface">Mark as Delivered</span>
                    </DropdownMenuItem>
                  )}
                  {showMarkRejected && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkRejected?.();
                      }}
                      className="px-3 py-2 rounded-[8px] hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer text-error"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      <span className="body-medium">Reject box</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ItemsList({ items }: { items: BoxItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <Package className="w-16 h-16 text-on-surface-variant mb-4" />
        <h3 className="title-medium text-on-surface mb-2">
          No items found
        </h3>
        <p className="body-medium text-on-surface-variant text-center">
          This box has no items
        </p>
      </div>
    );
  }

  return (
    <div className="mx-4 md:mx-6 mb-4">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="mb-2 last:mb-0"
        >
          <div className="border border-outline-variant rounded-lg overflow-hidden bg-surface-container">
            <div className="px-4 py-3">
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
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BoxDetailsScreen({ 
  box, 
  items,
  onBack,
  onMarkDelivered,
  onMarkRejected,
  userRole,
  deliveryStatus
}: BoxDetailsScreenProps) {
  // Update item statuses if box is delivered - items should not be "In transit" anymore
  const updatedItems = box.status === 'Delivered' 
    ? items.map(item => ({
        ...item,
        status: item.status === 'In transit' ? 'Available' : item.status
      }))
    : items;

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* Top App Bar */}
      <TopAppBar onBack={onBack} />
      
      {/* Content */}
      <div className="flex-1 pt-6 pb-6">
        {/* Box Info Card */}
        <BoxInfoCard 
          box={box} 
          onMarkDelivered={onMarkDelivered}
          onMarkRejected={onMarkRejected}
          userRole={userRole}
          deliveryStatus={deliveryStatus}
        />
        
        {/* Items count */}
        <div className="px-4 md:px-6 mb-4">
          <span className="body-medium text-on-surface-variant">
            {updatedItems.length} item{updatedItems.length !== 1 ? 's' : ''} in this box
          </span>
        </div>
        
        {/* Items List */}
        <ItemsList items={updatedItems} />
      </div>
    </div>
  );
}
