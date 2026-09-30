'use client';

import { useState } from 'react';
import { ReviewWithAspects } from '@/lib/data/reviews';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

  function getSentimentBadge(sentiment: string | null) {
    if (!sentiment) return null;
    switch (sentiment) {
      case 'positive':
        return (
          <Badge
            variant="default"
            className="text-[11px] capitalize bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            Positive
          </Badge>
        );
      case 'negative':
        return (
          <Badge
            variant="default"
            className="text-[11px] capitalize bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
          >
            Negative
          </Badge>
        );
      case 'neutral':
        return (
          <Badge variant="default" className="text-[11px] capitalize">
            Neutral
          </Badge>
        );
      case 'mixed':
        return (
          <Badge
            variant="default"
            className="text-[11px] capitalize bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
          >
            Mixed
          </Badge>
        );
      default:
        return <Badge variant="default">{sentiment}</Badge>;
    }
  }

  function getStatusBadge(status: 'DONE' | 'PENDING' | 'FAILED') {
    switch (status) {
      case 'PENDING':
        return (
          <Badge
            variant="outline"
            className="text-[11px] text-muted-foreground gap-1"
          >
            <Clock className="h-3 w-3 animate-spin" />
            <span>Analyzing...</span>
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge
            variant="outline"
            className="text-[11px] text-rose-600 border-rose-200 gap-1"
          >
            <AlertCircle className="h-3 w-3" />
            <span>Analysis failed</span>
          </Badge>
        );
      case 'DONE':
        return (
          <Badge
            variant="outline"
            className="text-[11px] text-muted-foreground gap-1 border-emerald-200"
          >
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>Analyzed</span>
          </Badge>
        );
    }
  }

  if (initialReviews.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-12 bg-card">
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
          <Link href="/collect">Collect feedback</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b pb-3">
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
      <div className="hidden md:block rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Rating</TableHead>
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
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
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
          <div className="text-center py-8 text-sm text-muted-foreground border rounded-md p-6">
            No reviews match the selected filter.
          </div>
        ) : (
          filteredReviews.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelectedReview(r)}
              className="p-3.5 border rounded-lg bg-card active:bg-muted/60 transition-colors space-y-2 cursor-pointer"
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
                  {r.createdAt
                    ? new Date(r.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—'}
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
                  {selectedReview.createdAt
                    ? new Date(selectedReview.createdAt).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }
                      )
                    : '—'}
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
              <div className="rounded-md bg-muted/40 p-3.5 text-sm leading-relaxed border">
                &ldquo;{selectedReview.text}&rdquo;
              </div>

              {/* Overall Sentiment */}
              <div className="flex items-center justify-between text-sm py-1 border-b">
                <span className="text-muted-foreground">
                  Overall Sentiment:
                </span>
                {getSentimentBadge(selectedReview.overallSentiment) || (
                  <span className="text-xs text-muted-foreground">Pending</span>
                )}
              </div>

              {/* Status Message if Pending or Failed */}
              {selectedReview.analysisStatus === 'PENDING' && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 p-3 rounded-md">
                  <Clock className="h-4 w-4 animate-spin text-primary" />
                  <span>
                    Analyzing feedback... Topic extraction is in progress.
                  </span>
                </div>
              )}

              {selectedReview.analysisStatus === 'FAILED' && (
                <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-md">
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
                          className="rounded-md border p-3 text-xs space-y-1.5 bg-card"
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
