import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Star } from 'lucide-react';
import { db } from '@/lib/db';
import { campaigns, reviews } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { getCampaignReviews } from '@/lib/data/reviews';
import { getCurrentUserAndBusiness } from '@/lib/session';
import { ReviewsView } from '@/components/reviews-view';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CampaignPageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  // Get the Current User and the business information
  const context = await getCurrentUserAndBusiness();
  if (!context?.business) return null;
  const { id } = await params;
  const campaignId = Number(id);
  if (!Number.isInteger(campaignId)) notFound();

  // Get the Particular Campaign
  const campaign = await db.query.campaigns.findFirst({
    where: and(
      eq(campaigns.id, campaignId),
      eq(campaigns.businessId, context.business.id)
    ),
  });
  if (!campaign) notFound();

  const campaignReviews = await getCampaignReviews(
    context.business.id,
    campaign.id
  );
  const averageRating = campaignReviews.length
    ? Number(
        (
          campaignReviews.reduce((total, review) => total + review.rating, 0) /
          campaignReviews.length
        ).toFixed(1)
      )
    : null;

  return (
    <div className="space-y-8">
      <div className="flex  gap-5 border-b border-border pb-6  items-end justify-between">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All campaigns
          </Link>
          <h1 className="mt-3 text-3xl font-medium tracking-tight">
            {campaign.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Created{' '}
            {new Date(campaign.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <a
          href={`/r/c/${campaign.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: 'link' }),
            'gap-2',
            'sm:text-sm'
          )}
        >
          Preview feedback link <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-2 gap-px  sm:max-w-md">
        <div className="bg-card p-4">
          <p className="text-xs text-muted-foreground">Reviews</p>
          <p className="mt-1 text-2xl font-medium">{campaignReviews.length}</p>
        </div>
        <div className="bg-card p-4">
          <p className="text-xs text-muted-foreground">Average rating</p>
          <p className="mt-1 flex items-center gap-1 text-2xl font-medium">
            {averageRating ?? '—'}{' '}
            {averageRating && (
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            )}
          </p>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-medium">Campaign feedback</h2>
        <ReviewsView initialReviews={campaignReviews} />
      </section>
    </div>
  );
}
