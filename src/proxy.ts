import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;

  // List of public paths that don't require authentication
  const publicPaths = ['/auth/login', '/auth/reset'];

  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If there's no auth token and the path is not public, redirect to login
  if (!accessToken && !isPublicPath) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If there is an auth token and the user is on a public path, redirect to dashboard
  if (accessToken && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/dashboard', '/(api|trpc)(.*)'],
};
