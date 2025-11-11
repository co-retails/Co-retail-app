import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { SharedHeader } from './ui/shared-header';
import { Section } from './ui/section';
import { EmptyState } from './ui/empty-state';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner@2.0.3';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { 
  PackageIcon, 
  CheckIcon,
  ScanIcon,
  PlusIcon,
  AlertTriangleIcon,
  BoxIcon,
  XIcon,
  EditIcon,
  QrCodeIcon,
  MoreVertical,
  Trash2Icon,
  RotateCcwIcon
} from 'lucide-react';
import { OrderItem } from './OrderCreationScreen';
import ActiveScanner from './ActiveScanner';
import BoxDetailsSideSheet from './BoxDetailsSideSheet';
import BoxLabelSideSheet from './BoxLabelSideSheet';

export interface Box {
  id: string;
  qrLabel: string;
  items: OrderItem[];
  status: 'pending' | 'complete';
  createdDate: string;
}

export interface DeliveryNote {
  id: string;
  orderId: string;
  boxes: Box[];
  status: 'pending' | 'registered' | 'in-transit' | 'delivered';
  createdDate: string;
  registeredDate?: string;
}

interface DeliveryNoteCreationScreenProps {
  onBack: () => void;
  orderId: string;
  orderItems: OrderItem[];
  onCreateDeliveryNote: (deliveryNote: DeliveryNote) => void;
  receivingStore?: {
    name: string;
    code: string;
  };
  partnerName?: string;
  onOpenBoxDetails?: (box: Box) => void;
}

type DialogMode = 'box-label' | 'add-items' | 'scan-item' | null;

export default function DeliveryNoteCreationScreen({
  onBack,
  orderId,
  orderItems,
  onCreateDeliveryNote,
  receivingStore,
  partnerName,
  onOpenBoxDetails
}: DeliveryNoteCreationScreenProps) {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [currentBoxId, setCurrentBoxId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [manualBoxLabel, setManualBoxLabel] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [scanMode, setScanMode] = useState<'box' | 'item' | null>(null);
  
  // Side sheet states
  const [showBoxDetailsSheet, setShowBoxDetailsSheet] = useState(false);
  const [showBoxLabelSheet, setShowBoxLabelSheet] = useState(false);
  const [currentBoxItems, setCurrentBoxItems] = useState<OrderItem[]>([]);
  const [tempBoxId, setTempBoxId] = useState<string | null>(null);

  // Calculate statistics
  const totalItems = orderItems.length;
  const assignedItems = boxes.flatMap(box => box.items).length;
  const unassignedItems = totalItems - assignedItems;
  const completeBoxes = boxes.filter(box => box.items.length > 0).length;

  // Get unassigned items (not in any box yet)
  const availableItems = orderItems.filter(item => 
    !boxes.some(box => box.items.some(boxItem => boxItem.id === item.id))
  );

  // Handle box label scan
  const handleBoxLabelScanned = (code: string) => {
    setScanMode(null);
    
    // Check if box label already exists
    const existingBox = boxes.find(box => box.qrLabel === code);
    if (existingBox) {
      toast.error('Box label already exists');
      return;
    }

    // Create new box
    const newBox: Box = {
      id: `box-${Date.now()}`,
      qrLabel: code,
      items: [],
      status: 'pending',
      createdDate: new Date().toISOString()
    };

    setBoxes([...boxes, newBox]);
    toast.success(`Box ${code} added`);
  };

  // Handle manual box label entry
  const handleAddBoxManually = () => {
    if (!manualBoxLabel.trim()) {
      toast.error('Please enter a box label');
      return;
    }

    // Check if box label already exists
    const existingBox = boxes.find(box => box.qrLabel === manualBoxLabel.trim());
    if (existingBox) {
      toast.error('Box label already exists');
      return;
    }

    // Create new box
    const newBox: Box = {
      id: `box-${Date.now()}`,
      qrLabel: manualBoxLabel.trim(),
      items: [],
      status: 'pending',
      createdDate: new Date().toISOString()
    };

    setBoxes([...boxes, newBox]);
    setManualBoxLabel('');
    setDialogMode(null);
    toast.success(`Box ${newBox.qrLabel} added`);
  };

  // Handle add box - opens box details side sheet
  const handleAddBox = () => {
    const newBoxId = `box-${Date.now()}`;
    setTempBoxId(newBoxId);
    setCurrentBoxItems([]);
    setShowBoxDetailsSheet(true);
  };

  // Handle item scanned in box details
  const handleItemScanned = (item: OrderItem) => {
    setCurrentBoxItems(prev => {
      if (prev.some(i => i.id === item.id)) {
        toast.error('Item already in box');
        return prev;
      }
      return [...prev, item];
    });
  };

  // Handle mark as scanned
  const handleMarkAsScanned = (item: OrderItem) => {
    handleItemScanned(item);
  };

  // Handle save and close from box details
  const handleSaveAndClose = () => {
    if (tempBoxId && currentBoxItems.length > 0) {
      // Create temporary box without label
      const tempBox: Box = {
        id: tempBoxId,
        qrLabel: `TEMP-${tempBoxId.slice(-6)}`,
        items: currentBoxItems,
        status: 'pending',
        createdDate: new Date().toISOString()
      };
      setBoxes(prev => [...prev, tempBox]);
    }
    setShowBoxDetailsSheet(false);
    setCurrentBoxItems([]);
    setTempBoxId(null);
  };

  // Handle continue from box details - opens box label sheet
  const handleContinueToLabel = () => {
    if (currentBoxItems.length === 0) {
      toast.error('Please add at least one item to the box');
      return;
    }
    setShowBoxDetailsSheet(false);
    setShowBoxLabelSheet(true);
  };

  // Handle register box with label
  const handleRegisterBox = (label: string) => {
    if (!tempBoxId) return;

    // Check if box label already exists
    const existingBox = boxes.find(box => box.qrLabel === label);
    if (existingBox) {
      toast.error('Box label already exists');
      return;
    }

    // Create final box with label
    const newBox: Box = {
      id: tempBoxId,
      qrLabel: label,
      items: currentBoxItems,
      status: 'pending',
      createdDate: new Date().toISOString()
    };

    setBoxes(prev => [...prev, newBox]);
    setShowBoxLabelSheet(false);
    setCurrentBoxItems([]);
    setTempBoxId(null);
    toast.success(`Box ${label} registered`);
  };

  // Handle cancel from box label sheet
  const handleCancelLabel = () => {
    setShowBoxLabelSheet(false);
    // Optionally keep items for next attempt
    // setCurrentBoxItems([]);
    // setTempBoxId(null);
  };

  // Handle item scan (old function - kept for compatibility with existing box management)
  const handleItemScannedOld = (code: string) => {
    if (!currentBoxId) return;

    // Find item by retailer ID or item ID
    const item = availableItems.find(
      item => item.retailerItemId === code || item.itemId === code || item.partnerItemId === code
    );

    if (!item) {
      toast.error('Item not found or already assigned');
      return;
    }

    // Add item to current box
    setBoxes(boxes.map(box => {
      if (box.id === currentBoxId) {
        return {
          ...box,
          items: [...box.items, item],
          status: box.items.length + 1 >= 1 ? 'complete' : 'pending'
        };
      }
      return box;
    }));

    toast.success(`Item ${item.itemId} added to box`);
  };

  // Handle manual item selection
  const handleAddItemsManually = () => {
    if (!currentBoxId || selectedItemIds.length === 0) return;

    const itemsToAdd = availableItems.filter(item => selectedItemIds.includes(item.id));

    setBoxes(boxes.map(box => {
      if (box.id === currentBoxId) {
        return {
          ...box,
          items: [...box.items, ...itemsToAdd],
          status: box.items.length + itemsToAdd.length >= 1 ? 'complete' : 'pending'
        };
      }
      return box;
    }));

    setSelectedItemIds([]);
    setDialogMode(null);
    toast.success(`${itemsToAdd.length} item(s) added to box`);
  };

  // Remove item from box
  const handleRemoveItemFromBox = (boxId: string, itemId: string) => {
    setBoxes(boxes.map(box => {
      if (box.id === boxId) {
        const newItems = box.items.filter(item => item.id !== itemId);
        return {
          ...box,
          items: newItems,
          status: newItems.length > 0 ? 'complete' : 'pending'
        };
      }
      return box;
    }));
    toast.success('Item removed from box');
  };

  // Remove box
  const handleRemoveBox = (boxId: string) => {
    setBoxes(boxes.filter(box => box.id !== boxId));
    toast.success('Box removed');
  };

  // Unregister box (change status from registered/complete to pending)
  const handleUnregisterBox = (boxId: string) => {
    setBoxes(boxes.map(box => {
      if (box.id === boxId) {
        return { ...box, status: 'pending' };
      }
      return box;
    }));
    toast.success('Box unregistered');
  };

  // Delete box
  const handleDeleteBox = (boxId: string) => {
    setBoxes(boxes.filter(box => box.id !== boxId));
    toast.success('Box deleted');
  };

  // Register delivery note
  const handleRegisterDelivery = () => {
    // Validation
    if (boxes.length === 0) {
      toast.error('Please add at least one box');
      return;
    }

    const emptyBoxes = boxes.filter(box => box.items.length === 0);
    if (emptyBoxes.length > 0) {
      toast.error(`${emptyBoxes.length} box(es) have no items. Please add items or remove empty boxes.`);
      return;
    }

    if (unassignedItems > 0) {
      toast.error(`${unassignedItems} item(s) not assigned to any box. Please assign all items.`);
      return;
    }

    // Create delivery note
    const deliveryNote: DeliveryNote = {
      id: `DN-${Date.now().toString().slice(-8)}`,
      orderId,
      boxes: boxes.map(box => ({
        ...box,
        status: 'complete'
      })),
      status: 'registered',
      createdDate: new Date().toISOString(),
      registeredDate: new Date().toISOString()
    };

    onCreateDeliveryNote(deliveryNote);
    toast.success('Delivery note registered successfully');
  };

  return (
    <div className="min-h-screen bg-surface">
      <SharedHeader 
        title="Create Delivery Note"
        subtitle={`Order ${orderId}`}
        onBack={onBack}
        showBackButton={true}
      />

      <div className="px-4 md:px-6 py-6 space-y-6 pb-32">
        {/* Order Info */}
        <Card className="bg-surface-container-low border-outline">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="label-small text-on-surface-variant mb-1">Total Items</p>
                <p className="title-medium text-on-surface">{totalItems}</p>
              </div>
              <div>
                <p className="label-small text-on-surface-variant mb-1">Assigned</p>
                <p className="title-medium text-primary">{assignedItems}</p>
              </div>
              <div>
                <p className="label-small text-on-surface-variant mb-1">Unassigned</p>
                <p className="title-medium text-error">{unassignedItems}</p>
              </div>
              <div>
                <p className="label-small text-on-surface-variant mb-1">Boxes</p>
                <p className="title-medium text-on-surface">{completeBoxes} / {boxes.length}</p>
              </div>
            </div>
            {receivingStore && (
              <>
                <div className="mt-4 pt-4 border-t border-outline-variant">
                  <p className="label-small text-on-surface-variant mb-1">Receiving Store</p>
                  <p className="body-medium text-on-surface">{receivingStore.name}</p>
                  <p className="body-small text-on-surface-variant">{receivingStore.code}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Unassigned Items Alert */}
        {unassignedItems > 0 && (
          <Alert>
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription className="body-small">
              {unassignedItems} item(s) need to be assigned to boxes before registration
            </AlertDescription>
          </Alert>
        )}

        {/* Add Box Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="title-medium">Boxes</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddBox}
              >
                <PlusIcon size={16} className="mr-2" />
                <span className="label-medium">Add box</span>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Boxes List */}
        {boxes.length > 0 ? (
          <Section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="title-medium text-on-surface">Boxes ({boxes.length})</h3>
            </div>

            <div className="space-y-4">
              {boxes.map((box) => (
                <Card 
                  key={box.id} 
                  className="border-outline cursor-pointer hover:bg-surface-container-high transition-colors"
                  onClick={() => {
                    if (onOpenBoxDetails) {
                      onOpenBoxDetails(box);
                    }
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary-container rounded-lg">
                          <BoxIcon className="w-5 h-5 text-on-primary-container" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="title-small text-on-surface">{box.qrLabel}</p>
                            <Badge 
                              variant={box.items.length > 0 ? 'default' : 'outline'}
                              className="body-small"
                            >
                              {box.items.length} items
                            </Badge>
                          </div>
                          {box.items.length === 0 && (
                            <p className="body-small text-on-surface-variant">
                              No items added yet
                            </p>
                          )}
                        </div>
                      </div>
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
                          {box.status === 'complete' && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleUnregisterBox(box.id);
                            }}>
                              <RotateCcwIcon className="mr-2 h-4 w-4" />
                              Unregister
                            </DropdownMenuItem>
                          )}
                          {(box.status === 'pending' || box.status === 'complete') && (
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBox(box.id);
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
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Box summary - no items shown here, click to open box details */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="body-small">
                          {box.items.length} {box.items.length === 1 ? 'item' : 'items'}
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>
        ) : (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                icon={<PackageIcon size={48} className="text-on-surface-variant" />}
                title="No boxes added yet"
                description="Scan or enter box labels to start packing items"
              />
            </CardContent>
          </Card>
        )}

        {/* Unassigned Items List */}
        {availableItems.length > 0 && (
          <Card className="border-error">
            <CardHeader>
              <CardTitle className="title-medium text-error">
                Unassigned Items ({availableItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {availableItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-3 bg-error-container/10 rounded-lg border border-error/20">
                    <p className="title-small text-on-surface">{item.itemId}</p>
                    <p className="body-small text-on-surface-variant">
                      {item.brand} • {item.category}
                      {item.retailerItemId && ` • ${item.retailerItemId}`}
                    </p>
                  </div>
                ))}
                {availableItems.length > 5 && (
                  <p className="body-small text-on-surface-variant text-center pt-2">
                    + {availableItems.length - 5} more items
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-container border-t border-outline-variant p-4 z-20 pb-safe">
        <div className="flex flex-col md:flex-row md:justify-end gap-3 md:px-2">
          <div className="flex items-center gap-2 text-on-surface-variant body-small md:mr-auto">
            <PackageIcon size={16} />
            <span>{assignedItems} of {totalItems} items in {boxes.length} box(es)</span>
          </div>
          
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full md:w-auto"
          >
            <span className="label-large">Cancel</span>
          </Button>
          
          <Button
            onClick={handleRegisterDelivery}
            disabled={boxes.length === 0 || unassignedItems > 0 || boxes.some(box => box.items.length === 0)}
            className="w-full md:w-auto bg-primary text-on-primary"
          >
            <CheckIcon size={20} className="mr-2" />
            <span className="label-large">Register Delivery</span>
          </Button>
        </div>
      </div>

      {/* Manual Box Label Entry Dialog */}
      <Dialog open={dialogMode === 'box-label'} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="title-large">Enter Box Label</DialogTitle>
            <DialogDescription className="body-medium">
              Type or paste the box label/QR code
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="label-medium">Box Label</Label>
              <Input
                value={manualBoxLabel}
                onChange={(e) => setManualBoxLabel(e.target.value)}
                placeholder="e.g., BOX-001"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && manualBoxLabel.trim()) {
                    handleAddBoxManually();
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setManualBoxLabel('');
                setDialogMode(null);
              }}
            >
              <span className="label-large">Cancel</span>
            </Button>
            <Button
              onClick={handleAddBoxManually}
              disabled={!manualBoxLabel.trim()}
              className="bg-primary text-on-primary"
            >
              <span className="label-large">Add Box</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Item Selection Dialog */}
      <Dialog open={dialogMode === 'add-items'} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="title-large">Select Items to Add</DialogTitle>
            <DialogDescription className="body-medium">
              Choose items to add to this box
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {availableItems.length === 0 ? (
              <EmptyState
                icon={<PackageIcon size={48} className="text-on-surface-variant" />}
                title="No items available"
                description="All items have been assigned to boxes"
              />
            ) : (
              <div className="space-y-2">
                {availableItems.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-outline hover:bg-surface-container-high cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedItemIds.includes(item.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedItemIds([...selectedItemIds, item.id]);
                        } else {
                          setSelectedItemIds(selectedItemIds.filter(id => id !== item.id));
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="title-small text-on-surface">{item.itemId}</p>
                      <p className="body-small text-on-surface-variant">
                        {item.brand} • {item.gender} • {item.category}
                        {item.retailerItemId && ` • ${item.retailerItemId}`}
                      </p>
                      {item.price && (
                        <p className="body-small text-on-surface-variant mt-1">
                          {item.price} SEK
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedItemIds([]);
                setDialogMode(null);
              }}
            >
              <span className="label-large">Cancel</span>
            </Button>
            <Button
              onClick={handleAddItemsManually}
              disabled={selectedItemIds.length === 0}
              className="bg-primary text-on-primary"
            >
              <span className="label-large">Add {selectedItemIds.length} Item(s)</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scanner for Box Labels */}
      {scanMode === 'box' && (
        <ActiveScanner
          onScan={handleBoxLabelScanned}
          onClose={() => setScanMode(null)}
          title="Scan Box Label"
          instructionText="Position the box QR code within the frame"
          mode="box"
        />
      )}

      {/* Scanner for Items */}
      {scanMode === 'item' && (
        <ActiveScanner
          onScan={handleItemScannedOld}
          onClose={() => {
            setScanMode(null);
            setCurrentBoxId(null);
          }}
          title="Scan Item"
          instructionText="Scan item barcode or QR code to add to box"
          mode="item"
        />
      )}

      {/* Box Details Side Sheet */}
      <BoxDetailsSideSheet
        isOpen={showBoxDetailsSheet}
        onOpenChange={setShowBoxDetailsSheet}
        orderItems={availableItems}
        scannedItems={currentBoxItems}
        onItemScanned={handleItemScanned}
        onMarkAsScanned={handleMarkAsScanned}
        onSaveAndClose={handleSaveAndClose}
        onContinue={handleContinueToLabel}
      />

      {/* Box Label Side Sheet */}
      <BoxLabelSideSheet
        isOpen={showBoxLabelSheet}
        onOpenChange={setShowBoxLabelSheet}
        onRegisterBox={handleRegisterBox}
        onCancel={handleCancelLabel}
      />
    </div>
  );
}
