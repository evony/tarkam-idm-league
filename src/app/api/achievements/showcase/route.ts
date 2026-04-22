import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Force dynamic — this route is never statically rendered
export const dynamic = 'force-dynamic';

// ── Smart Caching Strategy ──
// CDN caches 10s, browser never caches, Surrogate-Key for targeted purge.
const SHOWCASE_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30, max-age=0',
  'Surrogate-Key': 'league-data',
  'Vary': 'Accept-Encoding',
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const division = searchParams.get('division') || 'male';

    // Fetch top PlayerAchievements joined with Player and Achievement data
    const playerAchievements = await db.playerAchievement.findMany({
      where: {
        player: { division, isActive: true },
      },
      include: {
        player: {
          select: {
            id: true,
            gamertag: true,
            avatar: true,
            tier: true,
            division: true,
          },
        },
        achievement: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            icon: true,
            category: true,
            tier: true,
          },
        },
      },
      orderBy: { earnedAt: 'desc' },
      take: 8,
    });

    // Handle empty tables gracefully
    if (!playerAchievements || playerAchievements.length === 0) {
      return NextResponse.json({ achievements: [] }, {
        headers: SHOWCASE_CACHE_HEADERS,
      });
    }

    // Transform to the required response shape
    const achievements = playerAchievements.map((pa) => ({
      id: pa.id,
      gamertag: pa.player.gamertag,
      avatar: pa.player.avatar,
      achievement: {
        name: pa.achievement.displayName || pa.achievement.name,
        description: pa.achievement.description,
        icon: pa.achievement.icon,
      },
      earnedAt: pa.earnedAt,
      tier: pa.player.tier,
      division: pa.player.division,
    }));

    return NextResponse.json({ achievements }, {
      headers: SHOWCASE_CACHE_HEADERS,
    });
  } catch (error) {
    console.error('Error fetching achievement showcase:', error);
    // Return empty array gracefully on error
    return NextResponse.json({ achievements: [] }, {
      headers: SHOWCASE_CACHE_HEADERS,
    });
  }
}
