import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Check, TruckIcon } from 'lucide-react';

interface PostRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Closes dialog and opens partner Orders list (All filter). */
  onDone: () => void;
  onCreateDeliveryNote: () => void;
  orderId: string;
}

export default function PostRegistrationDialog({
  isOpen,
  onClose,
  onDone,
  onCreateDeliveryNote,
  orderId,
}: PostRegistrationDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="bg-surface border border-outline-variant max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-success-container rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-on-success-container" />
            </div>
            <DialogTitle className="title-large text-on-surface">
              Order registered successfully
            </DialogTitle>
          </div>
          <DialogDescription className="body-medium text-on-surface-variant">
            Your order has been successfully registered. Choose what you would like to do next.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-surface-container-high rounded-xl">
            <p className="body-small text-on-surface-variant mb-1">Order ID</p>
            <p className="title-medium text-on-surface">{orderId}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:items-center sm:gap-3 pt-2">
            <Button
              type="button"
              onClick={onCreateDeliveryNote}
              className="w-full sm:w-auto min-h-[56px] bg-primary hover:bg-primary/90 text-on-primary sm:min-w-[220px]"
              size="lg"
            >
              <TruckIcon className="w-5 h-5 mr-2 shrink-0" />
              <span className="label-large">Create delivery note</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onDone}
              size="lg"
              className="w-full sm:w-auto min-h-[56px] bg-white text-on-surface border-outline hover:bg-surface-container-high"
            >
              <span className="label-large">Done</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
