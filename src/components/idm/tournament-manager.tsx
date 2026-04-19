'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Plus, Play, Users, Zap, Crown, Loader2, Trash2,
  UserPlus, Check, X, Trophy, Gift, Star, ArrowRight, RefreshCw,
  Heart, MapPin, Pencil, Calendar, ChevronLeft
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { TierBadge } from './tier-badge';
import { StatusBadge } from './status-badge';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { container, item } from '@/lib/animations';
import type { DivisionTheme } from '@/hooks/use-division-theme';

interface TournamentManagerProps {
  division: string;
  dt: DivisionTheme;
  stats: { season?: { id: string; division?: string } } | null;
  setConfirmDialog: (d: { open: boolean; title: string; description: string; onConfirm: () => void }) => void;
}

const STEPS = [
  { key: 'setup', label: 'Setup' },
  { key: 'registration', label: 'Registrasi' },
  { key: 'approval', label: 'Persetujuan' },
  { key: 'team_generation', label: 'Buat Tim' },
  { key: 'bracket_generation', label: 'Buat Bracket' },
  { key: 'main_event', label: 'Main Event' },
  { key: 'finalization', label: 'Finalisasi' },
  { key: 'completed', label: 'Selesai' },
];

const FORMAT_LABELS: Record<string, string> = {
  single_elimination: 'Single Elimination',
  double_elimination: 'Double Elimination',
  group_stage: 'Group Stage + Playoff',
};

const BRACKET_LABELS: Record<string, string> = {
  upper: 'Upper Bracket',
  lower: 'Lower Bracket',
  grand_final: 'Grand Final',
  group: 'Group Stage',
};

export function TournamentManager({ division, dt, stats, setConfirmDialog }: TournamentManagerProps) {
  const qc = useQueryClient();
  const seasonId = stats?.season?.id;
  // IDM League is unified — use the season's division ('liga') for tournament creation
  const seasonDivision = stats?.season?.division || 'liga';

  // State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newForm, setNewForm] = useState({
    name: '', weekNumber: '', format: 'single_elimination',
    defaultMatchFormat: 'BO1', prizePool: '', bpm: '', location: 'Online'
  });
  const [searchPlayer, setSearchPlayer] = useState('');
  const [tierOverrides, setTierOverrides] = useState<Record<string, string>>({});
  const [prizes, setPrizes] = useState<{ label: string; position: number; prizeAmount: number; recipientCount: number; isMvp?: boolean }[]>([
    { label: 'Juara 1', position: 1, prizeAmount: 0, recipientCount: 3, isMvp: false },
    { label: 'Juara 2', position: 2, prizeAmount: 0, recipientCount: 3, isMvp: false },
    { label: 'Juara 3', position: 3, prizeAmount: 0, recipientCount: 3, isMvp: false },
    { label: 'MVP', position: 4, prizeAmount: 0, recipientCount: 1, isMvp: true },
  ]);
  const [approvalStep, setApprovalStep] = useState<'approve' | 'prize'>('approve');
  const [showPrizeConfig, setShowPrizeConfig] = useState(false);
  const [manualPrizePool, setManualPrizePool] = useState<string>('');
  const [wantsManualPrize, setWantsManualPrize] = useState(false);
  const [selectedMvp, setSelectedMvp] = useState<string>('');
  const [scoreInputs, setScoreInputs] = useState<Record<string, { s1: string; s2: string }>>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [prizesInitializedFor, setPrizesInitializedFor] = useState<string>('');
  const [editForm, setEditForm] = useState<{
    id: string; name: string; weekNumber: string; format: string;
    defaultMatchFormat: string; prizePool: string; bpm: string;
    location: string; scheduledAt: string;
  }>({ id: '', name: '', weekNumber: '', format: 'single_elimination', defaultMatchFormat: 'BO1', prizePool: '', bpm: '', location: '', scheduledAt: '' });

  // Queries — fetch tournaments by seasonId (unified league, not by division)
  const { data: tournaments } = useQuery({
    queryKey: ['admin-tournaments', seasonId],
    queryFn: async () => {
      if (!seasonId) return [];
      const r = await fetch(`/api/tournaments?seasonId=${seasonId}`);
      return r.json();
    },
    enabled: !!seasonId,
  });

  const { data: selected } = useQuery({
    queryKey: ['admin-tournament', selectedId],
    queryFn: async () => { if (!selectedId) return null; const r = await fetch(`/api/tournaments/${selectedId}`); return r.json(); },
    enabled: !!selectedId,
  });

  const { data: players } = useQuery({
    queryKey: ['admin-players', division],
    queryFn: async () => { const r = await fetch(`/api/players?division=${division}`); return r.json(); },
  });

  // Fetch approved donations (sawer) for this tournament
  const { data: tournamentDonations } = useQuery({
    queryKey: ['admin-tournament-donations', selectedId],
    queryFn: async () => {
      if (!selectedId) return { total: { amount: 0, count: 0 }, donations: [] };
      const r = await fetch(`/api/donations?status=approved&limit=100`);
      const data = await r.json();
      return data;
    },
    enabled: !!selectedId,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const r = await fetch('/api/tournaments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || 'Gagal membuat tournament'); }
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournaments', seasonId] }); toast.success('Tournament berhasil dibuat!'); setNewForm({ name: '', weekNumber: '', format: 'single_elimination', defaultMatchFormat: 'BO1', prizePool: '', bpm: '128', location: 'Online' }); },
    onError: (e: Error) => { toast.error(e.message); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const r = await fetch(`/api/tournaments/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || 'Gagal update'); }
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournaments', seasonId] }); qc.invalidateQueries({ queryKey: ['admin-tournament', selectedId] }); toast.success('Status diperbarui!'); },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { playerId?: string; playerIds?: string[] } }) => {
      const r = await fetch(`/api/tournaments/${id}/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || 'Gagal register'); }
      return r.json();
    },
    onSuccess: (res) => { qc.invalidateQueries({ queryKey: ['admin-tournament', selectedId] }); toast.success(`${res.registered} player terdaftar!`); },
    onError: (e: Error) => { toast.error(e.message); },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const r = await fetch(`/api/tournaments/${id}/approve`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || 'Gagal approve'); }
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournament', selectedId] }); toast.success('Player disetujui!'); },
  });

  const generateTeamsMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/tournaments/${id}/generate-teams`, { method: 'POST' });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || 'Gagal generate tim'); }
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournaments', seasonId] }); qc.invalidateQueries({ queryKey: ['admin-tournament', selectedId] }); toast.success('Tim berhasil di-generate!'); },
    onError: (e: Error) => { toast.error(e.message); },
  });

  const generateBracketMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/tournaments/${id}/generate-bracket`, { method: 'POST' });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || 'Gagal generate bracket'); }
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournaments', seasonId] }); qc.invalidateQueries({ queryKey: ['admin-tournament', selectedId] }); toast.success('Bracket berhasil di-generate!'); },
    onError: (e: Error) => { toast.error(e.message); },
  });

  const startMatchMutation = useMutation({
    mutationFn: async ({ tournamentId, matchId }: { tournamentId: string; matchId: string }) => {
      const r = await fetch(`/api/tournaments/${tournamentId}/start-match`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId }),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || 'Gagal start match'); }
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournament', selectedId] }); toast.success('Match dimulai!'); },
    onError: (e: Error) => { toast.error(e.message); },
  });

  const scoreMutation = useMutation({
    mutationFn: async ({ tournamentId, matchId, score1, score2 }: { tournamentId: string; matchId: string; score1: number; score2: number }) => {
      const r = await fetch(`/api/tournaments/${tournamentId}/score`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, score1, score2 }),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || 'Gagal submit skor'); }
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournament', selectedId] }); qc.invalidateQueries({ queryKey: ['admin-tournaments', seasonId] }); toast.success('Skor berhasil disubmit!'); },
    onError: (e: Error) => { toast.error(e.message); },
  });

  const finalizeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const r = await fetch(`/api/tournaments/${id}/finalize`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || 'Gagal finalisasi'); }
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournaments', seasonId] }); qc.invalidateQueries({ queryKey: ['admin-tournament', selectedId] }); toast.success('Tournament berhasil difinalisasi! 🎉'); },
    onError: (e: Error) => { toast.error(e.message); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/tournaments/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Gagal hapus');
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournaments', seasonId] }); setSelectedId(null); toast.success('Tournament dihapus'); },
  });

  // Edit tournament handler
  const openEditDialog = (t: { id: string; name: string; weekNumber: number; format: string; defaultMatchFormat: string; prizePool: number; bpm?: number | null; location?: string | null; scheduledAt?: string | null }) => {
    setEditForm({
      id: t.id,
      name: t.name,
      weekNumber: String(t.weekNumber),
      format: t.format,
      defaultMatchFormat: t.defaultMatchFormat || 'BO1',
      prizePool: String(t.prizePool || 0),
      bpm: String(t.bpm ?? ''),
      location: t.location || '',
      scheduledAt: t.scheduledAt ? new Date(t.scheduledAt).toISOString().slice(0, 16) : '',
    });
    setEditDialogOpen(true);
  };

  const editMutation = useMutation({
    mutationFn: async (data: { id: string } & Record<string, unknown>) => {
      const { id, ...rest } = data;
      const r = await fetch(`/api/tournaments/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rest),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || 'Gagal update tournament'); }
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tournaments', seasonId] });
      qc.invalidateQueries({ queryKey: ['admin-tournament', selectedId] });
      setEditDialogOpen(false);
      toast.success('Tournament berhasil diperbarui!');
    },
    onError: (e: Error) => { toast.error(e.message); },
  });

  // Derived data
  const currentStepIdx = STEPS.findIndex(s => s.key === selected?.status);
  const registeredIds = useMemo(() => new Set((selected?.participations || []).map((p: { playerId: string }) => p.playerId)), [selected?.participations]);
  const unregistered = useMemo(() => (players || []).filter((p: { id: string }) => !registeredIds.has(p.id)), [players, registeredIds]);
  const filteredUnregistered = useMemo(() =>
    unregistered.filter((p: { gamertag: string; name: string }) =>
      p.gamertag.toLowerCase().includes(searchPlayer.toLowerCase()) || p.name.toLowerCase().includes(searchPlayer.toLowerCase())
    ), [unregistered, searchPlayer]);

  const pendingApprovals = useMemo(() => (selected?.participations || []).filter((p: { status: string }) => p.status === 'registered'), [selected?.participations]);
  const approvedParticipations = useMemo(() => (selected?.participations || []).filter((p: { status: string }) => ['approved', 'assigned'].includes(p.status)), [selected?.participations]);

  // Tier distribution for approval phase
  const tierDist = useMemo(() => {
    const dist = { S: 0, A: 0, B: 0 };
    for (const p of pendingApprovals) {
      const t = tierOverrides[p.playerId] || p.player?.tier || 'B';
      dist[t as keyof typeof dist]++;
    }
    for (const p of approvedParticipations) {
      const t = p.tierOverride || p.player?.tier || 'B';
      dist[t as keyof typeof dist]++;
    }
    return dist;
  }, [pendingApprovals, approvedParticipations, tierOverrides]);

  const approvedSawer = useMemo(() => {
    if (!tournamentDonations?.donations) return 0;
    return tournamentDonations.donations
      .filter((d: { tournamentId: string | null; seasonId: string | null; type: string }) =>
        d.tournamentId === selectedId || (d.type === 'weekly' && d.seasonId === seasonId)
      )
      .reduce((sum: number, d: { amount: number }) => sum + d.amount, 0);
  }, [tournamentDonations, selectedId, seasonId]);

  // Reference prize pool (display only, not forced)
  const referencePrizePool = useMemo(() => {
    return (approvedParticipations.length * 20000) + approvedSawer;
  }, [approvedParticipations.length, approvedSawer]);

  const matchesByBracket = (() => {
    if (!selected?.matches) return {};
    const grouped: Record<string, typeof selected.matches> = {};
    for (const m of selected.matches) {
      const key = m.bracket || 'upper';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    }
    return grouped;
  })();

  // Helpers
  const nextMatch = (() => {
    if (!selected?.matches) return null;
    return selected.matches.find((m: { status: string; team1Id: string | null; team2Id: string | null }) =>
      (m.status === 'ready' || m.status === 'pending') && m.team1Id && m.team2Id
    );
  })();

  const getTeamName = (teamId: string | null) => {
    if (!teamId || !selected?.teams) return 'TBD';
    const team = selected.teams.find((t: { id: string }) => t.id === teamId);
    return team?.name || 'TBD';
  };

  // Reset approval step when selectedId changes (adjust state during render)
  const [prevSelectedId, setPrevSelectedId] = useState<string | null>(selectedId);
  if (prevSelectedId !== selectedId) {
    setPrevSelectedId(selectedId);
    setApprovalStep('approve');
    setShowPrizeConfig(false);
    setWantsManualPrize(false);
    setManualPrizePool('');
  }

  // Initialize prizes and prize pool from selected tournament (once per tournament)
  if (selected?.id && selected.id !== prizesInitializedFor) {
    setPrizesInitializedFor(selected.id);
    if (selected.prizePool && selected.prizePool > 0) {
      setManualPrizePool(String(selected.prizePool));
    }
    if (selected.prizes && selected.prizes.length > 0) {
      setPrizes(selected.prizes.map((p: { label: string; position: number; prizeAmount: number; recipientCount: number; isMvp?: boolean }) => ({
        label: p.label,
        position: p.position,
        prizeAmount: p.prizeAmount,
        recipientCount: p.recipientCount,
        isMvp: p.isMvp,
      })));
      setWantsManualPrize(true);
      setShowPrizeConfig(true);
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* ===== CREATE TOURNAMENT ===== */}
      <Card className={dt.casinoCard}>
        <div className={dt.casinoBar} />
        <CardContent className="p-4 relative z-10">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Plus className={`w-4 h-4 ${dt.neonText}`} /> Buat Tournament Baru
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Input placeholder="Nama Tournament" value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Week #" type="number" value={newForm.weekNumber} onChange={e => setNewForm(f => ({ ...f, weekNumber: e.target.value }))} />
            <Select value={newForm.format} onValueChange={v => setNewForm(f => ({ ...f, format: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="single_elimination">Single Elimination</SelectItem>
                <SelectItem value="double_elimination">Double Elimination</SelectItem>
                <SelectItem value="group_stage">Group Stage + Playoff</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newForm.defaultMatchFormat} onValueChange={v => setNewForm(f => ({ ...f, defaultMatchFormat: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BO1">BO1</SelectItem>
                <SelectItem value="BO3">BO3</SelectItem>
                <SelectItem value="BO5">BO5</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="BPM (contoh: 128 atau Random 120-140)" value={newForm.bpm} onChange={e => setNewForm(f => ({ ...f, bpm: e.target.value }))} />
            <Input placeholder="Lokasi" value={newForm.location} onChange={e => setNewForm(f => ({ ...f, location: e.target.value }))} />
            <Button size="sm" disabled={!newForm.name || !newForm.weekNumber || !seasonId || createMutation.isPending}
              title={!seasonId ? 'Buat season terlebih dahulu' : !newForm.name ? 'Masukkan nama tournament' : !newForm.weekNumber ? 'Masukkan nomor week' : 'Buat tournament'}
              onClick={() => createMutation.mutate({
                name: newForm.name, weekNumber: parseInt(newForm.weekNumber), division: seasonDivision, seasonId,
                format: newForm.format, defaultMatchFormat: newForm.defaultMatchFormat,
                prizePool: 0, bpm: newForm.bpm || undefined,
                location: newForm.location || 'Online',
              })}>
              {createMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />} Buat
            </Button>
          </div>
          {!seasonId ? (
            <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <span className="text-xs">⚠️</span>
              <p className="text-[11px] text-red-400 font-medium">Buat season terlebih dahulu di tab <strong>"Season"</strong> sebelum membuat tournament.</p>
            </div>
          ) : !newForm.name || !newForm.weekNumber ? (
            <p className="text-[10px] text-muted-foreground mt-2">💡 Isi <strong>Nama Tournament</strong> dan <strong>Week #</strong> untuk mengaktifkan tombol Buat.</p>
          ) : null}
        </CardContent>
      </Card>

      {/* ===== TOURNAMENT LIST ===== */}
      <div className="space-y-2">
        {tournaments?.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Belum ada tournament. Buat yang pertama!</p>
        )}
        {tournaments?.map((t: { id: string; name: string; weekNumber: number; status: string; format: string; defaultMatchFormat: string; prizePool: number; bpm?: number; location?: string; scheduledAt?: string; _count?: { teams: number; participations: number; matches: number } }) => (
          <motion.div key={t.id} variants={item}>
            <Card className={`${dt.casinoCard} ${dt.casinoGlow} cursor-pointer ${selectedId === t.id ? `ring-1 ring-idm-gold-warm` : ''}`}
              onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}>
              <div className={dt.casinoBar} />
              <CardContent className="p-3 relative z-10">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <StatusBadge status={t.status} />
                      <Badge className="text-[9px] border-0 bg-idm-gold-warm/10 text-idm-gold-warm">{FORMAT_LABELS[t.format] || t.format}</Badge>
                      <span className="text-[10px] text-muted-foreground">Week {t.weekNumber}</span>
                      <span className="text-[10px] text-muted-foreground">{formatCurrency(t.prizePool)}</span>
                      {t.bpm && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Heart className="w-2.5 h-2.5 text-red-400" />{t.bpm} BPM</span>}
                      {t.location && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{t.location}</span>}
                      {t.scheduledAt && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{new Date(t.scheduledAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
                      {t._count && <>
                        <span className="text-[10px] text-muted-foreground">{t._count.teams} tim</span>
                        <span className="text-[10px] text-muted-foreground">{t._count.participations} pemain</span>
                      </>}
                    </div>
                  </div>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-idm-gold-warm hover:text-idm-gold-warm/80 hover:bg-idm-gold-warm/10"
                      onClick={() => openEditDialog(t)} title="Edit Tournament">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    {(t.status === 'setup' || t.status === 'registration') && (
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => setConfirmDialog({
                          open: true, title: 'Hapus Tournament?',
                          description: `Tournament "${t.name}" dan semua data terkait akan dihapus permanen.`,
                          onConfirm: () => deleteMutation.mutate(t.id)
                        })} title="Hapus Tournament">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ===== SELECTED TOURNAMENT DETAIL ===== */}
      {selected && (
        <Card className={`${dt.casinoCard} border-idm-gold-warm/20`}>
          <div className={dt.casinoBar} />
          <CardContent className="p-4 relative z-10 space-y-4">
            {/* Header + Step Progress */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold">{selected.name}</h3>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {selected.bpm && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Heart className="w-2.5 h-2.5 text-red-400" />{selected.bpm} BPM</span>}
                  {selected.location && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{selected.location}</span>}
                  <span className="text-[10px] text-muted-foreground">💰 {formatCurrency(parseInt(manualPrizePool) || selected.prizePool || 0)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="text-[9px] border-0 bg-idm-gold-warm/10 text-idm-gold-warm">{FORMAT_LABELS[selected.format] || selected.format}</Badge>
                <StatusBadge status={selected.status} />
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-idm-gold-warm hover:text-idm-gold-warm/80 hover:bg-idm-gold-warm/10"
                  onClick={() => openEditDialog(selected)} title="Edit Tournament">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                {(selected.status === 'setup' || selected.status === 'registration') && (
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => setConfirmDialog({
                      open: true, title: 'Hapus Tournament?',
                      description: `Tournament "${selected.name}" dan semua data terkait akan dihapus permanen.`,
                      onConfirm: () => deleteMutation.mutate(selected.id)
                    })} title="Hapus Tournament">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Step Progress Bar */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {STEPS.map((step, i) => (
                <div key={step.key} className="flex items-center shrink-0">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-medium transition-all
                    ${i < currentStepIdx ? 'bg-green-500/10 text-green-500' : i === currentStepIdx ? 'bg-idm-gold-warm/10 text-idm-gold-warm' : 'bg-muted/50 text-muted-foreground'}`}>
                    {i < currentStepIdx ? <Check className="w-2.5 h-2.5" /> : <span>{i + 1}</span>}
                    <span className="hidden sm:inline">{step.label}</span>
                  </div>
                  {i < STEPS.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground/30 mx-0.5" />}
                </div>
              ))}
            </div>

            <Separator />

            {/* ===== REGISTRATION PHASE ===== */}
            {(selected.status === 'setup' || selected.status === 'registration') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-blue-500">📋 Fase Registrasi</p>
                  {selected.status === 'setup' && (
                    <Button size="sm" variant="outline" className="text-[10px] h-7"
                      onClick={() => updateMutation.mutate({ id: selected.id, data: { status: 'registration' } })}>
                      <ArrowRight className="w-3 h-3 mr-1" /> Buka Registrasi
                    </Button>
                  )}
                </div>

                {selected.status === 'registration' && (
                  <>
                    {/* Bulk register */}
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="text-[10px] h-7"
                        disabled={unregistered.length === 0 || registerMutation.isPending}
                        onClick={() => setConfirmDialog({
                          open: true, title: 'Daftarkan Semua Player?',
                          description: `${unregistered.length} player akan didaftarkan ke tournament ini.`,
                          onConfirm: () => registerMutation.mutate({
                            id: selected.id,
                            data: { playerIds: unregistered.map((p: { id: string }) => p.id) }
                          })
                        })}>
                        {registerMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <UserPlus className="w-3 h-3 mr-1" />}
                        Daftarkan Semua ({unregistered.length})
                      </Button>
                      <span className="text-[10px] text-muted-foreground">
                        Terdaftar: {registeredIds.size} / Tersedia: {unregistered.length}
                      </span>
                    </div>

                    {/* Search */}
                    <Input placeholder="🔍 Cari player..." value={searchPlayer} onChange={e => setSearchPlayer(e.target.value)} className="h-8 text-xs" />

                    {/* Available players */}
                    <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                      {filteredUnregistered.slice(0, 20).map((p: { id: string; gamertag: string; name: string; tier: string; points: number }) => (
                        <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            <TierBadge tier={p.tier} />
                            <span className="text-xs font-medium">{p.gamertag}</span>
                            <span className="text-[10px] text-muted-foreground">{p.points}pts</span>
                          </div>
                          <Button size="sm" variant="ghost" className={`h-6 text-[10px] ${dt.neonText}`}
                            onClick={() => registerMutation.mutate({ id: selected.id, data: { playerId: p.id } })}>
                            <UserPlus className="w-3 h-3 mr-1" /> Daftar
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Already registered */}
                    {selected.participations?.length > 0 && (
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1">Terdaftar ({selected.participations.length}):</p>
                        <div className="flex flex-wrap gap-1">
                          {selected.participations.map((p: { id: string; playerId: string; player: { gamertag: string; tier: string }; status: string }) => (
                            <Badge key={p.id} className={`text-[9px] border-0 ${p.status === 'registered' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                              <TierBadge tier={p.player?.tier || 'B'} /> {p.player?.gamertag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Advance to approval */}
                    {selected.participations?.length > 0 && (
                      <Button size="sm" className="text-[10px] h-7 bg-idm-gold-warm hover:bg-idm-gold-warm/80 text-black"
                        onClick={() => updateMutation.mutate({ id: selected.id, data: { status: 'approval' } })}>
                        <ArrowRight className="w-3 h-3 mr-1" /> Lanjut ke Persetujuan
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ===== APPROVAL PHASE ===== */}
            {selected.status === 'approval' && (
              <div className="space-y-3">
                {/* Step indicator */}
                <div className="flex items-center gap-2">
                  <button
                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${approvalStep === 'approve' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-muted/50 text-muted-foreground'}`}
                    onClick={() => setApprovalStep('approve')}>
                    1️⃣ Persetujuan
                  </button>
                  <ArrowRight className="w-3 h-3 text-muted-foreground/30" />
                  <button
                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${approvalStep === 'prize' ? 'bg-idm-gold-warm/10 text-idm-gold-warm border border-idm-gold-warm/20' : 'bg-muted/50 text-muted-foreground'}`}
                    onClick={() => setApprovalStep('prize')}>
                    2️⃣ Hadiah
                  </button>
                  {approvedParticipations.length > 0 && (
                    <Badge className="text-[9px] border-0 bg-green-500/10 text-green-500 ml-auto">✅ {approvedParticipations.length} disetujui</Badge>
                  )}
                </div>

                {/* ===== STEP 1: APPROVE PARTICIPANTS ===== */}
                {approvalStep === 'approve' && (
                  <>
                    <p className="text-xs font-semibold text-yellow-500">⏳ Fase Persetujuan — Set Tier & Setujui Pemain</p>

                    {/* Tier distribution summary */}
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <span className="text-[10px]">Distribusi Tier:</span>
                      <Badge className="text-[9px] border-0 bg-red-500/10 text-red-500">S: {tierDist.S}</Badge>
                      <Badge className="text-[9px] border-0 bg-yellow-500/10 text-yellow-500">A: {tierDist.A}</Badge>
                      <Badge className="text-[9px] border-0 bg-blue-500/10 text-blue-500">B: {tierDist.B}</Badge>
                      {tierDist.S === tierDist.A && tierDist.A === tierDist.B && tierDist.S > 0 ? (
                        <Badge className="text-[9px] border-0 bg-green-500/10 text-green-500">✅ {tierDist.S} tim</Badge>
                      ) : (
                        <Badge className="text-[9px] border-0 bg-red-500/10 text-red-500">
                          ⚠️ Harus S=A=B (butuh {Math.max(tierDist.S, tierDist.A, tierDist.B) - tierDist.S} S, {Math.max(tierDist.S, tierDist.A, tierDist.B) - tierDist.A} A, {Math.max(tierDist.S, tierDist.A, tierDist.B) - tierDist.B} B lagi)
                        </Badge>
                      )}
                    </div>

                    {/* Pending approvals with tier override */}
                    <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                      {pendingApprovals.length === 0 && (
                        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 text-center">
                          <p className="text-[10px] text-green-500 font-medium">✅ Semua pemain sudah disetujui!</p>
                        </div>
                      )}
                      {pendingApprovals.map((p: { id: string; playerId: string; player: { id: string; gamertag: string; tier: string; points: number } }) => (
                        <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                          <div className="flex items-center gap-2">
                            <TierBadge tier={tierOverrides[p.playerId] || p.player.tier} />
                            <span className="text-xs font-medium">{p.player.gamertag}</span>
                            <span className="text-[10px] text-muted-foreground">({p.player.tier}) {p.player.points}pts</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Select value={tierOverrides[p.playerId] || p.player.tier}
                              onValueChange={v => setTierOverrides(prev => ({ ...prev, [p.playerId]: v }))}>
                              <SelectTrigger className="w-16 h-6 text-[10px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="S">S</SelectItem>
                                <SelectItem value="A">A</SelectItem>
                                <SelectItem value="B">B</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button size="sm" variant="ghost" className="h-6 text-[10px] text-green-500 hover:text-green-400"
                              onClick={() => approveMutation.mutate({
                                id: selected.id,
                                data: { playerId: p.playerId, tier: tierOverrides[p.playerId] || p.player.tier, approve: true }
                              })}>
                              <Check className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bulk approve */}
                    {pendingApprovals.length > 0 && (
                      <Button size="sm" variant="outline" className="text-[10px] h-7"
                        disabled={approveMutation.isPending}
                        onClick={() => approveMutation.mutate({
                          id: selected.id,
                          data: {
                            approvals: pendingApprovals.map((p: { playerId: string; player: { tier: string } }) => ({
                              playerId: p.playerId,
                              tier: tierOverrides[p.playerId] || p.player.tier,
                              approve: true
                            }))
                          }
                        })}>
                        {approveMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Check className="w-3 h-3 mr-1" />}
                        Setujui Semua ({pendingApprovals.length})
                      </Button>
                    )}

                    {/* Next step button — always available when at least 1 approved */}
                    {approvedParticipations.length > 0 && (
                      <Button size="sm" className="text-[10px] h-7 bg-idm-gold-warm hover:bg-idm-gold-warm/80 text-black"
                        onClick={() => setApprovalStep('prize')}>
                        Lanjut ke Hadiah →
                      </Button>
                    )}
                    {pendingApprovals.length > 0 && approvedParticipations.length > 0 && (
                      <p className="text-[9px] text-muted-foreground">💡 Masih ada peserta yang belum disetujui, tapi Anda sudah bisa lanjut ke pembagian hadiah.</p>
                    )}

                    {/* Generate Tim — always active when at least 1 approved */}
                    {approvedParticipations.length > 0 && (
                      <Button size="sm" className="text-[10px] h-7 bg-green-600 hover:bg-green-700 text-white"
                        disabled={generateTeamsMutation.isPending}
                        onClick={() => setConfirmDialog({
                          open: true, title: 'Generate Tim?',
                          description: `${approvedParticipations.length} player akan dibagi menjadi tim (1S+1A+1B). Total harus habis dibagi 3.`,
                          onConfirm: async () => {
                            // Save prize pool if set
                            const pool = parseInt(manualPrizePool) || 0;
                            if (pool > 0 || (wantsManualPrize && prizes.some(p => p.prizeAmount > 0))) {
                              await fetch(`/api/tournaments/${selected.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  prizePool: pool,
                                  prizes: wantsManualPrize ? prizes.filter(p => p.label && p.prizeAmount > 0).map(p => ({
                                    ...p,
                                    recipientCount: p.isMvp || p.label.toLowerCase().includes('mvp') ? 1 : 3
                                  })) : []
                                })
                              });
                            }
                            generateTeamsMutation.mutate(selected.id);
                          }
                        })}>
                        {generateTeamsMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Users className="w-3 h-3 mr-1" />}
                        Generate Tim
                      </Button>
                    )}
                  </>
                )}

                {/* ===== STEP 2: PRIZE DISTRIBUTION ===== */}
                {approvalStep === 'prize' && (
                  <>
                    <p className="text-xs font-semibold text-idm-gold-warm">💰 Pembagian Hadiah</p>

                    {/* Reference Prize Pool Info (display only) */}
                    <div className="p-3 rounded-lg bg-idm-gold-warm/5 border border-idm-gold-warm/20">
                      <p className="text-[10px] font-semibold text-idm-gold-warm mb-1.5">📋 Info Prize Pool (Referensi)</p>
                      <div className="space-y-0.5 text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">├─ Dari Pendaftaran:</span>
                          <span>{approvedParticipations.length} × Rp 20.000 = {formatCurrency(approvedParticipations.length * 20000)}</span>
                        </div>
                        {approvedSawer > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">├─ Dari Sawer:</span>
                            <span>{formatCurrency(approvedSawer)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-idm-gold-warm border-t border-idm-gold-warm/10 pt-1 mt-1">
                          <span>└─ Total Referensi:</span>
                          <span>{formatCurrency(referencePrizePool)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Manual Prize Pool Input */}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-semibold">💰 Total Prize Pool</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          placeholder={String(referencePrizePool)}
                          value={manualPrizePool}
                          onChange={e => setManualPrizePool(e.target.value)}
                          className="h-7 text-[10px] flex-1"
                        />
                        {manualPrizePool && parseInt(manualPrizePool) !== referencePrizePool && (
                          <span className={`text-[9px] font-medium ${parseInt(manualPrizePool) > referencePrizePool ? 'text-green-500' : 'text-red-500'}`}>
                            {parseInt(manualPrizePool) > referencePrizePool ? '+' : ''}{formatCurrency(parseInt(manualPrizePool) - referencePrizePool)} dari referensi
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-muted-foreground">💡 Isi sesuai kebutuhan. Jika kosong, menggunakan nilai referensi ({formatCurrency(referencePrizePool)}).</p>
                    </div>

                    {/* Manual prize distribution toggle */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="manualPrize"
                        checked={wantsManualPrize}
                        onChange={e => {
                          setWantsManualPrize(e.target.checked);
                          setShowPrizeConfig(e.target.checked);
                        }}
                        className="rounded border-muted-foreground/30"
                      />
                      <label htmlFor="manualPrize" className="text-[10px] font-medium cursor-pointer">
                        ☑️ Saya ingin atur pembagian hadiah manual
                      </label>
                    </div>

                    {/* Prize inputs (only when manual config is toggled) */}
                    {showPrizeConfig && wantsManualPrize && (
                      <div className="space-y-2 pt-2 border-t border-border/20">
                        <p className="text-[10px] text-muted-foreground">
                          Pembagian Hadiah — Juara 1/2/3: Rp / 1000 / 3 = pts/org | MVP: Rp / 1000 / 1 = pts
                        </p>
                        {prizes.map((prize, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Input placeholder="Label" value={prize.label} className="h-7 text-[10px] flex-1"
                              onChange={e => setPrizes(prev => prev.map((p, j) => j === i ? { ...p, label: e.target.value, isMvp: e.target.value.toLowerCase().includes('mvp') } : p))} />
                            <Input placeholder="Hadiah (Rp)" type="number" value={prize.prizeAmount || ''} className="h-7 text-[10px] w-28"
                              onChange={e => setPrizes(prev => prev.map((p, j) => j === i ? { ...p, prizeAmount: parseInt(e.target.value) || 0 } : p))} />
                            <span className="text-[10px] text-muted-foreground w-12 text-center">
                              {prize.isMvp || prize.label.toLowerCase().includes('mvp') ? '÷ 1' : '÷ 3'}
                            </span>
                            <span className="text-[9px] font-medium text-idm-gold-warm w-16">
                              = {Math.floor((prize.prizeAmount / 1000) / (prize.isMvp || prize.label.toLowerCase().includes('mvp') ? 1 : 3))} pts{prize.isMvp || prize.label.toLowerCase().includes('mvp') ? '' : '/org'}
                            </span>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 touch-icon text-red-500"
                              onClick={() => setPrizes(prev => prev.filter((_, j) => j !== i))}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        <Button size="sm" variant="outline" className="text-[10px] h-7"
                          onClick={() => setPrizes(prev => [...prev, { label: '', position: prev.length + 1, prizeAmount: 0, recipientCount: 3, isMvp: false }])}>
                          <Plus className="w-3 h-3 mr-1" /> Tambah Hadiah
                        </Button>

                        {/* Prize Distribution Summary */}
                        {(() => {
                          const totalUsed = prizes.reduce((sum, p) => sum + p.prizeAmount, 0);
                          const effectivePool = parseInt(manualPrizePool) || referencePrizePool;
                          return (
                            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-[10px]">
                              <span>Total Terpakai:</span>
                              <span className={totalUsed === effectivePool ? 'text-green-500 font-semibold' : totalUsed > effectivePool ? 'text-red-500' : 'text-yellow-500'}>
                                {formatCurrency(totalUsed)} / {formatCurrency(effectivePool)}
                                {totalUsed !== effectivePool && (
                                  <span className="ml-1">
                                    ({totalUsed > effectivePool ? 'kelebihan' : 'kurang'} {formatCurrency(Math.abs(totalUsed - effectivePool))})
                                  </span>
                                )}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Generate Tim button — always active */}
                    {approvedParticipations.length > 0 && (
                      <Button size="sm" className="text-[10px] h-7 bg-idm-gold-warm hover:bg-idm-gold-warm/80 text-black"
                        disabled={generateTeamsMutation.isPending}
                        onClick={() => setConfirmDialog({
                          open: true, title: 'Generate Tim?',
                          description: `${approvedParticipations.length} player akan dibagi menjadi tim (1S+1A+1B). Total harus habis dibagi 3. Hadiah akan disimpan.`,
                          onConfirm: async () => {
                            const pool = parseInt(manualPrizePool) || referencePrizePool;
                            // Save prizes and prize pool
                            await fetch(`/api/tournaments/${selected.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                prizePool: pool,
                                prizes: wantsManualPrize ? prizes.filter(p => p.label && p.prizeAmount > 0).map(p => ({
                                  ...p,
                                  recipientCount: p.isMvp || p.label.toLowerCase().includes('mvp') ? 1 : 3
                                })) : []
                              })
                            });
                            generateTeamsMutation.mutate(selected.id);
                          }
                        })}>
                        {generateTeamsMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Users className="w-3 h-3 mr-1" />}
                        Generate Tim
                      </Button>
                    )}

                    {/* Back to approval step */}
                    <Button size="sm" variant="ghost" className="text-[10px] h-7"
                      onClick={() => setApprovalStep('approve')}>
                      <ChevronLeft className="w-3 h-3 mr-1" /> Kembali ke Persetujuan
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* ===== TEAM GENERATION ===== */}
            {(selected.status === 'team_generation' || (selected.status === 'approval' && selected.teams?.length > 0)) && selected.teams?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-green-500">✅ Tim ({selected.teams.length})</p>
                  {selected.status === 'team_generation' && (
                    <Button size="sm" variant="outline" className="text-[10px] h-7"
                      disabled={generateTeamsMutation.isPending}
                      onClick={() => setConfirmDialog({
                        open: true, title: 'Re-generate Tim?',
                        description: 'Tim yang ada akan dihapus dan dibuat ulang secara random.',
                        onConfirm: () => generateTeamsMutation.mutate(selected.id)
                      })}>
                      <RefreshCw className="w-3 h-3 mr-1" /> Re-generate
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selected.teams.map((t: { id: string; name: string; power: number; isWinner: boolean; rank: number | null; teamPlayers: { player: { gamertag: string; tier: string; points: number } }[] }) => (
                    <div key={t.id} className={`p-2.5 rounded-lg text-xs ${t.isWinner ? 'bg-idm-gold-warm/5 border border-idm-gold-warm/20' : t.rank ? 'bg-muted/50 border border-border/30' : 'bg-muted/30'}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold">{t.name} {t.isWinner && '👑'} {t.rank === 2 && '🥈'} {t.rank === 3 && '🥉'}</span>
                        <span className={dt.neonText}>⚡ {t.power}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {t.teamPlayers.map((tp: { player: { gamertag: string; tier: string } }) => (
                          <span key={tp.player.gamertag} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50">
                            <TierBadge tier={tp.player.tier}  /> {tp.player.gamertag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Advance to bracket */}
                {selected.status === 'team_generation' && (
                  <Button size="sm" className="text-[10px] h-7 bg-idm-gold-warm hover:bg-idm-gold-warm/80 text-black"
                    onClick={() => setConfirmDialog({
                      open: true, title: 'Generate Bracket?',
                      description: `Bracket akan di-generate untuk ${selected.teams.length} tim dengan format ${FORMAT_LABELS[selected.format]}.`,
                      onConfirm: () => generateBracketMutation.mutate(selected.id)
                    })}>
                    <Zap className="w-3 h-3 mr-1" /> Generate Bracket
                  </Button>
                )}
              </div>
            )}

            {/* ===== PRIZE EDITING (available in later phases) ===== */}
            {['team_generation', 'bracket_generation', 'main_event', 'finalization'].includes(selected.status) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold flex items-center gap-1.5">
                    <Gift className="w-3 h-3 text-idm-gold-warm" /> Pembagian Hadiah
                  </p>
                  <Button size="sm" variant="ghost" className="text-[10px] h-6"
                    onClick={() => setShowPrizeConfig(!showPrizeConfig)}>
                    {showPrizeConfig ? 'Sembunyikan' : 'Edit Hadiah'}
                  </Button>
                </div>
                {/* Reference pool display + current prize pool */}
                <div className="p-2.5 rounded-lg bg-idm-gold-warm/5 border border-idm-gold-warm/20 text-[10px]">
                  <p className="font-semibold text-idm-gold-warm mb-1">📋 Info Prize Pool (Referensi)</p>
                  <div className="flex justify-between"><span>Dari Pendaftaran:</span><span>{approvedParticipations.length} × Rp 20.000 = {formatCurrency(approvedParticipations.length * 20000)}</span></div>
                  {approvedSawer > 0 && <div className="flex justify-between"><span>Dari Sawer:</span><span>{formatCurrency(approvedSawer)}</span></div>}
                  <div className="flex justify-between font-semibold text-idm-gold-warm border-t border-idm-gold-warm/10 pt-1 mt-1"><span>Total Referensi:</span><span>{formatCurrency(referencePrizePool)}</span></div>
                  {selected.prizePool > 0 && selected.prizePool !== referencePrizePool && (
                    <div className="flex justify-between mt-1 pt-1 border-t border-idm-gold-warm/10">
                      <span>Prize Pool Aktif:</span>
                      <span className="font-semibold">{formatCurrency(selected.prizePool)}</span>
                    </div>
                  )}
                </div>
                {showPrizeConfig && (
                  <div className="space-y-2 pt-2 border-t border-border/20">
                    {/* Manual Prize Pool Input */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-semibold">💰 Total Prize Pool</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          placeholder={String(referencePrizePool)}
                          value={manualPrizePool}
                          onChange={e => setManualPrizePool(e.target.value)}
                          className="h-7 text-[10px] flex-1"
                        />
                        {manualPrizePool && parseInt(manualPrizePool) !== referencePrizePool && (
                          <span className={`text-[9px] font-medium ${parseInt(manualPrizePool) > referencePrizePool ? 'text-green-500' : 'text-red-500'}`}>
                            {parseInt(manualPrizePool) > referencePrizePool ? '+' : ''}{formatCurrency(parseInt(manualPrizePool) - referencePrizePool)} dari referensi
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-muted-foreground">💡 Isi sesuai kebutuhan. Jika kosong, menggunakan nilai referensi ({formatCurrency(referencePrizePool)}).</p>
                    </div>

                    {/* Manual prize distribution toggle */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="manualPrizeLater"
                        checked={wantsManualPrize}
                        onChange={e => {
                          setWantsManualPrize(e.target.checked);
                          if (!e.target.checked) setShowPrizeConfig(false);
                        }}
                        className="rounded border-muted-foreground/30"
                      />
                      <label htmlFor="manualPrizeLater" className="text-[10px] font-medium cursor-pointer">
                        ☑️ Saya ingin atur pembagian hadiah manual
                      </label>
                    </div>

                    {wantsManualPrize && (
                      <>
                        <p className="text-[10px] text-muted-foreground">
                          Pembagian Hadiah — Juara 1/2/3: Rp / 1000 / 3 = pts/org | MVP: Rp / 1000 / 1 = pts
                        </p>
                        {prizes.map((prize, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Input placeholder="Label" value={prize.label} className="h-7 text-[10px] flex-1"
                              onChange={e => setPrizes(prev => prev.map((p, j) => j === i ? { ...p, label: e.target.value, isMvp: e.target.value.toLowerCase().includes('mvp') } : p))} />
                            <Input placeholder="Hadiah (Rp)" type="number" value={prize.prizeAmount || ''} className="h-7 text-[10px] w-28"
                              onChange={e => setPrizes(prev => prev.map((p, j) => j === i ? { ...p, prizeAmount: parseInt(e.target.value) || 0 } : p))} />
                            <span className="text-[10px] text-muted-foreground w-12 text-center">
                              {prize.isMvp || prize.label.toLowerCase().includes('mvp') ? '÷ 1' : '÷ 3'}
                            </span>
                            <span className="text-[9px] font-medium text-idm-gold-warm w-16">
                              = {Math.floor((prize.prizeAmount / 1000) / (prize.isMvp || prize.label.toLowerCase().includes('mvp') ? 1 : 3))} pts{prize.isMvp || prize.label.toLowerCase().includes('mvp') ? '' : '/org'}
                            </span>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 touch-icon text-red-500"
                              onClick={() => setPrizes(prev => prev.filter((_, j) => j !== i))}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="text-[10px] h-7"
                            onClick={() => setPrizes(prev => [...prev, { label: '', position: prev.length + 1, prizeAmount: 0, recipientCount: 3, isMvp: false }])}>
                            <Plus className="w-3 h-3 mr-1" /> Tambah Hadiah
                          </Button>
                          <Button size="sm" variant="outline" className="text-[10px] h-7 text-idm-gold-warm"
                            disabled={updateMutation.isPending}
                            onClick={async () => {
                              const pool = parseInt(manualPrizePool) || referencePrizePool;
                              await fetch(`/api/tournaments/${selected.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  prizePool: pool,
                                  prizes: prizes.filter(p => p.label && p.prizeAmount > 0).map(p => ({
                                    ...p,
                                    recipientCount: p.isMvp || p.label.toLowerCase().includes('mvp') ? 1 : 3
                                  }))
                                })
                              });
                              qc.invalidateQueries({ queryKey: ['admin-tournament', selectedId] });
                              toast.success('Hadiah berhasil disimpan!');
                            }}>
                            {updateMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Check className="w-3 h-3 mr-1" />}
                            Simpan Hadiah
                          </Button>
                        </div>
                        {/* Prize Distribution Summary */}
                        {(() => {
                          const totalUsed = prizes.reduce((sum, p) => sum + p.prizeAmount, 0);
                          const effectivePool = parseInt(manualPrizePool) || referencePrizePool;
                          return (
                            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-[10px]">
                              <span>Total Terpakai:</span>
                              <span className={totalUsed === effectivePool ? 'text-green-500 font-semibold' : totalUsed > effectivePool ? 'text-red-500' : 'text-yellow-500'}>
                                {formatCurrency(totalUsed)} / {formatCurrency(effectivePool)}
                                {totalUsed !== effectivePool && (
                                  <span className="ml-1">
                                    ({totalUsed > effectivePool ? 'kelebihan' : 'kurang'} {formatCurrency(Math.abs(totalUsed - effectivePool))})
                                  </span>
                                )}
                              </span>
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ===== BRACKET / MATCHES ===== */}
            {(selected.status === 'bracket_generation' || selected.status === 'main_event' || selected.status === 'finalization') && selected.matches?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-purple-500">🏆 Bracket & Pertandingan</p>
                  {selected.status === 'bracket_generation' && (
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" className="text-[10px] h-7"
                        disabled={generateBracketMutation.isPending}
                        onClick={() => setConfirmDialog({
                          open: true, title: 'Re-generate Bracket?',
                          description: 'Semua match akan dihapus dan dibuat ulang.',
                          onConfirm: () => generateBracketMutation.mutate(selected.id)
                        })}>
                        <RefreshCw className="w-3 h-3 mr-1" /> Re-generate
                      </Button>
                      <Button size="sm" className="text-[10px] h-7 bg-idm-gold-warm hover:bg-idm-gold-warm/80 text-black"
                        onClick={() => updateMutation.mutate({ id: selected.id, data: { status: 'main_event' } })}>
                        <Play className="w-3 h-3 mr-1" /> Mulai Event!
                      </Button>
                    </div>
                  )}
                </div>

                {/* Next match indicator */}
                {nextMatch && selected.status === 'main_event' && (
                  <div className="p-2 rounded-lg bg-idm-gold-warm/5 border border-idm-gold-warm/20">
                    <p className="text-[10px] text-idm-gold-warm font-semibold">▶️ Match Selanjutnya: {getTeamName(nextMatch.team1Id)} vs {getTeamName(nextMatch.team2Id)}</p>
                  </div>
                )}

                {/* Matches by bracket */}
                {Object.entries(matchesByBracket).map(([bracket, matches]) => (
                  <div key={bracket}>
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{BRACKET_LABELS[bracket] || bracket}</p>
                    <div className="space-y-1.5">
                      {matches.sort((a: { round: number; matchNumber: number }, b: { round: number; matchNumber: number }) => a.round - b.round || a.matchNumber - b.matchNumber).map((m: {
                        id: string; round: number; matchNumber: number; bracket: string; format: string;
                        team1Id: string | null; team2Id: string | null; score1: number | null; score2: number | null;
                        status: string; winnerId: string | null; loserId: string | null; mvpPlayerId: string | null;
                        team1: { name: string; teamPlayers: { player: { gamertag: string; tier: string } }[] } | null;
                        team2: { name: string; teamPlayers: { player: { gamertag: string; tier: string } }[] } | null;
                        winner: { name: string } | null; mvpPlayer: { gamertag: string } | null;
                      }) => (
                        <div key={m.id} className={`p-2.5 rounded-lg border text-xs
                          ${m.status === 'completed' ? 'bg-muted/30 border-border/20' :
                            m.status === 'live' ? 'bg-red-500/5 border-red-500/20' :
                            m.status === 'ready' ? 'bg-green-500/5 border-green-500/20' :
                            'bg-muted/20 border-border/10'}`}>

                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <Badge className="text-[8px] border-0 bg-muted/50">R{m.round}M{m.matchNumber}</Badge>
                              <Badge className="text-[8px] border-0 bg-muted/50">{m.format}</Badge>
                              {m.status === 'live' && <Badge className="text-[8px] border-0 bg-red-500/10 text-red-500 animate-pulse">🔴 LIVE</Badge>}
                              {m.status === 'completed' && <Badge className="text-[8px] border-0 bg-green-500/10 text-green-500">✅ Selesai</Badge>}
                              {m.status === 'ready' && <Badge className="text-[8px] border-0 bg-green-500/10 text-green-500">Siap</Badge>}
                              {m.status === 'pending' && <Badge className="text-[8px] border-0 bg-muted/50 text-muted-foreground">Menunggu</Badge>}
                            </div>
                            {m.winner && <span className="text-idm-gold-warm font-semibold">👑 {m.winner.name}</span>}
                          </div>

                          {/* Team names */}
                          <div className="flex items-center gap-2">
                            <div className={`flex-1 ${m.winnerId === m.team1Id ? 'font-bold text-idm-gold-warm' : ''}`}>
                              {getTeamName(m.team1Id)}
                              {m.team1 && <span className="text-[9px] text-muted-foreground ml-1">({m.team1.teamPlayers.map((tp: { player: { gamertag: string } }) => tp.player.gamertag).join(', ')})</span>}
                            </div>
                            {m.status === 'completed' && m.score1 !== null && m.score2 !== null ? (
                              <span className="font-mono font-bold">{m.score1} - {m.score2}</span>
                            ) : <span className="text-muted-foreground">vs</span>}
                            <div className={`flex-1 text-right ${m.winnerId === m.team2Id ? 'font-bold text-idm-gold-warm' : ''}`}>
                              {getTeamName(m.team2Id)}
                              {m.team2 && <span className="text-[9px] text-muted-foreground ml-1">({m.team2.teamPlayers.map((tp: { player: { gamertag: string } }) => tp.player.gamertag).join(', ')})</span>}
                            </div>
                          </div>

                          {m.mvpPlayer && <p className="text-[9px] text-idm-gold-warm mt-1">⭐ MVP: {m.mvpPlayer.gamertag}</p>}

                          {/* Actions */}
                          {selected.status === 'main_event' && m.team1Id && m.team2Id && m.status !== 'completed' && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/10">
                              {(m.status === 'ready' || m.status === 'pending') && (
                                <Button size="sm" className="text-[10px] h-6 bg-green-600 hover:bg-green-700 text-white"
                                  disabled={startMatchMutation.isPending}
                                  onClick={() => startMatchMutation.mutate({ tournamentId: selected.id, matchId: m.id })}>
                                  <Play className="w-3 h-3 mr-1" /> Start
                                </Button>
                              )}
                              {m.status === 'live' && (
                                <>
                                  <Input type="number" min="0" placeholder={getTeamName(m.team1Id)} className="w-16 h-6 text-[10px]"
                                    value={scoreInputs[m.id]?.s1 || ''}
                                    onChange={e => setScoreInputs(prev => ({ ...prev, [m.id]: { ...prev[m.id], s1: e.target.value, s2: prev[m.id]?.s2 || '' } }))} />
                                  <span className="text-[10px] text-muted-foreground">vs</span>
                                  <Input type="number" min="0" placeholder={getTeamName(m.team2Id)} className="w-16 h-6 text-[10px]"
                                    value={scoreInputs[m.id]?.s2 || ''}
                                    onChange={e => setScoreInputs(prev => ({ ...prev, [m.id]: { ...prev[m.id], s2: e.target.value, s1: prev[m.id]?.s1 || '' } }))} />
                                  <Button size="sm" className="text-[10px] h-6 bg-idm-gold-warm hover:bg-idm-gold-warm/80 text-black"
                                    disabled={!scoreInputs[m.id]?.s1 || !scoreInputs[m.id]?.s2 || scoreMutation.isPending}
                                    onClick={() => {
                                      const s1 = parseInt(scoreInputs[m.id].s1);
                                      const s2 = parseInt(scoreInputs[m.id].s2);
                                      const isGroupBracket = m.bracket === 'group';
                                      if (s1 === s2 && !isGroupBracket) { toast.error('Skor tidak boleh seri di bracket eliminasi!'); return; }
                                      setConfirmDialog({
                                        open: true, title: 'Konfirmasi Skor?',
                                        description: `${getTeamName(m.team1Id)} ${s1} - ${s2} ${getTeamName(m.team2Id)}${s1 === s2 ? ' (Seri)' : ''}`,
                                        onConfirm: () => scoreMutation.mutate({ tournamentId: selected.id, matchId: m.id, score1: s1, score2: s2 })
                                      });
                                    }}>
                                    {scoreMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Check className="w-3 h-3 mr-1" />} Submit
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Completed matches count */}
                <p className="text-[10px] text-muted-foreground text-center">
                  {selected.matches.filter((m: { status: string }) => m.status === 'completed').length} / {selected.matches.length} match selesai
                </p>
              </div>
            )}

            {/* ===== FINALIZATION ===== */}
            {selected.status === 'finalization' && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-idm-gold-warm">🏆 Fase Finalisasi — Pilih MVP & Konfirmasi</p>

                {/* Prize Summary (from approval phase) */}
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground">Pembagian Hadiah (dari fase persetujuan):</p>
                  {selected.prizes?.length > 0 ? (
                    selected.prizes.map((p: { id: string; label: string; prizeAmount: number; pointsPerPlayer: number; recipientCount: number }) => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-[10px]">
                        <span className="font-medium">{p.label}</span>
                        <span className="text-idm-gold-warm">
                          {formatCurrency(p.prizeAmount)} → {p.pointsPerPlayer} pts{p.recipientCount > 1 ? `/org × ${p.recipientCount}` : ''}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-yellow-500">⚠️ Belum ada pembagian hadiah. Anda masih bisa finalisasi, hadiah bisa ditambahkan nanti.</p>
                  )}
                </div>

                {/* MVP Selection */}
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground">Pilih MVP Tournament</p>
                  <Select value={selectedMvp} onValueChange={setSelectedMvp}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Pilih MVP..." /></SelectTrigger>
                    <SelectContent>
                      {selected.participations?.map((p: { playerId: string; pointsEarned: number; player: { id: string; gamertag: string } }) => (
                        <SelectItem key={p.playerId} value={p.playerId}>
                          {p.player.gamertag} ({p.pointsEarned}pts)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Finalize button */}
                <Button size="sm" className="text-[10px] h-8 bg-idm-gold-warm hover:bg-idm-gold-warm/80 text-black w-full"
                  disabled={finalizeMutation.isPending}
                  onClick={() => setConfirmDialog({
                    open: true, title: 'Finalisasi Tournament?',
                    description: 'Hadiah akan didistribusikan ke pemain. Tournament akan ditandai selesai. Tindakan ini tidak dapat dibatalkan.',
                    onConfirm: () => finalizeMutation.mutate({
                      id: selected.id,
                      data: { mvpPlayerId: selectedMvp || undefined }
                    })
                  })}>
                  {finalizeMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Crown className="w-3 h-3 mr-1" />}
                  Finalisasi Tournament
                </Button>
              </div>
            )}

            {/* ===== COMPLETED ===== */}
            {selected.status === 'completed' && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-green-500">🎉 Tournament Selesai!</p>

                {/* Champion / Runner-up / 3rd place */}
                {selected.teams?.filter((t: { rank: number | null }) => t.rank).sort((a: { rank: number }, b: { rank: number }) => (a.rank || 99) - (b.rank || 99)).map((t: { id: string; name: string; rank: number | null; isWinner: boolean; teamPlayers: { player: { gamertag: string; tier: string } }[] }) => (
                  <div key={t.id} className={`p-3 rounded-lg border ${t.rank === 1 ? 'bg-idm-gold-warm/5 border-idm-gold-warm/20' : t.rank === 2 ? 'bg-gray-500/5 border-gray-500/20' : 'bg-orange-500/5 border-orange-500/20'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{t.rank === 1 ? '🥇' : t.rank === 2 ? '🥈' : '🥉'}</span>
                      <div>
                        <p className="text-xs font-semibold">{t.name}</p>
                        <div className="flex gap-1 mt-0.5">
                          {t.teamPlayers.map((tp: { player: { gamertag: string; tier: string } }) => (
                            <span key={tp.player.gamertag} className="flex items-center gap-0.5 text-[9px]">
                              <TierBadge tier={tp.player.tier}  /> {tp.player.gamertag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* MVP */}
                {selected.matches?.map((m: { mvpPlayer: { gamertag: string } | null }) => m.mvpPlayer).filter(Boolean).length > 0 && (
                  <div className="p-2 rounded-lg bg-idm-gold-warm/5 border border-idm-gold-warm/20">
                    <p className="text-[10px] text-idm-gold-warm">⭐ MVP: {selected.matches.find((m: { mvpPlayer: { gamertag: string } | null }) => m.mvpPlayer)?.mvpPlayer?.gamertag}</p>
                  </div>
                )}

                {/* Prizes */}
                {selected.prizes?.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">Distribusi Hadiah:</p>
                    {selected.prizes.map((p: { id: string; label: string; prizeAmount: number; pointsPerPlayer: number; recipientCount: number }) => (
                      <div key={p.id} className="flex items-center justify-between text-[10px] p-1.5 rounded bg-muted/30">
                        <span>{p.label}</span>
                        <span>{formatCurrency(p.prizeAmount)} → {p.pointsPerPlayer} pts/org × {p.recipientCount} penerima</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Points earned */}
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground">Poin yang Didapat:</p>
                  <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-0.5">
                    {selected.participations?.sort((a: { pointsEarned: number }, b: { pointsEarned: number }) => b.pointsEarned - a.pointsEarned).map((p: { id: string; playerId: string; pointsEarned: number; isMvp: boolean; isWinner: boolean; player: { gamertag: string } }) => (
                      <div key={p.id} className="flex items-center justify-between text-[10px] p-1 rounded bg-muted/20">
                        <span>{p.player.gamertag} {p.isMvp && '⭐'} {p.isWinner && '👑'}</span>
                        <span className="font-mono">{p.pointsEarned} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {/* ===== EDIT TOURNAMENT DIALOG ===== */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-idm-gold-warm" />
              Edit Tournament
            </DialogTitle>
            <DialogDescription>
              Ubah informasi tournament seperti nama, format, jadwal, dan lokasi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nama Tournament</Label>
                <Input
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nama Tournament"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Week #</Label>
                <Input
                  type="number"
                  value={editForm.weekNumber}
                  onChange={e => setEditForm(f => ({ ...f, weekNumber: e.target.value }))}
                  placeholder="Week #"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Format</Label>
                <Select value={editForm.format} onValueChange={v => setEditForm(f => ({ ...f, format: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_elimination">Single Elimination</SelectItem>
                    <SelectItem value="double_elimination">Double Elimination</SelectItem>
                    <SelectItem value="group_stage">Group Stage + Playoff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Match Format</Label>
                <Select value={editForm.defaultMatchFormat} onValueChange={v => setEditForm(f => ({ ...f, defaultMatchFormat: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BO1">BO1</SelectItem>
                    <SelectItem value="BO3">BO3</SelectItem>
                    <SelectItem value="BO5">BO5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Prize Pool (IDR)</Label>
                <Input
                  type="number"
                  value={editForm.prizePool}
                  onChange={e => setEditForm(f => ({ ...f, prizePool: e.target.value }))}
                  placeholder="Prize Pool"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">BPM</Label>
                <Input
                  value={editForm.bpm}
                  onChange={e => setEditForm(f => ({ ...f, bpm: e.target.value }))}
                  placeholder="BPM (contoh: 128 atau Random 120-140)"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> Lokasi</Label>
              <Input
                value={editForm.location}
                onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                placeholder="Lokasi (contoh: Online, GOR XYZ)"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> Jadwal</Label>
              <Input
                type="datetime-local"
                value={editForm.scheduledAt}
                onChange={e => setEditForm(f => ({ ...f, scheduledAt: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
            <div className="p-2 rounded-lg bg-muted/30 text-[10px] text-muted-foreground">
              <p>💡 Perubahan format dan jadwal akan langsung berlaku. Untuk tournament yang sudah berjalan, perubahan hanya mempengaruhi informasi tampilan.</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(false)} className="text-xs">
              Batal
            </Button>
            <Button
              size="sm"
              disabled={!editForm.name || editMutation.isPending}
              onClick={() => editMutation.mutate({
                id: editForm.id,
                name: editForm.name,
                weekNumber: parseInt(editForm.weekNumber) || undefined,
                format: editForm.format,
                defaultMatchFormat: editForm.defaultMatchFormat,
                prizePool: parseInt(editForm.prizePool) || 0,
                bpm: editForm.bpm || undefined,
                location: editForm.location,
                scheduledAt: editForm.scheduledAt || undefined,
              })}
              className="text-xs bg-idm-gold-warm hover:bg-idm-gold-warm/80 text-black"
            >
              {editMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Check className="w-3 h-3 mr-1" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
