'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  Copy,
  ExternalLink,
  Plus,
  Search,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { CampaignSummary } from '@/lib/data/campaigns';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

interface CreatedCampaign {
  name: string;
  slug: string;
}

export function CampaignsView({ campaigns }: { campaigns: CampaignSummary[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [createdCampaign, setCreatedCampaign] =
    useState<CreatedCampaign | null>(null);

  const filteredCampaigns = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return campaigns;

    return campaigns.filter((campaign) =>
      `${campaign.name} ${campaign.slug}`.toLowerCase().includes(term)
    );
  }, [campaigns, search]);

  const totalReviews = campaigns.reduce(
    (total, campaign) => total + campaign.reviewCount,
    0
  );

  function handleDialogChange(open: boolean) {
    setCreateOpen(open);
    if (!open) {
      setCampaignName('');
      setCampaignError(null);
      setCreatedCampaign(null);
    }
  }

  async function copyCampaignLink(slug: string) {
    const url = `${window.location.origin}/r/c/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied', { description: url });
    } catch {
      toast.error('Could not copy link', {
        description: 'Copy the campaign URL from the preview instead.',
      });
    }
  }

  async function createCampaign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = campaignName.trim();
    if (!trimmedName || isCreating) return;

    setIsCreating(true);
    setCampaignError(null);
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName }),
      });
      const result = (await response.json()) as {
        error?: string;
        campaign?: CreatedCampaign;
      };

      if (!response.ok || !result.campaign) {
        throw new Error(result.error ?? 'Could not create campaign.');
      }

      setCreatedCampaign(result.campaign);
      router.refresh();
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : 'Could not create campaign.';
      setCampaignError(message);
      toast.error('Could not create campaign', { description: message });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Dialog open={createOpen} onOpenChange={handleDialogChange}>
      <div className="space-y-7">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-medium leading-tight text-foreground md:text-4xl">
              Campaigns
            </h1>
            <p className="text-sm text-muted-foreground">
              Create feedback links and track the reviews they bring in.
            </p>
          </div>
          <p className="text-sm text-muted-foreground sm:text-right">
            <span className="font-medium text-foreground">
              {campaigns.length}
            </span>{' '}
            {campaigns.length === 1 ? 'campaign' : 'campaigns'}
            <span className="px-2 text-border">/</span>
            <span className="font-medium text-foreground">
              {totalReviews}
            </span>{' '}
            {totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </header>

        <div className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search campaigns"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search campaigns"
              className="h-10 rounded-xl border-border/50 bg-card pl-10 shadow-none"
            />
          </div>

          <DialogTrigger
            render={
              <Button type="button" className="h-10 gap-2 rounded-xl px-4">
                <Plus aria-hidden="true" />
                New campaign
              </Button>
            }
          />
        </div>

        {campaigns.length === 0 ? (
          <div className="py-14 text-center">
            <h2 className="font-heading text-xl font-medium text-foreground">
              Start collecting campaign feedback
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Create a link for an event, service, or promotion. Reviews sent
              through it will be grouped here.
            </p>
            <DialogTrigger
              render={
                <Button type="button" className="mt-5 gap-2 rounded-xl px-4">
                  <Plus aria-hidden="true" />
                  Create your first campaign
                </Button>
              }
            />
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No campaigns match “{search.trim()}”.
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => setSearch('')}
            >
              Clear search
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden border-b border-border/50 md:block">
              <Table>
                <TableHeader className="bg-transparent">
                  <TableRow>
                    <TableHead className="text-xs text-muted-foreground">
                      Campaign
                    </TableHead>
                    <TableHead className="w-28 text-right text-xs text-muted-foreground">
                      Reviews
                    </TableHead>
                    <TableHead className="w-32 text-right text-xs text-muted-foreground">
                      Average rating
                    </TableHead>
                    <TableHead className="w-36 text-right text-xs text-muted-foreground">
                      Created
                    </TableHead>
                    <TableHead className="w-28 text-right" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <Link
                            href={`/campaigns/${campaign.id}`}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {campaign.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {campaign.topics.length > 0
                              ? campaign.topics.join(' · ')
                              : `/r/c/${campaign.slug}`}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {campaign.reviewCount}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {campaign.averageRating === null ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span className="inline-flex items-center justify-end gap-1">
                            {campaign.averageRating}
                            <Star
                              aria-hidden="true"
                              className="size-3.5 fill-amber-400 text-amber-400"
                            />
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDate(campaign.createdAt, 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <CampaignActions
                          campaign={campaign}
                          onCopy={copyCampaignLink}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="divide-y divide-border/60 md:hidden">
              {filteredCampaigns.map((campaign) => (
                <article
                  key={campaign.id}
                  className="space-y-3 py-4 first:pt-1"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {campaign.name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        /r/c/{campaign.slug}
                      </p>
                    </div>
                    <CampaignActions
                      campaign={campaign}
                      onCopy={copyCampaignLink}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      {campaign.reviewCount}{' '}
                      {campaign.reviewCount === 1 ? 'review' : 'reviews'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      {campaign.averageRating ?? '—'}
                      {campaign.averageRating !== null && (
                        <Star
                          aria-hidden="true"
                          className="size-3 fill-amber-400 text-amber-400"
                        />
                      )}
                    </span>
                    <span>{formatDate(campaign.createdAt, 'MMM d, yyyy')}</span>
                  </div>
                  {campaign.topics.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {campaign.topics.join(' · ')}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      <DialogContent className="sm:max-w-lg">
        {createdCampaign ? (
          <>
            <DialogHeader>
              <DialogTitle>Your campaign link is ready</DialogTitle>
              <DialogDescription>
                Share this link to collect reviews for {createdCampaign.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="break-all rounded-lg bg-muted/45 px-3 py-2 font-mono text-xs text-muted-foreground">
              {typeof window === 'undefined'
                ? `/r/c/${createdCampaign.slug}`
                : `${window.location.origin}/r/c/${createdCampaign.slug}`}
            </div>
            <DialogFooter className="sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => copyCampaignLink(createdCampaign.slug)}
                >
                  <Copy aria-hidden="true" />
                  Copy link
                </Button>
                <a
                  href={`/r/c/${createdCampaign.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Preview <ExternalLink aria-hidden="true" />
                </a>
              </div>
              <Button type="button" onClick={() => handleDialogChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create a campaign</DialogTitle>
              <DialogDescription>
                Give this feedback link a name customers will recognize.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createCampaign} className="space-y-4">
              <Input
                autoFocus
                aria-label="Campaign name"
                value={campaignName}
                onChange={(event) => setCampaignName(event.target.value)}
                placeholder="e.g. Spring Launch"
                maxLength={120}
                disabled={isCreating}
                required
              />
              {campaignError && (
                <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {campaignError}
                </p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleDialogChange(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || !campaignName.trim()}
                >
                  {isCreating ? 'Creating…' : 'Create campaign'}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CampaignActions({
  campaign,
  onCopy,
}: {
  campaign: Pick<CampaignSummary, 'id' | 'slug'>;
  onCopy: (slug: string) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Copy campaign link"
        title="Copy campaign link"
        onClick={() => onCopy(campaign.slug)}
      >
        <Copy aria-hidden="true" />
      </Button>
      <a
        href={`/r/c/${campaign.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Preview campaign feedback form"
        title="Preview campaign feedback form"
        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ExternalLink aria-hidden="true" className="size-4" />
      </a>
      <Link
        href={`/campaigns/${campaign.id}`}
        aria-label="Open campaign details"
        title="Open campaign details"
        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ArrowUpRight aria-hidden="true" className="size-4" />
      </Link>
    </div>
  );
}
