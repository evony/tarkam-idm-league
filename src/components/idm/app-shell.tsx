'use client';

import { useAppStore, type AppView } from '@/lib/store';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Gamepad2, Trophy, Users, Shield,
  Home, Flame, Radio, UserPlus, LogOut, Target, KeyRound
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import { AdminLogin } from './admin-login';
import { LandingPage } from './landing-page';
import { DonationPopup } from './donation-popup';
import { NotificationStack } from './notification-stack';
import { useEffect, useState, useCallback } from 'react';
import { useDivisionTheme } from '@/hooks/use-division-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

/* ─── Lazy-loaded view components (code-split for smaller initial bundle) ─── */
const viewLoading = (
  <div className="space-y-5 max-w-5xl mx-auto">
    <Skeleton className="h-44 rounded-2xl" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-20 rounded-xl" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-xl" />
      ))}
    </div>
  </div>
);

const Dashboard = dynamic(() => import('./dashboard').then(m => ({ default: m.Dashboard })), {
  loading: () => viewLoading,
});
const LeagueView = dynamic(() => import('./league-view').then(m => ({ default: m.LeagueView })), {
  loading: () => viewLoading,
});
const AdminPanel = dynamic(() => import('./admin-panel').then(m => ({ default: m.AdminPanel })), {
  loading: () => <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-idm-gold-warm border-t-transparent rounded-full animate-spin" /></div>,
});
const MatchDayCenter = dynamic(() => import('./match-day-center').then(m => ({ default: m.MatchDayCenter })), {
  loading: () => viewLoading,
});
const RegistrationForm = dynamic(() => import('./registration-form').then(m => ({ default: m.RegistrationForm })), {
  loading: () => <div className="max-w-md mx-auto"><Skeleton className="h-96 rounded-2xl" /></div>,
});
const MyTournamentCard = dynamic(() => import('./my-tournament-card').then(m => ({ default: m.MyTournamentCard })), {
  loading: () => <div className="max-w-lg mx-auto"><Skeleton className="h-96 rounded-2xl" /></div>,
});

const navItems: { id: AppView; label: string; icon: typeof Gamepad2 }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Gamepad2 },
  { id: 'mytournament', label: 'Tour Saya', icon: Target },
  { id: 'matchday', label: 'Match Day', icon: Radio },
  { id: 'league', label: 'League', icon: Trophy },
];

const actionItems: { id: AppView; label: string; icon: typeof UserPlus }[] = [
  { id: 'register', label: 'Daftar', icon: UserPlus },
];

function DivisionToggle({ compact = false }: { compact?: boolean } = {}) {
  const { division, setDivision } = useAppStore();
  const baseClass = compact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1.5 text-xs';
  return (
    <div className="flex items-center bg-muted rounded-full p-0.5 gap-0.5">
      <button
        onClick={() => setDivision('male')}
        className={`${baseClass} rounded-full font-semibold transition-all duration-300 ${
          division === 'male'
            ? 'bg-idm-male text-white shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        🕺 Male
      </button>
      <button
        onClick={() => setDivision('female')}
        className={`${baseClass} rounded-full font-semibold transition-all duration-300 ${
          division === 'female'
            ? 'bg-idm-female text-white shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        💃 Female
      </button>
    </div>
  );
}



function SidebarContent({ onNav }: { onNav?: () => void }) {
  const { currentView, setCurrentView, division, adminAuth, clearAdminAuth } = useAppStore();
  const dt = useDivisionTheme();
  const isMobile = useIsMobile();

  // Fetch league summary for dynamic season info
  const { data: leagueSummary } = useQuery<{ seasonNumber: number; status: string; completedWeeks: number; totalWeeks: number; percentage: number }>({
    queryKey: ['league-summary'],
    queryFn: () => fetch('/api/league').then(r => r.json()).then(d => {
      const sn = d.ligaChampion?.seasonNumber || d.season?.name?.match(/\d+/)?.[0] ? parseInt(d.season.name.match(/\d+/)[0]) : 1;
      const tw = d.stats?.totalWeeks || 0;
      const cw = d.stats?.playedWeeks || 0;
      return {
        seasonNumber: sn,
        status: d.ligaChampion ? 'completed' : d.preSeason ? 'pre-season' : d.hasData ? 'active' : 'upcoming',
        completedWeeks: cw,
        totalWeeks: tw,
        percentage: tw > 0 ? Math.round((cw / tw) * 100) : 0,
      };
    }),
    staleTime: 60_000,
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore errors
    }
    clearAdminAuth();
    setCurrentView('landing');
    toast.success('Berhasil logout');
    onNav?.();
  };

  /* Premium nav item class — desktop gets left border active indicator + hover lift */
  const navItemClass = (isActive: boolean) => {
    const base = 'w-full flex items-center gap-3 text-sm font-medium transition-all duration-200 rounded-lg';
    if (isActive) {
      return `${base} ${dt.navActive} glow-pulse lg:rounded-l-none lg:border-l-2 ${division === 'male' ? 'lg:border-l-idm-male' : 'lg:border-l-idm-female'}`;
    }
    return `${base} text-muted-foreground hover:bg-muted/60 hover:text-foreground`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo — Premium desktop, compact mobile */}
      <div className="p-4 lg:p-5 pb-2 lg:pb-3">
        <div className="flex items-center gap-2.5 lg:gap-3 mb-1">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl overflow-hidden glow-pulse shrink-0 lg:shadow-lg lg:shadow-idm-gold/10">
            <Image src="/logo1.webp" alt="IDM" width={48} height={48} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-gradient-fury text-base lg:text-lg font-bold leading-tight">IDM League</h1>
            <p className="text-[10px] lg:text-xs text-muted-foreground">Fan Made Edition</p>
          </div>
        </div>
      </div>

      {/* Division Toggle */}
      <div className="px-4 lg:px-5 pb-3">
        <DivisionToggle />
      </div>

      <div className="section-divider !my-0" />

      {/* Navigation — desktop gets wider padding + hover lift effects */}
      <nav className="flex-1 px-2 lg:px-3 py-3 space-y-0.5 lg:space-y-1">
        <button
          onClick={() => { setCurrentView('landing'); onNav?.(); }}
          className={navItemClass(currentView === 'landing')}
        >
          <div className={`flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 rounded-lg ${currentView === 'landing' ? dt.iconBg : ''} shrink-0`}>
            <Home className="w-4 h-4" />
          </div>
          <span className="px-3 py-2.5 lg:py-3">Home</span>
        </button>

        <div className="px-3 py-1.5 lg:py-2">
          <p className="text-[9px] lg:text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Navigasi</p>
        </div>

        {actionItems.map((navItem) => {
          const Icon = navItem.icon;
          const isActive = currentView === navItem.id;
          return (
            <button
              key={navItem.id}
              onClick={() => { setCurrentView(navItem.id); onNav?.(); }}
              className={navItemClass(isActive)}
            >
              <div className={`flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 rounded-lg ${isActive ? dt.iconBg : ''} shrink-0`}>
                <Icon className={`w-4 h-4 ${isActive ? 'drop-shadow-[0_0_8px_var(--idm-glow)]' : ''}`} />
              </div>
              <span className="px-3 py-2.5 lg:py-3">{navItem.label}</span>
              {isActive && (
                <div className={`ml-auto w-1.5 h-1.5 rounded-full ${division === 'male' ? 'bg-idm-male' : 'bg-idm-female'}`} />
              )}
            </button>
          );
        })}

        {navItems.map((navItem) => {
          const Icon = navItem.icon;
          const isActive = currentView === navItem.id;
          return (
            <button
              key={navItem.id}
              onClick={() => { setCurrentView(navItem.id); onNav?.(); }}
              className={navItemClass(isActive)}
            >
              <div className={`flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 rounded-lg ${isActive ? dt.iconBg : ''} shrink-0`}>
                <Icon className={`w-4 h-4 ${isActive ? 'drop-shadow-[0_0_8px_var(--idm-glow)]' : ''}`} />
              </div>
              <span className="px-3 py-2.5 lg:py-3">{navItem.label}</span>
              {isActive && (
                <div className={`ml-auto w-1.5 h-1.5 rounded-full ${division === 'male' ? 'bg-idm-male' : 'bg-idm-female'}`} />
              )}
            </button>
          );
        })}
        {/* Admin — always visible, shows login if not authenticated */}
        {(() => {
          const isActive = currentView === 'admin';
          return (
            <button
              onClick={() => { setCurrentView('admin'); onNav?.(); }}
              className={navItemClass(isActive)}
            >
              <div className={`flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 rounded-lg ${isActive ? dt.iconBg : ''} shrink-0`}>
                <Shield className={`w-4 h-4 ${isActive ? 'drop-shadow-[0_0_8px_var(--idm-glow)]' : ''}`} />
              </div>
              <span className="px-3 py-2.5 lg:py-3">Admin</span>
              {isActive && (
                <div className={`ml-auto w-1.5 h-1.5 rounded-full ${division === 'male' ? 'bg-idm-male' : 'bg-idm-female'}`} />
              )}
            </button>
          );
        })()}
      </nav>

      {/* Admin Status / Logout — premium card on desktop */}
      {adminAuth.isAuthenticated && (
        <div className="mx-3 lg:mx-4 p-3 lg:p-4 rounded-xl bg-idm-gold/5 border border-idm-gold/20 mb-2 lg:shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-3 h-3 text-idm-gold" />
            <span className="text-[10px] font-semibold text-idm-gold uppercase tracking-wider">
              {adminAuth.admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground font-medium">{adminAuth.admin?.username}</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-idm-gold hover:bg-idm-gold/10"
                onClick={() => setCurrentView('admin')}
                title="Ganti Password (di halaman login)"
              >
                <KeyRound className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Season Status — premium progress card on desktop */}
      <div className={`mx-3 lg:mx-4 p-3 lg:p-4 rounded-xl ${dt.cardPremium} mb-3 lg:shadow-sm`}>
        <div className="flex items-center gap-2 mb-2">
          <Flame className={`w-3 h-3 ${dt.text}`} />
          <span className={`text-[10px] font-semibold ${dt.text} uppercase tracking-wider`}>Season {leagueSummary?.seasonNumber ?? 1}</span>
        </div>
        <div className="w-full h-1.5 lg:h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${division === 'male' ? 'from-idm-male to-idm-male-light' : 'from-idm-female to-idm-female-light'} transition-all duration-700`}
            style={{ width: `${leagueSummary?.percentage || 0}%` }}
          />
        </div>
        <p className="text-[9px] text-muted-foreground mt-1.5">
          {leagueSummary ? `${leagueSummary.percentage}% Selesai • Week ${leagueSummary.completedWeeks}/${leagueSummary.totalWeeks || '?'}` : 'Memuat...'}
        </p>
      </div>


    </div>
  );
}

export function AppShell() {
  const { currentView, donationPopup, hideDonationPopup, division, adminAuth, setAdminAuth, setCurrentView } = useAppStore();
  const dt = useDivisionTheme();
  const prefersReducedMotion = useReducedMotion();

  // Check session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.authenticated && data.admin) {
          setAdminAuth({ isAuthenticated: true, admin: data.admin });
        }
      } catch {
        // Not authenticated
      }
    }
    checkSession();
  }, [setAdminAuth]);

  // Landing page is standalone - no sidebar/header
  if ((currentView as AppView) === 'landing') {
    return (
      <>
        <LandingPage />
        <DonationPopup
          show={donationPopup.show}
          message={donationPopup.message}
          onClose={hideDonationPopup}
        />
        <NotificationStack />
      </>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'matchday': return <MatchDayCenter />;
      case 'league': return <LeagueView />;
      case 'admin': return adminAuth.isAuthenticated ? <AdminPanel /> : <AdminLogin />;
      case 'register': return <RegistrationForm />;
      case 'mytournament': return <MyTournamentCard />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Mobile Header — compact with Admin shield in header */}
      <header className={`lg:hidden sticky top-0 z-40 ${dt.glassStrong} px-3 py-2 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden glow-pulse">
            <Image src="/logo1.webp" alt="IDM" width={28} height={28} className="w-full h-full object-cover" />
          </div>
          <span className="text-gradient-fury text-sm font-bold">IDM League</span>
        </div>
        <div className="flex items-center gap-1.5">
          <DivisionToggle compact />
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${currentView === 'admin' ? 'text-idm-gold-warm' : 'text-muted-foreground'}`}
            onClick={() => setCurrentView('admin')}
            title="Admin Panel"
          >
            <Shield className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar — premium/elegant wider with subtle shadow */}
        <aside className={`hidden lg:block w-72 border-r border-border/60 ${dt.glassStrong} sticky top-0 h-screen overflow-y-auto custom-scrollbar shadow-lg shadow-black/5`}>
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className={`flex-1 min-w-0 overflow-y-auto ${dt.bgMesh}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: prefersReducedMotion ? 0.15 : 0.25 }}
              className="pt-6 px-3 pb-24 sm:pt-6 sm:px-4 sm:pb-24 lg:p-8 lg:pb-8 max-w-[1600px] mx-auto"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Nav — 5 items: Home, Dashboard, Tour Saya, Match Day, League */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 ${dt.glassStrong} border-t border-border safe-area-bottom`}>
        <div className="flex justify-around py-1 px-0.5">
          <button
            onClick={() => useAppStore.getState().setCurrentView('landing')}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors duration-200 relative ${
              (currentView as AppView) === 'landing' ? dt.text : 'text-muted-foreground'
            }`}
          >
            <Home className={`w-[18px] h-[18px] ${(currentView as AppView) === 'landing' ? 'drop-shadow-[0_0_6px_var(--idm-glow)]' : ''}`} />
            <span className="text-[9px] font-medium leading-tight">Home</span>
            {(currentView as AppView) === 'landing' && (
              <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full ${division === 'male' ? 'bg-idm-male' : 'bg-idm-female'}`} />
            )}
          </button>
          {navItems.map((navItem) => {
            const Icon = navItem.icon;
            const isActive = currentView === navItem.id;
            return (
              <button
                key={navItem.id}
                onClick={() => useAppStore.getState().setCurrentView(navItem.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors duration-200 relative ${
                  isActive ? dt.text : 'text-muted-foreground'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] ${isActive ? 'drop-shadow-[0_0_6px_var(--idm-glow)]' : ''}`} />
                <span className="text-[9px] font-medium leading-tight">{navItem.label}</span>
                {isActive && (
                  <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full ${division === 'male' ? 'bg-idm-male' : 'bg-idm-female'}`} />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Donation Popup */}
      <DonationPopup
        show={donationPopup.show}
        message={donationPopup.message}
        onClose={hideDonationPopup}
      />

      {/* Notification Stack */}
      <NotificationStack />

      {/* Footer — desktop only, premium subtle style */}
      <footer className="mt-auto py-4 text-center text-xs text-muted-foreground border-t border-border/60 hidden lg:block">
        <span className="text-gradient-fury font-semibold">IDM League</span> — Fan Made Edition © 2026
      </footer>
    </div>
  );
}
