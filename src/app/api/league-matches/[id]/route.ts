import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const match = await db.leagueMatch.findUnique({
    where: { id },
    include: {
      club1: {
        include: {
          members: {
            include: {
              player: {
                select: {
                  id: true,
                  gamertag: true,
                  avatar: true,
                  tier: true,
                  points: true,
                  totalWins: true,
                  totalMvp: true,
                },
              },
            },
            orderBy: { role: 'desc' }, // captain first
          },
        },
      },
      club2: {
        include: {
          members: {
            include: {
              player: {
                select: {
                  id: true,
                  gamertag: true,
                  avatar: true,
                  tier: true,
                  points: true,
                  totalWins: true,
                  totalMvp: true,
                },
              },
            },
            orderBy: { role: 'desc' }, // captain first
          },
        },
      },
    },
  });

  if (!match) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }

  // Try to find MVP player from tournament matches for this week
  // LeagueMatch doesn't have MVP directly, but we can check tournament matches
  let mvpPlayer = null;
  if (match.status === 'completed') {
    // Try to find a tournament match for this week that might have MVP
    const tournamentMatch = await db.match.findFirst({
      where: {
        status: 'completed',
        mvpPlayerId: { not: null },
        tournament: {
          weekNumber: match.week,
          division: match.club1.division,
          status: 'completed',
        },
      },
      include: {
        mvpPlayer: {
          select: {
            id: true,
            gamertag: true,
            avatar: true,
            tier: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });
    if (tournamentMatch?.mvpPlayer) {
      mvpPlayer = tournamentMatch.mvpPlayer;
    }
  }

  const result = {
    id: match.id,
    week: match.week,
    score1: match.score1,
    score2: match.score2,
    status: match.status,
    format: match.format,
    mvpPlayer,
    club1: {
      id: match.club1.id,
      name: match.club1.name,
      logo: match.club1.logo,
      members: match.club1.members.map(m => ({
        id: m.player.id,
        gamertag: m.player.gamertag,
        avatar: m.player.avatar,
        tier: m.player.tier,
        role: m.role,
        points: m.player.points,
        totalWins: m.player.totalWins,
        totalMvp: m.player.totalMvp,
      })),
    },
    club2: {
      id: match.club2.id,
      name: match.club2.name,
      logo: match.club2.logo,
      members: match.club2.members.map(m => ({
        id: m.player.id,
        gamertag: m.player.gamertag,
        avatar: m.player.avatar,
        tier: m.player.tier,
        role: m.role,
        points: m.player.points,
        totalWins: m.player.totalWins,
        totalMvp: m.player.totalMvp,
      })),
    },
  };

  return NextResponse.json(result);
}
