'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
/* framer-motion removed — CSS animations */
import Image from 'next/image';
import {
  Calendar, Crown, Trophy, Plus, Loader2, Check, X, Edit3,
  Shield, Play, Flag, ChevronDown, ChevronUp, Star, Trash2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { ClubLogoImage } from '@/components/idm/club-logo-image';
import { getAvatarUrl } from '@/lib/utils';
/* container/item removed — CSS stagger */
import type { DivisionTheme } from '@/hooks/use-division-theme';

interface AdminSeasonPanelProps {
  division: string;
  dt: DivisionTheme;
  setConfirmDialog: (d: { open: boolean; title: string; description: string; onConfirm: () => void }) => void;
}

interface SeasonClubData {
  id: string;
  name: string;
  logo: string | null;
  division: string;
  wins: number;
  losses: number;
  points: number;
  gameDiff: number;
  _count?: { members: number };
}

interface SeasonData {
  id: string;
  name: string;
  number: number;
  division: string;
  status: string;
  startDate: string;
  endDate: string | null;
  championClubId: string | null;
  championClub?: { id: string; name: string; logo: string | null; division: string } | null;
  championSquad?: Array<{ id: string; gamertag: string; division: string; role: string }> | null;
  _count: { tournaments: number; clubs: number };
  clubs?: SeasonClubData[];
}

export function AdminSeasonPanel({ division, dt, setConfirmDialog }: AdminSeasonPanelProps) {
  const qc = useQueryClient();

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

  // State
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);
  const [newSeasonForm, setNewSeasonForm] = useState({
    name: '',
    number: '',
    division: 'liga',
    startDate: '',
    endDate: '',
  });
  const [editingChampion, setEditingChampion] = useState<string | null>(null);
  const [selectedChampion, setSelectedChampion] = useState<string>('');
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [editingSquad, setEditingSquad] = useState(false);
  const [squadSelection, setSquadSelection] = useState<Array<{id: string; gamertag: string; division: string; role: string}>>([]);
  const [confirmLocal, setConfirmLocal] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: '', description: '', onConfirm: () => {} });

  // Fetch ALL seasons
  const { data: seasons, isLoading } = useQuery<SeasonData[]>({
    queryKey: ['admin-seasons'],
    queryFn: async () => {
      const res = await fetch('/api/seasons');
      return res.json();
    },
  });

  // Fetch expanded season detail with clubs
  const { data: seasonDetail, isLoading: detailLoading } = useQuery<SeasonData>({
    queryKey: ['admin-season-detail', expandedSeason],
    queryFn: async () => {
      if (!expandedSeason) return null;
      const res = await fetch(`/api/seasons/${expandedSeason}`);
      return res.json();
    },
    enabled: !!expandedSeason,
  });

  // Create season mutation
  const createSeason = useMutation({
    mutationFn: async (data: typeof newSeasonForm) => {
      const res = await authFetch('/api/seasons', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          number: parseInt(data.number),
          division: data.division,
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-seasons'] });
      qc.invalidateQueries({ queryKey: ['stats', division] });
      qc.invalidateQueries({ queryKey: ['league'] });
      qc.invalidateQueries({ queryKey: ['league-landing'] });
      toast.success('Season berhasil dibuat!');
      setNewSeasonForm({ name: '', number: '', division: 'liga', startDate: '', endDate: '' });
    },
    onError: (e: Error) => { toast.error(e.message); },
  });

  // Update season mutation
  const updateSeason = useMutation({
    mutationFn: async ({ seasonId, data }: { seasonId: string; data: Record<string, unknown> }) => {
      const res = await authFetch(`/api/seasons/${seasonId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['admin-seasons'] });
      qc.invalidateQueries({ queryKey: ['admin-season-detail', variables.seasonId] });
      qc.invalidateQueries({ queryKey: ['stats', division] });
      qc.invalidateQueries({ queryKey: ['league'] });
      qc.invalidateQueries({ queryKey: ['league-landing'] });
      toast.success('Season berhasil diperbarui!');
      setEditingChampion(null);
      setEditingStatus(null);
      setEditingSquad(false);
    },
    onError: (e: Error) => { toast.error(e.message); },
  });

  // Delete season mutation
  const deleteSeason = useMutation({
    mutationFn: async (seasonId: string) => {
      const res = await authFetch(`/api/seasons/${seasonId}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-seasons'] });
      qc.invalidateQueries({ queryKey: ['stats', division] });
      qc.invalidateQueries({ queryKey: ['league'] });
      qc.invalidateQueries({ queryKey: ['league-landing'] });
      setExpandedSeason(null);
      toast.success('Season berhasil dihapus!');
    },
    onError: (e: Error) => { toast.error(e.message); },
  });

  // Helper to set champion
  const handleSetChampion = (seasonId: string, clubId: string) => {
    const club = seasonDetail?.clubs?.find(c => c.id === clubId);
    setConfirmLocal({
      open: true,
      title: 'Set Champion Season?',
      description: `Set "${club?.name}" sebagai champion season ini? Status season akan otomatis diubah menjadi "completed".`,
      onConfirm: () => {
        updateSeason.mutate({
          seasonId,
          data: { championClubId: clubId, status: 'completed' },
        });
      },
    });
  };

  // Helper to remove champion
  const handleRemoveChampion = (seasonId: string) => {
    setConfirmLocal({
      open: true,
      title: 'Hapus Champion?',
      description: 'Hapus champion dari season ini? Status season akan diubah kembali ke "active".',
      onConfirm: () => {
        updateSeason.mutate({
          seasonId,
          data: { championClubId: null, status: 'active' },
        });
      },
    });
  };

  // Helper to change status
  const handleStatusChange = (seasonId: string, newStatus: string) => {
    const statusLabels: Record<string, string> = {
      active: 'Aktif',
      completed: 'Selesai',
      upcoming: 'Akan Datang',
    };
    setConfirmLocal({
      open: true,
      title: `Ubah Status Season?`,
      description: `Ubah status season menjadi "${statusLabels[newStatus] || newStatus}"?`,
      onConfirm: () => {
        updateSeason.mutate({ seasonId, data: { status: newStatus } });
      },
    });
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/10 text-green-500',
    completed: 'bg-blue-500/10 text-blue-500',
    upcoming: 'bg-yellow-500/10 text-yellow-500',
  };

  const statusLabels: Record<string, string> = {
    active: 'Aktif',
    completed: 'Selesai',
    upcoming: 'Akan Datang',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className={`w-6 h-6 animate-spin ${dt.neonText}`} />
        <span className="ml-2 text-sm text-muted-foreground">Memuat season...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ===== CREATE SEASON ===== */}
      <Card className={dt.casinoCard}>
        <div className={dt.casinoBar} />
        <CardContent className="p-4 relative z-10">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Plus className={`w-4 h-4 ${dt.neonText}`} /> Buat Season Baru
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Nama Season</Label>
              <Input
                placeholder="contoh: Liga IDM Season 3"
                value={newSeasonForm.name}
                onChange={(e) => setNewSeasonForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Nomor Season</Label>
              <Input
                placeholder="contoh: 3"
                type="number"
                value={newSeasonForm.number}
                onChange={(e) => setNewSeasonForm(p => ({ ...p, number: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Liga</Label>
              <div className="flex items-center h-9 px-3 rounded-md border border-border/30 bg-muted/10 text-xs text-muted-foreground">
                Liga IDM (Terbuka untuk semua divisi)
              </div>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Tanggal Mulai</Label>
              <Input
                type="date"
                value={newSeasonForm.startDate}
                onChange={(e) => setNewSeasonForm(p => ({ ...p, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Tanggal Selesai (opsional)</Label>
              <Input
                type="date"
                value={newSeasonForm.endDate}
                onChange={(e) => setNewSeasonForm(p => ({ ...p, endDate: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button
                size="sm"
                className="w-full"
                disabled={!newSeasonForm.name.trim() || !newSeasonForm.number || createSeason.isPending}
                onClick={() => createSeason.mutate(newSeasonForm)}
              >
                {createSeason.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />}
                Buat Season
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== SEASONS LIST ===== */}
      {!seasons || seasons.length === 0 ? (
        <div className="text-center py-10">
          <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Belum ada season Liga IDM</p>
        </div>
      ) : (
        <div className="space-y-2">
          {seasons.map((season, idx) => {
            const isExpanded = expandedSeason === season.id;
            const isChampionEditing = editingChampion === season.id;
            const isStatusEditing = editingStatus === season.id;
            const championClub = isExpanded ? (seasonDetail?.championClub || season.championClub) : season.championClub;

            return (
              <div key={season.id} className="stagger-item-subtle" style={{ animationDelay: `${idx * 30}ms` }}>
                <Card className={`${dt.casinoCard} ${dt.casinoGlow}`}>
                  <div className={dt.casinoBar} />
                  <CardContent className="p-0 relative z-10">
                    {/* Season Header Row */}
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/10 transition-colors"
                      onClick={() => {
                        setExpandedSeason(isExpanded ? null : season.id);
                        setEditingChampion(null);
                        setEditingStatus(null);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          season.status === 'completed' ? 'bg-blue-500/15 text-blue-500' :
                          season.status === 'active' ? 'bg-green-500/15 text-green-500' :
                          'bg-yellow-500/15 text-yellow-500'
                        }`}>
                          {season.status === 'completed' ? <Flag className="w-4 h-4" /> :
                           season.status === 'active' ? <Play className="w-4 h-4" /> :
                           <Calendar className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{season.name}</p>
                            <Badge className={`text-[9px] border-0 ${statusColors[season.status] || 'bg-muted text-muted-foreground'}`}>
                              {statusLabels[season.status] || season.status}
                            </Badge>
                            {season.number && (
                              <Badge className={`${dt.casinoBadge} text-[9px]`}>
                                S{season.number}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                            <span>{new Date(season.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            {season.endDate && (
                              <>
                                <span>→</span>
                                <span>{new Date(season.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={dt.casinoBadge}>
                          <Shield className="w-3 h-3 mr-1" />
                          {season._count?.clubs || 0} Club
                        </Badge>
                        <Badge className={dt.casinoBadge}>
                          <Trophy className="w-3 h-3 mr-1" />
                          {season._count?.tournaments || 0} Tourney
                        </Badge>

                        {/* Delete button — only for seasons without matches */}
                        <Button size="sm" variant="ghost"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDialog({
                              open: true,
                              title: 'Hapus Season?',
                              description: `Season "${season.name}" dan semua data terkait (club, donasi, tournament) akan dihapus. Tindakan ini tidak dapat dibatalkan.`,
                              onConfirm: () => deleteSeason.mutate(season.id),
                            });
                          }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>

                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>

                    {/* ===== EXPANDED: CHAMPION & STATUS ===== */}
                    {isExpanded && (
                      <div className="border-t border-border/20 px-3 py-3 space-y-3">
                        {detailLoading ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className={`w-4 h-4 animate-spin ${dt.neonText}`} />
                            <span className="ml-2 text-xs text-muted-foreground">Memuat detail...</span>
                          </div>
                        ) : (
                          <>
                            {/* ── Champion Management ── */}
                            <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                  <Crown className="w-3.5 h-3.5 text-yellow-500" /> Champion Season
                                </p>
                                {!isChampionEditing && (
                                  <Button size="sm" variant="outline" className="text-[10px] h-7"
                                    onClick={() => {
                                      setEditingChampion(season.id);
                                      setSelectedChampion(seasonDetail?.championClubId || '');
                                    }}>
                                    <Edit3 className="w-3 h-3 mr-1" />
                                    {seasonDetail?.championClubId ? 'Ubah' : 'Set Champion'}
                                  </Button>
                                )}
                              </div>

                              {/* Current champion display */}
                              {championClub && !isChampionEditing && (
                                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border-2 border-yellow-500/30">
                                    {championClub.logo ? (
                                      <ClubLogoImage
                                        clubName={championClub.name}
                                        dbLogo={championClub.logo}
                                        alt={championClub.name}
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-yellow-500/10">
                                        <Crown className="w-4 h-4 text-yellow-500" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-bold text-yellow-500">{championClub.name}</p>
                                      <Badge className="bg-yellow-500/10 text-yellow-500 text-[9px] border-0">
                                        <Crown className="w-3 h-3 mr-0.5" /> CHAMPION
                                      </Badge>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Juara Season {seasonDetail?.number}</p>
                                  </div>
                                  <Button
                                    size="sm" variant="ghost"
                                    className="h-7 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    onClick={() => handleRemoveChampion(season.id)}
                                  >
                                    <X className="w-3 h-3 mr-1" /> Hapus
                                  </Button>
                                </div>
                              )}

                              {/* No champion yet */}
                              {!championClub && !isChampionEditing && (
                                <div className="p-3 rounded-lg bg-muted/30 border border-dashed border-border/40 text-center">
                                  <Crown className="w-5 h-5 text-muted-foreground/40 mx-auto mb-1" />
                                  <p className="text-[10px] text-muted-foreground">Belum ada champion untuk season ini</p>
                                </div>
                              )}

                              {/* Champion editing mode */}
                              {isChampionEditing && (
                                <div className="space-y-2">
                                  <p className="text-[10px] text-muted-foreground">Pilih club champion untuk Season {seasonDetail?.number}:</p>
                                  <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                                    {seasonDetail?.clubs?.map((club) => (
                                      <div
                                        key={club.id}
                                        className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all ${
                                          selectedChampion === club.id
                                            ? 'border-yellow-500/30 bg-yellow-500/5'
                                            : 'border-border/20 bg-card/30 hover:bg-muted/20'
                                        }`}
                                        onClick={() => setSelectedChampion(club.id)}
                                      >
                                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                                          {club.logo ? (
                                            <Image src={club.logo} alt={club.name} width={32} height={32} className="w-full h-full object-cover" />
                                          ) : (
                                            <div className={`w-full h-full flex items-center justify-center ${dt.iconBg}`}>
                                              <Shield className={`w-3.5 h-3.5 ${dt.neonText}`} />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium truncate">{club.name}</p>
                                          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                                            <span className="text-green-500">{club.wins}W</span>
                                            <span>-</span>
                                            <span className="text-red-500">{club.losses}L</span>
                                            <span>•</span>
                                            <span>{club.points}pts</span>
                                          </div>
                                        </div>
                                        {selectedChampion === club.id && (
                                          <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 text-black" />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                    {(!seasonDetail?.clubs || seasonDetail.clubs.length === 0) && (
                                      <p className="text-[10px] text-muted-foreground text-center py-4">
                                        Belum ada club di season ini
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      className="text-[10px]"
                                      disabled={!selectedChampion || updateSeason.isPending}
                                      onClick={() => handleSetChampion(season.id, selectedChampion)}
                                    >
                                      {updateSeason.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Crown className="w-3 h-3 mr-1" />}
                                      Set Champion
                                    </Button>
                                    <Button
                                      size="sm" variant="ghost"
                                      className="text-[10px]"
                                      onClick={() => setEditingChampion(null)}
                                    >
                                      Batal
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* ── Champion Squad Management ── */}
                            {seasonDetail?.championClubId && (
                              <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                    <Star className="w-3.5 h-3.5 text-yellow-500" /> Skuad Champion (5 Perwakilan)
                                  </p>
                                  <Button size="sm" variant="outline" className="text-[10px] h-7"
                                    onClick={() => {
                                      if (editingSquad) {
                                        setEditingSquad(false);
                                      } else {
                                        // Load existing squad or start fresh
                                        const existingSquad = seasonDetail?.championSquad;
                                        if (existingSquad && Array.isArray(existingSquad) && existingSquad.length > 0) {
                                          setSquadSelection(existingSquad);
                                        } else {
                                          setSquadSelection([]);
                                        }
                                        setEditingSquad(true);
                                      }
                                    }}>
                                    <Edit3 className="w-3 h-3 mr-1" />
                                    {editingSquad ? 'Tutup' : 'Set Skuad'}
                                  </Button>
                                </div>

                                {/* Current squad display */}
                                {!editingSquad && (() => {
                                  const currentSquad = seasonDetail?.championSquad;
                                  if (currentSquad && Array.isArray(currentSquad) && currentSquad.length > 0) {
                                    return (
                                      <div className="flex flex-wrap gap-2">
                                        {currentSquad.map((member, idx) => (
                                          <div key={member.id || idx} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                                            <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
                                              <Image
                                                src={getAvatarUrl(member.gamertag, member.division as 'male' | 'female', undefined)}
                                                alt={member.gamertag}
                                                width={28}
                                                height={28}
                                                className="w-full h-full object-cover"
                                                unoptimized
                                              />
                                            </div>
                                            <div>
                                              <p className="text-xs font-medium">{member.gamertag}</p>
                                              <p className="text-[8px] text-muted-foreground capitalize">{member.division} {member.role === 'captain' ? '• Captain' : ''}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="p-3 rounded-lg bg-muted/30 border border-dashed border-border/40 text-center">
                                      <Star className="w-5 h-5 text-muted-foreground/40 mx-auto mb-1" />
                                      <p className="text-[10px] text-muted-foreground">Belum ada skuad champion dipilih</p>
                                      <p className="text-[9px] text-muted-foreground/60">Klik "Set Skuad" untuk memilih 5 perwakilan</p>
                                    </div>
                                  );
                                })()}

                                {/* Squad editing mode */}
                                {editingSquad && (
                                  <div className="space-y-3">
                                    <p className="text-[10px] text-muted-foreground">Pilih tepat 5 anggota dari club champion sebagai perwakilan squad (termasuk anggota divisi lain dengan nama club yang sama):</p>

                                    {/* Selected squad preview */}
                                    {squadSelection.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5">
                                        {squadSelection.map((member, idx) => (
                                          <div key={member.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                            <span className="text-[9px] font-bold text-yellow-500">#{idx + 1}</span>
                                            <span className="text-xs font-medium">{member.gamertag}</span>
                                            <button
                                              className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/40"
                                              onClick={() => setSquadSelection(prev => prev.filter(m => m.id !== member.id))}
                                            >
                                              <X className="w-2.5 h-2.5" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Player selection from champion club */}
                                    <ChampionSquadSelector
                                      seasonId={seasonDetail?.id || ''}
                                      championClubId={seasonDetail?.championClubId || ''}
                                      selectedIds={squadSelection.map(m => m.id)}
                                      onToggle={(player) => {
                                        setSquadSelection(prev => {
                                          const exists = prev.find(m => m.id === player.id);
                                          if (exists) return prev.filter(m => m.id !== player.id);
                                          if (prev.length >= 5) {
                                            toast.error('Maksimal 5 perwakilan squad');
                                            return prev;
                                          }
                                          return [...prev, { id: player.id, gamertag: player.gamertag, division: player.division, role: prev.length === 0 ? 'captain' : 'member', avatar: player.avatar || null }];
                                        });
                                      }}
                                    />

                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        className="text-[10px]"
                                        disabled={squadSelection.length !== 5 || updateSeason.isPending}
                                        onClick={() => {
                                          // Ensure first member is captain
                                          const squad = squadSelection.map((m, idx) => ({
                                            ...m,
                                            role: idx === 0 ? 'captain' : 'member',
                                          }));
                                          updateSeason.mutate({
                                            seasonId: season.id,
                                            data: { championSquad: squad },
                                          });
                                        }}
                                      >
                                        {updateSeason.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Star className="w-3 h-3 mr-1" />}
                                        Simpan Skuad ({squadSelection.length}/5)
                                      </Button>
                                      {squadSelection.length === 5 && squadSelection.some(m => m.division !== squadSelection[0]?.division) && (
                                        <span className="text-[9px] text-idm-gold-warm">✨ Cross-division</span>
                                      )}
                                      {squadSelection.length < 5 && squadSelection.length > 0 && (
                                        <span className="text-[9px] text-yellow-500">Pilih {5 - squadSelection.length} lagi</span>
                                      )}
                                      <Button
                                        size="sm" variant="ghost"
                                        className="text-[10px]"
                                        onClick={() => setEditingSquad(false)}
                                      >
                                        Batal
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* ── Status Management ── */}
                            <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                  <Flag className="w-3.5 h-3.5" /> Status Season
                                </p>
                                {!isStatusEditing && (
                                  <Button size="sm" variant="outline" className="text-[10px] h-7"
                                    onClick={() => setEditingStatus(season.id)}>
                                    <Edit3 className="w-3 h-3 mr-1" /> Ubah
                                  </Button>
                                )}
                              </div>

                              {!isStatusEditing ? (
                                <div className="flex items-center gap-2">
                                  <Badge className={`text-xs border-0 ${statusColors[seasonDetail?.status || season.status]}`}>
                                    {seasonDetail?.status === 'active' && <Play className="w-3 h-3 mr-1" />}
                                    {seasonDetail?.status === 'completed' && <Flag className="w-3 h-3 mr-1" />}
                                    {seasonDetail?.status === 'upcoming' && <Calendar className="w-3 h-3 mr-1" />}
                                    {statusLabels[seasonDetail?.status || season.status] || season.status}
                                  </Badge>
                                  {seasonDetail?.championClubId && (
                                    <span className="text-[10px] text-muted-foreground">
                                      (Champion sudah ditentukan)
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {(['active', 'upcoming', 'completed'] as const).map((s) => (
                                    <Button
                                      key={s}
                                      size="sm"
                                      variant={seasonDetail?.status === s ? 'default' : 'outline'}
                                      className={`text-[10px] h-7 ${
                                        seasonDetail?.status === s ? statusColors[s] : ''
                                      }`}
                                      onClick={() => handleStatusChange(season.id, s)}
                                    >
                                      {s === 'active' && <Play className="w-3 h-3 mr-1" />}
                                      {s === 'upcoming' && <Calendar className="w-3 h-3 mr-1" />}
                                      {s === 'completed' && <Flag className="w-3 h-3 mr-1" />}
                                      {statusLabels[s]}
                                    </Button>
                                  ))}
                                  <Button
                                    size="sm" variant="ghost"
                                    className="text-[10px] h-7"
                                    onClick={() => setEditingStatus(null)}
                                  >
                                    Batal
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* ── Season Stats Summary ── */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/20 text-center">
                                <Shield className={`w-4 h-4 ${dt.neonText} mx-auto mb-1`} />
                                <p className="text-sm font-bold">{seasonDetail?._count?.clubs || season._count?.clubs || 0}</p>
                                <p className="text-[9px] text-muted-foreground">Club</p>
                              </div>
                              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/20 text-center">
                                <Trophy className={`w-4 h-4 ${dt.neonText} mx-auto mb-1`} />
                                <p className="text-sm font-bold">{seasonDetail?._count?.tournaments || season._count?.tournaments || 0}</p>
                                <p className="text-[9px] text-muted-foreground">Tournament</p>
                              </div>
                              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/20 text-center">
                                <Star className={`w-4 h-4 ${dt.neonText} mx-auto mb-1`} />
                                <p className="text-sm font-bold">{seasonDetail?.clubs?.reduce((sum, c) => sum + c.points, 0) || 0}</p>
                                <p className="text-[9px] text-muted-foreground">Total Poin</p>
                              </div>
                            </div>

                            {/* ── Clubs Quick List ── */}
                            {seasonDetail?.clubs && seasonDetail.clubs.length > 0 && (
                              <div>
                                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                  <Shield className="w-3 h-3" /> Club di Season Ini
                                </p>
                                <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                                  {seasonDetail.clubs
                                    .sort((a, b) => b.points - a.points)
                                    .map((club, idx) => (
                                    <div
                                      key={club.id}
                                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${
                                        club.id === seasonDetail.championClubId
                                          ? 'border-yellow-500/20 bg-yellow-500/5'
                                          : 'border-border/20 bg-card/30'
                                      }`}
                                    >
                                      <span className={`w-5 text-center font-bold text-[10px] ${
                                        idx === 0 ? 'text-yellow-500' :
                                        idx === 1 ? 'text-gray-400' :
                                        idx === 2 ? 'text-amber-600' :
                                        'text-muted-foreground'
                                      }`}>#{idx + 1}</span>
                                      <div className="w-6 h-6 rounded overflow-hidden shrink-0">
                                        {club.logo ? (
                                          <Image src={club.logo} alt={club.name} width={24} height={24} className="w-full h-full object-cover" />
                                        ) : (
                                          <div className={`w-full h-full flex items-center justify-center ${dt.iconBg}`}>
                                            <Shield className={`w-2.5 h-2.5 ${dt.neonText}`} />
                                          </div>
                                        )}
                                      </div>
                                      <span className={`font-medium truncate ${club.id === seasonDetail.championClubId ? 'text-yellow-500' : ''}`}>
                                        {club.name}
                                      </span>
                                      {club.id === seasonDetail.championClubId && (
                                        <Crown className="w-3 h-3 text-yellow-500 shrink-0" />
                                      )}
                                      <span className="ml-auto text-[10px] text-muted-foreground">
                                        {club.points}pts • {club.wins}W/{club.losses}L
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Local Confirm Dialog */}
      <AlertDialog open={confirmLocal.open} onOpenChange={(open) => setConfirmLocal(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmLocal.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmLocal.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLocal.onConfirm}>Lanjutkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Champion Squad Selector — fetches and displays club members for selection
function ChampionSquadSelector({
  seasonId,
  championClubId,
  selectedIds,
  onToggle,
}: {
  seasonId: string;
  championClubId: string;
  selectedIds: string[];
  onToggle: (player: { id: string; gamertag: string; division: string; avatar?: string | null }) => void;
}) {
  const [search, setSearch] = useState('');

  // Fetch members from champion club AND same-named clubs across both divisions
  // This allows selecting members from the same club name regardless of division
  // e.g., if MAXIMOUS (male) is champion, MAXIMOUS (female) members are also available
  const { data: clubData, isLoading } = useQuery({
    queryKey: ['champion-club-members', championClubId],
    queryFn: async () => {
      const res = await fetch(`/api/clubs/champion-members?clubId=${championClubId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!championClubId,
  });

  const allPlayers = clubData?.members || [];

  if (isLoading) {
    return <div className="flex items-center justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>;
  }

  if (allPlayers.length === 0) {
    return <p className="text-[10px] text-muted-foreground text-center py-2">Tidak ada anggota club champion ditemukan</p>;
  }

  const filtered = search.trim()
    ? allPlayers.filter((p: { gamertag: string }) => p.gamertag.toLowerCase().includes(search.toLowerCase()))
    : allPlayers;

  const maleCount = allPlayers.filter((p: { division: string }) => p.division === 'male').length;
  const femaleCount = allPlayers.filter((p: { division: string }) => p.division === 'female').length;

  return (
    <div className="space-y-2">
      <Input
        placeholder="Cari anggota club (gamertag)..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="text-xs h-8"
      />
      <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
        {filtered.map((player: { id: string; gamertag: string; division: string; avatar?: string | null; clubDivision: string; role: string }) => {
          const isSelected = selectedIds.includes(player.id);
          return (
            <div
              key={player.id}
              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'border-yellow-500/30 bg-yellow-500/5'
                  : 'border-border/20 bg-card/30 hover:bg-muted/20'
              }`}
              onClick={() => onToggle({ id: player.id, gamertag: player.gamertag, division: player.division, avatar: player.avatar })}
            >
              <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={getAvatarUrl(player.gamertag, player.division as 'male' | 'female', player.avatar)}
                  alt={player.gamertag}
                  width={28}
                  height={28}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{player.gamertag}</p>
                <p className="text-[9px] text-muted-foreground">
                  <span className="capitalize">{player.division}</span>
                  {player.clubDivision !== player.division && (
                    <span className="text-idm-gold-warm ml-1">• dari club {player.clubDivision}</span>
                  )}
                  {player.role === 'captain' && <span className="ml-1 text-yellow-500">• Captain</span>}
                </p>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-black" />
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-[10px] text-muted-foreground text-center py-2">Anggota tidak ditemukan</p>
        )}
      </div>
      <p className="text-[9px] text-muted-foreground text-center">
        {allPlayers.length} anggota club {clubData?.clubName || 'champion'} • {maleCount} male, {femaleCount} female • bebas pilih dari divisi mana saja
      </p>
    </div>
  );
}
