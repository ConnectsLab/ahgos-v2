'use client';

import { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import {
  getSentimentBadge,
  getStatusBadge,
} from '@/components/ui/review-badges';
import { Button } from '@/components/ui/button';
import { ReviewWithAspects } from '@/lib/data/reviews';
import { formatDate } from '@/lib/utils';
import { ChevronDown, MoreHorizontal, Search, Star, X } from 'lucide-react';

const sentimentOptions = [
  'all',
  'positive',
  'neutral',
  'negative',
  'mixed',
] as const;

export function ReviewsTable({ reviews }: { reviews: ReviewWithAspects[] }) {
  const [search, setSearch] = useState('');
  const [sentimentFilter, setSentimentFilter] =
    useState<(typeof sentimentOptions)[number]>('all');
  const [campaignFilter, setCampaignFilter] = useState('all');

  const campaignOptions = useMemo(
    () =>
      Array.from(
        new Set(
          reviews
            .map((review) => review.campaign?.name)
            .filter((name): name is string => Boolean(name))
        )
      ).sort((a, b) => a.localeCompare(b)),
    [reviews]
  );

  const filteredReviews = useMemo(() => {
    const term = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesSentiment =
        sentimentFilter === 'all' ||
        review.overallSentiment === sentimentFilter;

      const matchesCampaign =
        campaignFilter === 'all' || review.campaign?.name === campaignFilter;

      if (!matchesSentiment || !matchesCampaign) return false;

      if (!term) return true;

      const haystack = [
        review.text,
        review.campaign?.name ?? '',
        review.aspects.map((aspect) => aspect.name).join(' '),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [campaignFilter, reviews, search, sentimentFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-border/60 pb-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search reviews"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search reviews"
            className="h-11 rounded-2xl border-border/50 bg-card pl-10 text-sm shadow-none placeholder:text-muted-foreground/75 focus-visible:ring-2 focus-visible:ring-ring/20"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div className="relative min-w-40">
            <select
              value={campaignFilter}
              onChange={(event) => setCampaignFilter(event.target.value)}
              className="h-11 w-full appearance-none rounded-2xl border border-border/50 bg-card px-3.5 pr-9 text-sm text-foreground shadow-none outline-none transition focus:border-ring/40 focus:ring-2 focus:ring-ring/20"
              aria-label="Filter by campaign"
            >
              <option value="all">All campaigns</option>
              {campaignOptions.map((campaign) => (
                <option key={campaign} value={campaign}>
                  {campaign}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          <div className="relative min-w-40">
            <select
              value={sentimentFilter}
              onChange={(event) =>
                setSentimentFilter(
                  event.target.value as (typeof sentimentOptions)[number]
                )
              }
              className="h-11 w-full appearance-none rounded-2xl border border-border/50 bg-card px-3.5 pr-9 text-sm text-foreground shadow-none outline-none transition focus:border-ring/40 focus:ring-2 focus:ring-ring/20"
              aria-label="Filter by sentiment"
            >
              {sentimentOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All sentiments' : option}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="hidden border-b border-border/50 md:block">
        <Table>
          <TableHeader className="bg-transparent">
            <TableRow>
              <TableHead className="w-25 text-[10px] font-semibold uppercase text-muted-foreground">
                Rating
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase text-muted-foreground">
                Review
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase text-muted-foreground">
                Campaign
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase text-muted-foreground">
                Sentiment
              </TableHead>
              <TableHead className="text-right text-[10px] font-semibold uppercase text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No reviews match your search or filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-100">
                    <p className="line-clamp-2 font-serif text-[15px] leading-snug text-foreground">
                      {review.text}
                    </p>
                  </TableCell>
                  <TableCell>{review.campaign?.name ?? '—'}</TableCell>
                  <TableCell className="line-clamp-1 md:w-25">
                    {getSentimentBadge(review.overallSentiment)}
                  </TableCell>
                  <TableCell className="text-right">
                    {getStatusBadge(review.analysisStatus)}
                  </TableCell>

                  <TableCell className="text-right">
                    <Drawer>
                      <DrawerTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Open review details for ${review.campaign?.name ?? 'campaign'}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      />

                      <DrawerContent className="sm:max-w-md">
                        <DrawerHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <DrawerTitle className="text-base font-semibold">
                                Review details
                              </DrawerTitle>
                              <DrawerDescription className="mt-1 text-xs text-muted-foreground">
                                {review.campaign?.name ?? 'Unassigned event'}
                              </DrawerDescription>
                            </div>

                            <DrawerClose
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Close drawer"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              }
                            />
                          </div>
                        </DrawerHeader>

                        <div className="space-y-4 overflow-y-auto px-4 pb-4">
                          <div className="rounded-xl border border-border/50 bg-muted/40 p-3">
                            <div className="mb-2 flex items-center justify-between gap-3">
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
                              <span className="text-xs text-muted-foreground">
                                {formatDate(review.createdAt, 'MMM d, yyyy')}
                              </span>
                            </div>

                            <p className="text-sm leading-relaxed text-foreground">
                              “{review.text}”
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                              Overall sentiment
                            </div>
                            {getSentimentBadge(review.overallSentiment)}
                          </div>

                          <div className="space-y-2">
                            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                              Event name
                            </div>
                            <div className="rounded-xl border border-border/50 bg-background/70 px-3 py-2 text-sm text-foreground">
                              {review.campaign?.name ?? 'No campaign assigned'}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                              Status
                            </div>
                            {getStatusBadge(review.analysisStatus)}
                          </div>

                          <div className="space-y-2">
                            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                              What customers are talking about
                            </div>

                            {review.aspects.length === 0 ? (
                              <div className="rounded-xl border border-border/50 bg-muted/30 p-3 text-sm text-muted-foreground">
                                No extracted topics available for this review.
                              </div>
                            ) : (
                              <div className="space-y-2.5">
                                {review.aspects.map((aspect) => (
                                  <div
                                    key={aspect.id}
                                    className="rounded-xl border border-border/50 bg-card p-3 text-xs"
                                  >
                                    <div className="mb-1 flex items-center justify-between gap-3">
                                      <span className="font-semibold capitalize text-foreground">
                                        {aspect.name}
                                      </span>
                                      {getSentimentBadge(aspect.sentiment)}
                                    </div>
                                    <p className="text-muted-foreground italic">
                                      “{aspect.evidence}”
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </DrawerContent>
                    </Drawer>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="divide-y divide-border/60 md:hidden">
        {filteredReviews.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No reviews match your search or filter.
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="py-4 first:pt-1">
              <div className="mb-2 flex items-start justify-between gap-3">
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

                <Drawer>
                  <DrawerTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Open review details for ${review.campaign?.name ?? 'campaign'}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    }
                  />

                  <DrawerContent className="sm:max-w-md">
                    <DrawerHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <DrawerTitle className="text-base font-semibold">
                            Review details
                          </DrawerTitle>
                          <DrawerDescription className="mt-1 text-xs text-muted-foreground">
                            {review.campaign?.name ?? 'Unassigned event'}
                          </DrawerDescription>
                        </div>

                        <DrawerClose
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Close drawer"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                    </DrawerHeader>

                    <div className="space-y-4 overflow-y-auto px-4 pb-4">
                      <div className="rounded-xl border border-border/50 bg-muted/40 p-3">
                        <div className="mb-2 flex items-center justify-between gap-3">
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
                          <span className="text-xs text-muted-foreground">
                            {formatDate(review.createdAt, 'MMM d, yyyy')}
                          </span>
                        </div>

                        <p className="text-sm leading-relaxed text-foreground">
                          “{review.text}”
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          Overall sentiment
                        </div>
                        {getSentimentBadge(review.overallSentiment)}
                      </div>

                      <div className="space-y-2">
                        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          Event name
                        </div>
                        <div className="rounded-xl border border-border/50 bg-background/70 px-3 py-2 text-sm text-foreground">
                          {review.campaign?.name ?? 'No campaign assigned'}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          Status
                        </div>
                        {getStatusBadge(review.analysisStatus)}
                      </div>

                      <div className="space-y-2">
                        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          What customers are talking about
                        </div>

                        {review.aspects.length === 0 ? (
                          <div className="rounded-xl border border-border/50 bg-muted/30 p-3 text-sm text-muted-foreground">
                            No extracted topics available for this review.
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {review.aspects.map((aspect) => (
                              <div
                                key={aspect.id}
                                className="rounded-xl border border-border/50 bg-card p-3 text-xs"
                              >
                                <div className="mb-1 flex items-center justify-between gap-3">
                                  <span className="font-semibold capitalize text-foreground">
                                    {aspect.name}
                                  </span>
                                  {getSentimentBadge(aspect.sentiment)}
                                </div>
                                <p className="text-muted-foreground italic">
                                  “{aspect.evidence}”
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>

              <p className="font-serif text-base leading-relaxed text-foreground">
                “{review.text}”
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {getSentimentBadge(review.overallSentiment)}
                {getStatusBadge(review.analysisStatus)}
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                {review.campaign?.name ?? 'No campaign assigned'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
