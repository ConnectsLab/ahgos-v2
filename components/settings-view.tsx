'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, Check, LogOut } from 'lucide-react';
import { toast } from '@/components/ui/toast';

interface SettingsViewProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  business: {
    id: number;
    name: string;
    slug: string;
    type: string | null;
  };
}

export function SettingsView({ user, business }: SettingsViewProps) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(business.name);
  const [businessType, setBusinessType] = useState(business.type ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSaveBusiness(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim() || isSaving) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/business', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: businessName.trim(),
          type: businessType.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update business details');
      }

      setSavedSuccess(true);
      toast.success('Settings saved', {
        description: 'Business profile has been updated.',
      });
      router.refresh();
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch {
      const err = 'Could not update business details. Please try again.';
      setErrorMessage(err);
      toast.error('Update failed', { description: err });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push('/sign-in');
      router.refresh();
    } catch {
      setIsSigningOut(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-12">
      <section className="max-w-2xl space-y-7 border-b border-border/60 pb-10">
        <div className="space-y-3">
          <h2 className="font-heading text-2xl font-medium text-foreground">
            Business profile
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            This information appears on your customer feedback forms.
          </p>
        </div>

        <form onSubmit={handleSaveBusiness} className="space-y-7">
          {errorMessage && (
            <Alert variant="destructive" className="items-start">
              <AlertCircle aria-hidden="true" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Label htmlFor="business-name">Business name</Label>
            <Input
              id="business-name"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              disabled={isSaving}
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="business-type">Business type</Label>
            <Input
              id="business-type"
              value={businessType}
              onChange={(event) => setBusinessType(event.target.value)}
              placeholder="e.g. Event planning"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="business-slug">Feedback slug</Label>
            <Input
              id="business-slug"
              value={business.slug}
              readOnly
              disabled
              className="bg-muted/35 font-sans text-xs"
            />
            <p className="text-xs text-muted-foreground">
              This identifier is used in your feedback URLs.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6">
            <span aria-live="polite" className="text-xs text-muted-foreground">
              {savedSuccess && (
                <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                  <Check aria-hidden="true" className="size-3.5" />
                  Changes saved
                </span>
              )}
            </span>
            <Button
              type="submit"
              disabled={
                isSaving ||
                (businessName.trim() === business.name &&
                  businessType.trim() === (business.type ?? ''))
              }
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Saving
                </span>
              ) : (
                'Save changes'
              )}
            </Button>
          </div>
        </form>
      </section>

      <section className="max-w-2xl space-y-6">
        <div className="space-y-3">
          <h2 className="font-heading text-2xl font-medium text-foreground">
            Account
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Your sign-in identity for Ahgos.
          </p>
        </div>

        <div className="space-y-5">
          <dl className="divide-y divide-border/60 border-y border-border/60">
            <div className="grid gap-1 py-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6">
              <dt className="text-xs text-muted-foreground">Name</dt>
              <dd className="text-sm text-foreground">{user.name}</dd>
            </div>
            <div className="grid gap-1 py-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6">
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd className="break-all text-sm text-foreground">
                {user.email}
              </dd>
            </div>
          </dl>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Sign out of your account on this device.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <LogOut aria-hidden="true" className="size-4" />
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
