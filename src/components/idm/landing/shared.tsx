'use client';

import { useRef, useEffect, useState, type ReactNode } from 'react';

/* ========== Swipe Navigation Hook (DISABLED — removed auto-snap for natural scrolling) ========== */
export function useSwipeNavigation() {
  // Intentionally empty — previous implementation forced scrollIntoView on swipe,
  // which caused sections to be skipped on mobile (especially "Cerita Kami").
  // Users can now scroll freely; bottom nav still provides quick section navigation.
}

/* ========== Scroll-triggered Section Wrapper with Subtle Parallax ========== */
export function AnimatedSection({ children, className = '', variant = 'fadeUp', parallax = false }: {
  children: ReactNode;
  className?: string;
  variant?: 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'scaleIn';
  parallax?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: '-40px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Subtle parallax offset — element drifts based on scroll position
  // Increased from ±8px to ±20px for visible but still subtle effect
  useEffect(() => {
    if (!parallax || !isVisible) return;
    const el = ref.current;
    if (!el) return;

    let ticking = false;
    let rafId = 0;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const viewH = window.innerHeight;
          // Only apply when element is in viewport
          if (rect.bottom > 0 && rect.top < viewH) {
            const centerOffset = (rect.top + rect.height / 2 - viewH / 2) / viewH;
            // ±20px parallax range — visible but still subtle
            el.style.transform = `translate3d(0, ${centerOffset * -20}px, 0)`;
          }
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [parallax, isVisible]);

  // Map variant to CSS animation class
  const animClass = isVisible ? (parallax ? 'animate-reveal-parallax' : 'animate-fade-enter') : 'opacity-0';

  return (
    <div
      ref={ref}
      className={`${animClass} ${className}`}
    >
      {children}
    </div>
  );
}

/* ========== Section Header Component ========== */
export function SectionHeader({ icon: Icon, label, title, subtitle }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="stagger-item-fast text-center mb-14">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-idm-gold-warm" />
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-idm-gold-warm/20 bg-idm-gold-warm/5">
          <Icon className="w-4 h-4 text-idm-gold-warm" />
          <span className="text-[11px] font-bold text-idm-gold-warm uppercase tracking-widest">{label}</span>
        </div>
        <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-idm-gold-warm" />
      </div>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gradient-champion">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-4 max-w-lg mx-auto leading-relaxed">{subtitle}</p>}
    </div>
  );
}

/* ========== Parallax Stats Counter ========== */
export function StatCard({ icon: Icon, value, label, delay }: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <div
      className="animate-fade-enter-sm group relative"
      style={{ animationDelay: `${delay * 1000}ms` }}
    >
      <div className="perspective-card relative p-3 sm:p-5 rounded-xl sm:rounded-2xl glass border-0 card-shine card-border-glow text-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,168,83,0.15)]">
        <div className="w-7 h-7 sm:w-10 sm:h-10 mx-auto mb-1.5 sm:mb-3 rounded-lg sm:rounded-xl bg-idm-gold-warm/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-idm-gold-warm" />
        </div>
        <p className="text-sm sm:text-2xl font-black text-gradient-fury">{value}</p>
        <p className="text-[9px] sm:text-[11px] text-muted-foreground mt-0.5 sm:mt-1 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}
