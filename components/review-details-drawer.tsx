'use client';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import {
  getSentimentBadge,
  getStatusBadge,
} from '@/components/ui/review-badges';
import type { ReviewWithAspects } from '@/lib/data/reviews';
import { formatDate } from '@/lib/utils';
import { MoreHorizontal, Star, X } from 'lucide-react';

export function ReviewDetailsDrawer({ review }: { review: ReviewWithAspects }) {
  return (
    <Drawer>
      <DrawerTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Open review details for ${review.campaign?.name ?? 'campaign'}`}
          >
            <MoreHorizontal aria-hidden="true" />
          </Button>
        }
      />

      <DrawerContent className="h-[88dvh] max-h-[calc(100dvh-2rem)] sm:max-w-lg">
        <DrawerHeader className="shrink-0 border-b border-border/50 px-5 pb-4 text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DrawerTitle className="text-lg font-medium">
                Review details
              </DrawerTitle>
              <DrawerDescription className="mt-1 text-xs">
                {review.campaign?.name ?? 'Unassigned event'}
              </DrawerDescription>
            </div>

            <DrawerClose
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close review details"
                >
                  <X aria-hidden="true" />
                </Button>
              }
            />
          </div>
        </DrawerHeader>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div
                className="flex items-center gap-1"
                aria-label={`${review.rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    aria-hidden="true"
                    className={`h-4 w-4 ${
                      index < review.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDate(review.createdAt, 'MMM d, yyyy')}
              </span>
            </div>
            <blockquote className="rounded-xl bg-muted/45 p-4 font-serif text-lg leading-relaxed text-foreground">
              “{review.text}”
            </blockquote>
          </section>

          <section className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground">
                Sentiment
              </h3>
              {getSentimentBadge(review.overallSentiment)}
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground">
                Analysis status
              </h3>
              {getStatusBadge(review.analysisStatus)}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground">
              Campaign
            </h3>
            <p className="text-sm text-foreground">
              {review.campaign?.name ?? 'No campaign assigned'}
            </p>
          </section>

          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-foreground">
                What customers are talking about
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Topics and sentiment detected in this review.
              </p>
            </div>

            {review.aspects.length === 0 ? (
              <div className="rounded-xl bg-muted/35 p-4 text-sm text-muted-foreground">
                No extracted topics available for this review.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {review.aspects.map((aspect) => (
                  <article
                    key={aspect.id}
                    className="space-y-2 py-3 first:pt-0"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-medium capitalize text-foreground">
                        {aspect.name}
                      </h4>
                      {getSentimentBadge(aspect.sentiment)}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      “{aspect.evidence}”
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
