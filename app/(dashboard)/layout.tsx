import { getCurrentUserAndBusiness } from '@/lib/session';
import { redirect } from 'next/navigation';
import { AppHeader } from '@/components/app-header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getCurrentUserAndBusiness();

  if (!context) {
    redirect('/sign-in');
  }
  if (!context.business) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader
        user={{
          id: context.user.id,
          name: context.user.name,
          email: context.user.email,
        }}
        business={{
          id: context.business.id,
          name: context.business.name,
          slug: context.business.slug,
        }}
      />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
