'use client';

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
    { icon: Users, value: `${totalPlayers}`, label: 'Total Players', accent: 'text-cyan-400' },
    { icon: Shield, value: `${totalClubs}`, label: 'Total Clubs', accent: 'text-idm-gold-warm' },
    { icon: Wallet, value: formatCurrency(totalPrizePool), label: 'Total Prize Pool', accent: 'text-green-400' },
    { icon: Swords, value: `${totalMatches}`, label: 'Matches Played', accent: 'text-purple-400' },
    { icon: Calendar, value: seasonInfo, label: 'Current Season', accent: 'text-idm-amber' },
    { icon: Trophy, value: leagueData?.ligaChampion?.name || 'TBD', label: 'Reigning Champion', accent: 'text-idm-gold-warm' },
  ];

  // Duplicate items for seamless infinite scroll
  const tickerItems = [...items, ...items];

  return (
    <section className="relative py-4 overflow-hidden" aria-label="Platform statistics ticker">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a06] via-idm-gold-warm/[0.03] to-[#0c0a06]" />

      {/* Top and bottom subtle border lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-idm-gold-warm/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-idm-gold-warm/10 to-transparent" />

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0c0a06] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0c0a06] to-transparent z-10 pointer-events-none" />

      <div className="relative z-10">
        <div className="stats-ticker-track flex items-center gap-6">
          {tickerItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex-shrink-0 flex items-center gap-3 px-5 py-2.5 rounded-xl border border-idm-gold-warm/10 bg-white/[0.02] backdrop-blur-sm"
              >
                <div className={`w-8 h-8 rounded-lg bg-idm-gold-warm/[0.08] flex items-center justify-center ${item.accent}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gradient-fury whitespace-nowrap">{item.value}</span>
                  <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider whitespace-nowrap">{item.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
