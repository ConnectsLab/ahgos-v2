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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  getSentimentBadge,
  getStatusBadge,
} from '@/components/ui/review-badges';
import { ReviewWithAspects } from '@/lib/data/reviews';
import { ReviewDetailsDrawer } from '@/components/review-details-drawer';
import { Filter, Search, Star } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';

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

  const activeFilterCount =
    Number(campaignFilter !== 'all') + Number(sentimentFilter !== 'all');

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

        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="h-11 justify-center gap-2 rounded-2xl border-border/50 px-4 sm:justify-start"
                aria-label={
                  activeFilterCount
                    ? `Filters, ${activeFilterCount} active`
                    : 'Open review filters'
                }
              >
                <Filter className="size-4" aria-hidden="true" />
                <span>Filters</span>
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
              <PopoverTitle>Filters</PopoverTitle>
              {activeFilterCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-xs text-muted-foreground"
                  onClick={() => {
                    setCampaignFilter('all');
                    setSentimentFilter('all');
                  }}
                >
                  Clear
                </Button>
              )}
            </PopoverHeader>

            <fieldset className="space-y-2">
              <legend className="text-xs font-medium text-muted-foreground">
                Campaign
              </legend>
              <div
                role="group"
                aria-label="Filter by campaign"
                className="max-h-40 space-y-1 overflow-y-auto"
              >
                {['all', ...campaignOptions].map((campaign) => {
                  const isSelected = campaignFilter === campaign;
                  return (
                    <Button
                      key={campaign}
                      type="button"
                      variant={isSelected ? 'secondary' : 'ghost'}
                      size="sm"
                      aria-pressed={isSelected}
                      onClick={() => setCampaignFilter(campaign)}
                      className="h-8 w-full justify-start px-2.5 text-left text-xs"
                    >
                      {campaign === 'all' ? 'All campaigns' : campaign}
                    </Button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-xs font-medium text-muted-foreground">
                Sentiment
              </legend>
              <div
                role="group"
                aria-label="Filter by sentiment"
                className="flex flex-wrap gap-1.5"
              >
                {sentimentOptions.map((option) => {
                  const isSelected = sentimentFilter === option;
                  return (
                    <Button
                      key={option}
                      type="button"
                      variant={isSelected ? 'secondary' : 'ghost'}
                      size="sm"
                      aria-pressed={isSelected}
                      onClick={() => setSentimentFilter(option)}
                      className="h-8 px-2.5 text-xs capitalize"
                    >
                      {option === 'all' ? 'All' : option}
                    </Button>
                  );
                })}
              </div>
            </fieldset>
          </PopoverContent>
        </Popover>
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
                    <ReviewDetailsDrawer review={review} />
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

                <ReviewDetailsDrawer review={review} />
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
