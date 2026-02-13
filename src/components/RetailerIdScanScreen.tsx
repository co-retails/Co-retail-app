import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from './ui/sheet';
import { 
  ArrowLeftIcon, 
  QrCodeIcon,
  CheckIcon,
  AlertTriangleIcon,
  PackageIcon,
  ImageIcon,
  RefreshCwIcon,
  XIcon,
  TruckIcon,
  ListIcon,
  CheckCircle2Icon
} from 'lucide-react';
import { OrderItem } from './OrderCreationScreen';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ItemCard, BaseItem } from './ItemCard';
import CameraScanner from './CameraScanner';

type ScanStep = 'scan-partner-qr' | 'scan-retailer-id';
type ItemsTab = 'scanned' | 'not-scanned';

interface ScanSession {
  currentItem?: OrderItem;
  step: ScanStep;
}

function TabBar({
  activeTab,
  onTabChange,
  scannedCount,
  notScannedCount,
}: {
  activeTab: ItemsTab;
  onTabChange: (tab: ItemsTab) => void;
  scannedCount: number;
  notScannedCount: number;
}) {
  const tabs: { id: ItemsTab; label: string; count: number }[] = [
    { id: 'scanned', label: 'Scanned', count: scannedCount },
    { id: 'not-scanned', label: 'Not scanned', count: notScannedCount },
  ];

  return (
    <div className="bg-surface border-b border-outline-variant">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className="flex-1 pb-3 pt-4 px-4 relative hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
            onClick={() => onTabChange(tab.id)}
          >
            <span className={`title-small ${activeTab === tab.id ? 'text-on-surface' : 'text-on-surface-variant'}`}>
              {tab.label} ({tab.count})
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

interface RetailerIdScanScreenProps {
  onBack: () => void;
  onComplete: (updatedItems: OrderItem[]) => void;
  onRegisterOrder?: () => void;
  onCreateDeliveryNote?: (orderId: string, items: OrderItem[]) => void;
  onViewOrders?: () => void;
  orderId?: string;
  orderItems?: OrderItem[];
  receivingStore?: string;
  partnerName?: string;
  orderStatus?: 'pending' | 'registered';
}

export default function RetailerIdScanScreen({
  onBack,
  onComplete,
  onRegisterOrder,
  onCreateDeliveryNote,
  onViewOrders,
  orderId = '',
  orderItems = [],
  receivingStore,
  partnerName,
  orderStatus = 'pending'
}: RetailerIdScanScreenProps) {
  const [scanSession, setScanSession] = useState<ScanSession>({ step: 'scan-partner-qr' });
  const [scannedConnections, setScannedConnections] = useState<OrderItem[]>((orderItems || []).filter(item => item.retailerItemId));
  const [isScanning, setIsScanning] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showDeliveryNoteDialog, setShowDeliveryNoteDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [itemsTab, setItemsTab] = useState<ItemsTab>('scanned');

  const itemsNeedingRetailerIds = (orderItems || []).filter(item => !scannedConnections.find(scanned => scanned.id === item.id));
  const totalItems = (orderItems || []).length;
  const completedItems = scannedConnections.length;

  const handleScan = (scannedCode: string) => {
    setIsScanning(true);
    
    setTimeout(() => {
      setIsScanning(false);
      
      if (scanSession.step === 'scan-partner-qr') {
        // Find a matching item from the partner QR scan
        const availableItems = (orderItems || []).filter(item => !scannedConnections.find(scanned => scanned.id === item.id));
        if (availableItems.length > 0) {
          const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
          setScanSession({
            step: 'scan-retailer-id',
            currentItem: randomItem
          });
        }
      } else if (scanSession.step === 'scan-retailer-id') {
        // Complete the connection with item ID using scanned code
        if (scanSession.currentItem) {
          // Use scanned code as retailer item ID, or generate one if needed
          const retailerItemId = scannedCode || `RID-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
          const connectedItem: OrderItem = {
            ...scanSession.currentItem,
            retailerItemId: retailerItemId,
            itemId: retailerItemId,
            status: undefined
          };
          
          setScannedConnections(prev => [...prev, connectedItem]);
          
          // Reset for next scan cycle - keep scanning active
          setScanSession({ step: 'scan-partner-qr' });
        }
      }
    }, 500);
  };

  const handleCancelScanning = () => {
    setIsScanning(false);
    setScanSession({ step: 'scan-partner-qr' });
  };

  const handleManualContinue = () => {
    setIsScanning(true);
    handleScan();
  };

  const handleRegisterOrder = () => {
    // Check if there are items without item IDs
    if (itemsNeedingRetailerIds.length > 0) {
      setShowRegisterDialog(true);
    } else {
      // All items have item IDs, proceed with registration
      if (onRegisterOrder) {
        onRegisterOrder();
      }
    }
  };

  const handleConfirmRegistration = () => {
    setShowRegisterDialog(false);
    if (onRegisterOrder) {
      onRegisterOrder();
    }
    // Show success dialog after registration
    setShowSuccessDialog(true);
  };

  const handleSaveAndContinue = () => {
    setShowRegisterDialog(false);
    handleSaveScannedItems();
  };

  const handleSaveScannedItems = () => {
    // Return updated items to the parent (order details screen)
    const updatedItems = orderItems.map(item => {
      const scannedItem = scannedConnections.find(scanned => scanned.id === item.id);
      return scannedItem || item;
    });
    onComplete(updatedItems);
  };

  const handleCreateDeliveryNote = () => {
    // Check if there are items without item IDs
    if (itemsNeedingRetailerIds.length > 0) {
      setShowDeliveryNoteDialog(true);
    } else {
      // All items have item IDs, proceed with delivery note creation
      if (onCreateDeliveryNote) {
        onCreateDeliveryNote(orderId, scannedConnections);
      }
    }
  };

  const handleConfirmDeliveryNote = () => {
    setShowDeliveryNoteDialog(false);
    if (onCreateDeliveryNote) {
      // Create delivery note with only scanned items
      onCreateDeliveryNote(orderId, scannedConnections);
    }
  };

  const mockItemImage = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=300&fit=crop";

  const getStepTitle = () => {
    switch (scanSession.step) {
      case 'scan-partner-qr':
        return 'Scan Partner QR Code';
      case 'scan-retailer-id':
        return 'Scan Item ID';
      default:
        return 'Scan QR Code';
    }
  };

  const getStepDescription = () => {
    switch (scanSession.step) {
      case 'scan-partner-qr':
        return 'Scan partner tag';
      case 'scan-retailer-id':
        return 'Scan item tag';
      default:
        return 'Point at QR code';
    }
  };

  const getStepNumber = () => {
    switch (scanSession.step) {
      case 'scan-partner-qr':
        return 1;
      case 'scan-retailer-id':
        return 2;
      default:
        return 1;
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top App Bar */}
      <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6">
          {/* Leading icon - Back button */}
          <button 
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors mr-2"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeftIcon className="w-6 h-6 text-on-surface" />
          </button>
          
          {/* Title */}
          <div className="flex-1">
            <h1 className="title-large text-on-surface">Scan Items</h1>
            <p className="body-small text-on-surface-variant">{orderId}</p>
          </div>
          
          {/* Step indicator */}
          <Badge variant="outline" className="text-xs">
            Step {getStepNumber()}/2
          </Badge>
        </div>
      </div>

      {/* Active Scanner - Always at Top */}
      <div className="sticky top-16 mx-4 md:mx-6 mb-4 z-20">
        <CameraScanner
          onScan={handleScan}
          isScanning={isScanning}
          scanMessage={getStepDescription()}
          autoStart={true}
          enableFakeScan={true}
          height="16rem"
        />
      </div>

      {/* Fixed Item Identified Section - Below Scanner */}
      {scanSession.currentItem && (
        <div className="sticky top-[320px] z-5 mx-4 mb-4">
          <div className="p-4 border border-success bg-success-container/10 rounded-[12px] shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckIcon size={20} className="text-success" />
                <p className="body-large text-on-surface">Item Identified</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancelScanning}
                className="w-12 h-12 md:w-8 md:h-8 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high flex-shrink-0 touch-manipulation min-w-[48px] min-h-[48px] md:min-w-0 md:min-h-0"
                aria-label="Cancel current item"
              >
                <XIcon size={16} />
              </Button>
            </div>
            
            {/* Item Details with Image */}
            <div className="flex gap-4 items-start">
              {/* Item Image */}
              <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 bg-surface-container rounded-xl overflow-hidden border border-outline-variant">
                {scanSession.currentItem.image || scanSession.currentItem.thumbnail ? (
                  <ImageWithFallback 
                    src={scanSession.currentItem.image || scanSession.currentItem.thumbnail || ''} 
                    alt={scanSession.currentItem.title || scanSession.currentItem.brand}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-variant flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 md:w-10 md:h-10 text-on-surface-variant" />
                  </div>
                )}
              </div>
              
              {/* Item Info - regular weight, no bold */}
              <div className="flex-1 min-w-0">
                {/* Mobile Layout: Compact */}
                <div className="block md:hidden space-y-2">
                  <div>
                    <p className="label-small text-on-surface-variant">External ID</p>
                    <p className="body-medium text-on-surface">{scanSession.currentItem.partnerItemId}</p>
                  </div>
                  <div>
                    <p className="label-small text-on-surface-variant">Brand • Category</p>
                    <p className="body-medium text-on-surface">{scanSession.currentItem.brand} • {scanSession.currentItem.category}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="label-small text-on-surface-variant">Size</p>
                      <p className="body-medium text-on-surface">{scanSession.currentItem.size}</p>
                    </div>
                    <div>
                      <p className="label-small text-on-surface-variant">Color</p>
                      <p className="body-medium text-on-surface">{scanSession.currentItem.color}</p>
                    </div>
                  </div>
                </div>
                
                {/* Desktop Layout: 2 columns side by side - left: External ID + Brand; right: Size/Color + Price */}
                <div className="hidden md:block">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div>
                        <p className="label-small text-on-surface-variant">External ID</p>
                        <p className="body-medium text-on-surface">{scanSession.currentItem.partnerItemId}</p>
                      </div>
                      <div>
                        <p className="label-small text-on-surface-variant">Brand • Category</p>
                        <p className="body-medium text-on-surface">{scanSession.currentItem.brand} • {scanSession.currentItem.category}</p>
                      </div>
                    </div>
                    <div className="flex flex-row items-start justify-between gap-6">
                      <div>
                        <p className="label-small text-on-surface-variant">Size • Color</p>
                        <p className="body-medium text-on-surface">{scanSession.currentItem.size} • {scanSession.currentItem.color}</p>
                      </div>
                      <div className="text-right flex-shrink-0" style={{ marginRight: 40 }}>
                        <p className="label-small text-on-surface-variant">Price</p>
                        <p className="headline-small text-on-surface">${scanSession.currentItem.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price - mobile only (tablet/desktop: shown in grid above) */}
              <div className="flex-shrink-0 text-right md:hidden">
                <p className="label-small text-on-surface-variant md:mb-1">Price</p>
                <p className="headline-small text-on-surface">${scanSession.currentItem.price.toFixed(2)}</p>
              </div>
            </div>
            
            {/* Scanner Status for Next Step */}
            {scanSession.step === 'scan-retailer-id' && (
              <div className="mt-3 p-3 bg-primary-container/20 rounded-lg border border-primary-container">
                <div className="flex items-center gap-2">
                  <QrCodeIcon size={18} className="text-primary" />
                  <p className="body-medium text-primary">
                    Ready for retailer tag
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scrollable Content Area */}
      <div className="flex-1 pb-32">
        {/* Empty state when no items */}
        {totalItems === 0 && (
          <div className="px-4 md:px-6 py-4">
            <Card className="bg-surface-container border border-outline-variant">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <AlertTriangleIcon className="w-12 h-12 text-on-surface-variant" />
                  <p className="title-medium text-on-surface">No items to scan</p>
                  <p className="body-medium text-on-surface-variant">
                    This order has no items. Please go back and select an order with items.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Scanned / Not scanned tabs and list */}
        {totalItems > 0 && (
          <>
            <TabBar
              activeTab={itemsTab}
              onTabChange={setItemsTab}
              scannedCount={completedItems}
              notScannedCount={itemsNeedingRetailerIds.length}
            />
            <div className="px-4 md:px-6 py-4">
              {itemsTab === 'scanned' ? (
                scannedConnections.length > 0 ? (
                  <Card className="bg-surface-container border border-outline-variant overflow-hidden">
                    <CardContent className="p-0">
                      {scannedConnections.map((item) => (
                        <div key={item.id} className="border-b border-outline-variant last:border-b-0 mx-4 md:mx-0">
                          <ItemCard
                            item={{
                              ...item as BaseItem,
                              status: 'Pending'
                            }}
                            variant="items-list"
                            showActions={false}
                            showSelection={false}
                            hideSellerName={true}
                            showBothIds={true}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="py-8 text-center">
                    <PackageIcon className="w-10 h-10 mx-auto text-on-surface-variant mb-2" />
                    <p className="body-medium text-on-surface-variant">No items scanned yet</p>
                  </div>
                )
              ) : (
                itemsNeedingRetailerIds.length > 0 ? (
                  <Card className="bg-surface-container border border-outline-variant overflow-hidden">
                    <CardContent className="p-0">
                      {itemsNeedingRetailerIds.map((item) => (
                        <div key={item.id} className="border-b border-outline-variant last:border-b-0 mx-4 md:mx-0">
                          <ItemCard
                            item={{
                              ...item as BaseItem,
                              status: 'Pending'
                            }}
                            variant="items-list"
                            showActions={false}
                            showSelection={false}
                            hideSellerName={true}
                            showExternalIdOnly={true}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="py-8 text-center">
                    <CheckIcon className="w-10 h-10 mx-auto text-tertiary mb-2" />
                    <p className="body-medium text-on-surface-variant">All items scanned</p>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      {scannedConnections.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface-container border-t border-outline-variant p-4 z-20 pb-safe">
          <div className="flex flex-row flex-wrap justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={handleSaveScannedItems}
              className="flex-1 md:flex-none min-w-[220px] h-[56px] rounded-lg border-outline text-on-surface"
            >
              <span className="label-large">Save scanned items</span>
            </Button>
            
            {onRegisterOrder && orderStatus === 'pending' && (
              <Button 
                onClick={handleRegisterOrder}
                className="flex-1 md:flex-none min-w-[220px] h-[56px] bg-primary text-on-primary hover:bg-primary/90 rounded-lg"
                disabled={scannedConnections.length === 0}
              >
                <span className="label-large">Register order</span>
              </Button>
            )}
            
            {/* Delivery Note Button - Show ONLY for registered orders */}
            {onCreateDeliveryNote && orderStatus === 'registered' && (
              <Button 
                onClick={handleCreateDeliveryNote}
                className="flex-1 md:flex-none min-w-[220px] h-[56px] bg-tertiary text-on-tertiary hover:bg-tertiary/90 rounded-lg"
                disabled={scannedConnections.length === 0}
              >
                <PackageIcon size={20} className="mr-2" />
                <span className="label-large">Create delivery note</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Register Order Confirmation - Bottom sheet (guidelines: no full-width buttons on tablet/desktop) */}
      <Sheet open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] flex flex-col">
          <SheetHeader className="flex-shrink-0 text-left">
            <SheetTitle className="title-medium text-on-surface">Incomplete Order</SheetTitle>
            <SheetDescription className="body-medium text-on-surface-variant">
              {itemsNeedingRetailerIds.length} item{itemsNeedingRetailerIds.length !== 1 ? 's' : ''} still need item IDs. What would you like to do?
            </SheetDescription>
          </SheetHeader>
          <SheetFooter className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end flex-shrink-0 border-t border-outline-variant mt-4 pt-4">
            <Button
              variant="outline"
              onClick={handleSaveAndContinue}
              className="min-h-[48px] w-full sm:w-auto sm:max-w-[280px] rounded-lg"
            >
              <span className="label-large">Save and continue later</span>
            </Button>
            <Button
              onClick={handleConfirmRegistration}
              className="min-h-[48px] w-full sm:w-auto sm:max-w-[280px] bg-error text-on-error hover:bg-error/90 rounded-lg"
            >
              <span className="label-large text-center">Register and delete incomplete items</span>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Create Delivery Note Confirmation Dialog */}
      <AlertDialog open={showDeliveryNoteDialog} onOpenChange={setShowDeliveryNoteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="title-medium text-on-surface">
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="h-5 w-5 text-warning-container" />
                Incomplete Scanning
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription className="body-medium text-on-surface-variant">
              {itemsNeedingRetailerIds.length} item{itemsNeedingRetailerIds.length !== 1 ? 's' : ''} {itemsNeedingRetailerIds.length !== 1 ? 'have' : 'has'} not been scanned yet. 
              <br/><br/>
              Do you want to create a delivery note with only the {scannedConnections.length} scanned item{scannedConnections.length !== 1 ? 's' : ''}? 
              <br/><br/>
              The unscanned items will be removed from this delivery note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-4">
            <AlertDialogCancel 
              className="min-h-[48px] w-full sm:w-auto order-2 sm:order-1 rounded-lg"
            >
              <span className="label-large">Cancel</span>
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDeliveryNote}
              className="min-h-[48px] w-full sm:w-auto bg-tertiary text-on-tertiary hover:bg-tertiary/90 order-1 sm:order-2 rounded-lg"
            >
              <span className="label-large">Proceed with {scannedConnections.length} item{scannedConnections.length !== 1 ? 's' : ''}</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Registration Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex flex-col items-center text-center gap-4 py-4">
              {/* Success Icon */}
              <div className="w-16 h-16 rounded-full bg-tertiary-container flex items-center justify-center">
                <CheckCircle2Icon className="w-10 h-10 text-tertiary" />
              </div>
              
              {/* Title */}
              <AlertDialogTitle className="headline-small text-on-surface">
                Order Registered Successfully
              </AlertDialogTitle>
              
              {/* Description */}
              <AlertDialogDescription className="body-medium text-on-surface-variant">
                Order {orderId} has been registered with {scannedConnections.length} item{scannedConnections.length !== 1 ? 's' : ''}. 
                What would you like to do next?
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          
          <AlertDialogFooter className="flex-col gap-3 pt-2">
            {/* Create Delivery Note Button */}
            <button
              onClick={() => {
                setShowSuccessDialog(false);
                if (onCreateDeliveryNote) {
                  onCreateDeliveryNote(orderId, scannedConnections);
                }
              }}
              className="w-full min-h-[48px] bg-primary text-on-primary hover:bg-primary/90 active:bg-primary/80 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <TruckIcon className="w-5 h-5" />
              <span className="label-large">Create Delivery Note</span>
            </button>
            
            {/* View Orders Button */}
            <button
              onClick={() => {
                setShowSuccessDialog(false);
                if (onViewOrders) {
                  onViewOrders();
                }
              }}
              className="w-full min-h-[48px] bg-surface border border-outline text-on-surface hover:bg-surface-container-high active:bg-surface-container-highest rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <ListIcon className="w-5 h-5" />
              <span className="label-large">View Order List</span>
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
