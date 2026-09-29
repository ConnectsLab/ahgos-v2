import { getCurrentUserAndBusiness } from '@/lib/session';
import { getDashboardData } from '@/lib/data/dashboard';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Star,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Share2,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function DashboardPage() {
  const context = await getCurrentUserAndBusiness();
  if (!context?.business) return null;

  const data = await getDashboardData(context.business.id);

  if (data.totalReviews === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Overview of customer feedback for {context.business.name}.
          </p>
        </div>

        <div className="rounded-lg border border-dashed p-10 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-12 bg-card">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">
            No customer feedback yet
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 mb-6 max-w-sm">
            Share your feedback link with customers to start learning what they
            think about your business.
          </p>
          <Link
            href="/collect"
            className={cn(buttonVariants(), 'flex items-center gap-2')}
          >
            <Share2 className="h-4 w-4" />
            <span>Collect feedback</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            What your customers are saying about {context.business.name}.
          </p>
        </div>
        <Link
          href="/collect"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'flex items-center gap-2'
          )}
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Share feedback link</span>
        </Link>
      </div>

      {data.insight && (
        <div className="rounded-md bg-muted/60 border px-4 py-3 text-sm flex items-start gap-3">
          <TrendingUp className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-foreground">Observation: </span>
            <span className="text-muted-foreground">{data.insight}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Reviews</CardDescription>
            <CardTitle className="text-2xl font-semibold">
              {data.totalReviews}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">
              Average Rating
            </CardDescription>
            <CardTitle className="text-2xl font-semibold flex items-center gap-1.5">
              <span>{data.averageRating ?? '—'}</span>
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">
              Positive Feedback
            </CardDescription>
            <CardTitle className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              {data.positiveCount}
              <span className="text-xs font-normal text-muted-foreground ml-1.5">
                ({Math.round((data.positiveCount / data.totalReviews) * 100)}%)
              </span>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">
              Negative Feedback
            </CardDescription>
            <CardTitle className="text-2xl font-semibold text-rose-600 dark:text-rose-400">
              {data.negativeCount}
              <span className="text-xs font-normal text-muted-foreground ml-1.5">
                ({Math.round((data.negativeCount / data.totalReviews) * 100)}%)
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-none flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              What customers are talking about
            </CardTitle>
            <CardDescription className="text-xs">
              Frequently mentioned topics and their positive sentiment rate.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {data.topTopics.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4">
                Analysis in progress or not enough feedback to surface topics.
              </p>
            ) : (
              <div className="space-y-4">
                {data.topTopics.map((topic) => (
                  <div key={topic.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">
                        {topic.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {topic.positivePercent}% positive ({topic.total}{' '}
                        mentions)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={
                          topic.positivePercent >= 70
                            ? 'h-full bg-emerald-500 rounded-full'
                            : topic.positivePercent >= 40
                              ? 'h-full bg-amber-500 rounded-full'
                              : 'h-full bg-rose-500 rounded-full'
                        }
                        style={{ width: `${topic.positivePercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-medium">
                Recent feedback
              </CardTitle>
              <CardDescription className="text-xs">
                Latest customer responses.
              </CardDescription>
            </div>
            <Link
              href="/reviews"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'text-xs h-8 flex items-center gap-1'
              )}
            >
              <span>View all</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="flex-1 divide-y">
            {data.recentReviews.map((review) => (
              <div
                key={review.id}
                className="py-3 first:pt-0 last:pb-0 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < review.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {review.overallSentiment && (
                      <Badge
                        variant="secondary"
                        className={`text-[10px] capitalize px-1.5 py-0 ${
                          review.overallSentiment === 'positive'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : review.overallSentiment === 'negative'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                              : review.overallSentiment === 'mixed'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {review.overallSentiment}
                      </Badge>
                    )}
                    {review.analysisStatus === 'PENDING' && (
                      <Badge
                        variant="outline"
                        className="text-[10px] text-muted-foreground gap-1 px-1.5 py-0"
                      >
                        <Clock className="h-2.5 w-2.5 animate-spin" />
                        <span>Analyzing...</span>
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="text-[11px] text-muted-foreground">
                  {review.createdAt
                    ? new Date(review.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recently'}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
