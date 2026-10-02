'use client';

import { useState } from 'react';
import { ReviewWithAspects } from '@/lib/data/reviews';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import {
  getSentimentBadge,
  getStatusBadge,
} from '@/components/ui/review-badges';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Star,
  Clock,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

interface ReviewsViewProps {
  initialReviews: ReviewWithAspects[];
}

export function ReviewsView({ initialReviews }: ReviewsViewProps) {
  const [selectedReview, setSelectedReview] =
    useState<ReviewWithAspects | null>(null);
  const [filterSentiment, setFilterSentiment] = useState<string>('all');

  const filteredReviews = initialReviews.filter((r) => {
    if (filterSentiment === 'all') return true;
    if (filterSentiment === 'pending') return r.analysisStatus === 'PENDING';
    return r.overallSentiment === filterSentiment;
  });

  if (initialReviews.length === 0) {
    return (
      <div className="mx-auto my-12 flex max-w-xl flex-col items-center justify-center rounded-2xl border border-border/60 bg-card p-10 text-center shadow-sm">
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight">
          No feedback submitted yet
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 mb-6 max-w-sm">
          Once your customers submit their reviews, they will appear here along
          with extracted topics.
        </p>
        <Button>
          <Link href="/campaigns">Collect feedback</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-muted/40 p-2">
        {[
          { label: 'All', value: 'all', count: initialReviews.length },
          {
            label: 'Positive',
            value: 'positive',
            count: initialReviews.filter(
              (r) => r.overallSentiment === 'positive'
            ).length,
          },
          {
            label: 'Neutral',
            value: 'neutral',
            count: initialReviews.filter(
              (r) => r.overallSentiment === 'neutral'
            ).length,
          },
          {
            label: 'Negative',
            value: 'negative',
            count: initialReviews.filter(
              (r) => r.overallSentiment === 'negative'
            ).length,
          },
          {
            label: 'Mixed',
            value: 'mixed',
            count: initialReviews.filter((r) => r.overallSentiment === 'mixed')
              .length,
          },
        ].map((tab) => (
          <Button
            key={tab.value}
            variant={filterSentiment === tab.value ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilterSentiment(tab.value)}
            className="text-xs h-7 gap-1.5"
          >
            <span>{tab.label}</span>
            <span className="text-[10px] text-muted-foreground">
              ({tab.count})
            </span>
          </Button>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-25">Rating</TableHead>
              <TableHead>Customer Feedback</TableHead>
              <TableHead className="w-[120px]">Sentiment</TableHead>
              <TableHead className="w-[130px]">Status</TableHead>
              <TableHead className="w-[110px] text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-sm text-muted-foreground"
                >
                  No reviews match the selected filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((r) => (
                <TableRow
                  key={r.id}
                  onClick={() => setSelectedReview(r)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < r.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[400px]">
                    <p className="line-clamp-1 text-sm font-normal text-foreground">
                      {r.text}
                    </p>
                  </TableCell>
                  <TableCell>{getSentimentBadge(r.overallSentiment)}</TableCell>
                  <TableCell>{getStatusBadge(r.analysisStatus)}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {formatDate(r.createdAt, 'MMM d')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-2.5">
        {filteredReviews.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-card p-6 py-8 text-center text-sm text-muted-foreground shadow-sm">
            No reviews match the selected filter.
          </div>
        ) : (
          filteredReviews.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelectedReview(r)}
              className="space-y-2 rounded-2xl border border-border/50 bg-card p-4 shadow-sm transition-colors active:bg-muted/60 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < r.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(r.createdAt, 'MMM d')}
                </div>
              </div>
              <p className="text-sm line-clamp-2 leading-snug">
                &ldquo;{r.text}&rdquo;
              </p>
              <div className="flex items-center gap-2 pt-1">
                {getSentimentBadge(r.overallSentiment)}
                {getStatusBadge(r.analysisStatus)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Detail Dialog */}
      <Dialog
        open={!!selectedReview}
        onOpenChange={(open) => !open && setSelectedReview(null)}
      >
        {selectedReview && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between pr-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < selectedReview.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(selectedReview.createdAt, 'MMM d, yyyy')}
                </span>
              </div>
              <DialogTitle className="text-base font-semibold pt-2">
                Customer Feedback
              </DialogTitle>
              <DialogDescription className="sr-only">
                Full review details and extracted topics.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 pt-2">
              {/* Full Review Text */}
              <div className="rounded-xl border border-border/50 bg-muted/40 p-3.5 text-sm leading-relaxed">
                &ldquo;{selectedReview.text}&rdquo;
              </div>

              {/* Overall Sentiment */}
              <div className="flex items-center justify-between border-b border-border/60 py-2 text-sm">
                <span className="text-muted-foreground">
                  Overall Sentiment:
                </span>
                {getSentimentBadge(selectedReview.overallSentiment) || (
                  <span className="text-xs text-muted-foreground">Pending</span>
                )}
              </div>

              {/* Status Message if Pending or Failed */}
              {selectedReview.analysisStatus === 'PENDING' && (
                <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
                  <Clock className="h-4 w-4 animate-spin text-primary" />
                  <span>
                    Analyzing feedback... Topic extraction is in progress.
                  </span>
                </div>
              )}

              {selectedReview.analysisStatus === 'FAILED' && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-950/40">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>We couldn&apos;t analyze this feedback yet.</span>
                </div>
              )}

              {/* Extracted Topics & Evidence */}
              {selectedReview.analysisStatus === 'DONE' && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mentioned Topics & Evidence
                  </div>
                  {selectedReview.aspects.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No specific topics detected.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {selectedReview.aspects.map((aspect) => (
                        <div
                          key={aspect.id}
                          className="space-y-1.5 rounded-xl border border-border/50 bg-card p-3 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground capitalize">
                              {aspect.name}
                            </span>
                            {getSentimentBadge(aspect.sentiment)}
                          </div>
                          {aspect.evidence && (
                            <p className="text-muted-foreground italic">
                              &ldquo;{aspect.evidence}&rdquo;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
