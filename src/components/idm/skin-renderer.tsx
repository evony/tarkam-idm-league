'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  resolveSkinColors,
  parseBadgeColors,
  buildGradient,
  parseColorStops,
} from '@/lib/skin-utils';
import type { SkinColors } from '@/lib/skin-utils';

// ============================================
// PROP TYPES
// ============================================

interface SkinBadgeProps {
  skin: {
    type: string;
    icon: string;
    displayName: string;
    colorClass: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

interface SkinBadgesRowProps {
  skins: Array<{
    type: string;
    icon: string;
    displayName: string;
    colorClass: string;
    priority: number;
  }>;
}

interface SkinAvatarFrameProps {
  skin: { type: string; colorClass: string } | null;
  children: React.ReactNode;
}

interface SkinNameProps {
  skin: { type: string; colorClass: string } | null;
  children: React.ReactNode;
}

interface SkinCardBorderProps {
  skin: { type: string; colorClass: string } | null;
  children: React.ReactNode;
}

// ============================================
// SkinBadge — Small badge showing skin icon + optional label
// ============================================

export function SkinBadge({ skin, size = 'sm' }: SkinBadgeProps) {
  const colors = resolveSkinColors(skin);

  // sm: just the emoji icon
  if (size === 'sm') {
    return (
      <span
        className="inline-flex items-center justify-center leading-none"
        style={{ fontSize: '14px' }}
        title={skin.displayName}
        role="img"
        aria-label={skin.displayName}
      >
        {skin.icon}
      </span>
    );
  }

  // md: icon + short label (first word)
  if (size === 'md') {
    const badgeColors = colors ? parseBadgeColors(colors.badge) : null;
    return (
      <span
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold"
        style={{
          backgroundColor: badgeColors?.bg ?? 'rgba(255,255,255,0.1)',
          color: badgeColors?.text ?? 'rgba(255,255,255,0.7)',
        }}
        title={skin.displayName}
      >
        <span style={{ fontSize: '12px' }}>{skin.icon}</span>
        <span className="truncate max-w-[48px]">{skin.displayName.split(' ')[0]}</span>
      </span>
    );
  }

  // lg: icon + full displayName
  const badgeColors = colors ? parseBadgeColors(colors.badge) : null;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-sm font-semibold"
      style={{
        backgroundColor: badgeColors?.bg ?? 'rgba(255,255,255,0.1)',
        color: badgeColors?.text ?? 'rgba(255,255,255,0.7)',
      }}
      title={skin.displayName}
    >
      <span style={{ fontSize: '14px' }}>{skin.icon}</span>
      <span className="truncate">{skin.displayName}</span>
    </span>
  );
}

// ============================================
// SkinBadgesRow — All owned skins as small badges in a row, sorted by priority
// ============================================

export function SkinBadgesRow({ skins }: SkinBadgesRowProps) {
  const sorted = [...skins].sort((a, b) => b.priority - a.priority);

  if (sorted.length === 0) return null;

  return (
    <div className="inline-flex items-center gap-1" role="group" aria-label="Player skins">
      {sorted.map((skin) => {
        const colors = resolveSkinColors(skin);
        const badgeColors = colors ? parseBadgeColors(colors.badge) : null;
        return (
          <span
            key={skin.type}
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px]"
            style={{
              backgroundColor: badgeColors?.bg ?? 'rgba(255,255,255,0.1)',
            }}
            title={skin.displayName}
          >
            {skin.icon}
          </span>
        );
      })}
    </div>
  );
}

// ============================================
// SkinAvatarFrame — Wraps avatar with skin ring + glow
// ============================================

export function SkinAvatarFrame({ skin, children }: SkinAvatarFrameProps) {
  if (!skin) {
    return <>{children}</>;
  }

  const colors = resolveSkinColors(skin);
  if (!colors) {
    return <>{children}</>;
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Glow layer behind avatar */}
      <div
        className="absolute inset-[-2px] rounded-full skin-glow-animate"
        style={{
          boxShadow: `0 0 12px ${colors.glow}, 0 0 24px ${colors.glow}`,
        }}
        aria-hidden="true"
      />
      {/* Avatar with ring */}
      <div
        className="relative rounded-full ring-2"
        style={{
          ringColor: colors.frame,
          boxShadow: `0 0 0 2px ${colors.frame}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================
// SkinName — Wraps player name with skin gradient
// ============================================

export function SkinName({ skin, children }: SkinNameProps) {
  if (!skin) {
    return <>{children}</>;
  }

  const colors = resolveSkinColors(skin);
  if (!colors) {
    return <>{children}</>;
  }

  const gradientStops = parseColorStops(colors.name);
  const gradientValue = gradientStops.length > 1
    ? `linear-gradient(135deg, ${gradientStops.join(', ')})`
    : gradientStops[0] ?? colors.glow;

  return (
    <span
      className="font-bold skin-name-animate inline-block"
      style={{
        backgroundImage: gradientValue,
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </span>
  );
}

// ============================================
// SkinCardBorder — Wraps a card with skin border effect
// ============================================

export function SkinCardBorder({ skin, children }: SkinCardBorderProps) {
  if (!skin) {
    return <>{children}</>;
  }

  const colors = resolveSkinColors(skin);
  if (!colors) {
    return <>{children}</>;
  }

  const borderGradient = buildGradient(colors.border, '135deg');

  return (
    <div className="relative rounded-xl overflow-hidden isolate">
      {/* Gradient border — using mask trick for border-only effect */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          padding: '2px',
          background: borderGradient,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          backgroundSize: '200% 100%',
          animation: 'skin-border-shimmer 3s linear infinite',
        }}
        aria-hidden="true"
      />
      {/* Glow shadow */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          boxShadow: `0 0 15px ${colors.glow}, 0 0 30px ${colors.glow}`,
          opacity: 0.25,
        }}
        aria-hidden="true"
      />
      {/* Content */}
      {children}
    </div>
  );
}
