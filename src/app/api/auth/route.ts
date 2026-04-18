import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username and password required' }, { status: 400 });
    }

    const admin = await db.adminUser.findUnique({ where: { username } });
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await bcryptjs.compare(password, admin.password);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      admin: { id: admin.id, username: admin.username, role: admin.role },
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}
