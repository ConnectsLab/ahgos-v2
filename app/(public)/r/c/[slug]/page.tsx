import { db } from '@/lib/db';
import { campaigns } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { PublicFeedbackForm } from '@/components/public-feedback-form';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CampaignFeedbackPage({ params }: PageProps) {
  const { slug } = await params;
  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.slug, slug),
    with: { business: true },
  });

  if (!campaign?.business) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-sm border border-border bg-card p-6 text-center">
          <h1 className="text-lg font-medium">Campaign not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">This feedback link may be incorrect or no longer available.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <PublicFeedbackForm
        business={{ id: campaign.business.id, name: campaign.business.name }}
        campaign={{ id: campaign.id, name: campaign.name }}
      />
    </main>
  );
}
