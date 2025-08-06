// Simple performance monitoring without web-vitals dependency
export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export function initWebVitals() {
  if (typeof window === 'undefined') return;
  
  // Simple performance logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Performance] Web Vitals monitoring initialized');
    
    // Log basic performance metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          console.log('[Performance] Page Load Time:', navigation.loadEventEnd - navigation.fetchStart, 'ms');
          console.log('[Performance] DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.fetchStart, 'ms');
        }
      }, 0);
    });
  }
}

export function observePerformance() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  // Observe long tasks (> 50ms)
  try {
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn(`[Performance] Long task detected: ${entry.duration}ms`);
        }
      }
    });
    longTaskObserver.observe({ entryTypes: ['longtask'] });
  } catch {
    // Long task API not supported
  }
}