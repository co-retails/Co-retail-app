import { useState } from 'react';
import { sortOptionsAlpha } from '../utils/spreadsheetUtils';
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
  | 'Draft'
  | 'In transit'
  | 'Available'
  | 'Storage'
  | 'Sold'
  | 'Returned'
  | 'Missing'
  | 'Broken'
  | 'Rejected';

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
      'Draft',
      'In transit',
      'Available',
      'Storage',
      'Sold',
      'Returned',
      'Missing',
      'Broken',
      'Rejected'
    ];
  }

  // Store staff have restricted transitions based on logical flow
  if (userRole === 'store-staff') {
    switch (currentStatus) {
      case 'Available':
        return ['Sold', 'Missing', 'Broken'];
      case 'Storage':
        return ['Available', 'In transit', 'Missing', 'Broken', 'Sold'];
      case 'Draft':
        return ['In transit'];
      case 'In transit':
        return ['Available'];
      case 'Missing':
        return ['Available', 'Sold'];
      case 'Broken':
        return [];
      case 'Sold':
        return ['Available'];
      case 'Returned':
      case 'Rejected':
        return [];
      default:
        return ['Available'];
    }
  }

  // Partners cannot update status
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
  const sortedAvailableStatuses = sortOptionsAlpha(availableStatuses);

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
                  {sortedAvailableStatuses.map((status) => (
                    <SelectItem key={status} value={status} className="min-h-[48px] md:min-h-0 py-3 md:py-1.5 touch-manipulation">
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
            className="min-h-[48px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedStatus}
            className="min-h-[48px]"
          >
            Update status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
