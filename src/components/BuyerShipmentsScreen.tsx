import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowLeft, 
  Package, 
  TruckIcon, 
  CheckCircle2, 
  Clock,
  MapPin,
  Calendar,
  Box,
  Eye,
  AlertCircle
} from 'lucide-react';

export interface Shipment {
  id: string;
  orderId: string;
  partnerId: string;
  partnerName: string;
  status: 'preparing' | 'in-transit' | 'delivered' | 'delayed';
  trackingNumber?: string;
  origin: string;
  destination: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
  }[];
  currentLocation?: string;
  updates: {
    date: string;
    location: string;
    status: string;
    description: string;
  }[];
}

interface BuyerShipmentsScreenProps {
  shipments: Shipment[];
  onBack: () => void;
  onViewShipment: (shipmentId: string) => void;
}

export default function BuyerShipmentsScreen({
  shipments,
  onBack,
  onViewShipment
}: BuyerShipmentsScreenProps) {
  const [activeTab, setActiveTab] = useState('all');

  const filteredShipments = shipments.filter(shipment => {
    if (activeTab === 'all') return true;
    return shipment.status === activeTab;
  });

  const getStatusBadge = (status: Shipment['status']) => {
    switch (status) {
      case 'preparing':
        return (
          <Badge className="bg-secondary-container text-on-secondary-container">
            <Box className="w-3 h-3 mr-1" />
            Preparing
          </Badge>
        );
      case 'in-transit':
        return (
          <Badge className="bg-primary-container text-on-primary-container">
            <TruckIcon className="w-3 h-3 mr-1" />
            In transit
          </Badge>
        );
      case 'delivered':
        return (
          <Badge className="bg-tertiary-container text-on-tertiary-container">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Delivered
          </Badge>
        );
      case 'delayed':
        return (
          <Badge className="bg-error-container text-on-error-container">
            <AlertCircle className="w-3 h-3 mr-1" />
            Delayed
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: Shipment['status']) => {
    switch (status) {
      case 'preparing':
        return <Box className="w-5 h-5 text-on-secondary-container" />;
      case 'in-transit':
        return <TruckIcon className="w-5 h-5 text-on-primary-container" />;
      case 'delivered':
        return <CheckCircle2 className="w-5 h-5 text-on-tertiary-container" />;
      case 'delayed':
        return <AlertCircle className="w-5 h-5 text-on-error-container" />;
    }
  };

  const getStatusContainerColor = (status: Shipment['status']) => {
    switch (status) {
      case 'preparing':
        return 'bg-secondary-container';
      case 'in-transit':
        return 'bg-primary-container';
      case 'delivered':
        return 'bg-tertiary-container';
      case 'delayed':
        return 'bg-error-container';
    }
  };

  const inTransitCount = shipments.filter(s => s.status === 'in-transit').length;
  const delayedCount = shipments.filter(s => s.status === 'delayed').length;

  return (
    <div className="min-h-screen bg-surface pb-20 md:pb-0 md:pl-20">
      {/* Top App Bar */}
      <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-2 hover:bg-surface-container-high"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="title-large text-on-surface">Shipment tracking</h1>
            <p className="body-small text-on-surface-variant">
              {shipments.length} total shipments
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
              All ({shipments.length})
            </TabsTrigger>
            <TabsTrigger 
              value="preparing" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
            >
              Preparing
            </TabsTrigger>
            <TabsTrigger 
              value="in-transit" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
            >
              In transit ({inTransitCount})
            </TabsTrigger>
            <TabsTrigger 
              value="delivered" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
            >
              Delivered
            </TabsTrigger>
            {delayedCount > 0 && (
              <TabsTrigger 
                value="delayed" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 text-error"
              >
                Delayed ({delayedCount})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filteredShipments.length === 0 ? (
              <Card className="p-12 bg-surface-container border-outline-variant text-center">
                <Package className="w-16 h-16 text-on-surface-variant mx-auto mb-4 opacity-50" />
                <h2 className="title-medium text-on-surface mb-2">
                  No {activeTab !== 'all' ? activeTab : ''} shipments
                </h2>
                <p className="body-medium text-on-surface-variant">
                  {activeTab === 'in-transit' 
                    ? 'You have no shipments in transit'
                    : activeTab === 'delivered'
                    ? 'No shipments have been delivered yet'
                    : 'Your shipment tracking information will appear here'}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredShipments.map(shipment => (
                  <Card 
                    key={shipment.id}
                    className="bg-surface-container border-outline-variant overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="title-small text-on-surface">{shipment.id}</h3>
                            {getStatusBadge(shipment.status)}
                          </div>
                          <p className="body-medium text-on-surface-variant">{shipment.partnerName}</p>
                          {shipment.trackingNumber && (
                            <p className="body-small text-on-surface-variant">
                              Tracking: {shipment.trackingNumber}
                            </p>
                          )}
                        </div>
                        <div className={`w-10 h-10 ${getStatusContainerColor(shipment.status)} rounded-full flex items-center justify-center flex-shrink-0`}>
                          {getStatusIcon(shipment.status)}
                        </div>
                      </div>

                      {/* Route */}
                      <div className="flex items-center gap-2 mb-3 p-3 bg-surface-container-high rounded-lg">
                        <MapPin className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
                        <div className="flex-1 body-small text-on-surface">
                          <span className="text-on-surface-variant">From:</span> {shipment.origin}
                        </div>
                        <div className="w-2 h-px bg-outline flex-shrink-0" />
                        <div className="flex-1 body-small text-on-surface">
                          <span className="text-on-surface-variant">To:</span> {shipment.destination}
                        </div>
                      </div>

                      {/* Current location for in-transit */}
                      {shipment.status === 'in-transit' && shipment.currentLocation && (
                        <div className="flex items-center gap-2 mb-3 p-2 bg-primary-container rounded-lg">
                          <TruckIcon className="w-4 h-4 text-on-primary-container" />
                          <span className="body-small text-on-primary-container">
                            Current location: {shipment.currentLocation}
                          </span>
                        </div>
                      )}

                      {/* Items summary */}
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="w-4 h-4 text-on-surface-variant" />
                        <span className="body-small text-on-surface-variant">
                          {shipment.items.reduce((sum, item) => sum + item.quantity, 0)} items in {shipment.items.length} {shipment.items.length === 1 ? 'product' : 'products'}
                        </span>
                      </div>

                      {/* Delivery estimate */}
                      <div className="flex items-center gap-4 mb-3 body-small">
                        {shipment.actualDelivery ? (
                          <div className="flex items-center gap-1 text-tertiary">
                            <CheckCircle2 className="w-4 h-4" />
                            Delivered: {new Date(shipment.actualDelivery).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-on-surface-variant">
                            <Calendar className="w-4 h-4" />
                            Est. delivery: {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Latest update */}
                      {shipment.updates.length > 0 && (
                        <div className="p-3 bg-surface-container-highest rounded-lg mb-3">
                          <p className="body-small text-on-surface-variant mb-1">Latest update</p>
                          <p className="body-medium text-on-surface">{shipment.updates[0].status}</p>
                          <p className="body-small text-on-surface-variant">
                            {shipment.updates[0].location} • {new Date(shipment.updates[0].date).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <Button 
                        onClick={() => onViewShipment(shipment.id)}
                        variant="outline"
                        size="sm"
                        className="w-full border-outline"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View tracking details
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
