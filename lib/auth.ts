/**
 * Authentication Library
 * 
 * WHY: Handles all auth logic — password hashing, JWT tokens, session management.
 * 
 * HOW IT WORKS:
 * 
 * PASSWORD HASHING (bcrypt):
 * - When user registers, we NEVER store the raw password
 * - bcrypt hashes it with a salt (10 rounds) → stored in DB
 * - On login, bcrypt compares the entered password with the hash
 * - Even if the database is breached, passwords are safe
 * 
 * JWT (JSON Web Tokens):
 * - After login, we create a JWT containing: { userId, role, email }
 * - This JWT is stored in an httpOnly cookie (not accessible by JavaScript)
 * - On every API request, we verify the JWT to identify the user
 * - JWT expires after 7 days → user must log in again
 */

import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-development-only'
);

const COOKIE_NAME = 'bolila-auth-token';
const TOKEN_EXPIRY = '7d'; // Token valid for 7 days

// ============================================================
// PASSWORD FUNCTIONS
// ============================================================

/**
 * Hash a password with bcrypt (10 salt rounds)
 * 10 rounds = ~100ms per hash — good balance of security vs speed
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compare a plain-text password with a bcrypt hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================================
// JWT FUNCTIONS
// ============================================================

interface TokenPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

/**
 * Create a signed JWT token
 */
export async function createToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT token
 * Returns null if token is invalid or expired
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// ============================================================
// SESSION MANAGEMENT (Cookie-based)
// ============================================================

/**
 * Set the auth token as an httpOnly cookie
 * httpOnly = JavaScript cannot access it (prevents XSS attacks)
 * secure = only sent over HTTPS (in production)
 * sameSite = prevents CSRF attacks
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: '/',
  });
}

/**
 * Remove the auth cookie (logout)
 */
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Get the current authenticated user from the cookie
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  return verifyToken(token);
}

/**
 * Get the current user from a NextRequest (for API routes)
 */
export async function getUserFromRequest(
  request: NextRequest
): Promise<TokenPayload | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) return null;

  return verifyToken(token);
}

/**
 * Require authentication — throws if not logged in
 */
export async function requireAuth(): Promise<TokenPayload> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

/**
 * Require admin role — throws if not admin
 */
export async function requireAdmin(): Promise<TokenPayload> {
  const user = await requireAuth();
  if (user.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
  return user;
}
