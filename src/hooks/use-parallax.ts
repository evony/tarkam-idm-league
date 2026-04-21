'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Lightweight parallax hook — scroll-driven translateY
 * Uses requestAnimationFrame for smooth 60fps updates
 * No Framer Motion dependency — pure vanilla JS
 *
 * Supports BOTH window scrolling AND container-based scrolling.
 * For container scrolling (e.g. dashboard main content), pass a scrollContainerRef.
 *
 * Inspired by museum-style parallax: background moves slower than scroll
 *
 * @param speed - Parallax speed factor (0-1). 0.3 = bg moves at 30% of scroll speed
 * @param maxOffset - Maximum translateY in pixels (cap to prevent over-movement)
 * @param enabled - Toggle parallax on/off (useful for reduced motion)
 * @param scrollContainerRef - Optional ref to a scroll container element.
 *   When provided, reads scrollTop from this container instead of window.scrollY.
 *   Critical for dashboard where main content scrolls inside <main> not the window.
 *
 * @example
 * // Window scrolling (landing page)
 * const bgRef = useParallax({ speed: 0.3, maxOffset: 150 });
 * return <div ref={bgRef} className="parallax-bg absolute inset-0">...</div>;
 *
 * @example
 * // Container scrolling (dashboard)
 * const containerRef = useRef<HTMLElement>(null);
 * const bgRef = useParallax({ speed: 0.2, maxOffset: 80, scrollContainerRef: containerRef });
 */
interface ParallaxOptions {
  speed?: number;
  maxOffset?: number;
  enabled?: boolean;
  /** Ref to scroll container — when provided, reads scrollTop from this instead of window */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

export function useParallax<T extends HTMLElement = HTMLDivElement>(
  options: ParallaxOptions = {}
) {
  const { speed = 0.3, maxOffset = 150, enabled = true, scrollContainerRef } = options;
  const ref = useRef<T>(null);
  const rafId = useRef<number>(0);
  const ticking = useRef(false);

  const updateTransform = useCallback(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    // Support both window scroll and container scroll
    const scrollY = scrollContainerRef?.current
      ? scrollContainerRef.current.scrollTop
      : window.scrollY;

    // Calculate translateY: scroll * speed, capped at maxOffset
    const translateY = Math.min(scrollY * speed, maxOffset);

    el.style.transform = `translate3d(0, ${translateY}px, 0)`;
    ticking.current = false;
  }, [speed, maxOffset, enabled, scrollContainerRef]);

  useEffect(() => {
    if (!enabled) {
      if (ref.current) {
        ref.current.style.transform = '';
      }
      return;
    }

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        rafId.current = requestAnimationFrame(updateTransform);
      }
    };

    // Initial update
    updateTransform();

    // Listen to either container or window scroll
    const container = scrollContainerRef?.current;
    if (container) {
      container.addEventListener('scroll', onScroll, { passive: true });
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', onScroll);
      } else {
        window.removeEventListener('scroll', onScroll);
      }
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [enabled, updateTransform, scrollContainerRef]);

  return ref;
}

/**
 * Section parallax hook — applies subtle offset to section backgrounds
 * based on how far the section is from viewport center
 *
 * Works with BOTH window scroll and container scroll.
 *
 * @param speed - Movement speed (typically 0.05-0.12 for subtlety)
 * @param enabled - Toggle
 * @param scrollContainerRef - Optional scroll container ref
 */
export function useSectionParallax<T extends HTMLElement = HTMLDivElement>(
  options: { speed?: number; enabled?: boolean; scrollContainerRef?: React.RefObject<HTMLElement | null> } = {}
) {
  const { speed = 0.08, enabled = true, scrollContainerRef } = options;
  const ref = useRef<T>(null);
  const rafId = useRef<number>(0);
  const ticking = useRef(false);

  const updateTransform = useCallback(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const rect = el.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const elementCenter = rect.top + rect.height / 2;
    const distanceFromCenter = elementCenter - viewportCenter;

    // Translate based on distance from viewport center
    const translateY = distanceFromCenter * speed * -1;

    el.style.transform = `translate3d(0, ${translateY}px, 0)`;
    ticking.current = false;
  }, [speed, enabled]);

  useEffect(() => {
    if (!enabled) {
      if (ref.current) ref.current.style.transform = '';
      return;
    }

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        rafId.current = requestAnimationFrame(updateTransform);
      }
    };

    updateTransform();

    const container = scrollContainerRef?.current;
    if (container) {
      container.addEventListener('scroll', onScroll, { passive: true });
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', onScroll);
      } else {
        window.removeEventListener('scroll', onScroll);
      }
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [enabled, updateTransform, scrollContainerRef]);

  return ref;
}

/**
 * Multi-layer parallax hook — applies different speeds to different layers
 * Creates depth illusion like museum exhibits
 *
 * @param layers - Array of { speed, maxOffset } for each layer
 * @param enabled - Toggle
 * @param scrollContainerRef - Optional scroll container ref
 * @returns Array of refs — one per layer
 */
export function useMultiLayerParallax<T extends HTMLElement = HTMLDivElement>(
  layers: Array<{ speed: number; maxOffset: number }>,
  options: { enabled?: boolean; scrollContainerRef?: React.RefObject<HTMLElement | null> } = {}
) {
  const { enabled = true, scrollContainerRef } = options;
  const refs = useRef<Array<React.RefObject<T | null>>>([]);
  const rafId = useRef<number>(0);
  const ticking = useRef(false);

  // Initialize refs for each layer
  if (refs.current.length !== layers.length) {
    refs.current = layers.map(() => ({ current: null }));
  }

  const updateTransforms = useCallback(() => {
    if (!enabled) return;

    const scrollY = scrollContainerRef?.current
      ? scrollContainerRef.current.scrollTop
      : window.scrollY;

    layers.forEach((layer, i) => {
      const el = refs.current[i]?.current;
      if (!el) return;
      const translateY = Math.min(scrollY * layer.speed, layer.maxOffset);
      el.style.transform = `translate3d(0, ${translateY}px, 0)`;
    });

    ticking.current = false;
  }, [layers, enabled, scrollContainerRef]);

  useEffect(() => {
    if (!enabled) {
      refs.current.forEach(r => { if (r.current) r.current.style.transform = ''; });
      return;
    }

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        rafId.current = requestAnimationFrame(updateTransforms);
      }
    };

    updateTransforms();

    const container = scrollContainerRef?.current;
    if (container) {
      container.addEventListener('scroll', onScroll, { passive: true });
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', onScroll);
      } else {
        window.removeEventListener('scroll', onScroll);
      }
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [enabled, updateTransforms, scrollContainerRef]);

  return refs.current;
}
