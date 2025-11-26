import type { Metadata } from 'next';
import localFont from 'next/font/local';

import AppLayout from '@/components/shared/layout/app-layout';
import { AppProviders } from '@/providers';

import './globals.css';

const figtree = localFont({
  src: [
    { path: '/fonts/Figtree-VariableFont_wght.ttf', weight: '100 900' },
    { path: '/fonts/static/Figtree-Light.ttf', weight: '300' },
    { path: '/fonts/static/Figtree-Regular.ttf', weight: '400' },
    { path: '/fonts/static/Figtree-Medium.ttf', weight: '500' },
    { path: '/fonts/static/Figtree-SemiBold.ttf', weight: '600' },
    { path: '/fonts/static/Figtree-Bold.ttf', weight: '700' },
    { path: '/fonts/static/Figtree-Black.ttf', weight: '800' },
  ],
  variable: '--font-figtree',
});

export const metadata: Metadata = {
  title: {
    template: '%s | KurlClub Admin',
    default: 'KurlClub Admin',
  },
  description: 'Gym management system for fitness center owners',
  applicationName: 'KurlClub Admin',
  appleWebApp: {
    title: 'KurlClub',
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: ['/favicon.ico', '/icon.svg'],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${figtree.className} bg-secondary-blue-500 antialiased`}
      >
        <AppProviders>
          <AppLayout>{children}</AppLayout>
        </AppProviders>
      </body>
    </html>
  );
}
