/**
 * Custom hook to check if the user prefers reduced motion
 * Respects the prefers-reduced-motion media query
 * 
 * Usage:
 * const prefersReducedMotion = useReducedMotion();
 * 
 * // Then in your motion components:
 * initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
 * animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
 */

import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes to the media query
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    // Use addEventListener instead of deprecated addListener
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}
