import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seasonId = searchParams.get('seasonId');
  const division = searchParams.get('division');
  const unified = searchParams.get('unified') === 'true';

  // ── Unified mode: return ALL clubs from ALL active seasons, deduplicated by name ──
  // Clubs in IDM League belong to ALL divisions — a club is not "male" or "female".
  // Even if a club only has members in one division, it should appear in all division tabs.
  if (unified) {
    const allSeasons = await db.season.findMany({
      where: { status: { in: ['active', 'completed'] } },
      select: { id: true, division: true, name: true },
    });

    const allSeasonIds = allSeasons.map(s => s.id);

    const allClubs = await db.club.findMany({
      where: { seasonId: { in: allSeasonIds } },
      orderBy: [{ points: 'desc' }, { gameDiff: 'desc' }],
      include: {
        _count: { select: { members: true } },
        season: { select: { name: true, division: true } },
      },
    });

    // Fallback logo/banner resolution
    const clubsNeedingLogo = allClubs.filter(c => !c.logo);
    if (clubsNeedingLogo.length > 0) {
      const clubNames = clubsNeedingLogo.map(c => c.name);
      const fallbackClubs = await db.club.findMany({
        where: { name: { in: clubNames }, logo: { not: null } },
        select: { name: true, logo: true },
      });
      const logoLookup = new Map<string, string>();
      for (const fb of fallbackClubs) {
        if (!logoLookup.has(fb.name) && fb.logo) logoLookup.set(fb.name, fb.logo);
      }
      for (const club of allClubs) {
        if (!club.logo && logoLookup.has(club.name)) club.logo = logoLookup.get(club.name)!;
      }
    }

    const clubsNeedingBanner = allClubs.filter(c => !c.bannerImage);
    if (clubsNeedingBanner.length > 0) {
      const clubNames = clubsNeedingBanner.map(c => c.name);
      const fallbackClubs = await db.club.findMany({
        where: { name: { in: clubNames }, bannerImage: { not: null } },
        select: { name: true, bannerImage: true },
      });
      const bannerLookup = new Map<string, string>();
      for (const fb of fallbackClubs) {
        if (!bannerLookup.has(fb.name) && fb.bannerImage) bannerLookup.set(fb.name, fb.bannerImage);
      }
      for (const club of allClubs) {
        if (!club.bannerImage && bannerLookup.has(club.name)) club.bannerImage = bannerLookup.get(club.name)!;
      }
    }

    // Deduplicate by club name — merge same-named clubs across seasons
    // For each unique club name, keep ALL season records (so admin can manage members per-division)
    // but show as a single entry with combined stats
    const clubMap = new Map<string, {
      id: string; // primary ID (from the first record found, preferring the current division's season)
      name: string;
      logo: string | null;
      bannerImage: string | null;
      wins: number;
      losses: number;
      points: number;
      gameDiff: number;
      memberCount: number;
      // Keep track of which seasons this club exists in
      seasonRecords: Array<{ id: string; seasonId: string; division: string; memberCount: number }>;
    }>();

    for (const c of allClubs) {
      const existing = clubMap.get(c.name);
      const record = {
        id: c.id,
        seasonId: c.seasonId,
        division: c.season.division,
        memberCount: c._count.members,
      };

      if (!existing) {
        clubMap.set(c.name, {
          id: c.id,
          name: c.name,
          logo: c.logo,
          bannerImage: c.bannerImage,
          wins: c.wins,
          losses: c.losses,
          points: c.points,
          gameDiff: c.gameDiff,
          memberCount: c._count.members,
          seasonRecords: [record],
        });
      } else {
        // Merge stats
        existing.wins += c.wins;
        existing.losses += c.losses;
        existing.points += c.points;
        existing.gameDiff += c.gameDiff;
        existing.memberCount += c._count.members;
        // Use logo/banner from whichever record has one
        if (!existing.logo && c.logo) existing.logo = c.logo;
        if (!existing.bannerImage && c.bannerImage) existing.bannerImage = c.bannerImage;
        existing.seasonRecords.push(record);
      }
    }

    // If a specific division is requested, sort so that the club's record
    // in that division is the primary ID (for member management)
    if (division) {
      for (const [, club] of clubMap) {
        const divRecord = club.seasonRecords.find(r => r.division === division);
        if (divRecord) {
          club.id = divRecord.id; // Use the ID from the requested division's season
        }
      }
    }

    return NextResponse.json(Array.from(clubMap.values()));
  }

  // ── Original mode: filter by seasonId or division ──
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

  if (!name) {
    return NextResponse.json({ error: 'Club name is required' }, { status: 400 });
  }

  // ── Auto-fill logo from previous seasons ──
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

  // ── Create club in ALL active seasons (both male & female) ──
  // A club in IDM League belongs to ALL divisions. When an admin creates
  // a club, it should automatically appear in both male and female seasons.
  // This ensures the club list is the same across all division tabs.
  const activeSeasons = await db.season.findMany({
    where: { status: { in: ['active', 'completed'] } },
    select: { id: true, division: true },
  });

  const createdClubs = [];

  for (const season of activeSeasons) {
    // Check if club already exists in this season
    const existing = await db.club.findUnique({
      where: { name_seasonId: { name, seasonId: season.id } },
    });

    if (existing) {
      // Club already exists in this season — skip but include in response
      createdClubs.push(existing);
      continue;
    }

    // Create club in this season
    const club = await db.club.create({
      data: {
        name,
        division: season.division,
        logo: resolvedLogo,
        bannerImage: resolvedBanner,
        seasonId: season.id,
      },
    });
    createdClubs.push(club);
    console.log(`[POST /api/clubs] Created "${name}" in ${season.division} season (${season.id})`);
  }

  // If no active seasons exist, fall back to the provided seasonId
  if (activeSeasons.length === 0 && seasonId && division) {
    const club = await db.club.create({
      data: { name, division, logo: resolvedLogo, bannerImage: resolvedBanner, seasonId },
    });
    createdClubs.push(club);
  }

  // Invalidate Next.js server cache so landing page shows new club
  revalidatePath('/');
  revalidatePath('/api/league');
  revalidateTag('league-data', 'layout');

  // Return the club from the requested division (or the first one created)
  const primaryClub = division
    ? createdClubs.find(c => c.division === division) || createdClubs[0]
    : createdClubs[0];

  return NextResponse.json(primaryClub, { status: 201 });
}
