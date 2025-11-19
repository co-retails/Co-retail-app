import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { SharedHeader } from './ui/shared-header';
import { Section } from './ui/section';
import { EmptyState } from './ui/empty-state';
import { toast } from 'sonner@2.0.3';
import { 
  PackageIcon, 
  CheckIcon,
  MoreVertical,
  XIcon
} from 'lucide-react';
import { OrderItem } from './OrderCreationScreen';
import { Box } from './BoxManagementScreen';
import ActiveScanner from './ActiveScanner';
import { ItemCard, BaseItem } from './ItemCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface DeliveryNoteBoxDetailsScreenProps {
  box: Box;
  orderItems: OrderItem[];
  onBack: () => void;
  onRegisterBox: (boxId: string) => void;
  onSaveAndClose: (boxId: string, items: OrderItem[]) => void;
  receiverBrand?: string;
  receiverStoreCode?: string;
  senderWarehouse?: string;
  isAdmin?: boolean;
  onUnregisterBox?: (boxId: string) => void;
}

export default function DeliveryNoteBoxDetailsScreen({
  box,
  orderItems,
  onBack,
  onRegisterBox,
  onSaveAndClose,
  receiverBrand,
  receiverStoreCode,
  senderWarehouse,
  isAdmin = false,
  onUnregisterBox
}: DeliveryNoteBoxDetailsScreenProps) {
  const [boxItems, setBoxItems] = useState<OrderItem[]>(box.items || []);
  const [scannedItemIds, setScannedItemIds] = useState<Set<string>>(
    new Set(box.items.map(item => item.id))
  );
  const [activeTab, setActiveTab] = useState<'scanned' | 'not-scanned'>('not-scanned');

  // Determine if box is editable (pending/Packing status only - other boxes cannot be edited)
  const isEditable = box.status === 'pending';
  
  // Determine if box is registered/in-transit/delivered/rejected/cancelled (read-only)
  const isReadOnly = box.status === 'registered' || box.status === 'in-transit' || box.status === 'delivered' || box.status === 'rejected' || box.status === 'cancelled';

  // Get all available items (not yet in any box or in this box)
  const availableItems = orderItems.filter(item => 
    !scannedItemIds.has(item.id) || boxItems.some(boxItem => boxItem.id === item.id)
  );

  // Separate scanned and not scanned items
  const scannedItems = boxItems.filter(item => scannedItemIds.has(item.id));
  const notScannedItems = availableItems.filter(item => 
    !scannedItemIds.has(item.id) && !boxItems.some(boxItem => boxItem.id === item.id)
  );

  const handleScanItem = () => {
    // Simulate scanning - in real app this would use camera
    if (notScannedItems.length > 0) {
      const randomItem = notScannedItems[Math.floor(Math.random() * notScannedItems.length)];
      if (!boxItems.some(item => item.id === randomItem.id)) {
        setBoxItems(prev => [...prev, randomItem]);
        setScannedItemIds(prev => new Set([...prev, randomItem.id]));
        toast.success(`Item ${randomItem.itemId || randomItem.partnerItemId} scanned`);
      } else {
        toast.error('Item already in box');
      }
    } else {
      toast.error('No items available to scan');
    }
  };

  const handleManualEntry = (itemId: string) => {
    const item = availableItems.find(i => 
      i.itemId === itemId || 
      i.partnerItemId === itemId || 
      i.retailerItemId === itemId
    );
    
    if (item) {
      if (!boxItems.some(boxItem => boxItem.id === item.id)) {
        setBoxItems(prev => [...prev, item]);
        setScannedItemIds(prev => new Set([...prev, item.id]));
        toast.success(`Item ${itemId} added`);
      } else {
        toast.error('Item already in box');
      }
    } else {
      toast.error(`Item ${itemId} not found`);
    }
  };

  const handleMarkAsScanned = (item: OrderItem) => {
    if (!boxItems.some(boxItem => boxItem.id === item.id)) {
      setBoxItems(prev => [...prev, item]);
    }
    setScannedItemIds(prev => new Set([...prev, item.id]));
    toast.success(`Item marked as scanned`);
  };

  const handleMarkAsNotScanned = (item: OrderItem) => {
    setScannedItemIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(item.id);
      return newSet;
    });
    toast.success(`Item marked as not scanned`);
  };

  const handleRemoveItem = (itemId: string) => {
    setBoxItems(prev => prev.filter(item => item.id !== itemId));
    setScannedItemIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
    toast.success('Item removed from box');
  };

  const handleRegisterBox = () => {
    if (boxItems.length === 0) {
      toast.error('Please add at least one item to the box');
      return;
    }
    onRegisterBox(box.id);
    toast.success('Box registered successfully');
  };

  const handleSaveAndClose = () => {
    onSaveAndClose(box.id, boxItems);
    toast.success('Box saved');
    onBack();
  };

  const getStatusDisplay = () => {
    switch (box.status) {
      case 'pending':
        return 'Packing';
      case 'registered':
        return 'Registered';
      case 'in-transit':
        return 'In Transit';
      case 'delivered':
        return 'Delivered';
      case 'rejected':
        return 'Rejected';
      case 'cancelled':
        return 'Cancelled';
      default:
        return box.status;
    }
  };

  const getStatusColor = () => {
    switch (box.status) {
      case 'pending':
        return 'text-on-surface-variant';
      case 'registered':
        return 'text-success';
      case 'in-transit':
        return 'text-primary';
      case 'delivered':
        return 'text-success';
      case 'rejected':
        return 'text-error';
      case 'cancelled':
        return 'text-error';
      default:
        return 'text-on-surface-variant';
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <SharedHeader
        title="Box details"
        subtitle={box.qrLabel}
        onBack={onBack}
        showBackButton={true}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Fixed sections: Scanner, Tabs */}
        <div className="flex-shrink-0">
          {/* Editable Box View - Active Scanner */}
          {isEditable && (
            <div className="px-4 md:px-6 pt-4 pb-4 border-b border-outline-variant">
              <div className="flex-shrink-0 overflow-hidden" style={{ height: '280px', minHeight: '280px', maxHeight: '280px' }}>
                <ActiveScanner
                  onScan={handleScanItem}
                  onManualEntry={handleManualEntry}
                  isScanning={false}
                  showManualEntry={true}
                />
              </div>
            </div>
          )}

          {/* M3 Style Tab Bar - Only for editable boxes */}
          {isEditable && (
            <div className="bg-surface border-b border-outline-variant -mx-4 md:-mx-6 z-10 relative">
              <div className="flex">
                <button
                  className={`flex-1 pb-3 pt-4 px-4 relative hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors ${
                    activeTab === 'scanned' ? 'text-primary' : 'text-on-surface-variant'
                  }`}
                  onClick={() => setActiveTab('scanned')}
                >
                  <span className="title-small">
                    Scanned ({scannedItems.length})
                  </span>
                  {activeTab === 'scanned' && (
                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
                <button
                  className={`flex-1 pb-3 pt-4 px-4 relative hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors ${
                    activeTab === 'not-scanned' ? 'text-primary' : 'text-on-surface-variant'
                  }`}
                  onClick={() => setActiveTab('not-scanned')}
                >
                  <span className="title-small">
                    Not Scanned ({notScannedItems.length})
                  </span>
                  {activeTab === 'not-scanned' && (
                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-4 md:px-6 py-4 md:py-6">
            {/* Tab Content for editable boxes */}
            {isEditable && (
              <div className="space-y-2">
                {activeTab === 'scanned' && (
                  <>
                    {scannedItems.length > 0 ? (
                      scannedItems.map((item) => (
                        <Card key={item.id} className="border-outline-variant bg-surface-container">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <ItemCard
                                  item={{
                                    id: item.id,
                                    itemId: item.itemId || item.partnerItemId || '',
                                    brand: item.brand,
                                    category: item.category,
                                    size: item.size,
                                    color: item.color,
                                    price: item.price,
                                    status: item.status !== 'error' ? undefined : 'Invalid',
                                    retailerItemId: item.retailerItemId,
                                    partnerItemId: item.partnerItemId,
                                    gender: item.gender,
                                    subcategory: item.subcategory,
                                    source: item.source
                                  } as BaseItem}
                                  variant="items-list"
                                  showActions={false}
                                  showSelection={false}
                                />
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleMarkAsNotScanned(item)}>
                                    <XIcon className="mr-2 h-4 w-4" />
                                    Mark as not scanned
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="text-error focus:text-error"
                                  >
                                    <XIcon className="mr-2 h-4 w-4" />
                                    Remove from box
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <PackageIcon className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
                        <p className="body-medium text-on-surface-variant">No scanned items yet</p>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'not-scanned' && (
                  <>
                    {notScannedItems.length > 0 ? (
                      notScannedItems.map((item) => (
                        <Card key={item.id} className="border-outline-variant bg-surface-container">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <ItemCard
                                  item={{
                                    id: item.id,
                                    itemId: item.itemId || item.partnerItemId || '',
                                    brand: item.brand,
                                    category: item.category,
                                    size: item.size,
                                    color: item.color,
                                    price: item.price,
                                    status: item.status !== 'error' ? undefined : 'Invalid',
                                    retailerItemId: item.retailerItemId,
                                    partnerItemId: item.partnerItemId,
                                    gender: item.gender,
                                    subcategory: item.subcategory,
                                    source: item.source
                                  } as BaseItem}
                                  variant="items-list"
                                  showActions={false}
                                  showSelection={false}
                                />
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleMarkAsScanned(item)}>
                                    <CheckIcon className="mr-2 h-4 w-4" />
                                    Mark as scanned
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <PackageIcon className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
                        <p className="body-medium text-on-surface-variant">All items have been scanned</p>
                      </div>
                    )}
                  </>
                )}

                {/* Empty State for editable boxes */}
                {scannedItems.length === 0 && notScannedItems.length === 0 && (
                  <EmptyState
                    icon={<PackageIcon size={48} />}
                    title="No items available"
                    description="All items have been scanned or assigned to other boxes"
                  />
                )}
              </div>
            )}

            {/* Read-Only Box View - Just Item List */}
            {isReadOnly && (
              <Section title="Items">
                {boxItems.length > 0 ? (
                  <div className="space-y-2">
                    {boxItems.map((item) => (
                      <Card key={item.id} className="border-outline-variant bg-surface-container">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <ItemCard
                                item={{
                                  id: item.id,
                                  itemId: item.itemId || item.partnerItemId || '',
                                  brand: item.brand,
                                  category: item.category,
                                  size: item.size,
                                  color: item.color,
                                  price: item.price,
                                  status: item.status !== 'error' ? undefined : 'Invalid',
                                  retailerItemId: item.retailerItemId,
                                  partnerItemId: item.partnerItemId,
                                  gender: item.gender,
                                  subcategory: item.subcategory,
                                  source: item.source
                                } as BaseItem}
                                variant="items-list"
                                showActions={false}
                                showSelection={false}
                              />
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {scannedItemIds.has(item.id) ? (
                                  <DropdownMenuItem onClick={() => handleMarkAsNotScanned(item)}>
                                    <XIcon className="mr-2 h-4 w-4" />
                                    Mark as not scanned
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleMarkAsScanned(item)}>
                                    <CheckIcon className="mr-2 h-4 w-4" />
                                    Mark as scanned
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<PackageIcon size={48} />}
                    title="No items in box"
                    description="This box contains no items"
                  />
                )}
              </Section>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions - Only show for editable boxes */}
      {isEditable && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant z-20">
          <div className="px-4 md:px-6 py-4 pb-safe">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSaveAndClose}
                className="flex-1"
                size="lg"
              >
                <span className="label-large">Save & Close</span>
              </Button>
              <Button
                onClick={handleRegisterBox}
                disabled={boxItems.length === 0}
                className="flex-1 bg-primary text-on-primary"
                size="lg"
              >
                <CheckIcon size={20} className="mr-2" />
                <span className="label-large">Register Box</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Unregister button for admins on registered boxes */}
      {!isEditable && box.status === 'registered' && isAdmin && onUnregisterBox && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant z-20">
          <div className="px-4 md:px-6 py-4 pb-safe">
            <Button
              variant="outline"
              onClick={() => {
                onUnregisterBox(box.id);
                onBack();
              }}
              className="w-full"
              size="lg"
            >
              <span className="label-large">Unregister Box</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
