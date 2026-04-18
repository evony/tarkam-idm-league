'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Users, Trophy, Crown, Award, Radio, Music, Gift, TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlayerCard } from '../player-card';
import { TierBadge } from '../tier-badge';
import { WeekNavigator } from '../week-navigator';
import { DanceMatchCard } from '../match-card';
import { SectionCard, MatchRow } from './shared';
import { Card } from '@/components/ui/card';
import { useDivisionTheme } from '@/hooks/use-division-theme';
import { formatCurrency } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { staggerContainerFast, fadeUpItemSubtle, staggerContainerReduced, fadeUpItemReduced } from '@/lib/animations';
import type { StatsData } from '@/types/stats';

interface OverviewTabProps {
  data: StatsData;
  division: 'male' | 'female';
  setSelectedPlayer: (player: any) => void;
  setSelectedClub: (club: any) => void;
}

export function OverviewTab({ data, division, setSelectedPlayer, setSelectedClub }: OverviewTabProps) {
  const dt = useDivisionTheme();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const shouldReduceMotion = prefersReducedMotion || isMobile;
  const container = shouldReduceMotion ? staggerContainerReduced : staggerContainerFast;
  const item = shouldReduceMotion ? fadeUpItemReduced : fadeUpItemSubtle;
  const [topPlayerTab, setTopPlayerTab] = useState<'top3' | 'champion' | 'mvp'>('top3');
  const [selectedChampionWeek, setSelectedChampionWeek] = useState<number>(1);
  const [selectedMvpWeek, setSelectedMvpWeek] = useState<number>(1);

  const t = data.activeTournament;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-3 sm:space-y-4 lg:space-y-6">

      {/* ★ Top Players — HERO MOMENT */}
      <motion.div variants={item}>
        <Card className={`${dt.casinoCard} ${!isMobile ? 'casino-shimmer' : ''} overflow-hidden relative`}>
          <div className={dt.casinoBar} />
          {/* Desktop: decorative blur orb for premium feel */}
          <div className={`hidden lg:block absolute top-8 right-8 w-32 h-32 rounded-full blur-3xl ${dt.bg} opacity-20 pointer-events-none`} />
          <div className={`flex items-center gap-2.5 px-3 lg:px-6 py-3 border-b ${dt.borderSubtle}`}>
            <div className={`w-5 h-5 lg:w-6 lg:h-6 rounded ${dt.iconBg} flex items-center justify-center shrink-0`}>
              <Crown className={`w-3 h-3 lg:w-3.5 lg:h-3.5 ${dt.neonText}`} />
            </div>
            <h3 className="text-xs lg:text-sm font-semibold uppercase tracking-wider">Top Players</h3>
            <Badge className={`hidden sm:inline-flex ${dt.casinoBadge} ml-auto text-[9px]`}>SEASON BEST</Badge>
          </div>
          {/* Sub-tabs — scrollable on mobile */}
          <div className={`flex items-center gap-1 px-3 lg:px-6 py-2 border-b ${dt.borderSubtle} overflow-x-auto`} role="tablist" aria-label="Top players views">
          <button
            role="tab"
            aria-selected={topPlayerTab === 'top3'}
            onClick={() => setTopPlayerTab('top3')}
            className={`relative px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              topPlayerTab === 'top3'
                ? `border-current ${dt.text}`
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Trophy className="w-3 h-3 mr-1 inline" />
            Top 3
          </button>
          <button
            role="tab"
            aria-selected={topPlayerTab === 'champion'}
            onClick={() => setTopPlayerTab('champion')}
            className={`relative px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              topPlayerTab === 'champion'
                ? `border-current ${dt.text}`
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Crown className="w-3 h-3 mr-1 inline" />
            Juara Pekan Ini
          </button>
          <button
            role="tab"
            aria-selected={topPlayerTab === 'mvp'}
            onClick={() => setTopPlayerTab('mvp')}
            className={`relative px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              topPlayerTab === 'mvp'
                ? `border-current ${dt.text}`
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Award className="w-3 h-3 mr-1 inline" />
            MVP
          </button>
        </div>
        <div className="p-3 lg:p-6">
        {/* Tab Content */}
        {topPlayerTab === 'top3' && (
          <>
            {data.topPlayers?.length > 0 ? (
              /* Mobile: horizontal scroll for 3 cards; Desktop: grid */
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 lg:overflow-visible lg:mx-0 lg:px-0 lg:pb-0 lg:grid lg:grid-cols-3">
                {data.topPlayers.slice(0, 3).map((p, idx) => (
                  <div key={p.id} className="shrink-0 w-[140px] sm:w-auto lg:shrink lg:w-auto">
                    <PlayerCard
                      gamertag={p.gamertag}
                      avatar={p.avatar}
                      tier={p.tier}
                      points={p.points}
                      totalWins={p.totalWins}
                      totalMvp={p.totalMvp}
                      streak={p.streak}
                      rank={idx + 1}
                      isMvp={p.totalMvp > 0 && idx === 0}
                      club={p.club}
                      onClick={() => setSelectedPlayer(p)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-6 rounded-xl ${dt.bgSubtle} ${dt.border} text-center`}>
                <Users className={`w-8 h-8 mx-auto mb-2 opacity-30 ${dt.text}`} />
                <p className="text-sm text-muted-foreground">Belum ada peserta terdaftar</p>
                <p className="text-[10px] text-muted-foreground/80 mt-1">Peserta akan muncul setelah pendaftaran</p>
              </div>
            )}
          </>
        )}

        {topPlayerTab === 'champion' && (
          <>
            {data.weeklyChampions?.length > 0 ? (
              (() => {
                const completedWeeks = data.weeklyChampions.map(c => c.weekNumber);
                const totalWeeks = data.seasonProgress?.totalWeeks || 10;
                const selected = data.weeklyChampions.find(c => c.weekNumber === selectedChampionWeek) || data.weeklyChampions[data.weeklyChampions.length - 1];
                const winnerTeam = selected.winnerTeam;
                const championPlayers = winnerTeam?.players || [];
                return (
                  <div className="space-y-3">
                    {/* Team banner */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl ${dt.bgSubtle} ${dt.border}`}>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shrink-0`}>
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-yellow-400 truncate">{winnerTeam?.name || 'TBD'}</p>
                        <p className="text-[10px] text-muted-foreground">Week {selected.weekNumber} Champion • {selected.tournamentName}</p>
                      </div>
                      <Badge className="bg-yellow-500/15 text-yellow-500 border-0 text-[9px]">🏆 JUARA</Badge>
                    </div>
                    {/* 3 Players in the winning team — horizontal scroll on mobile */}
                    {championPlayers.length > 0 ? (
                      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 lg:overflow-visible lg:mx-0 lg:px-0 lg:pb-0 lg:grid lg:grid-cols-3">
                        {championPlayers.map((p, idx) => (
                          <div key={p.id} className="shrink-0 w-[140px] sm:w-auto lg:shrink lg:w-auto">
                            <PlayerCard
                              gamertag={p.gamertag}
                              avatar={p.avatar}
                              tier={p.tier}
                              points={p.points}
                              totalWins={p.totalWins}
                              totalMvp={p.totalMvp}
                              streak={p.streak}
                              rank={idx + 1}
                              isMvp={selected.mvp?.id === p.id}
                              onClick={() => setSelectedPlayer({
                                ...p,
                                name: p.gamertag,
                                maxStreak: 0,
                                club: undefined,
                                division: undefined,
                              })}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`p-6 rounded-xl ${dt.bgSubtle} ${dt.border} text-center`}>
                        <p className="text-sm text-muted-foreground">Belum ada data week ini</p>
                      </div>
                    )}
                    {/* Week Navigator */}
                    <WeekNavigator
                      totalWeeks={totalWeeks}
                      completedWeeks={completedWeeks}
                      selectedWeek={selectedChampionWeek}
                      onWeekChange={setSelectedChampionWeek}
                      accent={division === 'male' ? '#06b6d4' : '#a855f7'}
                      accentLight={division === 'male' ? '#22d3ee' : '#c084fc'}
                      size="sm"
                    />
                  </div>
                );
              })()
            ) : (
              <div className={`p-6 rounded-xl ${dt.bgSubtle} ${dt.border} text-center`}>
                <Crown className={`w-8 h-8 mx-auto mb-2 opacity-30 text-yellow-500`} />
                <p className="text-sm text-muted-foreground">Belum ada juara pekan ini</p>
                <p className="text-[10px] text-muted-foreground/80 mt-1">Juara akan muncul setelah turnamen selesai</p>
              </div>
            )}
          </>
        )}

        {topPlayerTab === 'mvp' && (
          <>
            {data.mvpHallOfFame?.length > 0 ? (
              (() => {
                const mvpWeeks = data.mvpHallOfFame.map(m => m.weekNumber);
                const totalWeeks = data.seasonProgress?.totalWeeks || 10;
                const selectedMvp = data.mvpHallOfFame.find(m => m.weekNumber === selectedMvpWeek) || data.mvpHallOfFame[data.mvpHallOfFame.length - 1];
                return (
                  <div className="space-y-3">
                    {/* Week label */}
                    <div className={`flex items-center gap-2 px-1`}>
                      <div className={`w-5 h-5 rounded bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shrink-0`}>
                        <Award className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Week {selectedMvp.weekNumber}</span>
                      <span className="text-[9px] text-muted-foreground/80 truncate">{selectedMvp.tournamentName}</span>
                    </div>
                    {/* MVP Player Card + Stats — stack on mobile, side-by-side on desktop */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-1 flex justify-center">
                        <div className="w-[140px] sm:w-auto">
                          <PlayerCard
                            gamertag={selectedMvp.gamertag}
                            avatar={selectedMvp.avatar}
                            tier={selectedMvp.tier}
                            points={selectedMvp.points}
                            totalWins={selectedMvp.totalWins}
                            totalMvp={selectedMvp.totalMvp}
                            streak={selectedMvp.streak}
                            rank={1}
                            isMvp={true}
                            onClick={() => setSelectedPlayer({
                              ...selectedMvp,
                              name: selectedMvp.gamertag,
                              maxStreak: 0,
                              club: undefined,
                              division: undefined,
                              matches: 0,
                            })}
                          />
                        </div>
                      </div>
                      {/* MVP stats highlight */}
                      <div className={`sm:col-span-2 flex flex-col justify-center gap-2 p-3 rounded-xl ${dt.bgSubtle} ${dt.border}`}>
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-bold text-yellow-400">{selectedMvp.gamertag}</span>
                          <TierBadge tier={selectedMvp.tier} />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className={`p-2 rounded-lg ${dt.bgSubtle} ${dt.borderSubtle} text-center`}>
                            <p className={`text-sm font-bold ${dt.neonText}`}>{selectedMvp.totalMvp}x</p>
                            <p className="text-[9px] text-muted-foreground">MVP</p>
                          </div>
                          <div className={`p-2 rounded-lg ${dt.bgSubtle} ${dt.borderSubtle} text-center`}>
                            <p className={`text-sm font-bold ${dt.neonText}`}>{selectedMvp.points}</p>
                            <p className="text-[9px] text-muted-foreground">Points</p>
                          </div>
                          <div className={`p-2 rounded-lg ${dt.bgSubtle} ${dt.borderSubtle} text-center`}>
                            <p className={`text-sm font-bold ${dt.neonText}`}>{selectedMvp.totalWins}</p>
                            <p className="text-[9px] text-muted-foreground">Wins</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Week Navigator */}
                    <WeekNavigator
                      totalWeeks={totalWeeks}
                      completedWeeks={mvpWeeks}
                      selectedWeek={selectedMvpWeek}
                      onWeekChange={setSelectedMvpWeek}
                      accent={division === 'male' ? '#06b6d4' : '#a855f7'}
                      accentLight={division === 'male' ? '#22d3ee' : '#c084fc'}
                      size="sm"
                    />
                  </div>
                );
              })()
            ) : (
              <div className={`p-6 rounded-xl ${dt.bgSubtle} ${dt.border} text-center`}>
                <Award className={`w-8 h-8 mx-auto mb-2 opacity-30 text-yellow-500`} />
                <p className="text-sm text-muted-foreground">Belum ada MVP</p>
                <p className="text-[10px] text-muted-foreground/80 mt-1">MVP akan ditampilkan setelah turnamen selesai dan ditentukan oleh admin</p>
              </div>
            )}
          </>
        )}
        </div>
        </Card>
      </motion.div>

      {/* Recent Results — after hero */}
      {data.recentMatches?.length > 0 ? (
        <motion.div variants={item}>
          <SectionCard title="Hasil Terbaru" icon={Radio} badge="LIVE">
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {data.recentMatches.slice(0, 6).map(m => (
                <MatchRow
                  key={m.id}
                  club1={m.club1.name}
                  club2={m.club2.name}
                  score1={m.score1}
                  score2={m.score2}
                  week={m.week}
                  status="completed"
                />
              ))}
            </div>
          </SectionCard>
        </motion.div>
      ) : (
        <motion.div variants={item}>
          <SectionCard title="Hasil Terbaru" icon={Radio} badge="LIVE">
            <div className={`p-6 rounded-xl ${dt.bgSubtle} ${dt.border} text-center`}>
              <Music className={`w-8 h-8 mx-auto mb-2 opacity-30 ${dt.text}`} />
              <p className="text-sm text-muted-foreground">Belum ada hasil match</p>
              <p className="text-[10px] text-muted-foreground/80 mt-1">Match yang sudah selesai akan muncul di sini</p>
            </div>
          </SectionCard>
        </motion.div>
      )}

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <SectionCard title="Donasi & Sawer" icon={Gift} badge="LIVE">
          <div className={`p-3 rounded-xl ${dt.bgSubtle} ${dt.border} mb-3`}>
            <p className="text-xs text-muted-foreground mb-1">Total Prize Pool</p>
            <p className={`text-xl font-bold ${dt.neonGradient}`}>{formatCurrency(data.totalPrizePool)}</p>
            <Progress value={data.totalPrizePool > 0 ? Math.min((data.totalPrizePool / 500000) * 100, 100) : 0} className="mt-2 h-1.5" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Donatur Teratas</p>
            {data.topDonors?.length > 0 ? (
              data.topDonors.slice(0, 3).map((d, i) => (
                <div key={i} className={`flex items-center justify-between text-xs p-2 rounded-lg ${dt.bgSubtle} ${dt.borderSubtle}`}>
                  <span className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      i === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                      i === 1 ? 'bg-gray-400/20 text-gray-400' :
                      `${dt.iconBg} ${dt.text}`
                    }`}>{i + 1}</span>
                    {d.donorName}
                  </span>
                  <span className={`font-semibold ${dt.neonText}`}>{formatCurrency(d.totalAmount)}</span>
                </div>
              ))
            ) : (
              <div className={`p-6 rounded-xl ${dt.bgSubtle} ${dt.border} text-center`}>
                <Gift className={`w-8 h-8 mx-auto mb-2 opacity-30 ${dt.text}`} />
                <p className="text-sm text-muted-foreground">Belum ada donasi</p>
                <p className="text-[10px] text-muted-foreground/80 mt-1">Donasi akan muncul di sini</p>
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Season Progress" icon={TrendingUp} badge={`${data.seasonProgress?.percentage}%`}>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">{data.season?.name}</span>
                <span className={`font-semibold ${dt.neonText}`}>{data.seasonProgress?.completedWeeks}/{data.seasonProgress?.totalWeeks} Weeks</span>
              </div>
              <Progress value={data.seasonProgress?.percentage || 0} className="h-2.5" />
              <p className={`text-[10px] ${dt.neonText} font-semibold mt-1`}>{data.seasonProgress?.percentage}% Selesai</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className={`p-2.5 rounded-xl ${dt.bgSubtle} ${dt.border} text-center`}>
                <p className={`text-lg font-bold ${dt.neonText}`}>{data.totalPlayers}</p>
                <p className="text-[10px] text-muted-foreground">Players</p>
              </div>
              <div className={`p-2.5 rounded-xl ${dt.bgSubtle} ${dt.border} text-center cursor-pointer`} onClick={() => setSelectedClub(data.clubs?.[0])}>
                <p className={`text-lg font-bold ${dt.neonText}`}>{data.clubs?.length || 0}</p>
                <p className="text-[10px] text-muted-foreground">Clubs</p>
              </div>
              <div className={`p-2.5 rounded-xl ${dt.bgSubtle} ${dt.border} text-center`}>
                <p className={`text-sm font-bold ${dt.neonText}`}>{formatCurrency(data.seasonDonationTotal || 0)}</p>
                <p className="text-[10px] text-muted-foreground">Terdanai</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* Featured Match — DanceMatchCard style */}
      {t?.matches?.filter(m => m.status === 'completed').length ? (
        <motion.div variants={item}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-7 h-7 rounded-lg ${dt.iconBg} flex items-center justify-center shrink-0`}>
              <Music className={`w-3.5 h-3.5 ${dt.neonText}`} />
            </div>
            <h3 className="text-sm font-semibold">Match Unggulan</h3>
            <Badge className={`${dt.casinoBadge} ml-auto`}>HASIL</Badge>
          </div>
          {t!.matches.filter(m => m.status === 'completed').slice(-1).map(m => (
            <DanceMatchCard
              key={m.id}
              team1={m.team1}
              team2={m.team2}
              score1={m.score1}
              score2={m.score2}
              status={m.status}
              week={t!.weekNumber}
              mvpPlayer={m.mvpPlayer}
            />
          ))}
        </motion.div>
      ) : null}
    </motion.div>
  );
}
