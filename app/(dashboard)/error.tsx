'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="mx-auto my-12 max-w-md space-y-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center shadow-sm">
      <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
        <AlertCircle className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">
          Something went wrong
        </h2>
        <p className="text-xs text-muted-foreground">
          We encountered an issue loading your data. Please try again.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => reset()}
        className="gap-2 text-xs"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        <span>Try again</span>
      </Button>
    </div>
  );
}
