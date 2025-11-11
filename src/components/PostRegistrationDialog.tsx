import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Check, TruckIcon, ClipboardList } from 'lucide-react';

interface PostRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onViewOrderList: () => void;
  onCreateDeliveryNote: () => void;
  orderId: string;
}

export default function PostRegistrationDialog({
  isOpen,
  onClose,
  onViewOrderList,
  onCreateDeliveryNote,
  orderId
}: PostRegistrationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            Your order has been successfully registered. Choose what you'd like to do next.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-surface-container-high rounded-xl">
            <p className="body-small text-on-surface-variant mb-1">Order ID</p>
            <p className="title-medium text-on-surface">{orderId}</p>
          </div>
          
          <p className="body-medium text-on-surface-variant">
            What would you like to do next?
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={onCreateDeliveryNote}
              className="w-full bg-primary hover:bg-primary/90 text-on-primary"
              size="lg"
            >
              <TruckIcon className="w-5 h-5 mr-2" />
              <span className="label-large">Create Delivery Note</span>
            </Button>
            
            <Button 
              onClick={onViewOrderList}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <ClipboardList className="w-5 h-5 mr-2" />
              <span className="label-large">View Order List</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}