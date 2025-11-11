import React, { useState } from 'react';
import { ArrowLeft, Package, Calendar, Truck, MapPin, MessageSquare, Edit2, Save, X, DollarSign } from 'lucide-react';
import { PurchaseOrder } from './BuyerPurchaseOrdersScreen';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Input } from './ui/input';

interface BuyerOrderDetailsScreenProps {
  order: PurchaseOrder;
  onBack: () => void;
  onUpdateOrder?: (orderId: string, updates: Partial<PurchaseOrder>) => void;
  onTrackShipment?: (shipmentId: string) => void;
}

export default function BuyerOrderDetailsScreen({
  order,
  onBack,
  onUpdateOrder,
  onTrackShipment
}: BuyerOrderDetailsScreenProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(order.notes || '');

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const },
      confirmed: { label: 'Confirmed', variant: 'default' as const },
      'in-production': { label: 'In production', variant: 'default' as const },
      shipped: { label: 'Shipped', variant: 'default' as const },
      delivered: { label: 'Delivered', variant: 'secondary' as const },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const }
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleSaveNotes = () => {
    if (onUpdateOrder) {
      onUpdateOrder(order.id, { notes: editedNotes });
    }
    setIsEditingNotes(false);
  };

  const handleCancelEditNotes = () => {
    setEditedNotes(order.notes || '');
    setIsEditingNotes(false);
  };

  const canEditOrder = order.status === 'pending';

  return (
    <div className="min-h-screen bg-surface pb-20 md:pb-0 md:pl-20">
      {/* Top App Bar */}
      <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6">
          <button 
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors mr-2"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
          
          <div className="flex-1">
            <h1 className="title-large text-on-surface">Order details</h1>
            <p className="body-small text-on-surface-variant">{order.id}</p>
          </div>
          
          <div>
            {getStatusBadge(order.status)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 py-6 w-full space-y-6">
        {/* Partner Information */}
        <Card className="p-4 bg-surface-container border border-outline-variant">
          <div className="space-y-3">
            <div>
              <p className="label-small text-on-surface-variant mb-1">Partner</p>
              <p className="body-large text-on-surface">{order.partnerName}</p>
            </div>
            
            <Separator className="bg-outline-variant" />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="label-small text-on-surface-variant mb-1">Order date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-on-surface-variant" />
                  <p className="body-medium text-on-surface">
                    {new Date(order.createdDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {order.estimatedDelivery && (
                <div>
                  <p className="label-small text-on-surface-variant mb-1">Estimated delivery</p>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-on-surface-variant" />
                    <p className="body-medium text-on-surface">
                      {new Date(order.estimatedDelivery).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <p className="label-small text-on-surface-variant mb-1">Order type</p>
              <Badge className={order.orderType === 'rfq' ? 'bg-secondary-container text-on-secondary-container' : 'bg-primary-container text-on-primary-container'}>
                {order.orderType === 'rfq' ? 'RFQ - Request for Quote' : 'Purchase Order'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Shipment Tracking (if available) */}
        {order.shipmentId && (
          <Card className="p-4 bg-surface-container border border-outline-variant">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5 text-on-primary-container" />
              </div>
              <div>
                <h2 className="title-medium text-on-surface">Shipment tracking</h2>
                <p className="body-small text-on-surface-variant">Track your order</p>
              </div>
            </div>
            
            <Button
              onClick={() => onTrackShipment && onTrackShipment(order.shipmentId!)}
              className="w-full bg-primary text-on-primary hover:bg-primary/90"
            >
              <Package className="w-4 h-4 mr-2" />
              View shipment details
            </Button>
          </Card>
        )}

        {/* Order Items */}
        <div>
          <h2 className="title-medium text-on-surface mb-3">Order items</h2>
          <Card className="bg-surface-container border border-outline-variant divide-y divide-outline-variant">
            {order.items.map((item, index) => (
              <div key={`${item.productId}-${index}`} className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="body-large text-on-surface mb-1">{item.productName}</p>
                    <p className="body-small text-on-surface-variant mb-2">SKU: {item.sku}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-on-surface-variant" />
                        <p className="body-medium text-on-surface-variant">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-on-surface-variant" />
                        <p className="body-medium text-on-surface-variant">
                          ${item.pricePerUnit.toFixed(2)} per unit
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="body-small text-on-surface-variant mb-1">Subtotal</p>
                    <p className="title-medium text-on-surface">
                      ${(item.quantity * item.pricePerUnit).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="p-4 bg-surface-container-high">
              <div className="flex justify-between items-center">
                <p className="title-medium text-on-surface">Total</p>
                <p className="headline-small text-on-surface">${order.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Order Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-surface-container border border-outline-variant">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-on-surface-variant" />
              <span className="label-small text-on-surface-variant">Total items</span>
            </div>
            <p className="title-large text-on-surface">
              {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
            </p>
            <p className="body-small text-on-surface-variant">
              {order.items.length} {order.items.length === 1 ? 'product' : 'products'}
            </p>
          </Card>

          <Card className="p-4 bg-surface-container border border-outline-variant">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-on-surface-variant" />
              <span className="label-small text-on-surface-variant">Average price</span>
            </div>
            <p className="title-large text-on-surface">
              ${(order.totalAmount / order.items.reduce((sum, item) => sum + item.quantity, 0)).toFixed(2)}
            </p>
            <p className="body-small text-on-surface-variant">per unit</p>
          </Card>
        </div>

        {/* Notes */}
        <Card className="p-4 bg-surface-container border border-outline-variant">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-on-surface-variant" />
              <p className="label-medium text-on-surface">Order notes</p>
            </div>
            {canEditOrder && !isEditingNotes && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingNotes(true)}
                className="hover:bg-surface-container-high"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>

          {isEditingNotes ? (
            <div className="space-y-3">
              <Textarea
                placeholder="Add notes about this order..."
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                className="min-h-[100px]"
                rows={4}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEditNotes}
                  className="border-outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  className="bg-primary text-on-primary hover:bg-primary/90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save notes
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {order.notes ? (
                <p className="body-medium text-on-surface-variant">{order.notes}</p>
              ) : (
                <p className="body-medium text-on-surface-variant italic">No notes added</p>
              )}
            </div>
          )}
        </Card>

        {/* Status Information */}
        {order.status === 'pending' && (
          <Card className="p-4 bg-secondary-container border border-outline-variant">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-on-secondary-container/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-on-secondary-container" />
              </div>
              <div>
                <p className="label-medium text-on-secondary-container mb-1">Pending confirmation</p>
                <p className="body-small text-on-secondary-container">
                  Your order is awaiting confirmation from {order.partnerName}. You'll be notified once it's confirmed.
                </p>
              </div>
            </div>
          </Card>
        )}

        {order.status === 'cancelled' && (
          <Card className="p-4 bg-error-container border border-outline-variant">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-on-error-container/10 rounded-full flex items-center justify-center flex-shrink-0">
                <X className="w-5 h-5 text-on-error-container" />
              </div>
              <div>
                <p className="label-medium text-on-error-container mb-1">Order cancelled</p>
                <p className="body-small text-on-error-container">
                  This order has been cancelled.
                </p>
              </div>
            </div>
          </Card>
        )}

        {order.status === 'delivered' && (
          <Card className="p-4 bg-tertiary-container border border-outline-variant">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-on-tertiary-container/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-on-tertiary-container" />
              </div>
              <div>
                <p className="label-medium text-on-tertiary-container mb-1">Order delivered</p>
                <p className="body-small text-on-tertiary-container">
                  Your order has been successfully delivered.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
