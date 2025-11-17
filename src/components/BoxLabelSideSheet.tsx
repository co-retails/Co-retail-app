import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { toast } from 'sonner@2.0.3';
import ActiveScanner from './ActiveScanner';

interface BoxLabelSideSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRegisterBox: (boxLabel: string) => void;
  onCancel: () => void;
}

export default function BoxLabelSideSheet({
  isOpen,
  onOpenChange,
  onRegisterBox,
  onCancel
}: BoxLabelSideSheetProps) {
  const [boxLabel, setBoxLabel] = useState('');

  const handleScan = () => {
    // Simulate scanning - in real app this would use camera
    const mockLabel = `BOX-${Date.now().toString().slice(-6)}`;
    setBoxLabel(mockLabel);
    toast.success(`Box label scanned: ${mockLabel}`);
  };

  const handleManualEntry = (label: string) => {
    setBoxLabel(label);
  };

  const handleRegister = () => {
    if (!boxLabel.trim()) {
      toast.error('Please enter or scan a box label');
      return;
    }
    onRegisterBox(boxLabel.trim());
    setBoxLabel('');
  };

  const handleCancel = () => {
    setBoxLabel('');
    onCancel();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0 max-h-screen">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-outline-variant flex-shrink-0">
          <SheetTitle className="title-large">Add Box Label</SheetTitle>
          <SheetDescription className="body-medium">
            Scan the box label or enter it manually
          </SheetDescription>
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
              />
            </div>
          </div>

          {/* Manual Entry Section */}
          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="boxLabel">Box Label</Label>
                <Input
                  id="boxLabel"
                  value={boxLabel}
                  onChange={(e) => setBoxLabel(e.target.value)}
                  placeholder="e.g., BOX-001"
                  className="bg-surface-container-high"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleRegister();
                    }
                  }}
                />
                {boxLabel && (
                  <p className="body-small text-on-surface-variant">
                    Current label: <span className="font-medium">{boxLabel}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-outline-variant px-6 py-4 space-y-3 flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full"
            size="lg"
          >
            <span className="label-large">Cancel</span>
          </Button>
          <Button
            onClick={handleRegister}
            disabled={!boxLabel.trim()}
            className="w-full bg-primary text-on-primary"
            size="lg"
          >
            <span className="label-large">Register Box</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

