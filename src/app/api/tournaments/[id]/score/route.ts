import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { awardPoints } from '@/lib/points';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const body = await request.json();
  const { matchId, score1, score2 } = body;

  if (!matchId || score1 === undefined || score2 === undefined) {
    return NextResponse.json({ error: 'matchId, score1, score2 required' }, { status: 400 });
  }

  const match = await db.match.findUnique({
    where: { id: matchId },
    include: { tournament: true, team1: { include: { teamPlayers: { include: { player: true } } } }, team2: { include: { teamPlayers: { include: { player: true } } } } },
  });

  if (!match) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }

  if (match.tournamentId !== id) {
    return NextResponse.json({ error: 'Match does not belong to this tournament' }, { status: 400 });
  }

  if (match.status === 'completed') {
    return NextResponse.json({ error: 'Match already completed' }, { status: 400 });
  }

  if (!match.team1Id || !match.team2Id) {
    return NextResponse.json({ error: 'Both teams must be set before scoring' }, { status: 400 });
  }

  const isGroupMatch = match.bracket === 'group';
  const isDraw = score1 === score2;

  // Determine winner and loser
  const winnerId = score1 > score2 ? match.team1Id : score2 > score1 ? match.team2Id : null;
  const loserId = score1 > score2 ? match.team2Id : score2 > score1 ? match.team1Id : null;

  // Only allow draws in group stage
  if (isDraw && !isGroupMatch) {
    return NextResponse.json({ error: 'Draws are not allowed in elimination brackets' }, { status: 400 });
  }

  if (isDraw && isGroupMatch) {
    // Handle draw in group stage — no winner/loser, just record scores
    const updatedMatch = await db.match.update({
      where: { id: matchId },
      data: {
        score1,
        score2,
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // Award participation points to both teams in draw
    for (const team of [match.team1!, match.team2!]) {
      for (const tp of team.teamPlayers) {
        const participation = await db.participation.findUnique({
          where: { playerId_tournamentId: { playerId: tp.playerId, tournamentId: id } },
        });
        if (participation) {
          const participationPtGiven = participation.pointsEarned >= 1;
          const participationPts = participationPtGiven ? 0 : 1;
          const drawPts = 1; // 1 point for draw

          await db.participation.update({
            where: { id: participation.id },
            data: { pointsEarned: participation.pointsEarned + participationPts + drawPts },
          });

          if (!participationPtGiven) {
            await awardPoints({
              playerId: tp.playerId, amount: 1, reason: 'participation',
              description: `Partisipasi tournament - ${match.tournament.name}`, tournamentId: id, matchId,
            });
          }

          await awardPoints({
            playerId: tp.playerId, amount: drawPts, reason: 'match_draw',
            description: `Seri match R${match.round}M${match.matchNumber}`, tournamentId: id, matchId,
          });

          await db.player.update({
            where: { id: tp.playerId },
            data: { matches: tp.player.matches + 1 },
          });
        }
      }
    }

    // Check if all group matches are done → seed playoffs
    await checkAndSeedPlayoffs(id);

    // Check if all matches done
    await checkAllMatchesComplete(id);
    return NextResponse.json(updatedMatch);
  }

  // Non-draw match — there is a winner
  if (!winnerId) {
    return NextResponse.json({ error: 'No winner determined' }, { status: 400 });
  }

  const winningTeam = match.team1Id === winnerId ? match.team1! : match.team2!;
  const losingTeam = match.team1Id === loserId ? match.team1! : match.team2!;
  const matchLabel = `R${match.round}M${match.matchNumber} ${winningTeam.name} vs ${losingTeam.name}`;

  // Update the match
  const updatedMatch = await db.match.update({
    where: { id: matchId },
    data: {
      score1,
      score2,
      status: 'completed',
      winnerId,
      loserId,
      completedAt: new Date(),
    },
  });

  // ===== AWARD MATCH POINTS WITH AUDIT TRAIL =====
  // 1 participation point (once per tournament) + 2 points per match win
  for (const tp of winningTeam.teamPlayers) {
    const participation = await db.participation.findUnique({
      where: { playerId_tournamentId: { playerId: tp.playerId, tournamentId: id } },
    });

    if (participation) {
      const participationPtGiven = participation.pointsEarned >= 1;
      const participationPts = participationPtGiven ? 0 : 1;
      const winPts = 2;
      const totalPts = participationPts + winPts;

      await db.participation.update({
        where: { id: participation.id },
        data: { pointsEarned: participation.pointsEarned + totalPts },
      });

      if (!participationPtGiven) {
        await awardPoints({
          playerId: tp.playerId, amount: 1, reason: 'participation',
          description: `Partisipasi tournament - ${match.tournament.name}`, tournamentId: id, matchId,
        });
      }

      await awardPoints({
        playerId: tp.playerId, amount: winPts, reason: 'match_win',
        description: `Menang match ${matchLabel}`, tournamentId: id, matchId,
      });

      const player = tp.player;
      const newStreak = player.streak + 1;
      await db.player.update({
        where: { id: tp.playerId },
        data: {
          totalWins: player.totalWins + 1,
          matches: player.matches + 1,
          streak: newStreak,
          maxStreak: Math.max(newStreak, player.maxStreak),
        },
      });
    }
  }

  // Losing team: 1 participation point (once)
  for (const tp of losingTeam.teamPlayers) {
    const participation = await db.participation.findUnique({
      where: { playerId_tournamentId: { playerId: tp.playerId, tournamentId: id } },
    });

    if (participation) {
      const participationPtGiven = participation.pointsEarned >= 1;
      const participationPts = participationPtGiven ? 0 : 1;

      await db.participation.update({
        where: { id: participation.id },
        data: { pointsEarned: participation.pointsEarned + participationPts },
      });

      if (!participationPtGiven) {
        await awardPoints({
          playerId: tp.playerId, amount: 1, reason: 'participation',
          description: `Partisipasi tournament - ${match.tournament.name}`, tournamentId: id, matchId,
        });
      }

      await db.player.update({
        where: { id: tp.playerId },
        data: {
          matches: tp.player.matches + 1,
          streak: 0,
        },
      });
    }
  }

  // ===== BRACKET ADVANCEMENT =====
  const tournament2 = await db.tournament.findUnique({ where: { id } });
  if (!tournament2) return NextResponse.json(updatedMatch);

  const format = tournament2.format;
  const currentRound = match.round;
  const currentMatchNumber = match.matchNumber;
  const bracket = match.bracket;

  // Group match — no direct advancement, but check if group stage is done
  if (bracket === 'group' && format === 'group_stage') {
    await checkAndSeedPlayoffs(id);
    await checkAllMatchesComplete(id);
    return NextResponse.json(updatedMatch);
  }

  // Playoff match advancement for group_stage format
  if (format === 'group_stage' && (bracket === 'upper' || bracket === 'lower') && match.round >= 2) {
    if (bracket === 'upper' && match.groupLabel === 'SF1') {
      // Semi Final 1: winner → Final, loser → 3rd Place
      const finalMatch = await db.match.findFirst({ where: { tournamentId: id, round: 3, bracket: 'upper', groupLabel: 'Final' } });
      const thirdMatch = await db.match.findFirst({ where: { tournamentId: id, round: 3, bracket: 'lower', groupLabel: '3rd' } });

      if (finalMatch && winnerId) {
        await db.match.update({ where: { id: finalMatch.id }, data: { team1Id: winnerId } });
        const updated = await db.match.findUnique({ where: { id: finalMatch.id } });
        if (updated?.team1Id && updated?.team2Id && updated.status === 'pending') {
          await db.match.update({ where: { id: finalMatch.id }, data: { status: 'ready' } });
        }
      }
      if (thirdMatch && loserId) {
        await db.match.update({ where: { id: thirdMatch.id }, data: { team1Id: loserId } });
        const updated = await db.match.findUnique({ where: { id: thirdMatch.id } });
        if (updated?.team1Id && updated?.team2Id && updated.status === 'pending') {
          await db.match.update({ where: { id: thirdMatch.id }, data: { status: 'ready' } });
        }
      }
    } else if (bracket === 'upper' && match.groupLabel === 'SF2') {
      // Semi Final 2: winner → Final, loser → 3rd Place
      const finalMatch = await db.match.findFirst({ where: { tournamentId: id, round: 3, bracket: 'upper', groupLabel: 'Final' } });
      const thirdMatch = await db.match.findFirst({ where: { tournamentId: id, round: 3, bracket: 'lower', groupLabel: '3rd' } });

      if (finalMatch && winnerId) {
        await db.match.update({ where: { id: finalMatch.id }, data: { team2Id: winnerId } });
        const updated = await db.match.findUnique({ where: { id: finalMatch.id } });
        if (updated?.team1Id && updated?.team2Id && updated.status === 'pending') {
          await db.match.update({ where: { id: finalMatch.id }, data: { status: 'ready' } });
        }
      }
      if (thirdMatch && loserId) {
        await db.match.update({ where: { id: thirdMatch.id }, data: { team2Id: loserId } });
        const updated = await db.match.findUnique({ where: { id: thirdMatch.id } });
        if (updated?.team1Id && updated?.team2Id && updated.status === 'pending') {
          await db.match.update({ where: { id: thirdMatch.id }, data: { status: 'ready' } });
        }
      }
    }
    // Final and 3rd place matches — no further advancement needed

    await checkAllMatchesComplete(id);
    return NextResponse.json(updatedMatch);
  }

  // Single/Double elimination upper bracket advancement
  if (bracket === 'upper' && format !== 'group_stage') {
    const nextRound = currentRound + 1;
    const nextMatchNumber = Math.ceil(currentMatchNumber / 2);
    const nextMatch = await db.match.findFirst({
      where: { tournamentId: id, round: nextRound, bracket: 'upper', matchNumber: nextMatchNumber },
    });

    if (nextMatch) {
      const isOdd = currentMatchNumber % 2 === 1;
      await db.match.update({
        where: { id: nextMatch.id },
        data: {
          ...(isOdd ? { team1Id: winnerId } : { team2Id: winnerId }),
        },
      });

      const updated = await db.match.findUnique({ where: { id: nextMatch.id } });
      if (updated?.team1Id && updated?.team2Id && updated.status === 'pending') {
        await db.match.update({ where: { id: nextMatch.id }, data: { status: 'ready' } });
      }
    }

    // For DE: loser drops to lower bracket
    if (format === 'double_elimination' && loserId) {
      const lowerRound = currentRound;
      const lowerMatch = await db.match.findFirst({
        where: { tournamentId: id, round: lowerRound, bracket: 'lower' },
        orderBy: { matchNumber: 'asc' },
      });

      if (lowerMatch) {
        if (!lowerMatch.team1Id) {
          await db.match.update({ where: { id: lowerMatch.id }, data: { team1Id: loserId } });
        } else if (!lowerMatch.team2Id) {
          await db.match.update({ where: { id: lowerMatch.id }, data: { team2Id: loserId } });
          const updated2 = await db.match.findUnique({ where: { id: lowerMatch.id } });
          if (updated2?.team1Id && updated2?.team2Id && updated2.status === 'pending') {
            await db.match.update({ where: { id: lowerMatch.id }, data: { status: 'ready' } });
          }
        }
      }
    }
  }

  // Lower bracket winner advancement (DE)
  if (bracket === 'lower' && format === 'double_elimination') {
    const nextLowerRound = currentRound + 1;
    const nextLowerMatch = await db.match.findFirst({
      where: { tournamentId: id, round: nextLowerRound, bracket: 'lower' },
    });

    if (nextLowerMatch) {
      if (!nextLowerMatch.team1Id) {
        await db.match.update({ where: { id: nextLowerMatch.id }, data: { team1Id: winnerId } });
      } else if (!nextLowerMatch.team2Id) {
        await db.match.update({ where: { id: nextLowerMatch.id }, data: { team2Id: winnerId } });
        const updated3 = await db.match.findUnique({ where: { id: nextLowerMatch.id } });
        if (updated3?.team1Id && updated3?.team2Id && updated3.status === 'pending') {
          await db.match.update({ where: { id: nextLowerMatch.id }, data: { status: 'ready' } });
        }
      }
    } else {
      // No more lower rounds → winner goes to grand final
      const gf = await db.match.findFirst({ where: { tournamentId: id, bracket: 'grand_final' } });
      if (gf) {
        await db.match.update({ where: { id: gf.id }, data: { team2Id: winnerId } });
        const updated4 = await db.match.findUnique({ where: { id: gf.id } });
        if (updated4?.team1Id && updated4?.team2Id && updated4.status === 'pending') {
          await db.match.update({ where: { id: gf.id }, data: { status: 'ready' } });
        }
      }
    }
  }

  await checkAllMatchesComplete(id);
  return NextResponse.json(updatedMatch);
}

// ===== Helper: Check if all group matches done and seed playoffs =====
async function checkAndSeedPlayoffs(tournamentId: string) {
  const tournament = await db.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament || tournament.format !== 'group_stage') return;

  // Check if group matches are all completed
  const groupMatches = await db.match.findMany({
    where: { tournamentId, bracket: 'group' },
  });

  const allGroupDone = groupMatches.length > 0 && groupMatches.every(m => m.status === 'completed');
  if (!allGroupDone) return;

  // Check if playoffs already seeded
  const semi1 = await db.match.findFirst({ where: { tournamentId, groupLabel: 'SF1' } });
  if (semi1?.team1Id) return; // Already seeded

  // Compute group standings
  const groupLabels = [...new Set(groupMatches.map(m => m.groupLabel))].sort();

  // For each group, compute standings
  const standingsByGroup: Record<string, { teamId: string; wins: number; draws: number; losses: number; points: number; gameWins: number; gameLosses: number }[]> = {};

  for (const label of groupLabels) {
    const groupLabelMatches = groupMatches.filter(m => m.groupLabel === label);
    const teamMap = new Map<string, { teamId: string; wins: number; draws: number; losses: number; points: number; gameWins: number; gameLosses: number }>();

    for (const m of groupLabelMatches) {
      if (!m.team1Id || !m.team2Id) continue;
      const s1 = m.score1 ?? 0;
      const s2 = m.score2 ?? 0;

      if (!teamMap.has(m.team1Id)) teamMap.set(m.team1Id, { teamId: m.team1Id, wins: 0, draws: 0, losses: 0, points: 0, gameWins: 0, gameLosses: 0 });
      if (!teamMap.has(m.team2Id)) teamMap.set(m.team2Id, { teamId: m.team2Id, wins: 0, draws: 0, losses: 0, points: 0, gameWins: 0, gameLosses: 0 });

      const t1 = teamMap.get(m.team1Id)!;
      const t2 = teamMap.get(m.team2Id)!;

      t1.gameWins += s1; t1.gameLosses += s2;
      t2.gameWins += s2; t2.gameLosses += s1;

      if (s1 > s2) { t1.wins++; t1.points += 3; t2.losses++; }
      else if (s2 > s1) { t2.wins++; t2.points += 3; t1.losses++; }
      else { t1.draws++; t2.draws++; t1.points++; t2.points++; }
    }

    const sorted = Array.from(teamMap.values()).sort((a, b) =>
      b.points - a.points || b.wins - a.wins || (b.gameWins - b.gameLosses) - (a.gameWins - a.gameLosses)
    );
    standingsByGroup[label] = sorted;
  }

  // Seed playoffs: A1 vs B2 (SF1), B1 vs A2 (SF2)
  // Supports 2 groups (A, B) — the standard for 8 teams / 4 per group
  const groupA = standingsByGroup['A'];
  const groupB = standingsByGroup['B'];

  if (groupA && groupB && groupA.length >= 2 && groupB.length >= 2) {
    const A1 = groupA[0].teamId; // 1st place Group A
    const A2 = groupA[1].teamId; // 2nd place Group A
    const B1 = groupB[0].teamId; // 1st place Group B
    const B2 = groupB[1].teamId; // 2nd place Group B

    // SF1: A1 vs B2
    const sf1 = await db.match.findFirst({ where: { tournamentId, groupLabel: 'SF1' } });
    if (sf1) {
      await db.match.update({
        where: { id: sf1.id },
        data: { team1Id: A1, team2Id: B2, status: 'ready' },
      });
    }

    // SF2: B1 vs A2
    const sf2 = await db.match.findFirst({ where: { tournamentId, groupLabel: 'SF2' } });
    if (sf2) {
      await db.match.update({
        where: { id: sf2.id },
        data: { team1Id: B1, team2Id: A2, status: 'ready' },
      });
    }
  } else if (groupA && groupA.length >= 2) {
    // Single group fallback: 1st vs 4th, 2nd vs 3rd
    const A1 = groupA[0]?.teamId;
    const A2 = groupA[1]?.teamId;

    const sf1 = await db.match.findFirst({ where: { tournamentId, groupLabel: 'SF1' } });
    if (sf1 && A1) {
      await db.match.update({ where: { id: sf1.id }, data: { team1Id: A1, status: 'pending' } });
    }

    const sf2 = await db.match.findFirst({ where: { tournamentId, groupLabel: 'SF2' } });
    if (sf2 && A2) {
      await db.match.update({ where: { id: sf2.id }, data: { team1Id: A2, status: 'pending' } });
    }
  }
}

// ===== Helper: Check if all matches complete → auto advance =====
async function checkAllMatchesComplete(tournamentId: string) {
  const pendingMatches = await db.match.count({
    where: { tournamentId, status: { in: ['pending', 'ready', 'live'] } },
  });

  if (pendingMatches === 0) {
    await db.tournament.update({ where: { id: tournamentId }, data: { status: 'finalization' } });
  } else {
    const tournament = await db.tournament.findUnique({ where: { id: tournamentId } });
    if (tournament?.status === 'bracket_generation') {
      await db.tournament.update({ where: { id: tournamentId }, data: { status: 'main_event' } });
    }
  }
}
