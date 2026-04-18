'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Swords, Users, Target, Calendar } from 'lucide-react';

export function TournamentView() {
  const { division } = useAppStore();
  const isMale = division === 'male';
  const accentText = isMale ? 'text-amber-400' : 'text-pink-400';
  const accentBg = isMale ? 'bg-amber-500/10' : 'bg-pink-500/10';

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['tournaments', division],
    queryFn: async () => { const res = await fetch(`/api/tournaments?division=${division}`); return res.json(); },
    staleTime: 30000,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-idm-gold border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Trophy className={`w-5 h-5 ${accentText}`} />
        <h1 className="text-2xl font-black">Tournaments</h1>
        <Badge variant="outline" className="text-[10px]">{division}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(tournaments || []).map((t: any) => (
          <Card key={t.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm">{t.name}</h3>
                  <p className="text-[10px] text-muted-foreground">Week {t.weekNumber}</p>
                </div>
                <Badge variant={t.status === 'completed' ? 'default' : 'outline'} className="text-[10px]">{t.status}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className={`text-center p-2 rounded-lg ${accentBg}`}>
                  <div className={`text-sm font-bold ${accentText}`}>{t._count?.teams || 0}</div>
                  <div className="text-[10px] text-muted-foreground">Teams</div>
                </div>
                <div className={`text-center p-2 rounded-lg ${accentBg}`}>
                  <div className={`text-sm font-bold ${accentText}`}>{t._count?.matches || 0}</div>
                  <div className="text-[10px] text-muted-foreground">Matches</div>
                </div>
                <div className={`text-center p-2 rounded-lg ${accentBg}`}>
                  <div className={`text-sm font-bold ${accentText}`}>Rp {t.prizePool?.toLocaleString() || 0}</div>
                  <div className="text-[10px] text-muted-foreground">Prize</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!tournaments || tournaments.length === 0) && (
        <div className="text-center py-16">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold">No Tournaments Yet</h3>
          <p className="text-sm text-muted-foreground">Tournaments will appear here once created.</p>
        </div>
      )}
    </div>
  );
}
