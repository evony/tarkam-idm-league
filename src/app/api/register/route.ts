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
  canReRegister: boolean;       // For rejected/inactive — full re-registration
  canSignUpForTournament: boolean; // For approved — sign up for active tournament
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
  existingPlayers: Array<{ id: string; name: string; gamertag: string; division: string; city: string; phone: string | null; registrationStatus: string; isActive: boolean }>
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
    // Rejected or inactive — full re-registration (reset player data)
    if (exactNamePlayer.registrationStatus === 'rejected' || !exactNamePlayer.isActive) {
      return {
        isBlocked: false,
        isHighRisk: false,
        canReRegister: true,
        canSignUpForTournament: false,
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
        canSignUpForTournament: false,
        reRegisterPlayerId: null,
        similarPlayers: [exactNamePlayer],
        message: `Pendaftaran diblokir! Nama "${name}" sudah dalam antrian persetujuan admin (gamertag: "${exactNamePlayer.gamertag}"). Silakan tunggu admin menyetujui pendaftaran Anda.`,
      };
    }

    // Approved and active — allow signing up for tournament (NOT re-registration)
    return {
      isBlocked: false,
      isHighRisk: false,
      canReRegister: false,
      canSignUpForTournament: true,
      reRegisterPlayerId: exactNamePlayer.id,
      similarPlayers: [exactNamePlayer],
      message: `Nama "${name}" sudah terdaftar sebagai peserta aktif (gamertag: "${exactNamePlayer.gamertag}"). Klik "Daftar Turnamen" untuk mendaftar di turnamen minggu ini.`,
    };
  }

  const phoneMatchPlayer = similarPlayers.find(p => p.matchDetails.phoneMatch);

  if (phoneMatchPlayer) {
    if (phoneMatchPlayer.registrationStatus === 'rejected' || !phoneMatchPlayer.isActive) {
      return {
        isBlocked: false,
        isHighRisk: false,
        canReRegister: true,
        canSignUpForTournament: false,
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
        canSignUpForTournament: false,
        reRegisterPlayerId: null,
        similarPlayers: [phoneMatchPlayer],
        message: `Pendaftaran diblokir! Nomor WhatsApp ini sudah dalam antrian persetujuan admin atas nama "${phoneMatchPlayer.name}".`,
      };
    }

    // Approved and active — allow signing up for tournament
    return {
      isBlocked: false,
      isHighRisk: false,
      canReRegister: false,
      canSignUpForTournament: true,
      reRegisterPlayerId: phoneMatchPlayer.id,
      similarPlayers: [phoneMatchPlayer],
      message: `Nomor WhatsApp ini sudah terdaftar atas nama "${phoneMatchPlayer.name}" (gamertag: "${phoneMatchPlayer.gamertag}"). Klik "Daftar Turnamen" untuk mendaftar di turnamen minggu ini.`,
    };
  }

  // Similar name only — warning
  if (similarPlayers.length > 0) {
    return {
      isBlocked: false,
      isHighRisk: false,
      canReRegister: false,
      canSignUpForTournament: false,
      similarPlayers,
      message: `Terdapat nama yang mirip: ${similarPlayers.map(p => p.name).join(', ')}. Yakin nama ini berbeda?`,
    };
  }

  return {
    isBlocked: false,
    isHighRisk: false,
    canReRegister: false,
    canSignUpForTournament: false,
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

  const result = checkDuplicates(name, city || '', phone, division || '', allPlayers);

  return NextResponse.json({
    exists: result.similarPlayers.length > 0,
    similar: result.similarPlayers,
    isBlocked: result.isBlocked,
    isHighRisk: result.isHighRisk,
    canReRegister: result.canReRegister,
    canSignUpForTournament: result.canSignUpForTournament,
    reRegisterPlayerId: result.reRegisterPlayerId,
    message: result.message,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, joki, phone, city, clubId, division, force, reRegister, reRegisterPlayerId, signUpForTournament } = body;

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

    // ====== TOURNAMENT SIGN-UP FLOW ======
    // When an already-approved player wants to join the current tournament
    if (signUpForTournament && reRegisterPlayerId) {
      const existingPlayer = await db.player.findUnique({
        where: { id: reRegisterPlayerId },
      });

      if (!existingPlayer) {
        return NextResponse.json({ error: 'Player tidak ditemukan' }, { status: 404 });
      }

      if (existingPlayer.registrationStatus !== 'approved' || !existingPlayer.isActive) {
        return NextResponse.json({ error: 'Player belum disetujui. Hubungi admin.' }, { status: 400 });
      }

      // Find active tournament for this division
      const activeTournament = await findActiveTournament(division);

      if (!activeTournament) {
        return NextResponse.json({
          error: 'Tidak ada turnamen yang sedang menerima pendaftaran saat ini.',
        }, { status: 400 });
      }

      // Check if already registered in this tournament
      const existingParticipation = await db.participation.findUnique({
        where: { playerId_tournamentId: { playerId: existingPlayer.id, tournamentId: activeTournament.id } },
      });

      if (existingParticipation) {
        return NextResponse.json({
          error: `Anda sudah terdaftar di ${activeTournament.name} (status: ${existingParticipation.status}).`,
        }, { status: 400 });
      }

      // Create participation record
      const participation = await db.participation.create({
        data: {
          playerId: existingPlayer.id,
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

      return NextResponse.json({
        success: true,
        isTournamentSignUp: true,
        message: `Berhasil mendaftar di ${activeTournament.name}! Menunggu persetujuan admin.`,
        player: {
          id: existingPlayer.id,
          name: existingPlayer.name,
          gamertag: existingPlayer.gamertag,
          division: existingPlayer.division,
          city: existingPlayer.city,
        },
        tournament: {
          id: activeTournament.id,
          name: activeTournament.name,
          weekNumber: activeTournament.weekNumber,
        },
        participation: {
          id: participation.id,
          status: participation.status,
        },
      }, { status: 200 });
    }

    // ====== RE-REGISTRATION FLOW ======
    // When rejected/inactive user confirms re-registration
    if (reRegister && reRegisterPlayerId) {
      const existingPlayer = await db.player.findUnique({
        where: { id: reRegisterPlayerId },
      });

      if (!existingPlayer) {
        return NextResponse.json({ error: 'Player tidak ditemukan' }, { status: 404 });
      }

      if (clubId) {
        const club = await db.club.findUnique({ where: { id: clubId } });
        if (!club) {
          return NextResponse.json({ error: 'Club tidak ditemukan' }, { status: 400 });
        }
      }

      // Update existing player back to pending status
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
      const activeTournament = await findActiveTournament(division);
      if (activeTournament) {
        const existingParticipation = await db.participation.findUnique({
          where: { playerId_tournamentId: { playerId: updatedPlayer.id, tournamentId: activeTournament.id } },
        });
        if (!existingParticipation) {
          await db.participation.create({
            data: {
              playerId: updatedPlayer.id,
              tournamentId: activeTournament.id,
              status: 'registered',
              pointsEarned: 0,
            },
          });
          if (activeTournament.status === 'setup') {
            await db.tournament.update({
              where: { id: activeTournament.id },
              data: { status: 'registration' },
            });
          }
        }
      }

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

      return NextResponse.json({
        success: true,
        message: activeTournament
          ? `Pendaftaran ulang berhasil! Anda juga otomatis terdaftar di ${activeTournament.name}. Menunggu persetujuan admin.`
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
        tournament: activeTournament ? { id: activeTournament.id, name: activeTournament.name } : null,
      }, { status: 200 });
    }

    // ====== NORMAL REGISTRATION FLOW ======
    const existingPlayers = await db.player.findMany({
      where: { division },
      select: {
        id: true, name: true, gamertag: true, division: true,
        city: true, phone: true, registrationStatus: true, isActive: true,
      },
    });

    const duplicateCheck = checkDuplicates(trimmedName, trimmedCity, trimmedPhone, division, existingPlayers);

    if (duplicateCheck.isBlocked) {
      return NextResponse.json({
        blocked: true,
        error: duplicateCheck.message,
        similarPlayers: duplicateCheck.similarPlayers,
      }, { status: 409 });
    }

    // If can sign up for tournament (approved player), return the option
    if (duplicateCheck.canSignUpForTournament) {
      return NextResponse.json({
        canSignUpForTournament: true,
        canReRegister: false,
        reRegisterPlayerId: duplicateCheck.reRegisterPlayerId,
        message: duplicateCheck.message,
        similarPlayers: duplicateCheck.similarPlayers,
      }, { status: 200 });
    }

    // If can re-register (rejected/inactive), return the option
    if (duplicateCheck.canReRegister) {
      return NextResponse.json({
        canReRegister: true,
        canSignUpForTournament: false,
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
    const activeTournament = await findActiveTournament(division);
    if (activeTournament) {
      await db.participation.create({
        data: {
          playerId: player.id,
          tournamentId: activeTournament.id,
          status: 'registered',
          pointsEarned: 0,
        },
      });
      if (activeTournament.status === 'setup') {
        await db.tournament.update({
          where: { id: activeTournament.id },
          data: { status: 'registration' },
        });
      }
    }

    if (clubId) {
      await db.clubMember.create({
        data: { clubId, playerId: player.id, role: 'member' },
      });
    }

    return NextResponse.json({
      success: true,
      message: activeTournament
        ? `Pendaftaran berhasil! Anda juga otomatis terdaftar di ${activeTournament.name}. Menunggu persetujuan admin.`
        : 'Pendaftaran berhasil! Menunggu persetujuan admin.',
      player: {
        id: player.id,
        name: player.name,
        gamertag: player.gamertag,
        division: player.division,
        city: player.city,
        registrationStatus: player.registrationStatus,
      },
      tournament: activeTournament ? { id: activeTournament.id, name: activeTournament.name } : null,
    }, { status: 201 });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Gagal mendaftar. Silakan coba lagi.' }, { status: 500 });
  }
}
