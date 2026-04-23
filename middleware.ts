import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { jwtVerify } from 'jose';

const intlMiddleware = createMiddleware(routing);

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is not set. Refusing to start in production without it.');
    }
    console.warn('⚠️  JWT_SECRET not set — using development-only fallback. Do NOT deploy this to production.');
    return new TextEncoder().encode('dev-only-fallback-do-not-deploy');
  }
  return new TextEncoder().encode(secret);
}

async function verifyTokenInMiddleware(token: string): Promise<{ userId: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as { userId: string; role: string };
  } catch {
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  const token = request.cookies.get('okinte-auth-token')?.value;

  const protectedPaths = ['/dashboard', '/admin'];
  const adminPaths = ['/admin'];

  const isProtected = protectedPaths.some(p =>
    request.nextUrl.pathname.startsWith(p) ||
    /^\/(fr|en|ar|tr|ja|es|it)/.test(request.nextUrl.pathname) &&
    protectedPaths.some(pp => request.nextUrl.pathname.includes(pp))
  );

  const isAdminPath = adminPaths.some(p =>
    request.nextUrl.pathname.startsWith(p) ||
    /^\/(fr|en|ar|tr|ja|es|it)/.test(request.nextUrl.pathname) &&
    adminPaths.some(pp => request.nextUrl.pathname.includes(pp))
  );

  if (isProtected) {
    const localeMatch = request.nextUrl.pathname.match(/^\/(fr|en|ar|tr|ja|es|it)/);
    const locale = localeMatch ? localeMatch[1] : 'en';

    // No token at all → redirect to login
    if (!token) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    // Verify JWT signature and expiration
    const payload = await verifyTokenInMiddleware(token);
    if (!payload) {
      // Invalid/expired token → clear cookie and redirect
      const response = NextResponse.redirect(new URL(`/${locale}/login`, request.url));
      response.cookies.delete('okinte-auth-token');
      return response;
    }

    // Admin paths require ADMIN role
    if (isAdminPath && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  }

  // Proceed with i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(fr|en|ar|tr|ja|es|it)/:path*'],
};
