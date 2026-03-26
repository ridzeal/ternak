import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  const session = await verifySession(req);

  if (!session) {
    const token = req.cookies.get('session')?.value;
    console.log('❌ Auth check failed. Cookie present:', !!token, 'Token:', token?.substring(0, 20));
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  console.log('✅ Auth check passed for user:', session.user.email);

  return NextResponse.json({ user: session.user });
}
