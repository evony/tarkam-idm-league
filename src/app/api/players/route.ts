import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const division = req.nextUrl.searchParams.get('division') || undefined;
    const search = req.nextUrl.searchParams.get('search') || undefined;
    const tier = req.nextUrl.searchParams.get('tier') || undefined;
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');
    const id = req.nextUrl.searchParams.get('id') || undefined;

    if (id) {
      const player = await db.player.findUnique({
        where: { id },
        include: {
          clubMembers: { include: { club: true } },
          participations: { include: { tournament: true }, orderBy: { createdAt: 'desc' } },
          achievements: { include: { achievement: true } },
          pointRecords: { orderBy: { createdAt: 'desc' }, take: 20 },
        },
      });
      if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 });
      return NextResponse.json(player);
    }

    const where: Record<string, unknown> = { isActive: true };
    if (division) where.division = division;
    if (tier) where.tier = tier;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { gamertag: { contains: search } },
      ];
    }

    const players = await db.player.findMany({
      where,
      orderBy: { points: 'desc' },
      take: limit,
      include: { clubMembers: { include: { club: { select: { name: true } } } } },
    });

    return NextResponse.json(players);
  } catch (error) {
    console.error('Players API error:', error);
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, gamertag, division, tier, city, phone } = body;

    if (!name || !gamertag || !division) {
      return NextResponse.json({ error: 'name, gamertag, division are required' }, { status: 400 });
    }

    const existing = await db.player.findUnique({ where: { gamertag } });
    if (existing) {
      return NextResponse.json({ error: 'Gamertag already exists' }, { status: 409 });
    }

    const player = await db.player.create({
      data: {
        name, gamertag, division,
        tier: tier || 'B', city: city || '', phone: phone || null,
        registrationStatus: 'approved',
      },
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error('Create player error:', error);
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
  }
}
