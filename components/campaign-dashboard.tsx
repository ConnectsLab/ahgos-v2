import Link from 'next/link';
import {
  ArrowUpRight,
  MessageSquareText,
  Plus,
  Star,
} from 'lucide-react';
import { getSentimentBadge, getStatusBadge } from '@/components/ui/review-badges';
import { buttonVariants } from '@/components/ui/button';
import type { CampaignSummary } from '@/lib/data/campaigns';
import type { DashboardStats } from '@/lib/data/dashboard';
import { formatDate } from '@/lib/utils';

interface CampaignDashboardProps {
  campaigns: CampaignSummary[];
  stats: DashboardStats;
}

export function CampaignDashboard({
  campaigns,
  stats,
}: CampaignDashboardProps) {
  const positivePercentage = stats.analyzedReviewCount
    ? Math.round((stats.positiveCount / stats.analyzedReviewCount) * 100)
    : null;

  const sentimentSegments = [
    { name: 'Positive', count: stats.positiveCount, color: 'bg-emerald-500' },
    { name: 'Neutral', count: stats.neutralCount, color: 'bg-slate-400' },
    { name: 'Negative', count: stats.negativeCount, color: 'bg-rose-500' },
    { name: 'Mixed', count: stats.mixedCount, color: 'bg-amber-500' },
  ];

  const recentCampaigns = campaigns.slice(0, 4);
  const recentReviewCampaigns = new Map(
    campaigns.map((campaign) => [campaign.id, campaign])
  );

  return (
    <div className="space-y-9">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-primary">
            Business overview
          </p>
          <h1 className="font-heading text-3xl font-medium leading-tight text-foreground md:text-4xl">
            Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            All-time customer feedback across your campaigns.
          </p>
        </div>
        <Link
          href="/campaigns"
          className={buttonVariants({ className: 'gap-2 rounded-xl' })}
        >
          <Plus aria-hidden="true" />
          New campaign
        </Link>
      </header>

      <section
        aria-label="Business metrics"
        className="grid grid-cols-2 divide-x divide-y divide-border/60 border-y border-border/60 sm:grid-cols-4 sm:divide-y-0"
      >
        <Metric label="Reviews" value={stats.totalReviews.toLocaleString()} />
        <Metric
          label="Average rating"
          value={stats.averageRating?.toFixed(1) ?? '—'}
          suffix={
            stats.averageRating !== null ? (
              <Star
                aria-hidden="true"
                className="mb-1 size-4 fill-amber-400 text-amber-400"
              />
            ) : undefined
          }
          detail={stats.averageRating !== null ? 'out of 5' : 'No ratings yet'}
        />
        <Metric
          label="Positive sentiment"
          value={positivePercentage === null ? '—' : `${positivePercentage}%`}
          detail={
            stats.analyzedReviewCount
              ? `${stats.positiveCount} of ${stats.analyzedReviewCount} analyzed`
              : 'No analyzed reviews'
          }
        />
        <Metric
          label="Campaigns"
          value={campaigns.length.toLocaleString()}
          detail="All campaigns"
        />
      </section>

      {campaigns.length === 0 ? (
        <section className="space-y-3 border-b border-border/60 pb-8">
          <h2 className="font-heading text-2xl font-medium text-foreground">
            Start with your first campaign
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Create a feedback link, share it with customers, and their reviews
            will appear in your overview.
          </p>
          <Link
            href="/campaigns"
            className={buttonVariants({ className: 'mt-2 gap-2' })}
          >
            <Plus aria-hidden="true" />
            Create a campaign
          </Link>
        </section>
      ) : (
        <>
          <section className="grid gap-9 border-b border-border/60 pb-8 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="font-heading text-2xl font-medium text-foreground">
                  Sentiment
                </h2>
                <p className="text-xs text-muted-foreground">
                  {stats.analyzedReviewCount
                    ? `Across ${stats.analyzedReviewCount} analyzed reviews`
                    : 'No reviews have completed analysis yet'}
                </p>
              </div>

              {stats.analyzedReviewCount > 0 ? (
                <>
                  <div
                    className="flex h-2 overflow-hidden rounded-full bg-muted"
                    role="img"
                    aria-label={sentimentSegments
                      .map(({ name, count }) => `${name}: ${count}`)
                      .join(', ')}
                  >
                    {sentimentSegments.map(({ name, count, color }) =>
                      count > 0 ? (
                        <span
                          key={name}
                          className={color}
                          style={{
                            width: `${(count / stats.analyzedReviewCount) * 100}%`,
                          }}
                        />
                      ) : null
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                    {sentimentSegments.map(({ name, count, color }) => (
                      <div key={name} className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={`size-2 shrink-0 rounded-full ${color}`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {name}
                        </span>
                        <span className="ml-auto text-sm font-medium tabular-nums text-foreground">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sentiment breakdown will appear as reviews finish analyzing.
                </p>
              )}
            </div>

            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="font-heading text-2xl font-medium text-foreground">
                  What customers mention
                </h2>
                <p className="text-xs text-muted-foreground">
                  Most discussed topics across your reviews.
                </p>
              </div>

              {stats.topTopics.length > 0 ? (
                <div className="space-y-4">
                  {stats.topTopics.map((topic) => {
                    const maxMentions = stats.topTopics[0].total;
                    return (
                      <div key={topic.name} className="space-y-1.5">
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="text-sm font-medium capitalize text-foreground">
                            {topic.name}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {topic.total} mentions · {topic.positivePercent}%
                            positive
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary/75"
                            style={{
                              width: `${(topic.total / maxMentions) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Topics will appear after reviews finish analyzing.
                </p>
              )}
            </div>
          </section>

          {stats.insight && (
            <section className="space-y-2 border-b border-border/60 pb-8">
              <h2 className="text-xs font-semibold uppercase text-primary">
                Pattern to notice
              </h2>
              <p className="max-w-3xl text-sm leading-relaxed text-foreground">
                {stats.insight}
              </p>
            </section>
          )}

          <section className="space-y-4 border-b border-border/60 pb-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-heading text-2xl font-medium text-foreground">
                Recent feedback
              </h2>
              <Link
                href="/reviews"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                All reviews <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            {stats.recentReviews.length > 0 ? (
              <div className="divide-y divide-border/60">
                {stats.recentReviews.map((review) => {
                  const campaign = review.campaignId
                    ? recentReviewCampaigns.get(review.campaignId)
                    : undefined;
                  const href = campaign
                    ? `/campaigns/${campaign.id}`
                    : '/reviews';

                  return (
                    <Link
                      key={review.id}
                      href={href}
                      className="block space-y-2 py-4 first:pt-1 hover:bg-muted/20"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                          {review.rating}/5
                          <Star
                            aria-hidden="true"
                            className="size-3.5 fill-amber-400 text-amber-400"
                          />
                        </span>
                        {getSentimentBadge(review.overallSentiment)}
                        {getStatusBadge(review.analysisStatus)}
                        {campaign && (
                          <span className="text-xs text-muted-foreground">
                            {campaign.name}
                          </span>
                        )}
                        <time
                          className="ml-auto text-xs text-muted-foreground"
                          dateTime={review.createdAt?.toISOString()}
                        >
                          {formatDate(review.createdAt, 'MMM d, yyyy')}
                        </time>
                      </div>
                      <p className="line-clamp-2 max-w-4xl font-serif text-base leading-relaxed text-foreground/90">
                        “{review.text}”
                      </p>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-start gap-3 py-5">
                <p className="text-sm text-muted-foreground">
                  No feedback yet. Share a campaign link to start collecting
                  reviews.
                </p>
                <Link
                  href="/campaigns"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View campaign links
                </Link>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-heading text-2xl font-medium text-foreground">
                Recent campaigns
              </h2>
              <Link
                href="/campaigns"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                All campaigns{' '}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            <div className="divide-y divide-border/60">
              {recentCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}`}
                  className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4 first:pt-1 hover:bg-muted/20"
                >
                  <div className="min-w-0 space-y-1">
                    <span className="font-medium text-foreground">
                      {campaign.name}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {campaign.topics.length > 0
                        ? campaign.topics.join(' · ')
                        : `Created ${formatDate(campaign.createdAt, 'MMM d, yyyy')}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-5 text-xs text-muted-foreground">
                    <span>
                      {campaign.reviewCount}{' '}
                      {campaign.reviewCount === 1 ? 'review' : 'reviews'}
                    </span>
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      {campaign.averageRating ?? '—'}
                      {campaign.averageRating !== null && (
                        <Star
                          aria-hidden="true"
                          className="size-3.5 fill-amber-400 text-amber-400"
                        />
                      )}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
  suffix,
}: {
  label: string;
  value: string;
  detail?: string;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="min-w-0 px-4 py-4 first:pl-0 sm:px-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 font-serif text-2xl text-foreground">
        {value}
        {suffix}
      </p>
      {detail && (
        <p className="mt-1 truncate text-xs text-muted-foreground">{detail}</p>
      )}
    </div>
  );
}