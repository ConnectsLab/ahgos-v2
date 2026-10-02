import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toast';
import './globals.css';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Ahgos',
  description: 'Welcome to Ahgos',
};

const neueMontrealFont = localFont({
  src: [
    { path: '../public/fonts/NeueMontreal-Light.otf', weight: '300' },
    { path: '../public/fonts/NeueMontreal-Regular.otf', weight: '400' },
    {
      path: '../public/fonts/NeueMontreal-LightItalic.otf',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../public/fonts/NeueMontreal-Italic.otf',
      weight: '400',
      style: 'italic',
    },
  ],
  variable: '--font-neue-montreal',
  display: 'swap',
});

const acornFont = localFont({
  src: [
    { path: '../public/fonts/Acorn-ExtraLight.otf', weight: '200' },
    { path: '../public/fonts/Acorn-Light.otf', weight: '300' },
    { path: '../public/fonts/Acorn-Regular.otf', weight: '400' },
  ],
  variable: '--font-acorn',
  display: 'swap',
});

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={cn(
        'h-full',
        'antialiased',
        neueMontrealFont.variable,
        acornFont.variable
      )}
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
