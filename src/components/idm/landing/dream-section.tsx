'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Shield, Users, Flame, Gift, Swords, Crown, Sparkles, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fadeUp, stagger, scaleIn } from './shared';
import { ClubLogoImage } from '@/components/idm/club-logo-image';
import type { StatsData } from '@/types/stats';

interface DreamSectionProps {
  maleData: StatsData | undefined;
  femaleData: StatsData | undefined;
  leagueData: any;
  nextSeason: number;
  completedSeason: number;
  cmsSections: Record<string, any>;
  cmsSettings: Record<string, string>;
  onEnterApp: (division: 'male' | 'female') => void;
  openDonationModal: (type: 'weekly' | 'season', amount?: number) => void;
  onVideoPlay?: (url: string, title: string) => void;
}

export function DreamSection({ maleData, femaleData, leagueData, nextSeason, completedSeason, cmsSections, cmsSettings, onEnterApp, openDonationModal, onVideoPlay }: DreamSectionProps) {
  // Countdown timer
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const targetDate = cmsSettings?.countdown_target_date;
    if (!targetDate || !cmsSettings?.countdown_label) return;

    const target = new Date(targetDate).getTime();
    if (target <= Date.now()) return;

    const updateCountdown = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setCountdown(null);
        return;
      }
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [cmsSettings?.countdown_target_date, cmsSettings?.countdown_label]);

  // Manual CMS values with fallback to auto-calculated data
  const clubsCompeting = cmsSettings?.dream_clubs_competing ? parseInt(cmsSettings.dream_clubs_competing) : (leagueData?.stats?.totalClubs || 0);
  const matchesPlayed = cmsSettings?.dream_matches_played ? parseInt(cmsSettings.dream_matches_played) : (leagueData?.stats?.completedMatches || 0);
  const totalParticipants = cmsSettings?.dream_total_participants ? parseInt(cmsSettings.dream_total_participants) : ((maleData?.totalPlayers || 0) + (femaleData?.totalPlayers || 0));

  // Helper to replace template variables in CMS text
  const replaceVars = (text: string) => text
    .replace(/\{season\}/g, String(completedSeason))
    .replace(/\{champion\}/g, leagueData?.ligaChampion?.name || 'Champion')
    .replace(/\{clubs\}/g, String(clubsCompeting))
    .replace(/\{matches\}/g, String(matchesPlayed))
    .replace(/\{participants\}/g, String(totalParticipants));

  // CMS settings for Dream section text
  const dreamDescCompleted = cmsSettings?.dream_description_completed
    ? replaceVars(cmsSettings.dream_description_completed)
    : `Season ${completedSeason} telah berlangsung dengan meriah — ${leagueData?.ligaChampion?.name || 'Champion'} tampil sebagai champion. ${clubsCompeting} club bertanding, peserta bebas mix dari divisi male dan female. Season ${nextSeason} menunggu dukunganmu untuk terwujud.`;

  const dreamDescActive = cmsSettings?.dream_description_active
    ? replaceVars(cmsSettings.dream_description_active)
    : `${clubsCompeting} club bertanding, peserta bebas mix dari divisi male dan female di Liga IDM. Dukunganmu menunggu season berikutnya terwujud.`;

  const dreamSeasonNextText = cmsSettings?.dream_season_next_text
    ? replaceVars(cmsSettings.dream_season_next_text)
    : `Season ${leagueData?.ligaChampion?.seasonNumber || 1} sudah terbukti — champion dinobatkan, club bertanding. Season ${nextSeason} butuh dukunganmu untuk terwujud. Setiap kontribusi membawa kita lebih dekat.`;

  return (<>
      {/* ========== LIGA IDM — THE DREAM ========== */}
      <section id="dream" className="relative py-28 px-4 overflow-hidden">
        {/* Background — clean gradient without image */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(212,168,83,0.08) 0%, transparent 50%), radial-gradient(ellipse at 20% 70%, rgba(6,182,212,0.03) 0%, transparent 40%), radial-gradient(ellipse at 80% 70%, rgba(168,85,247,0.03) 0%, transparent 40%)' }} />
        {/* Ambient orbs */}
        <div className="ambient-light" style={{ top: '20%', right: '15%', animationDuration: '20s' }} />
        <div className="ambient-light" style={{ bottom: '30%', left: '10%', animationDuration: '18s', animationDelay: '-6s' }} />

        {/* Decorative ring behind content */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-idm-gold-warm/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-idm-gold-warm/8" />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <motion.div variants={fadeUp}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-idm-gold-warm/50" />
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-idm-gold-warm/20 bg-idm-gold-warm/5">
                <Trophy className="w-4 h-4 text-idm-gold-warm" />
                <span className="text-[11px] font-bold text-idm-gold-warm uppercase tracking-widest">Liga IDM</span>
              </div>
              <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-idm-gold-warm/50" />
            </div>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-5xl sm:text-7xl font-black text-gradient-champion leading-none">
            The Dream
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm text-muted-foreground mt-4 max-w-lg mx-auto leading-relaxed">
            {leagueData?.ligaChampion
              ? dreamDescCompleted
              : dreamDescActive
            }
          </motion.p>

          {/* Champion Highlight */}
          {leagueData?.ligaChampion && (
            <motion.div variants={fadeUp} className="mt-6">
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl border border-idm-gold-warm/20 bg-idm-gold-warm/5">
                <div className="relative">
                  <ClubLogoImage clubName={leagueData.ligaChampion.name} dbLogo={leagueData.ligaChampion.logo} alt={leagueData.ligaChampion.name} width={40} height={40} className="w-10 h-10 rounded-xl object-cover border border-idm-gold-warm/30" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-idm-gold-warm flex items-center justify-center">
                    <Crown className="w-3 h-3 text-[#0c0a06]" />
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xs text-idm-gold-warm/60 font-semibold uppercase tracking-wider">Season {leagueData.ligaChampion.seasonNumber} Champion</p>
                  <p className="text-lg font-black text-white">{leagueData.ligaChampion.name}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Season Highlights */}
          <motion.div variants={fadeUp} className="mt-10 grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { icon: Shield, value: `${clubsCompeting}`, label: 'Club Bertanding', accent: 'border-idm-gold-warm/15' },
              { icon: Swords, value: `${matchesPlayed}`, label: 'Match Dimainkan', accent: 'border-white/[0.08]' },
              { icon: Users, value: `${totalParticipants}`, label: 'Peserta Total', accent: 'border-idm-gold-warm/15' },
            ].map((s, i) => (
              <div key={s.label} className={`rounded-2xl bg-white/[0.03] backdrop-blur-sm border ${s.accent} p-4 sm:p-5 transition-all duration-300 hover:bg-white/[0.06] hover:scale-[1.02]`}>
                <s.icon className="w-4 h-4 text-idm-gold-warm mx-auto mb-2" />
                <p className="text-lg sm:text-2xl font-black text-white truncate">{s.value}</p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground/80 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Countdown Timer */}
          {countdown && cmsSettings?.countdown_label && (
            <motion.div variants={fadeUp} className="mt-8">
              <div className="rounded-2xl border border-idm-gold-warm/20 bg-idm-gold-warm/[0.04] p-5 sm:p-6 text-center">
                <p className="text-xs text-idm-gold-warm/70 font-bold uppercase tracking-widest mb-4">{cmsSettings.countdown_label}</p>
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  {[
                    { value: countdown.days, label: 'Hari' },
                    { value: countdown.hours, label: 'Jam' },
                    { value: countdown.minutes, label: 'Menit' },
                    { value: countdown.seconds, label: 'Detik' },
                  ].map((unit, i) => (
                    <div key={unit.label} className="flex items-center gap-2 sm:gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-idm-gold-warm/10 border border-idm-gold-warm/20 flex items-center justify-center">
                          <span className="text-xl sm:text-2xl font-black text-idm-gold-warm tabular-nums">{String(unit.value).padStart(2, '0')}</span>
                        </div>
                        <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider mt-1">{unit.label}</span>
                      </div>
                      {i < 3 && (
                        <span className="text-idm-gold-warm/40 font-bold text-lg sm:text-xl mb-4">:</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Liga IDM Season Next — Call for Support (simplified) */}
          <motion.div variants={fadeUp} className="mt-8">
            <div className="rounded-2xl border border-idm-gold-warm/15 bg-idm-gold-warm/5 p-5 sm:p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-idm-gold-warm" />
                <h4 className="text-sm font-bold text-idm-gold-warm">Liga IDM Season {nextSeason}</h4>
                <Badge className="bg-yellow-500/10 text-yellow-500 text-[9px] border-0">Menunggu</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                {dreamSeasonNextText}
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={() => openDonationModal('season')} className="px-7 py-3 rounded-2xl bg-gradient-to-r from-idm-gold-warm to-[#e8d5a3] text-[#0c0a06] font-black text-sm tracking-wider shadow-[0_0_30px_rgba(212,168,83,0.2)] hover:shadow-[0_0_60px_rgba(212,168,83,0.4)] transition-shadow cursor-pointer">
              <Gift className="w-4 h-4 inline mr-2" />Dukung Liga IDM Season {nextSeason}
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* ========== CTA — Premium Glass Reveal ========== */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/bg-section.jpg" alt="" fill sizes="100vw" className="object-cover opacity-10" aria-hidden="true" />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(212,168,83,0.08) 0%, transparent 50%)' }} />
        </div>

        {/* Decorative corner accents */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-idm-gold-warm/10 rounded-tl-xl" />
          <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-idm-gold-warm/10 rounded-tr-xl" />
          <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-idm-gold-warm/10 rounded-bl-xl" />
          <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-idm-gold-warm/10 rounded-br-xl" />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="relative z-10 max-w-lg mx-auto text-center"
        >
          <motion.div variants={scaleIn}>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block mb-4"
            >
              <Sparkles className="w-10 h-10 text-idm-gold-warm" />
            </motion.div>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-black text-gradient-champion mb-3">
            {cmsSections.cta?.title || 'Punya Skill? Buktikan.'}
          </motion.h2>
          <motion.p variants={fadeUp} className="text-xs text-muted-foreground mb-8">
            {cmsSections.cta?.description || 'Daftar sekarang dan tunjukkan siapa dancer terbaik.'}
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                className="w-full sm:w-auto btn-male px-6 py-4 sm:px-8 sm:py-6 text-xs sm:text-sm font-bold rounded-2xl transition-all"
                onClick={() => onEnterApp('male')}
              >
                Male Division <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto btn-female px-6 py-4 sm:px-8 sm:py-6 text-xs sm:text-sm font-bold rounded-2xl transition-all"
                onClick={() => onEnterApp('female')}
              >
                Female Division <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

  </>);
}
