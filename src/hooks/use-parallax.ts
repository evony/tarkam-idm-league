'use client';

import { useEffect, useRef, useCallback } from 'react';

/* ============================================================
   PARALLAX HOOKS — Pure JS, rAF-driven, no Framer Motion
   
   Design philosophy:
   - useParallax: Simple translateY on any element (BG, decorative)
   - useSectionParallax: Viewport-center-relative offset for sections
   - useHeroParallax: Full cinematic parallax with scale + opacity + translateY
     (replaces Framer Motion's useScroll + useTransform)
   ============================================================ */

/**
 * Simple parallax hook — scroll-driven translateY
 * Works with both window scroll and container scroll.
 */
interface ParallaxOptions {
  speed?: number;
  maxOffset?: number;
  enabled?: boolean;
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

    const scrollY = scrollContainerRef?.current
      ? scrollContainerRef.current.scrollTop
      : window.scrollY;

    const translateY = Math.min(scrollY * speed, maxOffset);
    el.style.transform = `translate3d(0, ${translateY}px, 0)`;
    ticking.current = false;
  }, [speed, maxOffset, enabled, scrollContainerRef]);

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
      if (container) container.removeEventListener('scroll', onScroll);
      else window.removeEventListener('scroll', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [enabled, updateTransform, scrollContainerRef]);

  return ref;
}

/**
 * Section parallax hook — viewport-center-relative offset
 * Element drifts slightly as it passes through viewport center.
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
      if (container) container.removeEventListener('scroll', onScroll);
      else window.removeEventListener('scroll', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [enabled, updateTransform, scrollContainerRef]);

  return ref;
}

/**
 * ═══════════════════════════════════════════════════════════
 * HERO PARALLAX — Cinematic multi-transform parallax
 * Replaces Framer Motion's useScroll + useTransform
 * ═══════════════════════════════════════════════════════════
 *
 * Drives 3 separate elements with different parallax transforms:
 * 1. Background: translateY (slow) + scale (slight zoom in as you scroll)
 * 2. Mid-layer: translateY (medium speed)
 * 3. Content: translateY (upward, faster) + opacity (fade out)
 *
 * This creates the classic "museum exhibit" depth illusion where:
 * - Deep BG stays behind, slowly drifting and zooming
 * - Mid elements (gradients, overlays) move at medium speed
 * - Foreground content (text, buttons) moves fastest and fades
 *
 * @example
 * const { bgRef, midRef, contentRef } = useHeroParallax();
 * return (
 *   <section ref={sectionRef}>
 *     <div ref={bgRef}>background image</div>
 *     <div ref={midRef}>gradients & overlays</div>
 *     <div ref={contentRef}>text & buttons</div>
 *   </section>
 * );
 */
interface HeroParallaxOptions {
  /** Whether parallax is enabled (default: true) */
  enabled?: boolean;
  /** Ref to the hero section element — used to calculate scroll progress within the section */
  sectionRef: React.RefObject<HTMLElement | null>;
  /** BG translateY speed (default: 0.4 = BG moves at 40% of scroll) */
  bgSpeed?: number;
  /** BG scale range (default: 0.04 = scales from 1.0 to 1.04 as you scroll) */
  bgScaleRange?: number;
  /** Mid-layer translateY speed (default: 0.2) */
  midSpeed?: number;
  /** Content translateY speed — negative = moves UP (default: -0.15 = content rises at 15%) */
  contentSpeed?: number;
  /** Content opacity: how much to fade when section is fully scrolled past (default: 0.3 = fades to 70%) */
  contentFade?: number;
}

export function useHeroParallax(options: HeroParallaxOptions) {
  const {
    enabled = true,
    sectionRef,
    bgSpeed = 0.4,
    bgScaleRange = 0.04,
    midSpeed = 0.2,
    contentSpeed = -0.15,
    contentFade = 0.3,
  } = options;

  const bgRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);
  const ticking = useRef(false);

  const updateTransforms = useCallback(() => {
    if (!enabled) return;

    const section = sectionRef.current;
    if (!section) return;

    // Calculate scroll progress relative to the section (0 = top of section at viewport top, 1 = section fully scrolled past)
    const rect = section.getBoundingClientRect();
    const sectionHeight = rect.height;
    // When section top is at viewport top: progress = 0
    // When section bottom is at viewport top: progress = 1
    const rawProgress = -rect.top / sectionHeight;
    const progress = Math.max(0, Math.min(1, rawProgress));

    // Apply BG transform: translateY + scale
    const bgEl = bgRef.current;
    if (bgEl) {
      const bgY = progress * sectionHeight * bgSpeed;
      const bgScale = 1 + progress * bgScaleRange;
      bgEl.style.transform = `translate3d(0, ${bgY}px, 0) scale(${bgScale})`;
    }

    // Apply mid-layer transform: translateY
    const midEl = midRef.current;
    if (midEl) {
      const midY = progress * sectionHeight * midSpeed;
      midEl.style.transform = `translate3d(0, ${midY}px, 0)`;
    }

    // Apply content transform: translateY (upward) + opacity fade
    const contentEl = contentRef.current;
    if (contentEl) {
      const contentY = progress * sectionHeight * contentSpeed;
      const opacity = 1 - progress * contentFade;
      contentEl.style.transform = `translate3d(0, ${contentY}px, 0)`;
      contentEl.style.opacity = `${Math.max(0, opacity)}`;
    }

    ticking.current = false;
  }, [enabled, sectionRef, bgSpeed, bgScaleRange, midSpeed, contentSpeed, contentFade]);

  useEffect(() => {
    if (!enabled) {
      // Reset all transforms
      if (bgRef.current) { bgRef.current.style.transform = ''; bgRef.current.style.opacity = ''; }
      if (midRef.current) { midRef.current.style.transform = ''; }
      if (contentRef.current) { contentRef.current.style.transform = ''; contentRef.current.style.opacity = ''; }
      return;
    }

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        rafId.current = requestAnimationFrame(updateTransforms);
      }
    };

    updateTransforms();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [enabled, updateTransforms]);

  return { bgRef, midRef, contentRef };
}

/**
 * Multi-layer parallax hook — different speeds for different layers
 */
export function useMultiLayerParallax<T extends HTMLElement = HTMLDivElement>(
  layers: Array<{ speed: number; maxOffset: number }>,
  options: { enabled?: boolean; scrollContainerRef?: React.RefObject<HTMLElement | null> } = {}
) {
  const { enabled = true, scrollContainerRef } = options;
  const refs = useRef<Array<React.RefObject<T | null>>>([]);
  const rafId = useRef<number>(0);
  const ticking = useRef(false);

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
      if (container) container.removeEventListener('scroll', onScroll);
      else window.removeEventListener('scroll', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [enabled, updateTransforms, scrollContainerRef]);

  return refs.current;
}
