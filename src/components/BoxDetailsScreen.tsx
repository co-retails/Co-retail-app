import React from 'react';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, Package } from 'lucide-react';
import { Box } from './ReceiveDeliveryScreen';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ItemCard, BaseItem } from './ItemCard';

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

function BoxInfoCard({ box }: { box: Box }) {
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
              {box.date} • {box.status}
            </div>
            
            {/* Primary text - Box ID */}
            <h3 className="title-medium text-on-surface mb-2">
              {box.boxId}
            </h3>
            
            {/* Secondary text - Details */}
            <div className="body-small text-on-surface-variant mb-3">
              <span>Items: {box.items}</span>
            </div>

            {/* Order Information */}
            <div className="border-t border-outline-variant pt-3">
              <div className="label-small text-on-surface-variant mb-1">
                Order Number
              </div>
              <div className="body-medium text-on-surface">
                {box.orderNumber}
              </div>
            </div>

            {/* External Order */}
            {box.externalOrder && (
              <div className="mt-3 border-t border-outline-variant pt-3">
                <div className="label-small text-on-surface-variant mb-1">
                  External Order
                </div>
                <div className="body-medium text-on-surface">
                  {box.externalOrder}
                </div>
              </div>
            )}
          </div>
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
    <Card className="mx-4 md:mx-6 mb-4 bg-surface-container border border-outline-variant overflow-hidden">
      {items.map((item) => (
        <div key={item.id} className="border-b border-outline-variant last:border-b-0">
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
      ))}
    </Card>
  );
}

export default function BoxDetailsScreen({ 
  box, 
  items,
  onBack 
}: BoxDetailsScreenProps) {
  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* Top App Bar */}
      <TopAppBar onBack={onBack} />
      
      {/* Content */}
      <div className="flex-1 pt-6 pb-6">
        {/* Box Info Card */}
        <BoxInfoCard box={box} />
        
        {/* Items count */}
        <div className="px-4 md:px-6 mb-4">
          <span className="body-medium text-on-surface-variant">
            {items.length} item{items.length !== 1 ? 's' : ''} in this box
          </span>
        </div>
        
        {/* Items List */}
        <ItemsList items={items} />
      </div>
    </div>
  );
}
