'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
/* framer-motion removed — using CSS animations for performance */
import Image from 'next/image';
import {
  Heart, MapPin, Users, Trophy, Clock, Flame,
  Shield, Music,
  Gamepad2, Wallet, Target, Gift, ChevronRight,
  BarChart3,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CasinoHeroSkeleton,
  StatsRowSkeleton,
  MatchRowSkeleton,
  TableSkeleton,
} from '../ui/skeleton';
import { CountdownTimer } from '../countdown-timer';
import { PlayerProfile } from '../player-profile';
import { ClubProfile } from '../club-profile';
import { ParticipantGrid } from '../participant-grid';
import { StatusBadge } from '../status-badge';
import { ShareButton } from '../ui/share-button';
import React, { useState, useMemo, useEffect } from 'react';
import { useDivisionTheme } from '@/hooks/use-division-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency, getAvatarUrl, clubToString } from '@/lib/utils';
import { TierBadge } from '../tier-badge';
import type { StatsData } from '@/types/stats';

import { NoSeasonState } from './no-season-state';
import { NoTournamentState } from './no-tournament-state';
import { OverviewTab } from './overview-tab';
import { StandingsTab } from './standings-tab';
import { MatchesTab } from './matches-tab';
import { DonationModal } from '../donation-modal';
import { PlayerQuickSearch, addRecentlyViewed, getRecentlyViewed, type RecentlyViewedPlayer } from '../player-quick-search';
import { PlayerAccountModal } from '../player-account-modal';
import { MyAccountCard } from '../my-account-card';
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
  const { division, playerAuth } = useAppStore();
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
    addRecentlyViewed(normalizedPlayer);
    setSelectedPlayer(normalizedPlayer);
    setRecentPlayers(getRecentlyViewed());
  };
  const [selectedClub, setSelectedClub] = useState<StatsData['clubs'][0] | null>(null);
  const [donationOpen, setDonationOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Recently viewed players (up to 3)
  const [recentPlayers, setRecentPlayers] = useState<RecentlyViewedPlayer[]>([]);
  useEffect(() => {
    setRecentPlayers(getRecentlyViewed());
  }, []);

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

  /* Unified stats array — rendered once, responsive classes handle differences */
  const stats = [
    { icon: Users, value: `${data.totalPlayers}`, label: 'Players', color: 'from-idm-male to-idm-male-light' },
    { icon: Shield, value: `${data.clubs?.length || 0}`, label: 'Clubs', color: 'from-idm-female to-idm-female-light' },
    { icon: Wallet, value: formatCurrency(data.totalPrizePool).replace('Rp', '').trim(), label: 'Prize Pool', color: 'from-idm-gold-warm to-[#b8860b]' },
    { icon: Target, value: `${data.seasonProgress?.percentage || 0}%`, label: 'Progress', color: 'from-green-500 to-green-600' },
  ];

  return (
    <>
    <div className="space-y-3 sm:space-y-4 lg:space-y-8 max-w-7xl mx-auto">

      {/* ========== HERO BANNER — Premium Desktop + Compact Mobile ========== */}
      <div className={`stagger-item-subtle stagger-d0 relative rounded-xl sm:rounded-2xl overflow-hidden ${dt.casinoCard} min-h-[120px] sm:min-h-[180px] lg:min-h-[280px] ${!isMobile ? 'casino-shimmer' : ''}`}>
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
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
          <ShareButton
            title={t?.name || 'IDM League'}
            description={`Week ${t?.weekNumber || '-'} — ${division === 'male' ? 'Male' : 'Female'} Division`}
            variant="icon"
          />
          <StatusBadge status={t?.status || 'registration'} />
        </div>
        <div className="absolute bottom-3 sm:bottom-4 lg:bottom-6 left-3 sm:left-5 lg:left-8 right-3 sm:right-5 lg:right-8 z-10">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={`${dt.casinoBadge} px-2 py-0.5`}>
              🐉 Season {data.season?.number || 1}
            </Badge>
            <Badge className={`${dt.casinoBadge} px-2 py-0.5`}>
              {division === 'male' ? '🕺 Male' : '💃 Female'}
            </Badge>
          </div>
          <h2 className={`text-base sm:text-2xl lg:text-3xl font-black ${dt.neonGradient}`}>{t?.name || 'IDM League Babak'}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{data.season?.name}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className={`w-3 h-3 ${dt.neonText}`} />{t?.scheduledAt ? new Date(t.scheduledAt).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Segera Hadir'}</span>
            <span className="flex items-center gap-1"><MapPin className={`w-3 h-3 ${dt.neonText}`} />{t?.location || 'Online'}</span>
            <span className="flex items-center gap-1"><Flame className={`w-3 h-3 ${dt.neonText}`} />Week {t?.weekNumber || 5}</span>
          </div>
          {/* Desktop-only extra info row */}
          <div className="hidden sm:flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Trophy className={`w-3 h-3 ${dt.neonText}`} />Format: {t?.format === 'group_stage' ? 'Group + Playoff' : t?.format === 'double_elimination' ? 'Double Elim.' : 'Single Elim.'}</span>
            {t?.bpm ? <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400 live-dot" />{t.bpm} BPM</span> : null}
            <span className="flex items-center gap-1"><Music className={`w-3 h-3 ${dt.neonText}`} />{t?.matches?.length || recentMatches.length} Match</span>
          </div>
        </div>
      </div>

      {/* ========== QUICK STATS BAR — At-a-glance summary ========== */}
      <QuickStatsBar data={data} division={division} />

      {/* ========== LIVE MATCH INDICATOR — Live count, next match, recent results ========== */}
      <div className="stagger-item-subtle stagger-d0">
        <LiveMatchIndicator />
      </div>

      {/* ========== LIVE MATCH COUNTER — Real-time match status ========== */}
      <LiveMatchCounter />

      {/* ========== COUNTDOWN / STATUS + PRIZE POOL ========== */}
      <div className="stagger-item-subtle stagger-d1 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-5">
        {t?.scheduledAt && t.status !== 'completed' ? (
          <div className={`flex items-center justify-center rounded-xl ${dt.bgSubtle} ${dt.border} p-3 lg:p-6 shadow-sm lg:shadow-md`}>
            <CountdownTimer targetDate={t.scheduledAt} />
          </div>
        ) : (
          <div className={`flex flex-col justify-center gap-3 rounded-xl ${dt.bgSubtle} ${dt.border} p-3 lg:p-6 shadow-sm lg:shadow-md`}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg ${dt.iconBg} flex items-center justify-center shrink-0`}>
                <Trophy className={`w-4 h-4 ${dt.neonText}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{t?.name || 'IDM League'}</p>
                <p className="text-[10px] text-muted-foreground">{data.season?.name || 'Season ' + (data.season?.number || 1)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className={`rounded-lg ${dt.bg} p-2 text-center`}>
                <p className={`text-sm font-black ${dt.neonText}`}>{t?.status === 'completed' ? 'Selesai' : t?.status === 'live' ? 'Live' : t?.status === 'registration' ? 'Registrasi' : 'Aktif'}</p>
                <p className="text-[9px] text-muted-foreground">Status</p>
              </div>
              <div className={`rounded-lg ${dt.bg} p-2 text-center`}>
                <p className={`text-sm font-black ${dt.neonText}`}>{t?.format === 'group_stage' ? 'Group+PO' : t?.format === 'double_elimination' ? 'DBL Elim' : 'SGL Elim'}</p>
                <p className="text-[9px] text-muted-foreground">Format</p>
              </div>
            </div>
            {t?.scheduledAt && t.status === 'completed' && (
              <p className="text-[10px] text-muted-foreground text-center">🏆 Turnamen telah selesai</p>
            )}
            {!t?.scheduledAt && (
              <p className="text-[10px] text-muted-foreground text-center">⏳ Jadwal belum ditentukan</p>
            )}
          </div>
        )}
        <div className={`flex flex-col justify-between p-3 lg:p-6 rounded-xl ${dt.bgSubtle} ${dt.border} shadow-sm lg:shadow-md`}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground shrink-0">💰 Prize Pool</span>
            <span className={`text-sm sm:text-lg lg:text-2xl font-bold ${dt.neonGradient} truncate`}>{formatCurrency(t?.prizePool || 0)}</span>
          </div>
          <Progress value={data.totalPrizePool > 0 ? Math.min((data.totalPrizePool / 500000) * 100, 100) : 0} className="mt-2 h-1.5" />
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] text-muted-foreground truncate mr-2">Terkumpul: {formatCurrency(data.totalPrizePool)}</p>
            <button
              onClick={() => setDonationOpen(true)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-gradient-to-r from-idm-gold-warm to-[#e8d5a3] text-black hover:opacity-90 transition-opacity cursor-pointer min-h-[32px] shrink-0`}
            >
              <Gift className="w-3 h-3" />
              Sawer
            </button>
          </div>
        </div>
      </div>

      {/* ========== QUICK STATS — Unified Casino Pills ========== */}
      <div className="stagger-item-subtle stagger-d2 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="interactive-scale group">
            <div className={`casino-pill ${dt.casinoGlow} lg:shadow-md`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shrink-0`}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div>
                <p className={`text-sm sm:text-lg lg:text-xl font-bold ${dt.neonGradient}`}>{stat.value}</p>
                <p className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========== ACTIVITY FEED — Live Platform Activity ========== */}
      <div className="stagger-item-subtle stagger-d2">
        <ActivityFeed />
      </div>

      {/* ========== DIVISION RIVALRY — Top 2 Head-to-Head ========== */}
      <div className="stagger-item-subtle stagger-d2">
        <DivisionRivalryWidget setSelectedPlayer={handleSelectPlayer} />
      </div>

      {/* ========== STREAK WIDGET — Longest Win Streak ========== */}
      <div className="stagger-item-subtle stagger-d2">
        <StreakWidget />
      </div>

      {/* ========== MATCH RESULTS SUMMARY — Recent Results ========== */}
      <div className="stagger-item-subtle stagger-d3">
        <MatchResultsSummary />
      </div>

      {/* ========== MATCH DAY COUNTDOWN ========== */}
      <div className="stagger-item-subtle stagger-d3">
        <MatchDayCountdown division={division} />
      </div>

      {/* ========== TOP DONORS — Prize Pool Supporters ========== */}
      <div className="stagger-item-subtle stagger-d4">
        <TopDonorsWidget onDonate={() => setDonationOpen(true)} />
      </div>

      {/* ========== AKUN SAYA — My Account Card (when logged in) ========== */}
      {playerAuth.isAuthenticated && playerAuth.account && (
        <div className="stagger-item-subtle stagger-d3">
          <MyAccountCard onOpenProfile={() => handleSelectPlayer(playerAuth.account!.player as any)} />
        </div>
      )}

      {/* ========== CARI SAYA — Player Quick Search ========== */}
      <div className="stagger-item-subtle stagger-d3">
        <PlayerQuickSearch onSelectPlayer={handleSelectPlayer} />
      </div>

      {/* ========== MASUK AKUN — Login prompt (when not logged in) ========== */}
      {!playerAuth.isAuthenticated && (
        <div className="stagger-item-subtle stagger-d3">
          <button
            onClick={() => setAccountModalOpen(true)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${dt.casinoCard} border ${dt.border} transition-colors hover:bg-muted/20 cursor-pointer group`}
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${division === 'male' ? 'from-idm-male/20 to-idm-male/5' : 'from-idm-female/20 to-idm-female/5'} flex items-center justify-center shrink-0`}>
              <Gamepad2 className={`w-4 h-4 ${dt.text}`} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-semibold">Masuk Akun</p>
              <p className="text-[10px] text-muted-foreground">Lihat statistik & prestasi kamu</p>
            </div>
            <ChevronRight className={`w-4 h-4 ${dt.text} shrink-0 opacity-40 group-hover:opacity-80 transition-opacity`} />
          </button>
        </div>
      )}

      {/* ========== TERAKHIR DILIHAT — Recently Viewed Players ========== */}
      {recentPlayers.length > 0 && (
        <div className="stagger-item-subtle stagger-d4">
          <div className={`rounded-xl ${dt.casinoCard} border ${dt.border} overflow-hidden`}>
            <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 ${dt.bgSubtle} border-b ${dt.borderSubtle}`}>
              <Clock className={`w-3.5 h-3.5 ${dt.neonText}`} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Terakhir Dilihat</span>
            </div>
            <div className="divide-y divide-border/30">
              {recentPlayers.map((player) => {
                const avatarSrc = getAvatarUrl(player.gamertag, division, player.avatar);
                return (
                  <button
                    key={player.id}
                    onClick={() => handleSelectPlayer(player as any)}
                    className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 text-left transition-colors hover:bg-muted/30 cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-sm border border-border/20 group-hover:scale-105 transition-transform">
                      <Image
                        src={avatarSrc}
                        alt={player.gamertag}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate">{player.gamertag}</span>
                        <TierBadge tier={player.tier} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {clubToString(player.club as any) ? <>{clubToString(player.club as any)} · </> : ''}{player.points} pts · {player.totalWins}W
                      </p>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 ${dt.neonText} shrink-0 opacity-40 group-hover:opacity-80 transition-opacity`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========== LIVE MATCH BANNER ========== */}
      {t?.matches?.some(m => m.status === 'live' || m.status === 'main_event') && (
        <div
          className={`stagger-item-subtle stagger-d3 relative rounded-xl overflow-hidden border-2 border-red-500/30 ${dt.casinoCard} p-3 lg:p-4`}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500 animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <Badge className="bg-red-500/15 text-red-500 text-[10px] font-black border border-red-500/25 px-2">LIVE NOW</Badge>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">
                {t.matches.filter(m => m.status === 'live' || m.status === 'main_event').map(m => `${(m.team1?.name || 'TBD')} vs ${(m.team2?.name || 'TBD')}`).join(' • ')}
              </p>
              <p className="text-[10px] text-muted-foreground">Week {t.weekNumber} — Match sedang berlangsung</p>
            </div>
          </div>
        </div>
      )}

      {/* ========== SUB-NAVIGATION TABS — Toornament underline style ========== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className={`border-b ${dt.border}`}>
            <TabsList className="bg-transparent h-auto p-0 gap-0 rounded-none">
              {[
                { value: 'overview', label: 'Beranda', icon: Trophy },
                { value: 'standings', label: 'Peringkat', icon: Shield },
                { value: 'matches', label: 'Pertandingan', icon: Music },
                { value: 'participants', label: 'Peserta', icon: Gamepad2 },
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

        {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
        <TabsContent value="overview" className="mt-3 sm:mt-4 lg:mt-6 space-y-3 sm:space-y-4 lg:space-y-6">
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

        {/* ═══════════════ MATCHES TAB — MPL-Style Bracket ═══════════════ */}
        <TabsContent value="matches" className="mt-3 sm:mt-4 lg:mt-6 space-y-3 sm:space-y-4 lg:space-y-6">
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

      {/* Account Modal */}
      <PlayerAccountModal
        open={accountModalOpen}
        onOpenChange={setAccountModalOpen}
      />
    </div>
    </>
  );
}
