import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { SharedHeader } from './ui/shared-header';
import { Section } from './ui/section';
import { EmptyState } from './ui/empty-state';
import { Separator } from './ui/separator';
import { ItemDetailsTable, ItemDetailsTableItem } from './ItemDetailsTable';
import { toast } from 'sonner@2.0.3';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { 
  PackageIcon, 
  TruckIcon,
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  AlertTriangleIcon,
  RotateCcw,
  CheckIcon,
  PlusIcon,
  ScanIcon,
  QrCodeIcon,
  MoreVertical,
  Trash2Icon,
  RotateCcwIcon
} from 'lucide-react';
import { OrderItem } from './OrderCreationScreen';
import { PartnerOrder } from './PartnerDashboard';
import { DeliveryNote, Box } from './BoxManagementScreen';
import { ReturnDelivery } from './ShippingScreen';
import ActiveScanner from './ActiveScanner';

export type DetailType = 'order' | 'shipment' | 'return';

export interface DetailItem extends ItemDetailsTableItem {}

interface OrderShipmentDetailsScreenProps {
  type: DetailType;
  data: PartnerOrder | DeliveryNote | ReturnDelivery;
  onBack: () => void;
  storeName?: string;
  storeCode?: string;
  partnerName?: string;
  warehouseName?: string;
  receiverLabel?: string;
  onNavigateToRetailerIdScan?: () => void;
  onRegisterOrder?: () => void;
  onCreateDeliveryNote?: (orderId: string) => void;
  isAdmin?: boolean;
  onAddBox?: (deliveryNoteId: string, boxLabel: string) => void;
  onOpenBoxDetails?: (box: Box) => void;
  orderItems?: OrderItem[];
  onUnregisterBox?: (boxId: string) => void;
  onDeleteBox?: (boxId: string) => void;
}

// Valid price points for SEK (Swedish Krona) - Sellpy partner market
const PRICE_OPTIONS_SEK = [50, 75, 100, 120, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1200, 1500, 2000];

// Mock items for demonstration - in real app this would come from API
const generateMockItems = (count: number, type: DetailType, partnerName?: string, orderStatus?: string): DetailItem[] => {
  const brands = ['WEEKDAY', 'COS', 'Monki', 'H&M'];
  const categories = ['Clothing', 'Shoes', 'Accessories'];
  const subcategories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Sneakers', 'Boots', 'Bags', 'Scarves'];
  const colors = ['Black', 'White', 'Blue', 'Red', 'Gray', 'Green', 'Navy', 'Beige'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', '36', '37', '38', '39', '40'];

  // Determine if this is a Thrifted or Sellpy order
  const isThrifted = partnerName === 'Thrifted';
  const isSellpy = partnerName === 'Sellpy Operations' || partnerName === 'Sellpy';
  const isPending = orderStatus === 'pending';

  return Array.from({ length: count }, (_, index) => {
    // Use valid SEK price points instead of random prices
    const price = PRICE_OPTIONS_SEK[Math.floor(Math.random() * PRICE_OPTIONS_SEK.length)];
    const purchasePrice = parseFloat((price * (0.4 + Math.random() * 0.3)).toFixed(2)); // 40-70% of retail price
    
    // For Thrifted pending orders: all items must be valid (no errors)
    // For Sellpy pending orders: some items should have validation errors
    let itemStatus: 'valid' | 'error' = 'valid';
    let fieldErrors: Record<string, string> | undefined = undefined;
    let errors: string[] | undefined = undefined;
    let retailerItemId: string | undefined = undefined;

    if (type === 'order' && isPending) {
      if (isThrifted) {
        // Thrifted pending orders: all items valid, all have retailer IDs
        retailerItemId = `RID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        itemStatus = 'valid';
      } else if (isSellpy) {
        // Sellpy pending orders: ~30% of items have validation errors
        const hasError = index % 3 === 0; // Every 3rd item has an error
        if (hasError) {
          itemStatus = 'error';
          // Create realistic validation errors
          const errorTypes = [
            { field: 'brand', message: 'Brand is required' },
            { field: 'category', message: 'Category is required' },
            { field: 'size', message: 'Size is required' },
            { field: 'color', message: 'Color is required' },
            { field: 'price', message: 'Select valid price' }
          ];
          const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
          fieldErrors = { [errorType.field]: errorType.message };
          errors = [errorType.message];
        } else {
          // Some valid items may not have retailer IDs yet
          retailerItemId = Math.random() > 0.4 ? `RID-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined;
        }
      } else {
        // Other partners: default behavior
        retailerItemId = Math.random() > 0.3 ? `RID-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined;
      }
    } else {
      // Non-pending orders or other types: default behavior
      retailerItemId = type === 'order' && Math.random() > 0.3 ? `RID-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined;
      itemStatus = type === 'return' ? 'valid' : (Math.random() > 0.8 ? 'pending' : 'valid');
    }
    
    return {
      id: `item-${type}-${index + 1}`,
      itemId: type === 'return' ? `RET-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : '',
      brand: itemStatus === 'error' && fieldErrors?.brand ? '' : brands[Math.floor(Math.random() * brands.length)],
      gender: Math.random() > 0.5 ? 'Women' : 'Men',
      category: itemStatus === 'error' && fieldErrors?.category ? '' : categories[Math.floor(Math.random() * categories.length)],
      subcategory: subcategories[Math.floor(Math.random() * subcategories.length)],
      size: itemStatus === 'error' && fieldErrors?.size ? undefined : (Math.random() > 0.7 ? undefined : sizes[Math.floor(Math.random() * sizes.length)]),
      color: itemStatus === 'error' && fieldErrors?.color ? '' : colors[Math.floor(Math.random() * colors.length)],
      price: itemStatus === 'error' && fieldErrors?.price ? 0 : price,
      purchasePrice: purchasePrice,
      status: itemStatus,
      partnerItemId: `${brands[Math.floor(Math.random() * brands.length)].substring(0, 2)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      retailerItemId: retailerItemId,
      source: 'detail-mock' as const,
      fieldErrors: fieldErrors,
      errors: errors
    };
  });
};

export default function OrderShipmentDetailsScreen({
  type,
  data,
  onBack,
  storeName,
  storeCode,
  partnerName,
  warehouseName,
  receiverLabel,
  onNavigateToRetailerIdScan,
  onRegisterOrder,
  onCreateDeliveryNote,
  isAdmin = false,
  onAddBox,
  onOpenBoxDetails,
  orderItems = [],
  onUnregisterBox,
  onDeleteBox
}: OrderShipmentDetailsScreenProps) {
  // State for editable items
  const [editableItems, setEditableItems] = useState<DetailItem[]>([]);
  const [validationFilter, setValidationFilter] = useState<'all' | 'errors' | 'valid'>('all');
  const [showAddBoxDialog, setShowAddBoxDialog] = useState(false);
  const [boxLabel, setBoxLabel] = useState('');
  const [showBoxLabelScan, setShowBoxLabelScan] = useState(false);
  
  const getTitle = () => {
    switch (type) {
      case 'order':
        return 'Order details';
      case 'shipment':
        return 'Delivery details';
      case 'return':
        return `Return ${(data as ReturnDelivery).deliveryId}`;
      default:
        return 'Details';
    }
  };

  const getStatusColor = () => {
    if (type === 'order') {
      const order = data as PartnerOrder;
      switch (order.status) {
        case 'approval': return 'text-warning';
        case 'pending': return 'text-on-surface-variant';
        case 'registered': return 'text-tertiary';
        case 'in-transit': return 'text-primary';
        case 'delivered': return 'text-success';
        case 'in-review': return 'text-warning';
        default: return 'text-on-surface-variant';
      }
    } else if (type === 'shipment') {
      const shipment = data as DeliveryNote;
      switch (shipment.status) {
        case 'pending': return 'text-on-surface-variant';
        case 'registered': return 'text-primary';
        case 'delivered': return 'text-success';
        case 'rejected': return 'text-error';
        default: return 'text-on-surface-variant';
      }
    } else {
      const returnData = data as ReturnDelivery;
      switch (returnData.status) {
        case 'Pending pickup': return 'text-on-surface-variant';
        case 'In transit': return 'text-primary';
        case 'Returned': return 'text-success';
        default: return 'text-on-surface-variant';
      }
    }
  };

  const getStatusDisplay = () => {
    if (type === 'order') {
      const order = data as PartnerOrder;
      switch (order.status) {
        case 'approval': return 'Approval';
        case 'pending': return 'Pending';
        case 'registered': return 'Ready for Packaging';
        case 'in-transit': return 'In Transit';
        case 'delivered': return 'Delivered';
        case 'in-review': return 'In Review';
        default: return order.status;
      }
    } else if (type === 'shipment') {
      const shipment = data as DeliveryNote;
      switch (shipment.status) {
        case 'pending': return 'Pending Shipment';
        case 'registered': return 'In Transit';
        case 'delivered': return 'Delivered';
        case 'rejected': return 'Rejected';
        default: return shipment.status;
      }
    } else {
      const returnData = data as ReturnDelivery;
      return returnData.status;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'order':
        return <PackageIcon size={24} />;
      case 'shipment':
        return <TruckIcon size={24} />;
      case 'return':
        return <RotateCcw size={24} />;
      default:
        return <PackageIcon size={24} />;
    }
  };

  const getItemCount = () => {
    if (type === 'order') {
      return (data as PartnerOrder).itemCount;
    } else if (type === 'shipment') {
      // For shipments, we'll use the related order's item count or estimate from boxes
      return (data as DeliveryNote).boxes.length * 8; // Estimate 8 items per box
    } else {
      return (data as ReturnDelivery).items;
    }
  };

  const getDate = () => {
    if (type === 'order') {
      return (data as PartnerOrder).createdDate;
    } else if (type === 'shipment') {
      return (data as DeliveryNote).createdDate;
    } else {
      return (data as ReturnDelivery).date;
    }
  };

  // Generate mock items based on the expected count
  const orderStatus = type === 'order' ? (data as PartnerOrder).status : undefined;
  const baseItems = generateMockItems(getItemCount(), type, partnerName, orderStatus);
  const allItems = editableItems.length > 0 ? editableItems : baseItems;
  
  // Filter items based on validation status
  const items = allItems.filter(item => {
    if (validationFilter === 'errors') return item.status === 'error' || !item.retailerItemId || !item.price || item.price <= 0;
    if (validationFilter === 'valid') return item.status === 'valid' && item.retailerItemId && item.price && item.price > 0;
    return true;
  });
  
  // Count items by validation status
  const itemsWithErrors = allItems.filter(item => item.status === 'error' || !item.retailerItemId || !item.price || item.price <= 0).length;
  const validItems = allItems.filter(item => item.status === 'valid' && item.retailerItemId && item.price && item.price > 0).length;
  
  // Check if all items are valid for registration (must have retailer ID and price)
  const canRegister = type === 'order' && allItems.length > 0 && allItems.every(item => 
    item.retailerItemId && item.retailerItemId.trim() !== '' && 
    item.price && item.price > 0 && 
    item.status !== 'error'
  );
  
  // Initialize editable items on mount
  React.useEffect(() => {
    if (editableItems.length === 0) {
      setEditableItems(baseItems);
    }
  }, []);
  
  // Check if order is pending (editable)
  const isPendingOrder = type === 'order' && (data as PartnerOrder).status === 'pending';
  
  // Check if order is in approval status (only Admins can see)
  const isApprovalOrder = type === 'order' && (data as PartnerOrder).status === 'approval' && isAdmin;
  
  // Check if this is a Sellpy order (show prices)
  const isSellpyOrder = partnerName === 'Sellpy Operations' || partnerName === 'Sellpy';
  
  // Handler to update item attribute
  const handleUpdateItemAttribute = (itemId: string, field: keyof DetailItem, value: any) => {
    setEditableItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  // Box management handlers
  const handleBoxClick = (box: Box) => {
    if (onOpenBoxDetails) {
      onOpenBoxDetails(box);
    }
  };

  const handleBoxLabelScanned = (label: string) => {
    setBoxLabel(label);
    setShowBoxLabelScan(false);
  };

  const handleAddBox = () => {
    if (!boxLabel.trim()) {
      toast.error('Please enter a box label');
      return;
    }

    if (type === 'shipment' && onAddBox) {
      const shipment = data as DeliveryNote;
      onAddBox(shipment.id, boxLabel.trim());
      setBoxLabel('');
      setShowAddBoxDialog(false);
      toast.success(`Box ${boxLabel.trim()} added`);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <SharedHeader 
        title={getTitle()}
        onBack={onBack}
        showBackButton={true}
      />

      <div className="w-full px-4 md:px-6 py-4 md:py-6 pb-32 space-y-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 p-2 bg-surface-container-high rounded-lg">
                {getIcon()}
              </div>
              <div className="flex-1">
                <CardTitle className="title-medium text-on-surface">
                  {type === 'order' ? (data as PartnerOrder).id : type === 'shipment' ? (data as DeliveryNote).id : (data as ReturnDelivery).deliveryId}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="body-small text-on-surface-variant">{getDate()}</span>
                  <span className="text-on-surface-variant">•</span>
                  <span className={`body-small ${getStatusColor()}`}>
                    {getStatusDisplay()}
                  </span>
                </div>
              </div>
              <Badge 
                variant="secondary" 
                className="bg-primary-container text-on-primary-container"
              >
                {items.length} items
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Sender and Receiver side by side */}
            <div className="grid grid-cols-2 gap-4">
              {(warehouseName || partnerName) && (type === 'order' || type === 'shipment') && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <UserIcon size={16} />
                    <span className="body-small">Sender</span>
                  </div>
                  <p className="body-medium text-on-surface">{warehouseName || partnerName}</p>
                  {warehouseName && partnerName && (
                    <p className="body-small text-on-surface-variant">{partnerName}</p>
                  )}
                </div>
              )}

              {type === 'return' && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <UserIcon size={16} />
                    <span className="body-small">From Warehouse</span>
                  </div>
                  <p className="body-medium text-on-surface">
                    {warehouseName || partnerName || (data as ReturnDelivery).partnerName}
                  </p>
                </div>
              )}

              {(receiverLabel || storeName || storeCode) && (type === 'order' || type === 'shipment') && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <MapPinIcon size={16} />
                    <span className="body-small">Receiver</span>
                  </div>
                  <p className="body-medium text-on-surface">{receiverLabel || storeName}</p>
                  {storeName && receiverLabel && receiverLabel !== storeName && (
                    <p className="body-small text-on-surface-variant">{storeName}</p>
                  )}
                  {storeCode && (
                    <p className="body-small text-on-surface-variant">{storeCode}</p>
                  )}
                </div>
              )}

              {type === 'return' && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <MapPinIcon size={16} />
                    <span className="body-small">To Store</span>
                  </div>
                  <p className="body-medium text-on-surface">
                    {receiverLabel || (data as ReturnDelivery).storeName}
                  </p>
                  {(data as ReturnDelivery).storeName && receiverLabel && receiverLabel !== (data as ReturnDelivery).storeName && (
                    <p className="body-small text-on-surface-variant">{(data as ReturnDelivery).storeName}</p>
                  )}
                  {(data as ReturnDelivery).storeCode && (
                    <p className="body-small text-on-surface-variant">{(data as ReturnDelivery).storeCode}</p>
                  )}
                </div>
              )}
            </div>

            {type === 'shipment' && (
              <>
                <Separator className="my-4" />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <PackageIcon size={16} />
                      <span className="body-small">Boxes ({(data as DeliveryNote).boxes.length})</span>
                    </div>
                    {onAddBox && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddBoxDialog(true)}
                      >
                        <PlusIcon size={16} className="mr-2" />
                        <span className="label-medium">Add box</span>
                      </Button>
                    )}
                  </div>
                  {(data as DeliveryNote).boxes.length > 0 ? (
                    <div className="space-y-3">
                      {(data as DeliveryNote).boxes.map((box) => (
                        <Card 
                          key={box.id}
                          className="border-outline-variant hover:bg-surface-container-high transition-colors"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => handleBoxClick(box)}
                                className="flex-1 text-left"
                              >
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="body-small">
                                    {box.qrLabel} ({box.items.length} items)
                                  </Badge>
                                  {box.status === 'complete' && (
                                    <Badge variant="secondary" className="bg-success-container text-on-success-container">
                                      Registered
                                    </Badge>
                                  )}
                                  {box.status === 'pending' && (
                                    <Badge variant="outline" className="text-on-surface-variant">
                                      Pending
                                    </Badge>
                                  )}
                                </div>
                              </button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                  >
                                    <MoreVertical size={16} className="text-on-surface-variant" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {box.status === 'complete' && onUnregisterBox && (
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      onUnregisterBox(box.id);
                                    }}>
                                      <RotateCcwIcon className="mr-2 h-4 w-4" />
                                      Unregister
                                    </DropdownMenuItem>
                                  )}
                                  {(box.status === 'pending' || box.status === 'complete') && onDeleteBox && (
                                    <DropdownMenuItem 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteBox(box.id);
                                      }}
                                      className="text-error focus:text-error"
                                    >
                                      <Trash2Icon className="mr-2 h-4 w-4" />
                                      Delete
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
                    <p className="body-small text-on-surface-variant">No boxes added yet</p>
                  )}
                </div>
              </>
            )}

            {/* Order Summary - Pricing Info (for Sellpy orders) */}
            {isSellpyOrder && type === 'order' && (
              <>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 gap-3 md:gap-6">
                  <div>
                    <p className="label-small text-on-surface-variant mb-1">Total Retail Price</p>
                    <p className="title-medium text-on-surface">{items.reduce((sum, item) => sum + item.price, 0).toFixed(0)} SEK</p>
                  </div>
                  <div>
                    <p className="label-small text-on-surface-variant mb-1">Total Sales Margin</p>
                    <p className="title-medium text-primary">
                      {(() => {
                        const totalRetail = items.reduce((sum, item) => sum + item.price, 0);
                        const totalPurchase = items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
                        const margin = totalRetail > 0 ? ((totalRetail - totalPurchase) / totalRetail) * 100 : 0;
                        return `${margin.toFixed(1)}%`;
                      })()}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Items List - Only show for orders and returns, not for shipments (delivery notes) */}
        {type !== 'shipment' && (
          <Section title="Items">
            {/* Validation Filter - Show for pending orders */}
            {type === 'order' && (data as PartnerOrder).status === 'pending' && allItems.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                <Button
                  variant={validationFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setValidationFilter('all')}
                >
                  <span className="label-medium">All ({allItems.length})</span>
                </Button>
                {itemsWithErrors > 0 && (
                  <Button
                    variant={validationFilter === 'errors' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setValidationFilter('errors')}
                  >
                    <AlertTriangleIcon size={14} className="mr-1" />
                    <span className="label-medium">Missing/Errors ({itemsWithErrors})</span>
                  </Button>
                )}
                <Button
                  variant={validationFilter === 'valid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setValidationFilter('valid')}
                >
                  <CheckIcon size={14} className="mr-1" />
                  <span className="label-medium">Valid ({validItems})</span>
                </Button>
              </div>
            )}
            
            {items.length > 0 ? (
              <>
                <ItemDetailsTable
                  items={items}
                  showRetailerId={type !== 'shipment'} // Always show for orders
                  showPrice={type === 'order'} // Always show price for orders
                  showPurchasePrice={isApprovalOrder || (isSellpyOrder && isAdmin)} // Show purchase price for Approval orders or Sellpy orders for Admins
                  showStatus={type === 'return'}
                  isEditable={(isPendingOrder || isApprovalOrder) && isAdmin} // Allow editing for pending and approval orders (Admins only)
                  onUpdateItem={handleUpdateItemAttribute}
                />
              </>
            ) : allItems.length > 0 ? (
              <EmptyState
                icon={<AlertTriangleIcon />}
                title={`No ${validationFilter === 'errors' ? 'items with errors' : 'valid items'}`}
                description={`All items are ${validationFilter === 'errors' ? 'valid' : 'missing retailer IDs or have errors'}`}
              />
            ) : (
              <EmptyState
                icon={<AlertTriangleIcon />}
                title="No items found"
                description="This order contains no items to display"
              />
            )}
          </Section>
        )}

        {/* Action Buttons for Sellpy Orders - Fixed bottom bar */}
        {type === 'order' && (partnerName === 'Sellpy Operations' || partnerName === 'Sellpy') && (
          <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant z-20">
            <div className="px-4 md:px-6 py-4 pb-safe">
              {/* Pending status: Add retailer IDs - right aligned on desktop */}
              {(data as PartnerOrder).status === 'pending' && onNavigateToRetailerIdScan && (
                <div className="flex justify-start md:justify-end">
                  <Button 
                    onClick={onNavigateToRetailerIdScan}
                    size="lg"
                    className="w-full md:w-auto bg-primary text-on-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 disabled:bg-on-surface/12 disabled:text-on-surface/38 transition-colors px-6 py-3 rounded-lg min-h-[40px]"
                  >
                    <PackageIcon size={20} className="mr-2" />
                    <span className="label-large">Add retailer IDs</span>
                  </Button>
                </div>
              )}

              {/* Approval status: Approve order (Admin only) */}
              {isApprovalOrder && isAdmin && onRegisterOrder && (
                <div className="flex justify-start md:justify-end">
                  <Button 
                    onClick={() => {
                      // Approve order - change status from approval to pending
                      if (onRegisterOrder) {
                        onRegisterOrder();
                      }
                    }}
                    size="lg"
                    className="w-full md:w-auto bg-primary text-on-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 transition-colors px-6 py-3 rounded-lg min-h-[40px]"
                  >
                    <CheckIcon size={20} className="mr-2" />
                    <span className="label-large">Approve order</span>
                  </Button>
                </div>
              )}

              {/* Other action buttons - right aligned on desktop */}
              {(data as PartnerOrder).status !== 'pending' && (data as PartnerOrder).status !== 'approval' && (
                <>
                  {/* Completed status: Register order */}
                  {(data as PartnerOrder).status === 'completed' && onRegisterOrder && (
                    <div className="flex justify-start md:justify-end">
                      <Button 
                        onClick={onRegisterOrder}
                        size="lg"
                        className="w-full md:w-auto bg-primary text-on-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 disabled:bg-on-surface/12 disabled:text-on-surface/38 transition-colors px-6 py-3 rounded-lg min-h-[40px]"
                      >
                        <CheckIcon size={20} className="mr-2" />
                        <span className="label-large">Register order</span>
                      </Button>
                    </div>
                  )}

                  {/* Registered status: Create delivery note */}
                  {(data as PartnerOrder).status === 'registered' && onCreateDeliveryNote && (
                    <div className="flex justify-start md:justify-end">
                      <Button 
                        onClick={() => onCreateDeliveryNote((data as PartnerOrder).id)}
                        size="lg"
                        className="w-full md:w-auto bg-primary text-on-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 disabled:bg-on-surface/12 disabled:text-on-surface/38 transition-colors px-6 py-3 rounded-lg min-h-[40px]"
                      >
                        <PackageIcon size={20} className="mr-2" />
                        <span className="label-large">Create delivery note</span>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons for Thrifted and other manual partners - Fixed bottom bar */}
        {type === 'order' && partnerName === 'Thrifted' && (
          <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant z-20">
            <div className="px-4 md:px-6 py-4 pb-safe">
              <div className="flex justify-start md:justify-end gap-3">
                {/* Pending status: Register order */}
                {(data as PartnerOrder).status === 'pending' && onRegisterOrder && (
                  <Button 
                    onClick={onRegisterOrder}
                    disabled={!canRegister}
                    size="lg"
                    className="w-full md:w-auto bg-primary text-on-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 disabled:bg-on-surface/12 disabled:text-on-surface/38 transition-colors px-6 py-3 rounded-lg min-h-[40px]"
                  >
                    <CheckIcon size={20} className="mr-2" />
                    <span className="label-large">Register order</span>
                  </Button>
                )}

                {/* Registered status: Create delivery note */}
                {(data as PartnerOrder).status === 'registered' && onCreateDeliveryNote && (
                  <Button 
                    onClick={() => onCreateDeliveryNote((data as PartnerOrder).id)}
                    size="lg"
                    className="w-full md:w-auto bg-primary text-on-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 disabled:bg-on-surface/12 disabled:text-on-surface/38 transition-colors px-6 py-3 rounded-lg min-h-[40px]"
                  >
                    <PackageIcon size={20} className="mr-2" />
                    <span className="label-large">Create delivery note</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Box Dialog */}
      {type === 'shipment' && (
        <Dialog open={showAddBoxDialog} onOpenChange={setShowAddBoxDialog}>
          <DialogContent className="bg-surface border border-outline-variant max-w-md">
            <DialogHeader>
              <DialogTitle className="title-large">Add Box</DialogTitle>
              <DialogDescription className="body-medium">
                Enter a label for the new box or scan the box label
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {showBoxLabelScan ? (
                <div className="space-y-3">
                  <ActiveScanner
                    onScan={() => {
                      // Simulate scanning - in real app this would use camera
                      const mockLabel = `BOX-${Date.now().toString().slice(-6)}`;
                      handleBoxLabelScanned(mockLabel);
                    }}
                    onManualEntry={handleBoxLabelScanned}
                    isScanning={false}
                    showManualEntry={true}
                    onClose={() => setShowBoxLabelScan(false)}
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="boxLabel">Box Label</Label>
                    <Input
                      id="boxLabel"
                      value={boxLabel}
                      onChange={(e) => setBoxLabel(e.target.value)}
                      placeholder="e.g., BOX-001"
                      className="bg-surface-container-high"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddBox();
                        }
                      }}
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowBoxLabelScan(true)}
                    className="w-full"
                  >
                    <ScanIcon size={16} className="mr-2" />
                    <span className="label-medium">Scan Box Label</span>
                  </Button>
                </>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddBoxDialog(false);
                  setBoxLabel('');
                  setShowBoxLabelScan(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddBox}
                disabled={!boxLabel.trim()}
                className="bg-primary text-on-primary"
              >
                Add Box
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}