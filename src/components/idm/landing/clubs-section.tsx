'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Users, Shield, Music, ChevronUp, ChevronDown, Crown } from 'lucide-react';
import { SectionHeader, fadeUp, stagger } from './shared';
import { CardSkeleton } from '../ui/skeleton';
import { TierBadge } from '../tier-badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getAvatarUrl } from '@/lib/utils';
import { ClubLogoImage } from '@/components/idm/club-logo-image';
import type { StatsData } from '@/types/stats';

interface ClubsSectionProps {
  maleData: StatsData | undefined;
  femaleData: StatsData | undefined;
  isDataLoading: boolean;
  cmsSections: Record<string, any>;
  leagueData: any;
  setSelectedClub: (club: StatsData['clubs'][0] & { division?: string } | null) => void;
  selectedClub: (StatsData['clubs'][0] & { division?: string }) | null;
  setSelectedPlayer: (player: StatsData['topPlayers'][0] & { division?: string } | null) => void;
  showAllClubs: boolean;
  setShowAllClubs: (show: boolean) => void;
  showAllPlayers: boolean;
  setShowAllPlayers: (show: boolean) => void;
}

export function ClubsSection({ maleData, femaleData, isDataLoading, cmsSections, leagueData, setSelectedClub, selectedClub, setSelectedPlayer, showAllClubs, setShowAllClubs, showAllPlayers, setShowAllPlayers }: ClubsSectionProps) {
  return (<>
      {/* ========== CLUB PESERTA — Premium Parallax Showcase ========== */}
      <section id="clubs" className="relative py-24 px-4 overflow-hidden">
        {/* Background — Clean roster with subtle dot grid + central gold glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/98 to-background" />
        {/* Subtle dot grid pattern — roster/ledger feel */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, rgba(212,168,83,0.5) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        {/* Central gold glow for champion callout area */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(212,168,83,0.06) 0%, transparent 50%), radial-gradient(ellipse at 30% 70%, rgba(6,182,212,0.02) 0%, transparent 40%), radial-gradient(ellipse at 70% 70%, rgba(168,85,247,0.02) 0%, transparent 40%)' }} />

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}>
            <SectionHeader icon={Users} label={cmsSections.clubs?.subtitle || "Kompetisi"} title={cmsSections.clubs?.title || "Club & Peserta"} subtitle={cmsSections.clubs?.description || "Club-club terbaik yang bertarung di arena IDM League"} />

            {/* Liga IDM Champion callout */}
            {leagueData?.ligaChampion && (
              <motion.div variants={fadeUp} className="mb-8">
                <div className="flex items-center justify-center">
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#d4a853]/15 bg-[#d4a853]/5">
                    <Crown className="w-3.5 h-3.5 text-[#d4a853]" />
                    <span className="text-[10px] font-bold text-[#d4a853]/70 uppercase tracking-wider">Liga IDM S{leagueData.ligaChampion.seasonNumber} Champion</span>
                    {leagueData.ligaChampion.logo && (
                      <ClubLogoImage clubName={leagueData.ligaChampion.name} dbLogo={leagueData.ligaChampion.logo} alt={leagueData.ligaChampion.name} width={20} height={20} className="w-5 h-5 rounded object-cover" />
                    )}
                    <span className="text-xs font-black text-white">{leagueData.ligaChampion.name}</span>
                    <span className="text-[9px] text-muted-foreground/60">•</span>
                    <span className="text-[10px] text-muted-foreground/60">{leagueData?.stats?.totalClubs || 0} club bertanding</span>
                  </div>
                </div>
              </motion.div>
            )}

            {isDataLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} className="h-40" />
                ))}
              </div>
            ) : (() => {
              // Merge clubs from both divisions - combine same clubs into one
              const clubMap = new Map<string, StatsData['clubs'][0] & { divisions: string[] }>();

              // Process male clubs
              if (maleData?.clubs?.length) {
                maleData.clubs.forEach(c => {
                  const existing = clubMap.get(c.name);
                  if (existing) {
                    // Merge data
                    existing.points += c.points;
                    existing.wins += c.wins;
                    existing.losses += c.losses;
                    existing._count.members += c._count?.members || 0;
                    existing.divisions.push('male');
                  } else {
                    clubMap.set(c.name, {
                      ...c,
                      divisions: ['male'],
                      _count: { members: c._count?.members || 0 },
                    });
                  }
                });
              }

              // Process female clubs
              if (femaleData?.clubs?.length) {
                femaleData.clubs.forEach(c => {
                  const existing = clubMap.get(c.name);
                  if (existing) {
                    // Merge data
                    existing.points += c.points;
                    existing.wins += c.wins;
                    existing.losses += c.losses;
                    existing._count.members += c._count?.members || 0;
                    if (!existing.divisions.includes('female')) {
                      existing.divisions.push('female');
                    }
                  } else {
                    clubMap.set(c.name, {
                      ...c,
                      divisions: ['female'],
                      _count: { members: c._count?.members || 0 },
                    });
                  }
                });
              }

              const sortedClubs = Array.from(clubMap.values()).sort((a, b) => a.name.localeCompare(b.name));

              // Top players per division — sorted alphabetically (list, not leaderboard)
              const malePlayers = [...(maleData?.topPlayers || [])].sort((a, b) => a.gamertag.localeCompare(b.gamertag));
              const femalePlayers = [...(femaleData?.topPlayers || [])].sort((a, b) => a.gamertag.localeCompare(b.gamertag));

              return (
                <Tabs defaultValue="clubs" className="w-full">
                  {/* Tab Navigation — Toornament underline style */}
                  <div className="border-b border-[#d4a853]/10 mb-8">
                    <TabsList className="bg-transparent h-auto p-0 gap-0 rounded-none">
                      {[
                        { value: 'clubs', label: 'Club', icon: Users },
                        { value: 'male', label: 'Player Male', icon: Music },
                        { value: 'female', label: 'Player Female', icon: Shield },
                      ].map(tab => (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="relative px-4 sm:px-6 py-2.5 text-xs font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-[#d4a853] data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#d4a853] text-muted-foreground hover:text-[#d4a853]/70 transition-colors"
                        >
                          <tab.icon className="w-3.5 h-3.5 mr-1.5 inline" />
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  {/* ═══════════════ CLUB TAB ═══════════════ */}
                  <TabsContent value="clubs" className="mt-0">
                    {sortedClubs.length === 0 ? null : (
                      <>
                        {/* Club Grid - Limited display */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {(showAllClubs ? sortedClubs : sortedClubs.slice(0, 6)).map((club, idx) => {
                            const isChampion = leagueData?.ligaChampion && club.name === leagueData.ligaChampion.name;
                            return (
                              <motion.div
                                key={club.name}
                                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                whileHover={{ y: -4, scale: 1.03 }}
                                className="cursor-pointer group/club"
                                onClick={() => setSelectedClub(club)}
                              >
                                <div className={`relative rounded-xl bg-white/[0.03] backdrop-blur-sm border p-3 text-center transition-all duration-300 overflow-hidden hover:bg-white/[0.06] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] ${
                                  isChampion ? 'border-[#d4a853]/30 shadow-[0_0_20px_rgba(212,168,83,0.1)]' : 'border-white/[0.06]'
                                }`}>
                                  {/* Champion badge for Maximous */}
                                  {isChampion && (
                                    <div className="absolute top-1.5 right-1.5 z-10">
                                      <div className="w-5 h-5 rounded-full bg-[#d4a853] flex items-center justify-center shadow-md">
                                        <Crown className="w-3 h-3 text-[#0c0a06]" />
                                      </div>
                                    </div>
                                  )}
                                  <div className={`mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white/5 mb-2 group-hover/club:scale-105 transition-transform duration-300 ${
                                    isChampion ? 'border-2 border-[#d4a853]/30' : 'border border-[#d4a853]/20'
                                  }`}>
                                    <ClubLogoImage clubName={club.name} dbLogo={club.logo} alt={club.name} fill sizes="80px" className="object-cover" />
                                  </div>
                                  <p className={`text-xs sm:text-sm font-black truncate transition-colors duration-200 ${
                                    isChampion ? 'text-[#d4a853]' : 'text-white group-hover/club:text-[#d4a853]'
                                  }`}>{club.name}</p>
                                  {isChampion && (
                                    <p className="text-[8px] font-bold text-[#d4a853]/60 uppercase tracking-wider mt-0.5">S{leagueData.ligaChampion.seasonNumber} Champion</p>
                                  )}
                                  <div className="mt-2 flex items-center justify-center gap-2 text-[10px]">
                                    <span className="font-black text-[#e8d5a3]">{club.points} PTS</span>
                                    <span className="text-white/30">•</span>
                                    <span className="font-bold text-green-400">{club.wins}W</span>
                                    <span className="text-white/60">/</span>
                                    <span className="font-bold text-red-400">{club.losses}L</span>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>

                        {/* Show More/Less Button */}
                        {sortedClubs.length > 6 && (
                          <div className="flex justify-center mt-4">
                            <button
                              onClick={() => setShowAllClubs(!showAllClubs)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#d4a853]/10 text-[#d4a853] text-xs font-semibold border border-[#d4a853]/20 hover:bg-[#d4a853]/20 transition-all"
                            >
                              {showAllClubs ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  Tampilkan Lebih Sedikit
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  Lihat Semua ({sortedClubs.length} Club)
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>

                  {/* ═══════════════ PLAYER MALE TAB ═══════════════ */}
                  <TabsContent value="male" className="mt-0">
                    {malePlayers.length === 0 ? (
                      <div className="py-12 text-center">
                        <Music className="w-10 h-10 text-[#06b6d4]/15 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Belum ada player male</p>
                      </div>
                    ) : (
                      <>
                        {/* Player Grid - Compact */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {(showAllPlayers ? malePlayers : malePlayers.slice(0, 6)).map((player, idx) => {
                            const losses = player.matches - player.totalWins;
                            return (
                              <motion.div
                                key={player.id}
                                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                whileHover={{ y: -4, scale: 1.03 }}
                                className="cursor-pointer group/player"
                                onClick={() => setSelectedPlayer({ ...player, division: 'male' })}
                              >
                                <div className="relative rounded-xl bg-white/[0.03] backdrop-blur-sm border border-[#06b6d4]/10 text-center transition-all duration-300 overflow-hidden hover:shadow-[0_8px_24px_rgba(6,182,212,0.08)]">
                                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent z-20" />
                                  <div className="relative h-28 sm:h-32 overflow-hidden group-hover/player:scale-105 transition-transform duration-500">
                                    <Image src={getAvatarUrl(player.gamertag, 'male', player.avatar)} alt={player.gamertag} fill sizes="200px" className="object-cover object-top" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a06] via-[#0c0a06]/30 to-transparent" />
                                  </div>
                                  <div className="relative px-2 pb-2.5 pt-1">
                                    <p className="text-xs font-black text-white truncate group-hover/player:text-[#22d3ee] transition-colors duration-200">{player.gamertag}</p>
                                    <div className="mt-1 flex items-center justify-center gap-1.5 text-[9px]">
                                      <TierBadge tier={player.tier} />
                                      <span className="font-black text-[#22d3ee]">{player.points}</span>
                                      <span className="text-green-400">{player.totalWins}W</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>

                        {/* Show More/Less Button */}
                        {malePlayers.length > 6 && (
                          <div className="flex justify-center mt-4">
                            <button
                              onClick={() => setShowAllPlayers(!showAllPlayers)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#06b6d4]/10 text-[#22d3ee] text-xs font-semibold border border-[#06b6d4]/20 hover:bg-[#06b6d4]/20 transition-all"
                            >
                              {showAllPlayers ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  Tampilkan Lebih Sedikit
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  Lihat Semua ({malePlayers.length} Player)
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>

                  {/* ═══════════════ PLAYER FEMALE TAB ═══════════════ */}
                  <TabsContent value="female" className="mt-0">
                    {femalePlayers.length === 0 ? (
                      <div className="py-12 text-center">
                        <Shield className="w-10 h-10 text-[#a855f7]/15 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Belum ada player female</p>
                      </div>
                    ) : (
                      <>
                        {/* Player Grid - Compact */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {(showAllPlayers ? femalePlayers : femalePlayers.slice(0, 6)).map((player, idx) => {
                            return (
                              <motion.div
                                key={player.id}
                                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                whileHover={{ y: -4, scale: 1.03 }}
                                className="cursor-pointer group/player"
                                onClick={() => setSelectedPlayer({ ...player, division: 'female' })}
                              >
                                <div className="relative rounded-xl bg-white/[0.03] backdrop-blur-sm border border-[#a855f7]/10 text-center transition-all duration-300 overflow-hidden hover:shadow-[0_8px_24px_rgba(168,85,247,0.08)]">
                                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#a855f7] to-transparent z-20" />
                                  <div className="relative h-28 sm:h-32 overflow-hidden group-hover/player:scale-105 transition-transform duration-500">
                                    <Image src={getAvatarUrl(player.gamertag, 'female', player.avatar)} alt={player.gamertag} fill sizes="200px" className="object-cover object-top" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a06] via-[#0c0a06]/30 to-transparent" />
                                  </div>
                                  <div className="relative px-2 pb-2.5 pt-1">
                                    <p className="text-xs font-black text-white truncate group-hover/player:text-[#c084fc] transition-colors duration-200">{player.gamertag}</p>
                                    <div className="mt-1 flex items-center justify-center gap-1.5 text-[9px]">
                                      <TierBadge tier={player.tier} />
                                      <span className="font-black text-[#c084fc]">{player.points}</span>
                                      <span className="text-green-400">{player.totalWins}W</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>

                        {/* Show More/Less Button */}
                        {femalePlayers.length > 6 && (
                          <div className="flex justify-center mt-4">
                            <button
                              onClick={() => setShowAllPlayers(!showAllPlayers)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#a855f7]/10 text-[#c084fc] text-xs font-semibold border border-[#a855f7]/20 hover:bg-[#a855f7]/20 transition-all"
                            >
                              {showAllPlayers ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  Tampilkan Lebih Sedikit
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  Lihat Semua ({femalePlayers.length} Player)
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              );
            })()}
          </motion.div>
        </div>
      </section>
  </>);
}
