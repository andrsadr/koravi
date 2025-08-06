'use client';

import { useEffect } from 'react';
import { initWebVitals, observePerformance } from '@/lib/performance';

export function PerformanceMonitor() {
  useEffect(() => {
    // Initialize Web Vitals monitoring
    initWebVitals();
    observePerformance();
  }, []);

  // This component doesn't render anything
  return null;
}