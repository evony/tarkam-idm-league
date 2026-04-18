import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const division = req.nextUrl.searchParams.get('division') || undefined;
    const where: Record<string, unknown> = {};
    if (division) where.division = division;

    const seasons = await db.season.findMany({
      where,
      orderBy: { number: 'desc' },
      include: { _count: { select: { tournaments: true, clubs: true } } },
    });

    return NextResponse.json(seasons);
  } catch (error) {
    console.error('Seasons API error:', error);
    return NextResponse.json({ error: 'Failed to fetch seasons' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, number, division, startDate, status } = body;

    if (!name || !number || !division) {
      return NextResponse.json({ error: 'name, number, division are required' }, { status: 400 });
    }

    const season = await db.season.create({
      data: {
        name, number, division,
        startDate: startDate ? new Date(startDate) : new Date(),
        status: status || 'active',
      },
    });

    return NextResponse.json(season, { status: 201 });
  } catch (error) {
    console.error('Create season error:', error);
    return NextResponse.json({ error: 'Failed to create season' }, { status: 500 });
  }
}
