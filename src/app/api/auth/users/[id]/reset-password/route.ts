import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { hashPassword } from '@/lib/auth';
import { verifySession } from '@/lib/middleware';
import { eq } from 'drizzle-orm';

// POST /api/auth/users/[id]/reset-password - Reset user password
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await verifySession(req);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { newPassword } = await req.json();
    const userId = params.id;

    // Validate password
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update password
    await db.update(users)
      .set({ 
        passwordHash: hashPassword(newPassword),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
