import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const division = req.nextUrl.searchParams.get('division') || undefined;
    const seasonId = req.nextUrl.searchParams.get('seasonId') || undefined;
    const status = req.nextUrl.searchParams.get('status') || undefined;
    const id = req.nextUrl.searchParams.get('id') || undefined;

    if (id) {
      const tournament = await db.tournament.findUnique({
        where: { id },
        include: {
          season: { select: { id: true, name: true, number: true } },
          teams: { include: { teamPlayers: { include: { player: true } } } },
          matches: { include: { team1: true, team2: true, mvpPlayer: true }, orderBy: [{ round: 'asc' }, { matchNumber: 'asc' }] },
          participations: { include: { player: true }, orderBy: { createdAt: 'desc' } },
          donations: { where: { status: 'approved' } },
          prizes: { orderBy: { position: 'asc' } },
          sponsors: { include: { sponsor: true } },
          sponsoredPrizes: { include: { sponsor: true } },
        },
      });
      if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
      return NextResponse.json(tournament);
    }

    const where: Record<string, unknown> = {};
    if (division) where.division = division;
    if (seasonId) where.seasonId = seasonId;
    if (status) where.status = status;

    const tournaments = await db.tournament.findMany({
      where,
      orderBy: [{ weekNumber: 'asc' }],
      include: {
        _count: { select: { teams: true, matches: true, participations: true } },
        prizes: true,
      },
    });

    return NextResponse.json(tournaments);
  } catch (error) {
    console.error('Tournaments API error:', error);
    return NextResponse.json({ error: 'Failed to fetch tournaments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, weekNumber, division, seasonId, prizePool, bpm, location, format, defaultMatchFormat, scheduledAt } = body;

    if (!name || !weekNumber || !division || !seasonId) {
      return NextResponse.json({ error: 'name, weekNumber, division, seasonId are required' }, { status: 400 });
    }

    const tournament = await db.tournament.create({
      data: {
        name, weekNumber, division, seasonId,
        prizePool: prizePool || 0, bpm: bpm || null, location: location || null,
        format: format || 'single_elimination', defaultMatchFormat: defaultMatchFormat || 'BO1',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    return NextResponse.json(tournament, { status: 201 });
  } catch (error) {
    console.error('Create tournament error:', error);
    return NextResponse.json({ error: 'Failed to create tournament' }, { status: 500 });
  }
}
