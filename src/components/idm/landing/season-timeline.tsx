'use client';

import { useQuery } from '@tanstack/react-query';
import { Calendar, CheckCircle2, Clock, Trophy, Users, Swords } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { SectionHeader, AnimatedSection } from './shared';
import { AnimatedEmptyState } from '@/components/idm/ui/animated-empty-state';
import { ClubLogoImage } from '@/components/idm/club-logo-image';

// ── Types ──
interface TimelineSeason {
  id: string;
  name: string;
  number: number;
  status: 'upcoming' | 'active' | 'completed';
  startDate: string;
  endDate: string | null;
  tournamentCount: number;
  playerCount: number;
  championClub: {
    name: string;
    logo: string | null;
  } | null;
}

interface TimelineResponse {
  seasons: TimelineSeason[];
}

// ── Status config ──
const statusConfig = {
  completed: {
    badgeClass: 'bg-idm-gold-warm/15 text-idm-gold-warm border-idm-gold-warm/30',
    nodeClass: 'border-idm-gold-warm bg-idm-gold-warm/10',
    dotClass: 'bg-idm-gold-warm',
    icon: CheckCircle2,
    iconClass: 'text-idm-gold-warm',
    label: 'Selesai',
  },
  active: {
    badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    nodeClass: 'border-cyan-400 bg-cyan-400/10 timeline-active-node',
    dotClass: 'bg-cyan-400',
    icon: Clock,
    iconClass: 'text-cyan-400',
    label: 'Aktif',
  },
  upcoming: {
    badgeClass: 'bg-white/5 text-muted-foreground border-white/10',
    nodeClass: 'border-muted-foreground/30 bg-muted/10',
    dotClass: 'bg-muted-foreground/50',
    icon: Clock,
    iconClass: 'text-muted-foreground',
    label: 'Akan Datang',
  },
} as const;

// ── Season Node Component ──
function SeasonNode({ season, index, total }: { season: TimelineSeason; index: number; total: number }) {
  const config = statusConfig[season.status];
  const StatusIcon = config.icon;
  const isLast = index === total - 1;

  return (
    <div
      className="timeline-node-entrance flex flex-col items-center relative flex-shrink-0"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Connector line to next node */}
      {!isLast && (
        <div className="absolute top-5 left-1/2 w-full h-[2px] -translate-y-1/2 z-0">
          <div className="timeline-line-draw h-full bg-gradient-to-r from-idm-gold-warm/60 via-idm-amber/40 to-idm-gold-warm/20" />
        </div>
      )}

      {/* Node circle */}
      <div className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center ${config.nodeClass} transition-transform duration-300 hover:scale-110`}>
        <StatusIcon className={`w-5 h-5 ${config.iconClass}`} />

        {/* Active season pulse glow */}
        {season.status === 'active' && (
          <span className="absolute inset-0 rounded-full timeline-pulse-ring" />
        )}
      </div>

      {/* Season number badge */}
      <div className="mt-2">
        <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0 h-5 ${config.badgeClass}`}>
          S{season.number}
        </Badge>
      </div>

      {/* Season name */}
      <p className="mt-1.5 text-xs font-semibold text-foreground/90 text-center max-w-[120px] truncate">
        {season.name}
      </p>

      {/* Status label */}
      <div className="flex items-center gap-1 mt-1">
        {season.status === 'active' && (
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        )}
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{config.label}</span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-2 mt-2">
        <div className="flex items-center gap-0.5">
          <Swords className="w-3 h-3 text-idm-gold-warm/50" />
          <span className="text-[9px] text-muted-foreground">{season.tournamentCount}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Users className="w-3 h-3 text-idm-gold-warm/50" />
          <span className="text-[9px] text-muted-foreground">{season.playerCount}</span>
        </div>
      </div>

      {/* Champion club (completed seasons only) */}
      {season.championClub && (
        <div className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-idm-gold-warm/[0.06] border border-idm-gold-warm/10 max-w-[140px]">
          <Trophy className="w-3 h-3 text-idm-gold-warm shrink-0" />
          <div className="w-4 h-4 shrink-0 rounded overflow-hidden">
            <ClubLogoImage
              clubName={season.championClub.name}
              dbLogo={season.championClub.logo}
              width={16}
              height={16}
              alt={season.championClub.name}
            />
          </div>
          <span className="text-[9px] text-idm-gold-warm font-medium truncate">
            {season.championClub.name}
          </span>
        </div>
      )}

      {/* Date range */}
      <p className="mt-1.5 text-[8px] text-muted-foreground/50">
        {formatDate(season.startDate)}
        {season.endDate && ` — ${formatDate(season.endDate)}`}
      </p>
    </div>
  );
}

// ── Skeleton Node ──
function SkeletonNode({ index }: { index: number }) {
  return (
    <div className="flex flex-col items-center flex-shrink-0" style={{ animationDelay: `${index * 120}ms` }}>
      <div className="w-10 h-10 rounded-full bg-muted/20 border border-muted/10 skeleton-shimmer" />
      <div className="mt-2 w-8 h-4 rounded bg-muted/15 skeleton-shimmer" />
      <div className="mt-1.5 w-16 h-3 rounded bg-muted/10 skeleton-shimmer" />
      <div className="mt-1 w-10 h-2 rounded bg-muted/10 skeleton-shimmer" />
    </div>
  );
}

// ── Date formatter ──
function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

// ── Main Component ──
export function SeasonTimeline() {
  const { data, isLoading, error } = useQuery<TimelineResponse>({
    queryKey: ['seasons-timeline'],
    queryFn: async () => {
      const res = await fetch('/api/seasons/timeline');
      if (!res.ok) throw new Error('Failed to fetch timeline');
      return res.json();
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  const seasons = data?.seasons ?? [];

  return (
    <section id="timeline" className="relative py-16 sm:py-20" aria-label="Season Timeline">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c0a06] via-idm-gold-warm/[0.02] to-[#0c0a06]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionHeader
            icon={Calendar}
            label="Timeline"
            title="Perjalanan Liga"
            subtitle="Jejak setiap season IDM League"
          />
        </AnimatedSection>

        {/* Timeline content */}
        {isLoading ? (
          <div className="flex items-start gap-8 sm:gap-12 overflow-x-auto custom-scrollbar pb-4 px-4 snap-x snap-mandatory">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonNode key={i} index={i} />
            ))}
          </div>
        ) : error || seasons.length === 0 ? (
          <Card className="p-6 bg-card/50 border-idm-gold-warm/10">
            <AnimatedEmptyState
              icon={Calendar}
              message="Belum ada season tercatat"
              hint="Timeline season akan muncul setelah season pertama dimulai"
            />
          </Card>
        ) : (
          <>
            {/* Desktop: Full width horizontal timeline */}
            <div className="hidden sm:flex items-start justify-center gap-8 lg:gap-12 px-4">
              {seasons.map((season, i) => (
                <SeasonNode
                  key={season.id}
                  season={season}
                  index={i}
                  total={seasons.length}
                />
              ))}
            </div>

            {/* Mobile: Horizontal scroll */}
            <div className="sm:hidden flex items-start gap-6 overflow-x-auto custom-scrollbar pb-4 px-4 snap-x snap-mandatory">
              {seasons.map((season, i) => (
                <SeasonNode
                  key={season.id}
                  season={season}
                  index={i}
                  total={seasons.length}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-8 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-idm-gold-warm" />
                <span>Selesai</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>Aktif</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/50" />
                <span>Akan Datang</span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
