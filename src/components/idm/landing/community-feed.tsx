'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { Users, Swords, Heart, Trophy, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedEmptyState } from '../ui/animated-empty-state';
import { SectionHeader } from './shared';
import { getAvatarUrl } from '@/lib/utils';

/* ========== Types ========== */
interface ActivityItem {
  id: string;
  type: 'registration' | 'match_result' | 'donation' | 'achievement';
  title: string;
  description: string;
  icon: string;
  timestamp: string;
  division?: string;
}

/* ========== Type Config — colors, icons, formatting ========== */
const typeConfig: Record<
  ActivityItem['type'],
  {
    borderColor: string;
    iconBg: string;
    iconColor: string;
    bgColor: string;
    label: string;
  }
> = {
  registration: {
    borderColor: 'border-l-cyan-400',
    iconBg: 'bg-cyan-400/10',
    iconColor: 'text-cyan-400',
    bgColor: 'bg-cyan-400/[0.03]',
    label: 'Registrasi',
  },
  match_result: {
    borderColor: 'border-l-amber-400',
    iconBg: 'bg-amber-400/10',
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-400/[0.03]',
    label: 'Match',
  },
  donation: {
    borderColor: 'border-l-pink-400',
    iconBg: 'bg-pink-400/10',
    iconColor: 'text-pink-400',
    bgColor: 'bg-pink-400/[0.03]',
    label: 'Donasi',
  },
  achievement: {
    borderColor: 'border-l-idm-gold-warm',
    iconBg: 'bg-idm-gold-warm/10',
    iconColor: 'text-idm-gold-warm',
    bgColor: 'bg-idm-gold-warm/[0.03]',
    label: 'Achievement',
  },
};

/* ========== Indonesian Relative Time ========== */
function timeAgoInIndonesian(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return 'Baru saja';

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;

  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

/* ========== Format Activity Description — Social Media Style ========== */
function formatActivityText(item: ActivityItem): { text: string; highlightParts: string[] } {
  switch (item.type) {
    case 'registration': {
      // description: "GAMERTAG joined the league"
      const gamertag = item.description.split(' joined')[0] || item.description;
      return {
        text: `🕺 ${gamertag} bergabung di IDM League!`,
        highlightParts: [gamertag],
      };
    }
    case 'match_result': {
      // description: "TEAM1 3-2 TEAM2"
      const parts = item.description.split(' ');
      if (parts.length >= 3) {
        const player1 = parts[0];
        const score = parts[1];
        const player2 = parts.slice(2).join(' ');
        return {
          text: `⚔️ ${player1} vs ${player2} — Score ${score}`,
          highlightParts: [player1, player2],
        };
      }
      return { text: `⚔️ ${item.description}`, highlightParts: [] };
    }
    case 'donation': {
      // description: "DONOR donated RpXX"
      const donorPart = item.description.split(' donated ')[0] || item.description;
      const amountPart = item.description.split(' donated ')[1] || '';
      return {
        text: `💰 ${donorPart} berdonasi ${amountPart}`,
        highlightParts: [donorPart, amountPart],
      };
    }
    case 'achievement': {
      // description: "GAMERTAG earned ACHIEVEMENT"
      const gamertagPart = item.description.split(' earned ')[0] || item.description;
      const achievementPart = item.description.split(' earned ')[1] || '';
      return {
        text: `🏆 ${gamertagPart} meraih ${achievementPart}!`,
        highlightParts: [gamertagPart, achievementPart],
      };
    }
    default:
      return { text: item.description, highlightParts: [] };
  }
}

/* ========== Type Icon Component ========== */
function ActivityTypeIcon({ type }: { type: ActivityItem['type'] }) {
  const config = typeConfig[type];
  switch (type) {
    case 'registration':
      return <Users className={`w-3.5 h-3.5 ${config.iconColor}`} />;
    case 'match_result':
      return <Swords className={`w-3.5 h-3.5 ${config.iconColor}`} />;
    case 'donation':
      return <Heart className={`w-3.5 h-3.5 ${config.iconColor}`} />;
    case 'achievement':
      return <Trophy className={`w-3.5 h-3.5 ${config.iconColor}`} />;
  }
}

/* ========== Donation Type Badge ========== */
function DonationBadge() {
  return (
    <Badge className="bg-pink-400/10 text-pink-400 text-[8px] border border-pink-400/20 px-1.5 py-0 h-4">
      Donasi
    </Badge>
  );
}

/* ========== Activity Card ========== */
function ActivityCard({ item, index }: { item: ActivityItem; index: number }) {
  const config = typeConfig[item.type];
  const { text } = formatActivityText(item);

  // Extract gamertag for avatar (for registration and achievement types)
  const gamertag = item.type === 'registration'
    ? item.description.split(' joined')[0]
    : item.type === 'achievement'
    ? item.description.split(' earned ')[0]
    : null;

  const division = item.division || 'male';

  return (
    <div
      className={`community-feed-card border-l-2 ${config.borderColor} ${config.bgColor} rounded-r-lg p-3 transition-all hover:bg-white/[0.04]`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start gap-2.5">
        {/* Type icon */}
        <div className={`shrink-0 w-7 h-7 rounded-lg ${config.iconBg} flex items-center justify-center mt-0.5`}>
          <ActivityTypeIcon type={item.type} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[12px] leading-relaxed text-white/85">
            {text}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground/50">
              {timeAgoInIndonesian(item.timestamp)}
            </span>
            {item.type === 'donation' && <DonationBadge />}
            {item.division && (
              <span className={`text-[9px] ${item.division === 'male' ? 'text-cyan-400/60' : 'text-purple-400/60'}`}>
                {item.division === 'male' ? '🕺' : '💃'}
              </span>
            )}
          </div>
        </div>

        {/* Avatar for player-related activities */}
        {gamertag && (
          <div className="relative w-7 h-7 rounded-full overflow-hidden bg-white/5 shrink-0">
            <Image
              src={getAvatarUrl(gamertag, division as 'male' | 'female')}
              alt={gamertag}
              fill
              sizes="28px"
              className="object-cover object-top"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ========== Loading Skeleton ========== */
function CommunityFeedSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-white/[0.03]">
          <Skeleton className="w-7 h-7 rounded-lg bg-white/[0.06] shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-3/4 bg-white/[0.06]" />
            <Skeleton className="h-2 w-1/3 bg-white/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ========== Main Component ========== */
export function CommunityFeed() {
  const { data, isLoading } = useQuery<{ activities: ActivityItem[] }>({
    queryKey: ['activity-feed-landing'],
    queryFn: async () => {
      const res = await fetch('/api/activity');
      if (!res.ok) return { activities: [] };
      return res.json();
    },
    staleTime: 30000,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const activities = (data?.activities ?? []).slice(0, 10);

  return (
    <section id="community" className="relative py-24 px-4 overflow-hidden">
      {/* Background — Social Hub */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c0a06] via-[#0d0a08]/98 to-[#0c0a06]" />
      {/* Wave line pattern — community rhythm */}
      <div className="absolute inset-0 opacity-[0.013]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(212,168,83,0.12) 28px, rgba(212,168,83,0.12) 29px), repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(212,168,83,0.08) 28px, rgba(212,168,83,0.08) 29px)', backgroundSize: '29px 29px' }} />
      {/* Warm social glow center */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(212,168,83,0.07) 0%, transparent 45%), radial-gradient(ellipse at 30% 70%, rgba(6,182,212,0.04) 0%, transparent 35%), radial-gradient(ellipse at 70% 70%, rgba(168,85,247,0.04) 0%, transparent 35%)' }} />
      {/* Top warm edge glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-idm-gold-warm/20 to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Section Header with Live indicator */}
        <div className="flex items-center gap-3 mb-8">
          <SectionHeader
            icon={Radio}
            label="Komunitas"
            title="Aktivitas Komunitas"
            subtitle="Apa yang terjadi di IDM League"
          />
        </div>

        {/* Live indicator at top */}
        <div className="flex items-center gap-2 mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-[11px] font-semibold text-green-400/80">Aktivitas Terkini</span>
        </div>

        {isLoading ? (
          <CommunityFeedSkeleton />
        ) : activities.length === 0 ? (
          <AnimatedEmptyState
            icon={Users}
            message="Belum ada aktivitas komunitas"
            hint="Aktivitas akan muncul saat pemain bergabung, bertanding, atau berdonasi"
          />
        ) : (
          <div className="community-feed-container space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
            {activities.map((item, idx) => (
              <ActivityCard key={item.id} item={item} index={idx} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
