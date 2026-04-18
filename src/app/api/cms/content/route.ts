import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const settings = await db.cmsSetting.findMany();
    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return NextResponse.json({ settings: result });
  } catch (error) {
    console.error('CMS content error:', error);
    return NextResponse.json({ settings: {} });
  }
}
