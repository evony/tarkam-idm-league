import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  const tournament = await db.tournament.findUnique({
    where: { id },
    include: {
      matches: { include: { team1: { include: { teamPlayers: true } }, team2: { include: { teamPlayers: true } } } },
      teams: { include: { teamPlayers: true } },
    },
  });
  if (!tournament) {
    return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
  }

  // Allow deletion of tournaments in any status before completed
  if (tournament.status === 'completed') {
    return NextResponse.json({ error: 'Tournament yang sudah completed tidak bisa dihapus. Hubungi super admin untuk rollback.' }, { status: 400 });
  }

  try {
    // Bug #5 fix: Rollback all player stats before deleting
    await db.$transaction(async (tx) => {
      // 1. Rollback player stats using PlayerPoint audit trail
      const pointRecords = await tx.playerPoint.findMany({
        where: { tournamentId: id },
      });

      // Group by player and sum amounts to deduct
      const pointsByPlayer = new Map<string, number>();
      for (const pr of pointRecords) {
        pointsByPlayer.set(pr.playerId, (pointsByPlayer.get(pr.playerId) || 0) + pr.amount);
      }

      for (const [playerId, totalPoints] of pointsByPlayer) {
        const player = await tx.player.findUnique({ where: { id: playerId } });
        if (player) {
          await tx.player.update({
            where: { id: playerId },
            data: {
              points: Math.max(0, player.points - totalPoints),
            },
          });
        }
      }

      // 2. Rollback player match/wins/streak stats
      // Find all completed matches and reverse the stats
      const completedMatches = tournament.matches.filter(m => m.status === 'completed' && m.winnerId);

      for (const match of completedMatches) {
        if (!match.team1 || !match.team2) continue;

        const winningTeam = match.team1Id === match.winnerId ? match.team1 : match.team2;
        const losingTeam = match.team1Id === match.loserId ? match.team1 : match.team2;

        // Rollback winning team players
        for (const tp of winningTeam.teamPlayers) {
          const player = await tx.player.findUnique({ where: { id: tp.playerId } });
          if (player) {
            await tx.player.update({
              where: { id: tp.playerId },
              data: {
                totalWins: Math.max(0, player.totalWins - 1),
                matches: Math.max(0, player.matches - 1),
                // Note: streak rollback is complex, but we do our best
                streak: 0, // Reset streak since we can't know what it was before
              },
            });
          }
        }

        // Rollback losing team players
        for (const tp of losingTeam.teamPlayers) {
          const player = await tx.player.findUnique({ where: { id: tp.playerId } });
          if (player) {
            await tx.player.update({
              where: { id: tp.playerId },
              data: {
                matches: Math.max(0, player.matches - 1),
                streak: 0,
              },
            });
          }
        }

        // Rollback club stats
        const gameDiff = Math.abs((match.score1 || 0) - (match.score2 || 0));
        for (const team of [winningTeam, losingTeam]) {
          for (const tp of team.teamPlayers) {
            const membership = await tx.clubMember.findFirst({
              where: { playerId: tp.playerId, club: { division: tournament.division, seasonId: tournament.seasonId } },
            });
            if (membership) {
              if (team === winningTeam) {
                await tx.club.update({
                  where: { id: membership.clubId },
                  data: {
                    wins: { decrement: 1 },
                    points: { decrement: 2 },
                    gameDiff: { decrement: gameDiff },
                  },
                });
              } else {
                await tx.club.update({
                  where: { id: membership.clubId },
                  data: {
                    losses: { decrement: 1 },
                    gameDiff: { increment: gameDiff },
                  },
                });
              }
            }
          }
        }
      }

      // 3. Delete all tournament data in correct order
      await tx.match.deleteMany({ where: { tournamentId: id } });
      const teams = await tx.team.findMany({ where: { tournamentId: id }, select: { id: true } });
      for (const t of teams) {
        await tx.teamPlayer.deleteMany({ where: { teamId: t.id } });
      }
      await tx.team.deleteMany({ where: { tournamentId: id } });
      await tx.tournamentPrize.deleteMany({ where: { tournamentId: id } });
      await tx.donation.deleteMany({ where: { tournamentId: id } });
      await tx.participation.deleteMany({ where: { tournamentId: id } });
      await tx.playerPoint.deleteMany({ where: { tournamentId: id } });
      await tx.playerAchievement.deleteMany({ where: { tournamentId: id } });
      await tx.tournamentSponsor.deleteMany({ where: { tournamentId: id } });
      await tx.sponsoredPrize.deleteMany({ where: { tournamentId: id } });
      await tx.tournament.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete tournament error:', error);
    return NextResponse.json({ error: 'Failed to delete tournament' }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tournament = await db.tournament.findUnique({
    where: { id },
    include: {
      season: true,
      teams: {
        include: {
          teamPlayers: { include: { player: true } },
          matchAsTeam1: { include: { team2: true, winner: true } },
          matchAsTeam2: { include: { team1: true, winner: true } },
        },
        orderBy: { rank: 'asc' },
      },
      matches: {
        include: {
          team1: { include: { teamPlayers: { include: { player: true } } } },
          team2: { include: { teamPlayers: { include: { player: true } } } },
          winner: true,
          loser: true,
          mvpPlayer: true,
        },
        orderBy: [{ round: 'asc' }, { matchNumber: 'asc' }],
      },
      participations: {
        include: { player: true },
        orderBy: { createdAt: 'asc' },
      },
      prizes: { orderBy: { position: 'asc' } },
      donations: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!tournament) {
    return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
  }

  return NextResponse.json(tournament);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const body = await request.json();

  const validStatuses = ['setup', 'registration', 'approval', 'team_generation', 'bracket_generation', 'main_event', 'finalization', 'completed'];
  if (body.status && !validStatuses.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const validFormats = ['single_elimination', 'double_elimination', 'group_stage'];
  if (body.format && !validFormats.includes(body.format)) {
    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  }

  // Handle prizes update
  if (body.prizes && Array.isArray(body.prizes)) {
    // Delete existing prizes
    await db.tournamentPrize.deleteMany({ where: { tournamentId: id } });

    // Create new prizes with auto-calculated pointsPerPlayer
    for (const prize of body.prizes) {
      const totalPoints = Math.floor(prize.prizeAmount / 1000);
      const pointsPerPlayer = prize.recipientCount > 0
        ? Math.floor(totalPoints / prize.recipientCount)
        : totalPoints;

      await db.tournamentPrize.create({
        data: {
          tournamentId: id,
          label: prize.label,
          position: prize.position || 0,
          prizeAmount: prize.prizeAmount || 0,
          pointsPerPlayer,
          recipientCount: prize.recipientCount || 1,
        },
      });
    }
  }

  const tournament = await db.tournament.update({
    where: { id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.name && { name: body.name }),
      ...(body.weekNumber !== undefined && { weekNumber: body.weekNumber }),
      ...(body.format && { format: body.format }),
      ...(body.defaultMatchFormat && { defaultMatchFormat: body.defaultMatchFormat }),
      ...(body.prizePool !== undefined && { prizePool: body.prizePool }),
      ...(body.location !== undefined && { location: body.location }),
      ...(body.bpm !== undefined && { bpm: body.bpm }),
      ...(body.scheduledAt !== undefined && { scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null }),
      ...(body.status === 'completed' && { completedAt: new Date() }),
    },
  });

  return NextResponse.json(tournament);
}
