import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // If visiting evolvebraintraining.vercel.app or any evolve-specific subdomain
  if (host.includes('evolve')) {
    // Rewrite root path "/" directly to "/evolve"
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/evolve', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
