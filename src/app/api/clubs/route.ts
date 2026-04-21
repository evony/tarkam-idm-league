import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seasonId = searchParams.get('seasonId');
  const division = searchParams.get('division');

  const where: Record<string, unknown> = {};
  if (seasonId) where.seasonId = seasonId;

  if (division) {
    where.season = { division };
  }

  const clubs = await db.club.findMany({
    where,
    orderBy: [{ points: 'desc' }, { gameDiff: 'desc' }],
    include: {
      _count: { select: { members: true } },
      season: { select: { name: true, division: true } },
    },
  });

  return NextResponse.json(clubs);
}

export async function POST(request: Request) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const body = await request.json();
  const { name, division, logo, seasonId } = body;

  if (!name || !division || !seasonId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // ── Auto-fill logo from previous seasons ──
  // If no logo is provided, check if this club name already has a logo
  // in another season and reuse it. This ensures new season clubs
  // automatically get their existing logos.
  let resolvedLogo = logo || null;
  if (!resolvedLogo) {
    const existingClub = await db.club.findFirst({
      where: { name, logo: { not: null } },
      select: { logo: true },
    });
    if (existingClub?.logo) {
      resolvedLogo = existingClub.logo;
      console.log(`[POST /api/clubs] Auto-filled logo for "${name}" from previous season`);
    }
  }

  // ── Auto-fill bannerImage from previous seasons ──
  let resolvedBanner: string | null = null;
  const existingBanner = await db.club.findFirst({
    where: { name, bannerImage: { not: null } },
    select: { bannerImage: true },
  });
  if (existingBanner?.bannerImage) {
    resolvedBanner = existingBanner.bannerImage;
  }

  const club = await db.club.create({
    data: { name, division, logo: resolvedLogo, bannerImage: resolvedBanner, seasonId },
  });

  // Invalidate Next.js server cache so landing page shows new club
  revalidatePath('/');
  revalidatePath('/api/league');
  revalidateTag('league-data', 'layout');

  return NextResponse.json(club, { status: 201 });
}
