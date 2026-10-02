'use client';

import { useMemo, useState } from 'react';
import { ReviewWithAspects } from '@/lib/data/reviews';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  Filter,
  MessageSquare,
  Search,
} from 'lucide-react';
import Link from 'next/link';

const sentimentOptions = [
  { label: 'All', value: 'all' },
  { label: 'Positive', value: 'positive' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Negative', value: 'negative' },
  { label: 'Mixed', value: 'mixed' },
] as const;

const statusOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Analyzing', value: 'PENDING' },
  { label: 'Analyzed', value: 'DONE' },
  { label: 'Failed', value: 'FAILED' },
] as const;

interface ReviewsViewProps {
  initialReviews: ReviewWithAspects[];
}

export function ReviewsView({ initialReviews }: ReviewsViewProps) {
  const [selectedReview, setSelectedReview] =
    useState<ReviewWithAspects | null>(null);
  const [search, setSearch] = useState('');
  const [filterSentiment, setFilterSentiment] =
    useState<(typeof sentimentOptions)[number]['value']>('all');
  const [filterStatus, setFilterStatus] =
    useState<(typeof statusOptions)[number]['value']>('all');

  const activeFilterCount =
    Number(filterSentiment !== 'all') + Number(filterStatus !== 'all');

  const filteredReviews = useMemo(() => {
    const term = search.trim().toLowerCase();

    return initialReviews.filter((review) => {
      const matchesSentiment =
        filterSentiment === 'all' ||
        review.overallSentiment === filterSentiment;
      const matchesStatus =
        filterStatus === 'all' || review.analysisStatus === filterStatus;
      const matchesSearch =
        !term ||
        [
          review.text,
          review.campaign?.name ?? '',
          review.aspects.map((aspect) => aspect.name).join(' '),
        ]
          .join(' ')
          .toLowerCase()
          .includes(term);

      return matchesSentiment && matchesStatus && matchesSearch;
    });
  }, [filterSentiment, filterStatus, initialReviews, search]);

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search campaign feedback"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search feedback"
            className="h-10 rounded-xl border-border/50 bg-card pl-10 shadow-none"
          />
        </div>

        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2 rounded-xl px-3"
                aria-label={
                  activeFilterCount
                    ? `Feedback filters, ${activeFilterCount} active`
                    : 'Open feedback filters'
                }
              >
                <Filter aria-hidden="true" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            }
          />
          <PopoverContent
            align="end"
            className="w-80 max-w-[calc(100vw-2rem)] gap-4 rounded-xl border border-border/60 shadow-lg"
          >
            <PopoverHeader className="flex-row items-center justify-between">
              <PopoverTitle>Feedback filters</PopoverTitle>
              {activeFilterCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs text-muted-foreground"
                  onClick={() => {
                    setFilterSentiment('all');
                    setFilterStatus('all');
                  }}
                >
                  Clear
                </Button>
              )}
            </PopoverHeader>

            <fieldset className="space-y-2">
              <legend className="text-xs font-medium text-muted-foreground">
                Sentiment
              </legend>
              <div
                role="group"
                aria-label="Filter by sentiment"
                className="flex flex-wrap gap-1"
              >
                {sentimentOptions.map((option) => {
                  const isSelected = filterSentiment === option.value;
                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant={isSelected ? 'secondary' : 'ghost'}
                      size="sm"
                      aria-pressed={isSelected}
                      onClick={() => setFilterSentiment(option.value)}
                      className="h-8 px-2.5 text-xs"
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-xs font-medium text-muted-foreground">
                Analysis status
              </legend>
              <div className="space-y-1">
                {statusOptions.map((option) => {
                  const isSelected = filterStatus === option.value;
                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant={isSelected ? 'secondary' : 'ghost'}
                      size="sm"
                      aria-pressed={isSelected}
                      onClick={() => setFilterStatus(option.value)}
                      className="h-8 w-full justify-start px-2.5 text-xs"
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </fieldset>
          </PopoverContent>
        </Popover>
      </div>

      {/* Desktop Table View */}
      <div className="hidden overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-25">Rating</TableHead>
              <TableHead>Customer Feedback</TableHead>
              <TableHead className="w-30">Sentiment</TableHead>
              <TableHead className="w-32.5">Status</TableHead>
              <TableHead className="w-27.5 text-right">Date</TableHead>
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
                  <TableCell className="max-w-100">
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
                    <div className="space-y-3">
                      {selectedReview.aspects.map((aspect) => (
                        <Alert
                          key={aspect.id}
                          role="note"
                          className="items-start border-border/50 bg-muted/20 px-4 py-3"
                        >
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <AlertTitle className="font-sans text-sm font-semibold capitalize text-foreground">
                                {aspect.name}
                              </AlertTitle>
                              {getSentimentBadge(aspect.sentiment)}
                            </div>
                            {aspect.evidence && (
                              <AlertDescription className="font-serif leading-relaxed text-muted-foreground">
                                &ldquo;{aspect.evidence}&rdquo;
                              </AlertDescription>
                            )}
                          </div>
                        </Alert>
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
