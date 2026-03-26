import { db } from '@/db';
import { sessions, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  session: {
    id: string;
    expiresAt: string;
  };
}

/**
 * Verify session from request cookie
 */
export async function verifySession(req: NextRequest): Promise<AuthSession | null> {
  try {
    const token = req.cookies.get('session')?.value;

    if (!token) {
      console.log('🍪 No session cookie found');
      return null;
    }

    console.log('🍪 Session cookie found:', token.substring(0, 20) + '...');

    // Find session
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.token, token),
    });

    if (!session) {
      console.log('❌ Session not found in database');
      return null;
    }

    // Check expiry
    if (new Date(session.expiresAt) < new Date()) {
      console.log('❌ Session expired');
      // Delete expired session
      await db.delete(sessions).where(eq(sessions.id, session.id));
      return null;
    }

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      console.log('❌ User not found for session');
      return null;
    }

    // Check user active status
    if (!user.isActive) {
      console.log('❌ User account inactive');
      return null;
    }

    console.log('✅ Session valid for user:', user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

/**
 * Require authentication - throws if not authenticated
 */
export function requireAuth(session: AuthSession | null): asserts session is AuthSession {
  if (!session) {
    throw new Error('Authentication required');
  }
}

/**
 * Require specific roles - throws if user doesn't have required role
 */
export function requireRole(session: AuthSession, roles: string[]): asserts session is AuthSession {
  requireAuth(session);
  if (!roles.includes(session.user.role)) {
    throw new Error(`Required role: ${roles.join(' or ')}`);
  }
}
