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
  RotateCcwIcon,
  TruckIcon,
  Store,
  MapPinIcon
} from 'lucide-react';
import { OrderItem } from './OrderCreationScreen';
import ActiveScanner from './ActiveScanner';
import BoxDetailsSideSheet from './BoxDetailsSideSheet';
import BoxLabelSideSheet from './BoxLabelSideSheet';
import { ImageWithFallback, DEFAULT_IMAGE_PLACEHOLDER } from './figma/ImageWithFallback';

export interface Box {
  id: string;
  qrLabel: string;
  items: OrderItem[];
  status: 'pending' | 'registered' | 'in-transit' | 'delivered' | 'rejected' | 'cancelled';
  createdDate: string;
}

export interface DeliveryNote {
  id: string;
  orderId: string;
  boxes: Box[];
  status: 'pending' | 'packing' | 'registered' | 'delivered' | 'partially-delivered' | 'cancelled' | 'rejected';
  createdDate: string;
  registeredDate?: string;
  partnerId?: string;
  partnerName?: string;
  warehouseId?: string;
  warehouseName?: string;
  storeId?: string;
  storeCode?: string;
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
  receiverBrand?: string;
  partnerName?: string;
  warehouseName?: string;
  onOpenBoxDetails?: (box: Box) => void;
  onSaveAndClose?: (boxes?: Box[]) => void;
  isAdmin?: boolean;
  onDeleteUnassignedItem?: (itemId: string) => void;
  initialBoxes?: Box[]; // For editing existing delivery notes
  deliveryNoteId?: string; // For updating existing delivery notes
  existingCreatedDate?: string; // For preserving createdDate when updating
}

type DialogMode = 'box-label' | 'add-items' | 'scan-item' | null;

export default function DeliveryNoteCreationScreen({
  onBack,
  orderId,
  orderItems,
  onCreateDeliveryNote,
  receivingStore,
  receiverBrand,
  partnerName,
  warehouseName,
  onOpenBoxDetails,
  onSaveAndClose,
  isAdmin = false,
  onDeleteUnassignedItem,
  initialBoxes,
  deliveryNoteId,
  existingCreatedDate
}: DeliveryNoteCreationScreenProps) {
  const [boxes, setBoxes] = useState<Box[]>(initialBoxes || []);

  // Update boxes when initialBoxes changes (e.g., when navigating back from box details)
  React.useEffect(() => {
    if (initialBoxes) {
      setBoxes(initialBoxes);
    }
  }, [initialBoxes]);
  const [currentBoxId, setCurrentBoxId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [manualBoxLabel, setManualBoxLabel] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [scanMode, setScanMode] = useState<'box' | 'item' | null>(null);
  const [expandedUnassignedItems, setExpandedUnassignedItems] = useState(false);

  // Side sheet states
  const [showBoxDetailsSheet, setShowBoxDetailsSheet] = useState(false);
  const [showBoxLabelSheet, setShowBoxLabelSheet] = useState(false);
  const [boxBeingEdited, setBoxBeingEdited] = useState<Box | null>(null);
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

  const updateBoxLabel = (boxId: string, label: string) => {
    setBoxes(prev =>
      prev.map(box =>
        box.id === boxId ? { ...box, qrLabel: label } : box
      )
    );
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

    // Create final box with label and registered status
    const newBox: Box = {
      id: tempBoxId,
      qrLabel: label,
      items: currentBoxItems,
      status: 'registered',
      createdDate: new Date().toISOString()
    };

    setBoxes(prev => [...prev, newBox]);
    setShowBoxLabelSheet(false);
    setCurrentBoxItems([]);
    setTempBoxId(null);
  };

  const handleEditedBoxLabelSave = (label: string) => {
    if (!boxBeingEdited) return;
    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      toast.error('Please enter a box label');
      return;
    }

    const duplicate = boxes.some(
      (box) => box.qrLabel === trimmedLabel && box.id !== boxBeingEdited.id
    );
    if (duplicate) {
      toast.error('Box label already exists');
      return;
    }

    updateBoxLabel(boxBeingEdited.id, trimmedLabel);
    toast.success('Box label updated');
    setBoxBeingEdited(null);
  };

  // Handle cancel from box label sheet
  const handleCancelLabel = () => {
    setShowBoxLabelSheet(false);
    if (currentBoxItems.length > 0) {
      setShowBoxDetailsSheet(true);
    }
    // Optionally keep items for next attempt
    // setCurrentBoxItems([]);
    // setTempBoxId(null);
  };

  // Handle item scan (old function - kept for compatibility with existing box management)
  const handleItemScannedOld = (code: string) => {
    if (!currentBoxId) return;

    // Find item by item ID or item ID
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
          status: box.status === 'registered' ? 'registered' : (box.items.length + 1 >= 1 ? 'pending' : 'pending')
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
          status: box.status === 'registered' ? 'registered' : (box.items.length + itemsToAdd.length >= 1 ? 'pending' : 'pending')
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
          status: box.status === 'registered' ? 'registered' : (newItems.length > 0 ? 'pending' : 'pending')
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

  // Unregister box (change status from registered to pending) - only for admins
  const handleUnregisterBox = (boxId: string) => {
    setBoxes(boxes.map(box => {
      if (box.id === boxId && box.status === 'registered') {
        return { ...box, status: 'pending' };
      }
      return box;
    }));
    toast.success('Box unregistered');
  };

  // Delete box - only pending boxes can be deleted
  const handleDeleteBox = (boxId: string) => {
    const box = boxes.find(b => b.id === boxId);
    if (box && box.status !== 'pending') {
      toast.error('Only pending boxes can be deleted');
      return;
    }
    setBoxes(boxes.filter(box => box.id !== boxId));
    toast.success('Box deleted');
  };

  // Handle delete unassigned item
  const handleDeleteUnassignedItem = (itemId: string) => {
    if (onDeleteUnassignedItem) {
      onDeleteUnassignedItem(itemId);
    } else {
      // Fallback: just remove from local state if no handler provided
      toast.success('Item removed');
    }
  };

  // Handle save delivery note and close
  const handleSaveDeliveryNoteAndClose = () => {
    if (onSaveAndClose) {
      onSaveAndClose(boxes);
    } else {
      // Create delivery note with current state
      const deliveryNote: DeliveryNote = {
        id: `DN-${Date.now().toString().slice(-8)}`,
        orderId,
        boxes: boxes.map(box => ({
          ...box,
          status: box.status === 'registered' ? 'registered' : 'pending'
        })),
        status: 'pending',
        createdDate: new Date().toISOString()
      };
      onCreateDeliveryNote(deliveryNote);
      onBack();
    }
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

    // Status flow: In transit (only possible to Register if there is at least one registered box and no pending boxes)
    const registeredBoxes = boxes.filter(box => box.status === 'registered');
    const pendingBoxes = boxes.filter(box => box.status === 'pending');

    if (registeredBoxes.length === 0) {
      toast.error('At least one box must be registered before registering the delivery note');
      return;
    }

    if (pendingBoxes.length > 0) {
      toast.error('All boxes must be registered. Please register all pending boxes first.');
      return;
    }

    // Create or update delivery note
    const deliveryNote: DeliveryNote = {
      id: deliveryNoteId || `DN-${Date.now().toString().slice(-8)}`,
      orderId,
      boxes: boxes.map(box => ({
        ...box,
        status: box.status === 'registered' ? 'registered' : 'pending'
      })),
      status: 'registered',
      createdDate: deliveryNoteId && existingCreatedDate ? existingCreatedDate : new Date().toISOString(),
      registeredDate: new Date().toISOString()
    };

    onCreateDeliveryNote(deliveryNote);
  };

  return (
    <div className="min-h-screen bg-surface">
      <SharedHeader
        title="Delivery details"
        onBack={onBack}
        showBackButton={true}
      />

      <div className="px-4 md:px-6 py-6 space-y-4 pb-32">
        {/* Delivery Information Card - Same format as In transit delivery details */}
        {(warehouseName || receivingStore || receiverBrand) && (
          <Card className="bg-surface border border-outline-variant">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Leading visual */}
                <div className="w-12 h-12 bg-primary-container rounded-[12px] flex items-center justify-center flex-shrink-0">
                  <TruckIcon className="w-6 h-6 text-on-primary-container" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Supporting text - Date and Status */}
                  <div className="label-small text-on-surface-variant mb-2">
                    <span>{existingCreatedDate ? new Date(existingCreatedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}, </span>
                    <span className="label-small px-2 py-0.5 rounded-full text-on-surface-variant">
                      {deliveryNoteId ? (initialBoxes?.some(b => b.status === 'registered') ? 'Packing' : 'Pending') : 'Pending'}
                    </span>
                  </div>

                  {/* Primary text - Delivery Note ID */}
                  <h3 className="title-medium text-on-surface mb-2">
                    Delivery Note: {deliveryNoteId || `Order ${orderId}`}
                  </h3>

                  {/* Secondary text - Details */}
                  <div className="body-small text-on-surface-variant mb-3">
                    <span>Order: {orderId} • Items: {totalItems}{unassignedItems > 0 ? ` (${unassignedItems} unassigned)` : ''}</span>
                  </div>

                  {/* Sender and Receiver Information */}
                  <div className="border-t border-outline-variant pt-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Sender */}
                      {(warehouseName || partnerName) && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                              <Store size={16} />
                            </span>
                            <span className="body-small">Sender</span>
                          </div>
                          <div className="body-medium text-on-surface">
                            {warehouseName || partnerName}
                          </div>
                          {warehouseName && partnerName && (
                            <div className="body-small text-on-surface-variant">
                              {partnerName}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Receiver */}
                      {(receivingStore || receiverBrand) && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <span className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                              <MapPinIcon size={16} />
                            </span>
                            <span className="body-small">Receiver</span>
                          </div>
                          <div className="body-medium text-on-surface">
                            {receivingStore?.name || receiverBrand || '—'}
                          </div>
                          {receiverBrand && receivingStore?.name && (
                            <div className="body-small text-on-surface-variant">
                              {receiverBrand}
                            </div>
                          )}
                          {receivingStore?.code && (
                            <div className="body-small text-on-surface-variant">
                              {receivingStore.code}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Boxes List */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="title-medium text-on-surface">Boxes ({boxes.length})</h3>
          <Button
            onClick={handleAddBox}
            className="bg-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 text-on-primary transition-colors min-h-[48px] md:min-h-0 px-4 py-3"
            size="lg"
          >
            <PlusIcon size={20} className="mr-2" />
            <span className="label-large">Add box</span>
          </Button>
        </div>

        {boxes.length > 0 ? (
          <div className="space-y-2">
            {boxes.map((box) => {
              const boxDate = new Date(box.createdDate).toISOString().split('T')[0];

              return (
                <Card
                  key={box.id}
                  className="border-outline cursor-pointer hover:bg-primary-container/80 transition-colors bg-primary-container"
                  onClick={() => {
                    if (onOpenBoxDetails) {
                      onOpenBoxDetails(box);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-primary-container rounded-lg flex-shrink-0">
                          <BoxIcon className="w-5 h-5 text-on-primary-container" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* Date and Status */}
                          <div className="label-small text-on-surface-variant mb-1">
                            {boxDate} • {box.status === 'registered' ? 'Registered' : box.status === 'pending' ? 'Packing' : box.status === 'in-transit' ? 'In Transit' : box.status === 'delivered' ? 'Delivered' : box.status === 'rejected' ? 'Rejected' : box.status === 'cancelled' ? 'Cancelled' : box.status}
                          </div>
                          {/* Box Label */}
                          {box.status !== 'pending' && (
                            <div className="body-medium text-on-surface mb-1">
                              <span className="label-small text-on-surface-variant">Box Label: </span>
                              {box.qrLabel}
                            </div>
                          )}
                          {/* Box ID */}
                          <div className="label-small text-on-surface-variant">
                            <span className="label-small text-on-surface-variant">Box ID: </span>
                            {box.id}
                          </div>
                          {/* Items count */}
                          <div className="flex items-center gap-2 flex-wrap mt-1">
                            <span className="body-small text-on-surface-variant">
                              {box.items.length} {box.items.length === 1 ? 'item' : 'items'}
                            </span>
                          </div>
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
                          {box.status === 'registered' && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setBoxBeingEdited(box);
                              }}
                            >
                              <EditIcon className="mr-2 h-4 w-4" />
                              Edit box label
                            </DropdownMenuItem>
                          )}
                          {box.status === 'registered' && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleUnregisterBox(box.id);
                            }}>
                              <RotateCcwIcon className="mr-2 h-4 w-4" />
                              Unregister
                            </DropdownMenuItem>
                          )}
                          {box.status === 'pending' && (
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
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                icon={<PackageIcon size={48} className="text-on-surface-variant" />}
                title="No boxes added yet"
                description="Click Add box to start packing items"
              />
            </CardContent>
          </Card>
        )}

        {/* Unassigned Items List */}
        {availableItems.length > 0 && (
          <Card className="border-error">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="title-medium text-error">
                  Unassigned Items ({availableItems.length})
                </CardTitle>
                {availableItems.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedUnassignedItems(!expandedUnassignedItems)}
                  >
                    <span className="label-medium">
                      {expandedUnassignedItems ? 'Show less' : 'Show all'}
                    </span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(expandedUnassignedItems ? availableItems : availableItems.slice(0, 5)).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-error-container/10 rounded-lg border border-error/20">
                    {/* Item Image */}
                    <div className="flex-shrink-0 w-16 h-16 bg-surface-container rounded-lg overflow-hidden border border-outline-variant">
                      <ImageWithFallback
                        src={item.image || item.thumbnail || DEFAULT_IMAGE_PLACEHOLDER}
                        alt={item.itemId || item.partnerItemId || ''}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <p className="title-small text-on-surface mb-1">{item.itemId || item.partnerItemId}</p>
                      <p className="body-small text-on-surface-variant mb-1">
                        {item.brand} • {item.category}
                        {item.retailerItemId && ` • ${item.retailerItemId}`}
                      </p>
                      {item.price && (
                        <p className="body-medium text-on-surface">
                          {item.price} SEK
                        </p>
                      )}
                    </div>
                    {/* Admin Delete Option */}
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical size={16} className="text-on-surface-variant" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteUnassignedItem(item.id)}
                            className="text-error focus:text-error"
                          >
                            <Trash2Icon className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-container border-t border-outline-variant p-4 z-20 pb-safe">
        <div className="flex flex-row md:justify-end gap-3 md:px-2">
          <div className="hidden md:flex items-center gap-2 text-on-surface-variant body-small md:mr-auto">
            <PackageIcon size={16} />
            <span>{assignedItems} of {totalItems} items in {boxes.length} box{boxes.length !== 1 ? 'es' : ''}</span>
          </div>

          <div className="flex flex-row gap-3 flex-1 md:flex-initial max-w-md md:max-w-none md:mx-0">
            <Button
              variant="outline"
              onClick={handleSaveDeliveryNoteAndClose}
              className="flex-1 border-outline text-on-surface hover:bg-surface-container-high transition-colors px-6 py-3 rounded-lg h-[56px]"
            >
              <span className="label-large">Save & Close</span>
            </Button>

            <Button
              onClick={handleRegisterDelivery}
              disabled={boxes.length === 0 || unassignedItems > 0 || boxes.some(box => box.items.length === 0)}
              className="flex-1 bg-primary text-on-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 transition-colors px-6 py-3 rounded-lg h-[56px]"
            >
              <CheckIcon size={20} className="mr-2" />
              <span className="label-large">Register Delivery</span>
            </Button>
          </div>
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
          showBackButton
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
          showBackButton
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

      <BoxLabelSideSheet
        isOpen={Boolean(boxBeingEdited)}
        onOpenChange={(open) => {
          if (!open) {
            setBoxBeingEdited(null);
          }
        }}
        onSubmit={handleEditedBoxLabelSave}
        onCancel={() => setBoxBeingEdited(null)}
        initialLabel={boxBeingEdited?.qrLabel}
        title="Edit Box Label"
        description="Update the label used for this box"
        primaryActionLabel="Save label"
        showBackButton={false}
      />
    </div>
  );
}

