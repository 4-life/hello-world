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

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/users/:path*'],
};
