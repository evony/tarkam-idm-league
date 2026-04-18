import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const seasonId = req.nextUrl.searchParams.get('seasonId') || undefined;
    const weekNumber = req.nextUrl.searchParams.get('weekNumber') ? parseInt(req.nextUrl.searchParams.get('weekNumber')!) : undefined;
    const division = req.nextUrl.searchParams.get('division') || undefined;

    const where: Record<string, unknown> = {};
    if (seasonId) where.seasonId = seasonId;
    if (weekNumber) where.weekNumber = weekNumber;
    if (division) where.division = division;

    const matches = await db.leagueMatch.findMany({
      where,
      orderBy: [{ weekNumber: 'asc' }, { scheduledAt: 'asc' }],
      include: {
        homeClub: { select: { id: true, name: true, logo: true } },
        awayClub: { select: { id: true, name: true, logo: true } },
      },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('League matches API error:', error);
    return NextResponse.json({ error: 'Failed to fetch league matches' }, { status: 500 });
  }
}
