'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';

import { useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Crown, Users, Swords, BookOpen, Trophy } from 'lucide-react';
import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import type { StatsData } from '@/types/stats';

// Section components
import { HeroSection } from './landing/hero-section';
import { AboutSection } from './landing/about-section';
import { TournamentHub } from './landing/tournament-hub';
import { ClubsSection } from './landing/clubs-section';
import { ChampionsSection } from './landing/champions-section';
import { MvpSection } from './landing/mvp-section';
import { DreamSection } from './landing/dream-section';
import { LandingFooter } from './landing/landing-footer';

// Shared hooks & components
import { useSwipeNavigation } from './landing/shared';

// Modal & utility components
import { PlayerProfile } from './player-profile';
import { ClubProfile } from './club-profile';
import { DonationModal } from './donation-modal';
import { RegistrationModal } from './registration-modal';
import { VideoModal } from './video-modal';
import { BackToTop } from './ui/back-to-top';
import { ScrollProgress } from './ui/scroll-progress';

export function LandingPage() {
  const { setCurrentView, setDivision } = useAppStore();
  const [selectedPlayer, setSelectedPlayer] = useState<StatsData['topPlayers'][0] & { division?: string } | null>(null);
  const [selectedClub, setSelectedClub] = useState<(StatsData['clubs'][0] & { division?: string }) | null>(null);
  const [showAllClubs, setShowAllClubs] = useState(false);
  const [showAllPlayers, setShowAllPlayers] = useState(false);

  /* Donation Modal State */
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [donationModalType, setDonationModalType] = useState<'weekly' | 'season'>('season');
  const [donationModalAmount, setDonationModalAmount] = useState<number | undefined>(undefined);

  /* Registration Modal State */
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);

  /* Video Modal State */
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoModalUrl, setVideoModalUrl] = useState('');
  const [videoModalTitle, setVideoModalTitle] = useState('');

  const openVideoModal = useCallback((url: string, title: string) => {
    setVideoModalUrl(url);
    setVideoModalTitle(title);
    setVideoModalOpen(true);
  }, []);

  const openDonationModal = useCallback((type: 'weekly' | 'season', amount?: number) => {
    setDonationModalType(type);
    setDonationModalAmount(amount);
    setDonationModalOpen(true);
  }, []);

  /* Parallax Refs — simplified for mobile performance */
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroScroll, [0, 1], ['0%', '25%']);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 1.05]);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);
  const contentY = useTransform(heroScroll, [0, 1], ['0%', '15%']);
  const heroMidY = useTransform(heroScroll, [0, 1], ['0%', '8%']);

  /* Data Queries */
  const { data: maleData, isLoading: isMaleLoading } = useQuery<StatsData>({
    queryKey: ['stats', 'male'],
    queryFn: async () => { const res = await fetch('/api/stats?division=male'); return res.json(); },
  });

  const { data: femaleData, isLoading: isFemaleLoading } = useQuery<StatsData>({
    queryKey: ['stats', 'female'],
    queryFn: async () => { const res = await fetch('/api/stats?division=female'); return res.json(); },
  });

  const isDataLoading = isMaleLoading || isFemaleLoading;

  const { data: cmsData } = useQuery({
    queryKey: ['cms-content'],
    queryFn: async () => { const res = await fetch('/api/cms/content'); if (!res.ok) return { settings: {}, sections: {} }; return res.json(); },
    staleTime: 30000,
  });

  const { data: leagueData } = useQuery<{ hasData: boolean; preSeason?: boolean; reason?: string; season?: { id: string; name: string }; ligaChampion?: { id: string; name: string; logo: string | null; seasonNumber: number; members: { id: string; gamertag: string; division: string; tier: string; points: number; role: string; avatar?: string | null }[] } | null; stats?: { totalClubs: number; totalMatches: number; completedMatches: number } }>({
    queryKey: ['league-landing'],
    queryFn: async () => { const res = await fetch('/api/league'); if (!res.ok) throw new Error('League API failed'); return res.json(); },
    staleTime: 30000, // Reduced from 60s — refresh faster for Neon cold start recovery
    gcTime: 300000, // Keep cached data for 5 minutes
    retry: 3, // Retry 3 times for Neon cold start
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
    refetchOnWindowFocus: true, // Refetch when user comes back to tab
    refetchOnReconnect: true, // Refetch when network reconnects
  });

  const nextSeason = (leagueData?.ligaChampion?.seasonNumber || 1) + 1;
  const completedSeason = leagueData?.ligaChampion?.seasonNumber || 1;

  // CMS helpers
  const cms = cmsData?.settings || {};
  const cmsSections = cmsData?.sections || {};
  const cmsLogo = cms.logo_url || '/logo1.webp';
  const cmsSiteTitle = cms.site_title || 'IDM League';
  const cmsHeroTitle = cms.hero_title || 'Idol Meta';
  const cmsHeroSubtitle = cms.hero_subtitle || 'Fan Made Edition';
  const cmsHeroTagline = cms.hero_tagline || 'Tempat dancer terbaik berkompetisi. Tournament mingguan, liga profesional, dan podium yang menunggu.';
  const cmsHeroBgDesktop = cms.hero_bg_desktop || '/bg-default.jpg';
  const cmsHeroBgMobile = cms.hero_bg_mobile || '/bg-mobiledefault.jpg';
  const cmsFooterText = cms.footer_text || '© 2025 IDM League — Idol Meta Fan Made Edition. All rights reserved.';
  const cmsFooterTagline = cms.footer_tagline || 'Dance. Compete. Dominate.';

  const enterApp = (division: 'male' | 'female') => {
    setDivision(division);
    setCurrentView('dashboard');
  };

  /* Floating Particles — reduced count for mobile performance */
  const particles = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 14,
      duration: 14 + Math.random() * 18,
      opacity: 0.12 + Math.random() * 0.2,
      alt: i % 3 === 0,
    }));
  }, []);

  /* Nav scroll state */
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const onScroll = () => { setScrolled(window.scrollY > 20); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sectionIds = ['about', 'kompetisi', 'champions', 'mvp', 'clubs', 'dream'];
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); }); },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sectionIds.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  useSwipeNavigation();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden landing-scroll pb-20 sm:pb-0">

      {/* ========== FIXED NAVIGATION HEADER ========== */}
      <nav aria-label="Main navigation" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0c0a06]/95 border-b border-idm-gold-warm/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden glow-pulse shrink-0">
              <Image src={cmsLogo} alt="IDM" width={28} height={28} className="w-full h-full object-cover" />
            </div>
            <span className="text-gradient-fury text-sm font-bold tracking-tight">{cmsSiteTitle}</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden sm:flex items-center gap-1">
            {[
              { id: 'about', label: 'Cerita Kami' },
              { id: 'kompetisi', label: 'Kompetisi' },
              { id: 'champions', label: 'Champion' },
              { id: 'mvp', label: 'MVP' },
              { id: 'clubs', label: 'Club' },
              { id: 'dream', label: 'Liga IDM' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                aria-label={`Navigate to ${item.label} section`}
                aria-current={activeSection === item.id ? 'true' : undefined}
                className={`relative px-3 py-1.5 text-sm transition-all duration-300 cursor-pointer rounded-md ${
                  activeSection === item.id
                    ? 'text-idm-gold-warm font-semibold'
                    : 'text-muted-foreground hover:text-idm-gold-warm/70'
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <div className="absolute bottom-0 left-1 right-1 h-[2px] bg-idm-gold-warm rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Division Switch */}
          <div className="flex items-center bg-muted/80 rounded-full p-0.5 gap-0.5 border border-idm-gold-warm/15">
            <button
              onClick={() => enterApp('male')}
              aria-label="Enter Male Division"
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 text-muted-foreground hover:bg-idm-male hover:text-white hover:shadow-md active:scale-95"
            >
              🕺 Male
            </button>
            <button
              onClick={() => enterApp('female')}
              aria-label="Enter Female Division"
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 text-muted-foreground hover:bg-idm-female hover:text-white hover:shadow-md active:scale-95"
            >
              💃 Female
            </button>
          </div>
        </div>
      </nav>

      {/* ========== MOBILE BOTTOM NAVIGATION ========== */}
      <nav aria-label="Section navigation" className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0c0a06]/97 border-t border-idm-gold-warm/10 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {[
            { id: 'about', label: 'Cerita', icon: BookOpen, special: false },
            { id: 'kompetisi', label: 'Kompetisi', icon: Swords, special: false },
            { id: 'champions', label: 'Champion', icon: Crown, special: true },
            { id: 'clubs', label: 'Club', icon: Users, special: false },
            { id: 'dream', label: 'Liga IDM', icon: Trophy, special: false },
          ].map(item => {
            const isActive = (activeSection === 'champions' || activeSection === 'mvp') && item.id === 'champions' || activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-300 ${
                  item.special
                    ? isActive
                      ? 'text-idm-gold-warm'
                      : 'text-idm-gold-warm/70'
                    : isActive
                    ? 'text-idm-gold-warm'
                    : 'text-muted-foreground hover:text-idm-gold-warm/70'
                }`}
              >
                {item.special && (
                  <span className="absolute inset-0 rounded-lg bg-idm-gold-warm/[0.04] border border-idm-gold-warm/10" />
                )}
                {item.special && !isActive && (
                  <span className="absolute inset-0 rounded-lg animate-pulse bg-idm-gold-warm/[0.03] shadow-[0_0_8px_rgba(212,168,83,0.08)]" />
                )}
                <item.icon className={`relative z-10 w-5 h-5 ${item.special ? 'drop-shadow-[0_0_4px_rgba(212,168,83,0.3)]' : ''}`} />
                <span className={`relative z-10 text-[10px] font-medium mt-1 ${item.special ? 'font-bold' : ''}`}>{item.label}</span>
                {isActive && (
                  <div
                    className={`absolute -bottom-0.5 rounded-full ${item.special ? 'w-10 h-1 bg-idm-gold-warm shadow-[0_0_8px_rgba(212,168,83,0.5)]' : 'w-8 h-0.5 bg-idm-gold-warm'}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ========== SECTION COMPONENTS ========== */}
      <HeroSection
        heroRef={heroRef}
        heroY={heroY}
        heroScale={heroScale}
        heroOpacity={heroOpacity}
        contentY={contentY}
        heroMidY={heroMidY}
        cmsLogo={cmsLogo}
        cmsSiteTitle={cmsSiteTitle}
        cmsHeroTitle={cmsHeroTitle}
        cmsHeroSubtitle={cmsHeroSubtitle}
        cmsHeroTagline={cmsHeroTagline}
        cmsHeroBgDesktop={cmsHeroBgDesktop}
        cmsHeroBgMobile={cmsHeroBgMobile}
        cmsHeroBgVideo={cms.hero_bg_video}
        cmsSections={cmsSections}
        leagueData={leagueData}
        nextSeason={nextSeason}
        maleData={maleData}
        particles={particles}
        onRegister={() => setRegistrationModalOpen(true)}
        onVideoPlay={openVideoModal}
      />

      {/* About / Cerita Kami */}
      <AboutSection
        cmsSections={cmsSections}
        cmsSettings={cms}
      />

      <div className="section-divider max-w-4xl mx-auto" />

      {/* Kompetisi */}
      <TournamentHub
        maleData={maleData}
        femaleData={femaleData}
        cmsSections={cmsSections}
        cmsSettings={cms}
        onEnterApp={enterApp}
        onVideoPlay={openVideoModal}
      />

      <div className="section-divider max-w-4xl mx-auto" />

      {/* Champions — shown first for achievement showcase */}
      <ChampionsSection
        maleData={maleData}
        femaleData={femaleData}
        leagueData={leagueData}
        isDataLoading={isDataLoading}
        cmsSections={cmsSections}
        setSelectedPlayer={setSelectedPlayer}
        championVideoUrl={cms.champion_video_url}
        onVideoPlay={openVideoModal}
      />

      <div className="section-divider max-w-4xl mx-auto" />

      {/* MVP */}
      <MvpSection
        maleData={maleData}
        femaleData={femaleData}
        isDataLoading={isDataLoading}
        cmsSections={cmsSections}
        setSelectedPlayer={setSelectedPlayer}
      />

      <div className="section-divider max-w-4xl mx-auto" />

      {/* Clubs — moved below MVP */}
      <ClubsSection
        maleData={maleData}
        femaleData={femaleData}
        isDataLoading={isDataLoading}
        cmsSections={cmsSections}
        leagueData={leagueData}
        setSelectedClub={setSelectedClub}
        selectedClub={selectedClub}
        setSelectedPlayer={setSelectedPlayer}
        showAllClubs={showAllClubs}
        setShowAllClubs={setShowAllClubs}
        showAllPlayers={showAllPlayers}
        setShowAllPlayers={setShowAllPlayers}
      />

      <div className="section-divider max-w-4xl mx-auto" />

      {/* Dream / CTA */}
      <DreamSection
        maleData={maleData}
        femaleData={femaleData}
        leagueData={leagueData}
        nextSeason={nextSeason}
        completedSeason={completedSeason}
        cmsSections={cmsSections}
        cmsSettings={cms}
        onEnterApp={enterApp}
        openDonationModal={openDonationModal}
        onVideoPlay={openVideoModal}
      />

      <LandingFooter
        cmsFooterText={cmsFooterText}
        cmsFooterTagline={cmsFooterTagline}
        cmsLogo={cmsLogo}
        cmsSiteTitle={cmsSiteTitle}
        cmsHeroTitle={cmsHeroTitle}
        cmsHeroSubtitle={cmsHeroSubtitle}
        cmsSettings={cms}
        scrollToSection={scrollToSection}
      />

      {/* ========== DONATION MODAL (Landing — Donasi only, no Sawer toggle) ========== */}
      <DonationModal
        open={donationModalOpen}
        onOpenChange={setDonationModalOpen}
        defaultType={donationModalType}
        defaultAmount={donationModalAmount}
        hideSawer
        cmsSettings={cms}
      />

      {/* ========== REGISTRATION MODAL ========== */}
      <RegistrationModal
        open={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
      />

      {/* ========== VIDEO MODAL ========== */}
      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        videoUrl={videoModalUrl}
        title={videoModalTitle}
      />

      {/* ========== SCROLL PROGRESS BAR ========== */}
      <ScrollProgress />

      {/* ========== BACK TO TOP BUTTON ========== */}
      <BackToTop />

      {/* ========== PLAYER PROFILE MODAL ========== */}
      {selectedPlayer && (
        <PlayerProfile
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          rank={((selectedPlayer.division === 'male' ? maleData : femaleData)?.topPlayers?.findIndex(p => p.id === selectedPlayer.id) ?? -1) + 1}
        />
      )}

      {/* ========== CLUB PROFILE MODAL ========== */}
      {selectedClub && (
        <ClubProfile
          club={selectedClub}
          onClose={() => setSelectedClub(null)}
          onPlayerClick={(player) => {
            // Find the player in the appropriate division's top players
            const searchDivision = player.division || 'male';
            const data = searchDivision === 'male' ? maleData : femaleData;
            const found = data?.topPlayers?.find(p => p.id === player.id);
            if (found) {
              setSelectedPlayer({ ...found, division: searchDivision });
            } else {
              // Player not in topPlayers list — create a minimal profile
              setSelectedPlayer({
                id: player.id,
                name: player.name || player.gamertag,
                gamertag: player.gamertag,
                avatar: player.avatar,
                tier: player.tier || 'B',
                points: player.points || 0,
                totalWins: 0,
                streak: 0,
                maxStreak: 0,
                totalMvp: 0,
                matches: 0,
                division: searchDivision,
                city: (player as { city?: string }).city,
              });
            }
          }}
        />
      )}
    </div>
  );
}
