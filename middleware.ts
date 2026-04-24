import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { jwtVerify } from 'jose';

const intlMiddleware = createMiddleware(routing);

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      '[Middleware] FATAL: JWT_SECRET environment variable is not set. ' +
      'The application cannot start without it.'
    );
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
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const cspHeader = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://cdn.jsdelivr.net https://js.stripe.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' blob: data: https:`,
    `font-src 'self' data: https://fonts.gstatic.com`,
    `connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://fonts.googleapis.com https://fonts.gstatic.com`,
    `frame-src https://js.stripe.com`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `upgrade-insecure-requests`,
  ].join('; ');

  // Clone headers so Next.js can read the nonce
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  // We must re-create the request with our updated headers
  request = new NextRequest(request.url, {
    headers: requestHeaders,
    method: request.method,
    body: request.body,
    referrer: request.referrer,
  });

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

  // Apply i18n middleware
  const response = intlMiddleware(request);

  // Add Security & SEO Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Content-Security-Policy', cspHeader);
  // Thread nonce to the response so layout.tsx can read it via headers()
  response.headers.set('x-nonce', nonce);

  // Cache control for public pages
  if (!isProtected && !isAdminPath && !request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');
  }

  return response;
}

export const config = {
  matcher: ['/', '/(fr|en|ar|tr|ja|es|it)/:path*'],
};
