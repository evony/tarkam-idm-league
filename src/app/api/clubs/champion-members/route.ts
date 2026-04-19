import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/clubs/champion-members?clubId=... — Champion club members across both divisions
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get('clubId');

  if (!clubId) {
    return NextResponse.json({ error: 'clubId is required' }, { status: 400 });
  }

  // Find the champion club
  const championClub = await db.club.findUnique({
    where: { id: clubId },
    select: { id: true, name: true, division: true },
  });

  if (!championClub) {
    return NextResponse.json({ error: 'Club not found' }, { status: 404 });
  }

  // Find ALL clubs with the same name across both male and female divisions
  const sameNameClubs = await db.club.findMany({
    where: { name: championClub.name },
    include: {
      members: {
        include: {
          player: {
            select: {
              id: true,
              name: true,
              gamertag: true,
              division: true,
              tier: true,
              points: true,
              avatar: true,
              totalWins: true,
              totalMvp: true,
              matches: true,
              streak: true,
              isActive: true,
            },
          },
        },
        orderBy: [{ role: 'desc' }, { player: { gamertag: 'asc' } }],
      },
      season: { select: { division: true } },
    },
  });

  // Merge members from all same-name clubs, deduplicated by player ID
  const seenPlayerIds = new Set<string>();
  const allMembers: Array<{
    id: string;
    name: string;
    gamertag: string;
    division: string;
    tier: string;
    points: number;
    avatar: string | null;
    totalWins: number;
    totalMvp: number;
    matches: number;
    streak: number;
    isActive: boolean;
    role: string;
    clubDivision: string;
    isCaptain: boolean;
  }> = [];

  for (const c of sameNameClubs) {
    for (const m of c.members) {
      if (!seenPlayerIds.has(m.player.id) && m.player.isActive) {
        seenPlayerIds.add(m.player.id);
        allMembers.push({
          ...m.player,
          role: m.role,
          clubDivision: c.division || c.season?.division || 'male',
          isCaptain: m.role === 'captain',
        });
      }
    }
  }

  // Sort: captains first, then by gamertag
  allMembers.sort((a, b) => {
    if (a.isCaptain !== b.isCaptain) return a.isCaptain ? -1 : 1;
    return a.gamertag.localeCompare(b.gamertag);
  });

  // Count by division
  const maleCount = allMembers.filter(m => m.clubDivision === 'male').length;
  const femaleCount = allMembers.filter(m => m.clubDivision === 'female').length;

  return NextResponse.json({
    clubName: championClub.name,
    members: allMembers,
    totalCount: allMembers.length,
    maleCount,
    femaleCount,
  });
}
