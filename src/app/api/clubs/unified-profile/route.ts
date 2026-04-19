import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/clubs/unified-profile?clubId=... — Club profile with champion seasons
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
        include: { player: { select: { id: true, name: true, gamertag: true, division: true, tier: true, points: true, avatar: true } } },
        orderBy: [{ role: 'desc' }, { player: { gamertag: 'asc' } }],
      },
      season: { select: { id: true, name: true, division: true, status: true } },
    },
  });

  if (!club) {
    return NextResponse.json({ error: 'Club not found' }, { status: 404 });
  }

  // Query champion seasons
  const championSeasons = await db.season.findMany({
    where: { championClubId: club.id },
    select: { id: true, name: true, number: true },
    orderBy: { number: 'desc' },
  });

  return NextResponse.json({
    ...club,
    championSeasons,
  });
}
