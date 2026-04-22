'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { Crown, Star, Trophy, Medal, Flame, Zap, Shield, Award } from 'lucide-react';
import { SectionHeader } from './shared';
import { AnimatedEmptyState } from '../ui/animated-empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useDivisionTheme } from '@/hooks/use-division-theme';
import { getAvatarUrl } from '@/lib/utils';

/* ========== Types ========== */
interface ShowcaseAchievement {
  id: string;
  gamertag: string;
  avatar: string | null;
  achievement: {
    name: string;
    description: string;
    icon: string;
  };
  earnedAt: string;
  tier: string;
  division: string;
}

/* ========== Icon Mapping — returns type string for rendering ========== */
function getAchievementIconType(iconStr: string): string {
  const lower = iconStr.toLowerCase();
  if (lower.includes('star') || lower.includes('⭐')) return 'star';
  if (lower.includes('trophy') || lower.includes('🏆') || lower.includes('champion')) return 'trophy';
  if (lower.includes('medal') || lower.includes('🥇') || lower.includes('🥈') || lower.includes('🥉')) return 'medal';
  if (lower.includes('flame') || lower.includes('fire') || lower.includes('🔥')) return 'flame';
  if (lower.includes('zap') || lower.includes('lightning') || lower.includes('⚡')) return 'zap';
  if (lower.includes('crown') || lower.includes('👑')) return 'crown';
  if (lower.includes('shield') || lower.includes('🛡')) return 'shield';
  return 'award';
}

/* Render the correct icon element based on type string */
function AchievementIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case 'star': return <Star className={className} />;
    case 'trophy': return <Trophy className={className} />;
    case 'medal': return <Medal className={className} />;
    case 'flame': return <Flame className={className} />;
    case 'zap': return <Zap className={className} />;
    case 'crown': return <Crown className={className} />;
    case 'shield': return <Shield className={className} />;
    default: return <Award className={className} />;
  }
}

/* ========== Tier Glow Styles ========== */
function getTierGlow(tier: string): { border: string; shadow: string; badge: string; badgeText: string } {
  switch (tier) {
    case 'S':
      return {
        border: 'border-red-500/30',
        shadow: 'hover:shadow-[0_0_24px_rgba(239,68,68,0.25)]',
        badge: 'bg-red-500/15 text-red-400 border-red-500/30',
        badgeText: 'S-Tier',
      };
    case 'A':
      return {
        border: 'border-amber-500/30',
        shadow: 'hover:shadow-[0_0_24px_rgba(245,158,11,0.25)]',
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        badgeText: 'A-Tier',
      };
    case 'B':
    default:
      return {
        border: 'border-green-500/30',
        shadow: 'hover:shadow-[0_0_24px_rgba(34,197,94,0.25)]',
        badge: 'bg-green-500/15 text-green-400 border-green-500/30',
        badgeText: 'B-Tier',
      };
  }
}

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
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;
  if (weeks < 5) return `${weeks} minggu lalu`;
  if (months < 12) return `${months} bulan lalu`;
  return `${Math.floor(months / 12)} tahun lalu`;
}

/* ========== Achievement Card ========== */
function AchievementCard({ item, index }: { item: ShowcaseAchievement; index: number }) {
  const dt = useDivisionTheme();
  const iconType = getAchievementIconType(item.achievement.icon || item.achievement.name);
  const tierGlow = getTierGlow(item.tier);

  return (
    <div
      className="stagger-item-fast achievement-card-glow group"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div
        className={`relative rounded-xl bg-white/[0.04] backdrop-blur-md border ${tierGlow.border} p-4 transition-all duration-300 hover:scale-[1.03] ${tierGlow.shadow} overflow-hidden`}
      >
        {/* Gold shimmer border effect */}
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-idm-gold-warm/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-idm-gold-warm/20 to-transparent" />
        </div>

        {/* Achievement Icon + Name */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`shrink-0 w-10 h-10 rounded-lg ${dt.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <AchievementIcon type={iconType} className={`w-5 h-5 achievement-icon-spin ${dt.text}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">{item.achievement.name}</p>
            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mt-0.5">{item.achievement.description}</p>
          </div>
        </div>

        {/* Player Info */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
          <div className="relative w-6 h-6 rounded-full overflow-hidden bg-white/5 shrink-0">
            <Image
              src={getAvatarUrl(item.gamertag, item.division as 'male' | 'female', item.avatar)}
              alt={item.gamertag}
              fill
              sizes="24px"
              className="object-cover object-top"
            />
          </div>
          <span className="text-[11px] font-semibold text-white/80 truncate flex-1">{item.gamertag}</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${tierGlow.badge}`}>
            {tierGlow.badgeText}
          </span>
        </div>

        {/* Time ago */}
        <p className="text-[10px] text-muted-foreground/50 mt-2">{timeAgoInIndonesian(item.earnedAt)}</p>
      </div>
    </div>
  );
}

/* ========== Loading Skeleton ========== */
function AchievementsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-white/[0.04] border border-idm-gold-warm/10 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-lg bg-white/[0.06]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24 bg-white/[0.06]" />
              <Skeleton className="h-3 w-full bg-white/[0.06]" />
              <Skeleton className="h-3 w-2/3 bg-white/[0.06]" />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
            <Skeleton className="w-6 h-6 rounded-full bg-white/[0.06]" />
            <Skeleton className="h-3 w-16 bg-white/[0.06]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ========== Main Section Component ========== */
export function AchievementsSection() {
  const dt = useDivisionTheme();

  const { data, isLoading } = useQuery<{ achievements: ShowcaseAchievement[] }>({
    queryKey: ['achievements-showcase', dt.division],
    queryFn: async () => {
      const res = await fetch(`/api/achievements/showcase?division=${dt.division}`);
      if (!res.ok) return { achievements: [] };
      return res.json();
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  const achievements = data?.achievements ?? [];

  return (
    <section id="achievements" className="relative py-24 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/98 to-background" />
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, rgba(212,168,83,0.5) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(212,168,83,0.06) 0%, transparent 50%), radial-gradient(ellipse at 20% 60%, rgba(229,190,74,0.03) 0%, transparent 40%), radial-gradient(ellipse at 80% 60%, rgba(212,168,83,0.03) 0%, transparent 40%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto">
        <SectionHeader
          icon={Crown}
          label="Achievement"
          title="Prestasi Unggulan"
          subtitle="Achievement terbaru yang diraih para dancer"
        />

        {isLoading ? (
          <AchievementsSkeleton />
        ) : achievements.length === 0 ? (
          <AnimatedEmptyState
            icon={Award}
            message="Belum ada achievement yang diraih"
            hint="Achievement akan muncul setelah pemain meraih prestasi di tournament"
          />
        ) : (
          <>
            {/* Mobile: horizontal scrollable */}
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory custom-scrollbar sm:hidden">
              {achievements.map((item, idx) => (
                <div key={item.id} className="snap-start shrink-0 w-[280px]">
                  <AchievementCard item={item} index={idx} />
                </div>
              ))}
            </div>
            {/* Desktop: 4-column grid */}
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((item, idx) => (
                <AchievementCard key={item.id} item={item} index={idx} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
