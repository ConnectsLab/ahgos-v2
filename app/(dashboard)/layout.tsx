import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUserAndBusiness } from '@/lib/session';
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ModeToggle } from '@/components/mode-toggle';

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

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar
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
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-background/90 px-4 transition-[width,height] ease-linear sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="text-sm font-semibold tracking-tight line-clamp-1">
              {context.business.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </header>
        <div className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto px-4 py-7 sm:px-6 md:py-9">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
