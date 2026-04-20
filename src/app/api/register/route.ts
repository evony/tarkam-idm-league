import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Helper to calculate Levenshtein distance for typo detection
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Check if names are too similar
function areNamesSimilar(name1: string, name2: string): boolean {
  const n1 = name1.toLowerCase().trim();
  const n2 = name2.toLowerCase().trim();

  if (n1 === n2) return true;

  if (n1.includes(n2) || n2.includes(n1)) {
    const lengthDiff = Math.abs(n1.length - n2.length);
    if (lengthDiff <= 2) return true;
  }

  const distance = levenshteinDistance(n1, n2);
  const maxLen = Math.max(n1.length, n2.length);
  const similarityRatio = 1 - distance / maxLen;

  if (similarityRatio >= 0.8 && maxLen >= 3) return true;

  return false;
}

function normalizePhone(phone: string | null): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

function normalizeCity(city: string): string {
  return city.toLowerCase().trim();
}

interface DuplicateCheck {
  isBlocked: boolean;
  isHighRisk: boolean;
  canReRegister: boolean;       // True for both approved+active (daftar ulang turnamen) and rejected/inactive (daftar ulang penuh)
  isApprovedPlayer: boolean;    // True if the matching player is approved+active (just create participation, don't reset)
  alreadyInTournament: boolean; // True if already has participation in active tournament
  reRegisterPlayerId: string | null;
  similarPlayers: Array<{
    id: string;
    name: string;
    gamertag: string;
    division: string;
    city: string;
    phone: string | null;
    registrationStatus: string;
    isActive: boolean;
    matchType: 'exact_name' | 'similar_name' | 'phone_match';
    matchDetails: {
      nameMatch: boolean;
      cityMatch: boolean;
      phoneMatch: boolean;
      nameDifferent: boolean;
    };
  }>;
  message: string;
}

function checkDuplicates(
  name: string,
  city: string,
  phone: string | null,
  division: string,
  existingPlayers: Array<{ id: string; name: string; gamertag: string; division: string; city: string; phone: string | null; registrationStatus: string; isActive: boolean }>,
  activeTournamentParticipations: Array<{ playerId: string; tournamentId: string; status: string }> = []
): DuplicateCheck {
  const normalizedName = name.toLowerCase().trim();
  const normalizedCity = normalizeCity(city);
  const normalizedPhone = normalizePhone(phone);

  const similarPlayers: DuplicateCheck['similarPlayers'] = [];

  // ====== PASS 1: Check name-based duplicates ======
  for (const player of existingPlayers) {
    const playerNameLower = player.name.toLowerCase().trim();
    const playerCityLower = normalizeCity(player.city);
    const playerPhoneNorm = normalizePhone(player.phone);

    const nameMatch = playerNameLower === normalizedName;
    const nameSimilar = areNamesSimilar(name, player.name);

    if (!nameMatch && !nameSimilar) continue;

    const cityMatch = playerCityLower === normalizedCity;
    const phoneMatch = normalizedPhone && playerPhoneNorm && playerPhoneNorm.length >= 8 && normalizedPhone.length >= 8 && (
      normalizedPhone === playerPhoneNorm ||
      normalizedPhone.endsWith(playerPhoneNorm.slice(-8)) ||
      playerPhoneNorm.endsWith(normalizedPhone.slice(-8))
    );

    const matchType = nameMatch ? 'exact_name' : 'similar_name';

    similarPlayers.push({
      id: player.id,
      name: player.name,
      gamertag: player.gamertag,
      division: player.division,
      city: player.city,
      phone: player.phone,
      registrationStatus: player.registrationStatus,
      isActive: player.isActive,
      matchType,
      matchDetails: {
        nameMatch,
        cityMatch,
        phoneMatch,
        nameDifferent: false,
      },
    });
  }

  // ====== PASS 2: Check phone-based duplicates ======
  if (normalizedPhone) {
    for (const player of existingPlayers) {
      const playerPhoneNorm = normalizePhone(player.phone);
      const playerCityLower = normalizeCity(player.city);

      if (!playerPhoneNorm) continue;

      const phoneMatch = normalizedPhone === playerPhoneNorm ||
        (playerPhoneNorm.length >= 8 && normalizedPhone.length >= 8 && (
          normalizedPhone.endsWith(playerPhoneNorm.slice(-8)) ||
          playerPhoneNorm.endsWith(normalizedPhone.slice(-8))
        ));

      if (!phoneMatch) continue;

      const alreadyAdded = similarPlayers.some(p => p.id === player.id);
      if (alreadyAdded) continue;

      const cityMatch = playerCityLower === normalizedCity;

      similarPlayers.push({
        id: player.id,
        name: player.name,
        gamertag: player.gamertag,
        division: player.division,
        city: player.city,
        phone: player.phone,
        registrationStatus: player.registrationStatus,
        isActive: player.isActive,
        matchType: 'phone_match',
        matchDetails: {
          nameMatch: false,
          cityMatch,
          phoneMatch: true,
          nameDifferent: true,
        },
      });
    }
  }

  // ====== Determine risk level and message ======

  const exactNamePlayer = similarPlayers.find(p => p.matchDetails.nameMatch);

  if (exactNamePlayer) {
    // Check if already registered in active tournament
    const existingParticipation = activeTournamentParticipations.find(
      p => p.playerId === exactNamePlayer.id
    );

    if (existingParticipation) {
      return {
        isBlocked: true,
        isHighRisk: true,
        canReRegister: false,
        isApprovedPlayer: false,
        alreadyInTournament: true,
        reRegisterPlayerId: null,
        similarPlayers: [exactNamePlayer],
        message: `Nama "${name}" sudah terdaftar di turnamen minggu ini (status: ${existingParticipation.status}). Tidak perlu mendaftar lagi.`,
      };
    }

    // Rejected or inactive — full re-registration (reset player data)
    if (exactNamePlayer.registrationStatus === 'rejected' || !exactNamePlayer.isActive) {
      return {
        isBlocked: false,
        isHighRisk: false,
        canReRegister: true,
        isApprovedPlayer: false,
        alreadyInTournament: false,
        reRegisterPlayerId: exactNamePlayer.id,
        similarPlayers: [exactNamePlayer],
        message: `Nama "${name}" sudah terdaftar sebelumnya tapi ditolak/nonaktif. Anda bisa mendaftar ulang untuk masuk antrian persetujuan admin.`,
      };
    }

    // Pending — already in queue, block
    if (exactNamePlayer.registrationStatus === 'pending') {
      return {
        isBlocked: true,
        isHighRisk: true,
        canReRegister: false,
        isApprovedPlayer: false,
        alreadyInTournament: false,
        reRegisterPlayerId: null,
        similarPlayers: [exactNamePlayer],
        message: `Pendaftaran diblokir! Nama "${name}" sudah dalam antrian persetujuan admin (gamertag: "${exactNamePlayer.gamertag}"). Silakan tunggu admin menyetujui pendaftaran Anda.`,
      };
    }

    // Approved and active — daftar ulang for tournament (just create participation, don't reset player)
    return {
      isBlocked: false,
      isHighRisk: false,
      canReRegister: true,
      isApprovedPlayer: true,
      alreadyInTournament: false,
      reRegisterPlayerId: exactNamePlayer.id,
      similarPlayers: [exactNamePlayer],
      message: `Nama "${name}" sudah terdaftar sebagai peserta aktif (gamertag: "${exactNamePlayer.gamertag}"). Klik "Daftar Ulang" untuk mendaftar di turnamen minggu ini.`,
    };
  }

  const phoneMatchPlayer = similarPlayers.find(p => p.matchDetails.phoneMatch);

  if (phoneMatchPlayer) {
    // Check if already registered in active tournament
    const existingParticipation = activeTournamentParticipations.find(
      p => p.playerId === phoneMatchPlayer.id
    );

    if (existingParticipation) {
      return {
        isBlocked: true,
        isHighRisk: true,
        canReRegister: false,
        isApprovedPlayer: false,
        alreadyInTournament: true,
        reRegisterPlayerId: null,
        similarPlayers: [phoneMatchPlayer],
        message: `Nomor WhatsApp ini sudah terdaftar di turnamen minggu ini atas nama "${phoneMatchPlayer.name}" (status: ${existingParticipation.status}).`,
      };
    }

    if (phoneMatchPlayer.registrationStatus === 'rejected' || !phoneMatchPlayer.isActive) {
      return {
        isBlocked: false,
        isHighRisk: false,
        canReRegister: true,
        isApprovedPlayer: false,
        alreadyInTournament: false,
        reRegisterPlayerId: phoneMatchPlayer.id,
        similarPlayers: [phoneMatchPlayer],
        message: `Nomor WhatsApp ini sudah terdaftar sebelumnya dengan nama "${phoneMatchPlayer.name}" tapi ditolak/nonaktif. Anda bisa mendaftar ulang.`,
      };
    }

    if (phoneMatchPlayer.registrationStatus === 'pending') {
      return {
        isBlocked: true,
        isHighRisk: true,
        canReRegister: false,
        isApprovedPlayer: false,
        alreadyInTournament: false,
        reRegisterPlayerId: null,
        similarPlayers: [phoneMatchPlayer],
        message: `Pendaftaran diblokir! Nomor WhatsApp ini sudah dalam antrian persetujuan admin atas nama "${phoneMatchPlayer.name}".`,
      };
    }

    // Approved and active — daftar ulang for tournament
    return {
      isBlocked: false,
      isHighRisk: false,
      canReRegister: true,
      isApprovedPlayer: true,
      alreadyInTournament: false,
      reRegisterPlayerId: phoneMatchPlayer.id,
      similarPlayers: [phoneMatchPlayer],
      message: `Nomor WhatsApp ini sudah terdaftar atas nama "${phoneMatchPlayer.name}" (gamertag: "${phoneMatchPlayer.gamertag}"). Klik "Daftar Ulang" untuk mendaftar di turnamen minggu ini.`,
    };
  }

  // Similar name only — warning
  if (similarPlayers.length > 0) {
    return {
      isBlocked: false,
      isHighRisk: false,
      canReRegister: false,
      isApprovedPlayer: false,
      alreadyInTournament: false,
      similarPlayers,
      message: `Terdapat nama yang mirip: ${similarPlayers.map(p => p.name).join(', ')}. Yakin nama ini berbeda?`,
    };
  }

  return {
    isBlocked: false,
    isHighRisk: false,
    canReRegister: false,
    isApprovedPlayer: false,
    alreadyInTournament: false,
    reRegisterPlayerId: null,
    similarPlayers: [],
    message: '',
  };
}

// Find the active tournament that's accepting registrations for a division
async function findActiveTournament(division: string) {
  // Find the latest season for this division
  const season = await db.season.findFirst({
    where: { division, status: 'active' },
    orderBy: { startDate: 'desc' },
  });

  if (!season) return null;

  // Find a tournament in registration or setup phase for this season
  const tournament = await db.tournament.findFirst({
    where: {
      seasonId: season.id,
      status: { in: ['setup', 'registration'] },
    },
    orderBy: { weekNumber: 'desc' },
  });

  return tournament;
}

// Find the latest tournament in the active season regardless of phase
// Used for checking if a player already has participation in ANY tournament
async function findLatestTournament(division: string) {
  const season = await db.season.findFirst({
    where: { division, status: 'active' },
    orderBy: { startDate: 'desc' },
  });

  if (!season) return null;

  const tournament = await db.tournament.findFirst({
    where: { seasonId: season.id },
    orderBy: { weekNumber: 'desc' },
  });

  return tournament;
}

// Helper to create participation for a player in an active tournament
async function createParticipationForTournament(playerId: string, division: string) {
  const activeTournament = await findActiveTournament(division);
  if (!activeTournament) return { tournament: null, participation: null, error: null };

  // Check if already registered in this tournament
  const existingParticipation = await db.participation.findUnique({
    where: { playerId_tournamentId: { playerId, tournamentId: activeTournament.id } },
  });

  if (existingParticipation) {
    return {
      tournament: activeTournament,
      participation: null,
      error: `Anda sudah terdaftar di ${activeTournament.name} (status: ${existingParticipation.status}).`,
    };
  }

  const participation = await db.participation.create({
    data: {
      playerId,
      tournamentId: activeTournament.id,
      status: 'registered',
      pointsEarned: 0,
    },
  });

  // Update tournament status from setup to registration if needed
  if (activeTournament.status === 'setup') {
    await db.tournament.update({
      where: { id: activeTournament.id },
      data: { status: 'registration' },
    });
  }

  return { tournament: activeTournament, participation, error: null };
}

// GET - Check for duplicate names (for real-time validation)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const city = searchParams.get('city');
  const phone = searchParams.get('phone');
  const division = searchParams.get('division');

  if (!name || !name.trim()) {
    return NextResponse.json({ exists: false, similar: [], isBlocked: false });
  }

  const allPlayers = await db.player.findMany({
    where: {
      ...(division && { division }),
    },
    select: {
      id: true,
      name: true,
      gamertag: true,
      division: true,
      city: true,
      phone: true,
      registrationStatus: true,
      isActive: true,
    },
  });

  // Also fetch tournament participations for same-tournament duplicate check
  let activeTournamentParticipations: Array<{ playerId: string; tournamentId: string; status: string }> = [];
  if (division) {
    // Check both active (accepting registration) and latest (any phase) tournaments
    const activeTournament = await findActiveTournament(division);
    const latestTournament = await findLatestTournament(division);
    const tournamentIds: string[] = [];
    if (activeTournament) tournamentIds.push(activeTournament.id);
    if (latestTournament && !tournamentIds.includes(latestTournament.id)) tournamentIds.push(latestTournament.id);
    if (tournamentIds.length > 0) {
      activeTournamentParticipations = await db.participation.findMany({
        where: { tournamentId: { in: tournamentIds } },
        select: { playerId: true, tournamentId: true, status: true },
      });
    }
  }

  const result = checkDuplicates(name, city || '', phone, division || '', allPlayers, activeTournamentParticipations);

  return NextResponse.json({
    exists: result.similarPlayers.length > 0,
    similar: result.similarPlayers,
    isBlocked: result.isBlocked,
    isHighRisk: result.isHighRisk,
    canReRegister: result.canReRegister,
    isApprovedPlayer: result.isApprovedPlayer,
    alreadyInTournament: result.alreadyInTournament,
    reRegisterPlayerId: result.reRegisterPlayerId,
    message: result.message,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, joki, phone, city, clubId, division, force, reRegister, reRegisterPlayerId, isApprovedPlayer } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama/Nick wajib diisi' }, { status: 400 });
    }
    if (!city || !city.trim()) {
      return NextResponse.json({ error: 'Kota wajib diisi' }, { status: 400 });
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: 'No. WhatsApp wajib diisi' }, { status: 400 });
    }
    if (!division || !['male', 'female'].includes(division)) {
      return NextResponse.json({ error: 'Division wajib dipilih (male/female)' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const trimmedCity = city.trim();
    const trimmedPhone = phone.trim();

    // ====== RE-REGISTRATION FLOW ======
    // Handles two cases:
    // 1. Approved+active player → isApprovedPlayer=true → just create participation (don't reset player)
    // 2. Rejected/inactive player → isApprovedPlayer=false → reset player data + create participation
    if (reRegister && reRegisterPlayerId) {
      const existingPlayer = await db.player.findUnique({
        where: { id: reRegisterPlayerId },
      });

      if (!existingPlayer) {
        return NextResponse.json({ error: 'Player tidak ditemukan' }, { status: 404 });
      }

      if (isApprovedPlayer) {
        // ====== APPROVED PLAYER: Daftar ulang turnamen ======
        // Just create participation, don't change player status
        if (existingPlayer.registrationStatus !== 'approved' || !existingPlayer.isActive) {
          return NextResponse.json({ error: 'Player belum disetujui. Hubungi admin.' }, { status: 400 });
        }

        const { tournament, participation, error } = await createParticipationForTournament(existingPlayer.id, division);

        if (error) {
          return NextResponse.json({ error }, { status: 400 });
        }

        if (!tournament || !participation) {
          return NextResponse.json({
            success: true,
            message: 'Data Anda sudah terverifikasi. Namun tidak ada turnamen yang sedang menerima pendaftaran saat ini.',
            player: {
              id: existingPlayer.id,
              name: existingPlayer.name,
              gamertag: existingPlayer.gamertag,
              division: existingPlayer.division,
              city: existingPlayer.city,
            },
            isReRegistration: true,
            isApprovedReRegister: true,
            tournament: null,
          }, { status: 200 });
        }

        return NextResponse.json({
          success: true,
          message: `Berhasil mendaftar di ${tournament.name}! Menunggu persetujuan admin untuk menentukan tier Anda.`,
          player: {
            id: existingPlayer.id,
            name: existingPlayer.name,
            gamertag: existingPlayer.gamertag,
            division: existingPlayer.division,
            city: existingPlayer.city,
          },
          isReRegistration: true,
          isApprovedReRegister: true,
          tournament: { id: tournament.id, name: tournament.name, weekNumber: tournament.weekNumber },
          participation: { id: participation.id, status: participation.status },
        }, { status: 200 });
      } else {
        // ====== REJECTED/INACTIVE PLAYER: Full re-registration ======
        // Reset player data + create participation
        if (clubId) {
          const club = await db.club.findUnique({ where: { id: clubId } });
          if (!club) {
            return NextResponse.json({ error: 'Club tidak ditemukan' }, { status: 400 });
          }
        }

        const updatedPlayer = await db.player.update({
          where: { id: reRegisterPlayerId },
          data: {
            name: trimmedName,
            city: trimmedCity,
            phone: trimmedPhone,
            joki: joki?.trim() || null,
            division,
            registrationStatus: 'pending',
            isActive: true,
            tier: 'B',
          },
        });

        // Also sign up for active tournament if exists
        const { tournament, participation, error } = await createParticipationForTournament(updatedPlayer.id, division);

        if (clubId) {
          const existingMembership = await db.clubMember.findFirst({
            where: { playerId: updatedPlayer.id },
          });
          if (existingMembership) {
            await db.clubMember.update({
              where: { id: existingMembership.id },
              data: { clubId },
            });
          } else {
            await db.clubMember.create({
              data: { clubId, playerId: updatedPlayer.id, role: 'member' },
            });
          }
        }

        const tournamentMsg = tournament
          ? ` Anda juga otomatis terdaftar di ${tournament.name}.`
          : '';

        if (error && tournament) {
          // Player was updated but already in tournament
          return NextResponse.json({
            success: true,
            message: `Pendaftaran ulang berhasil!${tournamentMsg} Menunggu persetujuan admin.`,
            player: {
              id: updatedPlayer.id,
              name: updatedPlayer.name,
              gamertag: updatedPlayer.gamertag,
              division: updatedPlayer.division,
              city: updatedPlayer.city,
              registrationStatus: updatedPlayer.registrationStatus,
            },
            isReRegistration: true,
            isApprovedReRegister: false,
            tournament: { id: tournament.id, name: tournament.name },
          }, { status: 200 });
        }

        return NextResponse.json({
          success: true,
          message: tournament
            ? `Pendaftaran ulang berhasil!${tournamentMsg} Menunggu persetujuan admin.`
            : 'Pendaftaran ulang berhasil! Menunggu persetujuan admin.',
          player: {
            id: updatedPlayer.id,
            name: updatedPlayer.name,
            gamertag: updatedPlayer.gamertag,
            division: updatedPlayer.division,
            city: updatedPlayer.city,
            registrationStatus: updatedPlayer.registrationStatus,
          },
          isReRegistration: true,
          isApprovedReRegister: false,
          tournament: tournament ? { id: tournament.id, name: tournament.name } : null,
        }, { status: 200 });
      }
    }

    // ====== NORMAL REGISTRATION FLOW ======
    const existingPlayers = await db.player.findMany({
      where: { division },
      select: {
        id: true, name: true, gamertag: true, division: true,
        city: true, phone: true, registrationStatus: true, isActive: true,
      },
    });

    // Also fetch tournament participations for same-tournament check
    let activeTournamentParticipations: Array<{ playerId: string; tournamentId: string; status: string }> = [];
    const preCheckActive = await findActiveTournament(division);
    const preCheckLatest = await findLatestTournament(division);
    const preCheckIds: string[] = [];
    if (preCheckActive) preCheckIds.push(preCheckActive.id);
    if (preCheckLatest && !preCheckIds.includes(preCheckLatest.id)) preCheckIds.push(preCheckLatest.id);
    if (preCheckIds.length > 0) {
      activeTournamentParticipations = await db.participation.findMany({
        where: { tournamentId: { in: preCheckIds } },
        select: { playerId: true, tournamentId: true, status: true },
      });
    }

    const duplicateCheck = checkDuplicates(trimmedName, trimmedCity, trimmedPhone, division, existingPlayers, activeTournamentParticipations);

    if (duplicateCheck.isBlocked) {
      return NextResponse.json({
        blocked: true,
        error: duplicateCheck.message,
        alreadyInTournament: duplicateCheck.alreadyInTournament,
        similarPlayers: duplicateCheck.similarPlayers,
      }, { status: 409 });
    }

    // If can re-register (approved player or rejected/inactive), return the option
    if (duplicateCheck.canReRegister) {
      return NextResponse.json({
        canReRegister: true,
        isApprovedPlayer: duplicateCheck.isApprovedPlayer,
        isHighRisk: duplicateCheck.isHighRisk,
        reRegisterPlayerId: duplicateCheck.reRegisterPlayerId,
        message: duplicateCheck.message,
        similarPlayers: duplicateCheck.similarPlayers,
      }, { status: 200 });
    }

    // If similar names exist and force is not set, return warning
    if (duplicateCheck.similarPlayers.length > 0 && !force) {
      return NextResponse.json({
        warning: true,
        isHighRisk: duplicateCheck.isHighRisk,
        message: duplicateCheck.message,
        similarPlayers: duplicateCheck.similarPlayers,
      }, { status: 200 });
    }

    // Generate unique gamertag from name
    const baseTag = trimmedName.replace(/\s+/g, '');
    let gamertag = baseTag;
    let counter = 1;

    while (true) {
      const existing = await db.player.findUnique({ where: { gamertag } });
      if (!existing) break;
      counter++;
      gamertag = `${baseTag}${counter}`;
    }

    if (clubId) {
      const club = await db.club.findUnique({ where: { id: clubId } });
      if (!club) {
        return NextResponse.json({ error: 'Club tidak ditemukan' }, { status: 400 });
      }
    }

    // Create player with pending registration status
    const player = await db.player.create({
      data: {
        name: trimmedName,
        gamertag,
        division,
        tier: 'B',
        city: trimmedCity,
        joki: joki?.trim() || null,
        phone: trimmedPhone,
        registrationStatus: 'pending',
        isActive: true,
      },
    });

    // Also auto-sign up for active tournament if exists
    const { tournament, participation, error: tournamentError } = await createParticipationForTournament(player.id, division);

    if (clubId) {
      await db.clubMember.create({
        data: { clubId, playerId: player.id, role: 'member' },
      });
    }

    return NextResponse.json({
      success: true,
      message: tournament
        ? `Pendaftaran berhasil! Anda juga otomatis terdaftar di ${tournament.name}. Menunggu persetujuan admin.`
        : 'Pendaftaran berhasil! Menunggu persetujuan admin.',
      player: {
        id: player.id,
        name: player.name,
        gamertag: player.gamertag,
        division: player.division,
        city: player.city,
        registrationStatus: player.registrationStatus,
      },
      tournament: tournament ? { id: tournament.id, name: tournament.name } : null,
    }, { status: 201 });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Gagal mendaftar. Silakan coba lagi.' }, { status: 500 });
  }
}
