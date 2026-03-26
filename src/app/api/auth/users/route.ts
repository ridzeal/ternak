import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { hashPassword } from '@/lib/auth';
import { verifySession } from '@/lib/middleware';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    // Verify admin
    const session = await verifySession(req);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { email, password, name, role = 'worker' } = await req.json();

    // Validate
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name required' },
        { status: 400 }
      );
    }

    // Check if email exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Create user
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      passwordHash: hashPassword(password),
      name,
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.insert(users).values(newUser);

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // List all users (admin only)
  const session = await verifySession(req);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 403 }
    );
  }

  const allUsers = await db.query.users.findMany({
    columns: {
      passwordHash: false, // Exclude password hash
    },
  });

  return NextResponse.json({ users: allUsers });
}
