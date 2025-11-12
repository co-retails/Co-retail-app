import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { UserRole } from './ItemCard';

export type ItemStatus = 
  | 'In Store' 
  | 'Pending' 
  | 'To return' 
  | 'Archived' 
  | 'In Store 2nd try' 
  | 'Sold' 
  | 'Pick up' 
  | 'Charity' 
  | 'Missing' 
  | 'Broken' 
  | 'Expired'
  | 'Rejected'
  | 'Storage'
  | 'Pre-register'
  | 'Waiting for payout';

interface StatusUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newStatus: ItemStatus, note?: string) => void;
  currentStatus?: string;
  itemId?: string;
  itemTitle?: string;
  userRole: UserRole;
}

// Define logical status transitions for store staff
const getAvailableStatuses = (currentStatus: string | undefined, userRole: UserRole): ItemStatus[] => {
  // Admin and Store Manager can update to any status
  if (userRole === 'admin' || userRole === 'store-manager') {
    return [
      'In Store',
      'Pending',
      'To return',
      'Archived',
      'In Store 2nd try',
      'Sold',
      'Pick up',
      'Charity',
      'Missing',
      'Broken',
      'Expired',
      'Rejected',
      'Storage',
      'Pre-register',
      'Waiting for payout'
    ];
  }

  // Store staff have restricted transitions based on logical flow
  if (userRole === 'store-staff') {
    switch (currentStatus) {
      case 'In Store':
        return ['Sold', 'Pick up', 'Charity', 'Expired', 'Archived', 'Storage'];
      case 'Pending':
        return ['In Store', 'Missing', 'Broken', 'To return'];
      case 'In Store 2nd try':
        return ['Sold', 'Pick up', 'Charity', 'Expired', 'Archived', 'Storage'];
      case 'Missing':
        return ['In Store', 'Archived'];
      case 'Broken':
        return ['Archived'];
      case 'Expired':
        return ['To return', 'Archived'];
      case 'Storage':
        return ['In Store', 'Archived'];
      case 'Pre-register':
        return ['Pending', 'In Store'];
      case 'Waiting for payout':
        return ['Sold', 'Archived'];
      // Restricted statuses that store staff cannot change
      case 'To return':
      case 'Archived':
        return [];
      default:
        return ['In Store', 'Pending', 'Archived'];
    }
  }

  // Partners and buyers cannot update status
  return [];
};

export function StatusUpdateDialog({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  itemId,
  itemTitle,
  userRole
}: StatusUpdateDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<ItemStatus | ''>('');
  const [note, setNote] = useState('');

  const availableStatuses = getAvailableStatuses(currentStatus, userRole);

  const handleConfirm = () => {
    if (selectedStatus) {
      onConfirm(selectedStatus as ItemStatus, note || undefined);
      setSelectedStatus('');
      setNote('');
    }
  };

  const handleClose = () => {
    setSelectedStatus('');
    setNote('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="title-large text-on-surface">Update item status</DialogTitle>
          <DialogDescription className="body-medium text-on-surface-variant">
            {itemId && `Item: ${itemId}`}
            {itemTitle && ` - ${itemTitle}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Status */}
          {currentStatus && (
            <div className="space-y-2">
              <Label className="label-large text-on-surface">Current status</Label>
              <div className="px-4 py-3 bg-surface-container-high rounded-lg border border-outline-variant">
                <p className="body-large text-on-surface">{currentStatus}</p>
              </div>
            </div>
          )}

          {/* New Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status" className="label-large text-on-surface">
              New status
            </Label>
            {availableStatuses.length > 0 ? (
              <Select value={selectedStatus} onValueChange={(value: ItemStatus) => setSelectedStatus(value)}>
                <SelectTrigger id="status" className="bg-surface-container-high border-outline-variant min-h-[48px]">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="px-4 py-3 bg-error-container/20 rounded-lg border border-error">
                <p className="body-medium text-on-error-container">
                  No status changes available. Contact a manager or admin to update this item.
                </p>
              </div>
            )}
          </div>

          {/* Optional Note */}
          <div className="space-y-2">
            <Label htmlFor="note" className="label-large text-on-surface">
              Note (optional)
            </Label>
            <Textarea
              id="note"
              placeholder="Add a note about this status change..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-surface-container-high border-outline-variant min-h-[100px] resize-none"
            />
          </div>

          {/* Role-based info message */}
          {userRole === 'store-staff' && availableStatuses.length > 0 && (
            <div className="px-4 py-3 bg-surface-container rounded-lg border border-outline-variant">
              <p className="body-small text-on-surface-variant">
                As Store Staff, you can only update to statuses that follow logical workflows. 
                Contact a manager or admin for other status changes.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="min-h-[40px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedStatus}
            className="min-h-[40px]"
          >
            Update status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
