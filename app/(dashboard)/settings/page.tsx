import { getCurrentUserAndBusiness } from '@/lib/session';
import { SettingsView } from '@/components/settings-view';

export default async function SettingsPage() {
  const context = await getCurrentUserAndBusiness();
  if (!context?.business) return null;

  return (
    <div className="space-y-12">
      <header className="max-w-2xl space-y-4">
        <p className="text-xs font-semibold uppercase text-primary">
          Workspace
        </p>
        <h1 className="font-heading text-3xl font-medium leading-tight text-foreground md:text-4xl">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your business information and account.
        </p>
      </header>

      <SettingsView
        user={{
          id: context.user.id,
          name: context.user.name,
          email: context.user.email,
        }}
        business={{
          id: context.business.id,
          name: context.business.name,
          slug: context.business.slug,
          type: context.business.type,
        }}
      />
    </div>
  );
}
