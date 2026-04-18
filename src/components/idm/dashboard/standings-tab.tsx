'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import {
  Users, Shield, Award, Flame, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { TierBadge } from '../tier-badge';
import { useDivisionTheme } from '@/hooks/use-division-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { ClubLogoImage } from '@/components/idm/club-logo-image';
import { staggerContainerFast, fadeUpItemSubtle, staggerContainerReduced, fadeUpItemReduced } from '@/lib/animations';
import type { StatsData } from '@/types/stats';

interface StandingsTabProps {
  data: StatsData;
  setSelectedPlayer: (player: any) => void;
  setSelectedClub: (club: any) => void;
}

export function StandingsTab({ data, setSelectedPlayer, setSelectedClub }: StandingsTabProps) {
  const dt = useDivisionTheme();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const shouldReduceMotion = prefersReducedMotion || isMobile;
  const container = shouldReduceMotion ? staggerContainerReduced : staggerContainerFast;
  const item = shouldReduceMotion ? fadeUpItemReduced : fadeUpItemSubtle;
  const [leaderboardSort, setLeaderboardSort] = useState<'players' | 'clubs'>('players');
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const [showAllClubs, setShowAllClubs] = useState(false);

  const topPlayers = data?.topPlayers ?? [];
  const displayedPlayers = showAllPlayers ? topPlayers : topPlayers.slice(0, 10);
  const clubs = data?.clubs ?? [];
  const displayedClubs = showAllClubs ? clubs : clubs.slice(0, 6);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">

      {/* Toornament-style sub-tabs for Players/Clubs */}
      <div className={`flex items-center gap-1 p-1 rounded-lg ${dt.bgSubtle} ${dt.border} w-fit`}>
        <button
          onClick={() => setLeaderboardSort('players')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${leaderboardSort === 'players' ? `${dt.bg} ${dt.text} shadow-sm` : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Users className="w-3 h-3" /> Players
        </button>
        <button
          onClick={() => setLeaderboardSort('clubs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${leaderboardSort === 'clubs' ? `${dt.bg} ${dt.text} shadow-sm` : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Shield className="w-3 h-3" /> Clubs
        </button>
      </div>

      {/* Player Leaderboard — Toornament clean table */}
      {leaderboardSort === 'players' && (
        <motion.div variants={item}>
          <Card className={`${dt.casinoCard} overflow-hidden`}>
            <div className={dt.casinoBar} />
            {/* Header bar */}
            <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${dt.borderSubtle}`}>
              <div className={`w-5 h-5 rounded ${dt.iconBg} flex items-center justify-center shrink-0`}>
                <Award className={`w-3 h-3 ${dt.neonText}`} />
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider">Peringkat Player</h3>
              <Badge className={`${dt.casinoBadge} ml-auto text-[9px]`}>TOP {displayedPlayers?.length || 10}</Badge>
            </div>
            {/* Horizontal scroll wrapper for mobile */}
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className={`hover:bg-transparent border-b ${dt.border} bg-muted/30`}>
                      <TableHead className="w-10 text-center text-[10px] font-semibold">#</TableHead>
                      <TableHead className="text-[10px] font-semibold min-w-[120px]">Player</TableHead>
                      <TableHead className="w-14 text-center text-[10px] font-semibold">Tier</TableHead>
                      <TableHead className="w-14 text-right text-[10px] font-semibold">Pts</TableHead>
                      <TableHead className="w-10 text-center text-[10px] font-semibold">W</TableHead>
                      <TableHead className="w-10 text-center text-[10px] font-semibold hidden sm:table-cell">L</TableHead>
                      <TableHead className="w-14 text-center text-[10px] font-semibold hidden md:table-cell">Streak</TableHead>
                      <TableHead className="w-10 text-center text-[10px] font-semibold hidden sm:table-cell">MVP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedPlayers?.map((p, idx) => {
                      const losses = p.matches - p.totalWins;
                      return (
                        <TableRow
                          key={p.id}
                          className={`cursor-pointer transition-colors border-b ${dt.borderSubtle} ${
                            idx < 3 ? `${dt.bgSubtle}` : ''
                          }`}
                          onClick={() => setSelectedPlayer(p)}
                        >
                          <TableCell className="text-center">
                            <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-bold ${
                              idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                              idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                              idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                              'text-muted-foreground'
                            }`}>
                              {idx + 1}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full ${dt.iconBg} flex items-center justify-center text-[9px] font-bold ${dt.text} shrink-0`}>
                                {p.gamertag.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium truncate">{p.gamertag}</p>
                                {p.club && <p className="text-[9px] text-muted-foreground truncate">{p.club}</p>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center"><TierBadge tier={p.tier} /></TableCell>
                          <TableCell className={`text-right font-bold text-xs ${idx < 3 ? dt.neonText : ''}`}>{p.points}</TableCell>
                          <TableCell className="text-center text-xs text-green-500 font-medium">{p.totalWins}</TableCell>
                          <TableCell className="text-center text-xs text-red-500 font-medium hidden sm:table-cell">{losses > 0 ? losses : 0}</TableCell>
                          <TableCell className="text-center text-xs hidden md:table-cell">
                            {p.streak > 1 ? (
                              <span className="text-orange-400 font-semibold flex items-center gap-0.5 justify-center"><Flame className="w-3 h-3" />{p.streak}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center text-xs hidden sm:table-cell">
                            {p.totalMvp > 0 ? (
                              <span className="text-yellow-500 font-semibold">{p.totalMvp}</span>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
            {/* Show more / less toggle */}
            {data.topPlayers?.length > 10 && (
              <div className={`flex items-center justify-center py-2 border-t ${dt.borderSubtle}`}>
                <button
                  onClick={() => setShowAllPlayers(!showAllPlayers)}
                  className={`flex items-center gap-1 text-[10px] font-medium ${dt.text} hover:underline`}
                >
                  {showAllPlayers ? <><ChevronUp className="w-3 h-3" /> Tampilkan Sedikit</> : <><ChevronDown className="w-3 h-3" /> Tampilkan Semua ({data.topPlayers.length})</>}
                </button>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Club Standings — Toornament clean table */}
      {leaderboardSort === 'clubs' && (
        <motion.div variants={item}>
          <Card className={`${dt.casinoCard} overflow-hidden`}>
            <div className={dt.casinoBar} />
            <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${dt.borderSubtle}`}>
              <div className={`w-5 h-5 rounded ${dt.iconBg} flex items-center justify-center shrink-0`}>
                <Shield className={`w-3 h-3 ${dt.neonText}`} />
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider">Klasemen Club</h3>
              <Badge className={`${dt.casinoBadge} ml-auto text-[9px]`}>{data.clubs?.length || 0} Clubs</Badge>
            </div>
            {data.clubs?.length > 0 ? (
              <>
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className={`hover:bg-transparent border-b ${dt.border} bg-muted/30`}>
                          <TableHead className="w-10 text-center text-[10px] font-semibold">#</TableHead>
                          <TableHead className="text-[10px] font-semibold min-w-[140px]">Club</TableHead>
                          <TableHead className="w-10 text-center text-[10px] font-semibold">W</TableHead>
                          <TableHead className="w-10 text-center text-[10px] font-semibold hidden sm:table-cell">L</TableHead>
                          <TableHead className="w-12 text-center text-[10px] font-semibold hidden md:table-cell">Selisih</TableHead>
                          <TableHead className="w-14 text-right text-[10px] font-semibold">Pts</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayedClubs?.map((club, idx) => (
                          <TableRow
                            key={club.id}
                            className={`cursor-pointer transition-colors border-b ${dt.borderSubtle} ${
                              idx < 4 ? `${dt.bgSubtle}` : ''
                            }`}
                            onClick={() => setSelectedClub(club)}
                          >
                            <TableCell className="text-center">
                              <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] font-bold ${
                                idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                                idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                                'text-muted-foreground'
                              }`}>
                                {idx + 1}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
                                  {club.logo ? (
                                    <ClubLogoImage clubName={club.name} dbLogo={club.logo} alt={club.name} width={28} height={28} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className={`w-full h-full ${dt.iconBg} flex items-center justify-center`}>
                                      <Shield className={`w-3.5 h-3.5 ${dt.text}`} />
                                    </div>
                                  )}
                                </div>
                                <span className="text-xs font-semibold truncate">{club.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-xs text-green-500 font-medium">{club.wins}</TableCell>
                            <TableCell className="text-center text-xs text-red-500 font-medium hidden sm:table-cell">{club.losses}</TableCell>
                            <TableCell className="text-center text-xs hidden md:table-cell">
                              <span className={club.gameDiff > 0 ? 'text-green-500' : club.gameDiff < 0 ? 'text-red-500' : 'text-muted-foreground'}>
                                {club.gameDiff > 0 ? '+' : ''}{club.gameDiff}
                              </span>
                            </TableCell>
                            <TableCell className={`text-right font-bold text-xs ${idx === 0 ? dt.neonGradient : idx < 4 ? dt.neonText : ''}`}>{club.points}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                {data.clubs?.length > 6 && (
                  <div className={`flex items-center justify-center py-2 border-t ${dt.borderSubtle}`}>
                    <button
                      onClick={() => setShowAllClubs(!showAllClubs)}
                      className={`flex items-center gap-1 text-[10px] font-medium ${dt.text} hover:underline`}
                    >
                      {showAllClubs ? <><ChevronUp className="w-3 h-3" /> Tampilkan Sedikit</> : <><ChevronDown className="w-3 h-3" /> Tampilkan Semua ({data.clubs.length})</>}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4">
                <div className={`p-6 rounded-xl ${dt.bgSubtle} ${dt.border} text-center`}>
                  <Shield className={`w-8 h-8 mx-auto mb-2 opacity-30 ${dt.text}`} />
                  <p className="text-sm text-muted-foreground">Belum ada club terdaftar</p>
                  <p className="text-[10px] text-muted-foreground/80 mt-1">Club akan muncul setelah pendaftaran</p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
