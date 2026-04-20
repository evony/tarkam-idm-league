import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { awardPoints, processTierUpgrade } from '@/lib/points';
import { checkTournamentAchievements } from '@/lib/achievements';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  let body: { mvpPlayerId?: string } = {};
  try {
    body = await request.json();
  } catch {
    // Empty body is OK — mvpPlayerId is optional
  }
  const { mvpPlayerId } = body;

  const tournament = await db.tournament.findUnique({
    where: { id },
    include: {
      matches: { include: { team1: true, team2: true, winner: true, loser: true, mvpPlayer: true }, orderBy: { round: 'asc' } },
      teams: { include: { teamPlayers: { include: { player: true } } } },
      participations: { include: { player: true } },
      prizes: { orderBy: { position: 'asc' } },
    },
  });

  if (!tournament) {
    return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
  }

  if (tournament.status !== 'finalization') {
    return NextResponse.json({ 
      error: `Tournament harus dalam status finalization. Status saat ini: ${tournament.status}. ${
        tournament.status === 'main_event' ? 'Selesaikan semua match terlebih dahulu.' :
        tournament.status === 'team_generation' ? 'Generate tim dan bracket terlebih dahulu.' :
        tournament.status === 'bracket_generation' ? 'Mulai event dan selesaikan match terlebih dahulu.' :
        'Lanjutkan proses tournament hingga fase finalisasi.'
      }` 
    }, { status: 400 });
  }

  // Check that there are no incomplete matches that have both teams assigned
  // Matches with null teams (unfilled bracket slots) are OK — they were never playable
  const playableIncomplete = tournament.matches.filter(
    m => (m.status === 'pending' || m.status === 'ready' || m.status === 'live') && m.team1Id && m.team2Id
  );
  if (playableIncomplete.length > 0) {
    return NextResponse.json({
      error: `Masih ada ${playableIncomplete.length} pertandingan yang belum selesai. Semua match harus diselesaikan sebelum finalisasi.`,
    }, { status: 400 });
  }

  // Check if there are any completed matches at all
  const completedMatches = tournament.matches.filter(m => m.status === 'completed');
  if (completedMatches.length === 0) {
    return NextResponse.json({ error: 'Tournament belum ada match yang selesai. Tidak bisa finalisasi.' }, { status: 400 });
  }

  // ===== DETERMINE TEAM RANKINGS =====
  const format = tournament.format;

  let rank1TeamId: string | null = null;
  let rank2TeamId: string | null = null;
  let rank3TeamIds: string[] = [];

  if (format === 'single_elimination' || format === 'double_elimination') {
    // Find the final match (highest round in upper bracket or grand final)
    const upperMatches = tournament.matches.filter(m => m.bracket === 'upper' || m.bracket === 'grand_final');
    const maxRound = Math.max(...upperMatches.map(m => m.round));
    const finalMatch = upperMatches.find(m => m.round === maxRound && m.status === 'completed');

    if (finalMatch) {
      rank1TeamId = finalMatch.winnerId;
      rank2TeamId = finalMatch.loserId;

      // Semi-final losers = rank 3
      const semiMatches = upperMatches.filter(m => m.round === maxRound - 1 && m.status === 'completed');
      for (const sm of semiMatches) {
        if (sm.loserId && sm.loserId !== rank2TeamId) {
          rank3TeamIds.push(sm.loserId);
        }
      }
    }

    // For DE: also check grand final
    if (format === 'double_elimination') {
      const gf = tournament.matches.find(m => m.bracket === 'grand_final' && m.status === 'completed');
      if (gf) {
        rank1TeamId = gf.winnerId;
        rank2TeamId = gf.loserId;
      }
    }
  } else if (format === 'group_stage') {
    const finalMatch = tournament.matches.find(m => m.groupLabel === 'Final' && m.status === 'completed');
    const thirdMatch = tournament.matches.find(m => m.groupLabel === '3rd' && m.status === 'completed');

    if (finalMatch) {
      rank1TeamId = finalMatch.winnerId;
      rank2TeamId = finalMatch.loserId;
    }
    if (thirdMatch) {
      rank3TeamIds = thirdMatch.winnerId ? [thirdMatch.winnerId] : [];
    }
  }

  // Update team ranks
  if (rank1TeamId) {
    await db.team.update({ where: { id: rank1TeamId }, data: { rank: 1, isWinner: true } });
  }
  if (rank2TeamId) {
    await db.team.update({ where: { id: rank2TeamId }, data: { rank: 2 } });
  }
  for (const tid of rank3TeamIds) {
    await db.team.update({ where: { id: tid }, data: { rank: 3 } });
  }

  // ===== AWARD PRIZE POINTS WITH AUDIT TRAIL =====
  // Bug #6 fix: Use position field for matching instead of label string matching
  const tierUpgrades: { playerId: string; gamertag: string; fromTier: string; toTier: string }[] = [];

  // Build position → team map
  const positionTeamMap: Record<number, string | null> = {
    1: rank1TeamId,
    2: rank2TeamId,
    3: rank3TeamIds[0] || null,
  };

  for (const prize of tournament.prizes) {
    const isMvpPrize = prize.label.toLowerCase().includes('mvp') || prize.position === 99;

    // Map prize reason
    const getPrizeReason = (position: number, label: string): string => {
      const l = label.toLowerCase();
      if (l.includes('mvp') || position === 99) return 'prize_mvp';
      if (position === 1 || l.includes('juara 1') || l.includes('1st') || l.includes('champion')) return 'prize_juara1';
      if (position === 2 || l.includes('juara 2') || l.includes('2nd') || l.includes('runner')) return 'prize_juara2';
      if (position === 3 || l.includes('juara 3') || l.includes('3rd')) return 'prize_juara3';
      return 'prize_other';
    };

    if (isMvpPrize && mvpPlayerId) {
      const player = await db.player.findUnique({ where: { id: mvpPlayerId } });
      if (player) {
        await awardPoints({
          playerId: mvpPlayerId,
          amount: prize.pointsPerPlayer,
          reason: getPrizeReason(prize.position, prize.label),
          description: `MVP - ${tournament.name}`,
          tournamentId: id,
        });

        await db.player.update({
          where: { id: mvpPlayerId },
          data: { totalMvp: player.totalMvp + 1 },
        });

        const part = await db.participation.findUnique({
          where: { playerId_tournamentId: { playerId: mvpPlayerId, tournamentId: id } },
        });
        if (part) {
          await db.participation.update({
            where: { id: part.id },
            data: { pointsEarned: part.pointsEarned + prize.pointsPerPlayer, isMvp: true },
          });
        }

        const upgrade = await processTierUpgrade(mvpPlayerId);
        if (upgrade?.upgraded) {
          tierUpgrades.push({ playerId: mvpPlayerId, gamertag: player.gamertag, fromTier: upgrade.fromTier, toTier: upgrade.toTier });
        }
      }

      // Set MVP on the grand final / last match
      const lastMatch = tournament.matches
        .filter(m => m.status === 'completed')
        .sort((a, b) => b.round - a.round)[0];
      if (lastMatch) {
        await db.match.update({ where: { id: lastMatch.id }, data: { mvpPlayerId } });
      }
    } else if (!isMvpPrize) {
      // Bug #6 fix: Use position field first, fall back to label matching
      let targetTeamId: string | null = null;

      // Primary: use position field (1=1st, 2=2nd, 3=3rd)
      if (prize.position >= 1 && prize.position <= 3) {
        targetTeamId = positionTeamMap[prize.position] || null;
      }

      // Fallback: if position is 0 or invalid, try label matching
      if (!targetTeamId && prize.position === 0) {
        const l = prize.label.toLowerCase();
        if (l.includes('juara 1') || l.includes('1st') || l.includes('champion')) {
          targetTeamId = rank1TeamId;
        } else if (l.includes('juara 2') || l.includes('2nd') || l.includes('runner')) {
          targetTeamId = rank2TeamId;
        } else if (l.includes('juara 3') || l.includes('3rd')) {
          targetTeamId = rank3TeamIds[0] || null;
        }
      }

      if (targetTeamId) {
        const team = await db.team.findUnique({
          where: { id: targetTeamId },
          include: { teamPlayers: { include: { player: true } } },
        });

        if (team) {
          for (const tp of team.teamPlayers) {
            await awardPoints({
              playerId: tp.playerId,
              amount: prize.pointsPerPlayer,
              reason: getPrizeReason(prize.position, prize.label),
              description: `${prize.label} - ${tournament.name} (${team.name})`,
              tournamentId: id,
            });

            const part = await db.participation.findUnique({
              where: { playerId_tournamentId: { playerId: tp.playerId, tournamentId: id } },
            });
            if (part) {
              await db.participation.update({
                where: { id: part.id },
                data: {
                  pointsEarned: part.pointsEarned + prize.pointsPerPlayer,
                  isWinner: rank1TeamId === targetTeamId,
                },
              });
            }

            const upgrade = await processTierUpgrade(tp.playerId);
            if (upgrade?.upgraded) {
              tierUpgrades.push({ playerId: tp.playerId, gamertag: tp.player.gamertag, fromTier: upgrade.fromTier, toTier: upgrade.toTier });
            }
          }
        }
      }
    }
  }

  // ===== FINALIZE TOURNAMENT =====
  await db.tournament.update({
    where: { id },
    data: { status: 'completed', finalizedAt: new Date(), completedAt: new Date() },
  });

  // ===== CHECK AND AWARD ACHIEVEMENTS =====
  const achievementsAwarded = await checkTournamentAchievements(id);

  const result = await db.tournament.findUnique({
    where: { id },
    include: {
      matches: { include: { team1: true, team2: true, winner: true, mvpPlayer: true }, orderBy: { round: 'asc' } },
      teams: { include: { teamPlayers: { include: { player: true } } }, orderBy: { rank: 'asc' } },
      participations: { include: { player: true }, orderBy: { pointsEarned: 'desc' } },
      prizes: { orderBy: { position: 'asc' } },
    },
  });

  return NextResponse.json({ ...result, tierUpgrades, achievementsAwarded });
}
