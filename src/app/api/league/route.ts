import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const division = req.nextUrl.searchParams.get('division') || 'male';

    const season = await db.season.findFirst({
      where: { division, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });

    if (!season) {
      return NextResponse.json({ hasData: false, preSeason: true, reason: 'No active season' });
    }

    // Get standings
    const clubs = await db.club.findMany({
      where: { division, seasonId: season.id },
      orderBy: [{ points: 'desc' }, { wins: 'desc' }, { gameDiff: 'desc' }],
      include: { _count: { select: { members: true } }, members: { include: { player: true } } },
    });

    // League match stats
    const totalMatches = await db.leagueMatch.count({ where: { division, seasonId: season.id } });
    const completedMatches = await db.leagueMatch.count({ where: { division, seasonId: season.id, status: 'completed' } });

    // Champion club
    let ligaChampion = null;
    if (season.championClubId) {
      const champClub = await db.club.findUnique({
        where: { id: season.championClubId },
        include: { members: { include: { player: { select: { id: true, gamertag: true, division: true, tier: true, points: true, avatar: true } } } } },
      });
      if (champClub) {
        const championSquad = season.championSquad ? JSON.parse(season.championSquad) : champClub.members.map(m => ({
          id: m.player.id, gamertag: m.player.gamertag, division: m.player.division, tier: m.player.tier, points: m.player.points, role: m.role, avatar: m.player.avatar,
        }));
        ligaChampion = { id: champClub.id, name: champClub.name, logo: champClub.logo, seasonNumber: season.number, members: championSquad.slice(0, 5) };
      }
    }

    const SEASON_TOTAL_WEEKS = 10;

    return NextResponse.json({
      hasData: true,
      preSeason: false,
      season: { id: season.id, name: season.name, number: season.number, status: season.status },
      ligaChampion,
      stats: {
        totalClubs: clubs.length,
        totalMatches,
        completedMatches,
        playedWeeks: completedMatches > 0 ? Math.ceil(completedMatches / (clubs.length / 2 || 1)) : 0,
        totalWeeks: SEASON_TOTAL_WEEKS,
      },
      standings: clubs.map(c => ({
        id: c.id, name: c.name, logo: c.logo, wins: c.wins, losses: c.losses, draws: c.draws,
        points: c.points, gameDiff: c.gameDiff, members: c._count.members,
        memberList: c.members.map(m => ({ id: m.player.id, gamertag: m.player.gamertag, role: m.role })),
      })),
    });
  } catch (error) {
    console.error('League API error:', error);
    return NextResponse.json({ hasData: false, error: 'Failed to fetch league data' }, { status: 500 });
  }
}
