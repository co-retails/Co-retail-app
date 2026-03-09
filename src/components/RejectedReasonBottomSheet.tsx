import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { Button } from './ui/button';

export const REJECTED_REASONS = [
  'Rejected - Broken on arrival',
  'Rejected - Dirty',
  'Rejected - Not accepted brand',
  'Rejected - Not accepted material',
  'Rejected - Not in season',
  'Rejected - Wrong store',
] as const;

export type RejectedReason = (typeof REJECTED_REASONS)[number];

interface RejectedReasonBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: RejectedReason) => void;
  itemId?: string;
}

export default function RejectedReasonBottomSheet({
  isOpen,
  onClose,
  onConfirm,
  itemId,
}: RejectedReasonBottomSheetProps) {
  const [selectedReason, setSelectedReason] = useState<RejectedReason>(REJECTED_REASONS[0]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedReason(REJECTED_REASONS[0]);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm(selectedReason);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        containerZIndex={10000}
        className="bg-surface border-outline-variant p-0 flex flex-col md:max-w-[400px] md:h-full max-h-[85vh] md:max-h-full"
      >
        <SheetHeader className="border-b border-outline-variant px-4 pt-6 pb-4 pr-12 flex-shrink-0">
          <SheetTitle className="title-large text-on-surface">
            Reject item
          </SheetTitle>
          <SheetDescription className="body-medium text-on-surface-variant">
            Select a reason to reject {itemId || 'the item'}. Rejections are only allowed within 24 hours of receiving it in store.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {REJECTED_REASONS.map((reason) => (
            <label
              key={reason}
              className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-surface-container-high transition-colors min-h-[48px] touch-manipulation"
            >
              <input
                type="radio"
                name="reject-reason"
                value={reason}
                checked={selectedReason === reason}
                onChange={() => setSelectedReason(reason)}
                className="accent-primary h-4 w-4 flex-shrink-0"
              />
              <span className="body-medium text-on-surface">{reason}</span>
            </label>
          ))}
        </div>

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
            onClick={handleConfirm}
            className="flex-1 bg-primary text-on-primary hover:bg-primary/90 rounded-lg min-h-[48px] label-large touch-manipulation"
          >
            Confirm rejection
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
