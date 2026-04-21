import { db } from '../src/lib/db';

async function seed() {
  const skins = [
    {
      type: 'champion',
      displayName: 'Gold Crown',
      description: 'Skin eksklusif untuk Juara 1 turnamen mingguan',
      icon: '🥇',
      colorClass: JSON.stringify({
        frame: '#facc15',
        name: '#fde047|#f59e0b|#eab308',
        badge: 'rgba(234,179,8,0.2)|#fde047',
        border: '#eab308|#f59e0b|#fde047',
        glow: 'rgba(234,179,8,0.4)',
      }),
      priority: 4,
      duration: 'weekly',
    },
    {
      type: 'mvp',
      displayName: 'Platinum Star',
      description: 'Skin eksklusif untuk MVP mingguan',
      icon: '⭐',
      colorClass: JSON.stringify({
        frame: '#d1d5db',
        name: '#e5e7eb|#d1d5db|#f3f4f6',
        badge: 'rgba(209,213,219,0.2)|#e5e7eb',
        border: '#d1d5db|#9ca3af|#e5e7eb',
        glow: 'rgba(209,213,219,0.4)',
      }),
      priority: 3,
      duration: 'weekly',
    },
    {
      type: 'host',
      displayName: 'Emerald Luxury',
      description: 'Skin eksklusif untuk penyewa turnamen',
      icon: '💎',
      colorClass: JSON.stringify({
        frame: '#34d399',
        name: '#6ee7b7|#2dd4bf|#4ade80',
        badge: 'rgba(16,185,129,0.2)|#6ee7b7',
        border: '#34d399|#2dd4bf|#86efac',
        glow: 'rgba(52,211,153,0.35)',
      }),
      priority: 2,
      duration: 'permanent',
    },
    {
      type: 'donor',
      displayName: 'Maroon Heart',
      description: 'Skin eksklusif untuk donatur IDM League',
      icon: '❤️',
      colorClass: JSON.stringify({
        frame: '#fb7185',
        name: '#fb7185|#ef4444|#f472b6',
        badge: 'rgba(244,63,94,0.2)|#fda4af',
        border: '#f43f5e|#ef4444|#f472b6',
        glow: 'rgba(244,63,94,0.35)',
      }),
      priority: 1,
      duration: 'permanent',
    },
  ];

  for (const skin of skins) {
    await db.skin.upsert({
      where: { type: skin.type },
      update: skin,
      create: skin,
    });
    console.log(`✓ Seeded skin: ${skin.type} (${skin.displayName})`);
  }

  console.log('\nAll skins seeded!');
  await db.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
