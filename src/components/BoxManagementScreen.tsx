import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { VisuallyHidden } from './ui/visually-hidden';
import { SharedHeader } from './ui/shared-header';
import { StatsCard } from './ui/stats-card';
import { Section } from './ui/section';
import { EmptyState } from './ui/empty-state';
import { toast } from 'sonner@2.0.3';
import { 
  PackageIcon, 
  CheckIcon,
  TruckIcon,
  QrCodeIcon,
  PlusIcon,
  AlertTriangleIcon
} from 'lucide-react';
import { OrderItem } from './OrderCreationScreen';
import { ItemCard } from './ItemCard';
import svgPaths from "../imports/svg-8iuolkmxl8";

export interface Box {
  id: string;
  qrLabel: string;
  items: OrderItem[];
  status: 'pending' | 'registered';
  createdDate: string;
}

export interface DeliveryNote {
  id: string;
  orderId: string;
  boxes: Box[];
  status: 'registered' | 'delivered' | 'rejected';
  createdDate: string;
  shipmentDate?: string;
  partnerId?: string;
  partnerName?: string;
  warehouseId?: string;
  warehouseName?: string;
  storeId?: string;
  storeCode?: string;
}

interface BoxManagementScreenProps {
  onBack: () => void;
  orderId?: string;
  orderItems?: OrderItem[];
  onCreateDeliveryNote?: (deliveryNote: DeliveryNote) => void;
  receivingStore?: {
    name: string;
    code: string;
  };
  partnerName?: string;
  // New props for delivery notes list view
  deliveryNotes?: DeliveryNote[];
  onViewDetails?: (note: DeliveryNote) => void;
}

export default function BoxManagementScreen({
  onBack,
  orderId,
  orderItems = [],
  onCreateDeliveryNote,
  receivingStore,
  partnerName,
  deliveryNotes = [],
  onViewDetails
}: BoxManagementScreenProps) {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [currentBox, setCurrentBox] = useState<Box | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [showBoxLabelScanDialog, setShowBoxLabelScanDialog] = useState(false);
  const [showItemSelectionDialog, setShowItemSelectionDialog] = useState(false);
  const [scannedBoxLabel, setScannedBoxLabel] = useState('');
  const [scannedRetailerId, setScannedRetailerId] = useState('');
  const [deliveryNote, setDeliveryNote] = useState<DeliveryNote | null>(null);

  const unboxedItems = orderItems.filter(item => 
    !boxes.some(box => box.items.some(boxItem => boxItem.id === item.id))
  );
  const registeredBoxes = boxes.filter(box => box.status === 'registered');

  // If deliveryNotes prop is provided and orderId is not, show delivery notes list view
  if (!orderId && deliveryNotes.length >= 0 && onViewDetails) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <SharedHeader
          title="Shipments"
          subtitle="View and manage delivery notes"
          onBack={onBack}
        />
        
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
          {deliveryNotes.length === 0 ? (
            <EmptyState
              icon={<PackageIcon size={48} className="text-on-surface-variant" />}
              title="No shipments yet"
              message="Delivery notes will appear here once created"
            />
          ) : (
            <Section>
              <div className="space-y-3">
                {deliveryNotes.map((note) => (
                  <Card 
                    key={note.id} 
                    className="cursor-pointer hover:bg-surface-container-high transition-colors"
                    onClick={() => onViewDetails(note)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="title-medium text-on-surface">{note.id}</p>
                            <Badge variant={
                              note.status === 'delivered' ? 'default' : 
                              note.status === 'rejected' ? 'destructive' : 
                              'secondary'
                            }>
                              {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="body-small text-on-surface-variant">
                              Order: {note.orderId}
                            </p>
                            <p className="body-small text-on-surface-variant">
                              {note.boxes.length} {note.boxes.length === 1 ? 'box' : 'boxes'}
                            </p>
                            <p className="body-small text-on-surface-variant">
                              Created: {note.createdDate}
                            </p>
                            {note.shipmentDate && (
                              <p className="body-small text-on-surface-variant">
                                Shipped: {note.shipmentDate}
                              </p>
                            )}
                          </div>
                        </div>
                        <TruckIcon size={24} className="text-on-surface-variant" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    );
  }

  const handleCreateBox = () => {
    setShowBoxLabelScanDialog(true);
  };

  const handleCreateBoxWithLabel = () => {
    if (!scannedBoxLabel.trim()) {
      toast.error('Please scan or enter a barcode/QR code');
      return;
    }

    const newBox: Box = {
      id: `BOX-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      qrLabel: scannedBoxLabel,
      items: [],
      status: 'pending',
      createdDate: new Date().toISOString().split('T')[0]
    };

    setBoxes(prev => [...prev, newBox]);
    setScannedBoxLabel('');
    setShowBoxLabelScanDialog(false);
    toast.success(`Box "${scannedBoxLabel}" added successfully!`);
  };

  const handleOpenBoxForEditing = (box: Box) => {
    setCurrentBox(box);
    setSelectedItemIds([]);
    setShowItemSelectionDialog(true);
  };

  const handleToggleItemSelection = (itemId: string) => {
    setSelectedItemIds(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAllItems = () => {
    if (selectedItemIds.length === unboxedItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(unboxedItems.map(item => item.id));
    }
  };

  const handleAddSelectedItemsToBox = () => {
    if (!currentBox || selectedItemIds.length === 0) return;

    const selectedItems = orderItems.filter(item => selectedItemIds.includes(item.id));
    
    setBoxes(prev => prev.map(box => 
      box.id === currentBox.id 
        ? { ...box, items: [...box.items, ...selectedItems] }
        : box
    ));

    setCurrentBox(prev => prev ? { ...prev, items: [...prev.items, ...selectedItems] } : null);
    setSelectedItemIds([]);
    toast.success(`${selectedItems.length} items added to box`);
  };

  const handleRegisterBox = (box: Box) => {
    if (box.items.length === 0) {
      toast.error('Cannot register an empty box');
      return;
    }

    setBoxes(prev => prev.map(b => 
      b.id === box.id 
        ? { ...b, status: 'registered' as const }
        : b
    ));

    toast.success(`Box ${box.qrLabel} registered with ${box.items.length} items`);
  };

  const handleCreateDeliveryNote = () => {
    if (registeredBoxes.length === 0) {
      toast.error('No registered boxes to create delivery note');
      return;
    }

    if (!orderId || !onCreateDeliveryNote) {
      toast.error('Cannot create delivery note: missing order information');
      return;
    }

    const newDeliveryNote: DeliveryNote = {
      id: `DN-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      orderId,
      boxes: registeredBoxes,
      status: 'registered',
      createdDate: new Date().toISOString().split('T')[0],
      shipmentDate: new Date().toISOString().split('T')[0]
    };

    setDeliveryNote(newDeliveryNote);
    onCreateDeliveryNote(newDeliveryNote);
  };

  const handleScanRetailerId = () => {
    if (!scannedRetailerId.trim()) {
      toast.error('Please scan or enter a retailer ID');
      return;
    }

    const matchingItem = unboxedItems.find(item => 
      item.partnerItemId === scannedRetailerId ||
      item.id === scannedRetailerId
    );

    if (matchingItem) {
      const isAlreadyBoxed = boxes.some(box => 
        box.items.some(boxItem => boxItem.id === matchingItem.id)
      );

      if (isAlreadyBoxed) {
        toast.error('Item is already in a box');
        return;
      }

      handleAddItemToBox({ ...matchingItem, retailerItemId: scannedRetailerId });
    } else {
      toast.error('Item not found in this order');
    }
    
    setScannedRetailerId('');
  };

  const handleAddItemToBox = (item: OrderItem) => {
    if (!currentBox) return;

    setBoxes(prev => prev.map(box => 
      box.id === currentBox.id 
        ? { ...box, items: [...box.items, item] }
        : box
    ));

    setCurrentBox(prev => prev ? { ...prev, items: [...prev.items, item] } : null);
  };

  // Main render function
  if (deliveryNote) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <SharedHeader
          title="Delivery note created"
          subtitle={orderId ? `Order ${orderId}` : undefined}
          onBack={onBack}
        />
        
        <div className="flex-1 px-4 md:px-6 py-4 md:py-6">
          <Section>
            <Card>
              <CardHeader>
                <CardTitle className="title-medium flex items-center gap-2">
                  <TruckIcon size={20} />
                  Delivery Note Created
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="body-small text-on-surface-variant">Delivery Note ID</p>
                    <p className="title-small text-on-surface">{deliveryNote.id}</p>
                  </div>
                  <div>
                    <p className="body-small text-on-surface-variant">Status</p>
                    <Badge variant="default">Registered</Badge>
                  </div>
                  <div>
                    <p className="body-small text-on-surface-variant">Boxes</p>
                    <p className="title-small text-on-surface">{deliveryNote.boxes.length}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {deliveryNote.boxes.map((box) => (
                    <div key={box.id} className="flex items-center justify-between py-2 px-3 bg-surface-container-low rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-success-container rounded-full flex items-center justify-center">
                          <CheckIcon size={16} className="text-on-success-container" />
                        </div>
                        <div>
                          <p className="body-medium text-on-surface">{box.qrLabel}</p>
                          <p className="body-small text-on-surface-variant">
                            {box.items.length} items
                          </p>
                        </div>
                      </div>
                      <Badge variant="default">Registered</Badge>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={onBack} className="flex-1">
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <SharedHeader
        title="Delivery note details"
        subtitle={orderId ? `Order ${orderId}` : undefined}
        onBack={onBack}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="pb-24 px-4 md:px-6 py-4 md:py-6">
          {/* Delivery Information */}
          {(receivingStore || partnerName) && (
            <Section title="Delivery information" spacing="compact" className="mb-6">
              <Card>
                <CardContent className="p-4 space-y-3">
                  {partnerName && (
                    <div>
                      <p className="body-small text-on-surface-variant">From</p>
                      <p className="body-medium text-on-surface">{partnerName}</p>
                    </div>
                  )}
                  {receivingStore && (
                    <div>
                      <p className="body-small text-on-surface-variant">To</p>
                      <p className="body-medium text-on-surface">{receivingStore.name}</p>
                      <p className="body-small text-on-surface-variant">{receivingStore.code}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Section>
          )}

          {/* Order Progress Overview */}
          <Section className="mb-6">
            <div className="grid grid-cols-3 gap-4">
              <StatsCard
                label="Total items"
                value={orderItems.length}
                variant="default"
              />
              <StatsCard
                label="Boxes created"
                value={boxes.length}
                variant="primary"
              />
              <StatsCard
                label="Items remaining"
                value={unboxedItems.length}
                variant={unboxedItems.length > 0 ? "error" : "success"}
              />
            </div>
          </Section>

          {/* Packing Progress */}
          {orderItems.length > 0 && (
            <Section className="mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="body-medium text-on-surface">Packing progress</p>
                    <p className="body-small text-on-surface-variant">
                      {orderItems.length - unboxedItems.length}/{orderItems.length}
                    </p>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${((orderItems.length - unboxedItems.length) / orderItems.length) * 100}%` 
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </Section>
          )}

          {/* Boxes List */}
          <Section title={`Boxes (${boxes.length})`} className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                onClick={handleCreateBox}
                className="bg-primary hover:bg-primary/90 text-on-primary rounded-full"
              >
                <PlusIcon size={16} className="mr-2" />
                Add box
              </Button>
            </div>

            {boxes.length === 0 ? (
              <EmptyState
                icon={<PackageIcon />}
                title="No boxes added yet"
                description="Add a box to start packing items"
                actionLabel="Add box"
                onAction={handleCreateBox}
              />
            ) : (
              <div className="space-y-3">
                {boxes.map((box) => (
                  <Card key={box.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            box.status === 'registered' 
                              ? 'bg-success-container text-on-success-container'
                              : box.items.length > 0
                              ? 'bg-secondary-container text-on-secondary-container'
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}>
                            <PackageIcon size={16} />
                          </div>
                          <div>
                            <p className="title-small text-on-surface">{box.qrLabel}</p>
                            <p className="body-small text-on-surface-variant">
                              {box.items.length} {box.items.length === 1 ? 'item' : 'items'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {box.status === 'registered' ? (
                            <Badge variant="default" className="bg-success-container text-on-success-container">
                              Registered
                            </Badge>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenBoxForEditing(box)}
                                className="border-outline text-on-surface rounded-lg"
                              >
                                {box.items.length === 0 ? 'Add items' : 'Edit'}
                              </Button>
                              {box.items.length > 0 && (
                                <Button
                                  size="sm"
                                  onClick={() => handleRegisterBox(box)}
                                  className="bg-primary hover:bg-primary/90 text-on-primary rounded-lg"
                                >
                                  Register
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </Section>


        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-container border-t border-outline-variant p-4">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 border-outline text-on-surface rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateDeliveryNote}
            disabled={registeredBoxes.length === 0}
            className="flex-1 bg-primary hover:bg-primary/90 text-on-primary rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TruckIcon size={16} className="mr-2" />
            Register delivery note
          </Button>
        </div>
      </div>

      {/* Box Label Scan Dialog */}
      <Dialog open={showBoxLabelScanDialog} onOpenChange={(open) => {
        if (!open) {
          setShowBoxLabelScanDialog(false);
          setScannedBoxLabel('');
        }
      }}>
        <DialogContent className="bg-surface border border-outline-variant">
          <DialogHeader>
            <DialogTitle className="headline-small text-on-surface">Scan box label</DialogTitle>
            <DialogDescription className="body-medium text-on-surface-variant">
              Scan the barcode or QR code on your box to automatically assign a label for the box.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Active Scanner */}
            <Card>
              <CardContent className="p-4">
                <div className="relative bg-surface-variant h-64 flex items-center justify-center rounded-lg">
                  <button className="absolute inset-4 border-2 border-primary rounded-lg flex items-center justify-center hover:bg-primary/5 transition-colors">
                    <div className="w-16 h-16 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
                      <QrCodeIcon size={32} className="text-primary" />
                    </div>
                    <div 
                      className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                      onClick={() => {
                        // Simulate scanning by generating a mock barcode
                        const mockBarcode = `BOX-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
                        setScannedBoxLabel(mockBarcode);
                        toast.success(`Scanned: ${mockBarcode}`);
                      }}
                    >
                      <div className="bg-primary/90 backdrop-blur-sm rounded-lg px-4 py-2 opacity-0 hover:opacity-100 transition-opacity">
                        <span className="label-medium text-on-primary">Scan QR code or barcode</span>
                      </div>
                    </div>
                  </button>
                </div>
                
                <div className="p-4 border-t border-outline-variant bg-surface mt-4">
                  <div className="text-center">
                    <p className="body-medium text-on-surface mb-2">Scan barcode or QR code</p>
                    <p className="body-small text-on-surface-variant">
                      Position the barcode or QR code within the camera view to scan
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div>
              <label className="label-large text-on-surface block mb-2">Barcode/QR code</label>
              <Input
                value={scannedBoxLabel}
                onChange={(e) => setScannedBoxLabel(e.target.value)}
                placeholder="Scan or enter barcode/QR code"
                className="bg-surface-container-high border-outline-variant text-on-surface"
                autoFocus
              />
              <p className="body-small text-on-surface-variant mt-1">
                This will be used as the box label
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowBoxLabelScanDialog(false);
                  setScannedBoxLabel('');
                }}
                variant="outline"
                className="flex-1 border-outline text-on-surface rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateBoxWithLabel}
                className="flex-1 bg-primary hover:bg-primary/90 text-on-primary rounded-full"
              >
                Add box
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Selection Dialog */}
      <Dialog open={showItemSelectionDialog} onOpenChange={(open) => {
        setShowItemSelectionDialog(open);
        if (!open) {
          setScannedRetailerId('');
          setSelectedItemIds([]);
        }
      }}>
        <DialogContent className="bg-surface border-0 w-screen h-screen max-w-none m-0 p-0 rounded-none flex flex-col">
          <VisuallyHidden>
            <DialogTitle>Add items to {currentBox?.qrLabel}</DialogTitle>
            <DialogDescription>Scan or manually select items to add to the box</DialogDescription>
          </VisuallyHidden>
          
          {/* Header - Fixed */}
          <div className="bg-surface-container border-b border-outline-variant flex-shrink-0">
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowItemSelectionDialog(false)}
                  className="text-on-surface-variant"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Button>
                <div className="flex-1">
                  <h1 className="headline-small text-on-surface">Add items to {currentBox?.qrLabel}</h1>
                  <p className="body-small text-on-surface-variant">{unboxedItems.length} items available</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content - Takes remaining space */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {/* Scanner Section */}
              <Section title="Scan item" className="mb-6">
                {/* Active Scanner */}
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <div className="relative bg-surface-variant h-48 flex items-center justify-center rounded-lg">
                      <button className="absolute inset-4 border-2 border-primary rounded-lg flex items-center justify-center hover:bg-primary/5 transition-colors">
                        <div className="w-12 h-12 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
                          <QrCodeIcon size={24} className="text-primary" />
                        </div>
                        <div 
                          className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                          onClick={() => {
                            // Check if there are items available first
                            if (unboxedItems.length === 0) {
                              toast.error('No items available to scan');
                              return;
                            }

                            // Simulate scanning by generating a mock retailer ID
                            const mockRetailerId = `RID-${Math.random().toString(36).substring(2, 5).toUpperCase()}${Math.floor(Math.random() * 900) + 100}`;
                            
                            // Automatically select the first available unboxed item for consistent demo experience
                            const matchingItem = unboxedItems[0]; // Always take the first available item

                            if (matchingItem) {
                              // Double-check it's not already boxed (shouldn't happen with unboxedItems)
                              const isAlreadyBoxed = boxes.some(box => 
                                box.items.some(boxItem => boxItem.id === matchingItem.id)
                              );

                              if (isAlreadyBoxed) {
                                toast.error('Item is already in a box');
                                return;
                              }

                              // Add item to box automatically with the scanned retailer ID
                              handleAddItemToBox({ ...matchingItem, retailerItemId: mockRetailerId });
                              toast.success(`Scanned and added: ${mockRetailerId} - ${matchingItem.brand} ${matchingItem.category}`);
                              setScannedRetailerId(''); // Clear the input
                            } else {
                              toast.error('No items available to scan');
                            }
                          }}
                        >
                          <div className="bg-primary/90 backdrop-blur-sm rounded-lg px-4 py-2 opacity-0 hover:opacity-100 transition-opacity">
                            <span className="label-medium text-on-primary">Scan retailer ID</span>
                          </div>
                        </div>
                      </button>
                    </div>
                    
                    <div className="p-3 border-t border-outline-variant bg-surface mt-3 rounded-b-lg">
                      <div className="text-center">
                        <p className="body-medium text-on-surface mb-1">Scan item barcode or QR code</p>
                        <p className="body-small text-on-surface-variant">
                          Position the item barcode within the camera view to scan
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Input
                        value={scannedRetailerId}
                        onChange={(e) => setScannedRetailerId(e.target.value)}
                        placeholder="Scan or enter retailer ID"
                        className="flex-1"
                      />
                      <Button
                        onClick={handleScanRetailerId}
                        disabled={!scannedRetailerId.trim()}
                        className="bg-primary hover:bg-primary/90 text-on-primary rounded-full"
                      >
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Scanned Items in Current Box */}
                {currentBox && currentBox.items.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="title-medium text-on-surface flex items-center gap-2">
                        <PackageIcon size={20} />
                        Items in {currentBox.qrLabel}
                        <Badge variant="secondary" className="ml-auto">
                          {currentBox.items.length} {currentBox.items.length === 1 ? 'item' : 'items'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-2">
                        {currentBox.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                            <div className="flex-1 min-w-0">
                              <p className="title-small text-on-surface truncate">
                                {item.retailerItemId || item.partnerItemId}
                              </p>
                              <p className="body-small text-on-surface-variant">
                                {item.brand} • {item.category}
                                {item.size && ` • ${item.size}`}
                                {item.color && ` • ${item.color}`}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="title-small text-on-surface">${item.price.toFixed(2)}</p>
                              <p className="label-small text-success">Scanned</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Summary */}
                      <div className="mt-4 pt-3 border-t border-outline-variant">
                        <div className="flex justify-between items-center">
                          <span className="body-medium text-on-surface">Total value:</span>
                          <span className="title-medium text-on-surface">
                            ${currentBox.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </Section>

              {/* Items List */}
              <Section title="Available items">
                {unboxedItems.length === 0 ? (
                  <EmptyState
                    icon={<AlertTriangleIcon />}
                    title="No items available"
                    description="All items have been added to boxes"
                  />
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllItems}
                        className="border-outline text-on-surface rounded-full"
                      >
                        {selectedItemIds.length === unboxedItems.length ? 'Deselect all' : 'Select all'}
                      </Button>
                      <span className="body-small text-on-surface-variant">
                        {selectedItemIds.length} selected
                      </span>
                    </div>

                    {unboxedItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedItemIds.includes(item.id)
                            ? 'border-primary bg-primary-container/20'
                            : 'border-outline-variant hover:bg-surface-container-high'
                        }`}
                        onClick={() => handleToggleItemSelection(item.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded border-2 border-primary flex items-center justify-center">
                            {selectedItemIds.includes(item.id) && (
                              <CheckIcon size={14} className="text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="title-small text-on-surface">{item.partnerItemId}</p>
                            <p className="body-small text-on-surface-variant">
                              {item.brand} • {item.category} • ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          </div>

          {/* Fixed Bottom Actions */}
          <div className="bg-surface-container border-t border-outline-variant p-4 flex-shrink-0">
            {selectedItemIds.length > 0 ? (
              <Button
                onClick={handleAddSelectedItemsToBox}
                className="w-full bg-primary hover:bg-primary/90 text-on-primary rounded-full"
              >
                Add {selectedItemIds.length} selected {selectedItemIds.length === 1 ? 'item' : 'items'} to box
              </Button>
            ) : (
              <div className="flex gap-3 w-full">
                <Button
                  onClick={() => {
                    setShowItemSelectionDialog(false);
                    setScannedRetailerId('');
                    setSelectedItemIds([]);
                    toast.success(`Box ${currentBox?.qrLabel} saved`);
                  }}
                  variant="outline"
                  className="flex-1 border-outline text-on-surface rounded-full"
                >
                  Save & close
                </Button>
                <Button
                  onClick={() => {
                    if (!currentBox) return;
                    
                    if (currentBox.items.length === 0) {
                      toast.error('Cannot register an empty box');
                      return;
                    }

                    handleRegisterBox(currentBox);
                    setShowItemSelectionDialog(false);
                    setScannedRetailerId('');
                    setSelectedItemIds([]);
                  }}
                  disabled={!currentBox || currentBox.items.length === 0}
                  className="flex-1 bg-primary hover:bg-primary/90 text-on-primary rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckIcon size={16} className="mr-2" />
                  Register box
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}