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

  const tournament = await db.tournament.findUnique({ where: { id } });
  if (!tournament) {
    return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
  }

  // Allow deletion of tournaments in setup or registration status only
  if (tournament.status !== 'setup' && tournament.status !== 'registration') {
    return NextResponse.json({ error: 'Hanya tournament dengan status setup atau registration yang bisa dihapus' }, { status: 400 });
  }

  // Delete in order: matches → teamPlayers → teams → prizes → donations → participations → tournament
  await db.match.deleteMany({ where: { tournamentId: id } });
  const teams = await db.team.findMany({ where: { tournamentId: id }, select: { id: true } });
  for (const t of teams) {
    await db.teamPlayer.deleteMany({ where: { teamId: t.id } });
  }
  await db.team.deleteMany({ where: { tournamentId: id } });
  await db.tournamentPrize.deleteMany({ where: { tournamentId: id } });
  await db.donation.deleteMany({ where: { tournamentId: id } });
  await db.participation.deleteMany({ where: { tournamentId: id } });
  await db.playerPoint.deleteMany({ where: { tournamentId: id } });
  await db.tournament.delete({ where: { id } });

  return NextResponse.json({ success: true });
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
