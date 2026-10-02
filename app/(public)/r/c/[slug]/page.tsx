import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { campaigns } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { PublicFeedbackForm } from '@/components/public-feedback-form';
import { cache } from 'react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const getCampaignBySlug = cache(async (slug: string) =>
  db.query.campaigns.findFirst({
    where: eq(campaigns.slug, slug),
    with: { business: true },
  })
);

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);

  if (!campaign?.business) {
    return {
      title: 'Feedback link not found | Ahgos',
      description: 'This public feedback link is unavailable.',
    };
  }

  const title = `${campaign.name} feedback | ${campaign.business.name}`;
  const description = `Share your experience with ${campaign.business.name} for ${campaign.name}. Your feedback helps them improve.`;

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      siteName: 'Ahgos',
      title,
      description,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function CampaignFeedbackPage({ params }: PageProps) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);

  if (!campaign?.business) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-sm rounded-2xl border border-border/60 bg-card p-6 text-center shadow-sm">
          <h1 className="text-lg font-medium">Campaign not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This feedback link may be incorrect or no longer available.
          </p>
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
