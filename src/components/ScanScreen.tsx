import { useMemo, useState, useEffect } from 'react';
import { ItemCard, BaseItem, ItemQuickAction } from './ItemCard';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Archive, Edit3, Check, MoreVertical } from "lucide-react";
import ItemDetailsDialog, { ItemDetails, StatusHistoryEntry } from './ItemDetailsDialog';
import { StatusUpdateDialog, ItemStatus as StatusUpdateItemStatus } from './StatusUpdateDialog';
import { UserRole } from './ItemCard';
import { toast } from 'sonner';
import svgPaths from "../imports/svg-7un8q74kd7";
import { getSekPriceOptions } from '../data/partnerPricing';

export interface ScannedItem extends BaseItem {
  selected: boolean;
  color?: string;
  statusHistory?: StatusHistoryEntry[];
}

interface ScanScreenProps {
  onNavigateToHome?: () => void;
  onNavigateToItems?: () => void;
  onNavigateToSellers?: () => void;
  onNavigateToShipping?: () => void;
  onNavigateToReturns?: () => void;
  userRole?: UserRole;
  currentPartnerWarehouseSelection?: { partnerId: string; warehouseId: string };
}

const getTodayString = () => {
  const iso = new Date().toISOString();
  const separatorIndex = iso.indexOf('T');
  return separatorIndex === -1 ? iso : iso.slice(0, separatorIndex);
};

import CameraScanner from './CameraScanner';

function ScanViewer({ onScan }: { 
  onScan: (result: string) => void;
}) {
  return (
    <div className="sticky top-0 md:top-16 mx-4 md:mx-6 mt-4 mb-4 z-[90]">
      <CameraScanner
        onScan={onScan}
        scanMessage="Tap to scan items"
        autoStart={true}
        enableFakeScan={true}
        height="16rem"
      />
    </div>
  );
}

function MultiSelectActions({ selectedCount, totalCount, isAllSelected, onSelectAll, onArchive, onBulkEdit }: {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  onSelectAll: () => void;
  onArchive: () => void;
  onBulkEdit: () => void;
}) {
  // Don't show if there are no items
  if (totalCount === 0) return null;

  const hasSelectedItems = selectedCount > 0;

  return (
    <div className="border-t border-outline-variant">
      <div className="flex items-center justify-between px-1 py-3">
        {/* Left side - Select all and count */}
        <div className="flex items-center gap-3">
          <button 
            className="p-3 rounded-lg hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
            onClick={onSelectAll}
            aria-label={isAllSelected ? "Deselect all items" : "Select all items"}
          >
            <div className="relative w-6 h-6">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
                <path 
                  clipRule="evenodd" 
                  d={isAllSelected ? svgPaths.p181a1800 : svgPaths.p3e435600} 
                  fill={isAllSelected ? "var(--primary)" : "var(--outline-variant)"} 
                  fillRule="evenodd" 
                />
              </svg>
              {isAllSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="w-4 h-4 text-on-primary" />
                </div>
              )}
            </div>
          </button>
          
          <div className="title-small text-on-surface">
            {hasSelectedItems 
              ? `${selectedCount} selected`
              : `${totalCount} ${totalCount === 1 ? 'item' : 'items'}`
            }
          </div>
        </div>
        
        {/* Right side - Actions (only show when items are selected) */}
        {hasSelectedItems && (
        <div className="flex items-center gap-2">
          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
                aria-label="More actions"
              >
                <MoreVertical className="w-5 h-5 text-on-surface" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onBulkEdit}>
                <Edit3 className="mr-2 h-4 w-4" />
                <span>Bulk edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onArchive}>
                <Archive className="mr-2 h-4 w-4" />
                <span>Archive selected</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        )}
      </div>
    </div>
  );
}

function BulkEditModal({ isOpen, onClose, selectedItems, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: ScannedItem[];
  onSave: (updates: Partial<ScannedItem>) => void;
}) {
  const [formData, setFormData] = useState({
    status: 'none',
    category: '',
    priceReduction: 'none',
    comment: ''
  });
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSave = () => {
    const updates: Partial<ScannedItem> = {};
    if (formData.status !== 'none') updates.status = formData.status;
    if (formData.category) updates.category = formData.category;
    if (formData.priceReduction !== 'none') {
      const reductionPercent = parseFloat(formData.priceReduction);
      // Store the reduction percentage - the actual price calculation will be done in handleBulkEditSave
      (updates as any).priceReduction = reductionPercent;
    }
    if (formData.comment) {
      (updates as any).comment = formData.comment;
    }
    
    onSave(updates);
    setFormData({ status: 'none', category: '', priceReduction: 'none', comment: '' });
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"} 
        className="bg-surface border-outline-variant p-0 flex flex-col md:max-w-[400px] md:h-full max-h-[85vh] md:max-h-full"
      >
        {/* Header - Fixed */}
        <SheetHeader className="border-b border-outline-variant px-4 pt-6 pb-4 pr-12 flex-shrink-0">
          <SheetTitle className="title-large text-on-surface">
            Bulk Edit Items
          </SheetTitle>
          <SheetDescription className="body-medium text-on-surface-variant">
            Edit properties for {selectedItems.length} selected items. Only filled fields will be updated.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Status Field */}
          <div className="space-y-2">
            <Label htmlFor="status" className="label-large text-on-surface">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: string) =>
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-full bg-surface-container-high border border-outline rounded-lg min-h-[48px] body-large">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No change</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="To return">To return</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
                <SelectItem value="In Store 2nd try">In Store 2nd try</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Category Field */}
          <div className="space-y-2">
            <Label htmlFor="category" className="label-large text-on-surface">
              Category
            </Label>
            <Select
              value={formData.category || 'none'}
              onValueChange={(value: string) =>
                setFormData(prev => ({ ...prev, category: value === 'none' ? '' : value }))
              }
            >
              <SelectTrigger className="w-full bg-surface-container-high border border-outline rounded-lg min-h-[48px] body-large">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No change</SelectItem>
                <SelectItem value="Tops">Tops</SelectItem>
                <SelectItem value="Bottoms">Bottoms</SelectItem>
                <SelectItem value="Dresses">Dresses</SelectItem>
                <SelectItem value="Outerwear">Outerwear</SelectItem>
                <SelectItem value="Shoes">Shoes</SelectItem>
                <SelectItem value="Accessories">Accessories</SelectItem>
                <SelectItem value="Hoodie">Hoodie</SelectItem>
                <SelectItem value="Shorts">Shorts</SelectItem>
                <SelectItem value="Trousers">Trousers</SelectItem>
                <SelectItem value="Jackets">Jackets</SelectItem>
                <SelectItem value="Skirts">Skirts</SelectItem>
                <SelectItem value="Knitwear">Knitwear</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Price % Reduction Field */}
          <div className="space-y-2">
            <Label htmlFor="priceReduction" className="label-large text-on-surface">
              Price % reduction
            </Label>
            <Select
              value={formData.priceReduction}
              onValueChange={(value: string) =>
                setFormData(prev => ({ ...prev, priceReduction: value }))
              }
            >
              <SelectTrigger className="w-full bg-surface-container-high border border-outline rounded-lg min-h-[48px] body-large">
                <SelectValue placeholder="Select reduction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No change</SelectItem>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="20">20%</SelectItem>
                <SelectItem value="30">30%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Comment Field */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="label-large text-on-surface">
              Comment (optional)
            </Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              className="w-full bg-surface-container-high border border-outline rounded-lg min-h-[80px] body-large resize-none"
              placeholder="Add a comment..."
              rows={3}
            />
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <SheetFooter className="border-t border-outline-variant px-4 pt-4 pb-6 flex-shrink-0 flex-row gap-3">
          <Button 
            variant="outline" 
            size="lg"
            onClick={onClose}
            className="flex-1 bg-surface border border-outline text-on-surface hover:bg-surface-container-high rounded-lg min-h-[48px] label-large touch-manipulation"
          >
            Cancel
          </Button>
          <Button 
            size="lg"
            onClick={handleSave}
            className="flex-1 bg-primary hover:bg-primary/90 text-on-primary rounded-lg min-h-[48px] label-large touch-manipulation"
          >
            Update items
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function ScannedItemsSection({ items, onClearItems, onToggleSelect, onMoreActions, onClick, userRole, onSelectAll, selectedCount, totalCount, isAllSelected, onArchive, onBulkEdit }: {
  items: ScannedItem[];
  onClearItems: () => void;
  onToggleSelect: (itemId: string) => void;
  onMoreActions: (item: BaseItem, action: 'in-store' | 'store-transfer' | 'sold' | 'missing' | 'broken' | 'rejected' | 'in-store-2nd-try') => void;
  onClick: (item: BaseItem) => void;
  userRole: UserRole;
  onSelectAll: () => void;
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  onArchive: () => void;
  onBulkEdit: () => void;
}) {
  return (
    <div className="flex-1 pb-20">
      {/* Tab-like Header */}
      <div className="bg-surface border-b border-outline-variant">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <div className="title-small text-on-surface">
            Scanned items ({items.length})
          </div>
          
          {items.length > 0 && (
            <button 
              className="text-error hover:bg-error-container/10 focus:bg-error-container/10 active:bg-error-container/20 transition-colors px-3 py-1.5 rounded-[16px] min-h-[32px] label-large"
              onClick={onClearItems}
            >
              Clear all
            </button>
          )}
        </div>
      </div>
      
      {/* Multi-select Actions */}
      <MultiSelectActions 
        selectedCount={selectedCount}
        totalCount={totalCount}
        isAllSelected={isAllSelected}
        onSelectAll={onSelectAll}
        onArchive={onArchive}
        onBulkEdit={onBulkEdit}
      />
      
      {/* Content Area - M3 Grid: 16px mobile, 24px tablet+ */}
      <div className="pt-4 md:pt-6">
        {/* Items list */}
        {items.length > 0 ? (
          <div className="mx-4 md:mx-6 mb-4">
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <div key={item.id} className="bg-surface-container border border-outline-variant rounded-[12px] overflow-hidden">
                  <ItemCard 
                    item={item}
                    onToggleSelect={onToggleSelect}
                    onMoreActions={onMoreActions}
                    onClick={(baseItem) => onClick(baseItem)}
                    showActions={true}
                    showSelection={true}
                    userRole={userRole}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <svg className="w-16 h-16 text-on-surface-variant mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M12 12v4.01M12 12V7.99" />
            </svg>
            <h3 className="title-medium text-on-surface mb-2">
              No items scanned yet
            </h3>
            <p className="body-medium text-on-surface-variant text-center">
              Use the scanner above to scan items
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ScanScreen({
  userRole = 'store-staff',
  currentPartnerWarehouseSelection,
  onNavigateToReturns
}: ScanScreenProps) {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);

  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<ScannedItem | null>(null);
  const [showBatchStatusUpdate, setShowBatchStatusUpdate] = useState(false);
  const [batchNewStatus, setBatchNewStatus] = useState<string>('none');
  const [batchStatusNote, setBatchStatusNote] = useState('');
  const [showStatusUpdateDialog, setShowStatusUpdateDialog] = useState(false);
  const [itemToUpdateStatus, setItemToUpdateStatus] = useState<ScannedItem | null>(null);

  const selectedItems = scannedItems.filter(item => item.selected);

  const handleClearItems = () => {
    setScannedItems([]);
  };

  const handleToggleSelect = (itemId: string) => {
    setScannedItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, selected: !item.selected } : item
    ));
  };

  const handleSelectAll = () => {
    const allSelected = scannedItems.every(item => item.selected);
    setScannedItems(prev => prev.map(item => ({ ...item, selected: !allSelected })));
  };

  const handleMoreActions = (item: BaseItem, action: ItemQuickAction | 'in-store' | 'store-transfer' | 'sold' | 'missing' | 'broken' | 'rejected' | 'in-store-2nd-try') => {
    let newStatus: ScannedItem['status'];
    let successMessage: string;

    // Map ItemQuickAction to ScanScreen actions
    const mappedAction = action === 'mark-available' ? 'in-store' :
                        action === 'mark-sold' ? 'sold' :
                        action === 'mark-missing' ? 'missing' :
                        action === 'mark-broken' ? 'broken' :
                        action === 'mark-rejected' ? 'rejected' :
                        action;

    switch (mappedAction) {
      case 'in-store':
        newStatus = 'Available';
        successMessage = `Item ${item.itemId || item.id} marked as Available`;
        break;
      case 'store-transfer':
        newStatus = 'In transit'; // Store transfer might need a different status, using In transit for now
        successMessage = `Item ${item.itemId || item.id} marked for store transfer`;
        break;
      case 'sold':
        newStatus = 'Sold';
        successMessage = `Item ${item.itemId || item.id} marked as Sold`;
        break;
      case 'missing':
        newStatus = 'Missing';
        successMessage = `Item ${item.itemId || item.id} marked as Missing`;
        break;
      case 'broken':
        newStatus = 'Broken';
        successMessage = `Item ${item.itemId || item.id} marked as Broken`;
        break;
      case 'rejected':
        // For ScanScreen, we can show a dialog or directly update status
        // Since reject requires a reason, we'll update status directly
        newStatus = 'Rejected';
        successMessage = `Item ${item.itemId || item.id} marked as Rejected`;
        break;
      case 'in-store-2nd-try':
        newStatus = 'In Store 2nd try';
        successMessage = `Item ${item.itemId || item.id} marked as In Store 2nd try`;
        break;
      default:
        return;
    }

    setScannedItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, status: newStatus } : i
    ));
    toast.success(successMessage);
  };
  
  const handleStatusUpdateConfirm = (newStatus: StatusUpdateItemStatus, note?: string) => {
    if (itemToUpdateStatus) {
      handleSaveItemDetails(itemToUpdateStatus.id, { 
        status: newStatus,
        ...(note && { statusHistory: [...(itemToUpdateStatus.statusHistory || []), {
          status: newStatus,
          timestamp: new Date().toLocaleString('sv-SE', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
          }).replace(',', ''),
          user: 'Current User',
          note
        }]})
      });
      toast.success(`Item ${itemToUpdateStatus.itemId} status updated to ${newStatus}`);
      setShowStatusUpdateDialog(false);
      setItemToUpdateStatus(null);
    }
  };

  const handleItemClick = (item: BaseItem) => {
    setSelectedItemForDetails(item as ScannedItem);
  };

  const handleArchiveSelected = () => {
    setScannedItems(prev => prev.map(item => 
      item.selected ? { ...item, status: 'Archived', selected: false } : item
    ));
    toast.success(`${selectedItems.length} items archived`);
  };

  const handleBulkEdit = () => {
    setShowBulkEditModal(true);
  };

  const formatTimestamp = (date: Date | string = new Date()) => {
    const value = typeof date === 'string' ? date : date;
    return new Date(value).toLocaleString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  };

  const handleBulkEditSave = (updates: Partial<ScannedItem>) => {
    const selectedIds = selectedItems.map(item => item.id);
    const priceReduction = (updates as any).priceReduction;
    const comment = (updates as any).comment;
    const statusChange = updates.status;
    
    setScannedItems(prev => prev.map(item => {
      if (!selectedIds.includes(item.id)) return item;
      
      const itemUpdates: Partial<ScannedItem> = { ...updates, selected: false };
      
      // Calculate new price if price reduction is specified
      if (priceReduction && typeof priceReduction === 'number') {
        const reductionPercent = priceReduction / 100;
        itemUpdates.price = Math.round(item.price * (1 - reductionPercent) * 100) / 100;
        // Remove priceReduction from updates as it's not a real field
        delete (itemUpdates as any).priceReduction;
      }
      
      // Handle comment - add to statusHistory if status changed or if comment provided
      if (comment || (statusChange && statusChange !== item.status)) {
        const newHistoryEntry: StatusHistoryEntry = {
          status: (statusChange || item.status) as ScannedItem['status'],
          timestamp: formatTimestamp(),
          user: 'Current User',
          note: comment || undefined
        };
        
        itemUpdates.statusHistory = [
          ...(item.statusHistory || []),
          newHistoryEntry
        ];
        
        // Remove comment from updates as it's not a real field
        delete (itemUpdates as any).comment;
      }
      
      return { ...item, ...itemUpdates };
    }));
    
    const reductionText = priceReduction ? ` with ${priceReduction}% price reduction` : '';
    toast.success(`${selectedItems.length} items updated${reductionText}`);
  };

  const partnerIdForPricing = currentPartnerWarehouseSelection?.partnerId;

  const partnerPriceOptions = useMemo(() => {
    if (!selectedItemForDetails) {
      return [];
    }
    return getSekPriceOptions(partnerIdForPricing, selectedItemForDetails.brand);
  }, [partnerIdForPricing, selectedItemForDetails]);

  const handleSaveItemDetails = (itemId: string, updates: Partial<ItemDetails>) => {
    setScannedItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, ...updates };
        
        // If status changed, add to history
        if (updates.status && updates.status !== item.status) {
          const newHistoryEntry: StatusHistoryEntry = {
            status: updates.status,
            timestamp: new Date().toLocaleString('sv-SE', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit', 
              hour: '2-digit', 
              minute: '2-digit' 
            }).replace(',', ''),
            user: 'Current User'
          };
          
          updatedItem.statusHistory = [
            ...(item.statusHistory || []),
            newHistoryEntry
          ];
        }
        
        return updatedItem;
      }
      return item;
    }));
    
    // Update the selected item for details to reflect changes
    setSelectedItemForDetails(prev => prev ? { ...prev, ...updates } as ScannedItem : null);
    toast.success('Item updated successfully');
  };

  const handleBatchStatusUpdate = () => {
    if (batchNewStatus !== 'none') {
      const selectedIds = selectedItems.map(item => item.id);
      const timestamp = new Date().toLocaleString('sv-SE', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      }).replace(',', '');
      
      setScannedItems(prev => prev.map(item => {
        if (selectedIds.includes(item.id)) {
          const newHistoryEntry: StatusHistoryEntry = {
            status: batchNewStatus,
            timestamp,
            user: 'Current User',
            note: batchStatusNote || undefined
          };
          
          return {
            ...item,
            status: batchNewStatus,
            selected: false,
            statusHistory: [
              ...(item.statusHistory || []),
              newHistoryEntry
            ]
          };
        }
        return item;
      }));
      
      toast.success(`${selectedItems.length} items updated to ${batchNewStatus}`);
      setShowBatchStatusUpdate(false);
      setBatchNewStatus('none');
      setBatchStatusNote('');
    }
  };

  const handleScan = (scannedCode: string) => {
    // Extract item ID from scanned code (could be QR code or barcode)
    // For now, if it's a numeric code, use it as itemId, otherwise generate one
    let itemId: string;
    if (/^\d+$/.test(scannedCode)) {
      itemId = scannedCode;
    } else if (scannedCode.startsWith('SCAN-')) {
      // Extract from fake scan format
      itemId = scannedCode.split('-')[1] || `${34780000 + Math.floor(Math.random() * 10000)}`;
    } else {
      // Use the scanned code as itemId or generate one
      itemId = scannedCode.length > 10 ? scannedCode.substring(0, 10) : `${34780000 + Math.floor(Math.random() * 10000)}`;
    }

    // Simulate scanning a random item with the scanned code
    const brands = ['H&M', 'Weekday', 'COS', 'Monki', 'ARKET', 'Zara', 'Mango'];
    const categories = ['Dress', 'Shirt', 'Pants', 'Jacket', 'Shorts', 'Hoodie', 'Sweater'];
    const sizes = ['XS', 'S', 'M', 'L', 'XL'];
    const colors = ['Black', 'White', 'Blue', 'Gray', 'Red', 'Green', 'Beige'];
    const sellers = ['Anna Martinez', 'John Smith', 'Maria Lopez', 'David Chen', 'Sarah Johnson', 'Michael Brown'];
    
    const today = getTodayString().replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 999) + 1;
    
    const brand = brands[Math.floor(Math.random() * brands.length)] ?? 'Brand';
    const category = categories[Math.floor(Math.random() * categories.length)] ?? 'Category';
    const size = sizes[Math.floor(Math.random() * sizes.length)] ?? 'M';
    const color = colors[Math.floor(Math.random() * colors.length)] ?? 'Color';
    const seller = sellers[Math.floor(Math.random() * sellers.length)] ?? 'Scanner';

    const newItem: ScannedItem = {
      id: Date.now().toString(),
      itemId,
      status: 'Available',
      date: getTodayString(),
      brand,
      category,
      size,
      color,
      price: Math.floor(Math.random() * 50) + 10,
      deliveryId: `DEL-${today}-${randomNum.toString().padStart(3, '0')}`,
      sellerName: seller,
      selected: false,
      statusHistory: [
        { 
          status: 'Available', 
          timestamp: new Date().toLocaleString('sv-SE', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
          }).replace(',', ''),
          user: 'Scanner',
          note: `Scanned: ${scannedCode}`
        }
      ]
    };
    
    setScannedItems(prev => [newItem, ...prev]);
    toast.success(`Scanned item: ${itemId}`);
  };

  // Check if return button should be shown based on scanned/selected items status
  const returnableStatuses = ['Available', 'Missing', 'Broken', 'Rejected', 'Expired'];
  const hasReturnableItems = useMemo(() => {
    const itemsToCheck = selectedItems.length > 0 ? selectedItems : scannedItems;
    return itemsToCheck.some(item => returnableStatuses.includes(item.status || ''));
  }, [selectedItems, scannedItems]);

  const handleReturn = () => {
    if (onNavigateToReturns) {
      onNavigateToReturns();
    }
  };

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* Spacer for top nav on desktop */}
      <div className="hidden md:block h-16"></div>
      <ScanViewer onScan={handleScan} />
      
      <ScannedItemsSection 
        items={scannedItems}
        onClearItems={handleClearItems}
        onToggleSelect={handleToggleSelect}
        onMoreActions={handleMoreActions}
        onClick={handleItemClick}
        userRole={userRole}
        onSelectAll={handleSelectAll}
        selectedCount={selectedItems.length}
        totalCount={scannedItems.length}
        isAllSelected={scannedItems.length > 0 && scannedItems.every(item => item.selected)}
        onArchive={handleArchiveSelected}
        onBulkEdit={handleBulkEdit}
      />

      {/* Bulk Edit Modal */}
      <BulkEditModal 
        isOpen={showBulkEditModal}
        onClose={() => setShowBulkEditModal(false)}
        selectedItems={selectedItems}
        onSave={handleBulkEditSave}
      />

      {/* Item Details Dialog */}
      <ItemDetailsDialog
        item={selectedItemForDetails as ItemDetails | null}
        isOpen={!!selectedItemForDetails}
        onClose={() => setSelectedItemForDetails(null)}
        onSave={handleSaveItemDetails}
        statusHistory={selectedItemForDetails?.statusHistory}
        priceOptions={partnerPriceOptions}
        priceCurrency={partnerPriceOptions.length ? 'SEK' : undefined}
      />

      {/* Batch Status Update Dialog */}
      <Dialog open={showBatchStatusUpdate} onOpenChange={setShowBatchStatusUpdate}>
        <DialogContent className="bg-surface border border-outline-variant rounded-xl max-w-[calc(100%-2rem)] sm:max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="title-large text-on-surface">
              Update status for {selectedItems.length} items
            </DialogTitle>
            <DialogDescription className="body-medium text-on-surface-variant">
              Change the status for all selected items at once
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* New Status */}
            <div>
              <label className="label-medium text-on-surface-variant mb-2 block">
                New status
              </label>
              <Select value={batchNewStatus} onValueChange={setBatchNewStatus}>
                <SelectTrigger className="bg-surface-container-high border border-outline rounded-lg min-h-[48px]">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select new status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="In Store 2nd try">In Store 2nd try</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                  <SelectItem value="To return">To return</SelectItem>
                  <SelectItem value="Pick up">Pick up</SelectItem>
                  <SelectItem value="Charity">Charity</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <label className="label-medium text-on-surface-variant mb-2 block">
                Add a note (optional)
              </label>
              <Textarea
                value={batchStatusNote}
                onChange={(e) => setBatchStatusNote(e.target.value)}
                placeholder="Add any additional notes..."
                className="bg-surface-container-high border border-outline rounded-lg resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowBatchStatusUpdate(false);
                setBatchNewStatus('none');
                setBatchStatusNote('');
              }}
              className="w-full sm:w-auto sm:min-w-[120px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBatchStatusUpdate}
              disabled={batchNewStatus === 'none'}
              className="w-full sm:w-auto sm:min-w-[120px]"
            >
              Update {selectedItems.length} items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <StatusUpdateDialog
        isOpen={showStatusUpdateDialog}
        onClose={() => {
          setShowStatusUpdateDialog(false);
          setItemToUpdateStatus(null);
        }}
        onConfirm={handleStatusUpdateConfirm}
        currentStatus={itemToUpdateStatus?.status}
        itemId={itemToUpdateStatus?.itemId}
        itemTitle={itemToUpdateStatus?.brand}
        userRole={userRole}
      />

      {/* Bottom Return Action */}
      {hasReturnableItems && onNavigateToReturns && (
        <div className="sticky bottom-0 bg-surface border-t border-outline-variant p-4 z-10">
          <Button 
            onClick={handleReturn}
            className="w-full bg-primary text-on-primary hover:bg-primary/90"
          >
            Return
          </Button>
        </div>
      )}
    </div>
  );
}
