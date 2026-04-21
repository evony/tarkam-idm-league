import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePlayer } from '@/lib/api-auth';

/**
 * GET /api/skins/my
 * Get current player's active skins (player auth required)
 * Auto-cleans expired skins (champion/mvp that passed expiresAt)
 * Returns skins sorted by priority desc with skin details
 */
export async function GET(request: Request) {
  const authResult = await requirePlayer(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const accountId = authResult.id;

    // Find all PlayerSkin records for this account
    const playerSkins = await db.playerSkin.findMany({
      where: { accountId },
      include: { skin: true },
    });

    const now = new Date();
    const activeSkins = [];
    const expiredIds = [];

    for (const ps of playerSkins) {
      const isExpired = ps.expiresAt && new Date(ps.expiresAt) < now;
      if (isExpired) {
        expiredIds.push(ps.id);
      } else {
        activeSkins.push(ps);
      }
    }

    // Auto-clean expired skins
    if (expiredIds.length > 0) {
      await db.playerSkin.deleteMany({
        where: { id: { in: expiredIds } },
      });
    }

    // Sort by skin priority desc (highest priority first)
    activeSkins.sort((a, b) => b.skin.priority - a.skin.priority);

    return NextResponse.json({
      count: activeSkins.length,
      expiredRemoved: expiredIds.length,
      skins: activeSkins.map(ps => ({
        id: ps.id,
        skinId: ps.skinId,
        skinType: ps.skin.type,
        displayName: ps.skin.displayName,
        description: ps.skin.description,
        icon: ps.skin.icon,
        colorClass: JSON.parse(ps.skin.colorClass),
        priority: ps.skin.priority,
        duration: ps.skin.duration,
        reason: ps.reason,
        awardedBy: ps.awardedBy,
        expiresAt: ps.expiresAt,
        createdAt: ps.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get my skins error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skins' },
      { status: 500 }
    );
  }
}
