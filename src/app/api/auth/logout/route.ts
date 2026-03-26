import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const token = req.headers.get('cookie')
    ?.split('; ')
    .find(row => row.startsWith('session='))
    ?.split('=')[1];

  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('session');
  return response;
}
