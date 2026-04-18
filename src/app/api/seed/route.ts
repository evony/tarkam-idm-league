import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';

const maleNames = [
  'Rizky Pratama', 'Ahmad Fauzi', 'Budi Santoso', 'Dimas Arya', 'Eko Prasetyo',
  'Fajar Nugroho', 'Gilang Ramadhan', 'Hendra Wijaya', 'Irfan Hakim', 'Joko Susilo',
  'Kemal Farhan', 'Lukman Hakim', 'Maulana Rizki', 'Naufal Aziz', 'Omar Hadi',
  'Putra Mahardika', 'Qori Ananda', 'Rafi Alamsyah', 'Surya Pratama', 'Taufik Hidayat',
  'Umar Fadhil', 'Vino Ardiansyah', 'Wisnu Wardana', 'Yoga Pratama', 'Zainul Arifin',
  'Arif Rahman', 'Bagus Setiawan', 'Cahya Wibowo', 'Denny Saputra', 'Erik Kurniawan',
];

const femaleNames = [
  'Aisyah Putri', 'Bella Safitri', 'Citra Dewi', 'Dina Lestari', 'Elsa Rahmawati',
  'Fitri Handayani', 'Gita Permata', 'Hana Kusuma', 'Indah Sari', 'Jasmine Aulia',
  'Kartika Sari', 'Laras Wulandari', 'Maya Anggraini', 'Nadia Fitriani', 'Oktavia Putri',
  'Putri Amelia', 'Queen Azzahra', 'Rani Maulida', 'Sinta Dewi', 'Tika Permata',
  'Umi Kalsum', 'Vera Nirmala', 'Winda Sari', 'Xena Putri', 'Yuni Astuti',
  'Zahra Aulia', 'Amira Putri', 'Bunga Lestari', 'Dewi Safitri', 'Eka Rahayu',
];

const clubNames = {
  male: ['Kenshi Squad', 'Shadow Dancers', 'Neon Breakers', 'Flame Crew'],
  female: ['Crystal Steps', 'Luna Dancers', 'Velvet Queens', 'Stardust Crew'],
};

const tierPool = ['S', 'A', 'A', 'B', 'B', 'B', 'B', 'B'];

function generateGamertag(name: string) {
  const parts = name.split(' ');
  const prefixes = ['xX', 'Dark', 'Neo', 'Shadow', 'Star', 'DJ', 'MC', 'Ice', 'Fire', 'Storm'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix}${parts[0]}${Math.floor(Math.random() * 99)}`;
}

export async function POST() {
  try {
    // Check if already seeded
    const existingPlayers = await db.player.count();
    if (existingPlayers > 0) {
      return NextResponse.json({ message: 'Database already seeded', count: existingPlayers });
    }

    // Create admin user
    const hashedPassword = await bcryptjs.hash('admin123', 10);
    await db.adminUser.create({
      data: { username: 'admin', password: hashedPassword, role: 'superadmin' },
    });

    // Create seasons
    const maleSeason1 = await db.season.create({
      data: { name: 'Season 1', number: 1, division: 'male', status: 'completed', startDate: new Date('2024-01-01'), endDate: new Date('2024-03-31') },
    });
    const maleSeason2 = await db.season.create({
      data: { name: 'Season 2', number: 2, division: 'male', status: 'active', startDate: new Date('2024-04-01') },
    });
    const femaleSeason1 = await db.season.create({
      data: { name: 'Season 1', number: 1, division: 'female', status: 'completed', startDate: new Date('2024-01-01'), endDate: new Date('2024-03-31') },
    });
    const femaleSeason2 = await db.season.create({
      data: { name: 'Season 2', number: 2, division: 'female', status: 'active', startDate: new Date('2024-04-01') },
    });

    // Create players
    const malePlayers = [];
    for (let i = 0; i < maleNames.length; i++) {
      const tier = tierPool[i % tierPool.length];
      const points = tier === 'S' ? 40 + Math.floor(Math.random() * 20) : tier === 'A' ? 15 + Math.floor(Math.random() * 20) : Math.floor(Math.random() * 15);
      const totalWins = tier === 'S' ? 5 + Math.floor(Math.random() * 5) : tier === 'A' ? 2 + Math.floor(Math.random() * 4) : Math.floor(Math.random() * 3);
      const player = await db.player.create({
        data: {
          name: maleNames[i],
          gamertag: generateGamertag(maleNames[i]),
          division: 'male',
          tier,
          points,
          totalWins,
          totalMvp: Math.floor(Math.random() * (tier === 'S' ? 5 : 3)),
          streak: Math.floor(Math.random() * 5),
          maxStreak: 2 + Math.floor(Math.random() * 5),
          matches: 5 + Math.floor(Math.random() * 10),
          city: ['Pontianak', 'Jakarta', 'Surabaya', 'Bandung', 'Semarang'][Math.floor(Math.random() * 5)],
          registrationStatus: 'approved',
        },
      });
      malePlayers.push(player);
    }

    const femalePlayers = [];
    for (let i = 0; i < femaleNames.length; i++) {
      const tier = tierPool[i % tierPool.length];
      const points = tier === 'S' ? 40 + Math.floor(Math.random() * 20) : tier === 'A' ? 15 + Math.floor(Math.random() * 20) : Math.floor(Math.random() * 15);
      const totalWins = tier === 'S' ? 5 + Math.floor(Math.random() * 5) : tier === 'A' ? 2 + Math.floor(Math.random() * 4) : Math.floor(Math.random() * 3);
      const player = await db.player.create({
        data: {
          name: femaleNames[i],
          gamertag: generateGamertag(femaleNames[i]),
          division: 'female',
          tier,
          points,
          totalWins,
          totalMvp: Math.floor(Math.random() * (tier === 'S' ? 5 : 3)),
          streak: Math.floor(Math.random() * 5),
          maxStreak: 2 + Math.floor(Math.random() * 5),
          matches: 5 + Math.floor(Math.random() * 10),
          city: ['Pontianak', 'Jakarta', 'Surabaya', 'Bandung', 'Semarang'][Math.floor(Math.random() * 5)],
          registrationStatus: 'approved',
        },
      });
      femalePlayers.push(player);
    }

    // Create clubs and assign members
    const clubsData: { id: string; name: string; division: string }[] = [];
    for (const division of ['male', 'female'] as const) {
      const season = division === 'male' ? maleSeason2 : femaleSeason2;
      const players = division === 'male' ? malePlayers : femalePlayers;
      const cNames = clubNames[division];

      for (let c = 0; c < cNames.length; c++) {
        const wins = Math.floor(Math.random() * 6);
        const losses = Math.floor(Math.random() * 4);
        const points = wins * 3 + Math.floor(Math.random() * 2);
        const club = await db.club.create({
          data: {
            name: cNames[c], division, seasonId: season.id,
            wins, losses, points, gameDiff: wins - losses,
          },
        });
        clubsData.push({ id: club.id, name: club.name, division });

        // Assign ~7 players per club
        const clubPlayers = players.slice(c * 7, (c + 1) * 7);
        for (let p = 0; p < clubPlayers.length; p++) {
          await db.clubMember.create({
            data: { clubId: club.id, playerId: clubPlayers[p].id, role: p === 0 ? 'captain' : 'member' },
          });
        }
      }
    }

    // Create league matches for current season
    for (const division of ['male', 'female'] as const) {
      const season = division === 'male' ? maleSeason2 : femaleSeason2;
      const divClubs = clubsData.filter(c => c.division === division);

      for (let week = 1; week <= 10; week++) {
        for (let i = 0; i < divClubs.length; i++) {
          for (let j = i + 1; j < divClubs.length; j++) {
            const isCompleted = week <= 4;
            const homeScore = isCompleted ? Math.floor(Math.random() * 5) : null;
            const awayScore = isCompleted ? Math.floor(Math.random() * 5) : null;
            await db.leagueMatch.create({
              data: {
                seasonId: season.id, weekNumber: week, division,
                homeClubId: divClubs[i].id, awayClubId: divClubs[j].id,
                homeScore, awayScore,
                status: isCompleted ? 'completed' : 'scheduled',
                completedAt: isCompleted ? new Date(2024, 3 + Math.floor(week / 5), week * 7) : null,
                scheduledAt: new Date(2024, 3 + Math.floor(week / 5), week * 7),
              },
            });
          }
        }
      }
    }

    // Create tournaments with teams and matches
    for (const division of ['male', 'female'] as const) {
      const season = division === 'male' ? maleSeason2 : femaleSeason2;
      const players = division === 'male' ? malePlayers : femalePlayers;

      for (let week = 1; week <= 5; week++) {
        const isCompleted = week <= 3;
        const tournament = await db.tournament.create({
          data: {
            name: `Week ${week} Tournament`,
            weekNumber: week, division, seasonId: season.id,
            status: isCompleted ? 'completed' : (week === 4 ? 'main_event' : 'registration'),
            prizePool: 50000 + Math.floor(Math.random() * 50000),
            bpm: 120 + Math.floor(Math.random() * 40),
            location: 'Pontianak',
            defaultMatchFormat: week <= 2 ? 'BO1' : 'BO3',
            format: 'single_elimination',
            completedAt: isCompleted ? new Date(2024, 3, week * 7) : null,
          },
        });

        // Create 8 teams for the tournament
        const shuffled = [...players].sort(() => Math.random() - 0.5);
        const teamsPerTournament = 8;
        const playersPerTeam = 3;
        const teams = [];

        for (let t = 0; t < teamsPerTournament; t++) {
          const teamPlayers = shuffled.slice(t * playersPerTeam, (t + 1) * playersPerTeam);
          const team = await db.team.create({
            data: {
              name: `Team ${String.fromCharCode(65 + t)}`,
              tournamentId: tournament.id,
              power: teamPlayers.reduce((sum, p) => sum + p.points, 0),
              isWinner: isCompleted && t === 0,
              rank: isCompleted ? t + 1 : null,
            },
          });
          teams.push(team);

          for (const p of teamPlayers) {
            await db.teamPlayer.create({ data: { teamId: team.id, playerId: p.id } });
          }
        }

        // Create bracket matches
        const rounds = Math.log2(teamsPerTournament); // 3 rounds
        for (let round = 1; round <= rounds; round++) {
          const matchesInRound = teamsPerTournament / Math.pow(2, round);
          for (let m = 0; m < matchesInRound; m++) {
            const isMatchCompleted = isCompleted && round <= 2;
            const team1Idx = round === 1 ? m * 2 : m;
            const team2Idx = round === 1 ? m * 2 + 1 : m + matchesInRound;

            await db.match.create({
              data: {
                tournamentId: tournament.id,
                round,
                matchNumber: m + 1,
                bracket: 'upper',
                format: tournament.defaultMatchFormat,
                team1Id: teams[team1Idx]?.id || null,
                team2Id: teams[team2Idx]?.id || null,
                score1: isMatchCompleted ? Math.floor(Math.random() * 3) : null,
                score2: isMatchCompleted ? Math.floor(Math.random() * 3) : null,
                status: isMatchCompleted ? 'completed' : (round === 1 && isCompleted ? 'ready' : 'pending'),
                winnerId: isMatchCompleted ? teams[team1Idx]?.id : null,
                mvpPlayerId: isMatchCompleted && round === 2 ? shuffled[Math.floor(Math.random() * shuffled.length)].id : null,
                completedAt: isMatchCompleted ? new Date(2024, 3, week * 7) : null,
              },
            });
          }
        }

        // Add participations
        for (const p of shuffled.slice(0, 24)) {
          await db.participation.create({
            data: {
              playerId: p.id,
              tournamentId: tournament.id,
              status: 'approved',
              isWinner: isCompleted && p.id === shuffled[0].id,
              isMvp: isCompleted && Math.random() > 0.8,
              pointsEarned: isCompleted ? Math.floor(Math.random() * 5) : 0,
            },
          });
        }

        // Add some donations
        const donorNames = ['Sawer Bot', 'IDM Fan', 'Dance Lover', 'Borneo Pride', 'Supporter'];
        for (let d = 0; d < 3; d++) {
          await db.donation.create({
            data: {
              donorName: donorNames[Math.floor(Math.random() * donorNames.length)],
              amount: 10000 + Math.floor(Math.random() * 50000),
              message: 'Good luck!',
              type: 'weekly',
              status: 'approved',
              tournamentId: tournament.id,
              seasonId: season.id,
            },
          });
        }
      }
    }

    // Create some achievements
    const achievementDefs = [
      { name: 'first_win', displayName: 'First Victory', description: 'Win your first tournament', icon: '🏆', tier: 'bronze', criteria: JSON.stringify({ type: 'wins', count: 1 }), rewardPoints: 2 },
      { name: 'hat_trick', displayName: 'Hat Trick', description: 'Win 3 tournaments in a row', icon: '🎩', tier: 'gold', criteria: JSON.stringify({ type: 'wins', count: 3, consecutive: true }), rewardPoints: 10 },
      { name: 'mvp_king', displayName: 'MVP King', description: 'Earn 5 MVP awards', icon: '👑', tier: 'platinum', criteria: JSON.stringify({ type: 'mvp', count: 5 }), rewardPoints: 15 },
      { name: 'iron_will', displayName: 'Iron Will', description: 'Participate in 10 tournaments', icon: '⚔️', tier: 'silver', criteria: JSON.stringify({ type: 'participations', count: 10 }), rewardPoints: 5 },
      { name: 'streak_master', displayName: 'Streak Master', description: 'Achieve a 5 win streak', icon: '🔥', tier: 'gold', criteria: JSON.stringify({ type: 'streak', threshold: 5 }), rewardPoints: 8 },
    ];

    for (const a of achievementDefs) {
      await db.achievement.create({ data: a });
    }

    // Create some sponsors
    const sponsorDefs = [
      { name: 'IDM Official', website: 'https://idm-league.com' },
      { name: 'Borneo Gaming', website: 'https://borneo-gaming.com' },
      { name: 'Dance Energy Drink', website: 'https://dance-energy.com' },
    ];
    for (const s of sponsorDefs) {
      await db.sponsor.create({ data: s });
    }

    // Set season 1 champion
    const firstMaleClub = clubsData.find(c => c.division === 'male');
    if (firstMaleClub) {
      await db.season.update({ where: { id: maleSeason1.id }, data: { championClubId: firstMaleClub.id, status: 'completed' } });
    }
    const firstFemaleClub = clubsData.find(c => c.division === 'female');
    if (firstFemaleClub) {
      await db.season.update({ where: { id: femaleSeason1.id }, data: { championClubId: firstFemaleClub.id, status: 'completed' } });
    }

    // CMS defaults
    const cmsDefaults = [
      { key: 'site_title', value: 'IDM League' },
      { key: 'hero_title', value: 'Idol Meta' },
      { key: 'hero_subtitle', value: 'Fan Made Edition' },
      { key: 'hero_tagline', value: 'Tempat dancer terbaik berkompetisi. Tournament mingguan, liga profesional, dan podium yang menunggu.' },
      { key: 'footer_text', value: '© 2025 IDM League — Idol Meta Fan Made Edition. All rights reserved.' },
      { key: 'footer_tagline', value: 'Dance. Compete. Dominate.' },
    ];
    for (const c of cmsDefaults) {
      await db.cmsSetting.create({ data: c });
    }

    return NextResponse.json({
      message: 'Database seeded successfully',
      stats: {
        players: malePlayers.length + femalePlayers.length,
        clubs: clubsData.length,
        seasons: 4,
        tournaments: 10,
        achievements: achievementDefs.length,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database', details: String(error) }, { status: 500 });
  }
}
