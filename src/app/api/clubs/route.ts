import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const division = req.nextUrl.searchParams.get('division') || undefined;
    const seasonId = req.nextUrl.searchParams.get('seasonId') || undefined;
    const id = req.nextUrl.searchParams.get('id') || undefined;

    if (id) {
      const club = await db.club.findUnique({
        where: { id },
        include: { members: { include: { player: true }, orderBy: { joinedAt: 'asc' } }, season: true },
      });
      if (!club) return NextResponse.json({ error: 'Club not found' }, { status: 404 });
      return NextResponse.json(club);
    }

    const currentSeason = seasonId || (division ? (await db.season.findFirst({ where: { division, status: 'active' }, orderBy: { createdAt: 'desc' } }))?.id : undefined);

    const where: Record<string, unknown> = {};
    if (division) where.division = division;
    if (currentSeason) where.seasonId = currentSeason;

    const clubs = await db.club.findMany({
      where,
      orderBy: [{ points: 'desc' }, { wins: 'desc' }],
      include: { _count: { select: { members: true } }, members: { include: { player: { select: { id: true, name: true, gamertag: true, tier: true, points: true, avatar: true } } } } },
    });

    return NextResponse.json(clubs);
  } catch (error) {
    console.error('Clubs API error:', error);
    return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 });
  }
}
