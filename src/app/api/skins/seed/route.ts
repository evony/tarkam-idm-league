import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';

// Default skin definitions
const DEFAULT_SKINS = [
  {
    type: 'champion',
    displayName: 'Gold Crown',
    description: 'Skin juara tournament mingguan — berlaku selama 1 minggu setelah menang',
    icon: '🥇',
    colorClass: JSON.stringify({
      frame: 'ring-2 ring-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.4)]',
      name: 'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent',
      badge: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30',
      border: 'border-yellow-400/30 shadow-[0_0_8px_rgba(250,204,21,0.2)]',
    }),
    priority: 4,
    duration: 'weekly',
    isActive: true,
  },
  {
    type: 'mvp',
    displayName: 'Platinum Star',
    description: 'Skin MVP tournament mingguan — berlaku selama 1 minggu setelah mendapat MVP',
    icon: '⭐',
    colorClass: JSON.stringify({
      frame: 'ring-2 ring-gray-300 shadow-[0_0_12px_rgba(212,212,212,0.4)]',
      name: 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 bg-clip-text text-transparent',
      badge: 'bg-gray-300/20 text-gray-200 border-gray-300/30',
      border: 'border-gray-300/30 shadow-[0_0_8px_rgba(212,212,212,0.2)]',
    }),
    priority: 3,
    duration: 'weekly',
    isActive: true,
  },
  {
    type: 'host',
    displayName: 'Emerald Luxury',
    description: 'Skin penyelenggara/penyewa tournament — permanen selama aktif menjadi host',
    icon: '💎',
    colorClass: JSON.stringify({
      frame: 'ring-2 ring-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]',
      name: 'bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent',
      badge: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30',
      border: 'border-emerald-400/30 shadow-[0_0_8px_rgba(52,211,153,0.2)]',
    }),
    priority: 2,
    duration: 'permanent',
    isActive: true,
  },
  {
    type: 'donor',
    displayName: 'Maroon Heart',
    description: 'Skin donatur — permanen sebagai tanda terima kasih atas kontribusi',
    icon: '❤️',
    colorClass: JSON.stringify({
      frame: 'ring-2 ring-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.4)]',
      name: 'bg-gradient-to-r from-rose-500 via-rose-400 to-pink-500 bg-clip-text text-transparent',
      badge: 'bg-rose-400/20 text-rose-400 border-rose-400/30',
      border: 'border-rose-400/30 shadow-[0_0_8px_rgba(251,113,133,0.2)]',
    }),
    priority: 1,
    duration: 'permanent',
    isActive: true,
  },
];

/**
 * POST /api/skins/seed
 * Seed the 4 default skins (admin auth required)
 * Uses upsert to avoid duplicates
 */
export async function POST(request: Request) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const results = [];

    for (const skinData of DEFAULT_SKINS) {
      const skin = await db.skin.upsert({
        where: { type: skinData.type },
        update: {
          displayName: skinData.displayName,
          description: skinData.description,
          icon: skinData.icon,
          colorClass: skinData.colorClass,
          priority: skinData.priority,
          duration: skinData.duration,
          isActive: skinData.isActive,
        },
        create: skinData,
      });
      results.push(skin);
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${results.length} skins`,
      skins: results.map(s => ({
        id: s.id,
        type: s.type,
        displayName: s.displayName,
        icon: s.icon,
        priority: s.priority,
        duration: s.duration,
      })),
    });
  } catch (error) {
    console.error('Skin seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed skins' },
      { status: 500 }
    );
  }
}
