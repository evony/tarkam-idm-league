'use client';

import { useEffect, useState } from 'react';
import { Users, Shield, Wallet, Swords, Trophy, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { StatsData } from '@/types/stats';

interface StatsTickerProps {
  maleData: StatsData | undefined;
  femaleData: StatsData | undefined;
  leagueData: any;
}

interface TickerItem {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  accent: string;
  numericValue: number;
}

/* Count-up animation hook — animates number from 0 to target */
function useCountUp(target: number, duration = 1200, delay = 200) {
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started || target <= 0) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { current };
}

/* Individual ticker card with count-up and hover glow */
function TickerCard({ item, index }: { item: TickerItem; index: number }) {
  const Icon = item.icon;
  const { current } = useCountUp(item.numericValue, 1200, index * 150);
  const hasNumeric = item.numericValue > 0;

  return (
    <div className="stats-ticker-card flex-shrink-0 flex items-center gap-3 px-5 py-2.5 rounded-xl border border-idm-gold-warm/10 bg-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-idm-gold-warm/25 hover:shadow-[0_0_20px_rgba(212,168,83,0.1)]">
      <div className={`w-8 h-8 rounded-lg bg-idm-gold-warm/[0.08] flex items-center justify-center ${item.accent} transition-transform duration-300 group-hover:scale-110`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gradient-fury whitespace-nowrap">
          {hasNumeric ? current : item.value}
        </span>
        <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider whitespace-nowrap">{item.label}</span>
      </div>
    </div>
  );
}

export function StatsTicker({ maleData, femaleData, leagueData }: StatsTickerProps) {
  // Calculate aggregate stats across both divisions
  const totalPlayers = (maleData?.totalPlayers || 0) + (femaleData?.totalPlayers || 0);
  const totalClubs = leagueData?.stats?.totalClubs || Math.max(maleData?.clubs?.length || 0, femaleData?.clubs?.length || 0);
  const totalPrizePool = (maleData?.totalPrizePool || 0) + (femaleData?.totalPrizePool || 0);
  const totalMatches = leagueData?.stats?.totalMatches || (maleData?.recentMatches?.length || 0) + (femaleData?.recentMatches?.length || 0);
  const seasonInfo = leagueData?.ligaChampion
    ? `Season ${leagueData.ligaChampion.seasonNumber}`
    : leagueData?.preSeason
      ? 'Pre-Season'
      : 'Season 1';

  const items: TickerItem[] = [
    { icon: Users, value: `${totalPlayers}`, label: 'Total Players', accent: 'text-cyan-400', numericValue: totalPlayers },
    { icon: Shield, value: `${totalClubs}`, label: 'Total Clubs', accent: 'text-idm-gold-warm', numericValue: totalClubs },
    { icon: Wallet, value: formatCurrency(totalPrizePool), label: 'Total Prize Pool', accent: 'text-green-400', numericValue: totalPrizePool },
    { icon: Swords, value: `${totalMatches}`, label: 'Matches Played', accent: 'text-purple-400', numericValue: totalMatches },
    { icon: Calendar, value: seasonInfo, label: 'Current Season', accent: 'text-idm-amber', numericValue: 0 },
    { icon: Trophy, value: leagueData?.ligaChampion?.name || 'TBD', label: 'Reigning Champion', accent: 'text-idm-gold-warm', numericValue: 0 },
  ];

  // Triplicate items for seamless infinite scroll (3 copies ensures smooth loop)
  const tickerItems = [...items, ...items, ...items];

  return (
    <section className="relative py-4 overflow-hidden" aria-label="Platform statistics ticker">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a06] via-idm-gold-warm/[0.03] to-[#0c0a06]" />

      {/* Gold line glow at top and bottom borders */}
      <div className="stats-ticker-glow-line absolute top-0 left-0 right-0 h-px" aria-hidden="true" />
      <div className="stats-ticker-glow-line absolute bottom-0 left-0 right-0 h-px" aria-hidden="true" />

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0c0a06] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0c0a06] to-transparent z-10 pointer-events-none" />

      <div className="relative z-10">
        <div
          className="flex items-center gap-6"
          style={{
            width: 'max-content',
            animation: 'stats-ticker-scroll 30s linear infinite',
          }}
        >
          {tickerItems.map((item, idx) => (
            <TickerCard key={idx} item={item} index={idx % items.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
