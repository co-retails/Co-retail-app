import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ActiveScannerProps {
  onScan: () => void;
  onManualEntry?: (itemId: string) => void;
  isScanning?: boolean;
  showManualEntry?: boolean;
  onClose?: () => void;
}

export default function ActiveScanner({ 
  onScan, 
  onManualEntry, 
  isScanning = false,
  showManualEntry: showManualEntryProp = true,
  onClose 
}: ActiveScannerProps) {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualItemId, setManualItemId] = useState('');

  const handleManualSubmit = () => {
    if (manualItemId.trim() && onManualEntry) {
      onManualEntry(manualItemId.trim());
      setManualItemId('');
      setShowManualEntry(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualSubmit();
    }
  };

  return (
    <div className="bg-surface-container border border-outline-variant rounded-[12px] overflow-hidden mx-4 relative h-full">
      {/* Close button */}
      {onClose && (
        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-surface border border-outline rounded-full flex items-center justify-center hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors shadow-md"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5 text-on-surface" />
          </button>
        </div>
      )}
      
      {/* Camera Preview Area - Fixed height to prevent layout shift */}
      <div className="relative bg-surface-variant h-full flex items-center justify-center min-h-[16rem] max-h-[16rem]">
        {/* Camera preview placeholder - in real implementation, this would show camera feed */}
        <div className="absolute inset-4 border-2 border-primary rounded-lg flex items-center justify-center">
          <div className="w-16 h-16 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M12 12v4.01M12 12V7.99" />
            </svg>
          </div>
        </div>
        
        {/* Active Scanning overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button 
            className="w-48 h-48 border-2 border-primary rounded-lg relative hover:bg-primary/5 focus:bg-primary/10 active:bg-primary/20 transition-colors cursor-pointer"
            onClick={onScan}
            disabled={isScanning}
            aria-label="Tap to scan"
          >
            {/* Animated scanning line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary animate-pulse"></div>
            <div className="absolute top-8 left-0 right-0 h-px bg-primary/30 animate-bounce" style={{animationDelay: '0.5s'}}></div>
            
            {/* Corner indicators */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
            
            {/* Status indicator */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-2 bg-primary px-3 py-1 rounded-full">
                <div className={`w-2 h-2 bg-on-primary rounded-full ${isScanning ? 'animate-pulse' : ''}`}></div>
                <span className="label-small text-on-primary">{isScanning ? 'SCANNING...' : 'READY'}</span>
              </div>
            </div>
            
            {/* Scan message overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="bg-primary/90 backdrop-blur-sm rounded-lg px-4 py-2 opacity-0 hover:opacity-100 transition-opacity">
                <span className="label-medium text-on-primary">
                  {isScanning ? 'Scanning...' : 'Tap to scan boxes'}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
      
      {/* Manual Entry Section */}
      {showManualEntryProp && (
        <div className="p-4 border-t border-outline-variant bg-surface">
          {!showManualEntry ? (
            <button 
              className="w-full text-primary hover:bg-primary-container/10 focus:bg-primary-container/10 active:bg-primary-container/20 transition-colors py-2 rounded-md label-medium"
              onClick={() => setShowManualEntry(true)}
            >
              Add box label manually
            </button>
          ) : (
            <div className="space-y-3">
              <div className="title-small text-on-surface text-center">
                Enter box label
              </div>
              <input
                type="text"
                id="manual-item-id"
                name="manual-item-id"
                value={manualItemId}
                onChange={(e) => setManualItemId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g. BOX-123456"
                className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-md focus:border-primary focus:outline-none text-on-surface body-large"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowManualEntry(false)}
                  className="flex-1 border border-outline text-on-surface hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors px-4 py-2 rounded-lg min-h-[40px] label-large"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualItemId.trim()}
                  className="flex-1 bg-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 text-on-primary transition-colors disabled:opacity-38 disabled:cursor-not-allowed px-4 py-2 rounded-lg min-h-[40px] label-large"
                >
                  Add box
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
