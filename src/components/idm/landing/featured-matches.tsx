'use client';

import { useQuery } from '@tanstack/react-query';
import { Swords, Clock, Trophy, Flame, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AnimatedEmptyState } from '../ui/animated-empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionHeader } from './shared';
import { getAvatarUrl } from '@/lib/utils';
import Image from 'next/image';
import type { StatsData } from '@/types/stats';

/* ========== Types ========== */
interface MatchResult {
  id: string;
  player1: string;
  player2: string;
  score: string;
  winnerId: string;
  completedAt: string;
  player1Id?: string;
  player2Id?: string;
  player1Division?: string;
  player2Division?: string;
}

/* ========== Format Indonesian Relative Time ========== */
function timeAgoInIndonesian(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  if (diffMs < 0) return 'Baru saja';
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

/* ========== Score Display ========== */
function ScoreDisplay({ score }: { score: string }) {
  const parts = score.split('-');
  if (parts.length !== 2) return <span className="text-sm font-bold text-white/60">{score}</span>;
  const left = parseInt(parts[0]) || 0;
  const right = parseInt(parts[1]) || 0;
  const leftWins = left > right;
  const rightWins = right > left;

  return (
    <div className="flex items-center gap-2">
      <span className={`text-lg font-black tabular-nums ${leftWins ? 'text-idm-gold-warm' : 'text-white/40'}`}>
        {parts[0]}
      </span>
      <span className="text-xs text-white/20 font-bold">-</span>
      <span className={`text-lg font-black tabular-nums ${rightWins ? 'text-idm-gold-warm' : 'text-white/40'}`}>
        {parts[1]}
      </span>
    </div>
  );
}

/* ========== Match Card ========== */
function MatchCard({ match, index }: { match: MatchResult; index: number }) {
  const isP1Winner = match.winnerId === match.player1Id;
  const p1Division = (match.player1Division || 'male') as 'male' | 'female';
  const p2Division = (match.player2Division || 'male') as 'male' | 'female';

  return (
    <div
      className="featured-match-card relative rounded-xl overflow-hidden border border-idm-gold-warm/10 bg-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:border-idm-gold-warm/25 hover:bg-white/[0.04] hover:shadow-[0_0_20px_rgba(212,168,83,0.08)] group"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-idm-gold-warm/20 to-transparent" />

      {/* Match number badge */}
      <div className="absolute top-2 right-2 z-10">
        <Badge className="bg-idm-gold-warm/10 text-idm-gold-warm text-[8px] border-idm-gold-warm/20 px-1.5 py-0 h-4 font-bold">
          #{index + 1}
        </Badge>
      </div>

      <div className="p-4">
        {/* Players */}
        <div className="flex items-center gap-3">
          {/* Player 1 */}
          <div className="flex-1 flex items-center gap-2.5 min-w-0">
            <div className={`relative w-10 h-10 rounded-lg overflow-hidden border-2 shrink-0 ${isP1Winner ? 'border-idm-gold-warm/40 shadow-[0_0_10px_rgba(212,168,83,0.15)]' : 'border-white/10'}`}>
              <Image
                src={getAvatarUrl(match.player1, p1Division)}
                alt={match.player1}
                fill
                sizes="40px"
                className="object-cover object-top"
                unoptimized
              />
              {isP1Winner && (
                <div className="absolute inset-0 bg-idm-gold-warm/10 flex items-center justify-center">
                  <Trophy className="w-3.5 h-3.5 text-idm-gold-warm drop-shadow-[0_0_4px_rgba(212,168,83,0.5)]" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-bold truncate ${isP1Winner ? 'text-idm-gold-warm' : 'text-white/70'}`}>
                {match.player1}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                {isP1Winner && <Flame className="w-2.5 h-2.5 text-idm-gold-warm" />}
                <span className="text-[9px] text-muted-foreground/50">
                  {isP1Winner ? 'Winner' : p1Division}
                </span>
              </div>
            </div>
          </div>

          {/* Score + VS */}
          <div className="flex flex-col items-center gap-0.5 px-2">
            <ScoreDisplay score={match.score} />
            <div className="flex items-center gap-1">
              <Swords className="w-2.5 h-2.5 text-idm-gold-warm/40" />
              <span className="text-[8px] text-idm-gold-warm/40 font-bold uppercase">VS</span>
            </div>
          </div>

          {/* Player 2 */}
          <div className="flex-1 flex items-center gap-2.5 min-w-0 flex-row-reverse">
            <div className={`relative w-10 h-10 rounded-lg overflow-hidden border-2 shrink-0 ${!isP1Winner ? 'border-idm-gold-warm/40 shadow-[0_0_10px_rgba(212,168,83,0.15)]' : 'border-white/10'}`}>
              <Image
                src={getAvatarUrl(match.player2, p2Division)}
                alt={match.player2}
                fill
                sizes="40px"
                className="object-cover object-top"
                unoptimized
              />
              {!isP1Winner && (
                <div className="absolute inset-0 bg-idm-gold-warm/10 flex items-center justify-center">
                  <Trophy className="w-3.5 h-3.5 text-idm-gold-warm drop-shadow-[0_0_4px_rgba(212,168,83,0.5)]" />
                </div>
              )}
            </div>
            <div className="min-w-0 text-right">
              <p className={`text-xs font-bold truncate ${!isP1Winner ? 'text-idm-gold-warm' : 'text-white/70'}`}>
                {match.player2}
              </p>
              <div className="flex items-center gap-1 mt-0.5 justify-end">
                <span className="text-[9px] text-muted-foreground/50">
                  {!isP1Winner ? 'Winner' : p2Division}
                </span>
                {!isP1Winner && <Flame className="w-2.5 h-2.5 text-idm-gold-warm" />}
              </div>
            </div>
          </div>
        </div>

        {/* Match time */}
        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-white/[0.04]">
          <Clock className="w-2.5 h-2.5 text-muted-foreground/40" />
          <span className="text-[9px] text-muted-foreground/50">{timeAgoInIndonesian(match.completedAt)}</span>
        </div>
      </div>
    </div>
  );
}

/* ========== Loading Skeleton ========== */
function MatchesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg bg-white/[0.06]" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-20 bg-white/[0.06]" />
              <Skeleton className="h-2 w-12 bg-white/[0.04]" />
            </div>
            <Skeleton className="h-5 w-10 bg-white/[0.06]" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-20 bg-white/[0.06]" />
              <Skeleton className="h-2 w-12 bg-white/[0.04]" />
            </div>
            <Skeleton className="w-10 h-10 rounded-lg bg-white/[0.06]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ========== Main Component ========== */
export function FeaturedMatches({ maleData, femaleData }: { maleData: StatsData | undefined; femaleData: StatsData | undefined }) {
  const { data, isLoading } = useQuery<{ recentResults: MatchResult[] }>({
    queryKey: ['featured-matches'],
    queryFn: async () => {
      const res = await fetch('/api/matches/next?division=male');
      if (!res.ok) return { recentResults: [] };
      return res.json();
    },
    staleTime: 30000,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const matches = data?.recentResults?.slice(0, 6) ?? [];

  return (
    <section id="matches" className="relative py-24 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/98 to-background" />
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(212,168,83,0.04) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(6,182,212,0.03) 0%, transparent 50%)',
      }} />
      {/* Subtle diamond grid pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(212,168,83,0.3) 10px, rgba(212,168,83,0.3) 11px), repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(212,168,83,0.3) 10px, rgba(212,168,83,0.3) 11px)`,
      }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        <SectionHeader
          icon={Zap}
          label="Pertandingan"
          title="Hasil Terbaru"
          subtitle="Match terbaru dari IDM League"
        />

        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-[11px] font-semibold text-red-400/80">Live Score Update</span>
        </div>

        {isLoading ? (
          <MatchesSkeleton />
        ) : matches.length === 0 ? (
          <AnimatedEmptyState
            icon={Swords}
            message="Belum ada hasil pertandingan"
            hint="Match akan muncul setelah pertandingan dimulai"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {matches.map((match, idx) => (
              <MatchCard key={match.id} match={match} index={idx} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
