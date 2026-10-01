import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toast';
import './globals.css';
import { cn } from '@/lib/utils';

const acorn = localFont({
  src: [
    { path: '../public/fonts/Acorn-Regular.otf', weight: '400' },
    { path: '../public/fonts/Acorn-Medium.otf', weight: '500' },
  ],
  variable: '--font-acorn',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ahgos',
  description: 'Welcome to Ahgos',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={cn('h-full', 'antialiased', acorn.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
