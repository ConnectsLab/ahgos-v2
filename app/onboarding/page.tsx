'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/toast';

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type: type.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      toast.success('Workspace created', {
        description: `${name.trim()} is ready to collect feedback.`,
      });
      router.push('/dashboard');
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Could not create your business.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:flex sm:items-center sm:justify-center">
      <section className="w-full max-w-xl rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-9">
        <p className="text-sm text-muted-foreground">Ahgos setup · 1 of 1</p>
        <h1 className="mt-8 text-3xl font-medium tracking-tight">
          Tell us about your business.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This is what customers will see when they open a feedback link.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="business-name">Business name</Label>
            <Input
              id="business-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. The Garden Events"
              autoComplete="organization"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-type">
              Business type{' '}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="business-type"
              value={type}
              onChange={(event) => setType(event.target.value)}
              placeholder="e.g. Event planning"
              disabled={isSubmitting}
            />
          </div>
          <Button
            type="submit"
            className="mt-2 w-full"
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? (
              <>
                <Spinner /> Creating workspace...
              </>
            ) : (
              'Continue to Ahgos'
            )}
          </Button>
        </form>
      </section>
    </main>
  );
}
