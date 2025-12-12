import React from 'react';
import { ArrowLeft } from 'lucide-react';
import CameraScanner from './CameraScanner';

interface ActiveScannerProps {
  onScan: (result: string) => void;
  onManualEntry?: (itemId: string) => void;
  isScanning?: boolean;
  showManualEntry?: boolean;
  onClose?: () => void;
  showBackButton?: boolean;
}

export default function ActiveScanner({ 
  onScan, 
  onManualEntry, 
  isScanning = false,
  showManualEntry: showManualEntryProp = true,
  onClose,
  showBackButton = false
}: ActiveScannerProps) {
  const handleScan = (result: string) => {
    onScan(result);
  };

  return (
    <div className="mx-4 relative h-full">
      {/* Back button */}
      {showBackButton && onClose && (
        <div className="absolute top-4 left-4 z-30">
          <button
            onClick={onClose}
            className="w-12 h-12 md:w-10 md:h-10 min-h-[48px] min-w-[48px] md:min-h-0 md:min-w-0 bg-surface border border-outline rounded-full flex items-center justify-center hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors shadow-md touch-manipulation"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-on-surface" />
          </button>
        </div>
      )}
      
      <CameraScanner
        onScan={handleScan}
        isScanning={isScanning}
        showManualEntry={showManualEntryProp}
        onManualEntry={onManualEntry}
        scanMessage="Tap to scan boxes"
        autoStart={true}
        enableFakeScan={true}
        height="16rem"
      />
    </div>
  );
}
