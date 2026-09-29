import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { businesses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const protectedRoutes = ['/dashboard', '/reviews', '/collect', '/settings', '/onboarding'];
const authRoutes = ['/sign-in', '/sign-up'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.includes(pathname);

  if (!needsAuth && !isAuthRoute) return NextResponse.next();

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    if (!needsAuth) return NextResponse.next();
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(signInUrl);
  }

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.userId, session.user.id),
    columns: { id: true },
  });

  if (pathname === '/onboarding') {
    return business
      ? NextResponse.redirect(new URL('/dashboard', request.url))
      : NextResponse.next();
  }

  if (needsAuth && !business) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  if (isAuthRoute) {
    return NextResponse.redirect(
      new URL(business ? '/dashboard' : '/onboarding', request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/reviews/:path*',
    '/collect/:path*',
    '/settings/:path*',
    '/onboarding',
    '/sign-in',
    '/sign-up',
  ],
};
