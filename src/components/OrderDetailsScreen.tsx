import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  FullScreenDialog, 
  FullScreenDialogContent, 
  FullScreenDialogDescription, 
  FullScreenDialogHeader, 
  FullScreenDialogTitle,
  FullScreenDialogClose
} from './ui/full-screen-dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { 
  ArrowLeftIcon, 
  QrCodeIcon,
  EditIcon,
  CheckIcon,
  AlertTriangleIcon,
  PackageIcon,
  RefreshCwIcon,
  XIcon
} from 'lucide-react';
import { OrderItem } from './OrderCreationScreen';
import { ItemCard, BaseItem } from './ItemCard';
import ActiveScanner from './ActiveScanner';
import { SellpyOrder } from './ShippingScreen';

type ScanStep = 'scan-partner-qr' | 'scan-retailer-id';

interface ScanSession {
  currentItem?: OrderItem;
  step: ScanStep;
}

interface OrderDetailsScreenProps {
  order: SellpyOrder;
  onBack: () => void;
  onItemScanned?: (itemId: string, retailerId: string) => void;
  onNavigateToScan?: (itemId: string) => void;
  onCompleteOrder?: () => void;
  onRegisterOrder?: () => void;
  onNavigateToRetailerIdScan?: () => void;
  onCreateDeliveryNote?: (orderId: string) => void;
}

export default function OrderDetailsScreen({
  order,
  onBack,
  onItemScanned,
  onNavigateToScan,
  onCompleteOrder,
  onRegisterOrder,
  onNavigateToRetailerIdScan,
  onCreateDeliveryNote
}: OrderDetailsScreenProps) {
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [scanSession, setScanSession] = useState<ScanSession>({ step: 'scan-partner-qr' });
  const [isScanning, setIsScanning] = useState(false);
  
  // Mock data for dropdowns (in real app, these would come from props or API)
  const brands = ['H&M', 'WEEKDAY', 'COS', 'Monki'];
  const genders = ['Men', 'Women', 'Kids', 'Unisex'];
  const categories = ['Clothing', 'Shoes', 'Accessories'];
  const subcategories = {
    'Clothing': ['Tops', 'Bottoms', 'Dresses', 'Outerwear'],
    'Shoes': ['Sneakers', 'Boots', 'Sandals', 'Formal'],
    'Accessories': ['Bags', 'Jewelry', 'Belts', 'Hats']
  };

  const orderItems = order.items;
  const orderId = order.id;
  const receivingStore = order.receivingStore;
  
  const itemsWithRetailerIds = orderItems.filter(item => item.retailerItemId);
  const itemsNeedingRetailerIds = orderItems.filter(item => !item.retailerItemId);
  const itemsWithErrors = orderItems.filter(item => item.status === 'error');
  const hasValidationErrors = itemsWithErrors.length > 0;
  const canAddRetailerIds = itemsNeedingRetailerIds.length > 0 && !hasValidationErrors;
  const canRegister = orderItems.length > 0 && orderItems.every(item => item.retailerItemId && item.status !== 'error');
  const allHaveRetailerIds = orderItems.length > 0 && orderItems.every(item => item.retailerItemId);
  const needsValidation = allHaveRetailerIds && hasValidationErrors;

  // Track items with retailer IDs for progress calculation

  const handleEditItem = (item: OrderItem) => {
    setEditingItem(item);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    
    const validation = validateItem(editingItem);
    const updatedItem = {
      ...editingItem,
      status: validation.valid ? undefined : 'error' as const,
      errors: validation.errors
    };
    
    // In a real app, this would update via the parent component
    setShowEditDialog(false);
    setEditingItem(null);
  };

  const validateItem = (item: OrderItem): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!item.brand) errors.push('Item brand is required');
    if (!item.gender) errors.push('Gender is required');
    if (!item.category) errors.push('Category is required');
    if (!item.subcategory) errors.push('Subcategory is required');
    if (!item.size) errors.push('Size is required');
    if (!item.color) errors.push('Color is required');
    if (!item.price || item.price <= 0) errors.push('Valid price is required');
    
    return { valid: errors.length === 0, errors };
  };

  // Scanning handlers
  const handleStartScanning = () => {
    if (onNavigateToRetailerIdScan) {
      onNavigateToRetailerIdScan();
    } else {
      // Fallback to dialog if no navigation handler provided
      setShowScanDialog(true);
      setScanSession({ step: 'scan-partner-qr' });
      setIsScanning(false);
    }
  };

  const handleScan = (scannedCode: string) => {
    setIsScanning(true);
    
    // Small delay for visual feedback
    setTimeout(() => {
      setIsScanning(false);
      
      if (scanSession.step === 'scan-partner-qr') {
        // Use order.items directly to get the latest state
        const availableItems = order.items.filter(item => !item.retailerItemId);
        
        if (availableItems.length > 0) {
          const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
          setScanSession({
            step: 'scan-retailer-id',
            currentItem: randomItem
          });
        }
      } else if (scanSession.step === 'scan-retailer-id') {
        if (scanSession.currentItem) {
          // Use scanned code as retailer item ID, or generate one if needed
          const retailerItemId = scannedCode || `RID-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
          
          // Call parent callback to update the order
          if (onItemScanned) {
            onItemScanned(scanSession.currentItem.itemId, retailerItemId);
          }
          
          // Reset to scan next item
          setScanSession({ step: 'scan-partner-qr' });
        }
      }
    }, 500);
  };

  const handleCancelScanning = () => {
    setIsScanning(false);
    setScanSession({ step: 'scan-partner-qr' });
  };

  const handleCloseScanDialog = () => {
    setShowScanDialog(false);
    setIsScanning(false);
    setScanSession({ step: 'scan-partner-qr' });
  };

  const completedItems = orderItems.filter(item => item.retailerItemId).length;
  const totalItems = orderItems.length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  // Calculate pricing totals
  const totalRetailPrice = orderItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalPurchasePrice = orderItems.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
  const totalSalesMargin = totalRetailPrice > 0 ? ((totalRetailPrice - totalPurchasePrice) / totalRetailPrice) * 100 : 0;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-surface-container border-b border-outline-variant">
        <div className="px-4 md:px-6 py-3">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-on-surface-variant flex-shrink-0"
            >
              <ArrowLeftIcon size={20} />
            </Button>
            
            <div className="flex-1 min-w-0">
              <h1 className="headline-small text-on-surface mb-1">Order Details</h1>
              
              {/* Mobile: Stack information vertically */}
              <div className="block md:hidden space-y-1">
                <p className="body-small text-on-surface-variant">
                  Order {orderId}
                </p>
                <p className="body-small text-on-surface-variant">
                  Partner: Sellpy
                </p>
                {receivingStore && (
                  <p className="body-small text-on-surface-variant">
                    Receiver: {receivingStore}
                  </p>
                )}
              </div>
              
              {/* Desktop: Horizontal layout */}
              <div className="hidden md:flex items-center gap-4">
                <p className="body-medium text-on-surface-variant">
                  Order {orderId}
                </p>
                <p className="body-medium text-on-surface-variant">
                  Partner: Sellpy
                </p>
                {receivingStore && (
                  <p className="body-medium text-on-surface-variant">
                    Receiver: {receivingStore}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">
                API Integration
              </Badge>
              {canRegister && (
                <Badge variant="secondary" className="text-xs">
                  Ready to Register
                </Badge>
              )}
            </div>
          </div>

          {/* Order Summary - Pricing Info */}
          <div className="mt-4 pt-4">
            <div className="grid grid-cols-2 gap-3 md:flex md:items-start md:gap-6">
              <div>
                <p className="label-small text-on-surface-variant mb-1">Total Items</p>
                <p className="title-medium text-on-surface">{totalItems}</p>
              </div>
              <div>
                <p className="label-small text-on-surface-variant mb-1">Total Purchase Price</p>
                <p className="title-medium text-on-surface">${totalPurchasePrice.toFixed(2)}</p>
              </div>
              <div className="md:ml-auto">
                <p className="label-small text-on-surface-variant mb-1">Total Retail Price</p>
                <p className="title-medium text-on-surface">${totalRetailPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="label-small text-on-surface-variant mb-1">Total Sales Margin</p>
                <p className="title-medium text-primary">{totalSalesMargin.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-6 py-4 md:py-6 pb-24 space-y-6">
        {/* Status Banner - Ready to Register */}
        {canRegister && (
          <Alert className="bg-tertiary-container border-tertiary">
            <CheckIcon size={16} className="text-on-tertiary-container" />
            <AlertDescription className="text-on-tertiary-container">
              <span className="title-small">Order ready to register</span>
              <p className="body-small mt-1">
                All {orderItems.length} items have item IDs and valid attributes.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Status Banner - Validation Errors */}
        {needsValidation && (
          <Alert className="bg-error-container border-error">
            <AlertTriangleIcon size={16} className="text-on-error-container" />
            <AlertDescription className="text-on-error-container">
              <span className="title-small">{itemsWithErrors.length} item{itemsWithErrors.length > 1 ? 's' : ''} {itemsWithErrors.length > 1 ? 'have' : 'has'} validation errors</span>
              <p className="body-small mt-1">
                Please fix validation errors before registering the order.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Status Banner - Initial Validation Errors */}
        {hasValidationErrors && !allHaveRetailerIds && (
          <Alert className="bg-error-container border-error">
            <AlertTriangleIcon size={16} className="text-on-error-container" />
            <AlertDescription className="text-on-error-container">
              <span className="title-small">{itemsWithErrors.length} item{itemsWithErrors.length > 1 ? 's' : ''} {itemsWithErrors.length > 1 ? 'have' : 'has'} validation errors</span>
              <p className="body-small mt-1">
                Fix validation errors before adding item IDs.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Items List */}
        <Card>
          <CardHeader>
            <CardTitle className="title-medium">Order Items ({orderItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {orderItems.length === 0 ? (
              <div className="text-center py-8">
                <PackageIcon size={48} className="mx-auto text-on-surface-variant/50 mb-4" />
                <p className="title-medium text-on-surface-variant">No items in this order</p>
                <p className="body-medium text-on-surface-variant">Items from API integration will appear here</p>
              </div>
            ) : (
              <>
                {/* Mobile View - Cards */}
                <div className="md:hidden space-y-4">
                  {/* Items with Validation Errors */}
                  {itemsWithErrors.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 px-3">
                        <AlertTriangleIcon className="h-4 w-4 text-error" />
                        <span className="label-large text-error">
                          Needs attention ({itemsWithErrors.length})
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {orderItems
                          .filter(item => item.status === 'error')
                          .map((item) => {
                            const baseItem: BaseItem = {
                              ...item,
                              title: `${item.brand} ${item.category}`,
                              status: 'error'
                            };
                            
                            return (
                              <div key={item.id} className="relative bg-surface-container border border-outline-variant rounded-lg overflow-hidden">
                                <ItemCard
                                  item={baseItem}
                                  variant="order-details"
                                  onClick={() => handleEditItem(item)}
                                  onEdit={() => handleEditItem(item)}
                                  showActions={true}
                                  showSelection={false}
                                  orderDetailsConfig={{
                                    orderStatus: order.status
                                  }}
                                />
                                {item.errors && item.errors.length > 0 && (
                                  <div className="bg-error-container/30 border-t border-error/20 px-4 py-2">
                                    <div className="flex items-start gap-2">
                                      <AlertTriangleIcon className="h-4 w-4 text-error mt-0.5 flex-shrink-0" />
                                      <div className="flex-1">
                                        <p className="body-small text-error">
                                          {item.errors.join(', ')}
                                        </p>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditItem(item)}
                                        className="border-error text-error hover:bg-error hover:text-on-error flex-shrink-0"
                                      >
                                        <EditIcon size={14} className="mr-1" />
                                        Fix
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Valid Items */}
                  {orderItems.filter(item => item.status !== 'error').length > 0 && (
                    <div>
                      {itemsWithErrors.length > 0 && (
                        <div className="flex items-center gap-2 mb-3 px-3">
                          <CheckIcon className="h-4 w-4 text-tertiary" />
                          <span className="label-large text-on-surface">
                            Valid items ({orderItems.length - itemsWithErrors.length})
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        {orderItems
                          .filter(item => item.status !== 'error')
                          .map((item) => {
                            const baseItem: BaseItem = {
                              ...item,
                              title: `${item.brand} ${item.category}`,
                              status: item.status || 'pending'
                            };
                            
                            return (
                              <div key={item.id} className="bg-surface-container border border-outline-variant rounded-lg overflow-hidden">
                                <ItemCard
                                  item={baseItem}
                                  variant="order-details"
                                  onClick={() => handleEditItem(item)}
                                  onEdit={() => handleEditItem(item)}
                                  showActions={true}
                                  showSelection={false}
                                  orderDetailsConfig={{
                                    orderStatus: order.status
                                  }}
                                />
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden md:block">
                  {/* Items with Validation Errors */}
                  {itemsWithErrors.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangleIcon className="h-4 w-4 text-error" />
                        <span className="label-large text-error">
                          Needs attention ({itemsWithErrors.length})
                        </span>
                      </div>
                      <div className="border border-outline-variant rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-surface-container">
                            <tr className="border-b border-outline-variant">
                              <th className="px-4 py-3 text-left">
                                <span className="label-medium text-on-surface">Partner ID</span>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="label-medium text-on-surface">Item ID</span>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="label-medium text-on-surface">Brand</span>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="label-medium text-on-surface">Category</span>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="label-medium text-on-surface">Size</span>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="label-medium text-on-surface">Color</span>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="label-medium text-on-surface">Price</span>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="label-medium text-on-surface">Errors</span>
                              </th>
                              <th className="px-4 py-3 text-right">
                                <span className="label-medium text-on-surface">Action</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-surface">
                            {orderItems
                              .filter(item => item.status === 'error')
                              .map((item, index) => (
                                <tr 
                                  key={item.id}
                                  className={`${index !== itemsWithErrors.length - 1 ? 'border-b border-outline-variant' : ''} hover:bg-surface-container/50 transition-colors`}
                                >
                                  <td className="px-4 py-3">
                                    <span className="body-medium text-on-surface">{item.partnerItemId}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    {item.retailerItemId ? (
                                      <span className="body-medium text-on-surface">{item.retailerItemId}</span>
                                    ) : (
                                      <span className="body-medium text-on-surface-variant">—</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="body-medium text-on-surface">{item.brand || '—'}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="body-medium text-on-surface">{item.category || '—'}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="body-medium text-on-surface">{item.size || '—'}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="body-medium text-on-surface">{item.color || '—'}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="body-medium text-on-surface">{item.price ? `$${item.price.toFixed(2)}` : '—'}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-start gap-1">
                                      <AlertTriangleIcon className="h-4 w-4 text-error mt-0.5 flex-shrink-0" />
                                      <span className="body-small text-error">{item.errors?.join(', ')}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditItem(item)}
                                      className="border-error text-error hover:bg-error hover:text-on-error"
                                    >
                                      <EditIcon size={14} className="mr-1" />
                                      Fix
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Valid Items */}
                  {orderItems.filter(item => item.status !== 'error').length > 0 && (
                    <div>
                      {itemsWithErrors.length > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <CheckIcon className="h-4 w-4 text-tertiary" />
                          <span className="label-large text-on-surface">
                            Valid items ({orderItems.length - itemsWithErrors.length})
                          </span>
                        </div>
                      )}
                      <div className="border border-outline-variant rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-surface-container">
                            <tr className="border-b border-outline-variant">
                              <th className="px-4 py-3 text-left">
                                <span className="label-medium text-on-surface">Partner ID</span>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="label-medium text-on-surface">Item ID</span>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="label-medium text-on-surface">Brand</span>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="label-medium text-on-surface">Category</span>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="label-medium text-on-surface">Subcategory</span>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="label-medium text-on-surface">Size</span>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="label-medium text-on-surface">Color</span>
                              </th>
                              <th className="px-4 py-3 text-left">
                                <span className="label-medium text-on-surface">Price</span>
                              </th>
                              <th className="px-4 py-3 text-center">
                                <span className="label-medium text-on-surface">Status</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-surface">
                            {orderItems
                              .filter(item => item.status !== 'error')
                              .map((item, index, array) => (
                                <tr 
                                  key={item.id}
                                  className={`${index !== array.length - 1 ? 'border-b border-outline-variant' : ''} hover:bg-surface-container/50 transition-colors`}
                                >
                                  <td className="px-4 py-3">
                                    <span className="body-medium text-on-surface">{item.partnerItemId}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    {item.retailerItemId ? (
                                      <span className="body-medium text-on-surface">{item.retailerItemId}</span>
                                    ) : (
                                      <span className="body-medium text-on-surface-variant">Pending</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="body-medium text-on-surface">{item.brand}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="body-medium text-on-surface">{item.category}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="body-medium text-on-surface">{item.subcategory}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="body-medium text-on-surface">{item.size || '—'}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="body-medium text-on-surface">{item.color}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="body-medium text-on-surface">${item.price.toFixed(2)}</span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {item.retailerItemId ? (
                                      <Badge variant="secondary" className="bg-tertiary-container text-on-tertiary-container">
                                        <CheckIcon size={12} className="mr-1" />
                                        Complete
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="border-outline text-on-surface-variant">
                                        Pending
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons - Fixed at Bottom */}
        {orderItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant px-4 md:px-6 py-4 z-20 md:pl-24 flex flex-row flex-wrap gap-3 justify-end">
            {/* Pending status: Add item IDs */}
            {order.status === 'pending' && canAddRetailerIds && (
              <Button 
                onClick={handleStartScanning} 
                className="w-full md:w-auto bg-primary text-on-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 transition-colors rounded-lg px-6 py-3 min-h-[56px] h-[56px] flex-1 md:flex-none" 
                size="lg"
              >
                <QrCodeIcon size={20} className="mr-2 flex-shrink-0" />
                <span className="label-large">Add item IDs ({itemsNeedingRetailerIds.length} items)</span>
              </Button>
            )}
            
            {/* Ready to register */}
            {canRegister && (
              <Button 
                onClick={onRegisterOrder} 
                className="w-full md:w-auto bg-primary text-on-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 transition-colors rounded-lg px-6 py-3 min-h-[56px] h-[56px] flex-1 md:flex-none" 
                size="lg"
              >
                <CheckIcon size={20} className="mr-2 flex-shrink-0" />
                <span className="label-large">Register order</span>
              </Button>
            )}

            {/* Registered status: Create delivery note */}
            {order.status === 'registered' && onCreateDeliveryNote && (
              <Button 
                onClick={() => onCreateDeliveryNote(orderId)} 
                className="w-full md:w-auto bg-primary text-on-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 transition-colors rounded-lg px-6 py-3 min-h-[56px] h-[56px] flex-1 md:flex-none" 
                size="lg"
              >
                <PackageIcon size={20} className="mr-2 flex-shrink-0" />
                <span className="label-large">Create delivery note</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Edit Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl" aria-describedby="edit-dialog-description">
          <DialogHeader>
            <DialogTitle className="headline-small">Edit Item</DialogTitle>
            <DialogDescription id="edit-dialog-description" className="body-medium">
              Update item attributes to fix validation errors or make corrections.
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <>
              {/* Current Validation Errors */}
              {editingItem.errors && editingItem.errors.length > 0 && (
                <Alert className="bg-error-container border-error">
                  <AlertTriangleIcon size={16} className="text-on-error-container" />
                  <AlertDescription className="text-on-error-container">
                    <span className="label-large">Validation Errors:</span>
                    <ul className="list-disc list-inside body-small mt-1">
                      {editingItem.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-brand">Item brand *</Label>
                <Select
                  value={editingItem.brand}
                  onValueChange={(value) => setEditingItem(prev => prev ? { ...prev, brand: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand} className="min-h-[48px] md:min-h-0 py-3 md:py-1.5 touch-manipulation">{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-gender">Gender *</Label>
                <Select
                  value={editingItem.gender}
                  onValueChange={(value) => setEditingItem(prev => prev ? { ...prev, gender: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((gender) => (
                      <SelectItem key={gender} value={gender} className="min-h-[48px] md:min-h-0 py-3 md:py-1.5 touch-manipulation">{gender}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={editingItem.category}
                  onValueChange={(value) => setEditingItem(prev => prev ? { ...prev, category: value, subcategory: '' } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className="min-h-[48px] md:min-h-0 py-3 md:py-1.5 touch-manipulation">{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-subcategory">Subcategory *</Label>
                <Select
                  value={editingItem.subcategory}
                  onValueChange={(value) => setEditingItem(prev => prev ? { ...prev, subcategory: value } : null)}
                  disabled={!editingItem.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {editingItem.category && subcategories[editingItem.category as keyof typeof subcategories]?.map((sub) => (
                      <SelectItem key={sub} value={sub} className="min-h-[48px] md:min-h-0 py-3 md:py-1.5 touch-manipulation">{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-size">Size *</Label>
                <Input
                  id="edit-size"
                  value={editingItem.size}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, size: e.target.value } : null)}
                  placeholder="e.g., S, M, L, 38, 42"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color *</Label>
                <Input
                  id="edit-color"
                  value={editingItem.color}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, color: e.target.value } : null)}
                  placeholder="Enter color"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-price">Price *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)}
                  placeholder="0.00"
                />
              </div>
            </div>
            </>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              <CheckIcon size={16} className="mr-2" />
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scan Item IDs Full-Screen Dialog */}
      <FullScreenDialog open={showScanDialog} onOpenChange={setShowScanDialog}>
        <FullScreenDialogContent className="flex flex-col">
          {/* Header */}
          <div className="bg-surface-container border-b border-outline-variant sticky top-0 z-10">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FullScreenDialogClose asChild>
                    <Button variant="ghost" size="icon" className="text-on-surface-variant">
                      <XIcon size={20} />
                    </Button>
                  </FullScreenDialogClose>
                  <div>
                    <FullScreenDialogTitle className="headline-small text-on-surface">
                      Add Item IDs
                    </FullScreenDialogTitle>
                    <FullScreenDialogDescription className="body-small text-on-surface-variant">
                      {scanSession.step === 'scan-partner-qr' 
                        ? 'Scan partner QR code to start' 
                        : 'Scan item ID to connect'}
                    </FullScreenDialogDescription>
                  </div>
                </div>
                
                {/* Progress indicator */}
                <div className="flex items-center gap-2">
                  <Badge variant={completedItems === totalItems ? "default" : "outline"} className="text-xs">
                    {completedItems}/{totalItems}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pb-safe">
            {/* Active Scanner - Fixed container to prevent layout shift */}
            <div className="sticky top-0 z-10 bg-surface pt-4 pb-4">
              <ActiveScanner 
                onScan={handleScan}
                isScanning={isScanning}
                showManualEntry={false}
              />
            </div>

            {/* Current Scan Status - Fixed height container */}
            <div className="px-4 pb-4">
              <div className="min-h-[140px]">
                {scanSession.step === 'scan-partner-qr' && (
                  <Card className="bg-surface-container-low border-outline-variant h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary-container rounded-lg flex-shrink-0">
                          <QrCodeIcon className="h-5 w-5 text-on-primary-container" />
                        </div>
                        <div className="flex-1">
                          <p className="title-small text-on-surface mb-1">
                            Step 1: Scan Partner QR Code
                          </p>
                          <p className="body-small text-on-surface-variant">
                            Position the partner's QR code in the camera view above
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {scanSession.step === 'scan-retailer-id' && scanSession.currentItem && (
                  <Card className="bg-primary-container border-primary h-full">
                    <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary rounded-lg">
                        <QrCodeIcon className="h-5 w-5 text-on-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="title-small text-on-primary-container mb-1">
                          Step 2: Scan Item ID
                        </p>
                        <p className="body-small text-on-primary-container mb-2">
                          Connecting this item:
                        </p>
                        <div className="bg-surface/20 backdrop-blur-sm rounded-lg p-2">
                          <p className="body-medium text-on-primary-container">
                            {scanSession.currentItem.brand} • {scanSession.currentItem.category}
                          </p>
                          <p className="body-small text-on-primary-container/70">
                            Partner ID: {scanSession.currentItem.partnerItemId}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-4 pb-4">
              <Card className="bg-surface border-outline-variant">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="label-medium text-on-surface-variant">Scanning Progress</span>
                      <span className="label-large text-on-surface">{completedItems} / {totalItems}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <p className="body-small text-on-surface-variant text-center">
                      {progressPercentage.toFixed(0)}% completed
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Items List */}
            <div className="px-4 pb-20">
              <h3 className="title-medium text-on-surface mb-3">Order Items</h3>
              
              <div className="space-y-4">
                {/* Completed Items - Always show section */}
                <div className={itemsWithRetailerIds.length > 0 ? '' : 'hidden'}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckIcon className="h-4 w-4 text-tertiary" />
                    <p className="label-medium text-tertiary">
                      Connected ({itemsWithRetailerIds.length})
                    </p>
                  </div>
                  <div className="space-y-2">
                    {orderItems
                      .filter(item => item.retailerItemId)
                      .map((item) => (
                        <Card key={item.id} className="bg-tertiary-container/30 border-tertiary">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-tertiary rounded-full">
                                <CheckIcon className="h-4 w-4 text-on-tertiary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="body-medium text-on-surface truncate">
                                  {item.brand} {item.category}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="body-small text-on-surface-variant">
                                    {item.partnerItemId}
                                  </p>
                                  <span className="text-on-surface-variant">→</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {item.retailerItemId}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>

                {/* Pending Items - Always show section */}
                <div className={itemsNeedingRetailerIds.length > 0 ? '' : 'hidden'}>
                  <div className="flex items-center gap-2 mb-2">
                    <PackageIcon className="h-4 w-4 text-on-surface-variant" />
                    <p className="label-medium text-on-surface-variant">
                      Pending ({itemsNeedingRetailerIds.length})
                    </p>
                  </div>
                  <div className="space-y-2">
                    {orderItems
                      .filter(item => !item.retailerItemId)
                      .map((item) => (
                        <Card key={item.id} className="bg-surface-container border-outline-variant">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-surface-container-high rounded-full">
                                <PackageIcon className="h-4 w-4 text-on-surface-variant" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="body-medium text-on-surface truncate">
                                  {item.brand} {item.category}
                                </p>
                                <p className="body-small text-on-surface-variant">
                                  {item.partnerItemId}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                Waiting
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Completion Alert */}
            {completedItems === totalItems && totalItems > 0 && (
              <div className="px-4 pb-4">
                <Alert className="bg-tertiary-container border-tertiary">
                  <CheckIcon size={16} className="text-on-tertiary-container" />
                  <AlertDescription className="text-on-tertiary-container">
                    All items connected! You can now close this dialog and register the order.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-surface border-t border-outline-variant p-4 sticky bottom-0">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleCloseScanDialog}
                className="flex-1"
              >
                {completedItems === totalItems ? 'Done' : 'Close'}
              </Button>
              {completedItems === totalItems && totalItems > 0 && (
                <Button 
                  onClick={() => {
                    handleCloseScanDialog();
                    onRegisterOrder?.();
                  }}
                  className="flex-1"
                >
                  <CheckIcon size={16} className="mr-2" />
                  Register order
                </Button>
              )}
            </div>
          </div>
        </FullScreenDialogContent>
      </FullScreenDialog>
    </div>
  );
}