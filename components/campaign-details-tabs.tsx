'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Info, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewsView } from '@/components/reviews-view';
import type { ReviewWithAspects } from '@/lib/data/reviews';
import {
  CampaignInsightsSchema,
  type CampaignInsights,
} from '@/lib/schema/campaign-insights-schema';

interface CampaignDetailsTabsProps {
  campaignId: number;
  reviews: ReviewWithAspects[];
}

export function CampaignDetailsTabs({
  campaignId,
  reviews,
}: CampaignDetailsTabsProps) {
  const hasAnalyzedReviews = reviews.some(
    (review) => review.overallSentiment !== null
  );
  const hasPendingReviews = reviews.some(
    (review) => review.analysisStatus === 'PENDING'
  );
  const hasFailedReviews = reviews.some(
    (review) => review.analysisStatus === 'FAILED'
  );

  return (
    <Tabs defaultValue="feedback" className="space-y-5">
      <TabsList
        variant="line"
        className="w-full justify-start gap-5 border-b border-border/60 p-0"
      >
        <TabsTrigger value="feedback" className="flex-none rounded-none px-0">
          Customer feedback
        </TabsTrigger>
        <TabsTrigger value="insights" className="flex-none rounded-none px-0">
          <Sparkles aria-hidden="true" />
          Insights
        </TabsTrigger>
      </TabsList>

      <TabsContent value="feedback" className="mt-0">
        <ReviewsView initialReviews={reviews} />
      </TabsContent>
      <TabsContent value="insights" className="mt-0">
        <CampaignInsightsPanel
          campaignId={campaignId}
          hasReviews={reviews.length > 0}
          hasAnalyzedReviews={hasAnalyzedReviews}
          hasPendingReviews={hasPendingReviews}
          hasFailedReviews={hasFailedReviews}
        />
      </TabsContent>
    </Tabs>
  );
}

function CampaignInsightsPanel({
  campaignId,
  hasReviews,
  hasAnalyzedReviews,
  hasPendingReviews,
  hasFailedReviews,
}: {
  campaignId: number;
  hasReviews: boolean;
  hasAnalyzedReviews: boolean;
  hasPendingReviews: boolean;
  hasFailedReviews: boolean;
}) {
  const [insights, setInsights] = useState<CampaignInsights | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState(false);
  const storageKey = `ahgos:campaign-insights:${campaignId}`;

  useEffect(() => {
    setInsights(null);
    setStorageWarning(false);

    try {
      const cachedInsights = window.localStorage.getItem(storageKey);
      if (!cachedInsights) return;

      const parsedInsights = CampaignInsightsSchema.safeParse(
        JSON.parse(cachedInsights)
      );
      if (parsedInsights.success) {
        setInsights(parsedInsights.data);
      } else {
        window.localStorage.removeItem(storageKey);
      }
    } catch {
      setStorageWarning(true);
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        setInsights(null);
      }
    }
  }, [storageKey]);

  async function generateInsights() {
    if (isGenerating || !hasAnalyzedReviews) return;

    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/insights`, {
        method: 'POST',
      });
      const result = (await response.json()) as {
        error?: string;
        insights?: CampaignInsights;
      };

      if (!response.ok || !result.insights) {
        throw new Error(
          result.error ?? 'Could not generate campaign insights.'
        );
      }

      setInsights(result.insights);
      try {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify(result.insights)
        );
        setStorageWarning(false);
      } catch {
        setStorageWarning(true);
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Could not generate campaign insights.'
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl space-y-2">
          <h2 className="font-heading text-xl font-medium text-foreground">
            Campaign insights
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Generate a summary of what customers liked, what needs attention,
            and patterns that stood out.
          </p>
        </div>
        <Button
          type="button"
          onClick={generateInsights}
          disabled={isGenerating || !hasAnalyzedReviews}
          className="shrink-0 gap-2"
        >
          {isGenerating ? (
            <>
              <Spinner />
              Generating insights
            </>
          ) : (
            <>
              <Sparkles aria-hidden="true" />
              {insights ? 'Regenerate insights' : 'Generate insights'}
            </>
          )}
        </Button>
      </div>

      {!hasReviews ? (
        <p className="py-8 text-sm text-muted-foreground">
          Insights will be available after this campaign receives feedback.
        </p>
      ) : !hasAnalyzedReviews && hasPendingReviews && hasFailedReviews ? (
        <p className="py-8 text-sm text-muted-foreground">
          Some reviews are still being analyzed, and others could not be
          analyzed. Insights will be available when at least one review has
          completed analysis.
        </p>
      ) : !hasAnalyzedReviews && hasPendingReviews ? (
        <p className="py-8 text-sm text-muted-foreground">
          Reviews are still being analyzed. Insights can be generated once
          analysis is complete.
        </p>
      ) : !hasAnalyzedReviews && hasFailedReviews ? (
        <p className="py-8 text-sm text-muted-foreground">
          No reviews have completed analysis yet. Insights are unavailable
          because analysis failed for this campaign&apos;s reviews.
        </p>
      ) : !hasAnalyzedReviews ? (
        <p className="py-8 text-sm text-muted-foreground">
          No analyzed review data is available for this campaign yet.
        </p>
      ) : null}

      {error && (
        <Alert variant="destructive" className="items-start">
          <AlertCircle aria-hidden="true" />
          <div className="space-y-1">
            <AlertTitle>Unable to generate insights</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </div>
        </Alert>
      )}

      {storageWarning && (
        <Alert role="status" className="items-start">
          <Info aria-hidden="true" />
          <div className="space-y-1">
            <AlertTitle>Insight is not saved on this device</AlertTitle>
            <AlertDescription>
              Your browser could not access local storage. The generated insight
              will remain visible until you leave this page.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {insights && (
        <div className="space-y-8">
          <Alert
            role="note"
            className="items-start border-primary/25 bg-primary/5 px-5 py-5"
          >
            <Sparkles aria-hidden="true" className="text-primary" />
            <div className="space-y-2">
              <AlertTitle className="font-heading text-xl font-medium">
                Campaign summary
              </AlertTitle>
              <AlertDescription className="max-w-3xl text-base leading-relaxed text-foreground">
                {insights.summary}
              </AlertDescription>
            </div>
          </Alert>

          <div className="max-w-4xl space-y-8">
            <InsightCategory
              title="What went well"
              items={insights.whatWentWell}
              tone="positive"
            />
            <InsightCategory
              title="Needs attention"
              items={insights.needsAttention}
              tone="attention"
            />
            <InsightCategory
              title="What stood out"
              items={insights.whatStoodOut}
              tone="notable"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InsightCategory({
  title,
  items,
  tone,
}: {
  title: string;
  items: CampaignInsights['whatWentWell'];
  tone: 'positive' | 'attention' | 'notable';
}) {
  const toneClasses = {
    positive: 'border-emerald-600/20 bg-emerald-50/70 dark:bg-emerald-950/20',
    attention: 'border-amber-600/25 bg-amber-50/70 dark:bg-amber-950/20',
    notable: 'border-primary/20 bg-primary/5',
  }[tone];

  return (
    <section className="space-y-4 border-t border-border/60 pt-6">
      <h3 className="font-heading text-2xl font-medium leading-tight text-foreground">
        {title}
      </h3>
      {items.length === 0 ? (
        <Alert role="note" className="border-border/50 bg-muted/25">
          <AlertDescription>
            No clear pattern identified in this category.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <Alert
              key={`${item.topic}-${index}`}
              role="note"
              className={`items-start p-4 ${toneClasses}`}
            >
              <div className="space-y-2">
                <AlertTitle className="font-sans text-base font-semibold capitalize text-foreground">
                  {item.topic}
                </AlertTitle>
                <AlertDescription className="text-sm leading-relaxed text-foreground/85">
                  {item.insight}
                </AlertDescription>
                {item.evidence.length > 0 && (
                  <ul className="space-y-1 border-l-2 border-current/20 pl-3 pt-1">
                    {item.evidence.map((evidence, evidenceIndex) => (
                      <li
                        key={`${evidence}-${evidenceIndex}`}
                        className="font-serif text-sm leading-relaxed text-muted-foreground"
                      >
                        “{evidence}”
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Alert>
          ))}
        </div>
      )}
    </section>
  );
}
