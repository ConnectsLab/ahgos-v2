'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Copy,
  Check,
  ExternalLink,
  MessageSquareQuote,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

interface CollectFeedbackViewProps {
  business: {
    id: number;
    name: string;
    slug: string;
  };
  campaigns: {
    id: number;
    name: string;
    slug: string;
    createdAt: Date;
  }[];
}

export function CollectFeedbackView({ campaigns }: CollectFeedbackViewProps) {
  const router = useRouter();
  const [campaignName, setCampaignName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [campaignError, setCampaignError] = useState<string | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  async function createCampaign(event: React.FormEvent) {
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
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setCampaignName('');
      toast.success('Campaign created', {
        description: `Campaign "${trimmedName}" is ready to collect reviews.`,
      });
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
    <div className="max-w-2xl space-y-6">
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Campaign links</CardTitle>
          <CardDescription>
            Create a separate link for an event, service, or promotion. Feedback
            submitted through it stays grouped with that campaign.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form
            onSubmit={createCampaign}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <Input
              value={campaignName}
              onChange={(event) => setCampaignName(event.target.value)}
              placeholder="e.g. Splash Night"
              disabled={isCreating}
              maxLength={120}
            />
            <Button
              type="submit"
              disabled={isCreating || !campaignName.trim()}
              className="shrink-0 gap-2"
            >
              <Plus className="h-4 w-4" />
              {isCreating ? 'Creating...' : 'Create campaign'}
            </Button>
          </form>
          {campaignError && (
            <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {campaignError}
            </p>
          )}
          {campaigns.length === 0 ? (
            <p className="rounded-xl border border-border/50 bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
              No campaigns yet. Create one when you need feedback for a specific
              event or activity.
            </p>
          ) : (
            <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/50 bg-background/50">
              {campaigns.map((campaign) => {
                const url = `${origin}/r/c/${campaign.slug}`;
                return (
                  <div
                    key={campaign.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="mt-1 font-sans text-xs text-muted-foreground">
                        /r/c/{campaign.slug}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          await navigator.clipboard.writeText(url);
                          toast.success('Link copied to clipboard', {
                            description: url,
                          });
                        }}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        Copy link
                      </Button>
                      <a
                        href={`/r/c/${campaign.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(buttonVariants({ size: 'sm' }), 'gap-2')}
                      >
                        Preview <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-muted/30 shadow-none">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary font-medium text-sm">
            <MessageSquareQuote className="h-4 w-4" />
            <span>How it works for your customers</span>
          </div>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2 leading-relaxed">
          <p>1. Customers open your link on their phone or computer.</p>
          <p>
            2. They select a star rating and type their thoughts. No account or
            login is required for them.
          </p>
          <p>
            3. Their review is automatically analyzed and appears directly on
            your Dashboard and Reviews list.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
