import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const achievements = await db.achievement.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Achievements API error:', error);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, displayName, description, icon, tier, criteria, rewardPoints } = body;

    if (!name || !displayName || !description) {
      return NextResponse.json({ error: 'name, displayName, description are required' }, { status: 400 });
    }

    const achievement = await db.achievement.create({
      data: {
        name, displayName, description,
        icon: icon || '🏆', tier: tier || 'bronze',
        criteria: typeof criteria === 'string' ? criteria : JSON.stringify(criteria),
        rewardPoints: rewardPoints || 0,
      },
    });

    return NextResponse.json(achievement, { status: 201 });
  } catch (error) {
    console.error('Create achievement error:', error);
    return NextResponse.json({ error: 'Failed to create achievement' }, { status: 500 });
  }
}
