'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Music, Shield, Crown, Clock, Flame,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MVPCardSkeleton } from '../ui/skeleton';
import { TierBadge } from '../tier-badge';
import { SectionHeader } from './shared';
import { fadeLeft, fadeRight, stagger } from './variants';
import { getAvatarUrl } from '@/lib/utils';
import type { StatsData } from '@/types/stats';

interface MvpSectionProps {
  maleData: StatsData | undefined;
  femaleData: StatsData | undefined;
  isDataLoading: boolean;
  cmsSections: Record<string, any>;
  setSelectedPlayer: (player: StatsData['topPlayers'][0] & { division?: string } | null) => void;
}

export function MvpSection({
  maleData,
  femaleData,
  isDataLoading,
  cmsSections,
  setSelectedPlayer,
}: MvpSectionProps) {
  return (
    <>
      {/* ========== MVP ARENA — Dramatic Split Hero Cards ========== */}
      <section id="mvp" role="region" aria-label="MVP Arena" className="py-24 px-4 relative overflow-hidden">
        {/* Background — Dark theater with spotlight cone */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[#0a0806]/50 to-background" />
        {/* Spotlight cone from top center */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px]" style={{ background: 'conic-gradient(from 170deg at 50% 0%, transparent 10%, rgba(212,168,83,0.04) 30%, rgba(212,168,83,0.06) 40%, rgba(212,168,83,0.04) 50%, transparent 70%)' }} />
        </div>
        <div className="ambient-light" style={{ top: '30%', left: '15%', animationDuration: '22s' }} />

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}>
            <SectionHeader icon={Crown} label={cmsSections.mvp?.subtitle || "Hall of Fame"} title={cmsSections.mvp?.title || "MVP Arena"} subtitle={cmsSections.mvp?.description || "Pemain terbaik dari setiap divisi — Dipilih admin berdasarkan skor tertinggi"} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative max-w-5xl mx-auto">
              {/* Vertical Gold Divider */}
              <div className="hidden md:block absolute top-12 bottom-12 left-1/2 w-px bg-gradient-to-b from-transparent via-idm-gold-warm/30 to-transparent z-10" />

              {isDataLoading ? (
                <>
                  <MVPCardSkeleton accent="#06b6d4" />
                  <MVPCardSkeleton accent="#a855f7" />
                </>
              ) : (
              <>
              {/* Male MVP — Left DRAMATIC HERO CARD */}
              <motion.div variants={fadeLeft}>
                {(() => {
                  const mvp = maleData?.mvpHallOfFame?.[0];
                  if (!mvp) return (
                    <div className="relative rounded-2xl overflow-hidden min-h-[520px] champion-gold-frame border border-[#06b6d4]/20 bg-[#0c0a06] flex flex-col items-center justify-center p-8">
                      {/* Subtle radial glow */}
                      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.08), transparent 60%)' }} />
                      {/* Dashed avatar placeholder */}
                      <div className="relative z-10 w-28 h-28 rounded-full border-2 border-dashed border-[#06b6d4]/25 flex items-center justify-center mb-6">
                        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                          <Crown className="w-16 h-16 text-[#06b6d4]/30" />
                        </motion.div>
                      </div>
                      {/* Decorative gold lines flanking text */}
                      <div className="relative z-10 flex items-center gap-3 mb-2">
                        <div className="w-12 h-px bg-gradient-to-r from-transparent to-idm-gold-warm/40" />
                        <p className="text-sm font-bold text-white/80 uppercase tracking-widest">MVP Belum Dipilih</p>
                        <div className="w-12 h-px bg-gradient-to-l from-transparent to-idm-gold-warm/40" />
                      </div>
                      <p className="relative z-10 text-xs text-muted-foreground/80 mt-1">Tunjukkan skillmu — jadilah MVP pertama di divisi ini!</p>
                    </div>
                  );
                  return (
                    <div
                      className="relative rounded-2xl overflow-hidden cursor-pointer group min-h-[520px] border border-[#06b6d4]/15 hover:border-[#06b6d4]/30 transition-all duration-300 mvp-card-glow champion-gold-frame hover:shadow-[0_0_50px_rgba(212,168,83,0.15)]"
                      style={{ boxShadow: '0 0 40px rgba(6,182,212,0.08)' }}
                      role="button"
                      tabIndex={0}
                      aria-label={`View MVP profile: ${mvp.gamertag}`}
                      onClick={() => {
                        const found = maleData?.topPlayers?.find(p => p.gamertag === mvp.gamertag);
                        if (found) setSelectedPlayer({ ...found, division: 'male' });
                      }}
                    >
                      {/* Gold shimmer accent line — male */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent z-20" />
                      {/* Full-Bleed Avatar Background */}
                      <Image src={getAvatarUrl(mvp.gamertag, 'male', mvp.avatar)} alt={mvp.gamertag} fill sizes="50vw" className="object-cover object-[center_25%] group-hover:scale-105 transition-transform duration-700" />
                      {/* Multi-layer Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a06] via-[#0c0a06]/50 to-[#0c0a06]/30" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a06]/70 via-transparent to-transparent" />
                      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 80%, rgba(6,182,212,0.15), transparent 60%)' }} />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                        <div className="flex items-center gap-2 bg-[#06b6d4]/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#06b6d4]/30">
                          <Music className="w-4 h-4 text-[#22d3ee]" />
                          <span className="text-[11px] font-bold text-[#22d3ee] uppercase tracking-wider">Male</span>
                        </div>
                        <div className="mvp-badge-premium glow-pulse flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-idm-gold-warm/40" style={{ background: 'linear-gradient(135deg, rgba(212,168,83,0.35), rgba(212,168,83,0.15))' }}>
                          <Crown className="w-6 h-6 text-idm-gold-warm" />
                          <span className="text-sm font-black text-idm-gold-warm uppercase tracking-wider">MVP</span>
                        </div>
                      </div>

                      {/* Bottom Info — DRAMATIC */}
                      <div className="absolute bottom-0 inset-x-0 p-5 z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-3.5 h-3.5 text-[#22d3ee]" />
                          <span className="text-[11px] font-bold text-[#22d3ee]">Week {mvp.weekNumber}</span>
                        </div>
                        <div className="relative">
                          {/* Faint MVP watermark */}
                          <span className="absolute -top-4 left-0 text-8xl font-black text-white opacity-[0.03] -rotate-12 select-none pointer-events-none">MVP</span>
                          <p className="text-3xl sm:text-4xl font-black text-white leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{mvp.gamertag}</p>
                        </div>
                        <div className="flex items-center gap-2.5 mt-2">
                          <TierBadge tier={mvp.tier} />
                          {mvp.totalMvp > 1 && <span className="text-[11px] font-bold text-yellow-400 bg-yellow-500/20 px-2.5 py-1 rounded-lg">{mvp.totalMvp}x MVP</span>}
                        </div>
                        {/* Big Stats — with subtle panel bg */}
                        <div className="mvp-stats-panel flex items-center gap-5 mt-4 pt-3 px-3 pb-1">
                          <div>
                            <p className="text-2xl font-black text-[#22d3ee]">{mvp.points}</p>
                            <p className="text-[9px] text-[#67e8f9]/50 uppercase font-semibold">Points</p>
                          </div>
                          <div className="w-px h-8 bg-white/10" />
                          <div>
                            <p className="text-2xl font-black text-green-400">{mvp.totalWins}</p>
                            <p className="text-[9px] text-green-400/50 uppercase font-semibold">Wins</p>
                          </div>
                          {mvp.streak > 0 && (
                            <>
                              <div className="w-px h-8 bg-white/10" />
                              <div>
                                <p className="text-2xl font-black text-orange-400 flex items-center gap-1.5"><Flame className="w-6 h-6 drop-shadow-[0_0_6px_rgba(251,146,60,0.5)]" />{mvp.streak}</p>
                                <p className="text-[9px] text-orange-400/50 uppercase font-semibold">Streak</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>

              {/* Female MVP — Right DRAMATIC HERO CARD */}
              <motion.div variants={fadeRight}>
                {(() => {
                  const mvp = femaleData?.mvpHallOfFame?.[0];
                  if (!mvp) return (
                    <div className="relative rounded-2xl overflow-hidden min-h-[520px] champion-gold-frame border border-[#a855f7]/20 bg-[#0c0a06] flex flex-col items-center justify-center p-8">
                      {/* Subtle radial glow */}
                      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(168,85,247,0.08), transparent 60%)' }} />
                      {/* Dashed avatar placeholder */}
                      <div className="relative z-10 w-28 h-28 rounded-full border-2 border-dashed border-[#a855f7]/25 flex items-center justify-center mb-6">
                        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                          <Crown className="w-16 h-16 text-[#a855f7]/30" />
                        </motion.div>
                      </div>
                      {/* Decorative gold lines flanking text */}
                      <div className="relative z-10 flex items-center gap-3 mb-2">
                        <div className="w-12 h-px bg-gradient-to-r from-transparent to-idm-gold-warm/40" />
                        <p className="text-sm font-bold text-white/80 uppercase tracking-widest">MVP Belum Dipilih</p>
                        <div className="w-12 h-px bg-gradient-to-l from-transparent to-idm-gold-warm/40" />
                      </div>
                      <p className="relative z-10 text-xs text-muted-foreground/80 mt-1">Tunjukkan skillmu — jadilah MVP pertama di divisi ini!</p>
                    </div>
                  );
                  return (
                    <div
                      className="relative rounded-2xl overflow-hidden cursor-pointer group min-h-[520px] border border-[#a855f7]/15 hover:border-[#a855f7]/30 transition-all duration-300 mvp-card-glow champion-gold-frame hover:shadow-[0_0_50px_rgba(212,168,83,0.15)]"
                      style={{ boxShadow: '0 0 40px rgba(168,85,247,0.08)' }}
                      role="button"
                      tabIndex={0}
                      aria-label={`View MVP profile: ${mvp.gamertag}`}
                      onClick={() => {
                        const found = femaleData?.topPlayers?.find(p => p.gamertag === mvp.gamertag);
                        if (found) setSelectedPlayer({ ...found, division: 'female' });
                      }}
                    >
                      {/* Gold shimmer accent line — female */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#a855f7] to-transparent z-20" />
                      {/* Full-Bleed Avatar Background */}
                      <Image src={getAvatarUrl(mvp.gamertag, 'female', mvp.avatar)} alt={mvp.gamertag} fill sizes="50vw" className="object-cover object-[center_25%] group-hover:scale-105 transition-transform duration-700" />
                      {/* Multi-layer Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a06] via-[#0c0a06]/50 to-[#0c0a06]/30" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a06]/70 via-transparent to-transparent" />
                      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 80%, rgba(168,85,247,0.15), transparent 60%)' }} />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                        <div className="flex items-center gap-2 bg-[#a855f7]/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#a855f7]/30">
                          <Shield className="w-4 h-4 text-[#c084fc]" />
                          <span className="text-[11px] font-bold text-[#c084fc] uppercase tracking-wider">Female</span>
                        </div>
                        <div className="mvp-badge-premium glow-pulse flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-idm-gold-warm/40" style={{ background: 'linear-gradient(135deg, rgba(212,168,83,0.35), rgba(212,168,83,0.15))' }}>
                          <Crown className="w-6 h-6 text-idm-gold-warm" />
                          <span className="text-sm font-black text-idm-gold-warm uppercase tracking-wider">MVP</span>
                        </div>
                      </div>

                      {/* Bottom Info — DRAMATIC */}
                      <div className="absolute bottom-0 inset-x-0 p-5 z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-3.5 h-3.5 text-[#c084fc]" />
                          <span className="text-[11px] font-bold text-[#c084fc]">Week {mvp.weekNumber}</span>
                        </div>
                        <div className="relative">
                          {/* Faint MVP watermark */}
                          <span className="absolute -top-4 left-0 text-8xl font-black text-white opacity-[0.03] -rotate-12 select-none pointer-events-none">MVP</span>
                          <p className="text-3xl sm:text-4xl font-black text-white leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{mvp.gamertag}</p>
                        </div>
                        <div className="flex items-center gap-2.5 mt-2">
                          <TierBadge tier={mvp.tier} />
                          {mvp.totalMvp > 1 && <span className="text-[11px] font-bold text-yellow-400 bg-yellow-500/20 px-2.5 py-1 rounded-lg">{mvp.totalMvp}x MVP</span>}
                        </div>
                        {/* Big Stats — with subtle panel bg */}
                        <div className="mvp-stats-panel flex items-center gap-5 mt-4 pt-3 px-3 pb-1">
                          <div>
                            <p className="text-2xl font-black text-[#c084fc]">{mvp.points}</p>
                            <p className="text-[9px] text-[#e9d5ff]/50 uppercase font-semibold">Points</p>
                          </div>
                          <div className="w-px h-8 bg-white/10" />
                          <div>
                            <p className="text-2xl font-black text-green-400">{mvp.totalWins}</p>
                            <p className="text-[9px] text-green-400/50 uppercase font-semibold">Wins</p>
                          </div>
                          {mvp.streak > 0 && (
                            <>
                              <div className="w-px h-8 bg-white/10" />
                              <div>
                                <p className="text-2xl font-black text-orange-400 flex items-center gap-1.5"><Flame className="w-6 h-6 drop-shadow-[0_0_6px_rgba(251,146,60,0.5)]" />{mvp.streak}</p>
                                <p className="text-[9px] text-orange-400/50 uppercase font-semibold">Streak</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
              </>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
