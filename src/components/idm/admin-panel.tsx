'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Shield, Users, Music, Trophy, Gift, Plus,
  Crown, Settings, UserPlus, X, Loader2, Clock, MapPin, Phone, Globe, BarChart3, Camera, Pencil, Trash2, Search,
  LayoutDashboard, Building2, Award, Sliders, Flame, Calendar, CheckCircle2, XCircle, Wallet, Save, UserCog
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { TierBadge } from './tier-badge';
import { CmsPanel } from './cms-panel';
import { TournamentManager } from './tournament-manager';
import { RankingPanel } from './ranking-panel';
import { ClubManagement } from './club-management';
import { CloudinaryPicker } from './cloudinary-picker';
import { AdminOverview } from './admin-overview';
import { AdminSponsorPanel } from './admin-sponsor-panel';
import { AdminAchievementPanel } from './admin-achievement-panel';
import { AdminSettingsPanel } from './admin-settings-panel';
import { AdminManagement } from './admin-management';
import { AdminSeasonPanel } from './admin-season-panel';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDivisionTheme } from '@/hooks/use-division-theme';
import { formatCurrency, getAvatarUrl } from '@/lib/utils';
import { container, item } from '@/lib/animations';

// Player form type
interface PlayerForm {
  name: string;
  gamertag: string;
  tier: string;
  division: string;
  city: string;
  phone: string;
  joki: string;
  points: string;
  clubId: string;
}

const emptyForm: PlayerForm = {
  name: '',
  gamertag: '',
  tier: 'B',
  division: 'male',
  city: '',
  phone: '',
  joki: '',
  points: '0',
  clubId: '_none',
};

export function AdminPanel() {
  const { division: storeDivision } = useAppStore();
  const dt = useDivisionTheme();
  const qc = useQueryClient();

  const { data: players } = useQuery({
    queryKey: ['admin-players', storeDivision],
    queryFn: async () => { const res = await fetch(`/api/players?division=${storeDivision}`); return res.json(); },
  });

  const { data: stats } = useQuery({
    queryKey: ['stats', storeDivision],
    queryFn: async () => { const res = await fetch(`/api/stats?division=${storeDivision}`); return res.json(); },
  });

  const { data: donations } = useQuery({
    queryKey: ['admin-donations', storeDivision],
    queryFn: async () => { const res = await fetch(`/api/donations?status=all`); return res.json(); },
  });

  const { data: cmsSettings } = useQuery({
    queryKey: ['admin-cms-settings'],
    queryFn: async () => { const res = await fetch('/api/cms/settings', { credentials: 'include' }); const d = await res.json(); return (d?.map || {}) as Record<string, string>; },
  });

  // Get clubs for dropdown — use seasonForClubs (the season with actual club data)
  const clubsSeasonId = stats?.seasonForClubs?.id || stats?.season?.id;
  const { data: clubs } = useQuery({
    queryKey: ['admin-clubs', clubsSeasonId],
    queryFn: async () => {
      if (!clubsSeasonId) return [];
      const res = await fetch(`/api/clubs?seasonId=${clubsSeasonId}`);
      return res.json();
    },
    enabled: !!clubsSeasonId,
  });

  // Helper for authenticated fetch
  const authFetch = async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  };

  // Player CRUD mutations
  const createPlayer = useMutation({
    mutationFn: async (data: PlayerForm) => {
      const res = await authFetch('/api/players', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          gamertag: data.gamertag,
          tier: data.tier,
          division: data.division,
          city: data.city || undefined,
          phone: data.phone || undefined,
          joki: data.joki || undefined,
          points: parseInt(data.points) || 0,
          clubId: data.clubId === '_none' ? undefined : data.clubId,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-players'] });
      toast.success('Player berhasil ditambahkan!');
      setPlayerFormOpen(false);
      setFormData(emptyForm);
    },
    onError: (e: Error) => { toast.error(e.message); },
  });

  const updatePlayer = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PlayerForm> }) => {
      const res = await authFetch(`/api/players/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: data.name,
          gamertag: data.gamertag,
          tier: data.tier,
          division: data.division,
          city: data.city,
          phone: data.phone || null,
          joki: data.joki || null,
          points: data.points ? parseInt(data.points) : undefined,
          clubId: data.clubId === '_none' ? null : data.clubId,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-players'] });
      toast.success('Player berhasil diperbarui!');
      setPlayerFormOpen(false);
      setEditingPlayer(null);
      setFormData(emptyForm);
    },
    onError: (e: Error) => { toast.error(e.message); },
  });

  const deletePlayer = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`/api/players?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-players'] });
      toast.success('Player berhasil dihapus!');
    },
    onError: (e: Error) => { toast.error(e.message); },
  });

  const updateTier = useMutation({
    mutationFn: async ({ playerId, tier }: { playerId: string; tier: string }) => {
      const res = await authFetch(`/api/players/${playerId}`, {
        method: 'PUT',
        body: JSON.stringify({ tier }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-players', storeDivision] }); toast.success('Tier diperbarui!'); },
  });

  const updateAvatar = useMutation({
    mutationFn: async ({ playerId, avatar }: { playerId: string; avatar: string }) => {
      const res = await authFetch(`/api/players/${playerId}`, {
        method: 'PUT',
        body: JSON.stringify({ avatar }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update avatar');
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-players', storeDivision] });
      qc.invalidateQueries({ queryKey: ['player-achievements'] });
      toast.success('Avatar diperbarui!');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleAvatarSelect = (url: string, _publicId?: string) => {
    if (editingPlayerId) {
      updateAvatar.mutate({ playerId: editingPlayerId, avatar: url });
      setEditingPlayerId(null);
    }
  };

  const openAvatarPicker = (playerId: string) => {
    setEditingPlayerId(playerId);
    setCloudinaryOpen(true);
  };

  const addDonation = useMutation({
    mutationFn: async (data: { donorName: string; amount: number; message: string; type: string; tournamentId?: string }) => {
      const res = await authFetch('/api/donations', {
        method: 'POST',
        body: JSON.stringify({ ...data, seasonId: stats?.season?.id }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-donations', storeDivision] }); toast.success('Donasi berhasil ditambahkan!'); },
  });

  const approveDonation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const res = await authFetch('/api/donations', {
        method: 'PATCH',
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['admin-donations', storeDivision] });
      qc.invalidateQueries({ queryKey: ['stats', storeDivision] });
      qc.invalidateQueries({ queryKey: ['feed'] });
      toast.success(variables.status === 'approved' ? 'Donasi disetujui ✅' : 'Donasi ditolak ❌');
    },
  });

  const deleteDonation = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch('/api/donations', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-donations', storeDivision] }); qc.invalidateQueries({ queryKey: ['feed'] }); toast.success('Donasi dihapus'); },
  });

  const savePaymentSetting = useMutation({
    mutationFn: async (data: { key: string; value: string; type?: string }) => {
      const res = await authFetch('/api/cms/settings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-cms-settings'] }); toast.success('Setting pembayaran disimpan!'); },
  });

  // Pending registrations
  const { data: pendingRegistrations } = useQuery({
    queryKey: ['admin-pending-registrations'],
    queryFn: async () => { const res = await fetch('/api/players?registrationStatus=pending'); return res.json(); },
  });

  const approveRegistration = useMutation({
    mutationFn: async ({ playerId, tier }: { playerId: string; tier: string }) => {
      const res = await authFetch(`/api/players/${playerId}`, {
        method: 'PUT',
        body: JSON.stringify({ registrationStatus: 'approved', tier }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-pending-registrations'] }); qc.invalidateQueries({ queryKey: ['admin-players', storeDivision] }); toast.success('Pendaftaran disetujui!'); },
  });

  const rejectRegistration = useMutation({
    mutationFn: async (playerId: string) => {
      const res = await authFetch(`/api/players/${playerId}`, {
        method: 'PUT',
        body: JSON.stringify({ registrationStatus: 'rejected', isActive: false }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-pending-registrations'] }); qc.invalidateQueries({ queryKey: ['admin-players', storeDivision] }); toast.success('Pendaftaran ditolak.'); },
  });

  const scoreLeagueMatch = useMutation({
    mutationFn: async ({ matchId, score1, score2 }: { matchId: string; score1: number; score2: number }) => {
      const res = await authFetch(`/api/league-matches/${matchId}`, {
        method: 'PUT',
        body: JSON.stringify({ score1, score2 }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stats', storeDivision] }); toast.success('Skor match berhasil!'); },
  });

  const scorePlayoffMatch = useMutation({
    mutationFn: async ({ matchId, score1, score2 }: { matchId: string; score1: number; score2: number }) => {
      const res = await authFetch(`/api/playoff-matches/${matchId}`, {
        method: 'PUT',
        body: JSON.stringify({ score1, score2 }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stats', storeDivision] }); toast.success('Skor playoff berhasil!'); },
  });

  // State
  const [newDonation, setNewDonation] = useState({ donorName: '', amount: '', message: '', type: 'season' });
  const [paymentFormState, setPaymentForm] = useState<Record<string, string> | null>(null);
  const paymentForm = paymentFormState ?? (cmsSettings || {});
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileCategory, setMobileCategory] = useState('dashboard');

  const categoryTabMap: Record<string, string[]> = {
    dashboard: ['overview'],
    tournament: ['players', 'tournaments', 'matches', 'rankings'],
    league: ['seasons', 'clubs', 'sponsors', 'achievements'],
    system: ['admins', 'donations', 'cms', 'settings'],
  };

  const [searchPlayer, setSearchPlayer] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: '', description: '', onConfirm: () => {} });

  // Player form state
  const [playerFormOpen, setPlayerFormOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<{ id: string; data: PlayerForm } | null>(null);
  const [formData, setFormData] = useState<PlayerForm>(emptyForm);

  // Cloudinary picker state
  const [cloudinaryOpen, setCloudinaryOpen] = useState(false);
  const [qrisPickerOpen, setQrisPickerOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);

  // Open form for new player
  const openNewPlayerForm = () => {
    setEditingPlayer(null);
    setFormData({ ...emptyForm, division: storeDivision });
    setPlayerFormOpen(true);
  };

  // Open form for editing
  const openEditPlayerForm = (player: {
    id: string;
    name: string;
    gamertag: string;
    tier: string;
    division: string;
    city: string;
    phone: string | null;
    joki: string | null;
    points: number;
    clubMembers?: Array<{ club: { id: string; name: string } }>;
  }) => {
    setEditingPlayer({
      id: player.id,
      data: {
        name: player.name,
        gamertag: player.gamertag,
        tier: player.tier,
        division: player.division,
        city: player.city || '',
        phone: player.phone || '',
        joki: player.joki || '',
        points: player.points.toString(),
        clubId: player.clubMembers?.[0]?.club?.id || '_none',
      }
    });
    setFormData({
      name: player.name,
      gamertag: player.gamertag,
      tier: player.tier,
      division: player.division,
      city: player.city || '',
      phone: player.phone || '',
      joki: player.joki || '',
      points: player.points.toString(),
      clubId: player.clubMembers?.[0]?.club?.id || '_none',
    });
    setPlayerFormOpen(true);
  };

  // Submit form
  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.gamertag.trim()) {
      toast.error('Nama dan gamertag wajib diisi');
      return;
    }

    if (editingPlayer) {
      updatePlayer.mutate({ id: editingPlayer.id, data: formData });
    } else {
      createPlayer.mutate(formData);
    }
  };

  const filteredPlayers = players?.filter((p: { gamertag: string; name: string }) =>
    p.gamertag.toLowerCase().includes(searchPlayer.toLowerCase()) ||
    p.name.toLowerCase().includes(searchPlayer.toLowerCase())
  ) || [];

  // paymentForm is derived from cmsSettings (no useEffect needed)

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <Shield className={`w-5 h-5 ${dt.neonText}`} />
        <h2 className="text-lg font-bold text-gradient-fury">Panel Admin</h2>
        <Badge className="bg-red-500/10 text-red-500 text-[10px] border-0">ADMIN</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" aria-label="Admin panel navigation">
        {/* Mobile: Apple Settings grouped navigation */}
        <div className="sm:hidden space-y-2">
          <div className="grid grid-cols-4 gap-1">
            {([
              { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { key: 'tournament', icon: Music, label: 'Turnamen' },
              { key: 'league', icon: Crown, label: 'Liga' },
              { key: 'system', icon: Sliders, label: 'Sistem' },
            ] as const).map(cat => (
              <button
                key={cat.key}
                onClick={() => {
                  setMobileCategory(cat.key);
                  const firstTab = categoryTabMap[cat.key]?.[0];
                  if (firstTab) setActiveTab(firstTab);
                }}
                className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-[10px] font-medium transition-all min-h-[44px] justify-center ${
                  mobileCategory === cat.key
                    ? 'bg-idm-gold-warm/15 text-idm-gold-warm border border-idm-gold-warm/25'
                    : 'bg-muted/30 text-muted-foreground border border-transparent'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {(categoryTabMap[mobileCategory] || []).map(tabValue => {
              const tabConfig: Record<string, { icon: typeof Users; label: string }> = {
                overview: { icon: LayoutDashboard, label: 'Overview' },
                players: { icon: Users, label: 'Players' },
                tournaments: { icon: Music, label: 'Tourney' },
                matches: { icon: Trophy, label: 'Match' },
                rankings: { icon: BarChart3, label: 'Rank' },
                seasons: { icon: Calendar, label: 'Season' },
                clubs: { icon: Crown, label: 'Club' },
                sponsors: { icon: Building2, label: 'Sponsor' },
                achievements: { icon: Award, label: 'Achieve' },
                admins: { icon: UserCog, label: 'Admin' },
                donations: { icon: Gift, label: 'Donasi' },
                cms: { icon: Globe, label: 'CMS' },
                settings: { icon: Sliders, label: 'Settings' },
              };
              const cfg = tabConfig[tabValue];
              if (!cfg) return null;
              const CfgIcon = cfg.icon;
              return (
                <button
                  key={tabValue}
                  onClick={() => setActiveTab(tabValue)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all min-h-[44px] ${
                    activeTab === tabValue
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <CfgIcon className="w-3 h-3" />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop: Compact 4-category navigation (same as mobile) */}
        <div className="hidden sm:block space-y-2">
          <div className="grid grid-cols-4 gap-1.5">
            {([
              { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { key: 'tournament', icon: Music, label: 'Turnamen' },
              { key: 'league', icon: Crown, label: 'Liga' },
              { key: 'system', icon: Sliders, label: 'Sistem' },
            ] as const).map(cat => (
              <button
                key={cat.key}
                onClick={() => {
                  setMobileCategory(cat.key);
                  const firstTab = categoryTabMap[cat.key]?.[0];
                  if (firstTab) setActiveTab(firstTab);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium transition-all ${
                  mobileCategory === cat.key
                    ? 'bg-idm-gold-warm/15 text-idm-gold-warm border border-idm-gold-warm/25'
                    : 'bg-muted/30 text-muted-foreground border border-transparent hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {(categoryTabMap[mobileCategory] || []).map(tabValue => {
              const tabConfig: Record<string, { icon: typeof Users; label: string }> = {
                overview: { icon: LayoutDashboard, label: 'Overview' },
                players: { icon: Users, label: 'Players' },
                tournaments: { icon: Music, label: 'Tourney' },
                matches: { icon: Trophy, label: 'Match' },
                rankings: { icon: BarChart3, label: 'Rank' },
                seasons: { icon: Calendar, label: 'Season' },
                clubs: { icon: Crown, label: 'Club' },
                sponsors: { icon: Building2, label: 'Sponsor' },
                achievements: { icon: Award, label: 'Achieve' },
                admins: { icon: UserCog, label: 'Admin' },
                donations: { icon: Gift, label: 'Donasi' },
                cms: { icon: Globe, label: 'CMS' },
                settings: { icon: Sliders, label: 'Settings' },
              };
              const cfg = tabConfig[tabValue];
              if (!cfg) return null;
              const CfgIcon = cfg.icon;
              return (
                <button
                  key={tabValue}
                  onClick={() => setActiveTab(tabValue)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === tabValue
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <CfgIcon className="w-3 h-3" />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ====== OVERVIEW TAB ====== */}
        <TabsContent value="overview">
          <AdminOverview division={storeDivision} />
        </TabsContent>

        {/* ====== PLAYERS TAB ====== */}
        <TabsContent value="players">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {/* Pending Registrations */}
            {pendingRegistrations?.length > 0 && (
              <Card className="border-yellow-500/20 bg-yellow-500/5">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-yellow-500">
                    <Clock className="w-4 h-4" /> Pendaftaran Menunggu Persetujuan ({pendingRegistrations.length})
                  </h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                    {pendingRegistrations.map((p: { id: string; name: string; gamertag: string; division: string; city: string; phone: string | null; joki: string | null; createdAt: string }, index) => (
                      <div key={p.id} className="stagger-item p-3 rounded-xl bg-card border border-yellow-500/10"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold">{p.name}</p>
                              <Badge className={`text-[9px] border-0 ${p.division === 'male' ? 'bg-idm-male/10 text-idm-male' : 'bg-idm-female/10 text-idm-female'}`}>
                                {p.division === 'male' ? '🕺 Male' : '💃 Female'}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.city || '-'}</span>
                              {p.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.phone}</span>}
                              {p.joki && <span className="flex items-center gap-1">🎮 Joki: {p.joki}</span>}
                              <span>Gamertag: <span className="font-medium text-foreground">{p.gamertag}</span></span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Select onValueChange={(tier) => setConfirmDialog({
                              open: true,
                              title: 'Setujui Pendaftaran?',
                              description: `Setujui "${p.name}" sebagai tier ${tier} di division ${p.division}.`,
                              onConfirm: () => approveRegistration.mutate({ playerId: p.id, tier })
                            })}>
                              <SelectTrigger className="w-20 h-7 text-[10px]"><SelectValue placeholder="Setujui" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="S">Sebagai S</SelectItem>
                                <SelectItem value="A">Sebagai A</SelectItem>
                                <SelectItem value="B">Sebagai B</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 touch-icon text-red-500 hover:text-red-400 hover:bg-red-500/10"
                              onClick={() => setConfirmDialog({
                                open: true,
                                title: 'Tolak Pendaftaran?',
                                description: `Tolak pendaftaran "${p.name}". Player akan ditandai sebagai rejected.`,
                                onConfirm: () => rejectRegistration.mutate(p.id)
                              })}>
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Player Management Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari player by nama/gamertag..."
                  value={searchPlayer}
                  onChange={(e) => setSearchPlayer(e.target.value)}
                  className="pl-9 glass"
                />
              </div>
              <Button onClick={openNewPlayerForm} className="shrink-0">
                <Plus className="w-4 h-4 mr-1" /> Tambah Player
              </Button>
            </div>

            {/* Player list */}
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto custom-scrollbar">
              {filteredPlayers.map((p: {
                id: string;
                gamertag: string;
                name: string;
                avatar?: string | null;
                tier: string;
                division: string;
                points: number;
                totalWins: number;
                streak: number;
                totalMvp: number;
                matches: number;
                isActive: boolean;
                city: string;
                phone: string | null;
                joki: string | null;
                clubMembers?: Array<{ club: { id: string; name: string } }>;
              }, index) => {
                const avatarSrc = getAvatarUrl(p.gamertag, p.division, p.avatar);
                return (
                <div key={p.id} className={`stagger-item flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 ${dt.casinoGlow}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative group shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <Image src={avatarSrc} alt={p.gamertag} width={40} height={40} className="w-full h-full object-cover" />
                      </div>
                      <button
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => openAvatarPicker(p.id)}
                        title="Ganti avatar"
                      >
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{p.gamertag}</p>
                        <Badge className={`text-[9px] border-0 ${p.division === 'male' ? 'bg-idm-male/10 text-idm-male' : 'bg-idm-female/10 text-idm-female'}`}>
                          {p.division === 'male' ? '🕺' : '💃'}
                        </Badge>
                        <TierBadge tier={p.tier} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
                        <span className="font-medium text-foreground">{p.name}</span>
                        {p.city && <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{p.city}</span>}
                        <span>•</span>
                        <span>{p.points} pts</span>
                        <span>•</span>
                        <span>{p.totalWins}W</span>
                        <span>•</span>
                        <span>{p.totalMvp} MVP</span>
                        {p.streak > 1 && <span className="text-orange-400 flex items-center gap-0.5"><Flame className="w-3 h-3" />{p.streak}</span>}
                        {p.clubMembers?.[0]?.club && (
                          <Badge className="text-[9px] border-0 bg-muted text-muted-foreground">{p.clubMembers[0].club.name}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Select value={p.tier} onValueChange={(tier) => updateTier.mutate({ playerId: p.id, tier })}>
                      <SelectTrigger className="w-14 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 touch-icon text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                      onClick={() => openEditPlayerForm(p)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 touch-icon text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => setConfirmDialog({
                        open: true,
                        title: 'Hapus Player?',
                        description: `Hapus "${p.name}" (@${p.gamertag}). Player akan dinonaktifkan dan tidak muncul di daftar.`,
                        onConfirm: () => deletePlayer.mutate(p.id)
                      })}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                );
              })}
            </div>
          </motion.div>
        </TabsContent>

        {/* ====== TOURNAMENTS TAB ====== */}
        <TabsContent value="tournaments">
          <TournamentManager division={storeDivision} dt={dt} stats={stats} setConfirmDialog={setConfirmDialog} />
        </TabsContent>

        {/* ====== MATCHES TAB ====== */}
        <TabsContent value="matches">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {/* League Match Scoring */}
            <Card className={dt.casinoCard}>
              <div className={dt.casinoBar} />
              <CardContent className="p-4 relative z-10">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Trophy className={`w-4 h-4 ${dt.neonText}`} /> Skor League Match
                </h3>
                <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                  {stats?.leagueMatches?.filter((m: { status: string }) => m.status === 'upcoming').map((m: { id: string; week: number; club1: { name: string }; club2: { name: string }; format: string }) => (
                    <div key={m.id} className="p-3 rounded-lg bg-muted/50 border border-border/30 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold truncate">Week {m.week}: {m.club1.name} vs {m.club2.name}</p>
                        <Badge className={`${dt.casinoBadge}`}>{m.format}</Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        <Button size="sm" variant="outline" className="h-9 text-[10px] min-h-[44px]" disabled={scoreLeagueMatch.isPending || scorePlayoffMatch.isPending}
                          onClick={() => setConfirmDialog({
                            open: true,
                            title: 'Konfirmasi Skor',
                            description: `Set skor Week ${m.week}: ${m.club1.name} 2-0 ${m.club2.name}`,
                            onConfirm: () => scoreLeagueMatch.mutate({ matchId: m.id, score1: 2, score2: 0 })
                          })}>
                          2-0 {m.club1.name.slice(0, 3)}
                        </Button>
                        <Button size="sm" variant="outline" className="h-9 text-[10px] min-h-[44px]" disabled={scoreLeagueMatch.isPending || scorePlayoffMatch.isPending}
                          onClick={() => setConfirmDialog({
                            open: true,
                            title: 'Konfirmasi Skor',
                            description: `Set skor Week ${m.week}: ${m.club1.name} 2-1 ${m.club2.name}`,
                            onConfirm: () => scoreLeagueMatch.mutate({ matchId: m.id, score1: 2, score2: 1 })
                          })}>
                          2-1
                        </Button>
                        <Button size="sm" variant="outline" className="h-9 text-[10px] min-h-[44px]" disabled={scoreLeagueMatch.isPending || scorePlayoffMatch.isPending}
                          onClick={() => setConfirmDialog({
                            open: true,
                            title: 'Konfirmasi Skor',
                            description: `Set skor Week ${m.week}: ${m.club1.name} 0-2 ${m.club2.name}`,
                            onConfirm: () => scoreLeagueMatch.mutate({ matchId: m.id, score1: 0, score2: 2 })
                          })}>
                          0-2 {m.club2.name.slice(0, 3)}
                        </Button>
                        <Button size="sm" variant="outline" className="h-9 text-[10px] min-h-[44px]" disabled={scoreLeagueMatch.isPending || scorePlayoffMatch.isPending}
                          onClick={() => setConfirmDialog({
                            open: true,
                            title: 'Konfirmasi Skor',
                            description: `Set skor Week ${m.week}: ${m.club1.name} 1-2 ${m.club2.name}`,
                            onConfirm: () => scoreLeagueMatch.mutate({ matchId: m.id, score1: 1, score2: 2 })
                          })}>
                          1-2
                        </Button>
                      </div>
                    </div>
                  ))}
                  {stats?.leagueMatches?.filter((m: { status: string }) => m.status === 'upcoming').length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">Tidak ada league match mendatang</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Playoff Match Scoring */}
            <Card className={dt.casinoCard}>
              <div className={dt.casinoBar} />
              <CardContent className="p-4 relative z-10">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" /> Skor Playoff Match
                </h3>
                <div className="space-y-2">
                  {stats?.playoffMatches?.map((m: { id: string; round: string; club1: { name: string }; club2: { name: string }; status: string; format: string; score1: number | null; score2: number | null }) => (
                    <div key={m.id} className={`p-3 rounded-lg border ${m.status === 'upcoming' ? 'bg-muted/50 border-border/30' : `${dt.bg} ${dt.border}`}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <Badge className="text-[9px] border-0 bg-yellow-500/10 text-yellow-500">
                            {m.round.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                          <p className="text-xs font-semibold mt-1">{m.club1.name} vs {m.club2.name}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{m.format}</span>
                      </div>
                      {m.status === 'upcoming' ? (
                        <div className="grid grid-cols-3 gap-1.5 mt-2">
                          {[`3-0 ${m.club1.name.slice(0,3)}`, `3-1`, `3-2`, `0-3 ${m.club2.name.slice(0,3)}`, `1-3`, `2-3`].map((label, i) => {
                            const scores = [[3,0],[3,1],[3,2],[0,3],[1,3],[2,3]][i];
                            return (
                              <Button key={i} size="sm" variant="outline" className="h-9 text-[10px] min-h-[44px]" disabled={scoreLeagueMatch.isPending || scorePlayoffMatch.isPending}
                                onClick={() => setConfirmDialog({
                                  open: true,
                                  title: 'Konfirmasi Skor Playoff',
                                  description: `Set skor ${m.round.replace(/_/g, ' ')}: ${m.club1.name} ${scores[0]}-${scores[1]} ${m.club2.name}`,
                                  onConfirm: () => scorePlayoffMatch.mutate({ matchId: m.id, score1: scores[0], score2: scores[1] })
                                })}>
                                {label}
                              </Button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className={`text-sm font-bold ${dt.neonText} mt-1 casino-score`}>{m.score1} - {m.score2}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ====== RANKINGS TAB ====== */}
        <TabsContent value="rankings">
          <RankingPanel division={storeDivision} dt={dt} setConfirmDialog={setConfirmDialog} />
        </TabsContent>

        {/* ====== SEASONS TAB ====== */}
        <TabsContent value="seasons">
          <AdminSeasonPanel division={storeDivision} dt={dt} setConfirmDialog={setConfirmDialog} />
        </TabsContent>

        {/* ====== CLUBS TAB ====== */}
        <TabsContent value="clubs">
          <ClubManagement division={storeDivision} dt={dt} seasonId={stats?.seasonForClubs?.id || stats?.season?.id} setConfirmDialog={setConfirmDialog} />
        </TabsContent>

        {/* ====== DONATIONS TAB ====== */}
        <TabsContent value="donations">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {/* Pending Donations — Approval Queue */}
            {donations?.donations?.filter((d: { status: string }) => d.status === 'pending').length > 0 && (
              <Card className="border-yellow-500/20 bg-yellow-500/5">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-yellow-500">
                    <Clock className="w-4 h-4" /> Menunggu Persetujuan ({donations.donations.filter((d: { status: string }) => d.status === 'pending').length})
                  </h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                    {donations.donations.filter((d: { status: string }) => d.status === 'pending').map((d: { id: string; donorName: string; amount: number; message: string | null; type: string; createdAt: string }, index) => (
                      <div key={d.id} className="stagger-item p-3 rounded-xl bg-card border border-yellow-500/10" style={{ animationDelay: `${index * 50}ms` }}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Gift className="w-4 h-4 text-yellow-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold">{d.donorName}</p>
                                <Badge className="text-[9px] border-0 bg-[#22d3ee]/10 text-[#22d3ee]">{d.type === 'season' ? 'Donasi' : 'Sawer'}</Badge>
                              </div>
                              {d.message && <p className="text-[10px] text-muted-foreground truncate">{d.message}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm font-bold text-yellow-500">{formatCurrency(d.amount)}</span>
                            <Button size="sm" className="h-7 text-[10px] bg-green-600 hover:bg-green-700 text-white px-2"
                              onClick={() => approveDonation.mutate({ id: d.id, status: 'approved' })}
                              disabled={approveDonation.isPending}>
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-[10px] text-red-500 hover:text-red-400 hover:bg-red-500/10 px-2"
                              onClick={() => approveDonation.mutate({ id: d.id, status: 'rejected' })}
                              disabled={approveDonation.isPending}>
                              <XCircle className="w-3 h-3 mr-1" /> Tolak
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Donation */}
            <Card className={dt.casinoCard}>
              <div className={dt.casinoBar} />
              <CardContent className="p-4 relative z-10">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Plus className={`w-4 h-4 ${dt.neonText}`} /> Tambah Donasi Manual
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  <Input placeholder="Nama Donatur" value={newDonation.donorName} onChange={(e) => setNewDonation(p => ({ ...p, donorName: e.target.value }))} />
                  <Input placeholder="Jumlah (IDR)" type="number" value={newDonation.amount} onChange={(e) => setNewDonation(p => ({ ...p, amount: e.target.value }))} />
                  <Select value={newDonation.type} onValueChange={(v) => setNewDonation(p => ({ ...p, type: v }))}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="season">Donasi</SelectItem>
                      <SelectItem value="weekly">Sawer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Pesan" value={newDonation.message} onChange={(e) => setNewDonation(p => ({ ...p, message: e.target.value }))} />
                  <Button size="sm" disabled={!newDonation.donorName || !newDonation.amount || addDonation.isPending}
                    onClick={() => { addDonation.mutate({ donorName: newDonation.donorName, amount: parseInt(newDonation.amount) || 0, message: newDonation.message, type: newDonation.type }); setNewDonation({ donorName: '', amount: '', message: '', type: 'season' }); }}>
                    {addDonation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />} Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* All Donations List */}
            <Card className="border border-border/50">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-idm-gold-warm" /> Semua Donasi
                </h3>
                <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                  {donations?.donations?.length > 0 ? donations.donations.map((d: { id: string; donorName: string; amount: number; message: string | null; type: string; status: string; createdAt: string }, index) => (
                    <div key={d.id} className={`stagger-item flex items-center justify-between p-2.5 rounded-lg border ${
                      d.status === 'approved' ? 'bg-card border-green-500/10' :
                      d.status === 'rejected' ? 'bg-card border-red-500/10 opacity-50' :
                      'bg-card border-yellow-500/10'
                    }`} style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <Gift className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-medium truncate">{d.donorName}</p>
                            <Badge className={`text-[8px] border-0 ${d.type === 'season' ? 'bg-[#22d3ee]/10 text-[#22d3ee]' : 'bg-idm-gold-warm/10 text-idm-gold-warm'}`}>{d.type === 'season' ? 'Donasi' : 'Sawer'}</Badge>
                            {d.status === 'approved' && <Badge className="text-[8px] border-0 bg-green-500/10 text-green-500">✓</Badge>}
                            {d.status === 'rejected' && <Badge className="text-[8px] border-0 bg-red-500/10 text-red-500">✗</Badge>}
                          </div>
                          {d.message && <p className="text-[10px] text-muted-foreground truncate">{d.message}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold">{formatCurrency(d.amount)}</span>
                        {d.status === 'pending' && (
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 touch-icon text-green-500 hover:bg-green-500/10"
                            onClick={() => approveDonation.mutate({ id: d.id, status: 'approved' })}>
                            <CheckCircle2 className="w-3 h-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 touch-icon text-red-500 hover:bg-red-500/10"
                          onClick={() => setConfirmDialog({ open: true, title: 'Hapus Donasi?', description: `Hapus donasi dari "${d.donorName}" sebesar ${formatCurrency(d.amount)}?`, onConfirm: () => deleteDonation.mutate(d.id) })}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <p className="text-xs text-muted-foreground text-center py-4">Belum ada donasi</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Settings */}
            <Card className="border border-border/50">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-idm-gold-warm" /> Pembayaran Donasi
                  <Badge className="text-[8px] border-0 bg-cyan-500/10 text-cyan-400">Payment</Badge>
                </h3>
                <p className="text-[10px] text-muted-foreground">QRIS menggunakan QR code image, e-wallet menggunakan nomor handphone untuk transfer.</p>
                <div className="space-y-3">
                  {/* QRIS — QR code image */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-idm-gold-warm" /> QRIS (Universal)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input value={paymentForm.donation_qris_image || ''} onChange={(e) => setPaymentForm(p => ({ ...p, donation_qris_image: e.target.value }))} className="text-xs flex-1" placeholder="URL gambar QR code" />
                      <Button type="button" variant="outline" size="sm" className="h-8 text-[10px] shrink-0" onClick={() => setQrisPickerOpen(true)}>Upload</Button>
                    </div>
                    {paymentForm.donation_qris_image && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-border/30 bg-muted/20">
                        <img src={paymentForm.donation_qris_image} alt="QRIS Preview" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-border/20" />
                  <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">E-Wallet (Nomor HP)</p>

                  {/* DANA — phone number */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#108ee9]" /> DANA
                    </label>
                    <Input value={paymentForm.donation_dana_number || ''} onChange={(e) => setPaymentForm(p => ({ ...p, donation_dana_number: e.target.value }))} className="text-sm" placeholder="Contoh: 081234567890" />
                  </div>
                  {/* OVO — phone number */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#4c3494]" /> OVO
                    </label>
                    <Input value={paymentForm.donation_ovo_number || ''} onChange={(e) => setPaymentForm(p => ({ ...p, donation_ovo_number: e.target.value }))} className="text-sm" placeholder="Contoh: 081234567890" />
                  </div>
                  {/* ShopeePay — phone number */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#ee4d2d]" /> ShopeePay
                    </label>
                    <Input value={paymentForm.donation_shopeepay_number || ''} onChange={(e) => setPaymentForm(p => ({ ...p, donation_shopeepay_number: e.target.value }))} className="text-sm" placeholder="Contoh: 081234567890" />
                  </div>

                  <div className="h-px bg-border/20" />

                  {/* Holder */}
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Nama Penerima (a.n.)</label>
                    <Input value={paymentForm.donation_payment_holder || ''} onChange={(e) => setPaymentForm(p => ({ ...p, donation_payment_holder: e.target.value }))} className="text-sm" placeholder="Contoh: Admin IDM League" />
                  </div>
                  {/* Notes */}
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Catatan Pembayaran</label>
                    <Textarea value={paymentForm.donation_payment_notes || ''} onChange={(e) => setPaymentForm(p => ({ ...p, donation_payment_notes: e.target.value }))} className="text-sm" placeholder="Contoh: Konfirmasi ke admin via WhatsApp" rows={2} />
                  </div>
                </div>
                <Button size="sm" className="text-[10px] bg-idm-gold-warm hover:bg-[#b8912e] text-black"
                  onClick={() => {
                    savePaymentSetting.mutate({ key: 'donation_qris_image', value: paymentForm.donation_qris_image || '', type: 'image' });
                    savePaymentSetting.mutate({ key: 'donation_dana_number', value: paymentForm.donation_dana_number || '', type: 'text' });
                    savePaymentSetting.mutate({ key: 'donation_ovo_number', value: paymentForm.donation_ovo_number || '', type: 'text' });
                    savePaymentSetting.mutate({ key: 'donation_shopeepay_number', value: paymentForm.donation_shopeepay_number || '', type: 'text' });
                    savePaymentSetting.mutate({ key: 'donation_payment_holder', value: paymentForm.donation_payment_holder || '', type: 'text' });
                    savePaymentSetting.mutate({ key: 'donation_payment_notes', value: paymentForm.donation_payment_notes || '', type: 'text' });
                  }}
                  disabled={savePaymentSetting.isPending}>
                  {savePaymentSetting.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />} Simpan Pembayaran
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ====== SPONSORS TAB ====== */}
        <TabsContent value="sponsors">
          <AdminSponsorPanel />
        </TabsContent>

        {/* ====== ACHIEVEMENTS TAB ====== */}
        <TabsContent value="achievements">
          <AdminAchievementPanel />
        </TabsContent>

        {/* ====== ADMINS TAB ====== */}
        <TabsContent value="admins">
          <AdminManagement />
        </TabsContent>

        {/* ====== SETTINGS TAB ====== */}
        <TabsContent value="settings">
          <AdminSettingsPanel />
        </TabsContent>

        {/* ====== CMS TAB ====== */}
        <TabsContent value="cms">
          <CmsPanel />
        </TabsContent>
      </Tabs>

      {/* Confirm Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialog.onConfirm}>Lanjutkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Player Form Dialog */}
      <Dialog open={playerFormOpen} onOpenChange={setPlayerFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPlayer ? 'Edit Player' : 'Tambah Player Baru'}</DialogTitle>
            <DialogDescription>{editingPlayer ? 'Perbarui informasi player yang sudah terdaftar' : 'Isi form untuk menambahkan player baru ke sistem'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Division */}
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground">Division</Label>
                <div className="flex items-center bg-muted rounded-lg p-1 mt-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, division: 'male', clubId: '' }))}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                      formData.division === 'male'
                        ? 'bg-idm-male text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    🕺 Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, division: 'female', clubId: '' }))}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                      formData.division === 'female'
                        ? 'bg-idm-female text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    💃 Female
                  </button>
                </div>
              </div>

              {/* Name */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs text-muted-foreground">Nama <span className="text-red-400">*</span></Label>
                <Input
                  placeholder="Nama lengkap/nickname"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="mt-1"
                />
              </div>

              {/* Gamertag */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs text-muted-foreground">Gamertag <span className="text-red-400">*</span></Label>
                <Input
                  placeholder="Username unik"
                  value={formData.gamertag}
                  onChange={(e) => setFormData(p => ({ ...p, gamertag: e.target.value }))}
                  className="mt-1"
                />
              </div>

              {/* Tier */}
              <div>
                <Label className="text-xs text-muted-foreground">Tier</Label>
                <Select value={formData.tier} onValueChange={(v) => setFormData(p => ({ ...p, tier: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S">S Tier</SelectItem>
                    <SelectItem value="A">A Tier</SelectItem>
                    <SelectItem value="B">B Tier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Points */}
              <div>
                <Label className="text-xs text-muted-foreground">Points</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.points}
                  onChange={(e) => setFormData(p => ({ ...p, points: e.target.value }))}
                  className="mt-1"
                />
              </div>

              {/* City */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs text-muted-foreground">Kota</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Makassar, Jakarta, etc."
                    value={formData.city}
                    onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs text-muted-foreground">No. WhatsApp</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="08xxxxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                    className="pl-9"
                    type="tel"
                  />
                </div>
              </div>

              {/* Joki */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs text-muted-foreground">Joki <span className="text-muted-foreground/70">(opsional)</span></Label>
                <Input
                  placeholder="Nama joki jika ada"
                  value={formData.joki}
                  onChange={(e) => setFormData(p => ({ ...p, joki: e.target.value }))}
                  className="mt-1"
                />
              </div>

              {/* Club */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs text-muted-foreground">Club</Label>
                <Select value={formData.clubId} onValueChange={(v) => setFormData(p => ({ ...p, clubId: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih club" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Tanpa Club</SelectItem>
                    {clubs?.map((c: { id: string; name: string }) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlayerFormOpen(false)}>Batal</Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name.trim() || !formData.gamertag.trim() || createPlayer.isPending || updatePlayer.isPending}
            >
              {(createPlayer.isPending || updatePlayer.isPending) ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-1" />
              )}
              {editingPlayer ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cloudinary Image Picker — Player Avatars */}
      <CloudinaryPicker
        open={cloudinaryOpen}
        onClose={() => setCloudinaryOpen(false)}
        onSelect={handleAvatarSelect}
        uploadFolder="avatars"
      />

      {/* Cloudinary Image Picker — QRIS QR Code */}
      <CloudinaryPicker
        open={qrisPickerOpen}
        onClose={() => setQrisPickerOpen(false)}
        onSelect={(url) => setPaymentForm(p => ({ ...p, donation_qris_image: url }))}
        uploadFolder="cms/payment"
      />
    </motion.div>
  );
}
