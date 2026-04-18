'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Search, Swords, Trophy, Crown, Clock, MapPin, Heart, Users,
  ChevronDown, ChevronUp, Zap, CheckCircle2, XCircle, Play,
  Music, Calendar, Award, Shield, Target
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TierBadge } from './tier-badge';
import { useDivisionTheme } from '@/hooks/use-division-theme';
import { useAppStore } from '@/lib/store';
/* animation variants defined locally to avoid AnimatePresence conflict */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

/* ─── Types ─── */
interface Teammate {
  id: string; name: string; gamertag: string; tier: string; avatar?: string | null; isMe: boolean;
}
interface OpponentPlayer {
  id: string; name: string; gamertag: string; tier: string;
}
interface MatchInfo {
  id: string; round: number; matchNumber: number | null; bracket: string | null;
  status: string; format: string | null;
  opponent: { id?: string; name: string; players: OpponentPlayer[] };
  myScore: number | null; opponentScore: number | null;
  won: boolean; lost: boolean; isDraw: boolean;
  mvpPlayer: { id: string; name: string; gamertag: string } | null;
  scheduledAt: string | null;
}

/* ─── Status Step Indicator ─── */
function TournamentProgress({ status }: { status: string }) {
  const dt = useDivisionTheme();
  const steps = [
    { key: 'setup', label: 'Setup' },
    { key: 'registration', label: 'Daftar' },
    { key: 'approval', label: 'Approval' },
    { key: 'team_generation', label: 'Tim Dibentuk' },
    { key: 'bracket_generation', label: 'Bracket' },
    { key: 'main_event', label: 'Main Event' },
    { key: 'finalization', label: 'Finalisasi' },
    { key: 'completed', label: 'Selesai' },
  ];
  const currentIdx = steps.findIndex(s => s.key === status);

  return (
    <div className="flex items-center gap-0.5 overflow-x-auto pb-1 scrollbar-none">
      {steps.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isFuture = idx > currentIdx;
        return (
          <div key={step.key} className="flex items-center">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-semibold whitespace-nowrap ${
              isDone ? `${dt.bgSubtle} ${dt.neonText}` :
              isCurrent ? `${dt.bg} ${dt.text} ${dt.neonPulse}` :
              'bg-muted/30 text-muted-foreground/50'
            }`}>
              {isDone ? <CheckCircle2 className="w-3 h-3" /> :
               isCurrent ? <Play className="w-3 h-3" /> :
               <div className="w-3 h-3 rounded-full border border-current opacity-30" />}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-3 h-0.5 ${isDone ? dt.neonText : 'bg-muted/30'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Round Label Helper ─── */
function getRoundLabel(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return 'Grand Final';
  if (fromEnd === 1) return 'Semi Final';
  if (fromEnd === 2) return 'Quarter Final';
  return `Ronde ${round}`;
}

/* ─── Main Component ─── */
export function MyTournamentCard() {
  const { division } = useAppStore();
  const dt = useDivisionTheme();
  const [searchName, setSearchName] = useState('');
  const [submittedName, setSubmittedName] = useState('');
  const [showAllMatches, setShowAllMatches] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-tournament-status', submittedName, division],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/my-status?name=${encodeURIComponent(submittedName)}&division=${division}`);
      return res.json();
    },
    enabled: !!submittedName,
    refetchInterval: 30000, // Auto-refresh every 30s during live events
  });

  const handleSearch = () => {
    if (!searchName.trim()) return;
    setSubmittedName(searchName.trim());
    setShowAllMatches(false);
  };

  /* ─── Search State ─── */
  if (!submittedName) {
    return (
      <div className="max-w-lg mx-auto space-y-3">
        <Card className={`${dt.casinoCard} ${dt.cornerAccent}`}>
          <div className={dt.casinoBar} />
          <CardContent className="p-5 relative z-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dt.iconBg}`}>
                <Target className={`w-5 h-5 ${dt.neonText}`} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gradient-fury">Cari Turnamen Kamu</h3>
                <p className="text-[10px] text-muted-foreground">Masukkan nama atau gamertag untuk melihat status turnamen</p>
              </div>
            </div>

            {/* Search Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nama / Gamertag kamu..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9 glass"
                  maxLength={30}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!searchName.trim()}
                className={division === 'male' ? 'bg-idm-male hover:bg-idm-male/90 text-white' : 'bg-idm-female hover:bg-idm-female/90 text-white'}
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {/* Help text */}
            <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/20">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Tips:</strong> Ketik nama yang kamu daftarkan saat registrasi. Kamu akan bisa lihat tim kamu, lawan selanjutnya, dan status pertandingan.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* No active season/tournament info card */}
        <Card className={`${dt.casinoCard}`}>
          <div className={dt.casinoBar} />
          <CardContent className="p-5 relative z-10">
            <div className="flex flex-col items-center text-center">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${division === 'male' ? 'from-idm-male/20 to-idm-male-light/10' : 'from-idm-female/20 to-idm-female-light/10'} ${dt.border} flex items-center justify-center mb-3`}>
                <Calendar className={`w-6 h-6 ${dt.neonText}`} />
              </div>
              <h4 className={`text-sm font-bold ${dt.neonGradient} mb-1`}>Cara Menggunakan</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed max-w-xs">
                Ketik nama kamu di kolom pencarian di atas, lalu klik tombol cari.
                Kamu akan langsung melihat info tim, lawan, dan status turnamenmu.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ─── Loading State ─── */
  if (isLoading) {
    return (
      <Card className={`${dt.casinoCard}`}>
        <CardContent className="p-5 relative z-10 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="inline-block mb-3"
          >
            <Swords className={`w-8 h-8 ${dt.neonText}`} />
          </motion.div>
          <p className="text-sm text-muted-foreground">Mencari data turnamen...</p>
        </CardContent>
      </Card>
    );
  }

  /* ─── Not Found ─── */
  if (!data?.found) {
    return (
      <Card className={`${dt.casinoCard}`}>
        <CardContent className="p-5 relative z-10">
          <div className="text-center py-4">
            <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-red-400 mb-1">Tidak Ditemukan</h3>
            <p className="text-xs text-muted-foreground mb-3">{data?.message || 'Nama tidak ditemukan dalam database'}</p>
            <Button size="sm" variant="outline" onClick={() => { setSubmittedName(''); setSearchName(''); }}>
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ─── No Active Tournament ─── */
  if (!data.hasActiveTournament) {
    return (
      <Card className={`${dt.casinoCard}`}>
        <div className={dt.casinoBar} />
        <CardContent className="p-5 relative z-10">
          {/* Player info header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dt.iconBg}`}>
              <Users className={`w-5 h-5 ${dt.neonText}`} />
            </div>
            <div>
              <p className="text-sm font-bold">{data.player.gamertag}</p>
              <p className="text-[10px] text-muted-foreground">{data.player.name} • {data.player.city}</p>
            </div>
            <Button size="sm" variant="ghost" className="ml-auto text-xs" onClick={() => { setSubmittedName(''); setSearchName(''); }}>
              Ganti
            </Button>
          </div>

          <div className="text-center py-4">
            <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-bold mb-1">Belum Ada Turnamen Aktif</h3>
            <p className="text-xs text-muted-foreground">{data.message}</p>
            {data.latestTournament && (
              <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/20">
                <p className="text-[10px] text-muted-foreground">
                  Tournament terakhir: <strong>{data.latestTournament.name}</strong> (Status: {data.latestTournament.status})
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ─── Player Not In Team Yet ─── */
  if (!data.myTeam) {
    return (
      <Card className={`${dt.casinoCard}`}>
        <div className={dt.casinoBar} />
        <CardContent className="p-5 relative z-10">
          {/* Player info */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dt.iconBg}`}>
              <Users className={`w-5 h-5 ${dt.neonText}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{data.player.gamertag}</p>
              <p className="text-[10px] text-muted-foreground">{data.player.name} • {data.player.city}</p>
            </div>
            <Button size="sm" variant="ghost" className="shrink-0 text-xs" onClick={() => { setSubmittedName(''); setSearchName(''); }}>
              Ganti
            </Button>
          </div>

          {/* Tournament Info */}
          <div className={`p-3 rounded-lg ${dt.bgSubtle} border ${dt.borderSubtle} mb-4`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">{data.tournament.name}</span>
              <Badge className={`${dt.casinoBadge} text-[9px]`}>Week {data.tournament.weekNumber}</Badge>
            </div>
            <TournamentProgress status={data.tournament.status} />
          </div>

          <div className="text-center py-3">
            <Shield className={`w-8 h-8 ${dt.neonText} mx-auto mb-2 opacity-50`} />
            <h3 className="text-sm font-bold mb-1">Belum Masuk Tim</h3>
            <p className="text-xs text-muted-foreground">{data.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ─── FULL DASHBOARD — Player Has a Team ─── */
  const tournament = data.tournament;
  const myTeam = data.myTeam;
  const myMatches = data.myMatches || [];
  const liveMatch = data.liveMatch;
  const nextMatch = data.nextMatch;
  const nextOpponent = data.nextOpponent;
  const totalRounds = Math.max(...myMatches.map((m: MatchInfo) => m.round), 1);

  return (
    <div className="space-y-3 max-w-lg mx-auto">
      {/* ── Player + Team Header ── */}
      <Card className={`${dt.casinoCard} ${dt.cornerAccent} overflow-hidden`}>
        <div className={dt.casinoBar} />
          <CardContent className="p-0 relative z-10">
            <div className="p-4">
              {/* Player row */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dt.iconBg}`}>
                  <Users className={`w-5 h-5 ${dt.neonText}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{data.player.gamertag}</p>
                  <p className="text-[10px] text-muted-foreground">{data.player.name} • {data.player.city}</p>
                </div>
                <TierBadge tier={data.player.tier} />
                <Button size="sm" variant="ghost" className="shrink-0 h-7 w-7 p-0" onClick={() => { setSubmittedName(''); setSearchName(''); }}>
                  <Search className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Team Card */}
              <div className={`p-3 rounded-xl border ${data.isChampion ? 'border-yellow-500/40 bg-yellow-500/5' : data.isEliminated ? 'border-red-500/20 bg-red-500/5' : `${dt.borderSubtle} ${dt.bgSubtle}`}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {data.isChampion && <Crown className="w-4 h-4 text-yellow-500" />}
                    <span className={`text-sm font-bold ${data.isChampion ? 'text-yellow-500' : data.isEliminated ? 'text-red-400' : dt.neonText}`}>
                      {myTeam.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    {data.isChampion ? (
                      <Badge className="bg-yellow-500/15 text-yellow-500 border-0 text-[9px]">
                        <Crown className="w-3 h-3 mr-0.5" /> Juara!
                      </Badge>
                    ) : data.isEliminated ? (
                      <Badge className="bg-red-500/15 text-red-400 border-0 text-[9px]">
                        <XCircle className="w-3 h-3 mr-0.5" /> Tereliminasi
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500/15 text-green-400 border-0 text-[9px]">
                        <Play className="w-3 h-3 mr-0.5" /> Masih Bermain
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Teammates */}
                <div className="flex flex-wrap gap-1.5">
                  {myTeam.teammates.map((t: Teammate) => (
                    <div key={t.id} className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] ${
                      t.isMe
                        ? `bg-gradient-to-r ${division === 'male' ? 'from-idm-male/20 to-idm-male/5' : 'from-idm-female/20 to-idm-female/5'} border ${division === 'male' ? 'border-idm-male/30' : 'border-idm-female/30'}`
                        : `${dt.bgSubtle}`
                    }`}>
                      <TierBadge tier={t.tier} />
                      <span className={t.isMe ? 'font-bold' : ''}>{t.gamertag}</span>
                      {t.isMe && <span className="text-[8px] opacity-60">(kamu)</span>}
                    </div>
                  ))}
                </div>

                {/* Record */}
                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/20">
                  <span className="text-[10px] text-muted-foreground">
                    Rekor: <span className="text-green-400 font-bold">{data.matchRecord.wins}W</span>
                    <span className="mx-0.5">-</span>
                    <span className="text-red-400 font-bold">{data.matchRecord.losses}L</span>
                    {data.matchRecord.draws > 0 && (
                      <>
                        <span className="mx-0.5">-</span>
                        <span className="text-yellow-400 font-bold">{data.matchRecord.draws}D</span>
                      </>
                    )}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Kekuatan: <span className="font-bold">{myTeam.power}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Tournament Progress Bar */}
            <div className={`px-4 py-2.5 border-t ${dt.borderSubtle} bg-muted/20`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground">{tournament.name} • Week {tournament.weekNumber}</span>
                <Badge className={`${dt.casinoBadge} text-[9px]`}>{tournament.format?.replace('_', ' ').toUpperCase()}</Badge>
              </div>
              <TournamentProgress status={tournament.status} />
            </div>
          </CardContent>
        </Card>

      {/* ── Live Match Alert ── */}
      {liveMatch && (
        <div>
          <Card className="border-red-500/40 bg-red-500/5 shadow-lg shadow-red-500/10">
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-red-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-500">LIVE SEKARANG!</h3>
                  <p className="text-[10px] text-muted-foreground">{getRoundLabel(liveMatch.round, totalRounds)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <span className="text-xs font-bold">{myTeam.name}</span>
                <span className="text-sm font-bold tabular-nums text-red-400">
                  {liveMatch.myScore ?? 0} - {liveMatch.opponentScore ?? 0}
                </span>
                <span className="text-xs font-bold">{liveMatch.opponent.name}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Next Match Card ── */}
      {nextMatch && !data.isEliminated && !liveMatch && (
        <div>
          <Card className={`${dt.casinoCard} border-green-500/20`}>
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dt.iconBg}`}>
                  <Swords className={`w-4 h-4 ${dt.neonText}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Lawan Selanjutnya</h3>
                  <p className="text-[10px] text-muted-foreground">{getRoundLabel(nextMatch.round, totalRounds)} • {nextMatch.format || 'BO3'}</p>
                </div>
              </div>

              {/* Opponent Info */}
              <div className={`p-3 rounded-xl border ${dt.borderSubtle}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold">{nextOpponent?.name || 'TBD'}</span>
                  <Badge className={`${dt.casinoBadge} text-[9px]`}>Lawan</Badge>
                </div>
                {nextOpponent?.players?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {nextOpponent.players.map((p: OpponentPlayer) => (
                      <div key={p.id} className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/30 text-[10px]">
                        <TierBadge tier={p.tier} />
                        <span>{p.gamertag}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Match details */}
              {nextMatch.scheduledAt && (
                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(nextMatch.scheduledAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Eliminated Info ── */}
      {data.isEliminated && !data.isChampion && (
        <div>
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-red-400">Tim Kamu Tereliminasi</h3>
                  <p className="text-[10px] text-muted-foreground">{data.eliminationInfo || 'Tim kamu telah gugur dari bracket'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Champion Celebration ── */}
      {data.isChampion && (
        <div>
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="p-4 relative z-10 text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="inline-block mb-2"
              >
                <Trophy className="w-10 h-10 text-yellow-500" />
              </motion.div>
              <h3 className="text-base font-bold text-yellow-500 mb-1">Selamat, Juara!</h3>
              <p className="text-xs text-muted-foreground">{myTeam.name} memenangkan tournament ini!</p>
              {tournament.prizePool > 0 && (
                <p className="text-xs text-yellow-500 font-bold mt-1">Hadiah: Rp {tournament.prizePool.toLocaleString('id-ID')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Match History ── */}
      {myMatches.length > 0 && (
        <div>
          <Card className={`${dt.casinoCard}`}>
            <div className={dt.casinoBar} />
            <CardContent className="p-0 relative z-10">
              <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${dt.borderSubtle}`}>
                <div className={`w-5 h-5 rounded ${dt.iconBg} flex items-center justify-center shrink-0`}>
                  <Music className={`w-3 h-3 ${dt.neonText}`} />
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-wider">Riwayat Pertandingan</h3>
                <Badge className={`${dt.casinoBadge} ml-auto text-[9px]`}>{data.completedMatchCount} Main</Badge>
              </div>
              <div className="p-2 space-y-1.5">
                {(showAllMatches ? myMatches : myMatches.slice(0, 3)).map((m: MatchInfo) => {
                  const isLive = m.status === 'live';
                  return (
                    <div key={m.id} className={`p-2.5 rounded-lg border ${
                      isLive ? 'border-red-500/30' :
                      m.won ? `border-green-500/20 ${dt.bgSubtle}` :
                      m.lost ? 'border-red-500/10' :
                      `border-border/20`
                    }`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {getRoundLabel(m.round, totalRounds)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isLive && (
                            <Badge className="bg-red-500/15 text-red-500 border-0 text-[8px] animate-pulse">LIVE</Badge>
                          )}
                          {m.won && <Badge className="bg-green-500/15 text-green-400 border-0 text-[8px]">Menang</Badge>}
                          {m.lost && <Badge className="bg-red-500/15 text-red-400 border-0 text-[8px]">Kalah</Badge>}
                          {m.isDraw && <Badge className="bg-yellow-500/15 text-yellow-400 border-0 text-[8px]">Seri</Badge>}
                          {m.format && <Badge className={`${dt.casinoBadge} text-[8px]`}>{m.format}</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold flex-1 ${m.won ? 'text-green-400' : ''}`}>
                          {myTeam.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {m.myScore !== null && m.opponentScore !== null ? (
                            <>
                              <span className={`text-sm font-bold tabular-nums ${m.won ? 'text-green-400' : m.lost ? 'text-red-400' : ''}`}>{m.myScore}</span>
                              <span className="text-[10px] text-muted-foreground">-</span>
                              <span className={`text-sm font-bold tabular-nums ${m.lost ? 'text-red-400' : m.won ? 'text-green-400' : ''}`}>{m.opponentScore}</span>
                            </>
                          ) : (
                            <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-muted/50">VS</span>
                          )}
                        </div>
                        <span className={`text-xs font-semibold flex-1 text-right ${m.lost ? 'text-red-400' : ''}`}>
                          {m.opponent.name}
                        </span>
                      </div>
                      {m.mvpPlayer && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <Crown className="w-2.5 h-2.5 text-yellow-500" />
                          <span className="text-[9px] text-yellow-500 font-medium">MVP: {m.mvpPlayer.gamertag}</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Show more toggle */}
                {myMatches.length > 3 && (
                  <button
                    onClick={() => setShowAllMatches(!showAllMatches)}
                    className="w-full py-1.5 text-[10px] text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors"
                  >
                    {showAllMatches ? (
                      <>Tutup <ChevronUp className="w-3 h-3" /></>
                    ) : (
                      <>Lihat semua ({myMatches.length}) <ChevronDown className="w-3 h-3" /></>
                    )}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Tournament Quick Info ── */}
      <div>
        <Card className={`${dt.casinoCard}`}>
          <CardContent className="p-3 relative z-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {tournament.prizePool > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Trophy className="w-3 h-3 text-yellow-500 shrink-0" />
                  <span>Rp {tournament.prizePool.toLocaleString('id-ID')}</span>
                </div>
              )}
              {tournament.location && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>{tournament.location}</span>
                </div>
              )}
              {tournament.bpm > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Heart className="w-3 h-3 text-red-400 shrink-0" />
                  <span>{tournament.bpm} BPM</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Users className="w-3 h-3 shrink-0" />
                <span>{tournament.totalTeams} Tim</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
