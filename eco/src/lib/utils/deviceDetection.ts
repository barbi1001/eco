/**
 * Device detection utilities for optimizing performance
 */

/**
 * Check if the current device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Check if the current device is a touch device
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - msMaxTouchPoints is IE specific
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Get the current viewport width
 */
export function getViewportWidth(): number {
  if (typeof window === 'undefined') return 0;
  
  return Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0
  );
}

/**
 * Check if the current viewport is mobile-sized
 */
export function isMobileViewport(): boolean {
  return getViewportWidth() < 768;
}

/**
 * Check if the current viewport is tablet-sized
 */
export function isTabletViewport(): boolean {
  const width = getViewportWidth();
  return width >= 768 && width < 1024;
}

/**
 * Check if the current viewport is desktop-sized
 */
export function isDesktopViewport(): boolean {
  return getViewportWidth() >= 1024;
}

/**
 * Get device pixel ratio for image optimization
 */
export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') return 1;
  
  return window.devicePixelRatio || 1;
}

/**
 * Check if the device supports WebP images
 */
export async function supportsWebP(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * Debounce function for resize events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get optimal image quality based on device and connection
 */
export function getOptimalImageQuality(): number {
  if (typeof window === 'undefined') return 0.8;
  
  // @ts-ignore - connection is experimental
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) return 0.8;
  
  // Lower quality for slow connections
  if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
    return 0.5;
  }
  
  if (connection.effectiveType === '3g') {
    return 0.7;
  }
  
  // High quality for fast connections
  return 0.9;
}
