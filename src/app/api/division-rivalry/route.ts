import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/division-rivalry
 * Returns head-to-head stats between the top 2 players in each division
 */
export async function GET() {
  try {
    // Get top 2 male players (no seasonId on Player — just filter by division)
    const maleTop2 = await db.player.findMany({
      where: { division: 'male', isActive: true },
      orderBy: [{ points: 'desc' }, { totalWins: 'desc' }],
      take: 2,
      include: {
        clubMembers: {
          take: 1,
          include: {
            club: { select: { id: true, name: true, logo: true } },
          },
        },
      },
    });

    // Get top 2 female players
    const femaleTop2 = await db.player.findMany({
      where: { division: 'female', isActive: true },
      orderBy: [{ points: 'desc' }, { totalWins: 'desc' }],
      take: 2,
      include: {
        clubMembers: {
          take: 1,
          include: {
            club: { select: { id: true, name: true, logo: true } },
          },
        },
      },
    });

    const formatRival = (p: typeof maleTop2[0]) => ({
      id: p.id,
      gamertag: p.gamertag,
      avatar: p.avatar,
      tier: p.tier,
      points: p.points,
      totalWins: p.totalWins,
      totalMvp: p.totalMvp,
      streak: p.streak,
      maxStreak: p.maxStreak,
      matches: p.matches,
      club: p.clubMembers?.[0]?.club ? { name: p.clubMembers[0].club.name, logo: p.clubMembers[0].club.logo } : null,
    });

    // Count total players per division
    const maleCount = await db.player.count({ where: { division: 'male', isActive: true } });
    const femaleCount = await db.player.count({ where: { division: 'female', isActive: true } });

    return NextResponse.json({
      male: maleTop2.length >= 2 ? {
        player1: formatRival(maleTop2[0]),
        player2: formatRival(maleTop2[1]),
        totalPlayers: maleCount,
        pointDiff: maleTop2[0].points - maleTop2[1].points,
      } : null,
      female: femaleTop2.length >= 2 ? {
        player1: formatRival(femaleTop2[0]),
        player2: formatRival(femaleTop2[1]),
        totalPlayers: femaleCount,
        pointDiff: femaleTop2[0].points - femaleTop2[1].points,
      } : null,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30, max-age=0',
        'Surrogate-Key': 'league-data',
      },
    });
  } catch {
    return NextResponse.json({ male: null, female: null });
  }
}
