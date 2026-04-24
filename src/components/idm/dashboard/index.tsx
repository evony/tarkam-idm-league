'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
/* framer-motion removed — using CSS animations for performance */
import Image from 'next/image';
import {
  Heart, MapPin, Users, Trophy, Flame,
  Shield, Music,
  Gift,
  BarChart3,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CasinoHeroSkeleton,
  StatsRowSkeleton,
  MatchRowSkeleton,
  TableSkeleton,
} from '../ui/skeleton';
import { PlayerProfile } from '../player-profile';
import { ClubProfile } from '../club-profile';
import { ParticipantGrid } from '../participant-grid';
import { StatusBadge } from '../status-badge';
import { ShareButton } from '../ui/share-button';
import React, { useState, useMemo } from 'react';
import { useDivisionTheme } from '@/hooks/use-division-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency, clubToString } from '@/lib/utils';
import type { StatsData } from '@/types/stats';

import { NoSeasonState } from './no-season-state';
import { NoTournamentState } from './no-tournament-state';
import { OverviewTab } from './overview-tab';
import { StandingsTab } from './standings-tab';
import { MatchesTab } from './matches-tab';
import { DonationModal } from '../donation-modal';
import { ActivityFeed } from '../activity-feed';
import { StatsTab } from './stats-tab';
import { QuickStatsBar } from './quick-stats-bar';
import { TopDonorsWidget } from './top-donors-widget';
import { DivisionRivalryWidget } from './division-rivalry-widget';
import { LiveMatchCounter } from './live-match-counter';
import { LiveMatchIndicator } from './live-match-indicator';
import { MatchDayCountdown } from './match-day-countdown';
import { StreakWidget } from './streak-widget';
import { MatchResultsSummary } from './match-results-summary';

/* ─── Main Dashboard Component ─── */
export function Dashboard() {
  const { division } = useAppStore();
  const dt = useDivisionTheme();
  const isMobile = useIsMobile();

  const [selectedPlayer, setSelectedPlayer] = useState<StatsData['topPlayers'][0] | null>(null);

  // Track recently viewed players
  const handleSelectPlayer = (player: any) => {
    // Normalize club to string before setting state & saving
    // (search API returns {id, name, logo} but we need string)
    const normalizedPlayer = {
      ...player,
      club: clubToString(player.club) || undefined,
    };
    setSelectedPlayer(normalizedPlayer);
  };
  const [selectedClub, setSelectedClub] = useState<StatsData['clubs'][0] | null>(null);
  const [donationOpen, setDonationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { data, isLoading } = useQuery<StatsData>({
    queryKey: ['stats', division],
    queryFn: async () => {
      const res = await fetch(`/api/stats?division=${division}`);
      return res.json();
    },
  });

  // CMS settings for donation modal payment info
  const { data: cms } = useQuery<Record<string, string>>({
    queryKey: ['cms-settings'],
    queryFn: async () => {
      const res = await fetch('/api/cms/content');
      if (!res.ok) return {};
      const json = await res.json();
      return json.settings || {};
    },
  });

  /* Group matches by week for the Matches tab */
  const recentMatches = data?.recentMatches ?? [];
  const upcomingMatches = data?.upcomingMatches ?? [];

  const matchesByWeek = useMemo(() => {
    if (recentMatches.length === 0) return {} as Record<number, StatsData['recentMatches']>;
    return recentMatches.reduce((acc, m) => {
      if (!acc[m.week]) acc[m.week] = [];
      acc[m.week].push(m);
      return acc;
    }, {} as Record<number, StatsData['recentMatches']>);
  }, [recentMatches]);

  const upcomingByWeek = useMemo(() => {
    if (upcomingMatches.length === 0) return {} as Record<number, StatsData['upcomingMatches']>;
    return upcomingMatches.reduce((acc, m) => {
      if (!acc[m.week]) acc[m.week] = [];
      acc[m.week].push(m);
      return acc;
    }, {} as Record<number, StatsData['upcomingMatches']>);
  }, [upcomingMatches]);

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-7xl mx-auto">
        <CasinoHeroSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="flex items-center justify-center rounded-xl border border-border/50 bg-card/60 p-3">
            <Skeleton className="h-8 w-48 rounded-lg" />
          </div>
          <div className="p-3 rounded-xl border border-border/50 bg-card/60 space-y-2">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-6 w-32 rounded" />
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        </div>
        <StatsRowSkeleton count={4} />
        <div className="border-b border-border">
          <div className="flex items-center gap-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-none" />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <MatchRowSkeleton count={3} />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card/60 p-3 space-y-2">
                <Skeleton className="h-16 w-16 mx-auto rounded-xl" />
                <Skeleton className="h-3 w-16 mx-auto rounded" />
                <Skeleton className="h-2 w-10 mx-auto rounded" />
              </div>
            ))}
          </div>
        </div>
        <TableSkeleton rows={5} cols={4} />
      </div>
    );
  }

  /* ─── Level 1: No Season at all ─── */
  if (!data?.hasData) {
    return <NoSeasonState division={division} />;
  }

  const t = data.activeTournament;

  /* ─── Level 2: Season exists but no active tournament ─── */
  const hasTournament = !!t;

  if (!hasTournament) {
    return <NoTournamentState data={data} setSelectedPlayer={handleSelectPlayer} />;
  }

  return (
    <>
    <div className="space-y-3 sm:space-y-4 max-w-7xl mx-auto">

      {/* ========== HERO BANNER — Premium Desktop + Compact Mobile ========== */}
      <div className={`stagger-item-subtle stagger-d0 relative rounded-xl sm:rounded-2xl overflow-hidden ${dt.casinoCard} min-h-[160px] sm:min-h-[180px] lg:min-h-[280px] ${!isMobile ? 'casino-shimmer' : ''}`}>
        <div className={dt.casinoBar} />
        <div className="absolute inset-0">
          <Image src={division === 'male' ? '/bg-male.jpg' : '/bg-female.jpg'} alt="" fill sizes="100vw" className={`object-cover ${division === 'male' ? 'object-[center_25%]' : ''}`} aria-hidden="true" />
        </div>
        <div className="casino-img-overlay" />
        {/* Decorative blur orbs — hidden on mobile for performance */}
        <div className={`hidden lg:block absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl ${dt.bg} opacity-30 lg:opacity-40`} />
        <div className={`hidden lg:block absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full blur-3xl ${dt.bg} opacity-20`} />
        <div className={`absolute top-3 left-3 ${dt.cornerAccent}`} />
        <div className={`absolute top-3 right-3 rotate-90 ${dt.cornerAccent}`} />
        {/* Bottom corner accents — desktop only */}
        <div className={`hidden lg:block absolute bottom-3 left-3 rotate-180 ${dt.cornerAccent}`} />
        <div className={`hidden lg:block absolute bottom-3 right-3 rotate-270 ${dt.cornerAccent}`} />
        {/* Content — 2-column layout: Left (badges + title + chips) | Right (status + prize + sawer) */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-3 sm:p-5 lg:p-8">
          {/* Top row: Badges left, Status + Share right */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge className={`${dt.casinoBadge} px-2 py-0.5`}>
                🐉 Season {data.season?.number || 1}
              </Badge>
              <Badge className={`${dt.casinoBadge} px-2 py-0.5`}>
                {division === 'male' ? '🕺 Male' : '💃 Female'}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <ShareButton
                title={t?.name || 'IDM League'}
                description={`Week ${t?.weekNumber || '-'} — ${division === 'male' ? 'Male' : 'Female'} Division`}
                variant="icon"
              />
              <StatusBadge status={t?.status || 'registration'} />
            </div>
          </div>

          {/* Middle row: Title left, Prize Pool + Sawer right */}
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className={`text-base sm:text-2xl lg:text-4xl font-black ${dt.neonGradient} leading-tight`}>{t?.name || 'IDM League Babak'}</h2>
              <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground mt-1">{data.season?.name}</p>
            </div>
            {/* Right: Prize Pool + Sawer — hidden on very small mobile, visible sm+ */}
            <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-idm-gold-warm/20 to-idm-gold-warm/10 border border-idm-gold-warm/30 text-xs lg:text-sm font-bold text-idm-gold-warm">
                💰 {formatCurrency(data.totalPrizePool)}
              </span>
              <button
                onClick={() => setDonationOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs lg:text-sm font-bold bg-gradient-to-r from-idm-gold-warm to-[#e8d5a3] text-black hover:opacity-90 transition-opacity cursor-pointer min-h-[32px]"
              >
                <Gift className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                Sawer
              </button>
            </div>
          </div>

          {/* Bottom row: Info chips — full width */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 lg:gap-x-3">
            {/* Mobile-only: Prize + Sawer inline */}
            <span className="sm:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-idm-gold-warm/20 to-idm-gold-warm/10 border border-idm-gold-warm/30 text-[10px] font-semibold text-idm-gold-warm">
              💰 {formatCurrency(data.totalPrizePool)}
            </span>
            <button
              onClick={() => setDonationOpen(true)}
              className="sm:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-gradient-to-r from-idm-gold-warm to-[#e8d5a3] text-black hover:opacity-90 transition-opacity cursor-pointer min-h-[28px]"
            >
              <Gift className="w-3 h-3" />
              Sawer
            </button>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm text-[10px] sm:text-xs lg:text-sm text-muted-foreground"><Flame className={`w-3 h-3 lg:w-4 lg:h-4 ${dt.neonText}`} />Week {t?.weekNumber || 5}</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm text-[10px] sm:text-xs lg:text-sm text-muted-foreground"><MapPin className={`w-3 h-3 lg:w-4 lg:h-4 ${dt.neonText}`} />{t?.location || 'Online'}</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm text-[10px] sm:text-xs lg:text-sm text-muted-foreground"><Trophy className={`w-3 h-3 lg:w-4 lg:h-4 ${dt.neonText}`} />{t?.format === 'group_stage' ? 'Group + Playoff' : t?.format === 'double_elimination' ? 'Double Elim.' : 'Single Elim.'}</span>
            {t?.bpm ? <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm text-[10px] lg:text-sm text-muted-foreground"><Heart className="w-3 h-3 lg:w-4 lg:h-4 text-red-400 live-dot" />{t.bpm} BPM</span> : null}
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm text-[10px] lg:text-sm text-muted-foreground"><Music className={`w-3 h-3 lg:w-4 lg:h-4 ${dt.neonText}`} />{t?.matches?.length || recentMatches.length} Match</span>
          </div>
        </div>
      </div>

      {/* ========== TAB BAR — Moved up immediately after hero ========== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className={`border-b ${dt.border}`}>
            <TabsList className="bg-transparent h-auto p-0 gap-0 rounded-none">
              {[
                { value: 'overview', label: 'Beranda', icon: Trophy },
                { value: 'standings', label: 'Peringkat', icon: Shield },
                { value: 'matches', label: 'Pertandingan', icon: Music },
                { value: 'participants', label: 'Peserta', icon: Users },
                { value: 'stats', label: 'Statistik', icon: BarChart3 },
              ].map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`relative px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-current data-[state=active]:bg-transparent data-[state=active]:shadow-none ${division === 'male' ? 'data-[state=active]:text-idm-male' : 'data-[state=active]:text-idm-female'} text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap`}
                >
                  <tab.icon className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {/* ═══════════════ OVERVIEW TAB — Now includes moved widgets ═══════════════ */}
        <TabsContent value="overview" className="mt-3 sm:mt-4 lg:mt-6 space-y-3 sm:space-y-4 lg:space-y-6">
          {/* Quick Stats Bar */}
          <QuickStatsBar data={data} division={division} />

          {/* Live Match Indicator */}
          <div className="stagger-item-subtle stagger-d0">
            <LiveMatchIndicator />
          </div>

          {/* Live Match Counter */}
          <LiveMatchCounter />

          {/* Activity Feed */}
          <div className="stagger-item-subtle stagger-d2">
            <ActivityFeed />
          </div>

          {/* Division Rivalry */}
          <div className="stagger-item-subtle stagger-d2">
            <DivisionRivalryWidget setSelectedPlayer={handleSelectPlayer} />
          </div>

          {/* Streak Widget */}
          <div className="stagger-item-subtle stagger-d2">
            <StreakWidget />
          </div>

          {/* Top Donors */}
          <div className="stagger-item-subtle stagger-d4">
            <TopDonorsWidget onDonate={() => setDonationOpen(true)} />
          </div>

          {/* Existing Overview Tab Content */}
          <OverviewTab
            data={data}
            division={division}
            setSelectedPlayer={handleSelectPlayer}
            setSelectedClub={setSelectedClub}
          />
        </TabsContent>

        {/* ═══════════════ STANDINGS TAB — Toornament Style ═══════════════ */}
        <TabsContent value="standings" className="mt-3 sm:mt-4 lg:mt-6 space-y-3 sm:space-y-4 lg:space-y-6">
          <StandingsTab
            data={data}
            setSelectedPlayer={handleSelectPlayer}
            setSelectedClub={setSelectedClub}
          />
        </TabsContent>

        {/* ═══════════════ MATCHES TAB — Now includes match-related widgets ═══════════════ */}
        <TabsContent value="matches" className="mt-3 sm:mt-4 lg:mt-6 space-y-3 sm:space-y-4 lg:space-y-6">
          {/* Match Results Summary */}
          <div className="stagger-item-subtle stagger-d3">
            <MatchResultsSummary />
          </div>

          {/* Match Day Countdown */}
          <div className="stagger-item-subtle stagger-d3">
            <MatchDayCountdown division={division} />
          </div>

          {/* Existing Matches Tab Content */}
          <MatchesTab
            data={data}
            recentMatches={recentMatches}
            upcomingMatches={upcomingMatches}
            matchesByWeek={matchesByWeek}
            upcomingByWeek={upcomingByWeek}
            clubs={data.clubs}
          />
        </TabsContent>

        {/* ═══════════════ PARTICIPANTS TAB — Tournament Poster Grid ═══════════════ */}
        <TabsContent value="participants" className="mt-3 sm:mt-4 lg:mt-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="stagger-item-subtle">
              <ParticipantGrid
                players={data.topPlayers || []}
                onPlayerClick={(player) => handleSelectPlayer(player)}
              />
            </div>
          </div>
        </TabsContent>

        {/* ═══════════════ STATS TAB — Season Statistics Dashboard ═══════════════ */}
        <TabsContent value="stats" className="mt-3 sm:mt-4 lg:mt-6">
          <StatsTab />
        </TabsContent>


      </Tabs>

      {/* Player & Club Profiles */}
      {selectedPlayer && (
        <PlayerProfile player={selectedPlayer} onClose={() => setSelectedPlayer(null)} skinMap={data?.skinMap} />
      )}
      {selectedClub && (
        <ClubProfile club={selectedClub} onClose={() => setSelectedClub(null)} />
      )}

      {/* Donation Modal */}
      <DonationModal
        open={donationOpen}
        onOpenChange={setDonationOpen}
        defaultType="weekly"
        cmsSettings={cms || {}}
      />


    </div>
    </>
  );
}

