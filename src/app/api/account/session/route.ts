import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { db } from '@/lib/db';

const PLAYER_SESSION_COOKIE = 'idm-player-session';

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({ authenticated: false });
    }

    // Parse cookie
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [key, ...val] = c.trim().split('=');
        return [key, val.join('=')];
      })
    );

    const token = cookies[PLAYER_SESSION_COOKIE];
    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const decodedToken = decodeURIComponent(token);
    const session = verifySessionToken(decodedToken);
    if (!session || session.role !== 'player') {
      return NextResponse.json({ authenticated: false });
    }

    // Get account data
    const account = await db.account.findUnique({
      where: { id: session.adminId },
      include: {
        player: {
          select: {
            id: true,
            gamertag: true,
            name: true,
            division: true,
            tier: true,
            avatar: true,
            points: true,
            totalWins: true,
            totalMvp: true,
            matches: true,
            streak: true,
            city: true,
          },
        },
      },
    });

    if (!account) {
      return NextResponse.json({ authenticated: false });
    }

    // Get active skins for the player
    const playerSkins = await db.playerSkin.findMany({
      where: {
        accountId: account.id,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        skin: { select: { id: true, type: true, displayName: true, icon: true, colorClass: true, priority: true, duration: true } },
      },
      orderBy: { skin: { priority: 'desc' } },
    });

    return NextResponse.json({
      authenticated: true,
      account: {
        id: account.id,
        username: account.username,
        skins: playerSkins.map(ps => ({
          type: ps.skin.type,
          icon: ps.skin.icon,
          displayName: ps.skin.displayName,
          colorClass: ps.skin.colorClass,
          priority: ps.skin.priority,
          duration: ps.skin.duration,
          reason: ps.reason,
          expiresAt: ps.expiresAt?.toISOString() ?? null,
        })),
        player: account.player,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
