'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import type { StatsData } from '@/types/stats';
import { DonationModal } from './donation-modal';
import { RegistrationModal } from './registration-modal';
import { PlayerProfile } from './player-profile';
import { ClubProfile } from './club-profile';
import { BackToTop } from './ui/back-to-top';
import { ScrollProgress } from './ui/scroll-progress';

export function LandingPage() {
  const { setCurrentView, setDivision } = useAppStore();
  const [selectedPlayer, setSelectedPlayer] = useState<StatsData['topPlayers'][0] & { division?: string } | null>(null);
  const [selectedClub, setSelectedClub] = useState<(StatsData['clubs'][0] & { division?: string }) | null>(null);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [donationModalType, setDonationModalType] = useState<'weekly' | 'season'>('season');
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* Data Queries */
  const { data: maleData } = useQuery<StatsData>({
    queryKey: ['stats', 'male'],
    queryFn: async () => { const res = await fetch('/api/stats?division=male'); return res.json(); },
  });

  const { data: femaleData } = useQuery<StatsData>({
    queryKey: ['stats', 'female'],
    queryFn: async () => { const res = await fetch('/api/stats?division=female'); return res.json(); },
  });

  const { data: cmsData } = useQuery({
    queryKey: ['cms-content'],
    queryFn: async () => { const res = await fetch('/api/cms/content'); if (!res.ok) return { settings: {} }; return res.json(); },
    staleTime: 30000,
  });

  const { data: leagueData } = useQuery({
    queryKey: ['league-landing'],
    queryFn: async () => { const res = await fetch('/api/league'); return res.json(); },
    staleTime: 60000,
  });

  const cms = cmsData?.settings || {};
  const cmsSiteTitle = cms.site_title || 'IDM League';
  const cmsHeroTitle = cms.hero_title || 'Idol Meta';
  const cmsHeroSubtitle = cms.hero_subtitle || 'Fan Made Edition';
  const cmsHeroTagline = cms.hero_tagline || 'Tempat dancer terbaik berkompetisi. Tournament mingguan, liga profesional, dan podium yang menunggu.';
  const cmsFooterText = cms.footer_text || '© 2025 IDM League — Idol Meta Fan Made Edition. All rights reserved.';
  const cmsFooterTagline = cms.footer_tagline || 'Dance. Compete. Dominate.';

  const enterApp = (division: 'male' | 'female') => {
    setDivision(division);
    setCurrentView('dashboard');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const floatingParticles = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: 1 + Math.random() * 2,
    delay: Math.random() * 14,
    duration: 14 + Math.random() * 18,
    opacity: 0.12 + Math.random() * 0.2,
  })), []);

  return (
    <div className="relative">
      <ScrollProgress />

      {/* Floating particles */}
      {floatingParticles.map(p => (
        <motion.div
          key={p.id}
          className="fixed w-1 h-1 rounded-full bg-amber-400/30 pointer-events-none z-0"
          style={{ left: p.left, top: 0 }}
          animate={{ y: ['0vh', '100vh'], opacity: [0, p.opacity, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      {/* Navigation */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/90 backdrop-blur-md border-b border-border shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xs">IDM</span>
            </div>
            <span className="font-bold text-sm hidden sm:inline">{cmsSiteTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => enterApp('male')} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-idm-male text-white hover:opacity-90 transition-opacity">
              🕺 Male
            </button>
            <button onClick={() => enterApp('female')} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-idm-female text-white hover:opacity-90 transition-opacity">
              💃 Female
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#0a1628] to-[#0d1117]" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(184,134,11,0.12) 0%, transparent 60%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 60%, rgba(245,158,11,0.06) 0%, transparent 50%)' }} />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight mb-4">
              <span className="text-gradient-fury">{cmsHeroTitle}</span>
            </h1>
            <p className="text-lg sm:text-xl text-amber-400/80 font-semibold tracking-wider uppercase mb-6">
              {cmsHeroSubtitle}
            </p>
            <p className="text-sm sm:text-base text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              {cmsHeroTagline}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => enterApp('male')}
              className="px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105"
            >
              🕺 Male Division
            </button>
            <button
              onClick={() => enterApp('female')}
              className="px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-300 hover:scale-105"
            >
              💃 Female Division
            </button>
          </motion.div>

          {/* Stats */}
          {(maleData || femaleData) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto"
            >
              {[
                { label: 'Players', value: (maleData?.totalPlayers || 0) + (femaleData?.totalPlayers || 0) },
                { label: 'Clubs', value: (maleData?.clubs.length || 0) + (femaleData?.clubs.length || 0) },
                { label: 'Prize Pool', value: `Rp ${((maleData?.totalPrizePool || 0) + (femaleData?.totalPrizePool || 0)).toLocaleString()}` },
                { label: 'Weeks', value: maleData?.seasonProgress.completedWeeks || 0 },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                  <div className="text-xl sm:text-2xl font-black text-gradient-fury">{stat.value}</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <motion.div
              className="w-1 h-2 rounded-full bg-amber-400"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Tournament Hub */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-2">
            <span className="text-gradient-fury">Tournament</span> Hub
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-sm">Compete weekly. Rise through the ranks. Claim the throne.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Male Tournament Card */}
            <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-6 hover:border-amber-500/40 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-idm-male flex items-center justify-center text-xl">🕺</div>
                <div>
                  <h3 className="font-bold">Male Division</h3>
                  <p className="text-xs text-muted-foreground">{maleData?.activeTournament?.name || 'No active tournament'}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 rounded-lg bg-amber-500/10">
                  <div className="text-lg font-bold text-amber-400">{maleData?.totalPlayers || 0}</div>
                  <div className="text-[10px] text-muted-foreground">Players</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-amber-500/10">
                  <div className="text-lg font-bold text-amber-400">{maleData?.clubs.length || 0}</div>
                  <div className="text-[10px] text-muted-foreground">Clubs</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-amber-500/10">
                  <div className="text-lg font-bold text-amber-400">Rp {(maleData?.totalPrizePool || 0).toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">Prize</div>
                </div>
              </div>
              <button onClick={() => enterApp('male')} className="w-full py-2.5 rounded-xl bg-idm-male text-white font-semibold text-sm hover:opacity-90 transition-opacity">
                Enter Male Division →
              </button>
            </div>

            {/* Female Tournament Card */}
            <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-transparent p-6 hover:border-pink-500/40 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-idm-female flex items-center justify-center text-xl">💃</div>
                <div>
                  <h3 className="font-bold">Female Division</h3>
                  <p className="text-xs text-muted-foreground">{femaleData?.activeTournament?.name || 'No active tournament'}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 rounded-lg bg-pink-500/10">
                  <div className="text-lg font-bold text-pink-400">{femaleData?.totalPlayers || 0}</div>
                  <div className="text-[10px] text-muted-foreground">Players</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-pink-500/10">
                  <div className="text-lg font-bold text-pink-400">{femaleData?.clubs.length || 0}</div>
                  <div className="text-[10px] text-muted-foreground">Clubs</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-pink-500/10">
                  <div className="text-lg font-bold text-pink-400">Rp {(femaleData?.totalPrizePool || 0).toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">Prize</div>
                </div>
              </div>
              <button onClick={() => enterApp('female')} className="w-full py-2.5 rounded-xl bg-idm-female text-white font-semibold text-sm hover:opacity-90 transition-opacity">
                Enter Female Division →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Top Players Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-2">
            <span className="text-gradient-fury">Top</span> Players
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-sm">The best dancers in the arena</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(maleData?.topPlayers || []).slice(0, 6).map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-amber-500/20 bg-card p-4 hover:border-amber-500/40 transition-all cursor-pointer"
                onClick={() => setSelectedPlayer({ ...player, division: 'male' })}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-yellow-600/30 flex items-center justify-center border border-amber-500/30">
                    <span className="text-sm font-bold text-amber-400">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{player.gamertag}</p>
                    <p className="text-[10px] text-muted-foreground">{player.club || 'No Club'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-amber-400">{player.points} pts</div>
                    <div className="text-[10px] text-muted-foreground">Tier {player.tier}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Clubs Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-2">
            <span className="text-gradient-fury">Club</span> Standings
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-sm">Battle of the clubs</p>

          <div className="rounded-2xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Club</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">W</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">L</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">GD</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Pts</th>
                </tr>
              </thead>
              <tbody>
                {(maleData?.clubs || []).map((club, i) => (
                  <tr key={club.id} className="border-t border-border hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelectedClub({ ...club, division: 'male' })}>
                    <td className="px-4 py-3 text-sm font-bold text-amber-400">{i + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium">{club.name}</td>
                    <td className="px-4 py-3 text-sm text-center">{club.wins}</td>
                    <td className="px-4 py-3 text-sm text-center">{club.losses}</td>
                    <td className="px-4 py-3 text-sm text-center">{club.gameDiff > 0 ? '+' : ''}{club.gameDiff}</td>
                    <td className="px-4 py-3 text-sm text-center font-bold">{club.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* MVP Hall of Fame */}
      <section className="py-20 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-2">
            <span className="text-gradient-fury">MVP</span> Hall of Fame
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-sm">The most valuable players across all tournaments</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(maleData?.mvpHallOfFame || []).slice(0, 6).map((entry, i) => (
              <div key={`${entry.id}-${i}`} className="rounded-xl border border-amber-500/20 bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-yellow-600/30 flex items-center justify-center border border-amber-500/30">
                    <span className="text-lg">👑</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{entry.gamertag}</p>
                    <p className="text-[10px] text-muted-foreground">Week {entry.weekNumber} · {entry.tournamentName}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400">
                      {entry.tier}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-pink-500/5" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Ready to <span className="text-gradient-fury">Compete</span>?
          </h2>
          <p className="text-muted-foreground mb-8 text-sm">Join the arena and show your dance moves to the world.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setRegistrationModalOpen(true)}
              className="px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg hover:shadow-amber-500/30 transition-all"
            >
              Register Now
            </button>
            <button
              onClick={() => { setDonationModalType('season'); setDonationModalOpen(true); }}
              className="px-8 py-3 rounded-xl font-bold text-sm border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all"
            >
              Support the League
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 bg-card">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
              <span className="text-white font-black text-[8px]">IDM</span>
            </div>
            <span className="font-bold text-sm">{cmsSiteTitle}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">{cmsFooterText}</p>
          <p className="text-[10px] text-muted-foreground/50 tracking-wider uppercase">{cmsFooterTagline}</p>
        </div>
      </footer>

      {/* Modals */}
      {selectedPlayer && (
        <PlayerProfile player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
      {selectedClub && (
        <ClubProfile club={selectedClub} onClose={() => setSelectedClub(null)} />
      )}
      <DonationModal
        open={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        type={donationModalType}
      />
      <RegistrationModal
        open={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
      />
      <BackToTop />
    </div>
  );
}
