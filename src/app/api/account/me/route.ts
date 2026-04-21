import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { db } from '@/lib/db';

const PLAYER_SESSION_COOKIE = 'idm-player-session';

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [key, ...val] = c.trim().split('=');
        return [key, val.join('=')];
      })
    );

    const token = cookies[PLAYER_SESSION_COOKIE];
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decodedToken = decodeURIComponent(token);
    const session = verifySessionToken(decodedToken);
    if (!session || session.role !== 'player') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get full account data with player info
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
            maxStreak: true,
            city: true,
            phone: true,
            clubMembers: {
              include: {
                club: {
                  select: { id: true, name: true, logo: true, division: true },
                },
              },
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
            achievements: {
              include: {
                achievement: true,
              },
              orderBy: { earnedAt: 'desc' },
              take: 5,
            },
          },
        },
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Get the current club from membership
    const currentClub = account.player.clubMembers[0]?.club || null;

    return NextResponse.json({
      account: {
        id: account.id,
        username: account.username,
        email: account.email,
        phone: account.phone,
        skin: account.skin,
        lastLoginAt: account.lastLoginAt,
        createdAt: account.createdAt,
        player: {
          ...account.player,
          club: currentClub ? { id: currentClub.id, name: currentClub.name, logo: currentClub.logo } : null,
        },
      },
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
