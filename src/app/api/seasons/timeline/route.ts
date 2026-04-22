import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Force dynamic — this route is never statically rendered
export const dynamic = 'force-dynamic';

// CDN caching: 10s on CDN, stale-while-revalidate for 30s
const TIMELINE_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30, max-age=0',
  'Surrogate-Key': 'league-data',
  'Vary': 'Accept-Encoding',
};

interface TimelineSeason {
  id: string;
  name: string;
  number: number;
  status: 'upcoming' | 'active' | 'completed';
  startDate: string;
  endDate: string | null;
  tournamentCount: number;
  playerCount: number;
  championClub: {
    name: string;
    logo: string | null;
  } | null;
}

export async function GET() {
  try {
    // Fetch all seasons ordered by number ascending (chronological)
    const seasons = await db.season.findMany({
      orderBy: { number: 'asc' },
      include: {
        _count: { select: { tournaments: true } },
        championClub: {
          select: { name: true, logo: true },
        },
      },
    });

    // Handle empty data gracefully
    if (seasons.length === 0) {
      return NextResponse.json({ seasons: [] }, {
        headers: TIMELINE_CACHE_HEADERS,
      });
    }

    // Collect unique division values to count players
    const divisions = [...new Set(seasons.map(s => s.division))];

    // Count active players per division in parallel
    const playerCounts = await Promise.all(
      divisions.map(async (division) => {
        const count = await db.player.count({
          where: { division, isActive: true },
        });
        return { division, count };
      })
    );
    const playerCountMap = new Map(playerCounts.map(p => [p.division, p.count]));

    // Build timeline entries
    const timeline: TimelineSeason[] = seasons.map((season) => {
      const status = season.status as 'upcoming' | 'active' | 'completed';

      return {
        id: season.id,
        name: season.name,
        number: season.number,
        status,
        startDate: season.startDate.toISOString(),
        endDate: season.endDate ? season.endDate.toISOString() : null,
        tournamentCount: season._count.tournaments,
        playerCount: playerCountMap.get(season.division) || 0,
        championClub: status === 'completed' && season.championClub
          ? {
              name: season.championClub.name,
              logo: season.championClub.logo,
            }
          : null,
      };
    });

    return NextResponse.json({ seasons: timeline }, {
      headers: TIMELINE_CACHE_HEADERS,
    });
  } catch (error) {
    console.error('[/api/seasons/timeline] Error:', error);
    // Return empty data gracefully instead of 500
    return NextResponse.json({ seasons: [] }, {
      headers: TIMELINE_CACHE_HEADERS,
    });
  }
}
