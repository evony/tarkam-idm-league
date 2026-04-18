import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { playerId, tournamentId } = body;

    if (!playerId || !tournamentId) {
      return NextResponse.json({ error: 'playerId and tournamentId are required' }, { status: 400 });
    }

    const existing = await db.participation.findUnique({
      where: { playerId_tournamentId: { playerId, tournamentId } },
    });

    if (existing) {
      return NextResponse.json({ error: 'Player already registered', participation: existing }, { status: 409 });
    }

    const participation = await db.participation.create({
      data: { playerId, tournamentId, status: 'registered' },
    });

    return NextResponse.json(participation, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}
