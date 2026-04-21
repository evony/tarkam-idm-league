import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag, unstable_noStore as noStore } from 'next/cache';

// GET /api/clubs/[id] — Club detail with members
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const club = await db.club.findUnique({
    where: { id },
    include: {
      members: {
        include: { player: { select: { id: true, name: true, gamertag: true, division: true, tier: true, points: true, totalWins: true, totalMvp: true, streak: true, avatar: true } } },
        orderBy: [{ role: 'desc' }, { player: { gamertag: 'asc' } }],
      },
      season: { select: { id: true, name: true, division: true, status: true } },
      homeMatches: { include: { club2: { select: { name: true } } }, orderBy: { week: 'asc' }, take: 5 },
      awayMatches: { include: { club1: { select: { name: true } } }, orderBy: { week: 'asc' }, take: 5 },
    },
  });
  if (!club) return NextResponse.json({ error: 'Club not found' }, { status: 404 });
  return NextResponse.json(club);
}

// PUT /api/clubs/[id] — Edit club (name, logo)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const body = await request.json();
  const { name, logo, bannerImage } = body;

  const club = await db.club.findUnique({ where: { id } });
  if (!club) return NextResponse.json({ error: 'Club tidak ditemukan' }, { status: 404 });

  // Check name uniqueness if renaming
  if (name && name !== club.name) {
    const existing = await db.club.findFirst({
      where: { name, seasonId: club.seasonId, id: { not: id } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Nama club sudah digunakan di season ini' }, { status: 409 });
    }
  }

  const updated = await db.club.update({
    where: { id },
    data: {
      ...(name && { name: name.trim() }),
      ...(logo !== undefined && { logo }),
      ...(bannerImage !== undefined && { bannerImage }),
    },
  });

  // ── Sync logo/banner across ALL seasons ──
  // Clubs are per-season records (@@unique([name, seasonId])).
  // When admin uploads a new logo for a club, we want it to propagate
  // to the same-named club in EVERY season so the landing page always
  // shows the latest logo regardless of which season's clubs are displayed.
  if (logo !== undefined || bannerImage !== undefined) {
    const syncData: { logo?: string | null; bannerImage?: string | null } = {};
    if (logo !== undefined) syncData.logo = logo;
    if (bannerImage !== undefined) syncData.bannerImage = bannerImage;

    // Update all OTHER club records with the same name (different seasonId)
    const syncResult = await db.club.updateMany({
      where: {
        name: updated.name,
        id: { not: id }, // Don't re-update the one we just saved
      },
      data: syncData,
    });

    console.log(`[PUT /api/clubs/${id}] Synced logo/banner to ${syncResult.count} other season(s) for club "${updated.name}"`);
  }

  // Invalidate ALL Next.js/Vercel cache layers so landing page shows updated logo/banner
  // 1. revalidatePath — invalidates Full Route Cache and Data Cache for these paths
  revalidatePath('/');
  revalidatePath('/api/league');
  // 2. revalidateTag — more targeted, works with fetch() tags and Vercel CDN
  revalidateTag('league-data', 'layout');
  // 3. Also invalidate stats routes (club logos appear in standings)
  revalidatePath('/api/stats');

  return NextResponse.json(updated);
}

// DELETE /api/clubs/[id] — Delete club
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  const club = await db.club.findUnique({
    where: { id },
    include: { _count: { select: { members: true, homeMatches: true, awayMatches: true } } },
  });
  if (!club) return NextResponse.json({ error: 'Club tidak ditemukan' }, { status: 404 });

  // Check if club has matches — don't allow deletion if so
  if (club._count.homeMatches > 0 || club._count.awayMatches > 0) {
    return NextResponse.json({ error: 'Club tidak bisa dihapus karena sudah memiliki match' }, { status: 400 });
  }

  // Remove all members first, then delete club
  await db.clubMember.deleteMany({ where: { clubId: id } });
  await db.club.delete({ where: { id } });

  // Invalidate ALL Next.js/Vercel cache layers so landing page updates after club deletion
  revalidatePath('/');
  revalidatePath('/api/league');
  revalidateTag('league-data', 'layout');
  revalidatePath('/api/stats');

  return NextResponse.json({ success: true, message: 'Club berhasil dihapus' });
}
