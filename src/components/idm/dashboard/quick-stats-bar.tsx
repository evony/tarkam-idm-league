'use client';

import React from 'react';
import {
  Users,
  Wallet,
  TrendingUp,
  Crown,
  Zap,
} from 'lucide-react';
import { useDivisionTheme } from '@/hooks/use-division-theme';
import { formatCurrency } from '@/lib/utils';
import type { StatsData } from '@/types/stats';

/* ─── Stat Card Item ─── */
interface StatCardConfig {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  badge?: React.ReactNode;
  isPrimary?: boolean;
}

/* ─── Props ─── */
interface QuickStatsBarProps {
  data: StatsData;
  division: 'male' | 'female';
}

/* ─── QuickStatsBar Component ─── */
export function QuickStatsBar({ data, division }: QuickStatsBarProps) {
  const dt = useDivisionTheme();

  const topPlayer = data.topPlayers?.[0];

  const stats: StatCardConfig[] = [
    {
      icon: Users,
      value: data.totalPlayers,
      label: 'Total Players',
      isPrimary: true,
    },
    {
      icon: Wallet,
      value: formatCurrency(data.totalPrizePool),
      label: 'Prize Pool',
    },
    {
      icon: TrendingUp,
      value: `${data.seasonProgress?.percentage ?? 0}%`,
      label: 'Season Progress',
    },
    {
      icon: Crown,
      value: topPlayer ? topPlayer.gamertag : '—',
      label: topPlayer ? `${topPlayer.points} pts` : 'Top Player',
    },

  ];

  return (
    <div
      className="
        flex gap-3 overflow-x-auto snap-x snap-mandatory
        pb-2 -mx-1 px-1
        lg:overflow-visible lg:mx-0 lg:px-0 lg:pb-0
        lg:grid lg:grid-cols-2 lg:gap-4
        custom-scrollbar
      "
      role="list"
      aria-label="Quick stats summary"
    >
      {stats.map((stat, idx) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className={`
              stagger-item-subtle
              snap-start shrink-0 w-[140px] sm:w-[160px]
              lg:shrink lg:w-auto
              group
            `}
            style={{ animationDelay: `${idx * 60}ms` }}
            role="listitem"
          >
            <div
              className={`
                relative flex items-center gap-3 p-3 sm:p-4
                rounded-xl
                bg-white/[0.07] dark:bg-white/[0.05]
                border
                ${dt.border}
                transition-all duration-200
                hover:scale-[1.03] hover:border-opacity-60
                ${stat.isPrimary ? 'border-l-2 border-l-amber-500/60' : ''}
              `}
            >
              {/* Icon */}
              <div
                className={`
                  w-9 h-9 sm:w-10 sm:h-10
                  rounded-lg shrink-0
                  flex items-center justify-center
                  ${dt.iconBg}
                  transition-colors duration-200
                  group-hover:bg-opacity-20
                `}
              >
                <Icon
                  className={`
                    w-4 h-4 sm:w-5 sm:h-5
                    ${division === 'male' ? 'text-amber-400' : 'text-pink-400'}
                  `}
                />
              </div>

              {/* Value + Label */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={`
                      text-sm sm:text-base font-bold truncate
                      ${dt.neonText}
                    `}
                  >
                    {stat.value}
                  </p>
                  {stat.badge}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                  {stat.label}
                </p>
              </div>

              {/* Subtle zap accent on primary card */}
              {stat.isPrimary && (
                <Zap className="absolute top-2 right-2 w-3 h-3 text-amber-500/30" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
