'use client';

import React from 'react';
import { Crown, Trophy, Flame } from 'lucide-react';
import { useDivisionTheme } from '@/hooks/use-division-theme';
import { Card } from '@/components/ui/card';
import type { StatsData } from '@/types/stats';

interface TopPlayerCardProps {
  data: StatsData;
  division: 'male' | 'female';
}

export function TopPlayerCard({ data, division }: TopPlayerCardProps) {
  const dt = useDivisionTheme();
  const topPlayer = data.topPlayers?.[0];

  if (!topPlayer) return null;

  return (
    <Card className={`${dt.casinoCard} overflow-hidden`}>
      <div className={`${dt.casinoBar}`} />
      <div className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
        {/* Avatar with crown */}
        <div className="relative shrink-0">
          <div className={`
            w-11 h-11 sm:w-14 sm:h-14 rounded-full
            flex items-center justify-center
            ${dt.iconBg}
            border-2 ${division === 'male' ? 'border-amber-500/60' : 'border-pink-500/60'}
          `}>
            <span className="text-lg sm:text-xl font-black text-white/90">
              {topPlayer.gamertag?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          {/* Crown badge */}
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-idm-gold-warm flex items-center justify-center shadow-lg">
            <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-black" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`text-sm sm:text-base font-bold truncate ${dt.neonText}`}>
              {topPlayer.gamertag}
            </p>
            {topPlayer.tier && (
              <span className={`
                shrink-0 px-1.5 py-0 rounded text-[9px] sm:text-[10px] font-bold
                ${topPlayer.tier === 'S' ? 'bg-red-500/20 text-red-400' :
                  topPlayer.tier === 'A' ? 'bg-amber-500/20 text-amber-400' :
                  topPlayer.tier === 'B' ? 'bg-green-500/20 text-green-400' :
                  'bg-white/10 text-white/50'}
              `}>
                {topPlayer.tier}
              </span>
            )}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate mt-0.5">
            {topPlayer.club || 'No Club'}
          </p>
        </div>

        {/* Stats */}
        <div className="shrink-0 flex items-center gap-3 sm:gap-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-0.5">
              <Trophy className="w-3 h-3 text-idm-gold-warm" />
              <span className="text-xs sm:text-sm font-bold text-idm-gold-warm">{topPlayer.points}</span>
            </div>
            <span className="text-[8px] sm:text-[10px] text-muted-foreground">Points</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-0.5">
              <Flame className="w-3 h-3 text-orange-400" />
              <span className="text-xs sm:text-sm font-bold text-white/90">{topPlayer.totalWins}</span>
            </div>
            <span className="text-[8px] sm:text-[10px] text-muted-foreground">Wins</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
