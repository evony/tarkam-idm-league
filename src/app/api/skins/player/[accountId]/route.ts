import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/skins/player/[accountId]
 * Get any player's active skins (public, no auth needed - for display on profiles)
 * Returns active (non-expired) skins for the given accountId
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId diperlukan' },
        { status: 400 }
      );
    }

    // Verify the account exists
    const account = await db.account.findUnique({
      where: { id: accountId },
      include: {
        player: {
          select: { gamertag: true, name: true },
        },
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Akun tidak ditemukan' },
        { status: 404 }
      );
    }

    // Find all PlayerSkin records for this account
    const playerSkins = await db.playerSkin.findMany({
      where: { accountId },
      include: { skin: true },
    });

    const now = new Date();

    // Filter out expired skins (don't auto-clean for public view, just filter)
    const activeSkins = playerSkins.filter(ps => {
      return !ps.expiresAt || new Date(ps.expiresAt) >= now;
    });

    // Sort by skin priority desc (highest priority first)
    activeSkins.sort((a, b) => b.skin.priority - a.skin.priority);

    return NextResponse.json({
      accountId,
      gamertag: account.player.gamertag,
      name: account.player.name,
      count: activeSkins.length,
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
        expiresAt: ps.expiresAt,
        createdAt: ps.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get player skins error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player skins' },
      { status: 500 }
    );
  }
}
