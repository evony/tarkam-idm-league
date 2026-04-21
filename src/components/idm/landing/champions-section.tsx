'use client';

import Image from 'next/image';
import {
  Trophy, Music, Users, Shield, Crown, Wallet, Flame, Play,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChampionCardSkeleton } from '../ui/skeleton';
import { TierBadge } from '../tier-badge';
import { SectionHeader } from './shared';
import { getAvatarUrl, hexToRgba } from '@/lib/utils';
import { ClubLogoImage } from '@/components/idm/club-logo-image';
import type { StatsData } from '@/types/stats';

interface ChampionsSectionProps {
  maleData: StatsData | undefined;
  femaleData: StatsData | undefined;
  leagueData: any;
  isDataLoading: boolean;
  cmsSections: Record<string, any>;
  championVideoUrl?: string;
  onVideoPlay?: (url: string, title: string) => void;
  setSelectedPlayer: (player: StatsData['topPlayers'][0] & { division?: string } | null) => void;
}

export function ChampionsSection({
  maleData,
  femaleData,
  leagueData,
  isDataLoading,
  cmsSections,
  championVideoUrl,
  onVideoPlay,
  setSelectedPlayer,
}: ChampionsSectionProps) {
  return (
    <>
      {/* ========== SEASON CHAMPION — Smooth Reveal ========== */}
      <section id="champions" role="region" aria-label="Season Champions" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background — Celebratory bilateral glow with subtle gold shimmer */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/98 to-background" />
        {/* Subtle cross-line pattern — hall of fame wallpaper */}
        <div className="absolute inset-0 opacity-[0.01]" style={{ backgroundImage: 'linear-gradient(rgba(212,168,83,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,83,0.2) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Bilateral ambient glows — cyan left, purple right */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 60%)' }} />
          <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 60%)' }} />
          {/* Central gold spotlight for Liga IDM champion card */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(212,168,83,0.06) 0%, transparent 60%)' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section Header — Fade in from below */}
          <div className="stagger-item">
            <SectionHeader icon={Crown} label={cmsSections.champions?.subtitle || "Aula Champion"} title={cmsSections.champions?.title || "Season Champion"} subtitle={cmsSections.champions?.description || "Juara terbaru dari setiap divisi — 1 tim, 3 pemain, 1 gelar"} />
          </div>

          {/* Liga IDM Champion — Premium Showcase */}
          {leagueData?.ligaChampion && (
            <div
              className="animate-fade-enter mb-8 perspective-container"
              style={{ animationDelay: '100ms' }}
            >
              <div className="perspective-card relative rounded-2xl overflow-hidden border border-idm-gold-warm/30" style={{ background: 'linear-gradient(135deg, #0c0a06 0%, #1a1208 25%, #0d0a06 50%, #1a0f05 75%, #0c0a06 100%)' }}>
                {/* Gold shimmer overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(var(--idm-gold-warm) 1px, transparent 1px), linear-gradient(90deg, var(--idm-gold-warm) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                {/* Radial gold glow */}
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(212,168,83,0.12) 0%, transparent 50%)' }} />
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 60%, rgba(212,168,83,0.05) 0%, transparent 40%), radial-gradient(ellipse at 80% 60%, rgba(212,168,83,0.05) 0%, transparent 40%)' }} />

                {/* Top gold accent line */}
                <div className="h-1 bg-gradient-to-r from-transparent via-idm-gold-warm to-transparent" />

                <div className="relative z-10 p-6 sm:p-8">
                  {/* Video Play Button — more visible */}
                  {championVideoUrl && onVideoPlay && (
                    <button
                      onClick={() => onVideoPlay(championVideoUrl, 'Champion Showcase')}
                      className="absolute top-4 right-4 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-idm-gold-warm/30 border border-idm-gold-warm/40 hover:bg-idm-gold-warm/30 hover:border-idm-gold-warm/60 transition-all cursor-pointer"
                      aria-label="Play champion video"
                    >
                      <Play className="w-4 h-4 text-idm-gold-warm fill-idm-gold-warm" />
                      <span className="text-xs font-bold text-idm-gold-warm">Champion Video</span>
                    </button>
                  )}
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-idm-gold-warm/15 border border-idm-gold-warm/25 flex items-center justify-center" style={{ boxShadow: '0 0 40px rgba(212,168,83,0.15)' }}>
                        <Trophy className="w-6 h-6 text-idm-gold-warm" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-idm-gold-warm/15 text-idm-gold-warm text-[10px] border border-idm-gold-warm/25 font-bold uppercase tracking-wider">Liga IDM</Badge>
                          <Badge className="bg-yellow-500/15 text-yellow-400 text-[10px] border border-yellow-500/25 font-bold">SEASON {leagueData.ligaChampion.seasonNumber} CHAMPION</Badge>
                        </div>
                        <h3 className="text-lg sm:text-xl font-black mt-1" style={{ background: 'linear-gradient(135deg, var(--idm-gold-warm), #f5d78e, var(--idm-gold-warm))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          Liga IDM Season {leagueData.ligaChampion.seasonNumber}
                        </h3>
                      </div>
                    </div>
                    {/* Trophy animation */}
                    <div
                      className="animate-float-medium hidden sm:block"
                    >
                      <Crown className="w-10 h-10 text-idm-gold-warm/40" style={{ filter: 'drop-shadow(0 0 20px rgba(212,168,83,0.3))' }} />
                    </div>
                  </div>

                  {/* Champion Club Display */}
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Club Logo + Name */}
                    <div className="flex flex-col items-center text-center sm:text-left sm:flex-row gap-4 flex-1">
                      <div className="relative">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-idm-gold-warm/30 bg-idm-gold-warm/5" style={{ boxShadow: '0 0 50px rgba(212,168,83,0.2)' }}>
                          <ClubLogoImage clubName={leagueData.ligaChampion.name} dbLogo={leagueData.ligaChampion.logo} alt={leagueData.ligaChampion.name} width={112} height={112} className="w-full h-full object-cover" />
                        </div>
                        {/* Champion badge overlay */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-idm-gold-warm flex items-center justify-center shadow-lg" style={{ boxShadow: '0 0 20px rgba(212,168,83,0.5)' }}>
                          <Crown className="w-4 h-4 text-[#0c0a06]" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-2xl sm:text-3xl font-black text-white tracking-wide">{leagueData.ligaChampion.name}</h4>
                        <p className="text-sm text-idm-gold-warm/80 font-semibold mt-1">Liga IDM Season {leagueData.ligaChampion.seasonNumber} Champion</p>
                        <p className="text-xs text-muted-foreground mt-1">Club terbaik di Liga IDM Season {leagueData.ligaChampion.seasonNumber}</p>
                        {/* Member count by division */}
                        <div className="flex items-center gap-3 mt-3">
                          <Badge className="bg-cyan-500/10 text-cyan-400 text-[10px] border-cyan-500/20 px-2.5 py-1">
                            <Users className="w-3 h-3 mr-1" />
                            {leagueData.ligaChampion.members.filter((m: { division: string }) => m.division === 'male').length} Male
                          </Badge>
                          <Badge className="bg-purple-500/10 text-purple-400 text-[10px] border-purple-500/20 px-2.5 py-1">
                            <Users className="w-3 h-3 mr-1" />
                            {leagueData.ligaChampion.members.filter((m: { division: string }) => m.division === 'female').length} Female
                          </Badge>
                          <Badge className="bg-idm-gold-warm/10 text-idm-gold-warm text-[10px] border-idm-gold-warm/20 px-2.5 py-1">
                            <Users className="w-3 h-3 mr-1" />
                            {leagueData.ligaChampion.members.length} Total
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Members Preview — 5 representatives with bigger avatars */}
                    <div className="flex-1 w-full sm:w-auto">
                      <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-semibold mb-3 text-center sm:text-left">Skuad Champion</p>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                        {leagueData.ligaChampion.members.slice(0, 5).map((member: { id: string; gamertag: string; division: string; role: string; avatar?: string | null }, i: number) => (
                          <div
                            key={member.id}
                            className="group/member relative flex flex-col items-center"
                          >
                            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-110 cursor-default ${
                              member.division === 'male'
                                ? 'border-cyan-500/20 hover:border-cyan-500/40'
                                : 'border-purple-500/20 hover:border-purple-500/40'
                            } ${member.role === 'captain' ? 'ring-2 ring-idm-gold-warm/50 border-idm-gold-warm/30' : ''}`}>
                              <Image
                                src={getAvatarUrl(member.gamertag, member.division as 'male' | 'female', member.avatar)}
                                alt={member.gamertag}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                              {/* Captain badge */}
                              {member.role === 'captain' && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-idm-gold-warm flex items-center justify-center z-10">
                                  <Crown className="w-2.5 h-2.5 text-[#0c0a06]" />
                                </div>
                              )}
                            </div>
                            {/* Gamertag label below avatar */}
                            <p className="text-[10px] font-bold mt-1 truncate max-w-[64px] text-center text-white/80">{member.gamertag}</p>
                            <p className="text-[10px] font-medium capitalize" style={{ color: member.division === 'male' ? '#22d3ee' : '#c084fc' }}>{member.division}</p>
                          </div>
                        ))}
                        {leagueData.ligaChampion.members.length > 5 && (
                          <div className="flex flex-col items-center">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-sm font-bold border-2 border-dashed border-white/10 bg-white/5 text-muted-foreground">
                              +{leagueData.ligaChampion.members.length - 5}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">lainnya</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom decorative line */}
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-idm-gold-warm/20 to-transparent" />
                    <div className="flex items-center gap-1.5 text-idm-gold-warm/40">
                      <Trophy className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Liga IDM Champion</span>
                      <Trophy className="w-3 h-3" />
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-idm-gold-warm/20 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Both Divisions Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
            {/* Vertical Gold Divider */}
            <div className="hidden lg:block absolute top-12 bottom-12 left-1/2 w-px bg-gradient-to-b from-transparent via-idm-gold-warm/30 to-transparent z-10" />

            {isDataLoading ? (
              <>
                <ChampionCardSkeleton accent="#06b6d4" division="male" />
                <ChampionCardSkeleton accent="#a855f7" division="female" />
              </>
            ) : ([['male', maleData, Music], ['female', femaleData, Shield]] as const).map(([division, data, DivisionIcon], divIdx) => {
              const isMale = division === 'male';
              const accent = isMale ? '#06b6d4' : '#a855f7';
              const accentLight = isMale ? '#22d3ee' : '#c084fc';
              const accentFaint = isMale ? '#67e8f9' : '#e9d5ff';

              return (
                <div
                  key={division}
                  className="stagger-item-fast perspective-container"
                  style={{ animationDelay: `${divIdx * 100}ms` }}
                >
                  {(!data || !data.weeklyChampions?.length) ? (
                    <Card className="overflow-hidden border card-shine champion-gold-frame" style={{ borderColor: hexToRgba(accent, 0x20) }}>
                      <div className="h-1 bg-gradient-to-r from-transparent via-current to-transparent" style={{ color: accent }} />
                      <CardContent className="p-0">
                        <div className="relative h-16 sm:h-20 overflow-hidden">
                          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${hexToRgba(accent, 0x08)} 0%, ${hexToRgba(accent, 0x04)} 50%, transparent 100%)` }} />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a06] via-[#0c0a06]/40 to-transparent" />
                          {/* Decorative gold corner lines */}
                          <div className="absolute top-3 left-3 w-8 h-8 border-t border-l" style={{ borderColor: hexToRgba(accent, 0x20) }} aria-hidden="true" />
                          <div className="absolute top-3 right-3 w-8 h-8 border-t border-r" style={{ borderColor: hexToRgba(accent, 0x20) }} aria-hidden="true" />
                          {/* Elegant trophy float animation */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div
                              className="empty-state-icon animate-float-medium"
                            >
                              <Crown className="w-14 h-14" style={{ color: hexToRgba(accent, 0x25), filter: `drop-shadow(0 0 24px ${hexToRgba(accent, 0x20)})` }} />
                            </div>
                          </div>
                          <div className="absolute bottom-4 inset-x-0 px-5 flex items-end justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: hexToRgba(accent, 0x15) }}>
                                <DivisionIcon className="w-4 h-4" style={{ color: accentLight }} />
                              </div>
                              <div>
                                <h3 className="text-base font-black uppercase tracking-wider" style={{ color: accentLight }}>{division} Division</h3>
                                <p className="text-[10px] font-semibold text-white/80">SEASON CHAMPION</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Gold divider line */}
                        <div className="h-px bg-gradient-to-r from-transparent via-idm-gold-warm/25 to-transparent" />
                        <div className="p-6 text-center space-y-4">
                          <div>
                            <p className="text-sm font-bold text-white/80">Musim Baru Dimulai</p>
                            <p className="text-xs text-muted-foreground/80 mt-1">Season baru segera dimulai — jadilah champion pertama!</p>
                          </div>
                          <div className="flex justify-center gap-2">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="w-24 h-16 rounded-xl border border-dashed flex items-center justify-center card-shine" style={{ borderColor: hexToRgba(accent, 0x20), background: `linear-gradient(135deg, ${hexToRgba(accent, 0x06)} 0%, transparent 50%, ${hexToRgba(accent, 0x04)} 100%)` }}>
                                <span className="text-[10px] font-bold" style={{ color: hexToRgba(accent, 0x35) }}>#{i}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (() => {
                    const champions = data.weeklyChampions;
                    const selected = champions[champions.length - 1];
                    return (
                      <Card className="perspective-card overflow-hidden border card-shine champion-gold-frame card-border-glow group transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,168,83,0.2)]" style={{ borderColor: hexToRgba(accent, 0x20) }}>
                        {/* Gold accent line — thicker, more premium */}
                        <div className="h-1 bg-gradient-to-r from-transparent via-current to-transparent" style={{ color: accent }} />
                        <CardContent className="p-0">
                          {/* Banner Header — compact gradient to give more space to avatars */}
                          <div className="relative h-16 sm:h-20 overflow-hidden">
                            <img
                              src="/bg-section.jpg"
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover opacity-15 transition-transform duration-500 group-hover:scale-110"
                              aria-hidden="true"
                            />
                            {/* Division color tint */}
                            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${hexToRgba(accent, 0x30)} 0%, ${hexToRgba(accent, 0x15)} 50%, transparent 100%)` }} />
                            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 70% 40%, ${hexToRgba(accent, 0x35)}, transparent 60%)` }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a06] via-[#0c0a06]/40 to-transparent" />
                            {/* Crown Glow — gentle float */}
                            <div className="absolute top-4 right-6">
                              <div className="animate-float-subtle">
                                <Crown className="w-8 h-8 trophy-float" style={{ color: accentLight, filter: `drop-shadow(0 0 16px ${hexToRgba(accent, 0x80)})` }} />
                              </div>
                            </div>
                            {/* Division + Week Badges */}
                            <div className="absolute bottom-4 inset-x-0 px-5 flex items-end justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: hexToRgba(accent, 0x25) }}>
                                  <DivisionIcon className="w-4 h-4" style={{ color: accentLight }} />
                                </div>
                                <div>
                                  <h3 className="text-base font-black uppercase tracking-wider" style={{ color: accentLight }}>{division} Division</h3>
                                  <p className="text-[10px] font-semibold text-white/80">SEASON CHAMPION</p>
                                </div>
                              </div>
                              <Badge style={{ backgroundColor: hexToRgba(accent, 0x25), color: accentLight, borderColor: hexToRgba(accent, 0x40) }} className="text-[10px] border px-2.5 py-0.5">
                                <Crown className="w-3 h-3 mr-1" />Week {selected.weekNumber}
                              </Badge>
                            </div>
                          </div>

                          <div className="p-5 space-y-4">
                            {/* Team Info */}
                            <div className="relative flex items-center justify-between">
                              {/* Subtle gold radial glow behind team name */}
                              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-32 h-16 rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(212,168,83,0.08) 0%, transparent 70%)' }} aria-hidden="true" />
                              <div className="relative flex items-center gap-2.5">
                                <Trophy className="w-5 h-5" style={{ color: accentLight }} />
                                <span className="text-xl sm:text-2xl font-black text-white">{selected.winnerTeam?.name || 'TBD'}</span>
                              </div>
                              <div className="relative flex items-center gap-2">
                                {selected.prizePool > 0 && (
                                  <span className="text-[11px] font-bold text-idm-gold-warm bg-gradient-to-r from-idm-gold-warm/15 to-idm-gold-warm/5 px-3 py-1.5 rounded-lg flex items-center gap-1 border border-idm-gold-warm/20"><Wallet className="w-3.5 h-3.5" />{selected.prizePool.toLocaleString()}</span>
                                )}
                                {selected.mvp && (
                                  <span className="mvp-badge-premium glow-pulse text-xs font-bold text-idm-gold-warm bg-gradient-to-r from-idm-gold-warm/20 via-idm-gold-warm/10 to-idm-gold-warm/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-idm-gold-warm/25">
                                    <Crown className="w-5 h-5" />MVP {selected.mvp.gamertag}
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Gold divider line between team info and avatars */}
                            <div className="h-px bg-gradient-to-r from-transparent via-idm-gold-warm/30 to-transparent" />

                            {/* 3 Player Avatars — taller hero layout */}
                            {selected.winnerTeam && selected.winnerTeam.players.length > 0 ? (
                              <div className="relative flex rounded-2xl overflow-hidden border" style={{ height: '260px', borderColor: hexToRgba(accent, 0x15) }}>
                                {/* CHAMPION gold watermark behind avatars */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0" aria-hidden="true">
                                  <span className="text-4xl font-black uppercase tracking-widest select-none" style={{ color: 'rgba(212,168,83,0.04)', WebkitTextStroke: '1px rgba(212,168,83,0.06)' }}>CHAMPION</span>
                                </div>
                                {selected.winnerTeam.players.slice(0, 3).map((player: { id: string; gamertag: string; avatar: string | null; tier: string; points: number; totalWins: number; streak: number }, pIdx: number) => (
                                  <div
                                    key={player.id}
                                    role="button"
                                    tabIndex={0}
                                    className="relative flex-1 cursor-pointer group/avatar overflow-hidden"
                                    onClick={() => {
                                      const found = data.topPlayers?.find(tp => tp.id === player.id);
                                      if (found) setSelectedPlayer({ ...found, division });
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        const found = data.topPlayers?.find(tp => tp.id === player.id);
                                        if (found) setSelectedPlayer({ ...found, division });
                                      }
                                    }}
                                  >
                                    <Image src={getAvatarUrl(player.gamertag, division as 'male' | 'female', player.avatar)} alt={player.gamertag} fill sizes="33vw" className="object-cover object-center transition-transform duration-500 group-hover/avatar:scale-110" />
                                    {/* Bottom gradient — compact for shorter card */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a06] via-[#0c0a06]/5 to-transparent" />
                                    {/* Top gradient — minimal, just slight edge */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#0c0a06]/5 via-transparent to-transparent" />
                                    {pIdx < 2 && <div className="absolute right-0 top-4 bottom-4 w-px z-20" style={{ backgroundColor: hexToRgba(accent, 0x15) }} />}
                                    <div className="absolute top-2 left-2 z-10">
                                      <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: hexToRgba(accent, 0x30), color: accentLight }}>
                                        {pIdx + 1}
                                      </div>
                                    </div>
                                    <div className="absolute bottom-0 inset-x-0 px-2.5 pb-2.5 pt-6 z-10" style={{ background: 'linear-gradient(to top, rgba(12,10,6,0.85) 0%, transparent 100%)' }}>
                                      <p className="text-xs sm:text-sm font-black text-white truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">{player.gamertag}</p>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <TierBadge tier={player.tier} />
                                        {pIdx === 0 && <span className="text-[10px] font-bold px-1 py-0.5 rounded" style={{ color: accentLight, backgroundColor: hexToRgba(accent, 0x25) }}>CPT</span>}
                                      </div>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[10px] font-bold" style={{ color: accentFaint }}>{player.points}pts</span>
                                        <span className="text-[10px] font-bold text-green-400">{player.totalWins}W</span>
                                        <span className="text-[10px] font-bold text-orange-400 flex items-center gap-0.5"><Flame className="w-2.5 h-2.5" />{player.streak}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-6 text-center text-sm text-muted-foreground rounded-xl border border-dashed" style={{ borderColor: hexToRgba(accent, 0x15) }}>Belum ada data week ini</div>
                            )}


                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
