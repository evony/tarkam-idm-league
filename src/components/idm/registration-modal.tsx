'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, X, Loader2, MapPin, Phone, Users, Music, CheckCircle2, AlertTriangle, Ban, Info
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';

interface SimilarPlayer {
  id: string;
  name: string;
  gamertag: string;
  division: string;
  city: string;
  phone: string | null;
  registrationStatus: string;
  isActive: boolean;
  matchType: 'exact_name' | 'similar_name' | 'phone_match';
  matchDetails: {
    nameMatch: boolean;
    cityMatch: boolean;
    phoneMatch: boolean;
    nameDifferent: boolean;
  };
}

interface RegistrationModalProps {
  open: boolean;
  onClose: () => void;
}

export function RegistrationModal({ open, onClose }: RegistrationModalProps) {
  const [division, setDivision] = useState<'male' | 'female'>('male');
  const [formData, setFormData] = useState({
    name: '',
    joki: '',
    phone: '',
    city: '',
    clubId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
    gamertag?: string;
  } | null>(null);

  const [warningState, setWarningState] = useState<{
    show: boolean;
    isBlocked: boolean;
    isHighRisk: boolean;
    canReRegister: boolean;
    reRegisterPlayerId: string | null;
    message: string;
    similarPlayers: SimilarPlayer[];
  } | null>(null);

  // Fetch clubs for dropdown
  const { data: stats } = useQuery({
    queryKey: ['stats', division],
    queryFn: async () => {
      const res = await fetch(`/api/stats?division=${division}`);
      return res.json();
    },
  });

  const { data: clubs } = useQuery({
    queryKey: ['register-clubs', division, stats?.season?.id],
    queryFn: async () => {
      const seasonId = stats?.season?.id;
      if (!seasonId) return [];
      const res = await fetch(`/api/clubs?seasonId=${seasonId}`);
      return res.json();
    },
    enabled: !!stats?.season?.id,
  });

  const handleSubmit = async (force = false) => {
    if (!formData.name.trim() || !formData.city.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          joki: formData.joki || null,
          phone: formData.phone || null,
          city: formData.city,
          clubId: formData.clubId || null,
          division,
          force,
        }),
      });

      const data = await res.json();

      // Handle blocked response (only truly blocked when pending in queue)
      if (data.blocked) {
        setWarningState({
          show: true,
          isBlocked: true,
          isHighRisk: true,
          canReRegister: false,
          reRegisterPlayerId: null,
          message: data.error || data.message,
          similarPlayers: data.similarPlayers || [],
        });
        setIsSubmitting(false);
        return;
      }

      // Handle re-registration available response
      if (data.canReRegister) {
        setWarningState({
          show: true,
          isBlocked: false,
          isHighRisk: data.isHighRisk || false,
          canReRegister: true,
          reRegisterPlayerId: data.reRegisterPlayerId,
          message: data.message,
          similarPlayers: data.similarPlayers || [],
        });
        setIsSubmitting(false);
        return;
      }

      // Handle warning response (similar name)
      if (data.warning && !force) {
        setWarningState({
          show: true,
          isBlocked: false,
          isHighRisk: data.isHighRisk || false,
          canReRegister: false,
          reRegisterPlayerId: null,
          message: data.message,
          similarPlayers: data.similarPlayers,
        });
        setIsSubmitting(false);
        return;
      }

      if (res.ok || data.success) {
        setSubmitResult({
          success: true,
          message: data.message,
          gamertag: data.player?.gamertag,
        });
        setFormData({ name: '', joki: '', phone: '', city: '', clubId: '' });
        setWarningState(null);
      } else {
        setSubmitResult({
          success: false,
          message: data.error || 'Gagal mendaftar',
        });
      }
    } catch {
      setSubmitResult({
        success: false,
        message: 'Terjadi kesalahan jaringan',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmWarning = () => {
    if (warningState?.isBlocked) return;
    setWarningState(prev => prev ? { ...prev, show: false } : null);
    handleSubmit(true);
  };

  const handleReRegister = () => {
    if (!warningState?.canReRegister || !warningState?.reRegisterPlayerId) return;
    setWarningState(prev => prev ? { ...prev, show: false } : null);
    handleReRegisterSubmit(warningState.reRegisterPlayerId);
  };

  const handleReRegisterSubmit = async (reRegisterPlayerId: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          joki: formData.joki || null,
          phone: formData.phone || null,
          city: formData.city,
          clubId: formData.clubId || null,
          division,
          reRegister: true,
          reRegisterPlayerId,
        }),
      });

      const data = await res.json();

      if (res.ok || data.success) {
        setSubmitResult({
          success: true,
          message: data.message,
          gamertag: data.player?.gamertag,
        });
        setFormData({ name: '', joki: '', phone: '', city: '', clubId: '' });
        setWarningState(null);
      } else {
        setSubmitResult({
          success: false,
          message: data.error || 'Gagal mendaftar ulang',
        });
      }
    } catch {
      setSubmitResult({
        success: false,
        message: 'Terjadi kesalahan jaringan',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelWarning = () => {
    setWarningState(null);
  };

  const handleClose = () => {
    setFormData({ name: '', joki: '', phone: '', city: '', clubId: '' });
    setSubmitResult(null);
    setWarningState(null);
    onClose();
  };

  const divisionColor = division === 'male' ? 'cyan' : 'purple';
  const divisionEmoji = division === 'male' ? '🕺' : '💃';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg sm:w-full z-50 max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Form Pendaftaran Peserta"
          >
            <Card className="border-idm-gold-warm/20 bg-background shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-idm-gold-warm/10 px-5 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${division === 'male' ? 'bg-[#06b6d4]/10' : 'bg-[#a855f7]/10'}`}>
                    <UserPlus className={`w-5 h-5 ${division === 'male' ? 'text-[#22d3ee]' : 'text-[#c084fc]'}`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gradient-fury">Daftar Peserta</h2>
                    <p className="text-[10px] text-muted-foreground">IDM League</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  aria-label="Tutup form pendaftaran"
                  className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <CardContent className="p-5 space-y-4">
                {/* Success State */}
                <AnimatePresence>
                  {submitResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center py-6"
                    >
                      {submitResult.success ? (
                        <>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', bounce: 0.5 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4"
                          >
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                          </motion.div>
                          <h3 className="text-lg font-bold text-green-500 mb-2">Pendaftaran Berhasil!</h3>
                          {submitResult.gamertag && (
                            <p className="text-base font-medium mb-2">
                              Gamertag kamu: <span className={`${division === 'male' ? 'text-[#22d3ee]' : 'text-[#c084fc]'} font-bold`}>{submitResult.gamertag}</span>
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mb-4">{submitResult.message}</p>
                          <Button
                            onClick={handleClose}
                            className="bg-idm-gold-warm hover:bg-idm-gold-warm/90 text-[#0c0a06] font-bold"
                          >
                            Tutup
                          </Button>
                        </>
                      ) : (
                        <>
                          <X className="w-8 h-8 text-red-500 mx-auto mb-3" />
                          <h3 className="text-lg font-bold text-red-500 mb-2">Gagal Mendaftar</h3>
                          <p className="text-sm text-muted-foreground mb-4">{submitResult.message}</p>
                          <Button
                            variant="outline"
                            onClick={() => setSubmitResult(null)}
                          >
                            Coba Lagi
                          </Button>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Warning Dialog */}
                <AnimatePresence>
                  {warningState?.show && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="p-4 rounded-xl border"
                      style={{
                        borderColor: warningState.isBlocked
                          ? 'rgba(239,68,68,0.5)'
                          : warningState.canReRegister
                            ? 'rgba(6,182,212,0.3)'
                            : warningState.isHighRisk
                              ? 'rgba(249,115,22,0.3)'
                              : 'rgba(234,179,8,0.3)',
                        backgroundColor: warningState.isBlocked
                          ? 'rgba(239,68,68,0.05)'
                          : warningState.canReRegister
                            ? 'rgba(6,182,212,0.05)'
                            : warningState.isHighRisk
                              ? 'rgba(249,115,22,0.05)'
                              : 'rgba(234,179,8,0.05)',
                      }}
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          warningState.isBlocked
                            ? 'bg-red-500/10'
                            : warningState.canReRegister
                              ? 'bg-cyan-500/10'
                              : warningState.isHighRisk
                                ? 'bg-orange-500/10'
                                : 'bg-yellow-500/10'
                        }`}>
                          {warningState.isBlocked ? (
                            <Ban className="w-5 h-5 text-red-500" />
                          ) : warningState.canReRegister ? (
                            <UserPlus className="w-5 h-5 text-cyan-500" />
                          ) : warningState.isHighRisk ? (
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-base font-bold mb-1 ${
                            warningState.isBlocked
                              ? 'text-red-500'
                              : warningState.canReRegister
                                ? 'text-cyan-500'
                                : warningState.isHighRisk
                                  ? 'text-orange-500'
                                  : 'text-yellow-500'
                          }`}>
                            {warningState.isBlocked
                              ? 'Pendaftaran Diblokir!'
                              : warningState.canReRegister
                                ? 'Daftar Ulang Tersedia!'
                                : warningState.isHighRisk
                                  ? 'Kemungkinan Duplikat!'
                                  : 'Nama Mirip Terdeteksi!'}
                          </h3>
                          <p className="text-xs text-muted-foreground">{warningState.message}</p>
                        </div>
                      </div>

                      <div className="mb-4 p-3 rounded-lg bg-muted/50">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Data yang cocok:</p>
                        <div className="space-y-2">
                          {warningState.similarPlayers.slice(0, 3).map((player) => (
                            <div key={player.id} className="flex items-center justify-between text-xs">
                              <div>
                                <span className="font-medium">{player.name}</span>
                                <span className="text-muted-foreground ml-1">(@{player.gamertag})</span>
                                {player.matchDetails.nameMatch && (
                                  <span className="ml-1 px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px]">Nama Sama</span>
                                )}
                                {player.matchDetails.phoneMatch && !player.matchDetails.nameMatch && (
                                  <span className="ml-1 px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px]">WA Sama</span>
                                )}
                                {/* Show player status */}
                                {warningState.canReRegister && player.registrationStatus && (
                                  <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${
                                    player.registrationStatus === 'approved'
                                      ? 'bg-green-500/10 text-green-400'
                                      : player.registrationStatus === 'rejected'
                                        ? 'bg-red-500/10 text-red-400'
                                        : player.registrationStatus === 'pending'
                                          ? 'bg-yellow-500/10 text-yellow-400'
                                          : 'bg-muted text-muted-foreground'
                                  }`}>
                                    {player.registrationStatus === 'approved' ? 'Aktif' : player.registrationStatus === 'rejected' ? 'Ditolak' : player.registrationStatus === 'pending' ? 'Menunggu' : player.registrationStatus}
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                {player.matchDetails.cityMatch && (
                                  <div className="flex items-center gap-1 text-orange-400">
                                    <MapPin className="w-3 h-3" />
                                    <span>{player.city}</span>
                                  </div>
                                )}
                                {player.matchDetails.phoneMatch && (
                                  <div className="flex items-center gap-1 text-orange-400">
                                    <Phone className="w-3 h-3" />
                                    <span>{player.phone}</span>
                                  </div>
                                )}
                                {!player.matchDetails.cityMatch && !player.matchDetails.phoneMatch && (
                                  <span className="text-muted-foreground">{player.city}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Re-registration info */}
                      {warningState.canReRegister && (
                        <div className="mb-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                          <div className="flex items-start gap-2">
                            <UserPlus className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-cyan-400">
                              <p><strong>Daftar Ulang:</strong> Data Anda akan diperbarui dan status dikembalikan ke "Menunggu Persetujuan". Admin akan memilihkan tier untuk Anda.</p>
                              <p className="mt-1 text-muted-foreground">Tier akan di-reset ke B dan admin akan menentukan tier yang sesuai.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Blocked message */}
                      {warningState.isBlocked && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-red-400">
                              <strong>Saran:</strong> Pendaftaran Anda sudah dalam antrian. Silakan tunggu admin menyetujui atau hubungi admin jika ada kendala.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* High risk message (non re-register, non blocked) */}
                      {warningState.isHighRisk && !warningState.isBlocked && !warningState.canReRegister && (
                        <div className="mb-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                          <p className="text-xs text-orange-400">
                            <strong>Perhatian:</strong> Jika ini adalah Anda, tidak perlu mendaftar ulang. Hubungi admin jika lupa gamertag.
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={handleCancelWarning}
                          disabled={isSubmitting}
                        >
                          {warningState.isBlocked ? 'Tutup' : 'Batalkan'}
                        </Button>
                        {warningState.canReRegister && (
                          <Button
                            size="sm"
                            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
                            onClick={handleReRegister}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <UserPlus className="w-4 h-4 mr-1" />
                            )}
                            {isSubmitting ? 'Memproses...' : 'Daftar Ulang'}
                          </Button>
                        )}
                        {!warningState.isBlocked && !warningState.canReRegister && (
                          <Button
                            size="sm"
                            className={`flex-1 ${warningState.isHighRisk ? 'bg-orange-500 hover:bg-orange-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white`}
                            onClick={handleConfirmWarning}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 mr-1" />
                            )}
                            {isSubmitting ? 'Memproses...' : 'Tetap Daftar'}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Registration Form */}
                {!submitResult && !warningState?.show && (
                  <>
                    {/* Division Selector */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-2 block">Division</label>
                      <div className="flex items-center bg-muted rounded-xl p-1 gap-1">
                        <button
                          type="button"
                          onClick={() => { setDivision('male'); setFormData(p => ({ ...p, clubId: '' })); }}
                          className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                            division === 'male'
                              ? 'bg-[#06b6d4] text-white shadow-md'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          🕺 Male
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDivision('female'); setFormData(p => ({ ...p, clubId: '' })); }}
                          className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                            division === 'female'
                              ? 'bg-[#a855f7] text-white shadow-md'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          💃 Female
                        </button>
                      </div>
                    </div>

                    {/* Nama/Nick */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                        Nama / Nick <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Music className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Masukkan nama atau nickname kamu"
                          value={formData.name}
                          onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                          className="pl-9"
                          maxLength={30}
                        />
                      </div>
                    </div>

                    {/* Joki */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                        Joki <span className="text-muted-foreground/70 text-[10px]">(opsional)</span>
                      </label>
                      <Input
                        placeholder="Nama joki jika dimainkan orang lain"
                        value={formData.joki}
                        onChange={(e) => setFormData(p => ({ ...p, joki: e.target.value }))}
                        maxLength={30}
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">Diisi jika player dijokikan oleh player lain</p>
                    </div>

                    {/* No WhatsApp */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                        No. WhatsApp <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="08xxxxxxxxxx"
                          value={formData.phone}
                          onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                          className="pl-9"
                          type="tel"
                          maxLength={15}
                        />
                      </div>
                    </div>

                    {/* Kota */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                        Kota <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Contoh: Makassar, Jakarta, Bandung"
                          value={formData.city}
                          onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                          className="pl-9"
                          maxLength={30}
                        />
                      </div>
                    </div>

                    {/* Club */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                        Club <span className="text-muted-foreground/70 text-[10px]">(opsional)</span>
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                        <Select
                          value={formData.clubId}
                          onValueChange={(val) => setFormData(p => ({ ...p, clubId: val === '_none' ? '' : val }))}
                        >
                          <SelectTrigger className="pl-9">
                            <SelectValue placeholder="Pilih Club" />
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

                    {/* Submit */}
                    <Button
                      className={`w-full font-bold ${
                        division === 'male'
                          ? 'bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-white'
                          : 'bg-[#a855f7] hover:bg-[#a855f7]/90 text-white'
                      }`}
                      size="lg"
                      disabled={!formData.name.trim() || !formData.city.trim() || !formData.phone.trim() || isSubmitting}
                      onClick={() => handleSubmit(false)}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-2" />
                      )}
                      {isSubmitting ? 'Mendaftar...' : `Daftar ${divisionEmoji} ${division === 'male' ? 'Male' : 'Female'}`}
                    </Button>

                    <p className="text-[10px] text-center text-muted-foreground">
                      Pendaftaran akan diverifikasi oleh admin sebelum disetujui
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
