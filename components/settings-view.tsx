'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Check, LogOut } from 'lucide-react';
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
    <div className="max-w-2xl space-y-6">
      {/* Business Details */}
      <Card className="border-border/60 shadow-sm">
        <form onSubmit={handleSaveBusiness}>
          <CardHeader>
            <CardTitle className="text-base">Business Details</CardTitle>
            <CardDescription className="text-xs">
              Manage your business profile and public feedback identity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                {errorMessage}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                disabled={isSaving}
                required
              />
              <p className="text-[11px] text-muted-foreground">
                This name is displayed to customers at the top of your feedback
                form.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-type">Business Type</Label>
              <Input
                id="business-type"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="e.g. Event planning"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-slug">Feedback Slug</Label>
              <Input
                id="business-slug"
                value={business.slug}
                readOnly
                disabled
                className="bg-muted text-muted-foreground font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Your unique URL path identifier for collecting reviews.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t border-border/60 pt-4">
            <span className="text-xs text-muted-foreground">
              {savedSuccess && (
                <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <Check className="h-3.5 w-3.5" />
                  Saved changes
                </span>
              )}
            </span>
            <Button
              type="submit"
              size="sm"
              disabled={
                isSaving ||
                (businessName.trim() === business.name &&
                  businessType.trim() === (business.type ?? ''))
              }
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <Spinner />
                  <span>Saving...</span>
                </div>
              ) : (
                'Save changes'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Account Details */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription className="text-xs">
            Your login and profile credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={user.name}
              readOnly
              disabled
              className="bg-muted/50"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={user.email}
              readOnly
              disabled
              className="bg-muted/50"
            />
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t border-border/60 pt-4">
          <p className="text-xs text-muted-foreground">
            Sign out of your account on this device.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="text-destructive hover:text-destructive gap-2"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
