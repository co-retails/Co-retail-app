/**
 * Device detection utilities for camera scanning
 */

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check user agent for mobile devices
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  // Also check screen width (mobile is typically < 768px)
  const isMobileWidth = window.innerWidth < 768;
  
  // Check for touch support
  const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return mobileRegex.test(userAgent) || (isMobileWidth && hasTouchSupport);
}

export function isTabletDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const tabletRegex = /ipad|android(?!.*mobile)|tablet/i;
  
  // Check screen width (tablet is typically 768px - 1024px)
  const isTabletWidth = window.innerWidth >= 768 && window.innerWidth < 1024;
  
  return tabletRegex.test(userAgent) || isTabletWidth;
}

export function isMobileOrTablet(): boolean {
  return isMobileDevice() || isTabletDevice();
}

export function hasCameraSupport(): boolean {
  if (typeof navigator === 'undefined') return false;
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}





