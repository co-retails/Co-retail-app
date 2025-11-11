import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
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

type ScanStep = 'scan-partner-qr' | 'scan-retailer-id';

interface ScanSession {
  currentItem?: OrderItem;
  step: ScanStep;
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

  const itemsNeedingRetailerIds = (orderItems || []).filter(item => !item.retailerItemId);
  const totalItems = (orderItems || []).length;
  const completedItems = scannedConnections.length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const handleScan = () => {
    setIsScanning(true);
    
    // Mock scanning with different timeouts for different steps
    const scanDelay = scanSession.step === 'scan-partner-qr' ? 2000 : 1500;
    
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
        // Complete the connection with retailer ID
        if (scanSession.currentItem) {
          const mockRetailerItemId = `RID-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
          const connectedItem: OrderItem = {
            ...scanSession.currentItem,
            retailerItemId: mockRetailerItemId,
            itemId: mockRetailerItemId,
            status: 'valid'
          };
          
          setScannedConnections(prev => [...prev, connectedItem]);
          
          // Reset for next scan cycle - keep scanning active
          setScanSession({ step: 'scan-partner-qr' });
        }
      }
    }, scanDelay);
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
    // Check if there are items without retailer IDs
    if (itemsNeedingRetailerIds.length > 0) {
      setShowRegisterDialog(true);
    } else {
      // All items have retailer IDs, proceed with registration
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
    // Check if there are items without retailer IDs
    if (itemsNeedingRetailerIds.length > 0) {
      setShowDeliveryNoteDialog(true);
    } else {
      // All items have retailer IDs, proceed with delivery note creation
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
        return 'Scan Retailer Item ID';
      default:
        return 'Scan QR Code';
    }
  };

  const getStepDescription = () => {
    switch (scanSession.step) {
      case 'scan-partner-qr':
        return 'Scan partner tag';
      case 'scan-retailer-id':
        return 'Scan retailer tag';
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
      <div className="sticky top-16 mx-4 md:mx-6 mb-4 bg-surface-container border border-outline-variant rounded-[12px] overflow-hidden z-20">
        {/* Camera Preview Area */}
        <div className="relative bg-surface-variant h-64 flex items-center justify-center">
          {/* Camera preview placeholder - in real implementation, this would show camera feed */}
          <div className="absolute inset-4 border-2 border-primary rounded-lg flex items-center justify-center">
            <div className="w-16 h-16 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
              <QrCodeIcon className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          {/* Active Scanning overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button 
              className="w-48 h-48 border-2 border-primary rounded-lg relative hover:bg-primary/5 focus:bg-primary/10 active:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              onClick={handleScan}
              disabled={isScanning || totalItems === 0}
              aria-label="Tap to scan"
            >
              {/* Animated scanning line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary animate-pulse"></div>
              <div className="absolute top-8 left-0 right-0 h-px bg-primary/30 animate-bounce" style={{animationDelay: '0.5s'}}></div>
              
              {/* Corner indicators */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
              
              {/* Status indicator */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 bg-primary px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-on-primary rounded-full animate-pulse"></div>
                  <span className="label-small text-on-primary">
                    {isScanning ? 'SCANNING...' : 'READY'}
                  </span>
                </div>
              </div>
              
              {/* Scan message overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="bg-primary/90 backdrop-blur-sm rounded-lg px-4 py-2 opacity-0 hover:opacity-100 transition-opacity">
                  <span className="label-medium text-on-primary">{getStepDescription()}</span>
                </div>
              </div>
            </button>
          </div>
        </div>
        
        {/* Scanner controls */}
        <div className="p-4 border-t border-outline-variant bg-surface">
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleCancelScanning} size="sm">
              Reset Session
            </Button>
          </div>
        </div>
      </div>

      {/* Fixed Item Identified Section - Below Scanner */}
      {scanSession.currentItem && (
        <div className="sticky top-[320px] z-5 mx-4 mb-4">
          <div className="p-4 border border-success bg-success-container/10 rounded-[12px] shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckIcon size={16} className="text-success" />
                <p className="title-small text-on-surface">Item Identified</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancelScanning}
                className="w-8 h-8 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high flex-shrink-0"
                aria-label="Cancel current item"
              >
                <XIcon size={16} />
              </Button>
            </div>
            
            {/* Item Details with Image */}
            <div className="flex gap-4">
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
              
              {/* Item Info */}
              <div className="flex-1 min-w-0">
                {/* Mobile Layout: Compact */}
                <div className="block md:hidden space-y-2">
                  <div>
                    <p className="body-small text-on-surface-variant">Partner Item ID</p>
                    <p className="title-small text-on-surface">{scanSession.currentItem.partnerItemId}</p>
                  </div>
                  <div>
                    <p className="body-small text-on-surface-variant">Brand • Category</p>
                    <p className="title-small text-on-surface">{scanSession.currentItem.brand} • {scanSession.currentItem.category}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="body-small text-on-surface-variant">Size</p>
                      <p className="title-small text-on-surface">{scanSession.currentItem.size}</p>
                    </div>
                    <div>
                      <p className="body-small text-on-surface-variant">Color</p>
                      <p className="title-small text-on-surface">{scanSession.currentItem.color}</p>
                    </div>
                    <div>
                      <p className="body-small text-on-surface-variant">Price</p>
                      <p className="title-small text-on-surface">${scanSession.currentItem.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Desktop Layout: Grid format */}
                <div className="hidden md:block">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div>
                        <p className="body-small text-on-surface-variant">Partner Item ID</p>
                        <p className="title-small text-on-surface">{scanSession.currentItem.partnerItemId}</p>
                      </div>
                      <div>
                        <p className="body-small text-on-surface-variant">Brand • Category</p>
                        <p className="title-small text-on-surface">{scanSession.currentItem.brand} • {scanSession.currentItem.category}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="body-small text-on-surface-variant">Size • Color</p>
                        <p className="title-small text-on-surface">{scanSession.currentItem.size} • {scanSession.currentItem.color}</p>
                      </div>
                      <div>
                        <p className="body-small text-on-surface-variant">Price</p>
                        <p className="title-small text-on-surface">${scanSession.currentItem.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Scanner Status for Next Step */}
            {scanSession.step === 'scan-retailer-id' && (
              <div className="mt-3 p-3 bg-primary-container/20 rounded-lg border border-primary-container">
                <div className="flex items-center gap-2">
                  <QrCodeIcon size={16} className="text-primary" />
                  <p className="body-small text-primary">
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
        
        {/* Progress */}
        {totalItems > 0 && (
        <>
          <div className="px-4 md:px-6 py-4">
            <Card className="bg-surface-container border border-outline-variant">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="title-small text-on-surface">Progress</p>
                    <p className="body-small text-on-surface-variant">
                      {completedItems}/{totalItems}
                    </p>
                  </div>
                  <Progress value={progressPercentage} className="h-1.5" />
                  <p className="body-small text-on-surface-variant text-center">
                    {progressPercentage.toFixed(0)}% completed
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scanned Items */}
          {scannedConnections.length > 0 && (
          <div className="px-4 md:px-6 py-4">
            <Card className="bg-surface-container border border-outline-variant overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="title-small">Scanned Items ({scannedConnections.length})</CardTitle>
                <p className="body-small text-on-surface-variant">
                  Connected with retailer IDs
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {scannedConnections.map((item) => (
                  <div key={item.id} className="border-b border-outline-variant last:border-b-0">
                    <ItemCard
                      item={item as BaseItem}
                      variant="items-list"
                      showActions={false}
                      showSelection={false}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Remaining Items */}
        {itemsNeedingRetailerIds.length > 0 && (
          <div className="px-4 md:px-6 py-4">
            <Card className="bg-surface-container border border-outline-variant overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="title-small">Remaining Items ({itemsNeedingRetailerIds.length})</CardTitle>
                <p className="body-small text-on-surface-variant">
                  Waiting to be scanned
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {itemsNeedingRetailerIds.map((item) => (
                  <div key={item.id} className="border-b border-outline-variant last:border-b-0">
                    <ItemCard
                      item={item as BaseItem}
                      variant="items-list"
                      showActions={false}
                      showSelection={false}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          )}
        </>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      {scannedConnections.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface-container border-t border-outline-variant p-4 z-20 pb-safe">
          <div className="flex flex-col md:flex-row md:justify-end gap-3 md:px-2">
            <Button 
              variant="outline" 
              onClick={handleSaveScannedItems}
              className="w-full md:w-auto min-h-[48px] rounded-lg"
            >
              <span className="label-large">Save scanned items</span>
            </Button>
            
            {onRegisterOrder && orderStatus === 'pending' && (
              <Button 
                onClick={handleRegisterOrder}
                className="w-full md:w-auto min-h-[48px] bg-primary text-on-primary hover:bg-primary/90 rounded-lg"
                disabled={scannedConnections.length === 0}
              >
                <span className="label-large">Register order</span>
              </Button>
            )}
            
            {/* Delivery Note Button - Show ONLY for registered orders */}
            {onCreateDeliveryNote && orderStatus === 'registered' && (
              <Button 
                onClick={handleCreateDeliveryNote}
                className="w-full md:w-auto min-h-[48px] bg-tertiary text-on-tertiary hover:bg-tertiary/90 rounded-lg"
                disabled={scannedConnections.length === 0}
              >
                <PackageIcon size={20} className="mr-2" />
                <span className="label-large">Create delivery note</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Register Order Confirmation Dialog */}
      <AlertDialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="title-medium text-on-surface">Incomplete Order</AlertDialogTitle>
            <AlertDialogDescription className="body-medium text-on-surface-variant">
              {itemsNeedingRetailerIds.length} item{itemsNeedingRetailerIds.length !== 1 ? 's' : ''} still need retailer IDs. What would you like to do?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-4">
            <AlertDialogCancel 
              onClick={handleSaveAndContinue}
              className="min-h-[48px] w-full sm:w-auto order-2 sm:order-1 rounded-lg"
            >
              <span className="label-large">Save and continue later</span>
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmRegistration}
              className="min-h-[48px] w-full sm:w-auto bg-error text-on-error hover:bg-error/90 order-1 sm:order-2 rounded-lg"
            >
              <span className="label-large">Register and delete incomplete items</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
