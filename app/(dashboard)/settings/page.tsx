import { getCurrentUserAndBusiness } from '@/lib/session';
import { SettingsView } from '@/components/settings-view';

export default async function SettingsPage() {
  const context = await getCurrentUserAndBusiness();
  if (!context?.business) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your business information and account.
        </p>
      </div>

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
