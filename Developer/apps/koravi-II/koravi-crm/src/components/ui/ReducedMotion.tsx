'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ReducedMotionContextType {
  prefersReducedMotion: boolean;
}

const ReducedMotionContext = createContext<ReducedMotionContextType>({
  prefersReducedMotion: false,
});

export function useReducedMotion() {
  return useContext(ReducedMotionContext);
}

interface ReducedMotionProviderProps {
  children: ReactNode;
}

export function ReducedMotionProvider({ children }: ReducedMotionProviderProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ReducedMotionContext.Provider value={{ prefersReducedMotion }}>
      {children}
    </ReducedMotionContext.Provider>
  );
}

// Helper function to get motion-safe variants
export function getMotionVariants(
  normalVariants: any,
  reducedVariants?: any
) {
  const { prefersReducedMotion } = useReducedMotion();
  
  if (prefersReducedMotion && reducedVariants) {
    return reducedVariants;
  }
  
  if (prefersReducedMotion) {
    // Return simplified variants with no animations
    const simplified: any = {};
    Object.keys(normalVariants).forEach(key => {
      if (typeof normalVariants[key] === 'object') {
        simplified[key] = {
          ...normalVariants[key],
          transition: { duration: 0 },
        };
      } else {
        simplified[key] = normalVariants[key];
      }
    });
    return simplified;
  }
  
  return normalVariants;
}

// Motion-safe wrapper component
interface MotionSafeProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function MotionSafe({ children, fallback }: MotionSafeProps) {
  const { prefersReducedMotion } = useReducedMotion();
  
  if (prefersReducedMotion && fallback) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}