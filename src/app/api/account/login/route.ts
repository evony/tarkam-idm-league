import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, createSessionToken } from '@/lib/auth';

const PLAYER_SESSION_COOKIE = 'idm-player-session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password harus diisi' },
        { status: 400 }
      );
    }

    // Find account by username (which is gamertag)
    const account = await db.account.findUnique({
      where: { username },
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
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, account.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Update last login
    await db.account.update({
      where: { id: account.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session token (use 'player' role to distinguish from admin)
    const token = createSessionToken(account.id, 'player');

    const response = NextResponse.json({
      success: true,
      account: {
        id: account.id,
        username: account.username,
        skin: account.skin,
        player: account.player,
      },
    });

    // Set httpOnly cookie for player session
    response.cookies.set(PLAYER_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Player login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
