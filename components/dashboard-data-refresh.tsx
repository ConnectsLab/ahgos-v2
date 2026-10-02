'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const REFRESH_INTERVAL_MS = 30_000;

function isDataRoute(pathname: string) {
  return (
    pathname === '/dashboard' ||
    pathname === '/reviews' ||
    pathname === '/campaigns' ||
    pathname.startsWith('/campaigns/')
  );
}

export function DashboardDataRefresh() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isDataRoute(pathname)) return;

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        router.refresh();
      }
    };

    const intervalId = window.setInterval(
      refreshWhenVisible,
      REFRESH_INTERVAL_MS
    );
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [pathname, router]);

  return null;
}
