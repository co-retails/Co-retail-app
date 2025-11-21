import React, { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  CheckIcon, 
  AlertTriangleIcon,
  TrashIcon,
  QrCodeIcon,
  StoreIcon,
  EditIcon
} from 'lucide-react';
import { Store, Brand, Country, StoreSelection } from './StoreSelector';
import { Partner, Warehouse } from './PartnerWarehouseSelector';
import { ItemCard, BaseItem } from './ItemCard';
import StoreSelector from './StoreSelector';

export interface OrderItem {
  id: string;
  itemId: string;
  brand: string;
  gender: string;
  category: string;
  subcategory: string;
  size: string;
  color: string;
  price: number;
  purchasePrice?: number;
  status: 'error';
  errors?: string[];
  partnerItemId?: string; // For API integration orders
  retailerItemId?: string; // For connected retailer items
  source: 'manual' | 'excel' | 'api-integration'; // Track source of item
}

// Existing order item for Sellpy (API integration scenario)
export interface ExistingOrderItem extends OrderItem {
  needsRetailerItemId: boolean; // Flag for items that need retailer item ID
}

interface OrderCreationScreenProps {
  onBack: () => void;
  onCreateOrder: (items: OrderItem[]) => void;
  onRegisterOrder: (orderId: string) => void;
  // Additional props for the new structure
  currentPartner?: Partner;
  currentReceivingStore?: Store;
  existingItems?: ExistingOrderItem[]; // For Sellpy scenario
  // Store selection props
  brands?: Brand[];
  countries?: Country[];
  stores?: Store[];
  currentStoreSelection?: StoreSelection;
  onStoreSelectionChange?: (selection: StoreSelection) => void;
  // Order status for edit restrictions
  orderStatus?: 'pending' | 'in-transit' | 'delivered' | 'registered';
}

export default function OrderCreationScreen({
  onBack,
  onCreateOrder,
  onRegisterOrder,
  currentPartner,
  currentReceivingStore,
  existingItems = [],
  brands = [],
  countries = [],
  stores = [],
  currentStoreSelection,
  onStoreSelectionChange,
  orderStatus = 'pending'
}: OrderCreationScreenProps) {
  // Check if current partner is API integrated (Sellpy for demo)
  const isApiIntegratedPartner = currentPartner?.name === 'Sellpy Operations';
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>(
    isApiIntegratedPartner ? existingItems : []
  );
  const [currentItem, setCurrentItem] = useState<Partial<OrderItem>>({});
  const [orderId, setOrderId] = useState<string | null>(null);
  const [scanningItemId, setScanningItemId] = useState<string | null>(null);
  const [isStoreSelectionOpen, setIsStoreSelectionOpen] = useState(false);

  // Determine if receiving store can be edited based on partner type and order status
  const canEditReceivingStore = () => {
    if (isApiIntegratedPartner) {
      // Sellpy orders: can only edit when status is pending
      return orderStatus === 'pending';
    } else {
      // Manual orders: cannot edit once in-transit
      return orderStatus !== 'in-transit' && orderStatus !== 'delivered';
    }
  };

  // Mock data for dropdowns
  const itemBrands = ['H&M', 'WEEKDAY', 'COS', 'Monki'];
  const genders = ['Men', 'Women', 'Kids', 'Unisex'];
  const categories = ['Clothing', 'Shoes', 'Accessories'];
  const subcategories = {
    'Clothing': ['Tops', 'Bottoms', 'Dresses', 'Outerwear'],
    'Shoes': ['Sneakers', 'Boots', 'Sandals', 'Formal'],
    'Accessories': ['Bags', 'Jewelry', 'Belts', 'Hats']
  };
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
  const colors = ['Black', 'White', 'Gray', 'Navy', 'Blue', 'Red', 'Pink', 'Green', 'Yellow', 'Brown', 'Beige', 'Purple', 'Orange', 'Silver', 'Gold'];

  const validateItem = (item: Partial<OrderItem>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Trim whitespace for string validations
    const itemId = item.itemId?.trim();
    const brand = item.brand?.trim();
    const gender = item.gender?.trim();
    const category = item.category?.trim();
    const subcategory = item.subcategory?.trim();
    const size = item.size?.trim();
    const color = item.color?.trim();
    
    if (!itemId) errors.push('Item ID is required');
    if (!brand) errors.push('Item brand is required');
    if (!gender) errors.push('Gender is required');
    if (!category) errors.push('Category is required');
    if (!subcategory) errors.push('Subcategory is required');
    if (!size) errors.push('Size is required');
    if (!color) errors.push('Color is required');
    if (!item.price || item.price <= 0) errors.push('Price must be greater than 0');
    
    // Additional validation rules
    if (itemId && itemId.length < 3) errors.push('Item ID must be at least 3 characters');
    if (item.price && item.price > 99999) errors.push('Price cannot exceed $99,999');
    
    return { valid: errors.length === 0, errors };
  };

  const handleAddItem = (source: 'manual' | 'api-integration' = 'manual') => {
    const validation = validateItem(currentItem);
    
    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      itemId: currentItem.itemId || '',
      brand: currentItem.brand || '',
      gender: currentItem.gender || '',
      category: currentItem.category || '',
      subcategory: currentItem.subcategory || '',
      size: currentItem.size || '',
      color: currentItem.color || '',
      price: currentItem.price || 0,
      status: validation.valid ? undefined : 'error',
      errors: validation.errors,
      source: source,
      partnerItemId: currentItem.partnerItemId,
      retailerItemId: currentItem.retailerItemId
    };

    setOrderItems(prev => [...prev, newItem]);
    setCurrentItem({});
  };

  const handleRemoveItem = (itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleCreateOrder = () => {
    if (orderItems.length === 0) {
      toast.error('Please add at least one item to create an order.');
      return;
    }
    
    // Validate all items before creating order
    const validationErrors: string[] = [];
    const invalidItems: { index: number; itemId: string; errors: string[] }[] = [];
    
    orderItems.forEach((item, index) => {
      const validation = validateItem(item);
      if (!validation.valid) {
        invalidItems.push({
          index: index + 1,
          itemId: item.itemId || 'No ID',
          errors: validation.errors
        });
      }
    });
    
    if (invalidItems.length > 0) {
      const errorMessage = `Cannot create order. Please fix the following validation errors:\n\n${
        invalidItems.map(item => 
          `Item ${item.index} (${item.itemId}):\n${item.errors.map(error => `  • ${error}`).join('\n')}`
        ).join('\n\n')
      }`;
      
      toast.error(errorMessage, { duration: 10000 });
      return;
    }
    
    // Skip manual review and create order directly
    const newOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    setOrderId(newOrderId);
    onCreateOrder(orderItems);
  };

  const handleRegisterOrder = () => {
    if (orderId) {
      onRegisterOrder(orderId);
    }
  };





  const handleAddRetailerItemId = (itemId: string, retailerItemId: string) => {
    setOrderItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, retailerItemId, status: undefined }
        : item
    ));
    setScanningItemId(null);
  };

  const handleScanRetailerItemId = (itemId: string) => {
    setScanningItemId(itemId);
    
    // Mock scanning retailer QR code
    setTimeout(() => {
      const mockRetailerItemId = `RID-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      handleAddRetailerItemId(itemId, mockRetailerItemId);
    }, 1500);
  };

  const handleCancelScanning = () => {
    setScanningItemId(null);
  };

  const validItems = orderItems.filter(item => item.status !== 'error');
  const errorItems = orderItems.filter(item => item.status === 'error');

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header with Receiving Store */}
      <div className="bg-surface-container border-b border-outline-variant">
        <div className="px-4 md:px-6 py-3">
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
                <h1 className="headline-small text-on-surface">
                  {isApiIntegratedPartner 
                    ? 'Add Item IDs' 
                    : orderId 
                      ? 'Register Order' 
                      : 'Create New Order'
                  }
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <StoreIcon size={16} className="text-on-surface-variant" />
                  <p className="body-medium text-on-surface-variant">
                    Receiving Store: {currentReceivingStore?.name || 'No store selected'}
                    {!canEditReceivingStore() && (
                      <span className="text-on-surface-variant/60 ml-2">
                        (Cannot edit - Order {orderStatus})
                      </span>
                    )}
                  </p>
                  {canEditReceivingStore() && currentStoreSelection && onStoreSelectionChange && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-1 text-on-surface-variant hover:text-primary"
                      onClick={() => setIsStoreSelectionOpen(true)}
                    >
                      <EditIcon size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {orderId && (
              <Badge variant="secondary">
                Order Created
              </Badge>
            )}
            
            {isApiIntegratedPartner && (
              <Badge variant="outline">
                API Integration
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 md:px-6 py-4 md:py-6 space-y-6 pb-20 md:pb-4">
        


        {!orderId ? (
          <>
            {/* Add Item ID Section (For API Integrated Partners like Sellpy) */}
            {isApiIntegratedPartner && (
              <Card>
                <CardHeader>
                  <CardTitle className="title-medium">Add Item ID to Existing Items</CardTitle>
                  <p className="body-medium text-on-surface-variant">
                    Items from API integration need item IDs to complete the connection
                  </p>
                </CardHeader>
                <CardContent>
                  {orderItems.length === 0 ? (
                    <div className="text-center py-8">
                      <QrCodeIcon size={48} className="mx-auto text-on-surface-variant/50 mb-4" />
                      <p className="title-medium text-on-surface mb-2">No Items Available</p>
                      <p className="body-medium text-on-surface-variant">
                        No items from API integration found. Items are typically created automatically via the integration system.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orderItems.map((item) => (
                        <div
                          key={item.id}
                          className={`p-4 rounded-lg border ${
                            item.retailerItemId 
                              ? 'border-success bg-success-container/10' 
                              : 'border-outline-variant'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                              <div>
                                <p className="body-small text-on-surface-variant">External ID</p>
                                <p className="title-small text-on-surface">{item.partnerItemId || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="body-small text-on-surface-variant">Brand • Category</p>
                                <p className="title-small text-on-surface">{item.brand} • {item.category}</p>
                              </div>
                              <div>
                                <p className="body-small text-on-surface-variant">Size • Color</p>
                                <p className="title-small text-on-surface">{item.size} • {item.color}</p>
                              </div>
                              <div>
                                <p className="body-small text-on-surface-variant">Item ID</p>
                                {item.retailerItemId ? (
                                  <div className="flex items-center gap-2">
                                    <CheckIcon size={16} className="text-success" />
                                    <p className="title-small text-on-surface">{item.retailerItemId}</p>
                                  </div>
                                ) : (
                                  <p className="title-small text-on-surface-variant">Not assigned</p>
                                )}
                              </div>
                            </div>
                            
                            {!item.retailerItemId && (
                              <Button
                                onClick={() => handleScanRetailerItemId(item.id)}
                                disabled={scanningItemId === item.id}
                                size="sm"
                              >
                                {scanningItemId === item.id ? (
                                  <>
                                    <div className="animate-spin mr-2">
                                      <QrCodeIcon size={16} />
                                    </div>
                                    Scanning...
                                  </>
                                ) : (
                                  <>
                                    <QrCodeIcon size={16} className="mr-2" />
                                    Add Item ID
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Excel-like Item Entry Table */}
            {!isApiIntegratedPartner && (
              <Card>
                <CardHeader>
                  <CardTitle className="title-medium flex items-center justify-between">
                    Order Items ({orderItems.length})
                    <div className="flex gap-2">
                      {validItems.length > 0 && (
                        <Badge variant="secondary">
                          {validItems.length} Valid
                        </Badge>
                      )}
                      {errorItems.length > 0 && (
                        <Badge variant="destructive">
                          {errorItems.length} Errors
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Desktop/Tablet Table Layout */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant">
                          <th className="text-left p-3 bg-surface-container title-small text-on-surface min-w-[120px]">
                            Item ID *
                          </th>
                          <th className="text-left p-3 bg-surface-container title-small text-on-surface min-w-[120px]">
                            Brand *
                          </th>
                          <th className="text-left p-3 bg-surface-container title-small text-on-surface min-w-[100px]">
                            Gender *
                          </th>
                          <th className="text-left p-3 bg-surface-container title-small text-on-surface min-w-[120px]">
                            Category *
                          </th>
                          <th className="text-left p-3 bg-surface-container title-small text-on-surface min-w-[140px]">
                            Subcategory *
                          </th>
                          <th className="text-left p-3 bg-surface-container title-small text-on-surface min-w-[80px]">
                            Size *
                          </th>
                          <th className="text-left p-3 bg-surface-container title-small text-on-surface min-w-[100px]">
                            Color *
                          </th>
                          <th className="text-left p-3 bg-surface-container title-small text-on-surface min-w-[100px]">
                            Price *
                          </th>
                          <th className="text-left p-3 bg-surface-container title-small text-on-surface min-w-[80px]">
                            Status
                          </th>
                          <th className="text-left p-3 bg-surface-container title-small text-on-surface w-[100px]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* New Item Entry Row */}
                        <tr className="border-b border-outline-variant bg-surface-container-high">
                          <td className="p-2">
                            <Input
                              value={currentItem.itemId || ''}
                              onChange={(e) => setCurrentItem(prev => ({ ...prev, itemId: e.target.value }))}
                              placeholder="Enter item ID"
                              className="h-12 md:h-10 body-medium border-0 bg-transparent focus:ring-2 focus:ring-primary min-h-[48px] md:min-h-0"
                            />
                          </td>
                          <td className="p-2">
                            <Select
                              value={currentItem.brand || ''}
                              onValueChange={(value) => setCurrentItem(prev => ({ ...prev, brand: value }))}
                            >
                              <SelectTrigger className="h-12 md:h-10 body-medium border-0 bg-transparent focus:ring-2 focus:ring-primary min-h-[48px] md:min-h-0">
                                <SelectValue placeholder="Brand" />
                              </SelectTrigger>
                              <SelectContent>
                                {itemBrands.map((brand) => (
                                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Select
                              value={currentItem.gender || ''}
                              onValueChange={(value) => setCurrentItem(prev => ({ ...prev, gender: value }))}
                            >
                              <SelectTrigger className="h-12 md:h-10 body-medium border-0 bg-transparent focus:ring-2 focus:ring-primary min-h-[48px] md:min-h-0">
                                <SelectValue placeholder="Gender" />
                              </SelectTrigger>
                              <SelectContent>
                                {genders.map((gender) => (
                                  <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Select
                              value={currentItem.category || ''}
                              onValueChange={(value) => setCurrentItem(prev => ({ ...prev, category: value, subcategory: '' }))}
                            >
                              <SelectTrigger className="h-12 md:h-10 body-medium border-0 bg-transparent focus:ring-2 focus:ring-primary min-h-[48px] md:min-h-0">
                                <SelectValue placeholder="Category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>{category}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Select
                              value={currentItem.subcategory || ''}
                              onValueChange={(value) => setCurrentItem(prev => ({ ...prev, subcategory: value }))}
                              disabled={!currentItem.category}
                            >
                              <SelectTrigger className="h-12 md:h-10 body-medium border-0 bg-transparent focus:ring-2 focus:ring-primary min-h-[48px] md:min-h-0">
                                <SelectValue placeholder="Subcategory" />
                              </SelectTrigger>
                              <SelectContent>
                                {currentItem.category && subcategories[currentItem.category as keyof typeof subcategories]?.map((sub) => (
                                  <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Select
                              value={currentItem.size || ''}
                              onValueChange={(value) => setCurrentItem(prev => ({ ...prev, size: value }))}
                            >
                              <SelectTrigger className="h-12 md:h-10 body-medium border-0 bg-transparent focus:ring-2 focus:ring-primary min-h-[48px] md:min-h-0">
                                <SelectValue placeholder="Size" />
                              </SelectTrigger>
                              <SelectContent>
                                {sizes.map((size) => (
                                  <SelectItem key={size} value={size}>{size}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Select
                              value={currentItem.color || ''}
                              onValueChange={(value) => setCurrentItem(prev => ({ ...prev, color: value }))}
                            >
                              <SelectTrigger className="h-12 md:h-10 body-medium border-0 bg-transparent focus:ring-2 focus:ring-primary min-h-[48px] md:min-h-0">
                                <SelectValue placeholder="Color" />
                              </SelectTrigger>
                              <SelectContent>
                                {colors.map((color) => (
                                  <SelectItem key={color} value={color}>{color}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={currentItem.price || ''}
                              onChange={(e) => setCurrentItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                              placeholder="0.00"
                              className="h-12 md:h-10 body-medium border-0 bg-transparent focus:ring-2 focus:ring-primary min-h-[48px] md:min-h-0"
                            />
                          </td>
                          <td className="p-2">
                            <Badge variant="outline" className="pointer-events-none">
                              New
                            </Badge>
                          </td>
                          <td className="p-2">
                            <Button
                              onClick={() => handleAddItem('manual')}
                              size="sm"
                              className="h-12 md:h-10 w-full min-h-[48px] md:min-h-0"
                            >
                              <PlusIcon size={16} />
                            </Button>
                          </td>
                        </tr>

                        {/* Existing Items */}
                        {orderItems.map((item) => (
                          <tr key={item.id} className={`border-b border-outline-variant ${
                            item.status === 'error' ? 'bg-error-container/10' : 'bg-surface'
                          }`}>
                            <td className="p-3 body-medium text-on-surface">
                              {item.itemId}
                            </td>
                            <td className="p-3 body-medium text-on-surface">
                              {item.brand}
                            </td>
                            <td className="p-3 body-medium text-on-surface">
                              {item.gender}
                            </td>
                            <td className="p-3 body-medium text-on-surface">
                              {item.category}
                            </td>
                            <td className="p-3 body-medium text-on-surface">
                              {item.subcategory}
                            </td>
                            <td className="p-3 body-medium text-on-surface">
                              {item.size}
                            </td>
                            <td className="p-3 body-medium text-on-surface">
                              {item.color}
                            </td>
                            <td className="p-3 body-medium text-on-surface">
                              ${item.price.toFixed(2)}
                            </td>
                            <td className="p-3">
                              {item.status !== 'error' ? (
                                <Badge variant="secondary">
                                  <CheckIcon size={14} className="mr-1" />
                                  Valid
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <AlertTriangleIcon size={14} className="mr-1" />
                                  Error
                                </Badge>
                              )}
                            </td>
                            <td className="p-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-on-surface-variant hover:text-error"
                              >
                                <TrashIcon size={16} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Vertical Layout */}
                  <div className="md:hidden space-y-4">
                    {/* New Item Entry Card */}
                    <div className="bg-surface-container-high border border-outline-variant rounded-[12px] p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="title-medium text-on-surface">Add New Item</h3>
                        <Badge variant="outline" className="pointer-events-none">
                          New
                        </Badge>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label className="title-small text-on-surface mb-2 block">Item ID *</Label>
                          <Input
                            value={currentItem.itemId || ''}
                            onChange={(e) => setCurrentItem(prev => ({ ...prev, itemId: e.target.value }))}
                            placeholder="Enter item ID"
                            className="h-12 body-medium bg-surface-container border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <Label className="title-small text-on-surface mb-2 block">Brand *</Label>
                          <Select
                            value={currentItem.brand || ''}
                            onValueChange={(value) => setCurrentItem(prev => ({ ...prev, brand: value }))}
                          >
                            <SelectTrigger className="h-12 body-medium bg-surface-container border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary min-h-[48px]">
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                            <SelectContent>
                              {itemBrands.map((brand) => (
                                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="title-small text-on-surface mb-2 block">Gender *</Label>
                          <Select
                            value={currentItem.gender || ''}
                            onValueChange={(value) => setCurrentItem(prev => ({ ...prev, gender: value }))}
                          >
                            <SelectTrigger className="h-12 body-medium bg-surface-container border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary min-h-[48px]">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              {genders.map((gender) => (
                                <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="title-small text-on-surface mb-2 block">Category *</Label>
                          <Select
                            value={currentItem.category || ''}
                            onValueChange={(value) => setCurrentItem(prev => ({ ...prev, category: value, subcategory: '' }))}
                          >
                            <SelectTrigger className="h-12 body-medium bg-surface-container border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary min-h-[48px]">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="title-small text-on-surface mb-2 block">Subcategory *</Label>
                          <Select
                            value={currentItem.subcategory || ''}
                            onValueChange={(value) => setCurrentItem(prev => ({ ...prev, subcategory: value }))}
                            disabled={!currentItem.category}
                          >
                            <SelectTrigger className="h-12 body-medium bg-surface-container border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50">
                              <SelectValue placeholder="Select subcategory" />
                            </SelectTrigger>
                            <SelectContent>
                              {currentItem.category && subcategories[currentItem.category as keyof typeof subcategories]?.map((sub) => (
                                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="title-small text-on-surface mb-2 block">Size *</Label>
                            <Select
                              value={currentItem.size || ''}
                              onValueChange={(value) => setCurrentItem(prev => ({ ...prev, size: value }))}
                            >
                              <SelectTrigger className="h-12 body-medium bg-surface-container border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary min-h-[48px]">
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent>
                                {sizes.map((size) => (
                                  <SelectItem key={size} value={size}>{size}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="title-small text-on-surface mb-2 block">Color *</Label>
                            <Select
                              value={currentItem.color || ''}
                              onValueChange={(value) => setCurrentItem(prev => ({ ...prev, color: value }))}
                            >
                              <SelectTrigger className="h-12 body-medium bg-surface-container border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary min-h-[48px]">
                                <SelectValue placeholder="Select color" />
                              </SelectTrigger>
                              <SelectContent>
                                {colors.map((color) => (
                                  <SelectItem key={color} value={color}>{color}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label className="title-small text-on-surface mb-2 block">Price *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={currentItem.price || ''}
                            onChange={(e) => setCurrentItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                            placeholder="0.00"
                            className="h-12 body-medium bg-surface-container border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <Button
                          onClick={() => handleAddItem('manual')}
                          className="w-full h-12 bg-primary hover:bg-primary/90 text-on-primary"
                        >
                          <PlusIcon size={16} className="mr-2" />
                          Add Item
                        </Button>
                      </div>
                    </div>

                    {/* Existing Items Cards */}
                    {orderItems.map((item) => (
                      <div key={item.id} className={`border border-outline-variant rounded-[12px] p-4 ${
                        item.status === 'error' ? 'bg-error-container/10' : 'bg-surface'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <h3 className="title-medium text-on-surface">{item.itemId}</h3>
                            {item.status !== 'error' ? (
                              <Badge variant="secondary">
                                <CheckIcon size={14} className="mr-1" />
                                Complete
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <AlertTriangleIcon size={14} className="mr-1" />
                                Error
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-on-surface-variant hover:text-error"
                          >
                            <TrashIcon size={16} />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 body-medium text-on-surface">
                          <div>
                            <div className="text-on-surface-variant body-small mb-1">Brand</div>
                            <div>{item.brand}</div>
                          </div>
                          <div>
                            <div className="text-on-surface-variant body-small mb-1">Gender</div>
                            <div>{item.gender}</div>
                          </div>
                          <div>
                            <div className="text-on-surface-variant body-small mb-1">Category</div>
                            <div>{item.category}</div>
                          </div>
                          <div>
                            <div className="text-on-surface-variant body-small mb-1">Subcategory</div>
                            <div>{item.subcategory}</div>
                          </div>
                          <div>
                            <div className="text-on-surface-variant body-small mb-1">Size</div>
                            <div>{item.size}</div>
                          </div>
                          <div>
                            <div className="text-on-surface-variant body-small mb-1">Color</div>
                            <div>{item.color}</div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-on-surface-variant body-small mb-1">Price</div>
                            <div className="title-medium">${item.price.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Error details */}
                  {errorItems.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="title-small text-error">Items with errors:</p>
                      {errorItems.map((item) => (
                        <Alert key={`error-${item.id}`} className="bg-error-container/10">
                          <AlertTriangleIcon size={16} />
                          <AlertDescription>
                            <strong>{item.itemId}</strong>: {item.errors?.join(', ')}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          /* Order Created - Registration Step */
          <Card>
            <CardHeader>
              <CardTitle className="title-medium flex items-center gap-2">
                <CheckIcon size={20} className="text-success" />
                Order Created Successfully
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="body-small text-on-surface-variant">Order ID</p>
                  <p className="title-medium text-on-surface">{orderId}</p>
                </div>
                <div>
                  <p className="body-small text-on-surface-variant">Total Items</p>
                  <p className="title-medium text-on-surface">{validItems.length}</p>
                </div>
                <div>
                  <p className="body-small text-on-surface-variant">Status</p>
                  <Badge variant="secondary">Pending Registration</Badge>
                </div>
              </div>
              
              <Alert>
                <AlertDescription>
                  Your order has been created with {validItems.length} items. 
                  Register the order to validate all items and proceed to box creation.
                </AlertDescription>
              </Alert>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleRegisterOrder} className="flex-1">
                  Register Order
                </Button>
                <Button variant="outline" onClick={() => setOrderId(null)}>
                  Add More Items
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sticky Register Button - Show only when not in order created state and has valid items */}
      {!orderId && validItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface-container border-t border-outline-variant p-4 md:relative md:bg-transparent md:border-0 md:p-0 md:mt-6">
          <div className="max-w-screen-xl mx-auto">
            <Button 
              onClick={handleCreateOrder} 
              className="w-full md:max-w-md md:mx-auto md:flex"
              size="lg"
            >
              Register order ({validItems.length} items)
            </Button>
          </div>
        </div>
      )}

      {/* Store Selection Bottom Sheet */}
      <StoreSelector
        isOpen={isStoreSelectionOpen}
        onClose={() => setIsStoreSelectionOpen(false)}
        onConfirm={(selection) => {
          if (onStoreSelectionChange) {
            onStoreSelectionChange(selection);
          }
          setIsStoreSelectionOpen(false);
        }}
        brands={brands}
        countries={countries}
        stores={stores}
        currentSelection={currentStoreSelection}
      />
    </div>
  );
}