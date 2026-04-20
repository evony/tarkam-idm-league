import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/clubs/champion-members?clubId=xxx
 *
 * Given a champion club ID, find ALL clubs with the same name across both
 * male and female divisions, then return all their members.
 *
 * This allows the champion squad selector to show members from the same
 * club name regardless of division — e.g., if MAXIMOUS (male) is champion,
 * members from MAXIMOUS (female) are also available for selection.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get('clubId');

  if (!clubId) {
    return NextResponse.json({ error: 'clubId is required' }, { status: 400 });
  }

  // Find the champion club to get its name
  const championClub = await db.club.findUnique({
    where: { id: clubId },
    select: { id: true, name: true, division: true },
  });

  if (!championClub) {
    return NextResponse.json({ error: 'Club tidak ditemukan' }, { status: 404 });
  }

  // Find ALL clubs with the same name across both divisions
  const sameNameClubs = await db.club.findMany({
    where: { name: championClub.name },
    select: { id: true, name: true, division: true },
  });

  const clubIds = sameNameClubs.map(c => c.id);

  // Get all members from these clubs
  const members = await db.clubMember.findMany({
    where: { clubId: { in: clubIds } },
    include: {
      player: {
        select: {
          id: true,
          gamertag: true,
          division: true,
          avatar: true,
          tier: true,
        },
      },
      club: {
        select: { id: true, name: true, division: true },
      },
    },
    orderBy: { player: { gamertag: 'asc' } },
  });

  // Deduplicate by player ID (a player should only appear once even if in multiple clubs)
  const seen = new Set<string>();
  const uniqueMembers = members.filter(m => {
    if (seen.has(m.player.id)) return false;
    seen.add(m.player.id);
    return true;
  });

  return NextResponse.json({
    clubName: championClub.name,
    divisions: sameNameClubs.map(c => c.division),
    members: uniqueMembers.map(m => ({
      id: m.player.id,
      gamertag: m.player.gamertag,
      division: m.player.division,
      avatar: m.player.avatar,
      tier: m.player.tier,
      role: m.role,
      clubId: m.clubId,
      clubDivision: m.club.division,
    })),
  });
}
