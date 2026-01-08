/**
 * Performance monitoring utilities for mobile optimization
 */

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage?: number;
}

/**
 * Measure component render time
 */
export function measureRenderTime(componentName: string): () => void {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 16) {
      // Log slow renders (> 1 frame at 60fps)
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  };
}

/**
 * Measure page load time
 */
export function measurePageLoad(): PerformanceMetrics | null {
  if (typeof window === 'undefined' || !window.performance) return null;
  
  const perfData = window.performance.timing;
  const loadTime = perfData.loadEventEnd - perfData.navigationStart;
  const renderTime = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
  const interactionTime = perfData.domInteractive - perfData.navigationStart;
  
  // @ts-ignore - memory is experimental
  const memory = performance.memory;
  const memoryUsage = memory ? memory.usedJSHeapSize / 1048576 : undefined; // Convert to MB
  
  return {
    loadTime,
    renderTime,
    interactionTime,
    memoryUsage
  };
}

/**
 * Check if the device is experiencing performance issues
 */
export function isLowPerformanceDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 2;
  if (cores < 4) return true;
  
  // @ts-ignore - memory is experimental
  const memory = navigator.deviceMemory;
  if (memory && memory < 4) return true;
  
  return false;
}

/**
 * Request idle callback with fallback
 */
export function requestIdleCallback(callback: () => void, timeout = 2000): number {
  if (typeof window === 'undefined') return 0;
  
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout });
  }
  
  // Fallback to setTimeout
  return setTimeout(callback, 1) as unknown as number;
}

/**
 * Cancel idle callback with fallback
 */
export function cancelIdleCallback(id: number): void {
  if (typeof window === 'undefined') return;
  
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Optimize animations based on device performance
 */
export function getOptimalAnimationDuration(baseDuration: number): number {
  if (isLowPerformanceDevice()) {
    // Reduce animation duration on low-end devices
    return baseDuration * 0.5;
  }
  
  return baseDuration;
}

/**
 * Check if animations should be disabled
 */
export function shouldDisableAnimations(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check user preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return true;
  
  // Disable on very low-end devices
  return isLowPerformanceDevice();
}

/**
 * Lazy load images in viewport
 */
export function observeImageLoading(
  element: HTMLElement,
  callback: () => void
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // Fallback: load immediately
    callback();
    return null;
  }
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(element);
        }
      });
    },
    {
      rootMargin: '50px' // Start loading 50px before entering viewport
    }
  );
  
  observer.observe(element);
  return observer;
}

/**
 * Preload critical resources
 */
export function preloadResource(url: string, type: 'image' | 'script' | 'style'): void {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  
  switch (type) {
    case 'image':
      link.as = 'image';
      break;
    case 'script':
      link.as = 'script';
      break;
    case 'style':
      link.as = 'style';
      break;
  }
  
  document.head.appendChild(link);
}

/**
 * Batch DOM updates for better performance
 */
export function batchDOMUpdates(updates: Array<() => void>): void {
  if (typeof window === 'undefined') return;
  
  requestAnimationFrame(() => {
    updates.forEach((update) => update());
  });
}
