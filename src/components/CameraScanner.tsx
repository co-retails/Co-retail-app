import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { isMobileOrTablet, hasCameraSupport } from '../utils/deviceDetection';

export interface CameraScannerProps {
  /** Callback when a code is successfully scanned */
  onScan: (result: string) => void;
  /** Whether scanning is currently active */
  isScanning?: boolean;
  /** Whether to show manual entry option */
  showManualEntry?: boolean;
  /** Callback for manual entry */
  onManualEntry?: (value: string) => void;
  /** Custom message to display */
  scanMessage?: string;
  /** Whether to auto-start camera on mount (default: true on mobile/tablet) */
  autoStart?: boolean;
  /** Enable debug logging */
  debug?: boolean;
  /** Enable fake scan mode for testing (desktop fallback) */
  enableFakeScan?: boolean;
  /** Custom class name for container */
  className?: string;
  /** Height of the camera preview area */
  height?: string;
  /** Callback when camera starts */
  onCameraStart?: () => void;
  /** Callback when camera stops */
  onCameraStop?: () => void;
  /** Callback when camera error occurs */
  onCameraError?: (error: string) => void;
}

const CAMERA_CONFIG = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1.0,
  disableFlip: false,
  videoConstraints: {
    facingMode: 'environment' // Use back camera on mobile
  }
};

const FAKE_SCAN_DELAY = 1500; // Delay for fake scan animation

export default function CameraScanner({
  onScan,
  isScanning = false,
  showManualEntry = false,
  onManualEntry,
  scanMessage,
  autoStart,
  debug = false,
  enableFakeScan = true,
  className = '',
  height = '16rem',
  onCameraStart,
  onCameraStop,
  onCameraError
}: CameraScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [shouldAutoStart, setShouldAutoStart] = useState(false);
  
  const isMobile = isMobileOrTablet();
  const hasCamera = hasCameraSupport();
  const shouldUseCamera = isMobile && hasCamera && !cameraError;
  const shouldShowFakeScan = !shouldUseCamera && enableFakeScan;

  // Determine if we should auto-start
  useEffect(() => {
    const autoStartValue = autoStart !== undefined ? autoStart : shouldUseCamera;
    setShouldAutoStart(autoStartValue);
  }, [autoStart, shouldUseCamera]);

  // Debug logging
  const log = useCallback((message: string, ...args: any[]) => {
    if (debug) {
      console.log(`[CameraScanner] ${message}`, ...args);
    }
  }, [debug]);

  // Start camera
  const startCamera = useCallback(async () => {
    if (!containerRef.current || scannerRef.current || !shouldUseCamera) {
      return;
    }

    setIsInitializing(true);
    setCameraError(null);
    log('Starting camera...');

    try {
      const scanner = new Html5Qrcode(containerRef.current.id);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: CAMERA_CONFIG.fps,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            // Make the scanning box responsive - use 80% of the smaller dimension
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.min(250, minEdge * 0.8);
            return {
              width: qrboxSize,
              height: qrboxSize
            };
          },
          aspectRatio: 1.0,
          disableFlip: false,
          videoConstraints: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        },
        (decodedText) => {
          // Success callback
          log('Code scanned:', decodedText);
          setLastScannedCode(decodedText);
          setScanState('success');
          
          // Stop scanning temporarily to prevent duplicate scans
          if (scannerRef.current) {
            scannerRef.current.pause();
          }
          
          // Call the onScan callback
          onScan(decodedText);
          
          // Resume after a short delay
          setTimeout(() => {
            if (scannerRef.current) {
              scannerRef.current.resume();
              setScanState('idle');
            }
          }, 1000);
        },
        (errorMessage) => {
          // Error callback (usually just means no code detected yet)
          // Only log if it's not the common "NotFoundException"
          if (!errorMessage.includes('NotFoundException')) {
            log('Scan error:', errorMessage);
          }
        }
      );

      setCameraActive(true);
      setIsInitializing(false);
      onCameraStart?.();
      log('Camera started successfully');
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to start camera';
      log('Camera start error:', errorMsg);
      setCameraError(errorMsg);
      setIsInitializing(false);
      onCameraError?.(errorMsg);
      
      // If camera fails, fall back to fake scan
      if (enableFakeScan) {
        log('Falling back to fake scan mode');
      }
    }
  }, [shouldUseCamera, onScan, onCameraStart, onCameraError, enableFakeScan, log]);

  // Stop camera
  const stopCamera = useCallback(async () => {
    if (!scannerRef.current) return;

    log('Stopping camera...');
    try {
      const scanner = scannerRef.current;
      const state = scanner.getState();
      
      if (state === Html5QrcodeScannerState.SCANNING) {
        await scanner.stop();
      }
      
      await scanner.clear();
      scannerRef.current = null;
      setCameraActive(false);
      onCameraStop?.();
      log('Camera stopped successfully');
    } catch (error: any) {
      log('Error stopping camera:', error);
    }
  }, [onCameraStop, log]);

  // Auto-start camera on mount if on mobile/tablet
  useEffect(() => {
    if (shouldAutoStart && shouldUseCamera && !cameraActive && !isInitializing) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startCamera();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoStart, shouldUseCamera, cameraActive, isInitializing, startCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        stopCamera();
      }
    };
  }, [stopCamera]);

  // Handle fake scan (for desktop/testing)
  const handleFakeScan = useCallback(() => {
    if (!shouldShowFakeScan || isScanning) return;

    setScanState('scanning');
    log('Fake scan initiated');

    // Generate a fake barcode/QR code
    const fakeCode = `SCAN-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    setTimeout(() => {
      setScanState('success');
      setLastScannedCode(fakeCode);
      onScan(fakeCode);
      
      setTimeout(() => {
        setScanState('idle');
      }, 1000);
    }, FAKE_SCAN_DELAY);
  }, [shouldShowFakeScan, isScanning, onScan, log]);

  // Manual entry handler
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualValue, setManualValue] = useState('');

  const handleManualSubmit = useCallback(() => {
    if (manualValue.trim() && onManualEntry) {
      onManualEntry(manualValue.trim());
      setManualValue('');
      setShowManualInput(false);
    }
  }, [manualValue, onManualEntry]);

  // Use a stable container ID based on component instance
  const containerIdRef = useRef(`camera-scanner-${Math.random().toString(36).substring(2, 9)}`);
  const containerId = containerIdRef.current;

  return (
    <div className={`bg-surface-container border border-outline-variant rounded-[12px] overflow-hidden ${className}`}>
      {/* Camera Preview Area */}
      <div 
        className="relative bg-surface-variant flex items-center justify-center overflow-hidden"
        style={{ height, minHeight: height }}
      >
        {/* Camera container - always rendered when shouldUseCamera, but styled based on state */}
        {shouldUseCamera && (
          <>
            <style>{`
              #${containerId} video {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
              }
              #${containerId} {
                width: 100% !important;
                height: 100% !important;
              }
            `}</style>
            <div 
              id={containerId}
              ref={containerRef}
              className={`absolute inset-0 w-full h-full ${cameraActive ? 'block' : 'hidden'}`}
              style={{ 
                zIndex: 1
              }}
            />
          </>
        )}

        {/* Placeholder - shown when camera is not active or on desktop */}
        {(!cameraActive || shouldShowFakeScan) && (
          <div className="absolute inset-4 border-2 border-primary rounded-lg flex items-center justify-center z-2">
            <div className="w-16 h-16 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M12 12v4.01M12 12V7.99" />
              </svg>
            </div>
          </div>
        )}

        {/* Scanning overlay with button - only shown when camera is not active or for fake scan */}
        {(!cameraActive || shouldShowFakeScan) && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <button
              className={`w-48 h-48 border-2 border-primary rounded-lg relative transition-colors touch-manipulation ${
                scanState === 'scanning' || isScanning
                  ? 'bg-primary/10 cursor-wait'
                  : scanState === 'success'
                  ? 'bg-primary/20 cursor-default'
                  : 'hover:bg-primary/5 focus:bg-primary/10 active:bg-primary/20 cursor-pointer'
              } ${!shouldUseCamera && !shouldShowFakeScan ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={shouldShowFakeScan ? handleFakeScan : undefined}
              disabled={scanState === 'scanning' || isScanning || (!shouldUseCamera && !shouldShowFakeScan)}
              aria-label="Scan QR code or barcode"
            >
            {/* Animated scanning line */}
            {(scanState === 'idle' || scanState === 'scanning') && (
              <>
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary animate-pulse"></div>
                <div className="absolute top-8 left-0 right-0 h-px bg-primary/30 animate-bounce" style={{animationDelay: '0.5s'}}></div>
              </>
            )}

            {/* Success animation */}
            {scanState === 'success' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center animate-ping">
                  <svg className="w-6 h-6 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}

            {/* Corner indicators */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary"></div>

            {/* Status indicator */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                scanState === 'success' 
                  ? 'bg-success-container' 
                  : scanState === 'error'
                  ? 'bg-error-container'
                  : cameraError
                  ? 'bg-error-container'
                  : isInitializing
                  ? 'bg-surface-container'
                  : 'bg-primary'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  scanState === 'success'
                    ? 'bg-on-success-container'
                    : scanState === 'error' || cameraError
                    ? 'bg-on-error-container'
                    : isInitializing
                    ? 'bg-on-surface-variant'
                    : 'bg-on-primary'
                } ${(scanState === 'scanning' || scanState === 'idle') && !isInitializing && !cameraError ? 'animate-pulse' : ''}`}></div>
                <span className={`label-small ${
                  scanState === 'success'
                    ? 'text-on-success-container'
                    : scanState === 'error' || cameraError
                    ? 'text-on-error-container'
                    : isInitializing
                    ? 'text-on-surface-variant'
                    : 'text-on-primary'
                }`}>
                  {scanState === 'success'
                    ? 'SCANNED!'
                    : scanState === 'scanning'
                    ? 'SCANNING...'
                    : scanState === 'error' || cameraError
                    ? 'ERROR'
                    : isInitializing
                    ? 'INITIALIZING...'
                    : cameraActive
                    ? 'READY'
                    : shouldShowFakeScan
                    ? 'CLICK TO SCAN'
                    : 'NO CAMERA'}
                </span>
              </div>
            </div>

            {/* Scan message overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="bg-primary/90 backdrop-blur-sm rounded-lg px-4 py-2 opacity-0 hover:opacity-100 transition-opacity">
                <span className="label-medium text-on-primary">
                  {scanMessage || (shouldShowFakeScan ? 'Click to scan' : 'Position code in frame')}
                </span>
              </div>
            </div>
          </button>
        </div>
        )}

        {/* Scanning frame overlay - shown when camera is active (non-interactive) */}
        {cameraActive && !shouldShowFakeScan && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
            <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
              {/* Corner indicators */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
            </div>
            {/* Status indicator for active camera */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                scanState === 'success' 
                  ? 'bg-success-container' 
                  : scanState === 'error'
                  ? 'bg-error-container'
                  : cameraError
                  ? 'bg-error-container'
                  : isInitializing
                  ? 'bg-surface-container'
                  : 'bg-primary'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  scanState === 'success'
                    ? 'bg-on-success-container'
                    : scanState === 'error' || cameraError
                    ? 'bg-on-error-container'
                    : isInitializing
                    ? 'bg-on-surface-variant'
                    : 'bg-on-primary'
                } ${(scanState === 'scanning' || scanState === 'idle') && !isInitializing && !cameraError ? 'animate-pulse' : ''}`}></div>
                <span className={`label-small ${
                  scanState === 'success'
                    ? 'text-on-success-container'
                    : scanState === 'error' || cameraError
                    ? 'text-on-error-container'
                    : isInitializing
                    ? 'text-on-surface-variant'
                    : 'text-on-primary'
                }`}>
                  {scanState === 'success'
                    ? 'SCANNED!'
                    : scanState === 'scanning'
                    ? 'SCANNING...'
                    : scanState === 'error' || cameraError
                    ? 'ERROR'
                    : isInitializing
                    ? 'INITIALIZING...'
                    : 'READY'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {cameraError && (
          <div className="absolute bottom-4 left-4 right-4 bg-error-container/90 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="body-small text-on-error-container text-center">
              Camera error: {cameraError}
            </p>
            {shouldShowFakeScan && (
              <p className="body-small text-on-error-container text-center mt-1">
                Using fake scan mode
              </p>
            )}
          </div>
        )}

        {/* Debug info */}
        {debug && (
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs p-2 rounded font-mono z-20">
            <div>Device: {isMobile ? 'Mobile/Tablet' : 'Desktop'}</div>
            <div>Camera: {hasCamera ? 'Supported' : 'Not supported'}</div>
            <div>Active: {cameraActive ? 'Yes' : 'No'}</div>
            <div>State: {scanState}</div>
            {lastScannedCode && <div>Last: {lastScannedCode}</div>}
          </div>
        )}
      </div>

      {/* Manual Entry Section */}
      {showManualEntry && (
        <div className="p-4 border-t border-outline-variant bg-surface">
          {!showManualInput ? (
            <button
              className="w-full text-primary hover:bg-primary-container/10 focus:bg-primary-container/10 active:bg-primary-container/20 transition-colors py-3 rounded-md label-medium min-h-[48px] touch-manipulation"
              onClick={() => setShowManualInput(true)}
            >
              Enter code manually
            </button>
          ) : (
            <div className="space-y-3">
              <div className="title-small text-on-surface text-center">
                Enter code manually
              </div>
              <input
                type="text"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleManualSubmit();
                  }
                }}
                placeholder="e.g. SCAN-12345678"
                className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-md focus:border-primary focus:outline-none text-on-surface body-large"
                autoFocus
              />
              <div className="flex flex-row flex-wrap gap-2">
                <button
                  onClick={() => {
                    setShowManualInput(false);
                    setManualValue('');
                  }}
                  className="flex-1 min-w-[180px] border border-outline text-on-surface hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors px-4 py-3 rounded-lg h-[56px] label-large touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualValue.trim()}
                  className="flex-1 min-w-[180px] bg-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 text-on-primary transition-colors disabled:opacity-38 disabled:cursor-not-allowed px-4 py-3 rounded-lg h-[56px] label-large touch-manipulation"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
