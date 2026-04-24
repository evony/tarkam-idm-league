'use client';

import { useQuery } from '@tanstack/react-query';
import { Trophy, Crown, Medal, ChevronRight, TrendingUp, Swords, Shield } from 'lucide-react';
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
  maleMemberCount: number;
  femaleMemberCount: number;
  rank: number;
  tier: string;
}

type LeaderboardType = 'tarkam' | 'liga';

/* ========== Rank Badge — Gold / Silver / Bronze with medal icons ========== */
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-[#1a1608] shadow-[0_0_16px_rgba(250,204,21,0.4)] leaderboard-rank-glow-gold relative">
        <Crown className="w-4 h-4" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-[#1a1608] shadow-[0_0_10px_rgba(156,163,175,0.3)]">
        <Medal className="w-4 h-4" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-[#1a1608] shadow-[0_0_10px_rgba(180,83,9,0.3)]">
        <Medal className="w-4 h-4" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.06] text-muted-foreground font-bold text-sm">
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

/* ========== Relative Strength Progress Bar ========== */
function StrengthBar({ points, maxPoints }: { points: number; maxPoints: number }) {
  const pct = maxPoints > 0 ? Math.max((points / maxPoints) * 100, 2) : 0;

  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full leaderboard-bar-fill bg-gradient-to-r from-idm-gold-warm to-idm-gold transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground tabular-nums w-8 text-right">
        {Math.round(pct)}%
      </span>
    </div>
  );
}

/* ========== Win Rate Mini Bar ========== */
function WinRateMini({ wins, losses }: { wins: number; losses: number }) {
  const total = wins + losses;
  const winRate = total > 0 ? (wins / total) * 100 : 0;

  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
          style={{ width: `${winRate}%` }}
        />
      </div>
      <span className="text-[9px] text-muted-foreground tabular-nums">
        {total > 0 ? `${Math.round(winRate)}%` : '-'}
      </span>
    </div>
  );
}

/* ========== Leaderboard Row ========== */
function LeaderboardRow({ club, index, maxPoints, type }: { club: LeaderboardClub; index: number; maxPoints: number; type: LeaderboardType }) {
  const isTop3 = club.rank <= 3;

  // Row border/glow based on rank
  const rowStyles: Record<number, string> = {
    1: 'border-yellow-500/30 bg-gradient-to-r from-yellow-500/[0.08] to-transparent shadow-[0_0_20px_rgba(250,204,21,0.1)] hover:shadow-[0_0_28px_rgba(250,204,21,0.15)]',
    2: 'border-gray-400/20 bg-gradient-to-r from-gray-400/[0.05] to-transparent hover:shadow-[0_0_16px_rgba(156,163,175,0.08)]',
    3: 'border-amber-700/20 bg-gradient-to-r from-amber-700/[0.05] to-transparent hover:shadow-[0_0_16px_rgba(180,83,9,0.08)]',
  };
  const rowClass = isTop3
    ? rowStyles[club.rank]
    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12]';

  const isEven = index % 2 === 0;

  return (
    <div
      className={`leaderboard-row-wrapper leaderboard-row-enhanced grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 rounded-xl border transition-all duration-300 hover:scale-[1.01] ${isEven ? 'leaderboard-row-even' : 'leaderboard-row-odd'} ${rowClass}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Rank */}
      <RankBadge rank={club.rank} />

      {/* Club Name + Logo */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="shrink-0 w-9 h-9 rounded-lg overflow-hidden bg-white/[0.06] flex items-center justify-center border border-white/[0.04]">
          <ClubLogoImage
            clubName={club.name}
            dbLogo={club.logo}
            alt={club.name}
            width={36}
            height={36}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-sm font-bold truncate ${isTop3 ? 'text-white' : 'text-white/80'}`}>
              {club.name}
            </p>
            {club.rank === 1 && (
              <Crown className="w-3.5 h-3.5 text-idm-gold-warm shrink-0 leaderboard-crown-icon" />
            )}
            {club.rank !== 1 && club.rank <= 3 && (
              <TrendingUp className="w-3 h-3 text-idm-gold-warm shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] text-muted-foreground">
              {club.maleMemberCount > 0 && club.femaleMemberCount > 0
                ? `${club.maleMemberCount}M + ${club.femaleMemberCount}F`
                : `${club.memberCount} anggota`}
            </p>
            {type === 'liga' && (
              <>
                <span className="hidden sm:inline text-[10px] text-muted-foreground/50">·</span>
                <div className="hidden sm:flex items-center gap-1">
                  <span className="text-[10px] font-bold text-green-400">{club.wins}W</span>
                  <span className="text-[10px] text-muted-foreground/50">-</span>
                  <span className="text-[10px] font-bold text-red-400">{club.losses}L</span>
                </div>
              </>
            )}
          </div>
          {/* Hover reveal: extra stats */}
          <div className="leaderboard-hover-stats mt-1">
            <div className="flex items-center gap-3 text-[9px] text-muted-foreground/70">
              {type === 'liga' && (
                <>
                  <span>Win Rate: {club.wins + club.losses > 0 ? Math.round((club.wins / (club.wins + club.losses)) * 100) : 0}%</span>
                  <span>GD: {club.gameDiff > 0 ? '+' : ''}{club.gameDiff}</span>
                </>
              )}
              <span>PTS/Member: {club.memberCount > 0 ? (club.points / club.memberCount).toFixed(1) : '0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Points + Tier */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-black text-idm-gold-warm tabular-nums">{club.points}</span>
        <TierBadge tier={club.tier} />
      </div>

      {/* Liga-specific columns (desktop) */}
      {type === 'liga' && (
        <>
          {/* Game Diff (desktop) */}
          <div className="hidden sm:block">
            <span className={`text-xs font-bold tabular-nums ${club.gameDiff > 0 ? 'text-green-400' : club.gameDiff < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
              {club.gameDiff > 0 ? '+' : ''}{club.gameDiff}
            </span>
          </div>

          {/* Win Rate Mini (desktop) */}
          <div className="hidden sm:block">
            <WinRateMini wins={club.wins} losses={club.losses} />
          </div>
        </>
      )}

      {/* Strength Bar (desktop) */}
      <div className="hidden sm:block">
        <StrengthBar points={club.points} maxPoints={maxPoints} />
      </div>
    </div>
  );
}

/* ========== Podium — Top 3 Display (Eye-Catching) ========== */
function PodiumCard({ club, rank, type }: { club: LeaderboardClub; rank: 1 | 2 | 3; type: LeaderboardType }) {
  const isFirst = rank === 1;

  // Config per rank
  const config = {
    1: {
      containerClass: 'podium-card-gold',
      ringClass: 'podium-ring-gold',
      stepHeight: 'h-36',
      order: 'order-2',
      avatarSize: 'w-20 h-20',
      nameSize: 'text-sm',
      pointsSize: 'text-lg',
      label: '🥇',
      glowColor: 'shadow-[0_0_40px_rgba(250,204,21,0.25)]',
      stepBg: 'bg-gradient-to-t from-yellow-500/30 via-yellow-500/15 to-yellow-500/5',
      stepBorder: 'border-yellow-500/30',
      cardBg: 'bg-gradient-to-b from-yellow-500/20 via-yellow-500/8 to-transparent',
      cardBorder: 'border-yellow-500/25',
    },
    2: {
      containerClass: 'podium-card-silver',
      ringClass: 'podium-ring-silver',
      stepHeight: 'h-24',
      order: 'order-1',
      avatarSize: 'w-16 h-16',
      nameSize: 'text-xs',
      pointsSize: 'text-base',
      label: '🥈',
      glowColor: 'shadow-[0_0_24px_rgba(156,163,175,0.15)]',
      stepBg: 'bg-gradient-to-t from-gray-400/20 via-gray-400/10 to-transparent',
      stepBorder: 'border-gray-400/20',
      cardBg: 'bg-gradient-to-b from-gray-400/15 via-gray-400/5 to-transparent',
      cardBorder: 'border-gray-400/20',
    },
    3: {
      containerClass: 'podium-card-bronze',
      ringClass: 'podium-ring-bronze',
      stepHeight: 'h-16',
      order: 'order-3',
      avatarSize: 'w-14 h-14',
      nameSize: 'text-xs',
      pointsSize: 'text-sm',
      label: '🥉',
      glowColor: 'shadow-[0_0_20px_rgba(180,83,9,0.15)]',
      stepBg: 'bg-gradient-to-t from-amber-700/20 via-amber-700/10 to-transparent',
      stepBorder: 'border-amber-700/20',
      cardBg: 'bg-gradient-to-b from-amber-700/15 via-amber-700/5 to-transparent',
      cardBorder: 'border-amber-700/20',
    },
  }[rank];

  const memberLabel = club.maleMemberCount > 0 && club.femaleMemberCount > 0
    ? `${club.maleMemberCount}M + ${club.femaleMemberCount}F`
    : `${club.memberCount} anggota`;

  return (
    <div className={`flex flex-col items-center ${config.order} ${isFirst ? 'z-10' : 'z-0'}`}>
      {/* Card above podium step */}
      <div className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${config.cardBg} border ${config.cardBorder} ${config.glowColor} transition-all duration-500 hover:scale-105 hover:${config.glowColor.replace('0.25', '0.4').replace('0.15', '0.25')} ${config.containerClass} ${isFirst ? 'min-w-[140px]' : 'min-w-[110px]'}`}>
        {/* Rank label */}
        <span className="text-2xl leading-none">{config.label}</span>

        {/* Avatar with animated ring */}
        <div className={`relative ${config.avatarSize} rounded-full ${config.ringClass}`}>
          {/* Animated ring behind avatar */}
          <div className={`absolute inset-0 rounded-full ${config.ringClass}`} />
          <div className={`relative w-full h-full rounded-full overflow-hidden bg-white/[0.08] border-2 ${isFirst ? 'border-yellow-400/60' : rank === 2 ? 'border-gray-300/50' : 'border-amber-600/50'}`}>
            <ClubLogoImage
              clubName={club.name}
              dbLogo={club.logo}
              alt={club.name}
              width={isFirst ? 80 : 56}
              height={isFirst ? 80 : 56}
              className="w-full h-full object-contain p-1"
            />
          </div>
          {/* Crown overlay for #1 */}
          {isFirst && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <Crown className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
            </div>
          )}
        </div>

        {/* Club name */}
        <p className={`${config.nameSize} font-bold text-white text-center truncate max-w-[120px]`}>
          {club.name}
        </p>

        {/* Points */}
        <div className="flex items-center gap-1.5">
          <Trophy className={`${isFirst ? 'w-4 h-4' : 'w-3 h-3'} text-idm-gold-warm`} />
          <span className={`${config.pointsSize} font-black text-idm-gold-warm tabular-nums`}>
            {club.points}
          </span>
        </div>

        {/* Tier badge */}
        <TierBadge tier={club.tier} />

        {/* Members info */}
        <p className="text-[9px] text-muted-foreground/70">{memberLabel}</p>
      </div>

      {/* Podium step */}
      <div className={`w-full ${config.stepHeight} rounded-t-xl ${config.stepBg} border-x border-t ${config.stepBorder} mt-1 flex items-start justify-center pt-3`}>
        <span className={`font-black tabular-nums ${isFirst ? 'text-3xl text-yellow-400' : rank === 2 ? 'text-2xl text-gray-300' : 'text-xl text-amber-600'}`}>
          {rank}
        </span>
      </div>
    </div>
  );
}

function Top3Podium({ clubs, maxPoints, type }: { clubs: LeaderboardClub[]; maxPoints: number; type: LeaderboardType }) {
  if (clubs.length === 0) return null;

  const first = clubs.find(c => c.rank === 1);
  const second = clubs.find(c => c.rank === 2);
  const third = clubs.find(c => c.rank === 3);

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-5 mb-10 px-2">
      {second && <PodiumCard club={second} rank={2} type={type} />}
      {first && <PodiumCard club={first} rank={1} type={type} />}
      {third && <PodiumCard club={third} rank={3} type={type} />}
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
          className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 sm:px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
        >
          <Skeleton className="w-9 h-9 rounded-full bg-white/[0.06]" />
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-9 h-9 rounded-lg bg-white/[0.06]" />
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
  const [activeType, setActiveType] = useState<LeaderboardType>('tarkam');

  const { data, isLoading } = useQuery<{ clubs: LeaderboardClub[]; type: string }>({
    queryKey: ['clubs-leaderboard', activeType],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/leaderboard?type=${activeType}`);
      if (!res.ok) return { clubs: [], type: activeType };
      return res.json();
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  const allClubs = data?.clubs ?? [];
  const displayClubs = showAll ? allClubs : allClubs.slice(0, 8);
  const hasMore = allClubs.length > 8;
  const maxPoints = allClubs.length > 0 ? allClubs[0].points || 1 : 1;

  const typeConfig: Record<LeaderboardType, { icon: typeof Swords; label: string; desc: string }> = {
    tarkam: {
      icon: Swords,
      label: 'Tarkam',
      desc: 'Total poin anggota club (Male + Female)',
    },
    liga: {
      icon: Shield,
      label: 'Liga',
      desc: 'Poin dari hasil pertandingan Liga',
    },
  };

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

        {/* Tarkam / Liga Tab Switcher */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {(Object.entries(typeConfig) as [LeaderboardType, typeof typeConfig.tarkam][]).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const isActive = activeType === key;
            return (
              <button
                key={key}
                onClick={() => { setActiveType(key); setShowAll(false); }}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-idm-gold-warm/15 text-idm-gold-warm border border-idm-gold-warm/30 shadow-[0_0_16px_rgba(212,168,83,0.15)]'
                    : 'bg-white/[0.04] text-muted-foreground border border-white/[0.08] hover:bg-white/[0.08] hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Type description */}
        <p className="text-center text-[11px] text-muted-foreground/60 mb-6">
          {typeConfig[activeType].desc}
        </p>

        {/* Top 3 Podium — desktop only */}
        {!isLoading && allClubs.length >= 2 && (
          <div className="hidden sm:block">
            <Top3Podium clubs={allClubs.slice(0, 3)} maxPoints={maxPoints} type={activeType} />
          </div>
        )}

        {/* Column Headers — desktop only */}
        {activeType === 'liga' ? (
          <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 px-4 pb-2 mb-1">
            <span className="w-9 text-center text-[10px] text-muted-foreground uppercase tracking-wider font-bold">#</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Club</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">PTS</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">GD</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Win Rate</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Kekuatan</span>
          </div>
        ) : (
          <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-4 pb-2 mb-1">
            <span className="w-9 text-center text-[10px] text-muted-foreground uppercase tracking-wider font-bold">#</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Club</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">PTS</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Kekuatan</span>
          </div>
        )}

        {isLoading ? (
          <LeaderboardSkeleton />
        ) : allClubs.length === 0 ? (
          <AnimatedEmptyState
            icon={Trophy}
            message={activeType === 'tarkam' ? 'Belum ada data klasemen tarkam' : 'Belum ada data klasemen liga'}
            hint={activeType === 'tarkam' ? 'Club akan muncul setelah anggotanya bermain di tarkam' : 'Club akan muncul setelah pertandingan liga dimulai'}
          />
        ) : (
          <>
            {/* Mobile: horizontal scrollable container */}
            <div className="sm:hidden overflow-x-auto -mx-4 px-4 custom-scrollbar">
              <div className="min-w-[340px] space-y-2">
                {displayClubs.map((club, idx) => (
                  <LeaderboardRow key={club.id} club={club} index={idx} maxPoints={maxPoints} type={activeType} />
                ))}
              </div>
            </div>

            {/* Desktop: full table */}
            <div className="hidden sm:block space-y-2">
              {displayClubs.map((club, idx) => (
                <LeaderboardRow key={club.id} club={club} index={idx} maxPoints={maxPoints} type={activeType} />
              ))}
            </div>

            {/* "Lihat Semua Club" button */}
            {hasMore && !showAll && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-idm-gold-warm/20 bg-idm-gold-warm/5 text-idm-gold-warm text-sm font-semibold transition-all duration-300 hover:bg-idm-gold-warm/10 hover:border-idm-gold-warm/30 hover:shadow-[0_0_20px_rgba(212,168,83,0.15)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Lihat Semua Club
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-[10px] text-muted-foreground">({allClubs.length} club)</span>
                </button>
              </div>
            )}

            {/* Collapse button when showing all */}
            {showAll && hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAll(false)}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] text-muted-foreground text-sm font-medium transition-all duration-200 hover:text-foreground hover:bg-white/[0.06] cursor-pointer"
                >
                  Tampilkan Lebih Sedikit
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
