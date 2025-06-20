// src/hooks/useResponsive.ts
import { useState, useEffect } from 'react';

// Breakpoint values matching Tailwind's defaults
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Hook to detect if the viewport matches a media query
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);

    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        // Fallback for older browsers
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Hook to check if viewport is at or above a breakpoint
 */
export function useBreakpoint(breakpoint: BreakpointKey): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS[breakpoint]}px)`);
}

/**
 * Hook to get current breakpoint
 */
export function useCurrentBreakpoint(): BreakpointKey | 'xs' {
  const sm = useBreakpoint('sm');
  const md = useBreakpoint('md');
  const lg = useBreakpoint('lg');
  const xl = useBreakpoint('xl');
  const xxl = useBreakpoint('2xl');

  if (xxl) return '2xl';
  if (xl) return 'xl';
  if (lg) return 'lg';
  if (md) return 'md';
  if (sm) return 'sm';
  return 'xs';
}

/**
 * Hook for common responsive checks
 */
export function useResponsive() {
  const currentBreakpoint = useCurrentBreakpoint();
  const isMobile = !useBreakpoint('md'); // < 768px
  const isTablet = useBreakpoint('md') && !useBreakpoint('lg'); // 768px - 1023px
  const isDesktop = useBreakpoint('lg'); // >= 1024px
  
  return {
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    // Utility functions
    isBreakpoint: (bp: BreakpointKey) => useBreakpoint(bp),
    isAbove: (bp: BreakpointKey) => useBreakpoint(bp),
    isBelow: (bp: BreakpointKey) => {
      const breakpointValue = BREAKPOINTS[bp];
      return !useMediaQuery(`(min-width: ${breakpointValue}px)`);
    },
  };
}

/**
 * Hook to detect touch device
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState<boolean>(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkTouch();
    window.addEventListener('resize', checkTouch);

    return () => {
      window.removeEventListener('resize', checkTouch);
    };
  }, []);

  return isTouch;
}

/**
 * Hook for window dimensions
 */
export function useWindowDimensions() {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return dimensions;
}

/**
 * Hook for device orientation
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const { width, height } = useWindowDimensions();
  return width < height ? 'portrait' : 'landscape';
}

/**
 * Hook for reduced motion preference
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Hook for dark mode preference
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}