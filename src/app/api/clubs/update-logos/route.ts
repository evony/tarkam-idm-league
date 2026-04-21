import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * POST /api/clubs/update-logos
 *
 * Seed club logos from Cloudinary into the database.
 * This is a one-time utility to sync logos from Cloudinary to the DB.
 */
export async function POST(request: Request) {
  try {
    // Club logo mapping — name → Cloudinary URL
    // These logos were uploaded to Cloudinary's idm/logos/ folder
    const clubLogos = [
      { name: 'ALQA', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722484/idm/logos/xm73kzny0klrncflhxfj.jpg' },
      { name: 'AVENUE', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722508/idm/logos/j8zw91uiulijp8gf8ugg.webp' },
      { name: 'CROWN', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722530/idm/logos/o1ujmjazgv1nxdpjzkew.webp' },
      { name: 'EUPHORIC', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722372/idm/logos/cdstmpd99aetv3xvbwu0.webp' },
      { name: 'GYMSHARK', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775839600/idm/logos/fymwsgztdv0egvjite2o.webp' },
      { name: 'JASMINE', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722472/idm/logos/zxikdnl6ycqx4hkfmpwi.jpg' },
      { name: 'MAXIMOUS', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722447/idm/logos/ewl70fqyehvdhefxq76h.webp' },
      { name: 'MYSTERY', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722423/idm/logos/gdvdqo4ul8filhyv2zrz.jpg' },
      { name: 'ORPHIC', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722393/idm/logos/d1jroavrbfs7uwm8mx0t.jpg' },
      { name: 'PARANOID', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722406/idm/logos/iwd3khpecy8yo1mx94js.webp' },
      { name: 'Plat R', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775748244/idm/logos/aydxk3fnrdkcmqh48aoi.jpg' },
      { name: 'PSALM', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722357/idm/logos/agyc2zkbafrvf1kjrc0b.jpg' },
      { name: 'QUEEN', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775839657/idm/logos/gzfny3tfdkxircyyxaxu.jpg' },
      { name: 'RESTART', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722457/idm/logos/kdtgjq5sdecmfjtflude.jpg' },
      { name: 'RNB', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722517/idm/logos/migrego3avfcr0pganyq.jpg' },
      { name: 'SALVADOR', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722437/idm/logos/ofcqjompuuqcmmqfoziu.webp' },
      { name: 'SECRETS', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722381/idm/logos/shcq5q4air1xkpqnz1hi.jpg' },
      { name: 'SENSEI', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775839508/idm/logos/r41d6jqucjorjnh1scro.jpg' },
      { name: 'SOUTHERN', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775839645/idm/logos/upuq4u9bccaihdnh6llb.jpg' },
      { name: 'TOGETHER', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722484/idm/logos/xm73kzny0klrncflhxfj.jpg' },
      { name: 'YAKUZA', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722530/idm/logos/o1ujmjazgv1nxdpjzkew.webp' },
    ];

    const updatedClubs = [];

    for (const clubData of clubLogos) {
      // Update ALL clubs with this name (may exist in multiple seasons)
      const result = await db.club.updateMany({
        where: { name: clubData.name },
        data: { logo: clubData.logo },
      });

      updatedClubs.push({
        name: clubData.name,
        updated: result.count > 0,
        count: result.count,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Club logos updated',
      updatedClubs,
    });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Update club logos error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
