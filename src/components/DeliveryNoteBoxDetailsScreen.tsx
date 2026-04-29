import { useState } from 'react';
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
  XIcon,
  Trash2Icon
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
  onSaveAndClose: (boxId: string, items: OrderItem[], skipNavigation?: boolean) => void;
  receiverBrand?: string;
  receiverStoreCode?: string;
  senderWarehouse?: string;
  isAdmin?: boolean;
  onUnregisterBox?: (boxId: string) => void;
  onUpdateBoxLabel?: (boxId: string, newLabel: string) => void;
  onContinueToLabel?: (boxId: string) => void;
  allBoxes?: Box[]; // All boxes in the delivery to calculate unassigned items
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
  onUnregisterBox,
  onUpdateBoxLabel,
  onContinueToLabel,
  allBoxes = []
}: DeliveryNoteBoxDetailsScreenProps) {
  const [boxItems, setBoxItems] = useState<OrderItem[]>(box.items || []);
  const [scannedItemIds, setScannedItemIds] = useState<Set<string>>(
    new Set(box.items.map(item => item.id))
  );
  const [activeTab, setActiveTab] = useState<'scanned' | 'not-scanned'>('not-scanned');
  const [removedItemIds, setRemovedItemIds] = useState<Set<string>>(new Set());

  // Determine if box is editable (pending/Packing status only - other boxes cannot be edited)
  const isEditable = box.status === 'pending';
  const isPacking = box.status === 'pending';
  
  // Determine if box is registered/in-transit/delivered/rejected/cancelled (read-only)
  const isReadOnly = box.status === 'registered' || box.status === 'in-transit' || box.status === 'delivered' || box.status === 'rejected' || box.status === 'cancelled';

  // Get all items that are in any box (excluding this box)
  const itemsInOtherBoxes = new Set(
    allBoxes
      .filter(b => b.id !== box.id)
      .flatMap(b => b.items.map(item => item.id))
  );

  // Get all available items (not yet in any box, and not removed)
  // Items that are in this box are also available for scanning
  // Filter by status !== 'removed' to match DeliveryNoteDetailsScreen logic
  const availableOrderItems = orderItems.filter(item => item.status !== 'removed');
  
  // For calculating notScannedItems, we want items that are not in any box
  // Note: removedItemIds tracks items removed from THIS box, but they should still be available
  // for scanning (they're just not in the box anymore, so they're unassigned)
  const availableItemsForNotScanned = availableOrderItems.filter(item => 
    !itemsInOtherBoxes.has(item.id) && !boxItems.some(boxItem => boxItem.id === item.id)
  );
  
  // For scannedItems, filter by removedItemIds (items removed from this box should not appear)
  const scannedItems = boxItems.filter(item => scannedItemIds.has(item.id) && !removedItemIds.has(item.id));
  
  // Not scanned items = items not in any box (including this box) and not scanned
  // This should match the unassigned items count in DeliveryNoteDetailsScreen
  const notScannedItems = availableItemsForNotScanned.filter(item => 
    !scannedItemIds.has(item.id)
  );

  const handleScanItem = () => {
    // Simulate scanning - in real app this would use camera
    if (notScannedItems.length > 0) {
      const randomItem = notScannedItems[Math.floor(Math.random() * notScannedItems.length)];
      if (!boxItems.some(item => item.id === randomItem.id)) {
        setBoxItems(prev => [...prev, randomItem]);
        setScannedItemIds(prev => new Set([...prev, randomItem.id]));
        // Toast message removed - visual feedback already shown in scan area
      } else {
        toast.error('Item already in box');
      }
    } else {
      toast.error('No items available to scan');
    }
  };

  const handleManualEntry = (itemId: string) => {
    const item = availableItemsForNotScanned.find(i => 
      i.itemId === itemId || 
      i.partnerItemId === itemId || 
      i.retailerItemId === itemId
    );
    
    if (item) {
      if (!boxItems.some(boxItem => boxItem.id === item.id)) {
        setBoxItems(prev => [...prev, item]);
        setScannedItemIds(prev => new Set([...prev, item.id]));
        // Toast message removed - visual feedback already shown in scan area
      } else {
        toast.error('Item already in box');
      }
    } else {
      toast.error(`Item ${itemId} not found`);
    }
  };

  const handleMarkAsScanned = (item: OrderItem) => {
    // Check if item is in availableItemsForNotScanned (not in any box)
    if (availableItemsForNotScanned.some(i => i.id === item.id)) {
      // Item is not in any box, add it to this box
      if (!boxItems.some(boxItem => boxItem.id === item.id)) {
        setBoxItems(prev => [...prev, item]);
      }
      setScannedItemIds(prev => new Set([...prev, item.id]));
    } else {
      // Item might already be in a box, just mark as scanned
      setScannedItemIds(prev => new Set([...prev, item.id]));
    }
  };

  const handleMarkAsNotScanned = (item: OrderItem) => {
    setScannedItemIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(item.id);
      return newSet;
    });
  };

  const handleRemoveItem = (itemId: string) => {
    // Mark item as removed
    setRemovedItemIds(prev => new Set([...prev, itemId]));
    // Remove from box items
    setBoxItems(prev => prev.filter(item => item.id !== itemId));
    // Remove from scanned items
    setScannedItemIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
    toast.success('Item removed');
  };

  const handleRegisterBox = () => {
    if (boxItems.length === 0) {
      toast.error('Please add at least one item to the box');
      return;
    }
    onRegisterBox(box.id);
    toast.success('Box registered successfully');
  };

  const handleContinue = () => {
    if (boxItems.length === 0) {
      toast.error('Please add at least one item to the box');
      return;
    }
    // Save the box items first (update parent state)
    onSaveAndClose(box.id, boxItems, true);
    // Signal parent to open label sheet after closing this screen
    if (onContinueToLabel) {
      onContinueToLabel(box.id);
    }
    // Close this screen - parent will handle opening the label sheet
    onBack();
  };

  const handleSaveAndClose = () => {
    onSaveAndClose(box.id, boxItems);
    toast.success('Box saved');
    onBack();
  };



  return (
    <div className="min-h-screen bg-surface flex flex-col w-full max-w-full md:max-w-[600px] lg:max-w-[600px] mx-auto">
      <SharedHeader
        title="Box details"
        subtitle={isPacking ? undefined : box.qrLabel}
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
                  className={`flex-1 pb-3 pt-4 px-4 relative hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors min-h-[48px] md:min-h-0 ${
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
                  className={`flex-1 pb-3 pt-4 px-4 relative hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors min-h-[48px] md:min-h-0 ${
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
                              <div className="flex-1 min-w-0 pr-2">
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
                              <div className="relative flex-shrink-0">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" sideOffset={4}>
                                    <DropdownMenuItem onClick={() => handleMarkAsNotScanned(item)}>
                                      <XIcon className="mr-2 h-4 w-4" />
                                      Mark as Not Scanned
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleRemoveItem(item.id)}
                                      className="text-error focus:text-error"
                                    >
                                      <Trash2Icon className="mr-2 h-4 w-4" />
                                      Delete faulty item
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
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
                              <div className="flex-1 min-w-0 pr-2">
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
                              <div className="relative flex-shrink-0">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" sideOffset={4}>
                                    <DropdownMenuItem onClick={() => handleMarkAsScanned(item)}>
                                      <CheckIcon className="mr-2 h-4 w-4" />
                                      Mark as Scanned
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleRemoveItem(item.id)}
                                      className="text-error focus:text-error"
                                    >
                                      <Trash2Icon className="mr-2 h-4 w-4" />
                                      Delete faulty item
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
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
                            <div className="relative">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="relative">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" sideOffset={4}>
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

      {/* Sticky Bottom Actions - Only show for editable boxes */}
      {isEditable && (
        <div className="sticky bottom-0 bg-surface border-t border-outline-variant z-20 mt-auto">
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
                onClick={isPacking ? handleContinue : handleRegisterBox}
                disabled={boxItems.length === 0}
                className="flex-1 bg-primary text-on-primary"
                size="lg"
              >
                {!isPacking && <CheckIcon size={20} className="mr-2" />}
                <span className="label-large">{isPacking ? 'Continue' : 'Register Box'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Unregister button for admins on registered boxes */}
      {!isEditable && box.status === 'registered' && isAdmin && onUnregisterBox && (
        <div className="sticky bottom-0 bg-surface border-t border-outline-variant z-20 mt-auto">
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
