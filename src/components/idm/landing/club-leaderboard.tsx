'use client';

import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import { SectionHeader } from './shared';
import { AnimatedEmptyState } from '../ui/animated-empty-state';
import { ClubLogoImage } from '@/components/idm/club-logo-image';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

/* ========== Types ========== */
interface LeaderboardClub {
  id: string;
  name: string;
  logo: string | null;
  points: number;
  wins: number;
  losses: number;
  gameDiff: number;
  memberCount: number;
  rank: number;
  tier: string;
}

/* ========== Rank Badge — Gold / Silver / Bronze ========== */
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-[#1a1608] font-black text-sm shadow-[0_0_12px_rgba(250,204,21,0.4)] leaderboard-rank-glow-gold">
        1
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-[#1a1608] font-black text-sm shadow-[0_0_8px_rgba(156,163,175,0.3)]">
        2
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-[#1a1608] font-black text-sm shadow-[0_0_8px_rgba(180,83,9,0.3)]">
        3
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.06] text-muted-foreground font-bold text-sm">
      {rank}
    </div>
  );
}

/* ========== Tier Badge ========== */
function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    S: 'bg-red-500/15 text-red-400 border-red-500/30',
    A: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    B: 'bg-green-500/15 text-green-400 border-green-500/30',
  };
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${styles[tier] || styles.B}`}>
      {tier}
    </span>
  );
}

/* ========== Win Rate Progress Bar ========== */
function WinRateBar({ wins, losses }: { wins: number; losses: number }) {
  const total = wins + losses;
  const winRate = total > 0 ? (wins / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full leaderboard-bar-fill bg-gradient-to-r from-idm-gold-warm to-idm-gold"
          style={{ width: `${winRate}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground tabular-nums w-8 text-right">
        {total > 0 ? `${Math.round(winRate)}%` : '-'}
      </span>
    </div>
  );
}

/* ========== Leaderboard Row ========== */
function LeaderboardRow({ club, index }: { club: LeaderboardClub; index: number }) {
  const isTop3 = club.rank <= 3;

  // Row border/glow based on rank
  const rowStyles: Record<number, string> = {
    1: 'border-yellow-500/30 bg-gradient-to-r from-yellow-500/[0.06] to-transparent shadow-[0_0_16px_rgba(250,204,21,0.08)]',
    2: 'border-gray-400/20 bg-gradient-to-r from-gray-400/[0.04] to-transparent',
    3: 'border-amber-700/20 bg-gradient-to-r from-amber-700/[0.04] to-transparent',
  };
  const rowClass = isTop3
    ? rowStyles[club.rank]
    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]';

  return (
    <div
      className={`leaderboard-row-entrance grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 rounded-lg border transition-all duration-200 ${rowClass}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Rank */}
      <RankBadge rank={club.rank} />

      {/* Club Name + Logo */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="shrink-0 w-8 h-8 rounded-lg overflow-hidden bg-white/[0.06] flex items-center justify-center">
          <ClubLogoImage
            clubName={club.name}
            dbLogo={club.logo}
            alt={club.name}
            width={32}
            height={32}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-bold truncate ${isTop3 ? 'text-white' : 'text-white/80'}`}>
            {club.name}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {club.memberCount} anggota
          </p>
        </div>
      </div>

      {/* W-L Record (desktop) */}
      <div className="hidden sm:flex items-center gap-1.5">
        <span className="text-xs font-bold text-green-400">{club.wins}W</span>
        <span className="text-[10px] text-muted-foreground">-</span>
        <span className="text-xs font-bold text-red-400">{club.losses}L</span>
      </div>

      {/* Game Diff */}
      <div className="hidden sm:block">
        <span className={`text-xs font-bold tabular-nums ${club.gameDiff > 0 ? 'text-green-400' : club.gameDiff < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
          {club.gameDiff > 0 ? '+' : ''}{club.gameDiff}
        </span>
      </div>

      {/* Points */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-black text-idm-gold-warm tabular-nums">{club.points}</span>
        <TierBadge tier={club.tier} />
      </div>

      {/* Win Rate Bar (desktop) */}
      <div className="hidden sm:block">
        <WinRateBar wins={club.wins} losses={club.losses} />
      </div>
    </div>
  );
}

/* ========== Loading Skeleton ========== */
function LeaderboardSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 sm:px-4 py-3 rounded-lg border border-white/[0.06] bg-white/[0.02]"
        >
          <Skeleton className="w-8 h-8 rounded-full bg-white/[0.06]" />
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-8 h-8 rounded-lg bg-white/[0.06]" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24 bg-white/[0.06]" />
              <Skeleton className="h-2.5 w-14 bg-white/[0.06]" />
            </div>
          </div>
          <Skeleton className="h-5 w-10 bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );
}

/* ========== Main Component ========== */
export function ClubLeaderboard() {
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading } = useQuery<{ clubs: LeaderboardClub[] }>({
    queryKey: ['clubs-leaderboard'],
    queryFn: async () => {
      const res = await fetch('/api/clubs/leaderboard');
      if (!res.ok) return { clubs: [] };
      return res.json();
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  const allClubs = data?.clubs ?? [];
  const displayClubs = showAll ? allClubs : allClubs.slice(0, 8);
  const hasMore = allClubs.length > 8;

  return (
    <section id="leaderboard" className="relative py-24 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/98 to-background" />
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, rgba(212,168,83,0.5) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(212,168,83,0.06) 0%, transparent 50%), radial-gradient(ellipse at 20% 60%, rgba(229,190,74,0.03) 0%, transparent 40%), radial-gradient(ellipse at 80% 60%, rgba(212,168,83,0.03) 0%, transparent 40%)' }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        <SectionHeader
          icon={Trophy}
          label="Klasemen"
          title="Klasemen Club"
          subtitle="Peringkat club berdasarkan performa"
        />

        {/* Column Headers — desktop only */}
        <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 px-4 pb-2 mb-1">
          <span className="w-8 text-center text-[10px] text-muted-foreground uppercase tracking-wider font-bold">#</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Club</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">W-L</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">GD</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">PTS</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Win Rate</span>
        </div>

        {isLoading ? (
          <LeaderboardSkeleton />
        ) : allClubs.length === 0 ? (
          <AnimatedEmptyState
            icon={Trophy}
            message="Belum ada data klasemen club"
            hint="Club akan muncul di klasemen setelah season dimulai"
          />
        ) : (
          <>
            {/* Mobile: horizontal scrollable container */}
            <div className="sm:hidden overflow-x-auto -mx-4 px-4 custom-scrollbar">
              <div className="min-w-[340px] space-y-2">
                {displayClubs.map((club, idx) => (
                  <LeaderboardRow key={club.id} club={club} index={idx} />
                ))}
              </div>
            </div>

            {/* Desktop: full table */}
            <div className="hidden sm:block space-y-2">
              {displayClubs.map((club, idx) => (
                <LeaderboardRow key={club.id} club={club} index={idx} />
              ))}
            </div>

            {/* Show More Button */}
            {hasMore && !showAll && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-idm-gold-warm/20 bg-idm-gold-warm/5 text-idm-gold-warm text-sm font-semibold transition-all duration-300 hover:bg-idm-gold-warm/10 hover:border-idm-gold-warm/30 hover:shadow-[0_0_16px_rgba(212,168,83,0.15)] cursor-pointer"
                >
                  Lihat Semua
                  <span className="text-[10px] text-muted-foreground">({allClubs.length} club)</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
