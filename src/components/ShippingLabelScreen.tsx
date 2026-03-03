import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { toast } from 'sonner@2.0.3';
import ActiveScanner from './ActiveScanner';

interface ShippingLabelScreenProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRegister: (shippingLabel?: string) => void;
  onSkip: () => void;
  initialLabel?: string;
}

export default function ShippingLabelScreen({
  isOpen,
  onOpenChange,
  onRegister,
  onSkip,
  initialLabel
}: ShippingLabelScreenProps) {
  const [shippingLabel, setShippingLabel] = useState(initialLabel ?? '');

  useEffect(() => {
    setShippingLabel(initialLabel ?? '');
  }, [initialLabel, isOpen]);

  const handleScan = (scannedCode: string) => {
    setShippingLabel(scannedCode);
  };

  const handleManualEntry = (itemId: string) => {
    setShippingLabel(itemId);
  };

  const handleRegister = () => {
    const handler = onRegister;
    if (!handler) return;
    handler(shippingLabel.trim() || undefined);
    setShippingLabel('');
    onOpenChange(false);
  };

  const handleSkip = () => {
    onSkip();
    setShippingLabel('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setShippingLabel(initialLabel ?? '');
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col p-0 max-h-screen w-full sm:max-w-full [&_[data-slot=sheet-close]]:hidden z-[10000]"
        style={{ zIndex: 10000 }}
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-outline-variant flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-on-surface-variant"
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="text-left flex-1">
              <SheetTitle className="title-large">Add Shipping Label</SheetTitle>
              <SheetDescription className="body-medium text-on-surface-variant">
                Scan or enter a shipping label for this delivery
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Active Scanner - Top portion */}
          <div className="flex-shrink-0 px-6 pt-4 pb-4 border-b border-outline-variant overflow-hidden">
            <div className="h-[280px] min-h-[280px] max-h-[280px]">
              <ActiveScanner
                onScan={handleScan}
                onManualEntry={handleManualEntry}
                isScanning={false}
                showManualEntry={true}
                onClose={handleClose}
                showBackButton={false}
              />
            </div>
          </div>

          {/* Manual Entry Section */}
          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shippingLabel">Shipping Label</Label>
                <Input
                  id="shippingLabel"
                  value={shippingLabel}
                  onChange={(e) => setShippingLabel(e.target.value)}
                  placeholder="e.g., SHIP-123456"
                  className="bg-surface-container-high"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleRegister();
                    }
                  }}
                />
                {shippingLabel && (
                  <p className="body-small text-on-surface-variant">
                    Current label: <span className="font-medium">{shippingLabel}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-outline-variant px-6 py-4 flex gap-3 flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1 h-[56px]"
            size="lg"
          >
            <span className="label-large">Skip</span>
          </Button>
          <Button
            onClick={handleRegister}
            className="flex-1 h-[56px] bg-primary text-on-primary"
            size="lg"
          >
            <span className="label-large">Register</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

