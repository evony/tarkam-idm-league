'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Star, Swords, Users, ChevronRight } from 'lucide-react';

export function LeagueView() {
  const { division } = useAppStore();
  const isMale = division === 'male';
  const accentText = isMale ? 'text-amber-400' : 'text-pink-400';
  const accentBg = isMale ? 'bg-amber-500/10' : 'bg-pink-500/10';
  const accentBorder = isMale ? 'border-amber-500/30' : 'border-pink-500/30';

  const { data, isLoading } = useQuery({
    queryKey: ['league', division],
    queryFn: async () => { const res = await fetch(`/api/league?division=${division}`); return res.json(); },
    staleTime: 30000,
  });

  const { data: matchData } = useQuery({
    queryKey: ['league-matches', division],
    queryFn: async () => { const res = await fetch(`/api/league-matches?division=${division}`); return res.json(); },
    staleTime: 30000,
  });

  if (isLoading || !data?.hasData) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-idm-gold border-t-transparent rounded-full animate-spin" /></div>;
  }

  const standings = data.standings || [];
  const matches = matchData || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Trophy className={`w-5 h-5 ${accentText}`} />
          <h1 className="text-2xl font-black">{data.season?.name || 'League'}</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {division === 'male' ? '🕺' : '💃'} {division.charAt(0).toUpperCase() + division.slice(1)} Division · {data.stats?.completedMatches || 0} Matches Played
        </p>
      </motion.div>

      {/* Champion Card */}
      {data.ligaChampion && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-yellow-600/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg font-black text-gradient-fury">Liga IDM Champion</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/30 to-yellow-600/30 flex items-center justify-center border border-amber-500/30">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-black">{data.ligaChampion.name}</h3>
              <p className="text-xs text-muted-foreground">Season {data.ligaChampion.seasonNumber} Champion</p>
            </div>
          </div>
          {data.ligaChampion.members.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {data.ligaChampion.members.map((m: any, i: number) => (
                <Badge key={i} variant="outline" className="text-xs">{m.gamertag}</Badge>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Standings Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Users className={`w-4 h-4 ${accentText}`} /> Club Standings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase">#</th>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase">Club</th>
                  <th className="text-center px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase">P</th>
                  <th className="text-center px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase">W</th>
                  <th className="text-center px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase">D</th>
                  <th className="text-center px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase">L</th>
                  <th className="text-center px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase">GD</th>
                  <th className="text-center px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((club: any, i: number) => (
                  <tr key={club.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2.5 text-sm font-bold text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2.5 text-sm font-medium">{club.name}</td>
                    <td className="px-3 py-2.5 text-sm text-center text-muted-foreground">{club.wins + club.losses + club.draws}</td>
                    <td className="px-3 py-2.5 text-sm text-center">{club.wins}</td>
                    <td className="px-3 py-2.5 text-sm text-center">{club.draws}</td>
                    <td className="px-3 py-2.5 text-sm text-center">{club.losses}</td>
                    <td className="px-3 py-2.5 text-sm text-center">{club.gameDiff > 0 ? '+' : ''}{club.gameDiff}</td>
                    <td className="px-3 py-2.5 text-sm text-center font-bold">{club.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Matches */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Swords className={`w-4 h-4 ${accentText}`} /> League Matches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
          {matches.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No matches scheduled</p>
          ) : (
            matches.map((match: any) => (
              <div key={match.id} className={`p-3 rounded-lg border transition-colors ${match.status === 'completed' ? 'bg-muted/20 border-border' : 'bg-card border-border'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-right">
                    <span className="text-sm font-medium">{match.homeClub?.name || 'TBD'}</span>
                  </div>
                  <div className="mx-4 flex items-center gap-2 min-w-[80px] justify-center">
                    {match.status === 'completed' ? (
                      <>
                        <span className={`text-lg font-black ${accentText}`}>{match.homeScore}</span>
                        <span className="text-xs text-muted-foreground">-</span>
                        <span className={`text-lg font-black ${accentText}`}>{match.awayScore}</span>
                      </>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">{match.status === 'live' ? '🔴 LIVE' : 'Scheduled'}</Badge>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-sm font-medium">{match.awayClub?.name || 'TBD'}</span>
                  </div>
                </div>
                <div className="text-center mt-1">
                  <span className="text-[10px] text-muted-foreground">Week {match.weekNumber}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
