import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { businesses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    redirect('/sign-in');
  }
  return session;
}

export async function getCurrentUserAndBusiness() {
  const session = await getSession();
  if (!session?.user) {
    return null;
  }

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.userId, session.user.id),
  });

  return {
    user: session.user,
    session: session.session,
    business,
  };
}
