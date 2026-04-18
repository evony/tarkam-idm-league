'use client';

import { useAppStore, type AppView } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2, Trophy, Users, Shield,
  Menu, X, Home, Radio, UserPlus, LogOut, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import { LandingPage } from './landing-page';
import { DonationPopup } from './donation-popup';
import { NotificationStack } from './notification-stack';
import { useEffect, useState, useCallback } from 'react';
import { useDivisionTheme } from '@/hooks/use-division-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

/* Lazy-loaded view components */
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
  loading: () => <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-idm-gold border-t-transparent rounded-full animate-spin" /></div>,
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
const TournamentView = dynamic(() => import('./tournament-view').then(m => ({ default: m.TournamentView })), {
  loading: () => viewLoading,
});

const navItems: { id: AppView; label: string; icon: typeof Gamepad2 }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Gamepad2 },
  { id: 'mytournament', label: 'Turnamen Saya', icon: Target },
  { id: 'matchday', label: 'Match Day', icon: Radio },
  { id: 'league', label: 'League', icon: Trophy },
];

const adminNavItem = { id: 'admin' as AppView, label: 'Admin', icon: Shield };

const actionItems: { id: AppView; label: string; icon: typeof UserPlus }[] = [
  { id: 'register', label: 'Daftar', icon: UserPlus },
];

function DivisionToggle() {
  const { division, setDivision } = useAppStore();
  return (
    <div className="flex items-center bg-muted rounded-full p-1 gap-1">
      <button
        onClick={() => setDivision('male')}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
          division === 'male'
            ? 'bg-idm-male text-white shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        🕺 Male
      </button>
      <button
        onClick={() => setDivision('female')}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
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

  const { data: leagueSummary } = useQuery<{ seasonNumber: number; status: string; completedWeeks: number; totalWeeks: number; percentage: number }>({
    queryKey: ['league-summary'],
    queryFn: () => fetch('/api/league?division=' + division).then(r => r.json()).then(d => {
      const sn = d.ligaChampion?.seasonNumber || d.season?.number || 1;
      const tw = d.stats?.totalWeeks || 10;
      const cw = d.stats?.playedWeeks || 0;
      return { seasonNumber: sn, status: d.hasData ? 'active' : 'upcoming', completedWeeks: cw, totalWeeks: tw, percentage: tw > 0 ? Math.round((cw / tw) * 100) : 0 };
    }),
    staleTime: 60_000,
  });

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    clearAdminAuth();
    setCurrentView('landing');
    toast.success('Berhasil logout');
    onNav?.();
  };

  const navItemClass = (isActive: boolean) => {
    const base = 'w-full flex items-center gap-3 text-sm font-medium transition-all duration-200 rounded-lg';
    if (isActive) {
      return `${base} ${dt.navActive} glow-pulse lg:rounded-l-none lg:border-l-2 ${division === 'male' ? 'lg:border-l-idm-male' : 'lg:border-l-idm-female'}`;
    }
    return `${base} text-muted-foreground hover:bg-muted/60 hover:text-foreground px-3 py-2.5`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-sm">IDM</span>
          </div>
          <div>
            <h2 className="font-bold text-sm">IDM League</h2>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Season {leagueSummary?.seasonNumber || 1}</p>
          </div>
        </div>
        <DivisionToggle />
      </div>

      <Separator className="my-2" />

      {/* Season progress */}
      {leagueSummary && (
        <div className="px-4 py-2">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>Progress Musim</span>
            <span>{leagueSummary.completedWeeks}/{leagueSummary.totalWeeks} Minggu</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${division === 'male' ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-pink-500 to-rose-400'}`}
              style={{ width: `${leagueSummary.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {[...navItems, ...(adminAuth.isAuthenticated ? [adminNavItem] : [])].map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setCurrentView(item.id); onNav?.(); }}
              className={navItemClass(isActive)}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <Separator />

      {/* Actions */}
      <div className="px-2 py-2 space-y-0.5">
        {actionItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => { setCurrentView(item.id); onNav?.(); }}
              className="w-full flex items-center gap-3 text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-200 rounded-lg px-3 py-2.5"
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
        {adminAuth.isAuthenticated && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 rounded-lg px-3 py-2.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        )}
      </div>

      {/* Back to Landing */}
      <div className="px-2 py-2">
        <button
          onClick={() => { setCurrentView('landing'); onNav?.(); }}
          className="w-full flex items-center gap-3 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg px-3 py-2"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </button>
      </div>
    </div>
  );
}

export function AppShell() {
  const { currentView, sidebarOpen, setSidebarOpen } = useAppStore();
  const dt = useDivisionTheme();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className="hidden lg:flex w-64 border-r border-border flex-col bg-card/50 backdrop-blur-sm fixed top-0 left-0 bottom-0 z-40">
            <SidebarContent />
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          {/* Mobile Top Bar */}
          {isMobile && currentView !== 'landing' && (
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SidebarContent onNav={() => setSidebarOpen(false)} />
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                  <span className="text-white font-black text-[8px]">IDM</span>
                </div>
                <span className="font-bold text-sm">IDM League</span>
              </div>

              <DivisionToggle />
            </div>
          )}

          {/* Page Content */}
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {currentView === 'landing' && <LandingPage />}
                {currentView === 'dashboard' && <Dashboard />}
                {currentView === 'tournament' && <TournamentView />}
                {currentView === 'league' && <LeagueView />}
                {currentView === 'admin' && <AdminPanel />}
                {currentView === 'matchday' && <MatchDayCenter />}
                {currentView === 'register' && <RegistrationForm />}
                {currentView === 'mytournament' && <MyTournamentCard />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Donation popup & notifications */}
      <DonationPopup />
      <NotificationStack />
    </div>
  );
}
