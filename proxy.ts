import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (pathname === '/') {
    if (token) {
      const dest = token.role === 'user' ? '/users/profile' : '/users';
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/pay')) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (!token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (pathname.startsWith('/users')) {
    if (token.role === 'user' && !pathname.startsWith('/users/profile')) {
      return NextResponse.redirect(new URL('/users/profile', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
