import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle2, 
  Package,
  Eye,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';

export interface PurchaseOrder {
  id: string;
  partnerId: string;
  partnerName: string;
  status: 'pending' | 'confirmed' | 'in-production' | 'shipped' | 'delivered' | 'cancelled';
  orderType: 'po' | 'rfq';
  createdDate: string;
  totalAmount: number;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    pricePerUnit: number;
  }[];
  shipmentId?: string;
  estimatedDelivery?: string;
  notes?: string;
}

interface BuyerPurchaseOrdersScreenProps {
  orders: PurchaseOrder[];
  onBack: () => void;
  onViewOrder: (orderId: string) => void;
  onTrackShipment: (shipmentId: string) => void;
}

export default function BuyerPurchaseOrdersScreen({
  orders,
  onBack,
  onViewOrder,
  onTrackShipment
}: BuyerPurchaseOrdersScreenProps) {
  const [activeTab, setActiveTab] = useState('all');

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') {
      return ['pending', 'confirmed', 'in-production', 'shipped'].includes(order.status);
    }
    return order.status === activeTab;
  });

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-secondary-container text-on-secondary-container">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge className="bg-primary-container text-on-primary-container">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        );
      case 'in-production':
        return (
          <Badge className="bg-primary-container text-on-primary-container">
            <Package className="w-3 h-3 mr-1" />
            In production
          </Badge>
        );
      case 'shipped':
        return (
          <Badge className="bg-primary-container text-on-primary-container">
            <Package className="w-3 h-3 mr-1" />
            Shipped
          </Badge>
        );
      case 'delivered':
        return (
          <Badge className="bg-tertiary-container text-on-tertiary-container">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Delivered
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-error-container text-on-error-container">
            Cancelled
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-on-secondary-container" />;
      case 'confirmed':
      case 'in-production':
        return <Package className="w-5 h-5 text-on-primary-container" />;
      case 'shipped':
        return <Package className="w-5 h-5 text-on-primary-container" />;
      case 'delivered':
        return <CheckCircle2 className="w-5 h-5 text-on-tertiary-container" />;
      case 'cancelled':
        return <FileText className="w-5 h-5 text-on-error-container" />;
    }
  };

  const getStatusContainerColor = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-secondary-container';
      case 'confirmed':
      case 'in-production':
      case 'shipped':
        return 'bg-primary-container';
      case 'delivered':
        return 'bg-tertiary-container';
      case 'cancelled':
        return 'bg-error-container';
    }
  };

  const activeCount = orders.filter(o => 
    ['pending', 'confirmed', 'in-production', 'shipped'].includes(o.status)
  ).length;

  return (
    <div className="min-h-screen bg-surface pb-20 md:pb-0 md:pl-20">
      {/* Top App Bar */}
      <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6">
          <div className="flex-1">
            <h1 className="title-large text-on-surface">Orders</h1>
            <p className="body-small text-on-surface-variant">
              {orders.length} total orders
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-6 py-4 md:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start border-b border-outline-variant rounded-none bg-transparent h-auto p-0 mb-4">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
            >
              All ({orders.length})
            </TabsTrigger>
            <TabsTrigger 
              value="active" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
            >
              Active ({activeCount})
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger 
              value="confirmed" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
            >
              Confirmed
            </TabsTrigger>
            <TabsTrigger 
              value="delivered" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
            >
              Delivered
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filteredOrders.length === 0 ? (
              <Card className="p-12 bg-surface-container border-outline-variant text-center">
                <ShoppingCart className="w-16 h-16 text-on-surface-variant mx-auto mb-4 opacity-50" />
                <h2 className="title-medium text-on-surface mb-2">
                  No {activeTab !== 'all' ? activeTab : ''} orders
                </h2>
                <p className="body-medium text-on-surface-variant">
                  {activeTab === 'pending' 
                    ? 'You have no pending purchase orders'
                    : activeTab === 'active'
                    ? 'You have no active orders'
                    : 'Your purchase orders will appear here'}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map(order => (
                  <Card 
                    key={order.id}
                    className="bg-surface-container border-outline-variant overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="title-small text-on-surface">{order.id}</h3>
                            {getStatusBadge(order.status)}
                            {order.orderType === 'rfq' && (
                              <Badge className="bg-surface-container-highest text-on-surface">
                                RFQ
                              </Badge>
                            )}
                          </div>
                          <p className="body-medium text-on-surface-variant">{order.partnerName}</p>
                        </div>
                        <div className={`w-10 h-10 ${getStatusContainerColor(order.status)} rounded-full flex items-center justify-center flex-shrink-0`}>
                          {getStatusIcon(order.status)}
                        </div>
                      </div>

                      {/* Order summary */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="p-3 bg-surface-container-high rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="w-4 h-4 text-on-surface-variant" />
                            <span className="body-small text-on-surface-variant">Items</span>
                          </div>
                          <p className="title-small text-on-surface">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
                          </p>
                          <p className="body-small text-on-surface-variant">
                            {order.items.length} {order.items.length === 1 ? 'product' : 'products'}
                          </p>
                        </div>

                        <div className="p-3 bg-surface-container-high rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-on-surface-variant" />
                            <span className="body-small text-on-surface-variant">Total</span>
                          </div>
                          <p className="title-small text-on-surface">
                            ${order.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Date info */}
                      <div className="flex items-center gap-4 mb-3 body-small text-on-surface-variant">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdDate).toLocaleDateString()}
                        </div>
                        {order.estimatedDelivery && order.status !== 'delivered' && (
                          <div className="flex items-center gap-1">
                            Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Shipment tracking */}
                      {order.shipmentId && (
                        <div className="p-3 bg-primary-container rounded-lg mb-3">
                          <p className="body-small text-on-primary-container mb-2">
                            Shipment tracking available
                          </p>
                          <Button 
                            onClick={() => onTrackShipment(order.shipmentId!)}
                            size="sm"
                            className="bg-on-primary-container text-primary-container hover:bg-on-primary-container/90"
                          >
                            <Package className="w-4 h-4 mr-2" />
                            Track shipment
                          </Button>
                        </div>
                      )}

                      {/* Notes preview */}
                      {order.notes && (
                        <div className="p-3 bg-surface-container-highest rounded-lg mb-3">
                          <p className="body-small text-on-surface-variant line-clamp-2">{order.notes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <Button 
                        onClick={() => onViewOrder(order.id)}
                        variant="outline"
                        size="sm"
                        className="w-full border-outline"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View order details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
