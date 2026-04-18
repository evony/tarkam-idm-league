import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';

export async function POST() {
  try {
    const existing = await db.adminUser.findFirst();
    if (existing) {
      return NextResponse.json({ message: 'Admin already exists', admin: { id: existing.id, username: existing.username } });
    }

    const hashedPassword = await bcryptjs.hash('admin123', 10);
    const admin = await db.adminUser.create({
      data: { username: 'admin', password: hashedPassword, role: 'superadmin' },
    });

    return NextResponse.json({ message: 'Admin created', admin: { id: admin.id, username: admin.username } });
  } catch (error) {
    console.error('Init admin error:', error);
    return NextResponse.json({ error: 'Failed to init admin' }, { status: 500 });
  }
}
