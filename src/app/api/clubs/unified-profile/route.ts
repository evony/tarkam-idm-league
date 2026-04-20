import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/clubs/unified-profile?clubId=xxx
 *
 * Given a club ID, find ALL clubs with the same name across both
 * male and female divisions, then return a unified profile with
 * combined members, stats, and division info.
 *
 * Clubs in IDM League are unified entities — a single club has
 * both male and female members, not separate clubs per division.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get('clubId');

  if (!clubId) {
    return NextResponse.json({ error: 'clubId is required' }, { status: 400 });
  }

  // Find the requested club to get its name
  const primaryClub = await db.club.findUnique({
    where: { id: clubId },
    include: {
      season: { select: { id: true, name: true, number: true, division: true } },
    },
  });

  if (!primaryClub) {
    return NextResponse.json({ error: 'Club tidak ditemukan' }, { status: 404 });
  }

  // Find ALL clubs with the same name across both divisions
  const sameNameClubs = await db.club.findMany({
    where: { name: primaryClub.name },
    include: {
      season: { select: { id: true, name: true, number: true, division: true } },
    },
  });

  const clubIds = sameNameClubs.map(c => c.id);
  const divisions = [...new Set(sameNameClubs.map(c => c.division))];

  // Get all members from these clubs with player details
  const members = await db.clubMember.findMany({
    where: { clubId: { in: clubIds } },
    include: {
      player: {
        select: {
          id: true,
          gamertag: true,
          name: true,
          division: true,
          avatar: true,
          tier: true,
          points: true,
          totalWins: true,
          totalMvp: true,
          streak: true,
          maxStreak: true,
          matches: true,
          isActive: true,
          city: true,
        },
      },
      club: {
        select: { id: true, name: true, division: true },
      },
    },
    orderBy: [
      { role: 'desc' }, // captains first
      { player: { gamertag: 'asc' } },
    ],
  });

  // Deduplicate by player ID
  const seen = new Set<string>();
  const uniqueMembers = members.filter(m => {
    if (seen.has(m.player.id)) return false;
    seen.add(m.player.id);
    return true;
  });

  // Combine stats from all divisions
  const totalWins = sameNameClubs.reduce((sum, c) => sum + c.wins, 0);
  const totalLosses = sameNameClubs.reduce((sum, c) => sum + c.losses, 0);
  const totalPoints = sameNameClubs.reduce((sum, c) => sum + c.points, 0);
  const totalGameDiff = sameNameClubs.reduce((sum, c) => sum + c.gameDiff, 0);

  // Count members per division
  const maleMembers = uniqueMembers.filter(m => m.player.division === 'male').length;
  const femaleMembers = uniqueMembers.filter(m => m.player.division === 'female').length;

  // Check if this club is a Liga IDM Season champion
  const championSeasons = await db.season.findMany({
    where: {
      championClubId: { in: clubIds },
      status: 'completed',
    },
    select: {
      id: true,
      name: true,
      number: true,
      division: true,
    },
    orderBy: { number: 'desc' },
  });

  return NextResponse.json({
    id: primaryClub.id,
    name: primaryClub.name,
    logo: primaryClub.logo,
    bannerImage: primaryClub.bannerImage,
    // Unified stats across all divisions
    wins: totalWins,
    losses: totalLosses,
    points: totalPoints,
    gameDiff: totalGameDiff,
    // Division info
    divisions,
    hasMaleDivision: divisions.includes('male'),
    hasFemaleDivision: divisions.includes('female'),
    maleMembers,
    femaleMembers,
    // Club IDs per division for reference
    clubIds: sameNameClubs.map(c => ({ id: c.id, division: c.division })),
    // Members with division info
    members: uniqueMembers.map(m => ({
      id: m.player.id,
      gamertag: m.player.gamertag,
      name: m.player.name,
      division: m.player.division,
      avatar: m.player.avatar,
      tier: m.player.tier,
      points: m.player.points,
      totalWins: m.player.totalWins,
      totalMvp: m.player.totalMvp,
      streak: m.player.streak,
      maxStreak: m.player.maxStreak,
      matches: m.player.matches,
      isActive: m.player.isActive,
      role: m.role,
      clubDivision: m.club.division,
      city: m.player.city,
    })),
    // Per-division stats breakdown
    divisionStats: sameNameClubs.map(c => ({
      division: c.division,
      wins: c.wins,
      losses: c.losses,
      points: c.points,
      gameDiff: c.gameDiff,
      season: c.season,
    })),
    // League champion seasons
    championSeasons,
  });
}
