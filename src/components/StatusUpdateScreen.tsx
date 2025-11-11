import React, { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, X, QrCode, Search, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import svgPaths from "../imports/svg-3mbe72s84l";
import { ItemCard, BaseItem } from './ItemCard';
import ActiveScanner from './ActiveScanner';

export interface StatusUpdateItem {
  id: string;
  itemId: string;
  title: string;
  brand: string;
  size?: string;
  color?: string;
  price: number;
  status: 'In Store' | 'In transit' | 'Expired B2B' | 'Rejected' | 'Missing' | 'Broken' | 'Sold';
  source: 'B2B' | 'Private Seller';
  orderNumber?: string;
  date: string;
  thumbnail?: string;
  deliveredDate?: string; // For 24h reject window
  canReject: boolean;
  canUpdate: boolean;
}

export type UserRole = 'Store Manager' | 'Admin' | 'Store User';

export type ItemStatus = 'In Store' | 'Rejected' | 'Missing' | 'Broken' | 'Sold' | 'In Store 2nd try' | 'Pick up' | 'Charity' | 'Storage' | 'Pre-register' | 'Waiting for payout' | 'Archive' | 'Expired';

export type RejectReason = 'Broken' | 'Not accepted brand' | 'Not in season' | 'Inherited from delivery';

interface StatusUpdateScreenProps {
  onBack: () => void;
  userRole: UserRole;
  onStatusUpdate: (itemId: string, newStatus: ItemStatus, reason?: RejectReason, note?: string) => void;
}

function TopAppBar({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
      <div className="flex items-center h-16 px-4 md:px-6">
        {/* Leading icon - Back button */}
        <button 
          className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors mr-2"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-on-surface" />
        </button>
        
        {/* Title */}
        <h1 className="title-large text-on-surface flex-1">
          {title}
        </h1>
      </div>
    </div>
  );
}

function SearchSection({ 
  searchValue, 
  onSearchChange, 
  onSearchSubmit
}: { 
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
}) {
  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      {/* Search Input */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for Item ID"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
          className="bg-surface-container-high border border-outline rounded-lg pr-12 min-h-[48px] body-large"
        />
        <button
          onClick={onSearchSubmit}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function ItemResultCard({ 
  item, 
  userRole, 
  onChangeStatus 
}: { 
  item: StatusUpdateItem; 
  userRole: UserRole;
  onChangeStatus: (item: StatusUpdateItem) => void;
}) {
  const canUpdateStatus = () => {
    return item.canUpdate && (
      userRole === 'Admin' || 
      userRole === 'Store Manager' || 
      (userRole === 'Store User' && !['Missing', 'Broken'].includes(item.status))
    );
  };

  return (
    <div className="mx-4 mb-4">
      {/* Use ItemCard component directly */}
      <ItemCard
        item={{
          id: item.id,
          itemId: item.itemId,
          title: item.title,
          brand: item.brand,
          category: item.source, // Use source as category for display
          size: item.size,
          color: item.color,
          price: item.price,
          status: item.status,
          date: item.date,
          thumbnail: item.thumbnail,
          orderNumber: item.orderNumber,
        } as BaseItem}
        variant="items-list"
        showActions={false}
        showSelection={false}
      />
      
      {/* Change Status Button */}
      {canUpdateStatus() && (
        <div className="mt-3 px-4">
          <Button
            variant="outline"
            onClick={() => onChangeStatus(item)}
            className="border-primary text-primary hover:bg-primary-container/50 focus:bg-primary-container/50 active:bg-primary-container/70 transition-colors px-4 py-2 rounded-[16px] min-h-[36px] label-medium"
          >
            Change status
          </Button>
        </div>
      )}
      
      {/* Time window warning for reject */}
      {item.status === 'In Store' && item.source === 'B2B' && !item.canReject && (
        <div className="mt-3 mx-4 p-3 bg-error-container/30 rounded-lg flex items-start gap-2">
          <Clock className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
          <p className="body-small text-error">
            Reject available only within 24 hours after delivery registration.
          </p>
        </div>
      )}
    </div>
  );
}

function StatusPickerDialog({ 
  item, 
  userRole, 
  isOpen, 
  onClose, 
  onConfirm 
}: { 
  item: StatusUpdateItem | null; 
  userRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newStatus: ItemStatus, reason?: RejectReason, note?: string) => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState<ItemStatus | 'none'>('none');
  const [selectedReason, setSelectedReason] = useState<RejectReason | 'none'>('none');
  const [note, setNote] = useState('');

  const getAvailableStatuses = (): ItemStatus[] => {
    if (!item) return [];
    
    const baseStatuses: ItemStatus[] = [];
    
    // Role-based permissions
    if (userRole === 'Admin') {
      baseStatuses.push('Pre-register', 'Waiting for payout', 'Archive', 'Expired', 'Storage');
    }
    
    if (userRole === 'Store Manager' || userRole === 'Admin') {
      if (item.canReject && item.source === 'B2B') {
        baseStatuses.push('Rejected');
      }
      baseStatuses.push('Missing', 'Broken');
    }
    
    // Status-specific transitions
    switch (item.status) {
      case 'In Store':
        baseStatuses.push('Sold');
        break;
      case 'Expired B2B':
        baseStatuses.push('In Store 2nd try', 'Pick up', 'Charity', 'Storage');
        break;
      case 'In transit':
        baseStatuses.push('In Store');
        break;
    }
    
    // Remove duplicates and current status
    return [...new Set(baseStatuses)].filter(status => status !== item.status);
  };

  const rejectReasons: RejectReason[] = ['Broken', 'Not accepted brand', 'Not in season', 'Inherited from delivery'];

  const handleConfirm = () => {
    if (selectedStatus && selectedStatus !== 'none') {
      onConfirm(
        selectedStatus as ItemStatus, 
        selectedStatus === 'Rejected' && selectedReason !== 'none' ? selectedReason as RejectReason : undefined,
        note || undefined
      );
      setSelectedStatus('none');
      setSelectedReason('none');
      setNote('');
    }
  };

  const handleClose = () => {
    setSelectedStatus('none');
    setSelectedReason('none');
    setNote('');
    onClose();
  };

  if (!item) return null;

  const availableStatuses = getAvailableStatuses();
  const needsReason = selectedStatus === 'Rejected';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-surface border border-outline-variant rounded-xl max-w-[calc(100%-2rem)] sm:max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="title-large text-on-surface">
            Change status
          </DialogTitle>
          <DialogDescription className="body-medium text-on-surface-variant">
            Update the status for item {item.itemId}. Select a new status and provide additional information if required.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Current Status */}
          <div>
            <label className="label-medium text-on-surface-variant block mb-1">
              Current status
            </label>
            <p className="body-large text-on-surface">
              {item.status}
            </p>
          </div>
          
          {/* New Status */}
          <div>
            <label className="label-medium text-on-surface-variant mb-2 block">
              New status
            </label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="bg-surface-container-high border border-outline rounded-lg min-h-[48px]">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select new status</SelectItem>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Reason (for Rejected) */}
          {needsReason && (
            <div>
              <label className="label-medium text-on-surface-variant mb-2 block">
                Select a reason *
              </label>
              <Select value={selectedReason} onValueChange={setSelectedReason}>
                <SelectTrigger className="bg-surface-container-high border border-outline rounded-lg min-h-[48px]">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select reason</SelectItem>
                  {rejectReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Notes */}
          <div>
            <label className="label-medium text-on-surface-variant mb-2 block">
              Add an internal note (optional)
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any additional notes..."
              className="bg-surface-container-high border border-outline rounded-lg resize-none"
              rows={3}
            />
          </div>
          
          {/* Extended lifetime info for "In Store 2nd try" */}
          {selectedStatus === 'In Store 2nd try' && (
            <div className="p-3 bg-primary-container/30 rounded-lg flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="body-small text-primary">
                This will extend the item's lifetime by 4 weeks from today.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
          <Button 
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto sm:min-w-[120px]"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={selectedStatus === 'none' || (needsReason && selectedReason === 'none')}
            className="w-full sm:w-auto sm:min-w-[120px]"
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ItemNotFoundCard({ searchValue }: { searchValue: string }) {
  return (
    <Card className="mx-4 mb-4 bg-surface-container border border-outline-variant">
      <CardContent className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
        <h3 className="title-medium text-on-surface mb-2">
          Item ID not recognized
        </h3>
        <p className="body-medium text-on-surface-variant mb-4">
          We couldn't find item ID "{searchValue}". Please place this item on the review rack for later processing.
        </p>
        <Button
          variant="outline"
          className="border-outline text-on-surface hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors px-4 py-2 rounded-[16px] min-h-[36px]"
        >
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

export default function StatusUpdateScreen({ onBack, userRole, onStatusUpdate }: StatusUpdateScreenProps) {
  const [searchValue, setSearchValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StatusUpdateItem | null>(null);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [foundItems, setFoundItems] = useState<StatusUpdateItem[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Mock items data
  const mockItems: StatusUpdateItem[] = [
    {
      id: '1',
      itemId: '665342',
      title: 'Shorts',
      brand: 'Weekday',
      size: 'M',
      price: 30,
      status: 'In transit',
      source: 'B2B',
      date: '2022-06-09',
      deliveredDate: '2024-12-09',
      canReject: true,
      canUpdate: true
    },
    {
      id: '2',
      itemId: '665341',
      title: 'Shorts',
      brand: 'Weekday',
      size: 'M',
      price: 10,
      status: 'In transit',
      source: 'Private Seller',
      date: '2022-06-10',
      canReject: false,
      canUpdate: true
    },
    {
      id: '3',
      itemId: '66420',
      title: 'Shorts',
      brand: 'Weekday',
      size: 'M',
      price: 40,
      status: 'In Store',
      source: 'B2B',
      date: '2022-06-10',
      deliveredDate: '2024-12-07', // More than 24h ago
      canReject: false,
      canUpdate: true
    },
    {
      id: '4',
      itemId: '66417',
      title: 'Shorts',
      brand: 'Weekday',
      size: 'M',
      price: 20,
      status: 'In Store',
      source: 'Private Seller',
      date: '2022-06-12',
      canReject: false,
      canUpdate: true
    },
    {
      id: '5',
      itemId: '66416',
      title: 'Shorts',
      brand: 'Weekday',
      size: 'M',
      price: 15,
      status: 'In Store',
      source: 'B2B',
      date: '2022-06-12',
      deliveredDate: '2024-12-09',
      canReject: true,
      canUpdate: true
    }
  ];

  const handleSearch = () => {
    if (!searchValue.trim()) return;
    
    const results = mockItems.filter(item => 
      item.itemId.toLowerCase().includes(searchValue.toLowerCase())
    );
    
    setFoundItems(results);
    setSearchPerformed(true);
  };

  const handleScan = () => {
    setIsScanning(true);
    
    // Simulate scanning
    setTimeout(() => {
      const randomItem = mockItems[Math.floor(Math.random() * mockItems.length)];
      setFoundItems([randomItem]);
      setSearchPerformed(true);
      setSearchValue(randomItem.itemId);
      setIsScanning(false);
    }, 1500);
  };

  const handleManualEntry = (itemId: string) => {
    setSearchValue(itemId);
    const results = mockItems.filter(item => 
      item.itemId.toLowerCase().includes(itemId.toLowerCase())
    );
    setFoundItems(results);
    setSearchPerformed(true);
  };

  const handleChangeStatus = (item: StatusUpdateItem) => {
    setSelectedItem(item);
    setShowStatusPicker(true);
  };

  const handleStatusConfirm = (newStatus: ItemStatus, reason?: RejectReason, note?: string) => {
    if (selectedItem) {
      onStatusUpdate(selectedItem.id, newStatus, reason, note);
      
      // Show success message
      const statusText = newStatus === 'Rejected' && reason ? `${newStatus} (${reason})` : newStatus;
      toast.success(`Item updated to ${statusText}`);
      
      // Update local state
      setFoundItems(prev => prev.map(item => 
        item.id === selectedItem.id 
          ? { ...item, status: newStatus }
          : item
      ));
    }
    
    setShowStatusPicker(false);
    setSelectedItem(null);
  };

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* Top App Bar */}
      <TopAppBar onBack={onBack} title="Status update" />
      
      {/* Active Scanner - always visible at top */}
      <div className="pt-4">
        <ActiveScanner 
          onScan={handleScan}
          onManualEntry={handleManualEntry}
          isScanning={isScanning}
          showManualEntry={true}
        />
      </div>
      
      {/* Search Section */}
      <SearchSection 
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearch}
      />
      
      {/* Results Section */}
      {searchPerformed && (
        <div className="flex-1 pb-6">
          {foundItems.length > 0 ? (
            <>
              <div className="px-4 md:px-6 mb-4">
                <span className="body-medium text-on-surface-variant">
                  {foundItems.length} items
                </span>
              </div>
              {foundItems.map(item => (
                <ItemResultCard 
                  key={item.id}
                  item={item}
                  userRole={userRole}
                  onChangeStatus={handleChangeStatus}
                />
              ))}
            </>
          ) : (
            <ItemNotFoundCard searchValue={searchValue} />
          )}
        </div>
      )}
      
      {/* Status Picker Dialog */}
      <StatusPickerDialog 
        item={selectedItem}
        userRole={userRole}
        isOpen={showStatusPicker}
        onClose={() => {
          setShowStatusPicker(false);
          setSelectedItem(null);
        }}
        onConfirm={handleStatusConfirm}
      />
    </div>
  );
}