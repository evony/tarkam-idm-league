import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Force dynamic — this route is never statically rendered
export const dynamic = 'force-dynamic';

// CDN caching: 10s edge cache, 30s stale-while-revalidate
const LEADERBOARD_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30, max-age=0',
  'Surrogate-Key': 'league-data',
  'Vary': 'Accept-Encoding',
};

interface LeaderboardClub {
  id: string;
  name: string;
  logo: string | null;
  points: number;
  wins: number;
  losses: number;
  gameDiff: number;
  memberCount: number;
  rank: number;
  tier: string; // S / A / B based on points
}

function computeTier(points: number): string {
  if (points >= 100) return 'S';
  if (points >= 50) return 'A';
  return 'B';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const division = searchParams.get('division') || 'male';

  try {
    // Find the latest season for this division that has clubs
    const allSeasons = await db.season.findMany({
      where: { division, status: { in: ['active', 'completed'] } },
      orderBy: { number: 'desc' },
    });

    if (allSeasons.length === 0) {
      return NextResponse.json({ clubs: [] }, { headers: LEADERBOARD_CACHE_HEADERS });
    }

    // Find the season that actually has clubs
    const seasonWithClubs = await db.season.findFirst({
      where: {
        division,
        id: { in: allSeasons.map(s => s.id) },
        clubs: { some: {} },
      },
      orderBy: { number: 'desc' },
    });

    const activeSeasonId = seasonWithClubs?.id || allSeasons[0].id;

    // Fetch clubs ordered by points desc, then wins desc
    const clubs = await db.club.findMany({
      where: { seasonId: activeSeasonId },
      orderBy: [
        { points: 'desc' },
        { wins: 'desc' },
      ],
      include: {
        _count: { select: { members: true } },
      },
    });

    // Fallback logo resolution — same pattern as /api/stats
    const clubsNeedingLogo = clubs.filter(c => !c.logo);
    if (clubsNeedingLogo.length > 0) {
      const clubNames = clubsNeedingLogo.map(c => c.name);
      const fallbackClubs = await db.club.findMany({
        where: {
          name: { in: clubNames },
          logo: { not: null },
        },
        select: { name: true, logo: true },
      });
      const logoLookup = new Map<string, string>();
      for (const fb of fallbackClubs) {
        if (!logoLookup.has(fb.name) && fb.logo) {
          logoLookup.set(fb.name, fb.logo);
        }
      }
      for (const club of clubs) {
        if (!club.logo && logoLookup.has(club.name)) {
          club.logo = logoLookup.get(club.name)!;
        }
      }
    }

    // Build leaderboard response with rank and tier
    const leaderboardClubs: LeaderboardClub[] = clubs.map((club, index) => ({
      id: club.id,
      name: club.name,
      logo: club.logo,
      points: club.points,
      wins: club.wins,
      losses: club.losses,
      gameDiff: club.gameDiff,
      memberCount: club._count.members,
      rank: index + 1,
      tier: computeTier(club.points),
    }));

    return NextResponse.json({ clubs: leaderboardClubs }, {
      headers: LEADERBOARD_CACHE_HEADERS,
    });
  } catch {
    // Graceful error handling — return empty instead of 500
    return NextResponse.json({ clubs: [] }, { headers: LEADERBOARD_CACHE_HEADERS });
  }
}
