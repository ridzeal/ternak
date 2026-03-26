import { createHash, randomBytes } from 'crypto';

/**
 * Hash a password with a random salt using SHA-256
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256')
    .update(salt + password)
    .digest('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  try {
    const [salt, storedHash] = hash.split(':');
    const computedHash = createHash('sha256')
      .update(salt + password)
      .digest('hex');
    return computedHash === storedHash;
  } catch {
    return false;
  }
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Get session expiry date (7 days from now)
 */
export function getSessionExpiry(): string {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // 7 days
  return expires.toISOString();
}
