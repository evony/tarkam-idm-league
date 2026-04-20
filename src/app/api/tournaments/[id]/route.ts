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
    select: {
      id: true,
      status: true,
      division: true,
      seasonId: true,
      matches: {
        where: { status: 'completed', winnerId: { not: null } },
        select: {
          id: true,
          team1Id: true,
          team2Id: true,
          winnerId: true,
          loserId: true,
          score1: true,
          score2: true,
          team1: { select: { id: true, teamPlayers: { select: { playerId: true } } } },
          team2: { select: { id: true, teamPlayers: { select: { playerId: true } } } },
        },
      },
    },
  });

  if (!tournament) {
    return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
  }

  if (tournament.status === 'completed') {
    return NextResponse.json({ error: 'Tournament yang sudah completed tidak bisa dihapus. Hubungi super admin untuk rollback.' }, { status: 400 });
  }

  try {
    // ─── Step 1: Rollback player points (batch) ───
    const pointRecords = await db.playerPoint.findMany({
      where: { tournamentId: id },
      select: { playerId: true, amount: true },
    });

    // Group by player and sum amounts to deduct
    const pointsByPlayer = new Map<string, number>();
    for (const pr of pointRecords) {
      pointsByPlayer.set(pr.playerId, (pointsByPlayer.get(pr.playerId) || 0) + pr.amount);
    }

    // Batch update player points — one update per player
    for (const [playerId, totalPoints] of pointsByPlayer) {
      await db.player.updateMany({
        where: { id: playerId },
        data: { points: { decrement: totalPoints } },
      });
      // Clamp to 0 if negative (updateMany doesn't support Math.max)
      await db.$executeRaw`UPDATE "Player" SET points = GREATEST(points, 0) WHERE id = ${playerId} AND points < 0`;
    }

    // ─── Step 2: Rollback match/wins/streak stats (batch) ───
    // Collect all player stat changes first, then apply in batch
    const playerStatChanges = new Map<string, { winsDelta: number; matchesDelta: number }>();

    for (const match of tournament.matches) {
      if (!match.team1 || !match.team2) continue;
      if (!match.winnerId) continue;

      const winningTeam = match.team1Id === match.winnerId ? match.team1 : match.team2;
      // loserId can be null (e.g., bye match), determine loser by elimination
      const losingTeam = match.loserId
        ? (match.team1Id === match.loserId ? match.team1 : match.team2)
        : (match.team1Id === match.winnerId ? match.team2 : match.team1);

      if (!losingTeam) continue;

      // Winning team players: -1 win, -1 match
      for (const tp of winningTeam.teamPlayers) {
        const existing = playerStatChanges.get(tp.playerId) || { winsDelta: 0, matchesDelta: 0 };
        existing.winsDelta -= 1;
        existing.matchesDelta -= 1;
        playerStatChanges.set(tp.playerId, existing);
      }

      // Losing team players: -1 match
      for (const tp of losingTeam.teamPlayers) {
        const existing = playerStatChanges.get(tp.playerId) || { winsDelta: 0, matchesDelta: 0 };
        existing.matchesDelta -= 1;
        playerStatChanges.set(tp.playerId, existing);
      }
    }

    // Apply player stat changes in batch
    for (const [playerId, changes] of playerStatChanges) {
      await db.player.update({
        where: { id: playerId },
        data: {
          ...(changes.winsDelta !== 0 && { totalWins: { increment: changes.winsDelta } }),
          ...(changes.matchesDelta !== 0 && { matches: { increment: changes.matchesDelta } }),
          streak: 0,
        },
      });
      // Clamp to 0
      await db.$executeRaw`UPDATE "Player" SET "totalWins" = GREATEST("totalWins", 0), matches = GREATEST(matches, 0) WHERE id = ${playerId} AND ("totalWins" < 0 OR matches < 0)`;
    }

    // ─── Step 3: Rollback club stats (batch) ───
    // Collect club stat changes per club
    const clubStatChanges = new Map<string, { winsDelta: number; lossesDelta: number; pointsDelta: number; gameDiffDelta: number }>();

    for (const match of tournament.matches) {
      if (!match.team1 || !match.team2) continue;
      if (!match.winnerId) continue;

      const winningTeam = match.team1Id === match.winnerId ? match.team1 : match.team2;
      const losingTeam = match.loserId
        ? (match.team1Id === match.loserId ? match.team1 : match.team2)
        : (match.team1Id === match.winnerId ? match.team2 : match.team1);

      if (!losingTeam) continue;

      const gameDiff = Math.abs((match.score1 || 0) - (match.score2 || 0));

      // Get club memberships for all players in this match
      const allPlayerIds = [
        ...winningTeam.teamPlayers.map(tp => tp.playerId),
        ...losingTeam.teamPlayers.map(tp => tp.playerId),
      ];

      const memberships = await db.clubMember.findMany({
        where: {
          playerId: { in: allPlayerIds },
          club: { division: tournament.division, seasonId: tournament.seasonId },
        },
        select: { playerId: true, clubId: true },
      });

      const winningPlayerIds = new Set(winningTeam.teamPlayers.map(tp => tp.playerId));

      for (const membership of memberships) {
        const isWinner = winningPlayerIds.has(membership.playerId);
        const existing = clubStatChanges.get(membership.clubId) || { winsDelta: 0, lossesDelta: 0, pointsDelta: 0, gameDiffDelta: 0 };

        if (isWinner) {
          existing.winsDelta -= 1;
          existing.pointsDelta -= 2;
          existing.gameDiffDelta -= gameDiff;
        } else {
          existing.lossesDelta -= 1;
          existing.gameDiffDelta += gameDiff;
        }
        clubStatChanges.set(membership.clubId, existing);
      }
    }

    // Apply club stat changes in batch
    for (const [clubId, changes] of clubStatChanges) {
      await db.club.update({
        where: { id: clubId },
        data: {
          ...(changes.winsDelta !== 0 && { wins: { increment: changes.winsDelta } }),
          ...(changes.lossesDelta !== 0 && { losses: { increment: changes.lossesDelta } }),
          ...(changes.pointsDelta !== 0 && { points: { increment: changes.pointsDelta } }),
          ...(changes.gameDiffDelta !== 0 && { gameDiff: { increment: changes.gameDiffDelta } }),
        },
      });
    }

    // ─── Step 4: Delete all tournament data ───
    // Use separate small transactions to avoid Neon timeout
    await db.$transaction(async (tx) => {
      await tx.match.deleteMany({ where: { tournamentId: id } });
    });

    await db.$transaction(async (tx) => {
      const teams = await tx.team.findMany({ where: { tournamentId: id }, select: { id: true } });
      for (const t of teams) {
        await tx.teamPlayer.deleteMany({ where: { teamId: t.id } });
      }
      await tx.team.deleteMany({ where: { tournamentId: id } });
    });

    await db.$transaction(async (tx) => {
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

  // ─── Handle status reversion (cleanup data from later phases) ───
  if (body._revert && body.status) {
    const statusOrder = ['setup', 'registration', 'approval', 'team_generation', 'bracket_generation', 'main_event', 'finalization', 'completed'];
    const currentTournament = await db.tournament.findUnique({ where: { id }, select: { status: true } });
    if (currentTournament) {
      const currentIdx = statusOrder.indexOf(currentTournament.status);
      const targetIdx = statusOrder.indexOf(body.status);

      if (targetIdx < currentIdx) {
        // Reverting — clean up data from phases after the target

        // If reverting before finalization: rollback points, prizes, achievements
        if (targetIdx < statusOrder.indexOf('finalization') && currentIdx >= statusOrder.indexOf('finalization')) {
          // Rollback player points from this tournament
          const pointRecords = await db.playerPoint.findMany({
            where: { tournamentId: id },
            select: { playerId: true, amount: true },
          });
          const pointsByPlayer = new Map<string, number>();
          for (const pr of pointRecords) {
            pointsByPlayer.set(pr.playerId, (pointsByPlayer.get(pr.playerId) || 0) + pr.amount);
          }
          for (const [playerId, totalPoints] of pointsByPlayer) {
            await db.player.updateMany({
              where: { id: playerId },
              data: { points: { decrement: totalPoints } },
            });
            await db.$executeRaw`UPDATE "Player" SET points = GREATEST(points, 0) WHERE id = ${playerId} AND points < 0`;
          }
          await db.playerPoint.deleteMany({ where: { tournamentId: id } });
          await db.tournamentPrize.deleteMany({ where: { tournamentId: id } });
          await db.playerAchievement.deleteMany({ where: { tournamentId: id } });
        }

        // If reverting before bracket_generation: delete all matches
        if (targetIdx < statusOrder.indexOf('bracket_generation') && currentIdx >= statusOrder.indexOf('bracket_generation')) {
          // Rollback match stats first
          const completedMatches = await db.match.findMany({
            where: { tournamentId: id, status: 'completed', winnerId: { not: null } },
            select: {
              id: true,
              team1Id: true,
              team2Id: true,
              winnerId: true,
              loserId: true,
              score1: true,
              score2: true,
              team1: { select: { id: true, teamPlayers: { select: { playerId: true } } } },
              team2: { select: { id: true, teamPlayers: { select: { playerId: true } } } },
            },
          });

          const playerStatChanges = new Map<string, { winsDelta: number; matchesDelta: number }>();
          for (const match of completedMatches) {
            if (!match.team1 || !match.team2 || !match.winnerId) continue;
            const winningTeam = match.team1Id === match.winnerId ? match.team1 : match.team2;
            const losingTeam = match.loserId
              ? (match.team1Id === match.loserId ? match.team1 : match.team2)
              : (match.team1Id === match.winnerId ? match.team2 : match.team1);
            if (!losingTeam) continue;
            for (const tp of winningTeam.teamPlayers) {
              const existing = playerStatChanges.get(tp.playerId) || { winsDelta: 0, matchesDelta: 0 };
              existing.winsDelta -= 1;
              existing.matchesDelta -= 1;
              playerStatChanges.set(tp.playerId, existing);
            }
            for (const tp of losingTeam.teamPlayers) {
              const existing = playerStatChanges.get(tp.playerId) || { winsDelta: 0, matchesDelta: 0 };
              existing.matchesDelta -= 1;
              playerStatChanges.set(tp.playerId, existing);
            }
          }
          for (const [playerId, changes] of playerStatChanges) {
            await db.player.update({
              where: { id: playerId },
              data: {
                ...(changes.winsDelta !== 0 && { totalWins: { increment: changes.winsDelta } }),
                ...(changes.matchesDelta !== 0 && { matches: { increment: changes.matchesDelta } }),
              },
            });
            await db.$executeRaw`UPDATE "Player" SET "totalWins" = GREATEST("totalWins", 0), matches = GREATEST(matches, 0) WHERE id = ${playerId} AND ("totalWins" < 0 OR matches < 0)`;
          }

          await db.match.deleteMany({ where: { tournamentId: id } });
        }

        // If reverting before team_generation: delete all teams
        if (targetIdx < statusOrder.indexOf('team_generation') && currentIdx >= statusOrder.indexOf('team_generation')) {
          const teams = await db.team.findMany({ where: { tournamentId: id }, select: { id: true } });
          for (const t of teams) {
            await db.teamPlayer.deleteMany({ where: { teamId: t.id } });
          }
          await db.team.deleteMany({ where: { tournamentId: id } });
        }

        // Reset participations back to 'registered' if reverting before approval
        if (targetIdx < statusOrder.indexOf('approval') && currentIdx >= statusOrder.indexOf('approval')) {
          await db.participation.updateMany({
            where: { tournamentId: id, status: { in: ['approved', 'assigned'] } },
            data: { status: 'registered', tierOverride: null },
          });
        }
      }
    }
  }
  delete body._revert; // Don't store this in DB

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
