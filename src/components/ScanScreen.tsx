import React, { useMemo, useState } from 'react';
import { ItemCard, BaseItem } from './ItemCard';
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
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Archive, Clock, Edit3, Download, RefreshCw, Check, MoreVertical } from "lucide-react";
import ItemDetailsDialog, { ItemDetails, StatusHistoryEntry } from './ItemDetailsDialog';
import { StatusUpdateDialog, ItemStatus as StatusUpdateItemStatus } from './StatusUpdateDialog';
import { UserRole } from './ItemCard';
import { toast } from 'sonner';
import { Checkbox } from './ui/checkbox';
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

function ScanViewer({ onScan }: { 
  onScan: () => void;
}) {

  return (
    <div className="sticky top-0 mx-4 md:mx-6 mt-4 mb-4 bg-surface-container border border-outline-variant rounded-[12px] overflow-hidden z-20">
      {/* Camera Preview Area */}
      <div className="relative bg-surface-variant h-64 flex items-center justify-center">
        {/* Camera preview placeholder - in real implementation, this would show camera feed */}
        <div className="absolute inset-4 border-2 border-primary rounded-lg flex items-center justify-center">
          <div className="w-16 h-16 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M12 12v4.01M12 12V7.99" />
            </svg>
          </div>
        </div>
        
        {/* Active Scanning overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button 
            className="w-48 h-48 border-2 border-primary rounded-lg relative hover:bg-primary/5 focus:bg-primary/10 active:bg-primary/20 transition-colors cursor-pointer"
            onClick={onScan}
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
                <span className="label-small text-on-primary">SCANNING</span>
              </div>
            </div>
            
            {/* Scan message overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="bg-primary/90 backdrop-blur-sm rounded-lg px-4 py-2 opacity-0 hover:opacity-100 transition-opacity">
                <span className="label-medium text-on-primary">Tap to scan boxes</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function MultiSelectActions({ selectedCount, totalCount, isAllSelected, onSelectAll, onArchive, onMarkExpired, onBulkEdit, onExport, onBatchStatusUpdate }: {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  onSelectAll: () => void;
  onArchive: () => void;
  onMarkExpired: () => void;
  onBulkEdit: () => void;
  onExport: () => void;
  onBatchStatusUpdate: () => void;
}) {
  // Don't show if there are no items
  if (totalCount === 0) return null;

  const hasSelectedItems = selectedCount > 0;

  return (
    <div className="bg-surface-container border-t border-outline-variant">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Left side - Select all and count */}
        <div className="flex items-center gap-3">
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
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
              <DropdownMenuItem onClick={onBatchStatusUpdate}>
                <RefreshCw className="mr-2 h-4 w-4" />
                <span>Update status</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onBulkEdit}>
                <Edit3 className="mr-2 h-4 w-4" />
                <span>Bulk edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onArchive}>
                <Archive className="mr-2 h-4 w-4" />
                <span>Archive selected</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onMarkExpired}>
                <Clock className="mr-2 h-4 w-4" />
                <span>Mark as expired</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onExport}>
                <Download className="mr-2 h-4 w-4" />
                <span>Export selected</span>
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
    price: ''
  });

  const handleSave = () => {
    const updates: Partial<ScannedItem> = {};
    if (formData.status !== 'none') updates.status = formData.status;
    if (formData.category) updates.category = formData.category;
    if (formData.price) updates.price = parseFloat(formData.price);
    
    onSave(updates);
    setFormData({ status: 'none', category: '', price: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-surface border border-outline-variant max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="title-large text-on-surface">
            Bulk Edit Items
          </DialogTitle>
          <DialogDescription className="body-medium text-on-surface-variant">
            Edit properties for {selectedItems.length} selected items. Only filled fields will be updated.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={formData.status} onValueChange={(value: string) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="col-span-3 bg-surface-container-high border border-outline rounded-lg">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No change</SelectItem>
                <SelectItem value="In Store">In Store</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="To return">To return</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
                <SelectItem value="In Store 2nd try">In Store 2nd try</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="col-span-3 bg-surface-container-high border border-outline rounded-lg"
              placeholder="e.g. Hoodie, Dress, Shorts"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price (€)
            </Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="col-span-3 bg-surface-container-high border border-outline rounded-lg"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto sm:min-w-[120px]"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="w-full sm:w-auto sm:min-w-[120px]"
          >
            Update items
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ScannedItemsSection({ items, onClearItems, onToggleSelect, onMoreActions, onClick, userRole, onSelectAll, selectedCount, totalCount, isAllSelected, onArchive, onMarkExpired, onBulkEdit, onExport, onBatchStatusUpdate }: {
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
  onMarkExpired: () => void;
  onBulkEdit: () => void;
  onExport: () => void;
  onBatchStatusUpdate: () => void;
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
        onMarkExpired={onMarkExpired}
        onBulkEdit={onBulkEdit}
        onExport={onExport}
        onBatchStatusUpdate={onBatchStatusUpdate}
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
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([
    {
      id: '1',
      itemId: '685432',
      status: 'In Store',
      date: '2022-06-09',
      brand: 'Zara',
      category: 'Dress',
      size: 'M',
      color: 'Blue',
      price: 8,
      deliveryId: 'DEL-2022-0609-001',
      sellerName: 'Maria Lopez',
      selected: false,
      statusHistory: [
        { status: 'Pending', timestamp: '2022-06-09 10:30', user: 'Scanner', note: 'Item scanned' },
        { status: 'In Store', timestamp: '2022-06-09 11:15', user: 'Anna S.', note: 'Verified and stored' }
      ]
    },
    {
      id: '2',
      itemId: '685455',
      status: 'Expired',
      date: '2022-06-10',
      brand: 'Weekday',
      category: 'Shorts',
      size: 'M',
      color: 'Black',
      price: 10,
      deliveryId: 'DEL-2022-0610-002',
      sellerName: 'John Anderson',
      selected: false,
      statusHistory: [
        { status: 'In transit', timestamp: '2022-06-10 09:20', user: 'Scanner' },
        { status: 'In Store', timestamp: '2022-06-10 10:05', user: 'Maria L.' },
        { status: 'Expired', timestamp: '2022-07-25 14:30', user: 'System', note: 'Auto-expired after 45 days' }
      ]
    },
    {
      id: '3',
      itemId: '685489',
      status: 'In Store',
      date: '2022-06-10',
      brand: 'H&M',
      category: 'Jacket',
      size: 'L',
      color: 'Gray',
      price: 40,
      deliveryId: 'DEL-2022-0610-003',
      sellerName: 'Sarah Johnson',
      selected: false,
      statusHistory: [
        { status: 'Pending', timestamp: '2022-06-10 14:15', user: 'Scanner' },
        { status: 'In Store', timestamp: '2022-06-10 14:45', user: 'John D.' }
      ]
    }
  ]);

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

  const handleMoreActions = (item: BaseItem, action: 'in-store' | 'store-transfer' | 'sold' | 'missing' | 'broken' | 'rejected' | 'in-store-2nd-try') => {
    let newStatus: ScannedItem['status'];
    let successMessage: string;

    switch (action) {
      case 'in-store':
        newStatus = 'In Store';
        successMessage = `Item ${item.itemId || item.id} marked as In Store`;
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

  const handleMarkExpired = () => {
    setScannedItems(prev => prev.map(item => 
      item.selected ? { ...item, status: 'Expired', selected: false } : item
    ));
    toast.success(`${selectedItems.length} items marked as expired`);
  };

  const handleBulkEdit = () => {
    setShowBulkEditModal(true);
  };

  const handleBulkEditSave = (updates: Partial<ScannedItem>) => {
    const selectedIds = selectedItems.map(item => item.id);
    setScannedItems(prev => prev.map(item => 
      selectedIds.includes(item.id) 
        ? { ...item, ...updates, selected: false }
        : item
    ));
    toast.success(`${selectedItems.length} items updated`);
  };

  const partnerIdForPricing = currentPartnerWarehouseSelection?.partnerId;

  const partnerPriceOptions = useMemo(() => {
    if (!selectedItemForDetails) {
      return [];
    }
    return getSekPriceOptions(partnerIdForPricing, selectedItemForDetails.brand);
  }, [partnerIdForPricing, selectedItemForDetails]);

  const handleExport = () => {
    // Simulate CSV export
    const csvContent = [
      'Item ID,Brand,Category,Size,Color,Price,Status,Date',
      ...selectedItems.map(item => 
        `${item.itemId},"${item.brand}","${item.category}","${item.size || ''}","${item.color || ''}",${item.price},"${item.status}","${item.date}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scanned_items.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Items exported to CSV');
  };

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

  const handleScan = () => {
    // Simulate scanning a random item
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
      itemId: `${34780000 + Math.floor(Math.random() * 10000)}`,
      status: 'In Store',
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
          status: 'In Store', 
          timestamp: new Date().toLocaleString('sv-SE', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
          }).replace(',', ''),
          user: 'Scanner',
          note: 'Auto-scanned item'
        }
      ]
    };
    
    setScannedItems(prev => [newItem, ...prev]);
    toast.success(`Scanned: ${newItem.itemId}`);
  };

  // Check if return button should be shown based on scanned/selected items status
  const returnableStatuses = ['In Store', 'Missing', 'Broken', 'Rejected', 'Expired'];
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
        onMarkExpired={handleMarkExpired}
        onBulkEdit={handleBulkEdit}
        onExport={handleExport}
        onBatchStatusUpdate={() => setShowBatchStatusUpdate(true)}
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
                  <SelectItem value="In Store">In Store</SelectItem>
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
