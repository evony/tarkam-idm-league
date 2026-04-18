import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const division = req.nextUrl.searchParams.get('division') || 'male';

    // Check if data exists
    const playerCount = await db.player.count({ where: { division, isActive: true } });
    if (playerCount === 0) {
      return NextResponse.json({ hasData: false, division });
    }

    // Get current active season
    const season = await db.season.findFirst({
      where: { division, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });

    if (!season) {
      return NextResponse.json({ hasData: false, division });
    }

    // Active tournament
    const activeTournament = await db.tournament.findFirst({
      where: { division, seasonId: season.id, status: { in: ['registration', 'approval', 'team_generation', 'bracket_generation', 'main_event'] } },
      orderBy: { weekNumber: 'desc' },
      include: {
        teams: { include: { teamPlayers: { include: { player: { select: { id: true, name: true, gamertag: true, tier: true, points: true } } } } } },
        matches: { include: { team1: { select: { id: true, name: true } }, team2: { select: { id: true, name: true } }, mvpPlayer: { select: { id: true, name: true, gamertag: true } } }, orderBy: [{ round: 'asc' }, { matchNumber: 'asc' }] },
        donations: { where: { status: 'approved' } },
      },
    });

    // Total prize pool
    const prizePoolResult = await db.tournament.aggregate({ _sum: { prizePool: true }, where: { division, seasonId: season.id } });
    const totalPrizePool = prizePoolResult._sum.prizePool || 0;

    // Season donation total
    const donationResult = await db.donation.aggregate({ _sum: { amount: true }, where: { seasonId: season.id, status: 'approved' } });
    const seasonDonationTotal = donationResult._sum.amount || 0;

    // Top players
    const topPlayers = await db.player.findMany({
      where: { division, isActive: true },
      orderBy: { points: 'desc' },
      take: 10,
      include: { clubMembers: { include: { club: { select: { name: true } } } } },
    });

    // Recent league matches
    const recentMatches = await db.leagueMatch.findMany({
      where: { division, seasonId: season.id, status: 'completed' },
      orderBy: { completedAt: 'desc' },
      take: 5,
      include: { homeClub: { select: { name: true, logo: true } }, awayClub: { select: { name: true, logo: true } } },
    });

    // Upcoming matches
    const upcomingMatches = await db.leagueMatch.findMany({
      where: { division, seasonId: season.id, status: 'scheduled' },
      orderBy: { weekNumber: 'asc' },
      take: 5,
      include: { homeClub: { select: { name: true, logo: true } }, awayClub: { select: { name: true, logo: true } } },
    });

    // Season progress
    const SEASON_TOTAL_WEEKS = 10;
    const completedTournaments = await db.tournament.count({ where: { division, seasonId: season.id, status: 'completed' } });

    // Top donors
    const allDonations = await db.donation.findMany({ where: { seasonId: season.id, status: 'approved' } });
    const donorMap = new Map<string, { donorName: string; totalAmount: number; donationCount: number }>();
    for (const d of allDonations) {
      const existing = donorMap.get(d.donorName) || { donorName: d.donorName, totalAmount: 0, donationCount: 0 };
      existing.totalAmount += d.amount;
      existing.donationCount += 1;
      donorMap.set(d.donorName, existing);
    }
    const topDonors = Array.from(donorMap.values()).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 5);

    // Clubs
    const clubs = await db.club.findMany({
      where: { division, seasonId: season.id },
      orderBy: [{ points: 'desc' }, { wins: 'desc' }, { gameDiff: 'desc' }],
      include: { _count: { select: { members: true } } },
    });

    // Weekly champions
    const completedTourns = await db.tournament.findMany({
      where: { division, seasonId: season.id, status: 'completed' },
      orderBy: { weekNumber: 'asc' },
      include: {
        teams: { where: { isWinner: true }, include: { teamPlayers: { include: { player: { select: { id: true, gamertag: true, avatar: true, tier: true, points: true, totalWins: true, totalMvp: true, streak: true, matches: true } } } } } },
        matches: { where: { mvpPlayerId: { not: null } }, include: { mvpPlayer: { select: { id: true, gamertag: true, avatar: true, tier: true, totalMvp: true, points: true } } }, take: 1 },
      },
    });

    const weeklyChampions = completedTourns.map(t => ({
      weekNumber: t.weekNumber,
      tournamentName: t.name,
      prizePool: t.prizePool,
      completedAt: t.completedAt?.toISOString() || null,
      winnerTeam: t.teams.length > 0 ? { name: t.teams[0].name, players: t.teams[0].teamPlayers.map(tp => tp.player) } : null,
      mvp: t.matches.length > 0 && t.matches[0].mvpPlayer ? t.matches[0].mvpPlayer : null,
    }));

    // MVP Hall of Fame
    const mvpMatches = await db.match.findMany({
      where: { mvpPlayerId: { not: null }, tournament: { division, seasonId: season.id } },
      include: { mvpPlayer: { select: { id: true, gamertag: true, avatar: true, tier: true, totalMvp: true, points: true, totalWins: true, streak: true } }, tournament: { select: { weekNumber: true, name: true } } },
    });

    const mvpHallOfFame = mvpMatches.map(m => ({
      id: m.mvpPlayer!.id,
      gamertag: m.mvpPlayer!.gamertag,
      avatar: m.mvpPlayer!.avatar,
      tier: m.mvpPlayer!.tier,
      totalMvp: m.mvpPlayer!.totalMvp,
      points: m.mvpPlayer!.points,
      totalWins: m.mvpPlayer!.totalWins,
      streak: m.mvpPlayer!.streak,
      weekNumber: m.tournament.weekNumber,
      tournamentName: m.tournament.name,
      division,
    }));

    // All tournaments summary
    const tournaments = await db.tournament.findMany({
      where: { division, seasonId: season.id },
      orderBy: { weekNumber: 'asc' },
      select: { id: true, name: true, weekNumber: true, status: true, prizePool: true },
    });

    const data = {
      hasData: true,
      division,
      season: { id: season.id, name: season.name, number: season.number, status: season.status },
      activeTournament: activeTournament ? {
        id: activeTournament.id,
        name: activeTournament.name,
        weekNumber: activeTournament.weekNumber,
        status: activeTournament.status,
        prizePool: activeTournament.prizePool,
        bpm: activeTournament.bpm,
        location: activeTournament.location,
        scheduledAt: activeTournament.scheduledAt?.toISOString() || null,
        defaultMatchFormat: activeTournament.defaultMatchFormat,
        format: activeTournament.format,
        teams: activeTournament.teams.map(t => ({
          id: t.id, name: t.name, isWinner: t.isWinner, power: t.power,
          teamPlayers: t.teamPlayers.map(tp => ({ player: tp.player })),
        })),
        matches: activeTournament.matches.map(m => ({
          id: m.id, score1: m.score1, score2: m.score2, status: m.status, round: m.round, matchNumber: m.matchNumber, bracket: m.bracket,
          team1: m.team1 ? { id: m.team1.id, name: m.team1.name } : null,
          team2: m.team2 ? { id: m.team2.id, name: m.team2.name } : null,
          mvpPlayer: m.mvpPlayer,
        })),
        donations: activeTournament.donations.map(d => ({ id: d.id, donorName: d.donorName, amount: d.amount, message: d.message })),
      } : null,
      totalPlayers: playerCount,
      totalPrizePool,
      seasonDonationTotal,
      topPlayers: topPlayers.map(p => ({
        id: p.id, name: p.name, gamertag: p.gamertag, avatar: p.avatar, tier: p.tier, points: p.points,
        totalWins: p.totalWins, streak: p.streak, maxStreak: p.maxStreak, totalMvp: p.totalMvp, matches: p.matches,
        club: p.clubMembers.length > 0 ? p.clubMembers[0].club.name : undefined, division: p.division,
      })),
      recentMatches: recentMatches.map(m => ({
        id: m.id, score1: m.homeScore || 0, score2: m.awayScore || 0,
        club1: { name: m.homeClub.name, logo: m.homeClub.logo }, club2: { name: m.awayClub.name, logo: m.awayClub.logo }, week: m.weekNumber,
      })),
      upcomingMatches: upcomingMatches.map(m => ({
        id: m.id, club1: { name: m.homeClub.name, logo: m.homeClub.logo }, club2: { name: m.awayClub.name, logo: m.awayClub.logo }, week: m.weekNumber,
      })),
      seasonProgress: { totalWeeks: SEASON_TOTAL_WEEKS, completedWeeks: completedTournaments, percentage: Math.round((completedTournaments / SEASON_TOTAL_WEEKS) * 100) },
      topDonors,
      clubs: clubs.map(c => ({ id: c.id, name: c.name, logo: c.logo, wins: c.wins, losses: c.losses, draws: c.draws, points: c.points, gameDiff: c.gameDiff, _count: c._count })),
      weeklyChampions,
      mvpHallOfFame,
      tournaments,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ hasData: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
