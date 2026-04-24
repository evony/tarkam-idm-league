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
  maleMemberCount: number;
  femaleMemberCount: number;
  rank: number;
  tier: string; // S / A / B based on points
}

function computeTier(points: number): string {
  if (points >= 100) return 'S';
  if (points >= 50) return 'A';
  return 'B';
}

/**
 * GET /api/clubs/leaderboard?type=tarkam|liga
 *
 * Tarkam: Club points = sum of all member player.points across both divisions.
 *         Club = one entity (Gymshark male + Gymshark female = one Gymshark).
 * Liga:   Club points = from Liga match results (stored club.points/wins/losses/gameDiff).
 *         Club = one entity (merge male + female divisions).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'tarkam'; // "tarkam" | "liga"

  try {
    // Find the latest seasons with clubs — both male and female divisions
    const allSeasons = await db.season.findMany({
      where: { status: { in: ['active', 'completed'] } },
      orderBy: { number: 'desc' },
    });

    if (allSeasons.length === 0) {
      return NextResponse.json({ clubs: [], type }, { headers: LEADERBOARD_CACHE_HEADERS });
    }

    // Find seasons that actually have clubs (male & female)
    const seasonIds = allSeasons.map(s => s.id);
    const seasonsWithClubs = await db.season.findMany({
      where: {
        id: { in: seasonIds },
        clubs: { some: {} },
      },
      orderBy: { number: 'desc' },
    });

    if (seasonsWithClubs.length === 0) {
      return NextResponse.json({ clubs: [], type }, { headers: LEADERBOARD_CACHE_HEADERS });
    }

    // Get the latest season number that has clubs, then get all seasons with that number
    // (same season number = same season cycle, just different divisions)
    const latestNumber = seasonsWithClubs[0].number;
    const latestSeasonIds = seasonsWithClubs
      .filter(s => s.number === latestNumber)
      .map(s => s.id);

    // Fetch all clubs from latest season (both divisions)
    const clubs = await db.club.findMany({
      where: { seasonId: { in: latestSeasonIds } },
      include: {
        members: {
          include: {
            player: {
              select: {
                id: true,
                gamertag: true,
                points: true,
                division: true,
              },
            },
          },
        },
      },
    });

    // Fallback logo resolution
    const clubsNeedingLogo = clubs.filter(c => !c.logo);
    if (clubsNeedingLogo.length > 0) {
      const clubNames = [...new Set(clubsNeedingLogo.map(c => c.name))];
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

    // ===== MERGE CLUBS BY NAME (one entity across divisions) =====
    const mergedMap = new Map<string, {
      name: string;
      logo: string | null;
      maleClubId: string | null;
      femaleClubId: string | null;
      maleMembers: typeof clubs[0]['members'];
      femaleMembers: typeof clubs[0]['members'];
      ligaPoints: number;   // from stored club.points (Liga match results)
      ligaWins: number;
      ligaLosses: number;
      ligaGameDiff: number;
    }>();

    for (const club of clubs) {
      const existing = mergedMap.get(club.name);
      const isMale = club.division === 'male';

      if (!existing) {
        mergedMap.set(club.name, {
          name: club.name,
          logo: club.logo,
          maleClubId: isMale ? club.id : null,
          femaleClubId: isMale ? null : club.id,
          maleMembers: isMale ? club.members : [],
          femaleMembers: isMale ? [] : club.members,
          ligaPoints: isMale ? club.points : club.points,
          ligaWins: isMale ? club.wins : club.wins,
          ligaLosses: isMale ? club.losses : club.losses,
          ligaGameDiff: isMale ? club.gameDiff : club.gameDiff,
        });
      } else {
        // Merge — prefer existing logo, accumulate liga stats
        if (club.logo && !existing.logo) existing.logo = club.logo;
        if (isMale) {
          existing.maleClubId = club.id;
          existing.maleMembers = club.members;
          existing.ligaPoints += club.points;
          existing.ligaWins += club.wins;
          existing.ligaLosses += club.losses;
          existing.ligaGameDiff += club.gameDiff;
        } else {
          existing.femaleClubId = club.id;
          existing.femaleMembers = club.members;
          existing.ligaPoints += club.points;
          existing.ligaWins += club.wins;
          existing.ligaLosses += club.losses;
          existing.ligaGameDiff += club.gameDiff;
        }
      }
    }

    // ===== BUILD LEADERBOARD =====
    const leaderboardClubs: LeaderboardClub[] = [];

    for (const [, merged] of mergedMap) {
      const allMembers = [...merged.maleMembers, ...merged.femaleMembers];
      const maleCount = merged.maleMembers.length;
      const femaleCount = merged.femaleMembers.length;

      let points: number;

      if (type === 'tarkam') {
        // Tarkam: Club points = sum of all member player.points
        points = allMembers.reduce((sum, m) => sum + m.player.points, 0);
      } else {
        // Liga: Club points = from Liga match results (stored club.points)
        points = merged.ligaPoints;
      }

      leaderboardClubs.push({
        id: merged.maleClubId || merged.femaleClubId || '',
        name: merged.name,
        logo: merged.logo,
        points,
        wins: merged.ligaWins,
        losses: merged.ligaLosses,
        gameDiff: merged.ligaGameDiff,
        memberCount: allMembers.length,
        maleMemberCount: maleCount,
        femaleMemberCount: femaleCount,
        rank: 0, // will be set after sorting
        tier: computeTier(points),
      });
    }

    // Sort by points desc, then wins desc
    leaderboardClubs.sort((a, b) => b.points - a.points || b.wins - a.wins);

    // Assign ranks
    for (let i = 0; i < leaderboardClubs.length; i++) {
      leaderboardClubs[i].rank = i + 1;
    }

    return NextResponse.json({ clubs: leaderboardClubs, type }, {
      headers: LEADERBOARD_CACHE_HEADERS,
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json({ clubs: [], type }, { headers: LEADERBOARD_CACHE_HEADERS });
  }
}
