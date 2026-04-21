'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Lightweight parallax hook — scroll-driven translateY
 * Uses requestAnimationFrame for smooth 60fps updates
 * No Framer Motion dependency — pure vanilla JS
 *
 * Inspired by museum-style parallax: background moves slower than scroll
 *
 * @param speed - Parallax speed factor (0-1). 0.2 = bg moves at 20% of scroll speed
 * @param maxOffset - Maximum translateY in pixels (cap to prevent over-movement)
 * @param enabled - Toggle parallax on/off (useful for reduced motion)
 *
 * @example
 * const bgRef = useParallax({ speed: 0.15, maxOffset: 120 });
 * return <div ref={bgRef} className="parallax-bg absolute inset-0">...</div>;
 */
interface ParallaxOptions {
  speed?: number;
  maxOffset?: number;
  enabled?: boolean;
}

export function useParallax<T extends HTMLElement = HTMLDivElement>(
  options: ParallaxOptions = {}
) {
  const { speed = 0.15, maxOffset = 120, enabled = true } = options;
  const ref = useRef<T>(null);
  const rafId = useRef<number>(0);
  const ticking = useRef(false);

  const updateTransform = useCallback(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const scrollY = window.scrollY;
    // Calculate translateY: scroll * speed, capped at maxOffset
    const translateY = Math.min(scrollY * speed, maxOffset);

    el.style.transform = `translateY(${translateY}px)`;
    ticking.current = false;
  }, [speed, maxOffset, enabled]);

  useEffect(() => {
    if (!enabled) {
      // Reset transform when disabled
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

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [enabled, updateTransform]);

  return ref;
}

/**
 * Section parallax hook — applies subtle offset to section backgrounds
 * based on how far the section is from viewport center
 *
 * @param speed - Movement speed (typically 0.03-0.08 for subtlety)
 * @param enabled - Toggle
 */
export function useSectionParallax<T extends HTMLElement = HTMLDivElement>(
  options: { speed?: number; enabled?: boolean } = {}
) {
  const { speed = 0.05, enabled = true } = options;
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
    // Negative = above center (move down slightly), positive = below center (move up slightly)
    const translateY = distanceFromCenter * speed * -1;

    el.style.transform = `translateY(${translateY}px)`;
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
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [enabled, updateTransform]);

  return ref;
}
