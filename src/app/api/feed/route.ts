import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Recent completed matches
    const recentMatches = await db.match.findMany({
      where: { status: 'completed' },
      orderBy: { completedAt: 'desc' },
      take: 7,
      include: {
        team1: { select: { name: true } },
        team2: { select: { name: true } },
        mvpPlayer: { select: { gamertag: true } },
        tournament: { select: { name: true, weekNumber: true, division: true } },
      },
    });

    // Recent donations
    const recentDonations = await db.donation.findMany({
      where: { status: 'approved' },
      orderBy: { createdAt: 'desc' },
      take: 7,
    });

    // Recent achievements
    const recentAchievements = await db.playerAchievement.findMany({
      orderBy: { earnedAt: 'desc' },
      take: 7,
      include: {
        player: { select: { gamertag: true, avatar: true } },
        achievement: { select: { displayName: true, icon: true, tier: true } },
      },
    });

    const feed = [
      ...recentMatches.map(m => ({
        type: 'match' as const,
        id: m.id,
        title: `${m.team1?.name || 'TBD'} vs ${m.team2?.name || 'TBD'}`,
        subtitle: m.mvpPlayer ? `MVP: ${m.mvpPlayer.gamertag}` : undefined,
        meta: m.tournament.name,
        timestamp: m.completedAt?.toISOString() || m.createdAt.toISOString(),
      })),
      ...recentDonations.map(d => ({
        type: 'donation' as const,
        id: d.id,
        title: `${d.donorName} donated Rp ${d.amount.toLocaleString()}`,
        subtitle: d.message || undefined,
        meta: d.type === 'season' ? 'Season Donation' : 'Weekly Donation',
        timestamp: d.createdAt.toISOString(),
      })),
      ...recentAchievements.map(a => ({
        type: 'achievement' as const,
        id: a.id,
        title: `${a.player.gamertag} earned ${a.achievement.displayName}`,
        subtitle: `${a.achievement.icon} ${a.achievement.tier}`,
        meta: 'Achievement Unlocked',
        timestamp: a.earnedAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20);

    return NextResponse.json(feed);
  } catch (error) {
    console.error('Feed API error:', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}
