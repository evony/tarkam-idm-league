'use client';

import { useQuery } from '@tanstack/react-query';
import { Trophy, Crown, Medal, ChevronRight, TrendingUp, Swords, Shield, Users, Flame } from 'lucide-react';
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

  const memberLabel = club.maleMemberCount > 0 && club.femaleMemberCount > 0
    ? `${club.maleMemberCount}M + ${club.femaleMemberCount}F`
    : club.memberCount > 0
      ? `${club.memberCount} anggota`
      : 'Belum ada anggota';

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
              {memberLabel}
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

      {/* Points */}
      <span className="text-sm font-black text-idm-gold-warm tabular-nums">{club.points}</span>

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

/* ========== Animated Points Counter ========== */
function AnimatedPoints({ value }: { value: number }) {
  return (
    <span className="podium-points-counter inline-block" style={{ '--podium-counter-target': value } as React.CSSProperties}>
      {value}
    </span>
  );
}

/* ========== Podium — Top 3 Display (Eye-Catching Champion Podium) ========== */
function PodiumCard({ club, rank, type }: { club: LeaderboardClub; rank: 1 | 2 | 3; type: LeaderboardType }) {
  const isFirst = rank === 1;
  const isSecond = rank === 2;

  // Config per rank — responsive with mobile-first sizing
  const config = {
    1: {
      stepHeight: 'h-20 sm:h-28',
      order: 'sm:order-2',
      avatarSize: 'w-14 h-14 sm:w-[72px] sm:h-[72px]',
      nameSize: 'text-sm sm:text-base',
      pointsSize: 'text-xl sm:text-2xl',
      glowColor: 'shadow-[0_0_60px_rgba(250,204,21,0.35),0_0_120px_rgba(250,204,21,0.15)]',
      stepBg: 'bg-gradient-to-t from-yellow-500/50 via-yellow-500/25 to-yellow-400/10',
      stepBorder: 'border-yellow-400/50',
      cardBg: 'bg-gradient-to-b from-yellow-500/25 via-yellow-500/10 to-yellow-500/[0.03]',
      cardBorder: 'border-yellow-400/40',
      ringBorder: 'border-yellow-400',
      numberColor: 'text-yellow-300',
      badgeBg: 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30',
      badgeBorder: 'border-yellow-400/40',
      medalIcon: Crown,
      medalClass: 'text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]',
    },
    2: {
      stepHeight: 'h-14 sm:h-20',
      order: 'sm:order-1',
      avatarSize: 'w-12 h-12 sm:w-16 sm:h-16',
      nameSize: 'text-xs sm:text-sm',
      pointsSize: 'text-base sm:text-lg',
      glowColor: 'shadow-[0_0_40px_rgba(192,192,192,0.25)]',
      stepBg: 'bg-gradient-to-t from-gray-300/40 via-gray-300/20 to-gray-200/10',
      stepBorder: 'border-gray-300/40',
      cardBg: 'bg-gradient-to-b from-gray-300/20 via-gray-300/8 to-gray-200/[0.03]',
      cardBorder: 'border-gray-300/30',
      ringBorder: 'border-gray-300',
      numberColor: 'text-gray-200',
      badgeBg: 'bg-gradient-to-r from-gray-300/20 to-gray-400/20',
      badgeBorder: 'border-gray-300/30',
      medalIcon: Medal,
      medalClass: 'text-gray-200 drop-shadow-[0_0_8px_rgba(192,192,192,0.6)]',
    },
    3: {
      stepHeight: 'h-10 sm:h-14',
      order: 'sm:order-3',
      avatarSize: 'w-10 h-10 sm:w-14 sm:h-14',
      nameSize: 'text-[10px] sm:text-xs',
      pointsSize: 'text-sm sm:text-base',
      glowColor: 'shadow-[0_0_30px_rgba(180,83,9,0.25)]',
      stepBg: 'bg-gradient-to-t from-amber-600/40 via-amber-600/20 to-amber-500/10',
      stepBorder: 'border-amber-600/40',
      cardBg: 'bg-gradient-to-b from-amber-600/20 via-amber-600/8 to-amber-500/[0.03]',
      cardBorder: 'border-amber-600/30',
      ringBorder: 'border-amber-500',
      numberColor: 'text-amber-400',
      badgeBg: 'bg-gradient-to-r from-amber-600/20 to-amber-700/20',
      badgeBorder: 'border-amber-600/30',
      medalIcon: Medal,
      medalClass: 'text-amber-400 drop-shadow-[0_0_8px_rgba(180,83,9,0.6)]',
    },
  }[rank];

  const MedalIcon = config.medalIcon;

  const memberLabel = club.maleMemberCount > 0 && club.femaleMemberCount > 0
    ? `${club.maleMemberCount}M + ${club.femaleMemberCount}F`
    : club.memberCount > 0
      ? `${club.memberCount} anggota`
      : '-';

  return (
    <div className={`flex flex-col items-center ${config.order} ${isFirst ? 'z-10' : 'z-0'} relative`}>
      {/* JUARA banner above #1 */}
      {isFirst && (
        <div className="podium-juara-banner mb-2 px-4 sm:px-6 py-1 sm:py-1.5 rounded-md relative z-20">
          <div className="podium-juara-banner-inner flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-900" />
            <span className="text-xs sm:text-sm font-black tracking-[0.2em] text-yellow-900 uppercase">JUARA</span>
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-900" />
          </div>
          {/* Ribbon tails */}
          <div className="absolute -bottom-1.5 left-1 w-2.5 h-2.5 bg-amber-600 rotate-45 z-[-1]" />
          <div className="absolute -bottom-1.5 right-1 w-2.5 h-2.5 bg-amber-600 rotate-45 z-[-1]" />
        </div>
      )}

      {/* Card above podium step */}
      <div className={`flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-5 rounded-2xl ${config.cardBg} border ${config.cardBorder} ${config.glowColor} transition-all duration-500 hover:scale-[1.06] ${isFirst ? 'min-w-[140px] sm:min-w-[170px]' : 'min-w-[110px] sm:min-w-[130px]'} relative overflow-hidden`}>
        {/* Animated shimmer for #1 */}
        {isFirst && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div className="absolute -inset-full top-0 podium-shimmer-effect" />
          </div>
        )}

        {/* Floating gold particles around #1 */}
        {isFirst && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            <span className="podium-particle podium-particle-1 absolute w-1.5 h-1.5 rounded-full bg-yellow-400" />
            <span className="podium-particle podium-particle-2 absolute w-1 h-1 rounded-full bg-amber-300" />
            <span className="podium-particle podium-particle-3 absolute w-1.5 h-1.5 rounded-full bg-yellow-300" />
            <span className="podium-particle podium-particle-4 absolute w-1 h-1 rounded-full bg-yellow-500" />
            <span className="podium-particle podium-particle-5 absolute w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="podium-particle podium-particle-6 absolute w-1 h-1 rounded-full bg-yellow-200" />
          </div>
        )}

        {/* Medal / Crown icon for rank */}
        <div className="relative">
          <MedalIcon className={`w-6 h-6 sm:w-8 sm:h-8 ${config.medalClass} ${isFirst ? 'podium-crown-bounce' : ''}`} />
          {isFirst && (
            <>
              {/* Sparkle dots around crown */}
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-yellow-300 podium-sparkle-dot" style={{ animationDelay: '0s' }} />
              <span className="absolute top-0 -left-1 w-1 h-1 rounded-full bg-yellow-200 podium-sparkle-dot" style={{ animationDelay: '0.5s' }} />
              <span className="absolute -bottom-0.5 right-0 w-1 h-1 rounded-full bg-amber-300 podium-sparkle-dot" style={{ animationDelay: '1s' }} />
            </>
          )}
        </div>

        {/* Avatar with animated ring for #1 */}
        <div className={`relative ${config.avatarSize} rounded-full`}>
          {/* Animated glow ring behind avatar for #1 */}
          {isFirst && (
            <div className="absolute inset-[-4px] sm:inset-[-6px] rounded-full podium-champion-ring" />
          )}
          <div className={`relative w-full h-full rounded-full overflow-hidden bg-black/40 border-2 ${config.ringBorder} ${isFirst ? 'border-[3px]' : ''}`}>
            <ClubLogoImage
              clubName={club.name}
              dbLogo={club.logo}
              alt={club.name}
              width={isFirst ? 72 : 56}
              height={isFirst ? 72 : 56}
              className="w-full h-full object-contain p-1"
            />
          </div>
        </div>

        {/* Club name */}
        <p className={`${config.nameSize} font-extrabold text-white text-center truncate max-w-[110px] sm:max-w-[130px] tracking-tight`}>
          {club.name}
        </p>

        {/* Points with trophy — animated counter */}
        <div className="flex items-center gap-1.5">
          <Trophy className={`${isFirst ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'} text-idm-gold-warm`} />
          <span className={`${config.pointsSize} font-black text-idm-gold-warm tabular-nums`}>
            <AnimatedPoints value={club.points} />
          </span>
        </div>

        {/* Members info */}
        <div className="flex items-center gap-1.5">
          <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground/50" />
          <p className="text-[10px] sm:text-[11px] text-muted-foreground/60 font-medium">{memberLabel}</p>
        </div>

        {/* Win/Loss for Liga mode */}
        {type === 'liga' && (club.wins > 0 || club.losses > 0) && (
          <div className="flex items-center gap-2 text-[9px] sm:text-[10px]">
            <span className="font-bold text-green-400">{club.wins}W</span>
            <span className="text-muted-foreground/30">·</span>
            <span className="font-bold text-red-400">{club.losses}L</span>
            {club.gameDiff !== 0 && (
              <>
                <span className="text-muted-foreground/30">·</span>
                <span className={`font-bold ${club.gameDiff > 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {club.gameDiff > 0 ? '+' : ''}{club.gameDiff} GD
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Podium step */}
      <div className={`w-full ${config.stepHeight} rounded-t-xl ${config.stepBg} border-x border-t ${config.stepBorder} mt-0.5 flex items-start justify-center pt-2 sm:pt-2.5 relative overflow-hidden`}>
        {/* Subtle stripe pattern overlay */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 10px)' }} />
        {/* Gold/Silver/Bronze gradient shine */}
        {isFirst && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent podium-step-shimmer" />
        )}
        <span className={`font-black tabular-nums relative ${isFirst ? 'text-2xl sm:text-4xl text-yellow-300 drop-shadow-[0_0_16px_rgba(250,204,21,0.6)]' : isSecond ? 'text-xl sm:text-3xl text-gray-200 drop-shadow-[0_0_8px_rgba(192,192,192,0.4)]' : 'text-lg sm:text-2xl text-amber-400 drop-shadow-[0_0_6px_rgba(180,83,9,0.4)]'}`}>
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
    <div className="relative mb-6 sm:mb-10 px-2 py-4 sm:py-6">
      {/* Dramatic pedestal glow for #1 — layered radial gradients */}
      {first && (
        <>
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[180px] sm:w-[400px] sm:h-[280px] rounded-full bg-yellow-500/[0.12] blur-[60px] pointer-events-none podium-pedestal-glow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[120px] sm:w-[280px] sm:h-[180px] rounded-full bg-yellow-400/[0.08] blur-[40px] pointer-events-none" />
          <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[60px] sm:w-[160px] sm:h-[80px] rounded-full bg-amber-300/[0.06] blur-[30px] pointer-events-none" />
        </>
      )}

      {/* Pulsing light beams behind podium */}
      {first && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 pointer-events-none podium-light-beams">
          <div className="podium-light-beam podium-light-beam-1" />
          <div className="podium-light-beam podium-light-beam-2" />
          <div className="podium-light-beam podium-light-beam-3" />
          <div className="podium-light-beam podium-light-beam-4" />
          <div className="podium-light-beam podium-light-beam-5" />
        </div>
      )}

      {/* Subtle background pattern for the podium section */}
      <div className="absolute inset-0 pointer-events-none podium-bg-pattern rounded-2xl opacity-30" />

      {/* Mobile: vertical stack, Desktop: horizontal podium layout */}
      {/* Mobile layout — stacked vertically */}
      <div className="flex sm:hidden flex-col items-center gap-3 relative z-10">
        {first && <PodiumCard club={first} rank={1} type={type} />}
        {second && <PodiumCard club={second} rank={2} type={type} />}
        {third && <PodiumCard club={third} rank={3} type={type} />}
      </div>

      {/* Desktop layout — classic podium */}
      <div className="hidden sm:flex items-end justify-center gap-3 sm:gap-5 relative z-10">
        {second && <PodiumCard club={second} rank={2} type={type} />}
        {first && <PodiumCard club={first} rank={1} type={type} />}
        {third && <PodiumCard club={third} rank={3} type={type} />}
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

        {/* Top 3 Podium — visible on all screen sizes */}
        {!isLoading && allClubs.length >= 2 && (
          <Top3Podium clubs={allClubs.slice(0, 3)} maxPoints={maxPoints} type={activeType} />
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
