import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft, QrCode, X } from 'lucide-react';
import { ReturnItem } from './ReturnManagementScreen';
import { Partner } from './PartnerSelectionScreen';
import CameraScanner from './CameraScanner';
import {
  FullScreenDialog,
  FullScreenDialogContent,
  FullScreenDialogDescription,
  FullScreenDialogTitle,
  FullScreenDialogClose
} from './ui/full-screen-dialog';

interface ReturnShippingLabelScreenProps {
  partner: Partner;
  items: ReturnItem[];
  onBack: () => void;
  onRegisterReturn: (shippingLabel: string) => void;
}

function TopAppBar({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
      <div className="flex items-center h-16 px-4 md:px-6">
        <button 
          className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors mr-2 touch-manipulation min-h-[48px] min-w-[48px]"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-on-surface" />
        </button>
        <h1 className="title-large text-on-surface flex-1">
          {title}
        </h1>
      </div>
    </div>
  );
}

function ActiveScanner({ 
  onScan, 
  isScanning
}: { 
  onScan: () => void;
  isScanning: boolean;
}) {
  return (
    <div className="mx-4 mb-4 bg-surface-container border border-outline-variant rounded-[12px] overflow-hidden">
      <div className="relative h-[280px] bg-surface-container-high">
        <div className="absolute inset-4 border-2 border-primary rounded-lg flex items-center justify-center">
          <div className="w-16 h-16 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
            <QrCode className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <button 
            className="w-48 h-48 border-2 border-primary rounded-lg relative hover:bg-primary/5 focus:bg-primary/10 active:bg-primary/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            onClick={onScan}
            disabled={isScanning}
            aria-label="Tap to scan"
          >
            {!isScanning && (
              <>
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary animate-pulse"></div>
                <div className="absolute top-8 left-0 right-0 h-px bg-primary/30 animate-bounce" style={{animationDelay: '0.5s'}}></div>
              </>
            )}
            
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
            
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="label-small text-primary">
                {isScanning ? 'Scanning...' : 'Tap to scan shipping label'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReturnShippingLabelScreen({
  partner,
  items,
  onBack,
  onRegisterReturn
}: ReturnShippingLabelScreenProps) {
  const [shippingLabel, setShippingLabel] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showScanScreen, setShowScanScreen] = useState(false);
  const [returnId] = useState(() => {
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomSegment = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `RET-${partner.id}-${timestamp}-${randomSegment}`;
  });
  const shippingLabelInputRef = useRef<HTMLInputElement | null>(null);

  const scannedItems = items.filter(item => item.scanned);
  const scannedCount = scannedItems.length;

  useEffect(() => {
    shippingLabelInputRef.current?.focus();
  }, []);

  const handleScan = () => {
    setIsScanning(true);
    // Simulate scanning
    setTimeout(() => {
      const mockLabel = `SHIP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setShippingLabel(mockLabel);
      setIsScanning(false);
    }, 2000);
  };

  const handleBarcodeScan = (scannedCode: string) => {
    // Set the scanned code as the shipping label
    setShippingLabel(scannedCode);
    // Close the scan screen
    setShowScanScreen(false);
    // Focus back on the input field
    setTimeout(() => {
      shippingLabelInputRef.current?.focus();
    }, 100);
  };

  const handleManualEntry = (label: string) => {
    setShippingLabel(label);
    shippingLabelInputRef.current?.focus();
  };

  const handleRegister = () => {
    if (!shippingLabel.trim()) {
      alert('Please scan or enter a shipping label');
      return;
    }
    onRegisterReturn(shippingLabel.trim());
  };

  return (
    <div className="bg-surface min-h-screen pb-36">
      <TopAppBar onBack={onBack} title="Shipping label" />
      
      <div className="pb-32">
        {/* Active Scanner */}
        <div className="pt-4 md:pt-6">
          <ActiveScanner 
            onScan={handleScan}
            isScanning={isScanning}
          />
        </div>

        {/* Manual Entry Section */}
        <div className="px-4 md:px-6 pt-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="shippingLabel" className="body-medium text-on-surface">
                Enter shipping label
              </Label>
              <span className="label-small text-on-surface-variant">
                Auto-focused for quick entry
              </span>
            </div>
            <div className="relative">
              <Input
                id="shippingLabel"
                ref={shippingLabelInputRef}
                value={shippingLabel}
                onChange={(e) => setShippingLabel(e.target.value)}
                placeholder="e.g., SHIP-12345678"
                className="bg-surface-container-high h-[56px] min-h-[56px] text-base pr-14"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && shippingLabel.trim()) {
                    handleRegister();
                  }
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowScanScreen(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-highest focus:bg-surface-container-highest active:bg-surface-container-highest transition-colors touch-manipulation"
                aria-label="Scan shipping label barcode"
              >
                <QrCode className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
            {shippingLabel && (
              <p className="body-small text-on-surface-variant">
                Current label: <span className="font-medium text-on-surface">{shippingLabel}</span>
              </p>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="px-4 md:px-6 pt-6">
          <div className="bg-surface-container border border-outline-variant rounded-lg p-4 space-y-4">
            <div className="flex flex-col gap-2">
              <p className="label-medium text-on-surface-variant tracking-[0.5px]">Return summary</p>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="label-medium text-on-surface-variant tracking-[0.5px]">Return ID</p>
                  <p className="font-mono text-on-surface text-lg">{returnId}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-outline text-on-surface hover:bg-surface-container-high min-h-[48px]"
                  onClick={() => handleManualEntry(returnId)}
                >
                  Set return ID as label
                </Button>
              </div>
            </div>
            <div className="space-y-1 border-t border-outline-variant/40 pt-3">
              <div className="flex justify-between body-small">
                <span className="text-on-surface-variant">Partner:</span>
                <span className="text-on-surface">{partner.name}</span>
              </div>
              <div className="flex justify-between body-small">
                <span className="text-on-surface-variant">Items scanned:</span>
                <span className="text-on-surface">{scannedCount} items</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant p-4">
        <div className="flex gap-4">
          <Button 
            variant="outline"
            onClick={onBack}
            className="flex-1 border-outline text-on-surface hover:bg-surface-container-high h-[56px] min-h-[56px]"
          >
            Back
          </Button>
          <Button 
            onClick={handleRegister}
            disabled={!shippingLabel.trim()}
            className="flex-1 bg-primary text-on-primary hover:bg-primary/90 disabled:bg-surface-container disabled:text-on-surface-variant h-[56px] min-h-[56px]"
          >
            Register return
          </Button>
        </div>
      </div>

      {/* Scan Screen Dialog */}
      <FullScreenDialog open={showScanScreen} onOpenChange={setShowScanScreen}>
        <FullScreenDialogContent className="flex flex-col p-0 bg-surface">
          {/* Header */}
          <div className="bg-surface-container border-b border-outline-variant sticky top-0 z-10">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FullScreenDialogClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high h-12 w-12 touch-manipulation"
                      aria-label="Close scan screen"
                    >
                      <X size={20} />
                    </Button>
                  </FullScreenDialogClose>
                  <div>
                    <FullScreenDialogTitle className="headline-small text-on-surface">
                      Scan shipping label
                    </FullScreenDialogTitle>
                    <FullScreenDialogDescription className="body-small text-on-surface-variant">
                      Position the barcode within the frame
                    </FullScreenDialogDescription>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scanner Content */}
          <div className="flex-1 overflow-y-auto pb-safe">
            <div className="p-4">
              <div className="bg-surface-container border border-outline-variant rounded-lg overflow-hidden">
                <CameraScanner
                  onScan={handleBarcodeScan}
                  scanMessage="Scan shipping label barcode"
                  autoStart={true}
                  enableFakeScan={true}
                  height="400px"
                />
              </div>
              <p className="body-small text-on-surface-variant mt-4 text-center">
                Scan the barcode on your shipping label. The label will be automatically filled in.
              </p>
            </div>
          </div>
        </FullScreenDialogContent>
      </FullScreenDialog>
    </div>
  );
}




