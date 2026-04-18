import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const division = req.nextUrl.searchParams.get('division') || 'male';
    const players = await db.player.findMany({
      where: { division, isActive: true },
      orderBy: { points: 'desc' },
      include: { clubMembers: { include: { club: { select: { name: true } } } } },
    });

    return NextResponse.json(players.map((p, i) => ({
      rank: i + 1,
      id: p.id, name: p.name, gamertag: p.gamertag, tier: p.tier, points: p.points,
      totalWins: p.totalWins, totalMvp: p.totalMvp, streak: p.streak, maxStreak: p.maxStreak, matches: p.matches,
      club: p.clubMembers.length > 0 ? p.clubMembers[0].club.name : null,
    })));
  } catch (error) {
    console.error('Rankings API error:', error);
    return NextResponse.json({ error: 'Failed to fetch rankings' }, { status: 500 });
  }
}
