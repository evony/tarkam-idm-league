'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Trophy, Clock, Calendar, Users } from 'lucide-react';

export function MyTournamentCard() {
  const { division } = useAppStore();
  const isMale = division === 'male';
  const accentText = isMale ? 'text-amber-400' : 'text-pink-400';

  const { data: stats } = useQuery({
    queryKey: ['stats', division],
    queryFn: async () => { const res = await fetch(`/api/stats?division=${division}`); return res.json(); },
    staleTime: 30000,
  });

  const activeTournament = stats?.activeTournament;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Target className={`w-5 h-5 ${accentText}`} />
        <h1 className="text-2xl font-black">Turnamen Saya</h1>
      </div>

      {activeTournament ? (
        <Card className="border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl ${isMale ? 'bg-amber-500/10' : 'bg-pink-500/10'} flex items-center justify-center`}>
                <Trophy className={`w-6 h-6 ${accentText}`} />
              </div>
              <div>
                <h2 className="font-bold">{activeTournament.name}</h2>
                <p className="text-xs text-muted-foreground">Week {activeTournament.weekNumber} · {activeTournament.bpm} BPM</p>
              </div>
              <Badge className="ml-auto bg-green-500/20 text-green-400 border-0 text-[10px]">{activeTournament.status}</Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <div className="text-lg font-bold">{activeTournament.teams?.length || 0}</div>
                <div className="text-[10px] text-muted-foreground">Teams</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <div className="text-lg font-bold">{activeTournament.matches?.length || 0}</div>
                <div className="text-[10px] text-muted-foreground">Matches</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <div className="text-lg font-bold">Rp {activeTournament.prizePool.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">Prize</div>
              </div>
            </div>

            {/* Teams */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Teams</h3>
              {(activeTournament.teams || []).map((team: any) => (
                <div key={team.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{team.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">Power: {team.power}</span>
                    {team.isWinner && <Badge className="bg-amber-500/20 text-amber-400 border-0 text-[10px]">🏆 Winner</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-16">
          <Clock className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-1">No Active Tournament</h3>
          <p className="text-sm text-muted-foreground">Register for the next tournament when registration opens!</p>
        </div>
      )}
    </div>
  );
}
