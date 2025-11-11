import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ReturnOrder } from './ReturnManagementScreen';
import { Button } from './ui/button';

interface ReturnConfirmationScreenProps {
  returnOrder: ReturnOrder;
  onBackToHome: () => void;
  onViewInShipping: () => void;
}

export default function ReturnConfirmationScreen({ returnOrder, onBackToHome, onViewInShipping }: ReturnConfirmationScreenProps) {
  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center px-4 py-8 max-w-md mx-auto">
          
          {/* Success Icon */}
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-accent" />
          </div>

          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="text-[20px] leading-[28px] text-foreground mb-2">Return successfully registered!</div>
            <p className="text-[14px] leading-[20px] text-muted-foreground">
              Your return has been created and is ready for carrier pickup.
            </p>
          </div>

          {/* Return Details Card */}
          <div className="bg-secondary border border-border rounded-xl p-4 w-full mb-8">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-[12px] leading-[16px]">
                <span className="text-muted-foreground">Return Order ID</span>
                <span className="font-mono text-foreground">{returnOrder.id}</span>
              </div>
              
              <div className="flex justify-between items-center text-[12px] leading-[16px]">
                <span className="text-muted-foreground">Partner</span>
                <span className="text-foreground">{returnOrder.partnerName}</span>
              </div>
              
              <div className="flex justify-between items-center text-[12px] leading-[16px]">
                <span className="text-muted-foreground">Items</span>
                <span className="text-foreground">{returnOrder.items.length} items</span>
              </div>
              
              <div className="flex justify-between items-center text-[12px] leading-[16px]">
                <span className="text-muted-foreground">Parcel ID</span>
                <span className="font-mono text-foreground">{returnOrder.parcelId}</span>
              </div>
              
              <div className="flex justify-between items-center text-[12px] leading-[16px]">
                <span className="text-muted-foreground">Status</span>
                <div className="px-3 py-1 bg-accent/10 text-accent rounded-full text-[10px]">
                  {returnOrder.status}
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 w-full">
            <p className="text-[12px] leading-[16px] text-accent mb-2">Next steps:</p>
            <div className="text-[11px] leading-[16px] text-accent/90 space-y-1">
              <p>1. Ensure carrier waybill is attached to the parcel</p>
              <p>2. Hand over the parcel to the carrier</p>
              <p>3. Partner will receive notification when return is in transit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="border-t border-border bg-background p-4 space-y-3">
        <Button
          variant="outline"
          className="w-full text-[12px] leading-[16px] tracking-[0.5px]"
          onClick={onViewInShipping}
        >
          View in Shipping
        </Button>

        <Button
          className="w-full text-[12px] leading-[16px] tracking-[0.5px]"
          onClick={onBackToHome}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
