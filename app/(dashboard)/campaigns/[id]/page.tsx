import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Star } from 'lucide-react';
import { db } from '@/lib/db';
import { campaigns } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { getCampaignReviews } from '@/lib/data/reviews';
import { getCurrentUserAndBusiness } from '@/lib/session';
import { ReviewsView } from '@/components/reviews-view';
import { CampaignLinkActions } from '@/components/campaign-link-actions';
import { formatDate } from '@/lib/utils';

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
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: campaignReviews.filter((review) => review.rating === rating).length,
  }));

  return (
    <div className="space-y-7">
      <header className="space-y-5 border-b border-border/60 pb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All campaigns
            </Link>
            <h1 className="mt-4 font-heading text-3xl font-medium leading-tight text-foreground md:text-4xl">
              {campaign.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Created {formatDate(campaign.createdAt, 'MMMM d, yyyy')}
            </p>
          </div>
          <CampaignLinkActions slug={campaign.slug} />
        </div>
      </header>

      <section
        aria-label="Campaign performance"
        className="grid gap-6 border-b border-border/60 pb-6 sm:grid-cols-[0.7fr_0.8fr_1.5fr] sm:gap-8"
      >
        <div>
          <p className="text-xs text-muted-foreground">Reviews</p>
          <p className="mt-2 font-serif text-3xl text-foreground">
            {campaignReviews.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">collected</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Average rating</p>
          <p className="mt-2 flex items-center gap-1.5 font-serif text-3xl text-foreground">
            {averageRating ?? '—'}
            {averageRating !== null && (
              <Star
                aria-hidden="true"
                className="size-4 fill-amber-400 text-amber-400"
              />
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">out of 5</p>
        </div>

        <div aria-label="Rating distribution" className="space-y-1.5">
          <p className="mb-3 text-xs text-muted-foreground">
            Rating distribution
          </p>
          {ratingDistribution.map(({ rating, count }) => {
            const percentage = campaignReviews.length
              ? (count / campaignReviews.length) * 100
              : 0;

            return (
              <div
                key={rating}
                className="grid grid-cols-[1rem_minmax(0,1fr)_1.5rem] items-center gap-2 text-xs text-muted-foreground"
                aria-label={`${rating} stars: ${count} reviews`}
              >
                <span>{rating}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-amber-400"
                    style={{ width: `${percentage}%` }}
                  />
                </span>
                <span className="text-right tabular-nums">{count}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-heading text-xl font-medium text-foreground">
            Customer feedback
          </h2>
          <p className="text-xs text-muted-foreground">
            {campaignReviews.length}{' '}
            {campaignReviews.length === 1 ? 'review' : 'reviews'}
          </p>
        </div>
        <ReviewsView initialReviews={campaignReviews} />
      </section>
    </div>
  );
}
