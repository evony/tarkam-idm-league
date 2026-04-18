'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Swords, Radio, Crown, Star, Clock, Zap } from 'lucide-react';

export function MatchDayCenter() {
  const { division } = useAppStore();
  const isMale = division === 'male';
  const accentText = isMale ? 'text-amber-400' : 'text-pink-400';

  const { data: stats } = useQuery({
    queryKey: ['stats', division],
    queryFn: async () => { const res = await fetch(`/api/stats?division=${division}`); return res.json(); },
    staleTime: 15000,
  });

  const { data: feed } = useQuery({
    queryKey: ['feed'],
    queryFn: async () => { const res = await fetch('/api/feed'); return res.json(); },
    staleTime: 15000,
  });

  const activeTournament = stats?.activeTournament;
  const liveMatches = activeTournament?.matches?.filter((m: any) => m.status === 'live' || m.status === 'ready') || [];
  const completedMatches = activeTournament?.matches?.filter((m: any) => m.status === 'completed') || [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Radio className={`w-5 h-5 ${accentText}`} />
          <h1 className="text-2xl font-black">Match Day Center</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {division === 'male' ? '🕺' : '💃'} Live updates and match results
        </p>
      </motion.div>

      {/* Active Tournament Info */}
      {activeTournament && (
        <Card className="border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${isMale ? 'bg-amber-500/10' : 'bg-pink-500/10'} flex items-center justify-center`}>
                <Zap className={`w-5 h-5 ${accentText}`} />
              </div>
              <div>
                <h3 className="font-bold text-sm">{activeTournament.name}</h3>
                <p className="text-[10px] text-muted-foreground">Week {activeTournament.weekNumber} · {activeTournament.bpm} BPM · Prize: Rp {activeTournament.prizePool.toLocaleString()}</p>
              </div>
              <Badge className="ml-auto bg-red-500/20 text-red-400 border-0 text-[10px]">● LIVE</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Radio className="w-4 h-4 text-red-400" /> Live / Upcoming Matches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {liveMatches.map((match: any) => (
              <div key={match.id} className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-right">
                    <span className="text-sm font-semibold">{match.team1?.name || 'TBD'}</span>
                  </div>
                  <div className="mx-4 px-4 py-2 rounded-lg bg-muted">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black">{match.score1 ?? '-'}</span>
                      <span className="text-xs text-muted-foreground">vs</span>
                      <span className="text-lg font-black">{match.score2 ?? '-'}</span>
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-sm font-semibold">{match.team2?.name || 'TBD'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="outline" className="text-[10px]">Round {match.round}</Badge>
                  <Badge variant="outline" className="text-[10px]">{match.bracket}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Matches */}
      {completedMatches.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Trophy className={`w-4 h-4 ${accentText}`} /> Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
            {completedMatches.map((match: any) => (
              <div key={match.id} className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-right">
                    <span className={`text-sm font-medium ${match.score1 > match.score2 ? 'font-bold' : ''}`}>{match.team1?.name || 'TBD'}</span>
                  </div>
                  <div className="mx-3 flex items-center gap-2">
                    <span className={`text-sm font-bold ${match.score1 > match.score2 ? accentText : 'text-muted-foreground'}`}>{match.score1}</span>
                    <span className="text-xs text-muted-foreground">-</span>
                    <span className={`text-sm font-bold ${match.score2 > match.score1 ? accentText : 'text-muted-foreground'}`}>{match.score2}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <span className={`text-sm font-medium ${match.score2 > match.score1 ? 'font-bold' : ''}`}>{match.team2?.name || 'TBD'}</span>
                  </div>
                </div>
                {match.mvpPlayer && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className="text-[10px] text-muted-foreground">MVP: {match.mvpPlayer.gamertag}</span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Activity Feed */}
      {feed && feed.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Activity Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {feed.map((item: any) => (
              <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${item.type === 'match' ? 'bg-blue-500/10 text-blue-400' : item.type === 'donation' ? 'bg-amber-500/10 text-amber-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                  {item.type === 'match' ? '⚔️' : item.type === 'donation' ? '🎁' : '🏆'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.title}</p>
                  {item.subtitle && <p className="text-[10px] text-muted-foreground truncate">{item.subtitle}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!activeTournament && (
        <div className="text-center py-16">
          <Clock className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-1">No Active Match Day</h3>
          <p className="text-sm text-muted-foreground">Check back when the next tournament goes live!</p>
        </div>
      )}
    </div>
  );
}
