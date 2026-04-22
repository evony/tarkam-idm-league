'use client';

import Image from 'next/image';
import { Star, Crown, Flame, Zap, Trophy, Music, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TierBadge } from '../tier-badge';
import { SectionHeader } from './shared';
import { AnimatedEmptyState } from '../ui/animated-empty-state';
import { getAvatarUrl, clubToString, hexToRgba } from '@/lib/utils';
import type { StatsData, TopPlayer } from '@/types/stats';

/* ═══════════════════════════════════════════════════════════════
   PlayerSpotlight — Featured #1 ranked player from each division
   ═══════════════════════════════════════════════════════════════ */

interface PlayerSpotlightProps {
  maleData: StatsData | undefined;
  femaleData: StatsData | undefined;
  isDataLoading: boolean;
  setSelectedPlayer: (player: any) => void;
}

/* ─── Accent config per division ─── */
const DIVISION_CONFIG = {
  male: {
    accent: '#06b6d4',
    accentLight: '#22d3ee',
    accentFaint: '#67e8f9',
    icon: Music,
    label: 'Male',
  },
  female: {
    accent: '#a855f7',
    accentLight: '#c084fc',
    accentFaint: '#e9d5ff',
    icon: Shield,
    label: 'Female',
  },
} as const;

/* ─── Stat item for the 2x2 grid ─── */
function StatItem({
  icon: Icon,
  value,
  label,
  valueColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  valueColor: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 opacity-60" style={{ color: valueColor }} />
        <span className="text-xl sm:text-2xl font-black" style={{ color: valueColor }}>
          {value}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-semibold">
        {label}
      </span>
    </div>
  );
}

/* ─── Skeleton card for loading state ─── */
function SpotlightCardSkeleton({ accent }: { accent: string }) {
  return (
    <div
      className="perspective-card card-shine relative rounded-2xl overflow-hidden border p-6"
      style={{
        borderColor: hexToRgba(accent, 0.15),
        background: `linear-gradient(135deg, rgba(12,10,6,0.95), rgba(12,10,6,0.85))`,
      }}
      aria-hidden="true"
    >
      {/* Accent top line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 z-20"
        style={{ background: `linear-gradient(to right, transparent, ${accent}, transparent)` }}
      />
      {/* Background radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 30%, ${hexToRgba(accent, 0.06)}, transparent 60%)` }}
      />
      {/* Content skeleton */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        {/* Avatar placeholder */}
        <div className="skeleton-shimmer w-24 h-24 sm:w-28 sm:h-28 rounded-full" />
        {/* Gamertag placeholder */}
        <div className="skeleton-shimmer h-6 w-28 rounded" />
        {/* Tier + division placeholder */}
        <div className="flex items-center gap-2">
          <div className="skeleton-shimmer h-5 w-8 rounded" />
          <div className="skeleton-shimmer h-5 w-16 rounded" />
        </div>
        {/* Stats grid placeholder */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-3 space-y-2">
              <div className="skeleton-shimmer h-6 w-10 mx-auto rounded" />
              <div className="skeleton-shimmer h-2 w-12 mx-auto rounded" />
            </div>
          ))}
        </div>
        {/* Club placeholder */}
        <div className="skeleton-shimmer h-3 w-24 rounded" />
        {/* Button placeholder */}
        <div className="skeleton-shimmer h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
}

/* ─── Main spotlight card for a single player ─── */
function SpotlightCard({
  player,
  division,
  setSelectedPlayer,
}: {
  player: TopPlayer;
  division: 'male' | 'female';
  setSelectedPlayer: (player: any) => void;
}) {
  const cfg = DIVISION_CONFIG[division];
  const DivisionIcon = cfg.icon;

  return (
    <div
      className="perspective-card card-shine hover-scale-md relative rounded-2xl overflow-hidden border p-6 cursor-pointer group transition-all duration-300"
      style={{
        borderColor: hexToRgba(cfg.accent, 0.15),
        background: `linear-gradient(135deg, rgba(12,10,6,0.95), rgba(12,10,6,0.85))`,
      }}
      role="button"
      tabIndex={0}
      aria-label={`Lihat profil ${player.gamertag}`}
      onClick={() => setSelectedPlayer({ ...player, division })}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setSelectedPlayer({ ...player, division });
        }
      }}
    >
      {/* Accent top line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 z-20 transition-all duration-300 group-hover:opacity-100 opacity-70"
        style={{ background: `linear-gradient(to right, transparent, ${cfg.accent}, transparent)` }}
      />

      {/* Animated radial background glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-500 group-hover:opacity-100 opacity-60"
        style={{ background: `radial-gradient(ellipse at 50% 30%, ${hexToRgba(cfg.accent, 0.08)}, transparent 60%)` }}
      />

      {/* Hover glow shadow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ boxShadow: `0 0 60px ${hexToRgba(cfg.accent, 0.15)}, 0 0 30px ${hexToRgba(cfg.accent, 0.08)}` }}
      />

      {/* Glassmorphism shine overlay */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-3">
        {/* Avatar with ring */}
        <div className="relative">
          <div
            className="absolute -inset-1.5 rounded-full transition-all duration-300 group-hover:scale-105"
            style={{
              background: `conic-gradient(from 0deg, ${hexToRgba(cfg.accent, 0.4)}, ${hexToRgba(cfg.accent, 0.1)}, ${hexToRgba('#e5be4a', 0.3)}, ${hexToRgba(cfg.accent, 0.1)}, ${hexToRgba(cfg.accent, 0.4)})`,
              filter: `blur(3px)`,
            }}
          />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 transition-all duration-300 group-hover:border-opacity-60" style={{ borderColor: cfg.accent }}>
            <Image
              src={getAvatarUrl(player.gamertag, division, player.avatar)}
              alt={player.gamertag}
              fill
              sizes="112px"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          {/* Crown badge overlay */}
          <div
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center z-10 shadow-lg"
            style={{
              background: `linear-gradient(135deg, #e5be4a, #d4a853)`,
              boxShadow: `0 0 16px ${hexToRgba('#e5be4a', 0.4)}`,
            }}
          >
            <Crown className="w-4 h-4 text-[#0c0a06]" />
          </div>
        </div>

        {/* Gamertag */}
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {player.gamertag}
        </h3>

        {/* Tier badge + Division badge */}
        <div className="flex items-center gap-2">
          <TierBadge tier={player.tier} />
          <Badge
            className="text-[10px] font-bold uppercase tracking-wider border px-2.5 py-0.5"
            style={{
              backgroundColor: hexToRgba(cfg.accent, 0.2),
              color: cfg.accentLight,
              borderColor: hexToRgba(cfg.accent, 0.35),
            }}
          >
            <DivisionIcon className="w-3 h-3 mr-1" />
            {cfg.label}
          </Badge>
        </div>

        {/* Stats 2x2 grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full mt-1">
          <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] px-2 py-2 transition-all duration-200 group-hover:bg-white/[0.04]">
            <StatItem icon={Zap} value={player.points} label="Points" valueColor={cfg.accentLight} />
          </div>
          <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] px-2 py-2 transition-all duration-200 group-hover:bg-white/[0.04]">
            <StatItem icon={Trophy} value={player.totalWins} label="Wins" valueColor="#4ade80" />
          </div>
          <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] px-2 py-2 transition-all duration-200 group-hover:bg-white/[0.04]">
            <StatItem icon={Crown} value={player.totalMvp} label="MVP" valueColor="#e5be4a" />
          </div>
          <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] px-2 py-2 transition-all duration-200 group-hover:bg-white/[0.04]">
            <StatItem icon={Flame} value={player.streak} label="Streak" valueColor="#fb923c" />
          </div>
        </div>

        {/* Club name */}
        {player.club && (
          <div className="flex items-center gap-1.5 mt-1">
            <Shield className="w-3 h-3 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground/70 font-medium">
              {clubToString(player.club)}
            </span>
          </div>
        )}

        {/* Lihat Profil button */}
        <button
          className="mt-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 border"
          style={{
            backgroundColor: hexToRgba(cfg.accent, 0.15),
            color: cfg.accentLight,
            borderColor: hexToRgba(cfg.accent, 0.3),
          }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPlayer({ ...player, division });
          }}
          aria-label={`Lihat profil ${player.gamertag}`}
        >
          Lihat Profil
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PlayerSpotlight — Main Export
   ═══════════════════════════════════════════════════════════════ */
export function PlayerSpotlight({
  maleData,
  femaleData,
  isDataLoading,
  setSelectedPlayer,
}: PlayerSpotlightProps) {
  const malePlayer = maleData?.topPlayers?.[0];
  const femalePlayer = femaleData?.topPlayers?.[0];
  const hasAnyPlayer = malePlayer || femalePlayer;

  return (
    <section
      id="spotlight"
      role="region"
      aria-label="Player Spotlight"
      className="stagger-item py-16 sm:py-24 px-4 relative overflow-hidden"
    >
      {/* Background — subtle dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[#0a0806]/30 to-background" />

      {/* Bilateral ambient glows — cyan left, purple right */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/3 left-0 w-[400px] h-[400px] rounded-full"
          style={{ background: `radial-gradient(circle, ${hexToRgba('#06b6d4', 0.06)} 0%, transparent 60%)` }}
        />
        <div
          className="absolute bottom-1/3 right-0 w-[400px] h-[400px] rounded-full"
          style={{ background: `radial-gradient(circle, ${hexToRgba('#a855f7', 0.06)} 0%, transparent 60%)` }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section Header */}
        <SectionHeader
          icon={Star}
          label="Bintang Liga"
          title="Bintang Liga"
          subtitle="Pemain terbaik saat ini dari setiap divisi"
        />

        {/* Loading State */}
        {isDataLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SpotlightCardSkeleton accent="#06b6d4" />
            <SpotlightCardSkeleton accent="#a855f7" />
          </div>
        )}

        {/* Empty State */}
        {!isDataLoading && !hasAnyPlayer && (
          <AnimatedEmptyState
            icon={Star}
            message="Belum ada pemain spotlight"
            hint="Data peringkat akan muncul setelah musim dimulai"
          />
        )}

        {/* Cards */}
        {!isDataLoading && hasAnyPlayer && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* Vertical Gold Divider */}
            <div className="hidden md:block absolute top-12 bottom-12 left-1/2 w-px bg-gradient-to-b from-transparent via-idm-gold-warm/30 to-transparent z-10" />

            {/* Male Division Card */}
            <div className="stagger-item-fast" style={{ animationDelay: '0ms' }}>
              {malePlayer ? (
                <SpotlightCard
                  player={malePlayer}
                  division="male"
                  setSelectedPlayer={setSelectedPlayer}
                />
              ) : (
                <SpotlightCardSkeleton accent="#06b6d4" />
              )}
            </div>

            {/* Female Division Card */}
            <div className="stagger-item-fast" style={{ animationDelay: '60ms' }}>
              {femalePlayer ? (
                <SpotlightCard
                  player={femalePlayer}
                  division="female"
                  setSelectedPlayer={setSelectedPlayer}
                />
              ) : (
                <SpotlightCardSkeleton accent="#a855f7" />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
