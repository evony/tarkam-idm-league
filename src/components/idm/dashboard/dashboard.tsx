'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Star, Users, Swords, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const { division } = useAppStore();
  const isMale = division === 'male';
  const accentText = isMale ? 'text-amber-400' : 'text-pink-400';
  const accentBg = isMale ? 'bg-amber-500/10' : 'bg-pink-500/10';
  const accentBorder = isMale ? 'border-amber-500/30' : 'border-pink-500/30';

  const { data, isLoading } = useQuery({
    queryKey: ['stats', division],
    queryFn: async () => { const res = await fetch(`/api/stats?division=${division}`); return res.json(); },
    staleTime: 30000,
  });

  if (isLoading || !data?.hasData) {
    return (
      <div className="space-y-6">
        <div className="h-44 rounded-2xl bg-muted animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-2xl overflow-hidden border border-border">
        <div className={`absolute inset-0 ${isMale ? 'bg-gradient-to-br from-amber-500/10 via-transparent to-yellow-600/5' : 'bg-gradient-to-br from-pink-500/10 via-transparent to-rose-600/5'}`} />
        <div className="relative p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`${accentBg} ${accentText} border-0 text-xs`}>
              {division === 'male' ? '🕺' : '💃'} {division.charAt(0).toUpperCase() + division.slice(1)} Division
            </Badge>
            <Badge variant="outline" className="text-[10px]">{data.season.name}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-1">{data.activeTournament?.name || 'No Active Tournament'}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {data.activeTournament ? `Week ${data.activeTournament.weekNumber} · ${data.activeTournament.bpm || 120} BPM` : 'Stay tuned for the next tournament'}
          </p>
          {data.activeTournament && (
            <div className="flex flex-wrap items-center gap-4">
              <div className={`rounded-xl ${accentBg} border ${accentBorder} px-4 py-3`}>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Prize Pool</div>
                <div className={`text-xl font-black ${accentText}`}>Rp {data.activeTournament.prizePool.toLocaleString()}</div>
              </div>
              <div className="rounded-xl bg-muted/50 border border-border px-4 py-3">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Season Donation</div>
                <div className="text-xl font-black">Rp {data.seasonDonationTotal.toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Users, label: 'Total Players', value: data.totalPlayers },
          { icon: Trophy, label: 'Prize Pool', value: `Rp ${data.totalPrizePool.toLocaleString()}` },
          { icon: Swords, label: 'Season Progress', value: `${data.seasonProgress.completedWeeks}/${data.seasonProgress.totalWeeks}` },
          { icon: TrendingUp, label: 'Donations', value: `Rp ${data.seasonDonationTotal.toLocaleString()}` },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-4 h-4 ${accentText}`} />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                </div>
                <div className={`text-lg font-black ${accentText}`}>{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Players */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Crown className={`w-4 h-4 ${accentText}`} /> Top Players</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 max-h-96 overflow-y-auto custom-scrollbar">
            {data.topPlayers.map((player: any, i: number) => (
              <div key={player.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? (isMale ? 'bg-amber-500/20 text-amber-400' : 'bg-pink-500/20 text-pink-400') : 'bg-muted text-muted-foreground'}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{player.gamertag}</p>
                  <p className="text-[10px] text-muted-foreground">{player.club || 'No Club'} · Tier {player.tier}</p>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${accentText}`}>{player.points}</div>
                  <div className="text-[10px] text-muted-foreground">{player.totalWins}W · {player.totalMvp}MVP</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Champions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Trophy className={`w-4 h-4 ${accentText}`} /> Weekly Champions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
            {data.weeklyChampions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No completed tournaments yet</p>
            ) : (
              data.weeklyChampions.map((champ: any, i: number) => (
                <div key={i} className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">{champ.tournamentName}</span>
                    <Badge variant="outline" className="text-[10px]">Week {champ.weekNumber}</Badge>
                  </div>
                  {champ.winnerTeam && (
                    <div className="flex items-center gap-2">
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span className="text-xs text-muted-foreground">{champ.winnerTeam.name}</span>
                    </div>
                  )}
                  {champ.mvp && (
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">MVP: {champ.mvp.gamertag}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Matches */}
      {data.recentMatches.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className={`w-4 h-4 ${accentText}`} /> Recent Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recentMatches.map((match: any) => (
                <div key={match.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex-1 text-right"><span className="text-sm font-medium">{match.club1.name}</span></div>
                  <div className="mx-4 flex items-center gap-2">
                    <span className={`text-lg font-black ${accentText}`}>{match.score1}</span>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <span className={`text-lg font-black ${accentText}`}>{match.score2}</span>
                  </div>
                  <div className="flex-1 text-left"><span className="text-sm font-medium">{match.club2.name}</span></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
