'use client';

import Image from 'next/image';
import { Crown, Users, Shield, Wallet, Swords, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MarqueeTicker } from '../marquee-ticker';
import { StatCard } from './shared';
import { formatCurrency } from '@/lib/utils';
import type { StatsData } from '@/types/stats';

/**
 * Extracts YouTube video ID and start time from various URL formats
 */
function parseYouTubeUrl(url: string): { id: string; startTime: number } | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  let id: string | null = null;
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) { id = match[1]; break; }
  }
  if (!id) return null;

  let startTime = 0;
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const t = urlObj.searchParams.get('t');
    if (t) {
      const seconds = parseInt(t.replace(/s$/, ''), 10);
      if (!isNaN(seconds)) startTime = seconds;
    }
  } catch {
    const tMatch = url.match(/[?&]t=(\d+)s?/);
    if (tMatch) startTime = parseInt(tMatch[1], 10);
  }

  return { id, startTime };
}

interface HeroSectionProps {
  heroRef: React.RefObject<HTMLElement>;
  cmsLogo: string;
  cmsSiteTitle: string;
  cmsHeroTitle: string;
  cmsHeroSubtitle: string;
  cmsHeroTagline: string;
  cmsHeroBgDesktop: string;
  cmsHeroBgMobile: string;
  cmsHeroBgVideo?: string;
  cmsSections: Record<string, any>;
  leagueData: any;
  nextSeason: number;
  maleData: StatsData | undefined;
  particles: Array<{id: number; left: string; size: number; delay: number; duration: number; opacity: number; alt: boolean}>;
  onRegister: () => void;
  onVideoPlay?: (url: string, title: string) => void;
}

export function HeroSection({
  heroRef,
  cmsSiteTitle, cmsHeroTitle, cmsHeroSubtitle, cmsHeroTagline,
  cmsHeroBgDesktop, cmsHeroBgMobile, cmsHeroBgVideo, cmsSections, leagueData,
  nextSeason, maleData, particles, onRegister, onVideoPlay
}: HeroSectionProps) {
  return (
    <>
      {/* ========== HERO SECTION — Cinematic ========== */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Multi-layer Background — static images (parallax removed for performance) */}
        {cmsHeroBgVideo ? (() => {
          const ytInfo = parseYouTubeUrl(cmsHeroBgVideo);
          const ytId = ytInfo?.id ?? null;
          return ytId ? (
            /* YouTube autoplay embed as cinematic background (bandwidth goes to YouTube, not Vercel) */
            <div className="absolute inset-0">
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1${ytInfo?.startTime ? `&start=${ytInfo.startTime}` : ''}`}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260%] sm:w-[120%] h-[260%] sm:h-[120%] min-w-full min-h-full border-0 pointer-events-none"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  aria-hidden="true"
                  title="Hero background video"
                />
              </div>
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/50" />
              {/* Watch Video button — opens modal with controls */}
              {onVideoPlay && (
                <button
                  onClick={() => onVideoPlay(cmsHeroBgVideo!, 'Video Highlight')}
                  className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-idm-gold-warm/25 border border-idm-gold-warm/30 hover:bg-idm-gold-warm/25 hover:border-idm-gold-warm/50 transition-all cursor-pointer group"
                  aria-label="Play video with controls"
                >
                  <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-idm-gold-warm fill-idm-gold-warm" />
                  <span className="text-[10px] sm:text-xs font-semibold text-idm-gold-warm tracking-wider uppercase">Watch Video</span>
                </button>
              )}
            </div>
          ) : (
            /* Cloudinary / direct video URL — autoplay background */
            <div className="absolute inset-0">
              <video
                src={cmsHeroBgVideo}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover"
                aria-hidden="true"
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/50" />
            </div>
          );
        })() : (
          <>
            <div className="absolute inset-0 hidden sm:block">
              <Image src={cmsHeroBgDesktop} alt="" fill priority sizes="100vw" className="object-cover" aria-hidden="true" />
            </div>
            <div className="absolute inset-0 sm:hidden">
              <Image src={cmsHeroBgMobile} alt="" fill priority sizes="100vw" className="object-cover object-top" aria-hidden="true" />
            </div>
          </>
        )}

        {/* Layer 2: Mid-depth gold haze */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 60%, rgba(212,168,83,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Gradient Overlay — 2 layers (simplified from 3) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a06] via-[#0c0a06]/50 to-[#0c0a06]/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a06]/50 via-transparent to-[#0c0a06]/50" />

        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(rgba(212,168,83,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,83,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        {/* Ambient Orbit Light */}
        <div className="ambient-light" style={{ top: '30%', left: '20%' }} />
        <div className="ambient-light" style={{ top: '60%', right: '10%', animationDelay: '-10s', animationDuration: '25s' }} />

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {particles.map((p) => (
            <div
              key={p.id}
              className={p.alt ? 'particle-alt' : 'particle'}
              style={{
                left: p.left,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                opacity: p.opacity,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto w-full">
          {/* Decorative top accent line */}
          <div className="animate-fade-enter mb-6">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-16 sm:w-28 bg-gradient-to-r from-transparent to-idm-gold-warm/60" />
              <div className="w-2 h-2 rounded-full bg-idm-gold-warm/70 shadow-[0_0_8px_rgba(212,168,83,0.4)]" />
              <div className="h-px w-16 sm:w-28 bg-gradient-to-l from-transparent to-idm-gold-warm/60" />
            </div>
          </div>

          {/* Brand Label */}
          <div className="stagger-item-fast stagger-d0">
            <p className="animate-fade-enter-sm text-xs sm:text-sm text-idm-gold-warm/60 font-bold tracking-widest uppercase" style={{ animationDelay: '200ms' }}>
              {cmsSiteTitle}
            </p>
          </div>

          {/* Main Title */}
          <div className="stagger-item-fast stagger-d1">
            <h1 className="animate-fade-enter-sm text-3xl sm:text-5xl lg:text-6xl text-gradient-fury font-bold tracking-tight uppercase mt-2" style={{ animationDelay: '400ms' }}>
              {cmsHeroTitle}
            </h1>
            <p className="animate-fade-enter-sm text-lg sm:text-2xl lg:text-3xl text-[#e8d5a3] font-light tracking-widest uppercase mt-1" style={{ animationDelay: '500ms' }}>
              {cmsHeroSubtitle}
            </p>
          </div>

          {/* Animated Badges — Dynamic status badges */}
          <div className="stagger-item-fast stagger-d2 flex items-center justify-center gap-2.5 mt-6 flex-wrap">
            {(cmsSections.hero?.cards?.length > 0
              ? cmsSections.hero.cards.filter((c: { isActive: boolean }) => c.isActive).map((c: { title: string; order: number }) => ({ text: c.title, glow: c.order === 1 }))
              : [
                  { text: leagueData?.ligaChampion ? `Season ${leagueData.ligaChampion.seasonNumber} — Completed` : 'Liga IDM', glow: true },
                  { text: 'Weekly Tournament', glow: false },
                  { text: leagueData?.ligaChampion ? `Liga IDM — S${nextSeason} Menunggu Dana` : leagueData?.preSeason ? 'Liga IDM — Pre-Season' : leagueData?.hasData ? 'Liga IDM' : 'Liga IDM — Segera', glow: false },
                ]
            ).map((badge: { text: string; glow: boolean }, i: number) => (
              <div
                key={i}
                className="animate-fade-enter-sm"
                style={{ animationDelay: `${600 + i * 80}ms` }}
              >
                <Badge className={`bg-idm-gold-warm/10 text-idm-gold-warm text-xs border border-idm-gold-warm/20 px-4 py-2 ${badge.glow ? 'glow-pulse' : ''}`}>
                  {badge.text}
                </Badge>
              </div>
            ))}
          </div>

          {/* Champion Badge — Season Winner */}
          {leagueData?.ligaChampion && (
            <div
              className="stagger-item-fast flex items-center justify-center mt-3"
              style={{ animationDelay: '800ms' }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-idm-gold-warm/20 bg-idm-gold-warm/5">
                <Crown className="w-3.5 h-3.5 text-idm-gold-warm" />
                <span className="text-[10px] font-bold text-idm-gold-warm/80">S{leagueData.ligaChampion.seasonNumber} Champion:</span>
                {leagueData.ligaChampion.logo ? (
                  <img src={leagueData.ligaChampion.logo} alt="" className="w-4 h-4 rounded object-cover" />
                ) : null}
                <span className="text-[10px] font-black text-white">{leagueData.ligaChampion.name}</span>
              </div>
            </div>
          )}

          {/* Tagline */}
          <p className="stagger-item-fast text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-10 mt-8 leading-relaxed" style={{ animationDelay: '900ms' }}>
            {cmsHeroTagline}
          </p>

          {/* Hero CTA — Register Button */}
          <div className="stagger-item-fast flex items-center justify-center" style={{ animationDelay: '1000ms' }}>
            <button
              onClick={onRegister}
              aria-label="Register now for IDM League"
              className="hover-scale-md group relative cursor-pointer"
            >
              <div className="relative px-5 py-3 sm:px-10 sm:py-5 border-2 border-idm-gold-warm/60 rounded-sm transform -rotate-3 transition-all duration-300 group-hover:rotate-0 group-hover:scale-105 group-hover:border-idm-gold-warm/80">
                <div className="absolute inset-0 bg-idm-gold-warm/5 group-hover:bg-idm-gold-warm/10 transition-colors duration-300" />
                <div className="relative z-10">
                  <span className="font-bold text-base sm:text-xl tracking-wider sm:tracking-widest text-idm-gold-warm group-hover:text-[#f0c674] transition-colors">
                    DAFTAR SEKARANG
                  </span>
                  <div className="flex items-center justify-center gap-2 mt-1 sm:mt-1.5">
                    <div className="h-px flex-1 bg-idm-gold-warm/30" />
                    <span className="text-[8px] sm:text-[9px] text-idm-gold-warm/50 tracking-widest">GABUNG IDM LEAGUE</span>
                    <div className="h-px flex-1 bg-idm-gold-warm/30" />
                  </div>
                </div>
                {/* Corner brackets */}
                <div className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 w-2 h-2 sm:w-3 sm:h-3 border-t-2 border-l-2 border-idm-gold-warm/40 group-hover:border-idm-gold-warm/60 transition-colors" />
                <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 sm:w-3 sm:h-3 border-t-2 border-r-2 border-idm-gold-warm/40 group-hover:border-idm-gold-warm/60 transition-colors" />
                <div className="absolute bottom-0.5 left-0.5 sm:bottom-1 sm:left-1 w-2 h-2 sm:w-3 sm:h-3 border-b-2 border-l-2 border-idm-gold-warm/40 group-hover:border-idm-gold-warm/60 transition-colors" />
                <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 w-2 h-2 sm:w-3 sm:h-3 border-b-2 border-r-2 border-idm-gold-warm/40 group-hover:border-idm-gold-warm/60 transition-colors" />
              </div>
            </button>
          </div>

          {/* Quick Stats — Animated Counters */}
          <div className="stagger-item-fast mt-8 sm:mt-14 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-2xl mx-auto" style={{ animationDelay: '1100ms' }}>
            <StatCard icon={Users} value={`${maleData?.totalPlayers || 0}`} label="Players" delay={0} />
            <StatCard icon={Shield} value={`${leagueData?.stats?.totalClubs || maleData?.clubs?.length || 0}`} label="Club" delay={0.1} />
            <StatCard icon={Wallet} value={formatCurrency(maleData?.totalPrizePool || 0)} label="Prize Pool" delay={0.2} />
            <StatCard icon={Swords} value={leagueData?.ligaChampion ? `S${leagueData.ligaChampion.seasonNumber} Done` : leagueData?.preSeason ? 'Pre-Season' : `${maleData?.seasonProgress?.completedWeeks || 0} Week`} label={leagueData?.ligaChampion ? 'Liga IDM' : leagueData?.preSeason ? 'Liga IDM' : 'Weekly'} delay={0.3} />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          className="animate-fade-enter absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          aria-hidden="true"
          style={{ animationDelay: '1.5s' }}
        >
          <div
            className="animate-float-medium flex flex-col items-center gap-2"
          >
            <span className="text-[10px] text-idm-gold-warm/50 uppercase tracking-widest font-semibold">Jelajahi</span>
            <div className="w-6 h-10 rounded-full border-2 border-idm-gold-warm/20 flex items-start justify-center p-1.5">
              <div
                className="animate-float-subtle w-1.5 h-1.5 rounded-full bg-idm-gold-warm/60"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========== LIVE INFO TICKER — Marquee Banner ========== */}
      <div className="relative z-40 py-2.5 bg-background/85 border-y border-idm-gold-warm/10">
        <MarqueeTicker />
      </div>
    </>
  );
}
