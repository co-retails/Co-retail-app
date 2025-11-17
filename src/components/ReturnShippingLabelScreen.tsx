import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft, QrCode } from 'lucide-react';
import { ReturnItem } from './ReturnManagementScreen';
import { Partner } from './PartnerSelectionScreen';

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
          className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors mr-2"
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
  onManualEntry,
  isScanning,
  showManualEntry
}: { 
  onScan: () => void;
  onManualEntry?: (label: string) => void;
  isScanning: boolean;
  showManualEntry?: boolean;
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
            className="w-48 h-48 border-2 border-primary rounded-lg relative hover:bg-primary/5 focus:bg-primary/10 active:bg-primary/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
  const [showManualEntry, setShowManualEntry] = useState(false);

  const scannedItems = items.filter(item => item.scanned);
  const scannedCount = scannedItems.length;

  const handleScan = () => {
    setIsScanning(true);
    // Simulate scanning
    setTimeout(() => {
      const mockLabel = `SHIP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setShippingLabel(mockLabel);
      setIsScanning(false);
      setShowManualEntry(false);
    }, 2000);
  };

  const handleManualEntry = (label: string) => {
    setShippingLabel(label);
  };

  const handleRegister = () => {
    if (!shippingLabel.trim()) {
      alert('Please scan or enter a shipping label');
      return;
    }
    onRegisterReturn(shippingLabel.trim());
  };

  return (
    <div className="bg-surface min-h-screen">
      <TopAppBar onBack={onBack} title="Shipping Label" />
      
      <div className="pb-20">
        {/* Active Scanner */}
        <div className="pt-4 md:pt-6">
          <ActiveScanner 
            onScan={handleScan}
            onManualEntry={handleManualEntry}
            isScanning={isScanning}
            showManualEntry={showManualEntry}
          />
        </div>

        {/* Manual Entry Section */}
        <div className="px-4 md:px-6 pt-4">
          {!showManualEntry && !shippingLabel ? (
            <button 
              className="w-full text-primary hover:bg-primary-container/10 focus:bg-primary-container/10 active:bg-primary-container/20 transition-colors py-3 rounded-md label-medium border border-outline-variant"
              onClick={() => setShowManualEntry(true)}
            >
              Enter shipping label manually
            </button>
          ) : (
            <div className="space-y-3">
              <div>
                <Label htmlFor="shippingLabel" className="body-medium text-on-surface mb-2 block">
                  Shipping Label
                </Label>
                <Input
                  id="shippingLabel"
                  value={shippingLabel}
                  onChange={(e) => setShippingLabel(e.target.value)}
                  placeholder="e.g., SHIP-12345678"
                  className="bg-surface-container-high"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && shippingLabel.trim()) {
                      handleRegister();
                    }
                  }}
                  autoFocus={showManualEntry}
                />
              </div>
              {shippingLabel && (
                <p className="body-small text-on-surface-variant">
                  Current label: <span className="font-medium text-on-surface">{shippingLabel}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="px-4 md:px-6 pt-6">
          <div className="bg-surface-container border border-outline-variant rounded-lg p-4">
            <div className="body-medium text-on-surface mb-2">Return Summary</div>
            <div className="space-y-1">
              <div className="flex justify-between body-small">
                <span className="text-on-surface-variant">Partner:</span>
                <span className="text-on-surface">{partner.name}</span>
              </div>
              <div className="flex justify-between body-small">
                <span className="text-on-surface-variant">Items:</span>
                <span className="text-on-surface">{scannedCount} items</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="sticky bottom-0 bg-surface border-t border-outline-variant p-4">
        <div className="flex gap-4">
          <Button 
            variant="outline"
            onClick={onBack}
            className="flex-1 border-outline text-on-surface hover:bg-surface-container-high"
          >
            Back
          </Button>
          <Button 
            onClick={handleRegister}
            disabled={!shippingLabel.trim()}
            className="flex-1 bg-primary text-on-primary hover:bg-primary/90 disabled:bg-surface-container disabled:text-on-surface-variant"
          >
            Register return
          </Button>
        </div>
      </div>
    </div>
  );
}

