import React, { useState } from 'react';
import { ArrowLeft, Package, Calendar, Truck, MapPin, MessageSquare, CheckCircle2, XCircle, Clock, FileText, Send } from 'lucide-react';
import { ShowroomOrder, OrderItem, ShowroomMessage } from './ShowroomTypes';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Input } from './ui/input';

interface PurchaseOrderDetailsScreenProps {
  order: ShowroomOrder;
  onBack: () => void;
  onApprove?: (orderId: string) => void;
  onReject?: (orderId: string, reason: string) => void;
  onUpdateShipment?: (orderId: string, shipmentInfo: any) => void;
  onFulfillOrder?: (orderId: string) => void;
  userRole: 'partner' | 'buyer';
  messages?: ShowroomMessage[];
  onSendMessage?: (message: string) => void;
  onApproveQuote?: (finalPrice: number) => void;
  onRejectQuote?: (reason: string) => void;
}

export default function PurchaseOrderDetailsScreen({
  order,
  onBack,
  onApprove,
  onReject,
  onUpdateShipment,
  onFulfillOrder,
  userRole,
  messages,
  onSendMessage,
  onApproveQuote,
  onRejectQuote
}: PurchaseOrderDetailsScreenProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [messageText, setMessageText] = useState('');

  // Guard against undefined order or items
  if (!order) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <p className="body-large text-on-surface-variant">Order not found</p>
          <Button onClick={onBack} className="mt-4">Go back</Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: ShowroomOrder['status']) => {
    const statusConfig = {
      submitted: { label: 'Submitted', variant: 'secondary' as const },
      in_review: { label: 'In review', variant: 'default' as const },
      approved: { label: 'Approved', variant: 'secondary' as const },
      rejected: { label: 'Rejected', variant: 'destructive' as const },
      fulfillment: { label: 'In fulfillment', variant: 'default' as const },
      shipped: { label: 'Shipped', variant: 'secondary' as const },
      closed: { label: 'Closed', variant: 'outline' as const }
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleApprove = () => {
    if (onApprove) {
      onApprove(order.id);
    }
  };

  const handleReject = () => {
    if (onReject && rejectReason.trim()) {
      onReject(order.id, rejectReason);
      setShowRejectDialog(false);
      setRejectReason('');
    }
  };

  const handleSendMessage = () => {
    if (onSendMessage && messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  return (
    <div className="min-h-screen bg-surface">
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
            <h1 className="title-large text-on-surface">
              {order.type === 'rfq' ? 'Quotation details' : 'Order details'}
            </h1>
            <p className="body-small text-on-surface-variant">{order.id}</p>
          </div>
          
          <div>
            {getStatusBadge(order.status)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 py-6 w-full space-y-6">
        {/* Buyer/Partner Information */}
        <Card className="p-4 bg-surface-container border border-outline-variant">
          <div className="space-y-3">
            <div>
              <p className="label-small text-on-surface-variant mb-1">
                {userRole === 'partner' ? 'Buyer' : 'Partner'}
              </p>
              <p className="body-large text-on-surface">
                {userRole === 'partner' ? order.buyerName : order.partnerName}
              </p>
              <p className="body-medium text-on-surface-variant">
                {userRole === 'partner' ? order.buyerCompany : ''}
              </p>
            </div>
            
            <Separator className="bg-outline-variant" />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="label-small text-on-surface-variant mb-1">Order date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-on-surface-variant" />
                  <p className="body-medium text-on-surface">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {order.requestedDeliveryDate && (
                <div>
                  <p className="label-small text-on-surface-variant mb-1">Requested delivery</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-on-surface-variant" />
                    <p className="body-medium text-on-surface">
                      {new Date(order.requestedDeliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <p className="label-small text-on-surface-variant mb-1">Shipping terms</p>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-on-surface-variant" />
                <p className="body-medium text-on-surface">{order.shippingTerms}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Shipment Tracking (if shipped) */}
        {order.shipment && (
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
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="label-small text-on-surface-variant mb-1">Carrier</p>
                  <p className="body-medium text-on-surface">{order.shipment.carrier}</p>
                </div>
                <div>
                  <p className="label-small text-on-surface-variant mb-1">Tracking number</p>
                  <p className="body-medium text-on-surface font-mono">{order.shipment.trackingNumber}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="label-small text-on-surface-variant mb-1">Shipped date</p>
                  <p className="body-medium text-on-surface">
                    {order.shipment.shippedDate ? new Date(order.shipment.shippedDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="label-small text-on-surface-variant mb-1">Estimated delivery</p>
                  <p className="body-medium text-on-surface">
                    {order.shipment.estimatedDelivery ? new Date(order.shipment.estimatedDelivery).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Order Items */}
        <div>
          <h2 className="title-medium text-on-surface mb-3">Order items</h2>
          <Card className="bg-surface-container border border-outline-variant divide-y divide-outline-variant">
            {order.items && order.items.length > 0 ? order.items.map((item) => (
              <div key={item.productId} className="p-4 flex gap-4">
                {item.image && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container-high flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="body-large text-on-surface mb-1">{item.title}</p>
                  <p className="body-small text-on-surface-variant mb-2">SKU: {item.sku}</p>
                  {item.variant && (
                    <p className="body-small text-on-surface-variant">{item.variant}</p>
                  )}
                  
                  {/* Size Breakdown */}
                  {item.sizeBreakdown && item.sizeBreakdown.length > 0 && (
                    <div className="mt-3 p-3 bg-surface-container-high rounded-lg">
                      <p className="label-small text-on-surface-variant mb-2">Size breakdown</p>
                      <div className="flex flex-wrap gap-2">
                        {item.sizeBreakdown.map((sizeQty) => (
                          <div 
                            key={sizeQty.size}
                            className="px-3 py-1 bg-surface-container border border-outline-variant rounded-full"
                          >
                            <span className="label-medium text-on-surface">{sizeQty.size}: </span>
                            <span className="body-medium text-on-surface">{sizeQty.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="body-medium text-on-surface-variant">Qty: {item.quantity}</p>
                  <p className="body-large text-on-surface">${item.pricePerUnit.toFixed(2)}</p>
                  <p className="body-small text-on-surface-variant mt-1">
                    ${item.subtotal.toFixed(2)}
                  </p>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center">
                <p className="body-medium text-on-surface-variant">No items in this order</p>
              </div>
            )}
            
            {order.items && order.items.length > 0 && (
            <div className="p-4 bg-surface-container-high">
              <div className="flex justify-between items-center">
                <p className="title-medium text-on-surface">Total</p>
                <p className="headline-small text-on-surface">${order.subtotal?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
            )}
          </Card>
        </div>

        {/* Notes */}
        {order.notes && (
          <Card className="p-4 bg-surface-container border border-outline-variant">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-on-surface-variant mt-0.5" />
              <div className="flex-1">
                <p className="label-medium text-on-surface mb-1">Order notes</p>
                <p className="body-medium text-on-surface-variant">{order.notes}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Messages - Show for quotations */}
        {order.type === 'rfq' && (
          <Card className="p-0 bg-surface-container border border-outline-variant overflow-hidden">
            <div className="p-4 border-b border-outline-variant bg-surface-container-high">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-on-surface-variant" />
                <h2 className="title-medium text-on-surface">Messages</h2>
              </div>
            </div>
            
            {/* Messages List */}
            <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
              {messages && messages.length > 0 ? (
                messages.map((msg) => {
                  const isOwnMessage = msg.authorRole === userRole;
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`flex-1 ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`px-4 py-3 rounded-lg max-w-[80%] ${
                          isOwnMessage 
                            ? 'bg-primary text-on-primary ml-auto' 
                            : 'bg-surface-container-highest text-on-surface'
                        }`}>
                          <p className="body-medium">{msg.body}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 px-1">
                          <p className="label-small text-on-surface-variant">
                            {msg.author}
                          </p>
                          <span className="text-on-surface-variant">•</span>
                          <p className="label-small text-on-surface-variant">
                            {new Date(msg.createdAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-on-surface-variant mx-auto mb-2 opacity-50" />
                  <p className="body-medium text-on-surface-variant">No messages yet</p>
                  <p className="body-small text-on-surface-variant">Start the conversation below</p>
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t border-outline-variant bg-surface">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 bg-surface-container border-outline"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="bg-primary text-on-primary hover:bg-primary/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Actions for Partner (In Review status) */}
        {userRole === 'partner' && order.status === 'in_review' && (
          <div className="sticky bottom-0 bg-surface border-t border-outline-variant p-4 md:px-6 -mx-4 md:-mx-6">
            <div className="w-full flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowRejectDialog(true)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject order
              </Button>
              <Button
                className="flex-1 bg-primary text-on-primary hover:bg-primary/90"
                onClick={handleApprove}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve order
              </Button>
            </div>
          </div>
        )}

        {/* Actions for Partner (Approved/Fulfillment status) */}
        {userRole === 'partner' && (order.status === 'approved' || order.status === 'fulfillment') && onFulfillOrder && (
          <div className="sticky bottom-0 bg-surface border-t border-outline-variant p-4 md:px-6 -mx-4 md:-mx-6">
            <div className="w-full">
              <Button
                className="w-full bg-primary text-on-primary hover:bg-primary/90"
                onClick={() => onFulfillOrder(order.id)}
              >
                <Truck className="w-4 h-4 mr-2" />
                {order.status === 'approved' ? 'Create shipment' : 'Continue shipment'}
              </Button>
            </div>
          </div>
        )}

        {/* Reject Dialog */}
        {showRejectDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-surface p-6 max-w-md w-full">
              <h2 className="title-large text-on-surface mb-4">Reject order</h2>
              <p className="body-medium text-on-surface-variant mb-4">
                Please provide a reason for rejecting this order.
              </p>
              
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mb-4"
                rows={4}
              />
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                >
                  Reject order
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}