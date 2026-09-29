import { db } from '@/lib/db';
import { businesses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { PublicFeedbackForm } from '@/components/public-feedback-form';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PublicBusinessFeedbackPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.slug, slug),
  });

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-2 max-w-sm">
          <h1 className="text-lg font-semibold tracking-tight">
            Business not found
          </h1>
          <p className="text-sm text-muted-foreground">
            The feedback link you followed may be incorrect or no longer active.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-10 px-4 bg-muted/20">
      <PublicFeedbackForm
        business={{
          id: business.id,
          name: business.name,
        }}
      />
    </div>
  );
}
