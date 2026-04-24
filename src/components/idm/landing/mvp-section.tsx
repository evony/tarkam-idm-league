'use client';

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music, Shield, Crown, Clock, Flame,
  ChevronLeft, ChevronRight, Calendar, CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MVPCardSkeleton } from '../ui/skeleton';
import { TierBadge } from '../tier-badge';
import { SectionHeader } from './shared';
import { getAvatarUrl, hexToRgba } from '@/lib/utils';
import type { StatsData, MvpHallOfFameEntry, SeasonInfo } from '@/types/stats';

interface MvpSectionProps {
  maleData: StatsData | undefined;
  femaleData: StatsData | undefined;
  isDataLoading: boolean;
  cmsSections: Record<string, any>;
  setSelectedPlayer: (player: StatsData['topPlayers'][0] & { division?: string } | null) => void;
}

const WEEKS_PER_PAGE = 5;
const SEASONS_PER_PAGE = 5;

/** Season Selector for MVP — paginated */
function MvpSeasonSelector({
  seasons,
  selectedSeasonId,
  onSelect,
  accent,
  accentLight,
  seasonPage,
  onSeasonPageChange,
}: {
  seasons: SeasonInfo[];
  selectedSeasonId: string;
  onSelect: (id: string) => void;
  accent: string;
  accentLight: string;
  seasonPage: number;
  onSeasonPageChange: (page: number) => void;
}) {
  if (seasons.length <= 1) return null;

  const totalSeasonPages = Math.ceil(seasons.length / SEASONS_PER_PAGE);
  const spStart = seasonPage * SEASONS_PER_PAGE;
  const spEnd = Math.min(spStart + SEASONS_PER_PAGE, seasons.length);
  const visibleSeasons = seasons.slice(spStart, spEnd);

  return (
    <div className="flex items-center gap-1.5">
      {/* Prev page */}
      {totalSeasonPages > 1 && (
        <button
          onClick={() => onSeasonPageChange(Math.max(0, seasonPage - 1))}
          disabled={seasonPage === 0}
          className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all disabled:opacity-25 disabled:cursor-not-allowed hover:scale-110 cursor-pointer"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.70)', border: '1px solid rgba(255,255,255,0.10)' }}
          aria-label="Previous seasons"
        >
          <ChevronLeft className="w-2.5 h-2.5" />
        </button>
      )}

      {/* Season tabs */}
      <div className="flex-1 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
        {visibleSeasons.map((s) => {
          const isActive = s.id === selectedSeasonId;
          const isCompleted = s.status === 'completed';
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`shrink-0 flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                isActive ? 'scale-105' : 'hover:scale-105'
              }`}
              style={isActive ? {
                backgroundColor: hexToRgba(accent, 0.30),
                color: accentLight,
                border: `1px solid ${hexToRgba(accent, 0.50)}`,
                boxShadow: `0 0 12px ${hexToRgba(accent, 0.25)}`,
              } : {
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.60)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              aria-label={`Season ${s.number}`}
              aria-pressed={isActive}
            >
              <Calendar className="w-2.5 h-2.5" />
              <span>S{s.number}</span>
              {isCompleted && <CheckCircle2 className="w-2.5 h-2.5 opacity-60" />}
              <span className="text-[8px] font-normal opacity-60">({s.tournamentCount}w)</span>
            </button>
          );
        })}
      </div>

      {/* Next page */}
      {totalSeasonPages > 1 && (
        <button
          onClick={() => onSeasonPageChange(Math.min(totalSeasonPages - 1, seasonPage + 1))}
          disabled={seasonPage === totalSeasonPages - 1}
          className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all disabled:opacity-25 disabled:cursor-not-allowed hover:scale-110 cursor-pointer"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.70)', border: '1px solid rgba(255,255,255,0.10)' }}
          aria-label="Next seasons"
        >
          <ChevronRight className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
}

/** Division MVP Card — with independent season + week selector */
function DivisionMVPCard({
  division,
  data,
  setSelectedPlayer,
}: {
  division: 'male' | 'female';
  data: StatsData;
  setSelectedPlayer: (player: StatsData['topPlayers'][0] & { division?: string } | null) => void;
}) {
  const allMvps = data.mvpHallOfFame || [];
  const allSeasons = data.allSeasons || [];

  const isMale = division === 'male';
  const accent = isMale ? '#06b6d4' : '#a855f7';
  const accentLight = isMale ? '#22d3ee' : '#c084fc';
  const accentFaint = isMale ? '#67e8f9' : '#e9d5ff';
  const DivisionIcon = isMale ? Music : Shield;

  // Group MVPs by season
  const mvpsBySeason = useMemo(() => {
    const map = new Map<string, MvpHallOfFameEntry[]>();
    for (const m of allMvps) {
      // MVP entries don't have seasonId directly, find via weekNumber matching champions
      // Use allSeasons to figure out which season each MVP belongs to
      // For now, group all under current approach: use the weeklyChampions to map weeks to seasons
    }
    // Simpler approach: find season for each MVP by matching weekNumber against weeklyChampions
    const championWeeks = data.weeklyChampions || [];
    for (const mvp of allMvps) {
      const champ = championWeeks.find(c => c.weekNumber === mvp.weekNumber);
      const seasonId = champ?.seasonId || allSeasons[0]?.id || '';
      if (!map.has(seasonId)) map.set(seasonId, []);
      map.get(seasonId)!.push(mvp);
    }
    // Sort each season's MVPs by week number
    for (const [, mvps] of map) {
      mvps.sort((a, b) => a.weekNumber - b.weekNumber);
    }
    return map;
  }, [allMvps, allSeasons, data.weeklyChampions]);

  // Default to latest season
  const defaultSeasonId = allSeasons[0]?.id || '';
  const [selectedSeasonId, setSelectedSeasonId] = useState(defaultSeasonId);
  const mvps = mvpsBySeason.get(selectedSeasonId) || [];

  const [selectedWeekIdx, setSelectedWeekIdx] = useState(() => {
    return Math.max(0, mvps.length - 1);
  });
  const [weekPage, setWeekPage] = useState(() => {
    return Math.floor(Math.max(0, mvps.length - 1) / WEEKS_PER_PAGE);
  });

  // Season pagination — default to page containing the selected season
  const [seasonPage, setSeasonPage] = useState(() => {
    const idx = allSeasons.findIndex(s => s.id === defaultSeasonId);
    return Math.floor(Math.max(0, idx) / SEASONS_PER_PAGE);
  });

  const totalPages = Math.ceil(mvps.length / WEEKS_PER_PAGE);
  const pageStart = weekPage * WEEKS_PER_PAGE;
  const pageEnd = Math.min(pageStart + WEEKS_PER_PAGE, mvps.length);
  const visibleWeeks = mvps.slice(pageStart, pageEnd);

  const selectedMvp = mvps[selectedWeekIdx];

  const selectedSeasonInfo = allSeasons.find(s => s.id === selectedSeasonId);

  const handleSeasonChange = useCallback((seasonId: string) => {
    setSelectedSeasonId(seasonId);
    const newMvps = mvpsBySeason.get(seasonId) || [];
    const newIdx = Math.max(0, newMvps.length - 1);
    setSelectedWeekIdx(newIdx);
    setWeekPage(Math.floor(newIdx / WEEKS_PER_PAGE));
    // Auto-navigate season page to include selected season
    const sIdx = allSeasons.findIndex(s => s.id === seasonId);
    if (sIdx >= 0) setSeasonPage(Math.floor(sIdx / SEASONS_PER_PAGE));
  }, [mvpsBySeason, allSeasons]);

  const handleWeekSelect = useCallback((idx: number) => {
    setSelectedWeekIdx(idx);
  }, []);

  // Empty state — no MVPs at all
  if (!allMvps.length) {
    return (
      <div className="relative rounded-2xl overflow-hidden min-h-[380px] sm:min-h-[520px] champion-gold-frame border bg-[#0c0a06] flex flex-col items-center justify-center p-8" style={{ borderColor: hexToRgba(accent, 0.20) }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 50%, ${hexToRgba(accent, 0.08)}, transparent 60%)` }} />
        <div className={`mvp-glow-ring absolute z-0 w-32 h-32 rounded-full ${isMale ? '' : 'mvp-glow-ring-female'}`} aria-hidden="true" />
        <div className="relative z-10 w-28 h-28 rounded-full border-2 border-dashed flex items-center justify-center mb-6" style={{ borderColor: hexToRgba(accent, 0.25) }}>
          <div className="animate-float-medium">
            <Crown className="w-16 h-16" style={{ color: hexToRgba(accent, 0.30) }} />
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3 mb-2">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-idm-gold-warm/40" />
          <p className="text-sm font-bold text-white/80 uppercase tracking-widest">MVP Belum Dipilih</p>
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-idm-gold-warm/40" />
        </div>
        <p className="relative z-10 text-xs text-muted-foreground/80 mt-1">MVP ditetapkan admin saat finalisasi tournament</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* MVP Hero Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedSeasonId}-${selectedWeekIdx}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {!selectedMvp ? (
            /* No MVP for this season/week */
            <div className="relative rounded-2xl overflow-hidden min-h-[380px] sm:min-h-[460px] champion-gold-frame border bg-[#0c0a06] flex flex-col items-center justify-center p-8" style={{ borderColor: hexToRgba(accent, 0.20) }}>
              <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 50%, ${hexToRgba(accent, 0.06)}, transparent 60%)` }} />
              <Crown className="relative z-10 w-12 h-12 mb-3 opacity-30" style={{ color: accent }} />
              <p className="relative z-10 text-sm font-bold text-white/70">Belum ada MVP di season ini</p>
              <p className="relative z-10 text-xs text-muted-foreground/60 mt-1">Tournament belum difinalisasi</p>
            </div>
          ) : (
            <div
              className="perspective-card relative rounded-2xl overflow-hidden cursor-pointer group border transition-all duration-300 mvp-card-glow champion-gold-frame"
              style={{ borderColor: hexToRgba(accent, 0.15), boxShadow: `0 0 40px ${hexToRgba(accent, 0.08)}` }}
              role="button"
              tabIndex={0}
              aria-label={`View MVP profile: ${selectedMvp.gamertag}`}
              onClick={() => {
                const found = data.topPlayers?.find(p => p.gamertag === selectedMvp.gamertag);
                if (found) setSelectedPlayer({ ...found, division });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  const found = data.topPlayers?.find(p => p.gamertag === selectedMvp.gamertag);
                  if (found) setSelectedPlayer({ ...found, division });
                }
              }}
            >
              {/* Card layout: avatar left, info right — responsive */}
              <div className="flex flex-col sm:flex-row">
                {/* Avatar Section */}
                <div className="relative w-full sm:w-[45%] min-h-[220px] sm:min-h-[380px] overflow-hidden">
                  <Image src={getAvatarUrl(selectedMvp.gamertag, division, selectedMvp.avatar)} alt={selectedMvp.gamertag} fill sizes="(max-width: 640px) 100vw, 45vw" className="object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                  {/* Overlay gradient for avatar section */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0c0a06]/80 hidden sm:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a06] via-transparent to-transparent sm:hidden" />
                  {/* Gold shimmer accent line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent z-20 sm:hidden" style={{ color: accent }} />
                  {/* MVP badge on avatar */}
                  <div className="absolute top-3 right-3 z-10">
                    <div className="mvp-badge-premium glow-pulse flex items-center gap-1 px-3 py-1.5 rounded-lg border border-idm-gold-warm/40" style={{ background: 'linear-gradient(135deg, rgba(212,168,83,0.40), rgba(212,168,83,0.15))' }}>
                      <Crown className="w-4 h-4 text-idm-gold-warm" />
                      <span className="mvp-text-animated text-xs font-black uppercase tracking-wider">MVP</span>
                    </div>
                  </div>
                  {/* Bottom gradient for mobile name overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-4 z-10 sm:hidden">
                    <p className="text-2xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">{selectedMvp.gamertag}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <TierBadge tier={selectedMvp.tier} />
                      {selectedMvp.totalMvp > 1 && <span className="text-[10px] font-bold text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded">{selectedMvp.totalMvp}x MVP</span>}
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="relative flex-1 p-5 sm:p-6 flex flex-col justify-between min-h-[200px]" style={{ background: `linear-gradient(135deg, ${hexToRgba(accent, 0.06)} 0%, #0c0a06 40%, #0c0a06 100%)` }}>
                  {/* Gold shimmer accent line — desktop */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent z-20 hidden sm:block" style={{ color: accent }} />
                  {/* Subtle background glow */}
                  <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 80% 20%, ${hexToRgba(accent, 0.10)}, transparent 60%)` }} />

                  {/* Top: Division + Week */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg border" style={{ backgroundColor: hexToRgba(accent, 0.20), borderColor: hexToRgba(accent, 0.25) }}>
                        <DivisionIcon className="w-3.5 h-3.5" style={{ color: accentLight }} />
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accentLight }}>{division}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" style={{ color: accentLight }} />
                        <span className="text-[10px] font-bold" style={{ color: accentLight }}>W{selectedMvp.weekNumber}</span>
                        {selectedSeasonInfo && (
                          <span className="text-[9px] font-semibold text-white/40">S{selectedSeasonInfo.number}</span>
                        )}
                      </div>
                    </div>

                    {/* MVP watermark */}
                    <div className="relative">
                      <span className="absolute -top-3 left-0 text-6xl font-black text-white opacity-[0.03] -rotate-12 select-none pointer-events-none">MVP</span>
                      <p className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] hidden sm:block">{selectedMvp.gamertag}</p>
                    </div>

                    <div className="hidden sm:flex items-center gap-2.5 mt-2">
                      <TierBadge tier={selectedMvp.tier} />
                      {selectedMvp.totalMvp > 1 && <span className="text-[10px] font-bold text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded">{selectedMvp.totalMvp}x MVP</span>}
                    </div>
                  </div>

                  {/* Stats Panel */}
                  <div className="relative z-10 mt-4 flex items-center gap-4 pt-3 px-2 pb-1 rounded-xl" style={{ backgroundColor: hexToRgba(accent, 0.08), border: `1px solid ${hexToRgba(accent, 0.12)}` }}>
                    <div>
                      <p className="text-xl sm:text-2xl font-black" style={{ color: accentLight }}>{selectedMvp.points}</p>
                      <p className="text-[9px] uppercase font-semibold" style={{ color: hexToRgba(accentFaint, 0.50) }}>Points</p>
                    </div>
                    <div className="w-px h-8" style={{ backgroundColor: hexToRgba(accent, 0.15) }} />
                    <div>
                      <p className="text-xl sm:text-2xl font-black text-green-400">{selectedMvp.totalWins}</p>
                      <p className="text-[9px] text-green-400/50 uppercase font-semibold">Wins</p>
                    </div>
                    {selectedMvp.streak > 0 && (
                      <>
                        <div className="w-px h-8" style={{ backgroundColor: hexToRgba(accent, 0.15) }} />
                        <div>
                          <p className="text-xl sm:text-2xl font-black text-orange-400 flex items-center gap-1"><Flame className="w-4 h-4" />{selectedMvp.streak}</p>
                          <p className="text-[9px] text-orange-400/50 uppercase font-semibold">Streak</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Season Selector + Week Selector */}
      {mvps.length > 0 && (
        <div className="space-y-2 rounded-xl p-3 border" style={{ backgroundColor: 'rgba(12,10,6,0.80)', borderColor: hexToRgba(accent, 0.12) }}>
          {/* Season Selector */}
          <MvpSeasonSelector
            seasons={allSeasons}
            selectedSeasonId={selectedSeasonId}
            onSelect={handleSeasonChange}
            accent={accent}
            accentLight={accentLight}
            seasonPage={seasonPage}
            onSeasonPageChange={setSeasonPage}
          />

          {/* Week pills */}
          <div className="flex items-center gap-1.5">
            {totalPages > 1 && (
              <button
                onClick={() => {
                  const newPage = Math.max(0, weekPage - 1);
                  setWeekPage(newPage);
                  const newIdx = Math.min(selectedWeekIdx, (newPage + 1) * WEEKS_PER_PAGE - 1);
                  setSelectedWeekIdx(newIdx);
                }}
                disabled={weekPage === 0}
                className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all disabled:opacity-25 disabled:cursor-not-allowed hover:scale-110 cursor-pointer"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.70)', border: '1px solid rgba(255,255,255,0.10)' }}
                aria-label="Previous weeks"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
            )}

            <div className="flex-1 flex items-center gap-1.5 overflow-x-auto custom-scrollbar px-0.5">
              {visibleWeeks.map((mvp, i) => {
                const globalIdx = pageStart + i;
                const isActive = globalIdx === selectedWeekIdx;
                return (
                  <button
                    key={`${selectedSeasonId}-W${mvp.weekNumber}`}
                    onClick={() => handleWeekSelect(globalIdx)}
                    className={`shrink-0 h-7 px-2.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                      isActive ? 'scale-110' : 'hover:scale-105'
                    }`}
                    style={isActive ? {
                      backgroundColor: hexToRgba(accent, 0.35),
                      color: accentLight,
                      border: `1px solid ${hexToRgba(accent, 0.60)}`,
                      boxShadow: `0 0 14px ${hexToRgba(accent, 0.30)}, inset 0 1px 0 ${hexToRgba(accent, 0.20)}`,
                    } : {
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.70)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                    aria-label={`Week ${mvp.weekNumber}`}
                    aria-pressed={isActive}
                  >
                    W{mvp.weekNumber}
                  </button>
                );
              })}
            </div>

            {totalPages > 1 && (
              <button
                onClick={() => {
                  const newPage = Math.min(totalPages - 1, weekPage + 1);
                  setWeekPage(newPage);
                  const newIdx = Math.max(selectedWeekIdx, newPage * WEEKS_PER_PAGE);
                  setSelectedWeekIdx(newIdx);
                }}
                disabled={weekPage === totalPages - 1}
                className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all disabled:opacity-25 disabled:cursor-not-allowed hover:scale-110 cursor-pointer"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.70)', border: '1px solid rgba(255,255,255,0.10)' }}
                aria-label="Next weeks"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Selected week info */}
          {selectedMvp && (
            <div className="flex items-center justify-between gap-2 px-0.5">
              <span className="text-[9px] text-muted-foreground">
                W{selectedMvp?.weekNumber || selectedWeekIdx + 1} / {selectedSeasonInfo?.tournamentCount || mvps.length} weeks
              </span>
              {selectedMvp.tournamentName && (
                <span className="text-[9px] text-muted-foreground/60 truncate max-w-[120px]">
                  {selectedMvp.tournamentName}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MvpSection({
  maleData,
  femaleData,
  isDataLoading,
  cmsSections,
  setSelectedPlayer,
}: MvpSectionProps) {
  return (
    <>
      {/* ========== MVP ARENA — Dramatic Split Hero Cards ========== */}
      <section id="mvp" role="region" aria-label="MVP Arena" className="py-16 sm:py-24 px-4 relative overflow-hidden">
        {/* Background — Dark theater with spotlight cone */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[#0a0806]/50 to-background" />
        {/* Spotlight cone from top center */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px]" style={{ background: 'conic-gradient(from 170deg at 50% 0%, transparent 10%, rgba(212,168,83,0.04) 30%, rgba(212,168,83,0.06) 40%, rgba(212,168,83,0.04) 50%, transparent 70%)' }} />
        </div>
        <div className="ambient-light" style={{ top: '30%', left: '15%', animationDuration: '22s' }} />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="stagger-item">
            <SectionHeader icon={Crown} label={cmsSections.mvp?.subtitle || "Hall of Fame"} title={cmsSections.mvp?.title || "MVP Arena"} subtitle={cmsSections.mvp?.description || "Pemain terbaik dari setiap divisi — Dipilih admin berdasarkan skor tertinggi"} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative max-w-5xl mx-auto">
              {/* Vertical Gold Divider */}
              <div className="hidden md:block absolute top-12 bottom-12 left-1/2 w-px bg-gradient-to-b from-transparent via-idm-gold-warm/30 to-transparent z-10" />

              {isDataLoading ? (
                <>
                  <MVPCardSkeleton accent="#06b6d4" />
                  <MVPCardSkeleton accent="#a855f7" />
                </>
              ) : (
              <>
                {/* Male MVP */}
                <div className="stagger-item-fast perspective-container" style={{ animationDelay: '0ms' }}>
                  <DivisionMVPCard
                    division="male"
                    data={maleData || { hasData: false, division: 'male', season: { id: '', name: '', number: 1, status: 'active' }, allSeasons: [], activeTournament: null, totalPlayers: 0, totalPrizePool: 0, seasonDonationTotal: 0, topPlayers: [], skinMap: {}, recentMatches: [], upcomingMatches: [], seasonProgress: { totalWeeks: 0, completedWeeks: 0, percentage: 0 }, topDonors: [], clubs: [], weeklyChampions: [], mvpHallOfFame: [] }}
                    setSelectedPlayer={setSelectedPlayer}
                  />
                </div>

                {/* Female MVP */}
                <div className="stagger-item-fast perspective-container" style={{ animationDelay: '60ms' }}>
                  <DivisionMVPCard
                    division="female"
                    data={femaleData || { hasData: false, division: 'female', season: { id: '', name: '', number: 1, status: 'active' }, allSeasons: [], activeTournament: null, totalPlayers: 0, totalPrizePool: 0, seasonDonationTotal: 0, topPlayers: [], skinMap: {}, recentMatches: [], upcomingMatches: [], seasonProgress: { totalWeeks: 0, completedWeeks: 0, percentage: 0 }, topDonors: [], clubs: [], weeklyChampions: [], mvpHallOfFame: [] }}
                    setSelectedPlayer={setSelectedPlayer}
                  />
                </div>
              </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
