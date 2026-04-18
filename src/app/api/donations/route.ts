import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const tournamentId = req.nextUrl.searchParams.get('tournamentId') || undefined;
    const seasonId = req.nextUrl.searchParams.get('seasonId') || undefined;
    const status = req.nextUrl.searchParams.get('status') || undefined;

    const where: Record<string, unknown> = {};
    if (tournamentId) where.tournamentId = tournamentId;
    if (seasonId) where.seasonId = seasonId;
    if (status) where.status = status;

    const donations = await db.donation.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(donations);
  } catch (error) {
    console.error('Donations API error:', error);
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { donorName, amount, message, type, tournamentId, seasonId } = body;

    if (!donorName || !amount) {
      return NextResponse.json({ error: 'donorName and amount are required' }, { status: 400 });
    }

    const donation = await db.donation.create({
      data: {
        donorName, amount, message: message || null,
        type: type || 'weekly', status: 'pending',
        tournamentId: tournamentId || null, seasonId: seasonId || null,
      },
    });

    return NextResponse.json(donation, { status: 201 });
  } catch (error) {
    console.error('Create donation error:', error);
    return NextResponse.json({ error: 'Failed to create donation' }, { status: 500 });
  }
}
