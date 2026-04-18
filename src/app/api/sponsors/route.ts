import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const sponsors = await db.sponsor.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(sponsors);
  } catch (error) {
    console.error('Sponsors API error:', error);
    return NextResponse.json({ error: 'Failed to fetch sponsors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, logo, website } = body;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const sponsor = await db.sponsor.create({
      data: { name, logo: logo || null, website: website || null },
    });

    return NextResponse.json(sponsor, { status: 201 });
  } catch (error) {
    console.error('Create sponsor error:', error);
    return NextResponse.json({ error: 'Failed to create sponsor' }, { status: 500 });
  }
}
