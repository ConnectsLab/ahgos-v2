import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { businesses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

function createSlug(value: string) {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${base || 'business'}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, type } = await request.json();
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    const existing = await db.query.businesses.findFirst({
      where: eq(businesses.userId, session.user.id),
      columns: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'A business already exists for this account' },
        { status: 409 }
      );
    }

    const [business] = await db
      .insert(businesses)
      .values({
        userId: session.user.id,
        name: name.trim(),
        type: typeof type === 'string' && type.trim() ? type.trim() : null,
        slug: createSlug(name),
      })
      .returning();

    return NextResponse.json({ success: true, business }, { status: 201 });
  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json(
      { error: 'Failed to create your business' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    const [updated] = await db
      .update(businesses)
      .set({
        name: trimmedName,
        type: typeof type === 'string' && type.trim() ? type.trim() : null,
      })
      .where(eq(businesses.userId, session.user.id))
      .returning();

    return NextResponse.json({
      success: true,
      business: updated,
    });
  } catch (error) {
    console.error('Error updating business:', error);
    return NextResponse.json(
      { error: 'Failed to update business details' },
      { status: 500 }
    );
  }
}
