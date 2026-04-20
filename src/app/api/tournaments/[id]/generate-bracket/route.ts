import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { NextResponse } from 'next/server';

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  const tournament = await db.tournament.findUnique({
    where: { id },
    include: { teams: true },
  });

  if (!tournament) {
    return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
  }

  if (tournament.teams.length < 2) {
    return NextResponse.json({ error: 'Need at least 2 teams to generate bracket' }, { status: 400 });
  }

  // Delete existing matches (regeneration support)
  await db.match.deleteMany({ where: { tournamentId: id } });

  const shuffledTeams = shuffle(tournament.teams);
  const teamCount = shuffledTeams.length;
  const format = tournament.format || 'single_elimination';
  const matchFormat = tournament.defaultMatchFormat || 'BO1';

  const matches = [];

  // ===== SINGLE ELIMINATION =====
  if (format === 'single_elimination') {
    const p2 = nextPowerOf2(teamCount);
    const totalRounds = Math.ceil(Math.log2(p2));
    const byes = p2 - teamCount;

    // Round 1: pair up teams, some get byes
    let matchNumber = 0;

    let teamIdx = 0;
    for (let i = 0; i < Math.floor(p2 / 2); i++) {
      matchNumber++;
      const positionInRound = i + 1; // 1-indexed position within round

      if (i < byes) {
        const byeTeam = shuffledTeams[teamIdx++];
        const match = await db.match.create({
          data: {
            tournamentId: id,
            round: 1,
            matchNumber,
            bracket: 'upper',
            format: matchFormat,
            groupLabel: `U1-${positionInRound}`, // Upper round 1, position N
            team1Id: byeTeam.id,
            team2Id: null,
            status: 'completed',
            score1: 1,
            score2: 0,
            winnerId: byeTeam.id,
            completedAt: new Date(),
          },
        });
        matches.push(match);
      } else {
        const t1 = shuffledTeams[teamIdx++];
        const t2 = teamIdx < shuffledTeams.length ? shuffledTeams[teamIdx++] : null;
        const match = await db.match.create({
          data: {
            tournamentId: id,
            round: 1,
            matchNumber,
            bracket: 'upper',
            format: matchFormat,
            groupLabel: `U1-${positionInRound}`,
            team1Id: t1.id,
            team2Id: t2?.id || null,
            status: t2 ? 'ready' : 'completed',
            ...(t2 ? {} : { score1: 1, score2: 0, winnerId: t1.id, completedAt: new Date() }),
          },
        });
        matches.push(match);
      }
    }

    // Create later rounds with TBD teams
    let prevRoundMatchCount = matchNumber;
    for (let round = 2; round <= totalRounds; round++) {
      const matchesInRound = Math.ceil(prevRoundMatchCount / 2);
      for (let i = 1; i <= matchesInRound; i++) {
        matchNumber++;
        const match = await db.match.create({
          data: {
            tournamentId: id,
            round,
            matchNumber,
            bracket: 'upper',
            format: matchFormat,
            groupLabel: `U${round}-${i}`,
            team1Id: null,
            team2Id: null,
            status: 'pending',
          },
        });
        matches.push(match);
      }
      prevRoundMatchCount = matchesInRound;
    }

    // Feed bye winners into round 2
    const round2Matches = await db.match.findMany({
      where: { tournamentId: id, round: 2 },
      orderBy: { matchNumber: 'asc' },
    });

    const completedR1 = await db.match.findMany({
      where: { tournamentId: id, round: 1, status: 'completed' },
      orderBy: { matchNumber: 'asc' },
    });

    for (const r1 of completedR1) {
      if (!r1.winnerId) continue;
      // Parse position from groupLabel
      const r1Pos = parseInt(r1.groupLabel?.split('-')[1] || '1');
      const r2Idx = Math.ceil(r1Pos / 2) - 1;
      if (r2Idx >= 0 && r2Idx < round2Matches.length) {
        const r2 = round2Matches[r2Idx];
        const isOdd = r1Pos % 2 === 1;
        await db.match.update({
          where: { id: r2.id },
          data: isOdd ? { team1Id: r1.winnerId } : { team2Id: r1.winnerId },
        });

        const updated = await db.match.findUnique({ where: { id: r2.id } });
        if (updated?.team1Id && updated?.team2Id) {
          await db.match.update({ where: { id: r2.id }, data: { status: 'ready' } });
        }
      }
    }
  }

  // ===== DOUBLE ELIMINATION =====
  else if (format === 'double_elimination') {
    const p2 = nextPowerOf2(teamCount);
    const upperRounds = Math.ceil(Math.log2(p2));
    const byes = p2 - teamCount;
    let matchNumber = 0;

    // ---- Upper bracket (same structure as SE) ----
    let teamIdx = 0;

    // Round 1 upper
    for (let i = 0; i < Math.floor(p2 / 2); i++) {
      matchNumber++;
      const positionInRound = i + 1;

      if (i < byes) {
        const byeTeam = shuffledTeams[teamIdx++];
        const match = await db.match.create({
          data: {
            tournamentId: id, round: 1, matchNumber, bracket: 'upper', format: matchFormat,
            groupLabel: `U1-${positionInRound}`,
            team1Id: byeTeam.id, team2Id: null, status: 'completed',
            score1: 1, score2: 0, winnerId: byeTeam.id, completedAt: new Date(),
          },
        });
        matches.push(match);
      } else {
        const t1 = shuffledTeams[teamIdx++];
        const t2 = teamIdx < shuffledTeams.length ? shuffledTeams[teamIdx++] : null;
        const match = await db.match.create({
          data: {
            tournamentId: id, round: 1, matchNumber, bracket: 'upper', format: matchFormat,
            groupLabel: `U1-${positionInRound}`,
            team1Id: t1.id, team2Id: t2?.id || null,
            status: t2 ? 'ready' : 'completed',
            ...(t2 ? {} : { score1: 1, score2: 0, winnerId: t1.id, completedAt: new Date() }),
          },
        });
        matches.push(match);
      }
    }

    // Later upper rounds
    let prevCount = Math.floor(p2 / 2);
    for (let round = 2; round <= upperRounds; round++) {
      const count = Math.ceil(prevCount / 2);
      for (let i = 1; i <= count; i++) {
        matchNumber++;
        const match = await db.match.create({
          data: {
            tournamentId: id, round, matchNumber, bracket: 'upper', format: matchFormat,
            groupLabel: `U${round}-${i}`,
            team1Id: null, team2Id: null, status: 'pending',
          },
        });
        matches.push(match);
      }
      prevCount = count;
    }

    // Feed bye winners from UR1 into UR2
    const ur2Matches = await db.match.findMany({
      where: { tournamentId: id, round: 2, bracket: 'upper' },
      orderBy: { matchNumber: 'asc' },
    });
    const completedUR1 = await db.match.findMany({
      where: { tournamentId: id, round: 1, bracket: 'upper', status: 'completed' },
      orderBy: { matchNumber: 'asc' },
    });
    for (const r1 of completedUR1) {
      if (!r1.winnerId) continue;
      const r1Pos = parseInt(r1.groupLabel?.split('-')[1] || '1');
      const r2Idx = Math.ceil(r1Pos / 2) - 1;
      if (r2Idx >= 0 && r2Idx < ur2Matches.length) {
        const isOdd = r1Pos % 2 === 1;
        await db.match.update({
          where: { id: ur2Matches[r2Idx].id },
          data: isOdd ? { team1Id: r1.winnerId } : { team2Id: r1.winnerId },
        });
        const updated = await db.match.findUnique({ where: { id: ur2Matches[r2Idx].id } });
        if (updated?.team1Id && updated?.team2Id && updated.status === 'pending') {
          await db.match.update({ where: { id: ur2Matches[r2Idx].id }, data: { status: 'ready' } });
        }
      }
    }

    // ---- Lower bracket ----
    // Standard DE lower bracket structure:
    // - Total lower rounds: 2 * (upperRounds - 1)
    // - Odd LR (1,3,5...): "pure" rounds where losers from UR play each other, or LR winners play each other
    // - Even LR (2,4,6...): "mixed" rounds where LR survivors face UR losers
    //
    // Mapping:
    //   UR1 losers → LR1 (pure drop-in, play each other)
    //   LR1 winners + UR2 losers → LR2 (mixed)
    //   LR2 winners → LR3 (pure continuation, play each other)
    //   LR3 winners + UR3 losers → LR4 (mixed)
    //   LR4 winners → LR5 (pure continuation)
    //   LR5 winners + UR4 losers → LR6 (mixed)
    //   ...and so on
    //
    // Number of matches per lower round:
    //   LR1:  p2/4  (UR1 has p2/2 matches, losers halved into p2/4 pairs)
    //   LR2:  p2/4  (same count as LR1 — mixed round)
    //   LR3:  p2/8  (LR2 has p2/4 matches, winners halved into p2/8 pairs)
    //   LR4:  p2/8  (same count as LR3 — mixed round)
    //   LR5:  p2/16
    //   LR6:  p2/16
    //   ...

    const totalLowerRounds = 2 * (upperRounds - 1);

    for (let lr = 1; lr <= totalLowerRounds; lr++) {
      let matchesInRound: number;

      if (lr === 1) {
        // LR1: receives UR1 losers, they play each other
        matchesInRound = Math.max(1, Math.floor(p2 / 4));
      } else if (lr % 2 === 0) {
        // Even LR: mixed round — same count as previous odd round
        // (LR2 same as LR1, LR4 same as LR3, etc.)
        const prevOddRoundMatches = Math.max(1, Math.floor(p2 / Math.pow(2, Math.ceil(lr / 2) + 1)));
        matchesInRound = prevOddRoundMatches;
      } else {
        // Odd LR > 1: continuation — half of previous even round
        const prevEvenRoundMatches = Math.max(1, Math.floor(p2 / Math.pow(2, Math.ceil((lr - 1) / 2) + 1)));
        matchesInRound = Math.max(1, Math.ceil(prevEvenRoundMatches / 2));
      }

      for (let i = 1; i <= matchesInRound; i++) {
        matchNumber++;
        const match = await db.match.create({
          data: {
            tournamentId: id, round: lr, matchNumber, bracket: 'lower', format: matchFormat,
            groupLabel: `L${lr}-${i}`,
            team1Id: null, team2Id: null, status: 'pending',
          },
        });
        matches.push(match);
      }
    }

    // Grand final
    matchNumber++;
    const gf = await db.match.create({
      data: {
        tournamentId: id, round: totalLowerRounds + 1, matchNumber, bracket: 'grand_final',
        format: 'BO5', groupLabel: 'GF-1',
        team1Id: null, team2Id: null, status: 'pending',
      },
    });
    matches.push(gf);
  }

  // ===== GROUP STAGE =====
  else if (format === 'group_stage') {
    const groupSize = 4;
    const numGroups = Math.ceil(teamCount / groupSize);
    const groupLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    let matchNumber = 0;

    for (let g = 0; g < numGroups; g++) {
      const groupTeams = shuffledTeams.slice(g * groupSize, (g + 1) * groupSize);
      const label = groupLabels[g];

      // Round-robin: each team plays every other team
      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          matchNumber++;
          const match = await db.match.create({
            data: {
              tournamentId: id, round: 1, matchNumber, bracket: 'group', groupLabel: label, format: matchFormat,
              team1Id: groupTeams[i].id, team2Id: groupTeams[j].id, status: 'ready',
            },
          });
          matches.push(match);
        }
      }
    }

    // Create playoff bracket based on number of groups
    if (numGroups === 1) {
      // Single group: top 4 advance to playoffs
      // SF1: 1st vs 4th, SF2: 2nd vs 3rd
      matchNumber++;
      const sf1 = await db.match.create({
        data: {
          tournamentId: id, round: 2, matchNumber, bracket: 'upper', groupLabel: 'SF1', format: 'BO3',
          team1Id: null, team2Id: null, status: 'pending',
        },
      });
      matches.push(sf1);

      matchNumber++;
      const sf2 = await db.match.create({
        data: {
          tournamentId: id, round: 2, matchNumber, bracket: 'upper', groupLabel: 'SF2', format: 'BO3',
          team1Id: null, team2Id: null, status: 'pending',
        },
      });
      matches.push(sf2);

      matchNumber++;
      const final_ = await db.match.create({
        data: {
          tournamentId: id, round: 3, matchNumber, bracket: 'upper', groupLabel: 'Final', format: 'BO3',
          team1Id: null, team2Id: null, status: 'pending',
        },
      });
      matches.push(final_);

      matchNumber++;
      const thirdPlace = await db.match.create({
        data: {
          tournamentId: id, round: 3, matchNumber, bracket: 'lower', groupLabel: '3rd', format: 'BO3',
          team1Id: null, team2Id: null, status: 'pending',
        },
      });
      matches.push(thirdPlace);
    } else if (numGroups === 2) {
      // 2 groups: standard A1vB2, B1vA2
      matchNumber++;
      const sf1 = await db.match.create({
        data: {
          tournamentId: id, round: 2, matchNumber, bracket: 'upper', groupLabel: 'SF1', format: 'BO3',
          team1Id: null, team2Id: null, status: 'pending',
        },
      });
      matches.push(sf1);

      matchNumber++;
      const sf2 = await db.match.create({
        data: {
          tournamentId: id, round: 2, matchNumber, bracket: 'upper', groupLabel: 'SF2', format: 'BO3',
          team1Id: null, team2Id: null, status: 'pending',
        },
      });
      matches.push(sf2);

      matchNumber++;
      const final_ = await db.match.create({
        data: {
          tournamentId: id, round: 3, matchNumber, bracket: 'upper', groupLabel: 'Final', format: 'BO3',
          team1Id: null, team2Id: null, status: 'pending',
        },
      });
      matches.push(final_);

      matchNumber++;
      const thirdPlace = await db.match.create({
        data: {
          tournamentId: id, round: 3, matchNumber, bracket: 'lower', groupLabel: '3rd', format: 'BO3',
          team1Id: null, team2Id: null, status: 'pending',
        },
      });
      matches.push(thirdPlace);
    } else if (numGroups === 3) {
      // 3 groups: Top of each group + best 2nd place advance to semi-finals
      // SF1: A1 vs Best2nd, SF2: B1 vs C1
      // Then Final + 3rd Place
      matchNumber++;
      const sf1 = await db.match.create({
        data: {
          tournamentId: id, round: 2, matchNumber, bracket: 'upper', groupLabel: 'SF1', format: 'BO3',
          team1Id: null, team2Id: null, status: 'pending',
        },
      });
      matches.push(sf1);

      matchNumber++;
      const sf2 = await db.match.create({
        data: {
          tournamentId: id, round: 2, matchNumber, bracket: 'upper', groupLabel: 'SF2', format: 'BO3',
          team1Id: null, team2Id: null, status: 'pending',
        },
      });
      matches.push(sf2);

      matchNumber++;
      const final_ = await db.match.create({
        data: {
          tournamentId: id, round: 3, matchNumber, bracket: 'upper', groupLabel: 'Final', format: 'BO3',
          team1Id: null, team2Id: null, status: 'pending',
        },
      });
      matches.push(final_);

      matchNumber++;
      const thirdPlace = await db.match.create({
        data: {
          tournamentId: id, round: 3, matchNumber, bracket: 'lower', groupLabel: '3rd', format: 'BO3',
          team1Id: null, team2Id: null, status: 'pending',
        },
      });
      matches.push(thirdPlace);
    } else if (numGroups === 4) {
      // 4 groups: Quarter-finals with cross-bracket
      // QF1: A1 vs D2, QF2: B1 vs C2, QF3: C1 vs B2, QF4: D1 vs A2
      // SF1: QF1 winner vs QF2 winner, SF2: QF3 winner vs QF4 winner
      // Final + 3rd Place
      matchNumber++;
      const qf1 = await db.match.create({
        data: {
          tournamentId: id, round: 2, matchNumber, bracket: 'upper', groupLabel: 'QF1', format: 'BO3',
          team1Id: null, team2Id: null, status: 'pending',
        },
      });
      matches.push(qf1);

      matchNumber++;
      const qf2 = await db.match.create({
        data: {
          tournamentId: id, round: 2, matchNumber, bracket: 'upper', groupLabel: 'QF2', format: 'BO3',
          team1Id: null, team2Id: null, status: 'pending',
        },
      });
      matches.push(qf2);

      matchNumber++;
      const qf3 = await db.match.create({
        data: {
          tournamentId: id, round: 2, matchNumber, bracket: 'upper', groupLabel: 'QF3', format: 'BO3',
          team1Id: null, team2Id: null, status: 'pending',
        },
      });
      matches.push(qf3);

      matchNumber++;
      const qf4 = await db.match.create({
        data: {
          tournamentId: id, round: 2, matchNumber, bracket: 'upper', groupLabel: 'QF4', format: 'BO3',
          team1Id: null, team2Id: null, status: 'pending',
        },
      });
      matches.push(qf4);

      matchNumber++;
      const sf1 = await db.match.create({
        data: {
          tournamentId: id, round: 3, matchNumber, bracket: 'upper', groupLabel: 'SF1', format: 'BO3',
          team1Id: null, team2Id: null, status: 'pending',
        },
      });
      matches.push(sf1);

      matchNumber++;
      const sf2 = await db.match.create({
        data: {
          tournamentId: id, round: 3, matchNumber, bracket: 'upper', groupLabel: 'SF2', format: 'BO3',
          team1Id: null, team2Id: null, status: 'pending',
        },
      });
      matches.push(sf2);

      matchNumber++;
      const final_ = await db.match.create({
        data: {
          tournamentId: id, round: 4, matchNumber, bracket: 'upper', groupLabel: 'Final', format: 'BO3',
          team1Id: null, team2Id: null, status: 'pending',
        },
      });
      matches.push(final_);

      matchNumber++;
      const thirdPlace = await db.match.create({
        data: {
          tournamentId: id, round: 4, matchNumber, bracket: 'lower', groupLabel: '3rd', format: 'BO3',
          team1Id: null, team2Id: null, status: 'pending',
        },
      });
      matches.push(thirdPlace);
    } else {
      // 5+ groups: Top of each group + best 2nd places advance
      // Calculate playoff size: next power of 2 from numGroups
      const playoffTeams = nextPowerOf2(numGroups);
      const playoffRounds = Math.ceil(Math.log2(playoffTeams));
      const wildcardsNeeded = playoffTeams - numGroups; // number of best 2nd places

      // Create playoff rounds
      let playoffMatchNumber = matchNumber;
      for (let round = 2; round <= 1 + playoffRounds; round++) {
        const matchesInRound = Math.floor(playoffTeams / Math.pow(2, round - 1));
        for (let i = 1; i <= matchesInRound; i++) {
          playoffMatchNumber++;
          const isLastRound = round === 1 + playoffRounds;
          const label = round === 2 ? `R${round}-${i}` :
            isLastRound && i === 1 ? 'Final' :
            isLastRound && i === 2 ? '3rd' :
            `R${round}-${i}`;

          const matchBracket = (isLastRound && i === 2) ? 'lower' : 'upper';
          const matchFormatOverride = (isLastRound || round === 1 + playoffRounds - 1) ? 'BO3' : 'BO3';

          const match = await db.match.create({
            data: {
              tournamentId: id, round, matchNumber: playoffMatchNumber,
              bracket: matchBracket, groupLabel: label,
              format: matchFormatOverride,
              team1Id: null, team2Id: null, status: 'pending',
            },
          });
          matches.push(match);
        }
      }
      matchNumber = playoffMatchNumber;
    }
  }

  await db.tournament.update({ where: { id }, data: { status: 'bracket_generation' } });

  return NextResponse.json({ matches, teamCount, format });
}
