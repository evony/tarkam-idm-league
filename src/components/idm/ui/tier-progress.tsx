'use client';

import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TierProgressProps {
  /** Current tier of the player */
  currentTier: 'S' | 'A' | 'B' | 'C' | 'D';
  /** Current points of the player */
  points: number;
  /** Division determines accent colour scheme */
  division: 'male' | 'female';
  /** Optional extra class names */
  className?: string;
}

// ---------------------------------------------------------------------------
// Tier configuration
// ---------------------------------------------------------------------------

const TIER_ORDER: Array<'D' | 'C' | 'B' | 'A' | 'S'> = ['D', 'C', 'B', 'A', 'S'];

const TIER_THRESHOLDS: Record<string, number> = {
  D: 0,
  C: 50,
  B: 100,
  A: 150,
  S: 350,
};

interface TierColorSet {
  fill: string;
  gradient: string;
  glow: string;
  bg: string;
}

const TIER_COLORS_MALE: Record<string, TierColorSet> = {
  D: {
    fill: '#6b7280',      // gray-500
    gradient: 'from-gray-500 to-green-500',
    glow: 'rgba(107,114,128,0.5)',
    bg: 'rgba(107,114,128,0.15)',
  },
  C: {
    fill: '#22c55e',      // green-500
    gradient: 'from-green-500 to-blue-500',
    glow: 'rgba(34,197,94,0.5)',
    bg: 'rgba(34,197,94,0.15)',
  },
  B: {
    fill: '#3b82f6',      // blue-500
    gradient: 'from-blue-500 to-amber-500',
    glow: 'rgba(59,130,246,0.5)',
    bg: 'rgba(59,130,246,0.15)',
  },
  A: {
    fill: '#f59e0b',      // amber-500
    gradient: 'from-amber-500 to-red-500',
    glow: 'rgba(245,158,11,0.5)',
    bg: 'rgba(245,158,11,0.15)',
  },
  S: {
    fill: '#ef4444',      // red-500
    gradient: 'from-red-500 to-red-400',
    glow: 'rgba(239,68,68,0.5)',
    bg: 'rgba(239,68,68,0.15)',
  },
};

const TIER_COLORS_FEMALE: Record<string, TierColorSet> = {
  D: {
    fill: '#6b7280',
    gradient: 'from-gray-500 to-green-400',
    glow: 'rgba(107,114,128,0.5)',
    bg: 'rgba(107,114,128,0.15)',
  },
  C: {
    fill: '#4ade80',      // green-400
    gradient: 'from-green-400 to-purple-400',
    glow: 'rgba(74,222,128,0.5)',
    bg: 'rgba(74,222,128,0.15)',
  },
  B: {
    fill: '#a78bfa',      // purple-400
    gradient: 'from-purple-400 to-amber-400',
    glow: 'rgba(167,139,250,0.5)',
    bg: 'rgba(167,139,250,0.15)',
  },
  A: {
    fill: '#fbbf24',      // amber-400
    gradient: 'from-amber-400 to-pink-400',
    glow: 'rgba(251,191,36,0.5)',
    bg: 'rgba(251,191,36,0.15)',
  },
  S: {
    fill: '#f472b6',      // pink-400
    gradient: 'from-pink-400 to-pink-300',
    glow: 'rgba(244,114,182,0.5)',
    bg: 'rgba(244,114,182,0.15)',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTierIndex(tier: string): number {
  return TIER_ORDER.indexOf(tier as typeof TIER_ORDER[number]);
}

function getNextThreshold(tier: string): number | null {
  const idx = getTierIndex(tier);
  if (idx >= TIER_ORDER.length - 1) return null; // S tier — max
  return TIER_THRESHOLDS[TIER_ORDER[idx + 1]];
}

function getCurrentThreshold(tier: string): number {
  return TIER_THRESHOLDS[tier];
}

function getProgressInTier(points: number, tier: string): number {
  const min = getCurrentThreshold(tier);
  const max = getNextThreshold(tier);
  if (max === null) return 100; // S tier is always 100%
  const range = max - min;
  if (range <= 0) return 100;
  return Math.min(100, Math.max(0, ((points - min) / range) * 100));
}

function getOverallProgress(tier: string): number {
  // Position along the 0-100 scale where the tier begins
  const idx = getTierIndex(tier);
  return (idx / (TIER_ORDER.length - 1)) * 100;
}

function getColors(tier: string, division: 'male' | 'female'): TierColorSet {
  const palette = division === 'male' ? TIER_COLORS_MALE : TIER_COLORS_FEMALE;
  return palette[tier] ?? palette['D'];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TierProgress({
  currentTier,
  points,
  division,
  className = '',
}: TierProgressProps) {
  const [mounted, setMounted] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Small delay to trigger CSS transition after mount
    const timer = setTimeout(() => {
      const tierIdx = getTierIndex(currentTier);
      const baseProgress = (tierIdx / (TIER_ORDER.length - 1)) * 100;
      const tierProgress = getProgressInTier(points, currentTier);
      // Interpolate within the tier's segment
      const segmentSize = 100 / (TIER_ORDER.length - 1);
      const progress = baseProgress + (tierProgress / 100) * segmentSize;
      setAnimatedProgress(Math.min(100, progress));
    }, 50);
    return () => clearTimeout(timer);
  }, [currentTier, points]);

  const colors = getColors(currentTier, division);
  const accentColor = division === 'male' ? '#22d3ee' : '#c084fc'; // cyan-400 / purple-400
  const nextThreshold = getNextThreshold(currentTier);
  const progressInTier = getProgressInTier(points, currentTier);
  const isMaxTier = currentTier === 'S';

  const tierIdx = getTierIndex(currentTier);

  return (
    <div
      className={`relative rounded-2xl border border-white/10 bg-white/[0.08] p-4 sm:p-6 overflow-hidden ${className}`}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${accentColor}30 0%, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header: Tier badge + Points */}
        <div className="flex items-center justify-between mb-5">
          {/* Tier badge */}
          <div className="flex items-center gap-3">
            <div
              className="relative flex items-center justify-center w-12 h-12 rounded-xl border"
              style={{
                borderColor: `${colors.fill}40`,
                backgroundColor: colors.bg,
              }}
            >
              <Shield
                className="w-6 h-6"
                style={{ color: colors.fill }}
              />
              {/* Pulse ring */}
              <div
                className="absolute inset-0 rounded-xl animate-ping opacity-20"
                style={{ backgroundColor: colors.fill }}
              />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span
                  className="text-2xl font-black tracking-tight"
                  style={{ color: colors.fill }}
                >
                  {currentTier}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Tier
                </span>
              </div>
              <span
                className="text-[10px] font-medium uppercase tracking-widest"
                style={{ color: accentColor }}
              >
                {division === 'male' ? 'Male Division' : 'Female Division'}
              </span>
            </div>
          </div>

          {/* Points display */}
          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black" style={{ color: colors.fill }}>
                {points}
              </span>
              {!isMaxTier && nextThreshold !== null && (
                <span className="text-xs text-muted-foreground">
                  / {nextThreshold}
                </span>
              )}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {isMaxTier ? (
                <span className="text-red-400 font-semibold">MAX TIER</span>
              ) : (
                <span>{Math.round(progressInTier)}% to {TIER_ORDER[tierIdx + 1]}</span>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar with tier markers */}
        <div className="relative">
          {/* Track */}
          <div className="relative h-2.5 bg-muted/50 rounded-full overflow-hidden border border-white/5">
            {/* Fill bar with gradient */}
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r"
              style={{
                width: mounted ? `${animatedProgress}%` : '0%',
                transition: 'width 1s ease-out',
                backgroundImage: `linear-gradient(to right, ${colors.fill}, ${colors.fill}cc)`,
              }}
            />
            {/* Glow overlay */}
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: mounted ? `${animatedProgress}%` : '0%',
                transition: 'width 1s ease-out',
                background: `linear-gradient(to right, transparent, ${colors.glow})`,
              }}
            />
          </div>

          {/* Tier markers — positioned relative to the track */}
          <div className="relative mt-3">
            {TIER_ORDER.map((tier, idx) => {
              const isReached = getTierIndex(tier) <= tierIdx;
              const isCurrent = tier === currentTier;
              const position = (idx / (TIER_ORDER.length - 1)) * 100;
              const markerColors = getColors(tier, division);

              return (
                <div
                  key={tier}
                  className="absolute -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${position}%` }}
                >
                  {/* Marker dot */}
                  <div className="relative">
                    {isCurrent ? (
                      // Current tier: larger, pulsing glow
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: markerColors.fill,
                          boxShadow: `0 0 12px ${markerColors.glow}, 0 0 24px ${markerColors.glow}`,
                        }}
                      >
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    ) : isReached ? (
                      // Reached tier: filled dot
                      <div
                        className="w-3.5 h-3.5 rounded-full border-2"
                        style={{
                          backgroundColor: markerColors.fill,
                          borderColor: markerColors.fill,
                        }}
                      />
                    ) : (
                      // Future tier: hollow circle
                      <div
                        className="w-3.5 h-3.5 rounded-full border-2 bg-transparent"
                        style={{
                          borderColor: 'rgba(255,255,255,0.15)',
                        }}
                      />
                    )}
                  </div>

                  {/* Tier label */}
                  <span
                    className={`text-[11px] font-bold mt-1.5 ${
                      isCurrent
                        ? ''
                        : isReached
                          ? 'text-muted-foreground'
                          : 'text-muted-foreground/40'
                    }`}
                    style={isCurrent ? { color: markerColors.fill } : undefined}
                  >
                    {tier}
                  </span>

                  {/* Threshold label */}
                  <span
                    className={`text-[9px] mt-0.5 ${
                      isReached ? 'text-muted-foreground/60' : 'text-muted-foreground/25'
                    }`}
                  >
                    {TIER_THRESHOLDS[tier]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom stats row */}
        <div className="flex items-center justify-between mt-10 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-[10px] text-muted-foreground">
              {isMaxTier
                ? 'Highest tier achieved'
                : `${nextThreshold !== null ? nextThreshold - points : 0} pts to ${TIER_ORDER[tierIdx + 1]}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {TIER_ORDER.map((tier) => {
              const isReached = getTierIndex(tier) <= tierIdx;
              return (
                <div
                  key={tier}
                  className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                    isReached ? '' : 'bg-muted-foreground/20'
                  }`}
                  style={
                    isReached
                      ? { backgroundColor: getColors(tier, division).fill }
                      : undefined
                  }
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mini version for card embeds
// ---------------------------------------------------------------------------

interface TierProgressMiniProps {
  currentTier: 'S' | 'A' | 'B' | 'C' | 'D';
  points: number;
  division: 'male' | 'female';
  className?: string;
}

export function TierProgressMini({
  currentTier,
  points,
  division,
  className = '',
}: TierProgressMiniProps) {
  const [mounted, setMounted] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      const tierIdx = getTierIndex(currentTier);
      const baseProgress = (tierIdx / (TIER_ORDER.length - 1)) * 100;
      const tierProgress = getProgressInTier(points, currentTier);
      const segmentSize = 100 / (TIER_ORDER.length - 1);
      const progress = baseProgress + (tierProgress / 100) * segmentSize;
      setAnimatedProgress(Math.min(100, progress));
    }, 50);
    return () => clearTimeout(timer);
  }, [currentTier, points]);

  const colors = getColors(currentTier, division);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className="text-xs font-bold min-w-[14px] text-center"
        style={{ color: colors.fill }}
      >
        {currentTier}
      </span>
      <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: mounted ? `${animatedProgress}%` : '0%',
            transition: 'width 1s ease-out',
            backgroundColor: colors.fill,
          }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground tabular-nums">{points}</span>
    </div>
  );
}
