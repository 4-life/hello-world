import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (pathname === '/' && token) {
    const dest = token.role === 'user' ? '/users/profile' : '/users';
    return NextResponse.redirect(new URL(dest, req.url));
  }

  if (pathname.startsWith('/users')) {
    if (!token) return NextResponse.redirect(new URL('/', req.url));
    if (token.role === 'user' && !pathname.startsWith('/users/profile')) {
      return NextResponse.redirect(new URL('/users/profile', req.url));
    }
  }

  if (pathname.startsWith('/pay')) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (!token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api).*)'],
};
