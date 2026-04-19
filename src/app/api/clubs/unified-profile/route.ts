import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/clubs/unified-profile?clubId=... — Unified club profile with cross-division members
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get('clubId');

  if (!clubId) {
    return NextResponse.json({ error: 'clubId is required' }, { status: 400 });
  }

  const club = await db.club.findUnique({
    where: { id: clubId },
    include: {
      members: {
        include: { player: { select: { id: true, name: true, gamertag: true, division: true, tier: true, points: true, avatar: true, totalWins: true, totalMvp: true, matches: true } } },
        orderBy: [{ role: 'desc' }, { player: { gamertag: 'asc' } }],
      },
      season: { select: { id: true, name: true, division: true, status: true } },
    },
  });

  if (!club) {
    return NextResponse.json({ error: 'Club not found' }, { status: 404 });
  }

  // Find ALL clubs with the same name across both male and female divisions
  const sameNameClubs = await db.club.findMany({
    where: {
      name: club.name,
      id: { not: club.id },
    },
    include: {
      members: {
        include: { player: { select: { id: true, name: true, gamertag: true, division: true, tier: true, points: true, avatar: true, totalWins: true, totalMvp: true, matches: true } } },
        orderBy: [{ role: 'desc' }, { player: { gamertag: 'asc' } }],
      },
      season: { select: { id: true, name: true, division: true, status: true } },
    },
  });

  // Combine all clubs (primary + same-name)
  const allClubs = [club, ...sameNameClubs];

  // Merge members from all clubs, deduplicated by player ID
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
    role: string;
    clubDivision: string;
    isCaptain: boolean;
  }> = [];

  for (const c of allClubs) {
    for (const m of c.members) {
      if (!seenPlayerIds.has(m.player.id)) {
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

  // Sort members: captains first, then by gamertag
  allMembers.sort((a, b) => {
    if (a.isCaptain !== b.isCaptain) return a.isCaptain ? -1 : 1;
    return a.gamertag.localeCompare(b.gamertag);
  });

  // Combined stats
  const combinedWins = allClubs.reduce((sum, c) => sum + c.wins, 0);
  const combinedLosses = allClubs.reduce((sum, c) => sum + c.losses, 0);
  const combinedPoints = allClubs.reduce((sum, c) => sum + c.points, 0);
  const combinedGameDiff = allClubs.reduce((sum, c) => sum + c.gameDiff, 0);

  // Per-division breakdown
  const divisionBreakdown: Record<string, { wins: number; losses: number; points: number; gameDiff: number; memberCount: number }> = {};
  for (const c of allClubs) {
    const div = c.division || c.season?.division || 'male';
    if (!divisionBreakdown[div]) {
      divisionBreakdown[div] = { wins: 0, losses: 0, points: 0, gameDiff: 0, memberCount: 0 };
    }
    divisionBreakdown[div].wins += c.wins;
    divisionBreakdown[div].losses += c.losses;
    divisionBreakdown[div].points += c.points;
    divisionBreakdown[div].gameDiff += c.gameDiff;
    divisionBreakdown[div].memberCount += c.members.length;
  }

  // Count per-division members
  const maleMembers = allMembers.filter(m => m.division === 'male' || m.clubDivision === 'male').length;
  const femaleMembers = allMembers.filter(m => m.division === 'female' || m.clubDivision === 'female').length;
  const isMixed = maleMembers > 0 && femaleMembers > 0;

  // Query champion seasons for all same-name clubs
  const allClubIds = allClubs.map(c => c.id);
  const championSeasons = await db.season.findMany({
    where: { championClubId: { in: allClubIds } },
    select: { id: true, name: true, number: true },
    orderBy: { number: 'desc' },
  });

  return NextResponse.json({
    id: club.id,
    name: club.name,
    logo: club.logo,
    bannerImage: club.bannerImage,
    division: club.division,
    displayDivision: isMixed ? 'league' : club.division,
    isMixed,
    maleMembers,
    femaleMembers,
    wins: combinedWins,
    losses: combinedLosses,
    points: combinedPoints,
    gameDiff: combinedGameDiff,
    divisionBreakdown,
    members: allMembers,
    primaryClub: club,
    sameNameClubs: sameNameClubs.map(c => ({
      id: c.id,
      division: c.division,
      season: c.season,
    })),
    championSeasons,
  });
}
