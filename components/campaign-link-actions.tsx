'use client';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { Copy, ExternalLink } from 'lucide-react';

export function CampaignLinkActions({ slug }: { slug: string }) {
  const feedbackPath = `/r/c/${slug}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${feedbackPath}`
      );
      toast.success('Feedback link copied');
    } catch {
      toast.error('Could not copy feedback link');
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={copyLink}>
        <Copy aria-hidden="true" />
        Copy link
      </Button>
      <a
        href={feedbackPath}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        Preview <ExternalLink aria-hidden="true" className="size-3.5" />
      </a>
    </div>
  );
}
