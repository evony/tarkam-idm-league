'use client';

import React, { useState } from 'react';

import {
  Users, Music, Calendar, Trophy, Gamepad2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BracketView } from '../bracket-view';
import { SectionCard, MatchRow } from './shared';
import { useDivisionTheme } from '@/hooks/use-division-theme';
import type { StatsData } from '@/types/stats';

interface MatchesTabProps {
  data: StatsData;
  recentMatches: StatsData['recentMatches'];
  upcomingMatches: StatsData['upcomingMatches'];
  matchesByWeek: Record<number, StatsData['recentMatches']>;
  upcomingByWeek: Record<number, StatsData['upcomingMatches']>;
}

export function MatchesTab({ data, recentMatches, upcomingMatches, matchesByWeek, upcomingByWeek }: MatchesTabProps) {
  const dt = useDivisionTheme();

  const [bracketType, setBracketType] = useState<string>('single_elimination');

  const t = data.activeTournament;

  return (
    <div className="space-y-4">

      {/* Bracket View — with type selector */}
      <div className="stagger-item-subtle stagger-d0">
        <Card className={`${dt.casinoCard} overflow-hidden`}>
          <div className={dt.casinoBar} />
          <div className="relative z-10">
            {/* Header with bracket type selector */}
            <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${dt.borderSubtle}`}>
              <div className={`w-5 h-5 rounded ${dt.iconBg} flex items-center justify-center shrink-0`}>
                <Music className={`w-3 h-3 ${dt.neonText}`} />
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider">Bracket</h3>
              <Badge className={`${dt.casinoBadge} ml-auto text-[9px]`}>{t?.matches?.length || recentMatches.length} Match</Badge>
            </div>
            {/* Bracket type sub-tabs */}
            <div className={`flex items-center gap-1 px-4 py-2 border-b ${dt.borderSubtle}`}>
              {[
                { value: 'single_elimination', label: 'Elim. Langsung', icon: Music },
                { value: 'double_elimination', label: 'Elim. Ganda', icon: Music },
                { value: 'group_stage', label: 'Fase Grup', icon: Users },
                { value: 'round_robin', label: 'Round Robin', icon: Calendar },
              ].map(bt => (
                <button
                  key={bt.value}
                  onClick={() => setBracketType(bt.value)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                    bracketType === bt.value ? `${dt.bg} ${dt.text} shadow-sm` : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <bt.icon className="w-3 h-3" />
                  {bt.label}
                </button>
              ))}
            </div>
            <div className="p-4">
              {t?.matches && t.matches.length > 0 ? (
                <BracketView
                  matches={t.matches.map(m => ({
                    ...m,
                    round: 'round' in m ? (m as any).round || 1 : 1,
                  }))}
                  bracketType={bracketType as any}
                />
              ) : (
                /* League matches — convert to bracket format */
                <BracketView
                  matches={recentMatches.map(m => ({
                    id: m.id,
                    score1: m.score1 as number | null,
                    score2: m.score2 as number | null,
                    status: 'completed',
                    team1: { id: m.club1.name, name: m.club1.name },
                    team2: { id: m.club2.name, name: m.club2.name },
                    mvpPlayer: null,
                    round: m.week,
                  }))}
                  bracketType={bracketType as any}
                />
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Completed Matches — grouped by week (Toornament match list style) */}
      {Object.keys(matchesByWeek).length > 0 && (
        <div className="stagger-item-subtle stagger-d1">
          <SectionCard title="Hasil Match" icon={Trophy} badge={`${data.recentMatches?.length || 0} Match`}>
            <div className="space-y-5">
              {Object.entries(matchesByWeek)
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([week, matches]) => (
                  <div key={week}>
                    {/* Week header — toornament style */}
                    <div className={`flex items-center gap-3 mb-2.5`}>
                      <div className={`px-2.5 py-1 rounded-md ${dt.bg} ${dt.text} text-[10px] font-bold uppercase tracking-wider`}>
                        Week {week}
                      </div>
                      <div className={`flex-1 h-px ${dt.borderSubtle}`} />
                      <span className="text-[9px] text-muted-foreground">{matches.length} match</span>
                    </div>
                    <div className="space-y-2">
                      {matches.map(m => (
                        <MatchRow
                          key={m.id}
                          club1={m.club1.name}
                          club2={m.club2.name}
                          score1={m.score1}
                          score2={m.score2}
                          status="completed"
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* Upcoming Matches — grouped by week */}
      {Object.keys(upcomingByWeek).length > 0 && (
        <div className="stagger-item-subtle stagger-d2">
          <SectionCard title="Akan Datang" icon={Calendar} badge="JADWAL">
            <div className="space-y-5">
              {Object.entries(upcomingByWeek)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([week, matches]) => (
                  <div key={week}>
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className={`px-2.5 py-1 rounded-md ${dt.bg} ${dt.text} text-[10px] font-bold uppercase tracking-wider`}>
                        Week {week}
                      </div>
                      <div className={`flex-1 h-px ${dt.borderSubtle}`} />
                      <span className="text-[9px] text-muted-foreground">{matches.length} match</span>
                    </div>
                    <div className="space-y-2">
                      {matches.map(m => (
                        <MatchRow
                          key={m.id}
                          club1={m.club1.name}
                          club2={m.club2.name}
                          score1={0}
                          score2={0}
                          status="upcoming"
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </SectionCard>
        </div>
      )}

      {Object.keys(matchesByWeek).length === 0 && Object.keys(upcomingByWeek).length === 0 && (
        <div className="stagger-item-subtle stagger-d3">
          <div className={`p-8 rounded-xl ${dt.bgSubtle} ${dt.border} text-center`}>
            <Gamepad2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Belum ada match</p>
          </div>
        </div>
      )}
    </div>
  );
}
