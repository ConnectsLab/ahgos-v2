import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { businesses, campaigns } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

function createSlug(value: string) {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${base || 'campaign'}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Campaign name is required' },
        { status: 400 }
      );
    }

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.userId, session.user.id),
      columns: { id: true },
    });
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const [campaign] = await db
      .insert(campaigns)
      .values({ businessId: business.id, name: name.trim(), slug: createSlug(name) })
      .returning();

    return NextResponse.json({ success: true, campaign }, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
