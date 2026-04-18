// ============================================
// IDM LEAGUE - POINTS & RANKING SYSTEM
// ============================================

import { db } from '@/lib/db';

export const TIER_THRESHOLDS = {
  B_TO_A: 15,
  A_TO_S: 35,
} as const;

export const TIER_ORDER = { S: 3, A: 2, B: 1 } as const;
export type Tier = 'S' | 'A' | 'B';

export function calculateTargetTier(currentPoints: number): Tier {
  if (currentPoints >= TIER_THRESHOLDS.A_TO_S) return 'S';
  if (currentPoints >= TIER_THRESHOLDS.B_TO_A) return 'A';
  return 'B';
}

export function getTierUpgradeInfo(currentTier: Tier, currentPoints: number): {
  shouldUpgrade: boolean;
  currentTier: Tier;
  targetTier: Tier;
  pointsToNext: number;
  nextThreshold: number | null;
} {
  const targetTier = calculateTargetTier(currentPoints);
  const shouldUpgrade = TIER_ORDER[targetTier] > TIER_ORDER[currentTier];

  let nextThreshold: number | null = null;
  let pointsToNext = 0;

  if (currentTier === 'B') {
    nextThreshold = TIER_THRESHOLDS.B_TO_A;
    pointsToNext = Math.max(0, TIER_THRESHOLDS.B_TO_A - currentPoints);
  } else if (currentTier === 'A') {
    nextThreshold = TIER_THRESHOLDS.A_TO_S;
    pointsToNext = Math.max(0, TIER_THRESHOLDS.A_TO_S - currentPoints);
  }

  return { shouldUpgrade, currentTier, targetTier, pointsToNext, nextThreshold };
}

export async function awardPoints(params: {
  playerId: string;
  amount: number;
  reason: string;
  description: string;
  tournamentId?: string;
  matchId?: string;
}) {
  const { playerId, amount, reason, description, tournamentId, matchId } = params;

  await db.playerPoint.create({
    data: {
      playerId,
      amount,
      reason,
      description,
      tournamentId: tournamentId || null,
      matchId: matchId || null,
    },
  });

  const player = await db.player.findUnique({ where: { id: playerId } });
  if (player) {
    await db.player.update({
      where: { id: playerId },
      data: { points: player.points + amount },
    });
  }
}

export async function processTierUpgrade(playerId: string): Promise<{
  upgraded: boolean;
  fromTier: Tier;
  toTier: Tier;
} | null> {
  const player = await db.player.findUnique({ where: { id: playerId } });
  if (!player) return null;

  const currentTier = player.tier as Tier;
  const info = getTierUpgradeInfo(currentTier, player.points);

  if (!info.shouldUpgrade) return null;

  await db.player.update({
    where: { id: playerId },
    data: { tier: info.targetTier },
  });

  return { upgraded: true, fromTier: currentTier, toTier: info.targetTier };
}

export async function processAllTierUpgrades(division?: string): Promise<{
  playerId: string;
  gamertag: string;
  fromTier: Tier;
  toTier: Tier;
}[]> {
  const where: Record<string, string> = {};
  if (division) where.division = division;

  const players = await db.player.findMany({ where });
  const upgraded: { playerId: string; gamertag: string; fromTier: Tier; toTier: Tier }[] = [];

  for (const player of players) {
    const result = await processTierUpgrade(player.id);
    if (result?.upgraded) {
      upgraded.push({ playerId: player.id, gamertag: player.gamertag, fromTier: result.fromTier, toTier: result.toTier });
    }
  }

  return upgraded;
}
