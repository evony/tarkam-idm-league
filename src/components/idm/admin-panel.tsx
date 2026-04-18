'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Shield, Users, Trophy, Settings, Calendar, Coins, Plus, RefreshCw, Eye, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';

export function AdminPanel() {
  const { division } = useAppStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: stats } = useQuery({
    queryKey: ['stats', division],
    queryFn: async () => { const res = await fetch(`/api/stats?division=${division}`); return res.json(); },
    staleTime: 30000,
  });

  const { data: tournaments } = useQuery({
    queryKey: ['tournaments', division],
    queryFn: async () => { const res = await fetch(`/api/tournaments?division=${division}`); return res.json(); },
    staleTime: 30000,
  });

  const { data: players } = useQuery({
    queryKey: ['players', division],
    queryFn: async () => { const res = await fetch(`/api/players?division=${division}&limit=100`); return res.json(); },
    staleTime: 30000,
  });

  const { data: donations } = useQuery({
    queryKey: ['donations'],
    queryFn: async () => { const res = await fetch('/api/donations'); return res.json(); },
    staleTime: 30000,
  });

  // Create tournament mutation
  const createTournament = useMutation({
    mutationFn: async (data: { name: string; weekNumber: number; division: string; seasonId: string; prizePool: number }) => {
      const res = await fetch('/api/tournaments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tournaments'] }); toast.success('Tournament created!'); },
    onError: () => toast.error('Failed to create tournament'),
  });

  const isMale = division === 'male';
  const accentText = isMale ? 'text-amber-400' : 'text-pink-400';

  // New tournament form
  const [newTournament, setNewTournament] = useState({ name: '', weekNumber: '', prizePool: '50000' });

  const handleCreateTournament = () => {
    if (!newTournament.name || !newTournament.weekNumber) {
      toast.error('Fill in all fields');
      return;
    }
    const seasonId = stats?.season?.id;
    if (!seasonId) { toast.error('No active season'); return; }
    createTournament.mutate({
      name: newTournament.name,
      weekNumber: parseInt(newTournament.weekNumber),
      division,
      seasonId,
      prizePool: parseInt(newTournament.prizePool) || 0,
    });
    setNewTournament({ name: '', weekNumber: '', prizePool: '50000' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className={`w-5 h-5 ${accentText}`} />
        <h1 className="text-2xl font-black">Admin Panel</h1>
        <Badge variant="outline" className="text-[10px]">{division}</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="tournaments" className="text-xs">Tournaments</TabsTrigger>
          <TabsTrigger value="players" className="text-xs">Players</TabsTrigger>
          <TabsTrigger value="donations" className="text-xs">Donations</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: Users, label: 'Players', value: stats?.totalPlayers || 0 },
              { icon: Trophy, label: 'Tournaments', value: tournaments?.length || 0 },
              { icon: Coins, label: 'Prize Pool', value: `Rp ${(stats?.totalPrizePool || 0).toLocaleString()}` },
              { icon: Calendar, label: 'Season', value: stats?.season?.name || 'N/A' },
            ].map((stat, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className={`w-4 h-4 ${accentText}`} />
                    <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                  </div>
                  <div className={`text-lg font-black ${accentText}`}>{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tournaments Tab */}
        <TabsContent value="tournaments" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Create Tournament</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input placeholder="Tournament Name" value={newTournament.name} onChange={(e) => setNewTournament(p => ({ ...p, name: e.target.value }))} />
                <Input type="number" placeholder="Week Number" value={newTournament.weekNumber} onChange={(e) => setNewTournament(p => ({ ...p, weekNumber: e.target.value }))} />
                <Input type="number" placeholder="Prize Pool (Rp)" value={newTournament.prizePool} onChange={(e) => setNewTournament(p => ({ ...p, prizePool: e.target.value }))} />
              </div>
              <Button onClick={handleCreateTournament} disabled={createTournament.isPending} className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold">
                {createTournament.isPending ? 'Creating...' : 'Create Tournament'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">All Tournaments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {(tournaments || []).map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">Week {t.weekNumber} · {t.format}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={t.status === 'completed' ? 'default' : 'outline'} className="text-[10px]">
                      {t.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Rp {t.prizePool?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Players Tab */}
        <TabsContent value="players" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Players ({players?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 max-h-96 overflow-y-auto custom-scrollbar">
              {(players || []).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      {p.gamertag.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{p.gamertag}</p>
                      <p className="text-[10px] text-muted-foreground">{p.name} · {p.city || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">Tier {p.tier}</Badge>
                    <span className="text-xs text-muted-foreground">{p.points} pts</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Donations Tab */}
        <TabsContent value="donations" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Donations ({donations?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 max-h-96 overflow-y-auto custom-scrollbar">
              {(donations || []).map((d: any) => (
                <div key={d.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{d.donorName}</p>
                    <p className="text-[10px] text-muted-foreground">{d.message || 'No message'} · {d.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">Rp {d.amount.toLocaleString()}</span>
                    <Badge variant={d.status === 'approved' ? 'default' : 'outline'} className="text-[10px]">{d.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Settings className="w-4 h-4" /> CMS Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">CMS settings management coming soon. Use the API to update settings directly.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
