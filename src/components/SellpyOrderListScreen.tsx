import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  ArrowLeftIcon, 
  SearchIcon,
  PackageIcon,
  CheckIcon,
  ClockIcon,
  AlertTriangleIcon
} from 'lucide-react';
import { OrderItem } from './OrderCreationScreen';

export interface SellpyOrder {
  id: string;
  createdDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'registered';
  totalItems: number;
  itemsWithRetailerIds: number;
  receivingStore: string;
  storeCode?: string;
  brandId?: string;
  countryId?: string;
  storeId?: string;
  items: OrderItem[];
}

interface SellpyOrderListScreenProps {
  onBack: () => void;
  onSelectOrder: (order: SellpyOrder) => void;
  orders: SellpyOrder[];
}

export default function SellpyOrderListScreen({
  onBack,
  onSelectOrder,
  orders
}: SellpyOrderListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.receivingStore.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: SellpyOrder['status']) => {
    switch (status) {
      case 'pending':
        return <ClockIcon size={16} className="text-on-surface-variant" />;
      case 'in-progress':
        return <AlertTriangleIcon size={16} className="text-secondary" />;
      case 'completed':
        return <CheckIcon size={16} className="text-success" />;
      case 'registered':
        return <CheckIcon size={16} className="text-primary" />;
      default:
        return <ClockIcon size={16} className="text-on-surface-variant" />;
    }
  };

  const getStatusBadgeVariant = (status: SellpyOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'outline' as const;
      case 'in-progress':
        return 'secondary' as const;
      case 'completed':
        return 'default' as const;
      case 'registered':
        return 'default' as const;
      default:
        return 'outline' as const;
    }
  };

  const getStatusText = (status: SellpyOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'Needs Retailer IDs';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Ready to Register';
      case 'registered':
        return 'Registered';
      default:
        return status;
    }
  };

  const getOrderPriority = (order: SellpyOrder) => {
    const completionRate = order.totalItems > 0 ? order.itemsWithRetailerIds / order.totalItems : 0;
    
    if (order.status === 'completed') return 1; // Ready to register
    if (order.status === 'in-progress') return 2; // Partially completed
    if (order.status === 'pending') return 3; // Not started
    return 4; // Registered (lowest priority)
  };

  const sortedOrders = filteredOrders.sort((a, b) => {
    const priorityA = getOrderPriority(a);
    const priorityB = getOrderPriority(b);
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // If same priority, sort by date (newest first)
    return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
  });

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-surface-container border-b border-outline-variant">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="text-on-surface-variant"
              >
                <ArrowLeftIcon size={20} />
              </Button>
              <div>
                <h1 className="headline-small text-on-surface">Orders from API Integration</h1>
                <p className="body-medium text-on-surface-variant">
                  Select an order to add retailer IDs
                </p>
              </div>
            </div>
            
            <Badge variant="outline">
              Sellpy Operations
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <SearchIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant" />
          <Input
            placeholder="Search orders by ID or store..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Orders Summary */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <Badge 
            variant="outline" 
            className="flex items-center gap-2 px-4 py-2 whitespace-nowrap cursor-pointer hover:bg-surface-container-high transition-colors"
          >
            <span className="title-medium text-on-surface">{orders.filter(o => o.status === 'pending').length}</span>
            <span className="body-medium text-on-surface-variant">Need Retailer IDs</span>
          </Badge>
          <Badge 
            variant="outline" 
            className="flex items-center gap-2 px-4 py-2 whitespace-nowrap cursor-pointer hover:bg-surface-container-high transition-colors"
          >
            <span className="title-medium text-secondary">{orders.filter(o => o.status === 'in-progress').length}</span>
            <span className="body-medium text-on-surface-variant">In Progress</span>
          </Badge>
          <Badge 
            variant="outline" 
            className="flex items-center gap-2 px-4 py-2 whitespace-nowrap cursor-pointer hover:bg-surface-container-high transition-colors"
          >
            <span className="title-medium text-success">{orders.filter(o => o.status === 'completed').length}</span>
            <span className="body-medium text-on-surface-variant">Ready to Register</span>
          </Badge>
          <Badge 
            variant="outline" 
            className="flex items-center gap-2 px-4 py-2 whitespace-nowrap cursor-pointer hover:bg-surface-container-high transition-colors"
          >
            <span className="title-medium text-primary">{orders.filter(o => o.status === 'registered').length}</span>
            <span className="body-medium text-on-surface-variant">Registered</span>
          </Badge>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle className="title-medium">Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedOrders.length === 0 ? (
              <div className="text-center py-8">
                <PackageIcon size={48} className="mx-auto text-on-surface-variant/50 mb-4" />
                <p className="title-medium text-on-surface-variant">
                  {searchQuery ? 'No matching orders found' : 'No orders from API integration'}
                </p>
                <p className="body-medium text-on-surface-variant">
                  {searchQuery ? 'Try adjusting your search terms' : 'Orders will appear here when received via API integration'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedOrders.map((order) => {
                  const completionRate = order.totalItems > 0 ? (order.itemsWithRetailerIds / order.totalItems) * 100 : 0;
                  
                  return (
                    <button
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className="w-full p-4 rounded-lg border border-outline-variant hover:border-primary hover:bg-primary-container/10 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(order.status)}
                              <p className="title-small text-on-surface">{order.id}</p>
                            </div>
                            <p className="body-small text-on-surface-variant">{order.createdDate}</p>
                          </div>
                          
                          <div>
                            <p className="body-small text-on-surface-variant">Receiving Store</p>
                            <p className="title-small text-on-surface">{order.receivingStore}</p>
                          </div>
                          
                          <div>
                            <p className="body-small text-on-surface-variant">Items Progress</p>
                            <p className="title-small text-on-surface">
                              {order.itemsWithRetailerIds} / {order.totalItems} items
                            </p>
                            <div className="w-full bg-surface-variant rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Badge variant={getStatusBadgeVariant(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                        </div>
                        
                        <ArrowLeftIcon size={20} className="text-on-surface-variant ml-4 rotate-180" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}