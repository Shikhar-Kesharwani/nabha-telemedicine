import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'SEHAT — Digital Telemedicine & Health Partner',
  description: 'Instant AI symptom checking, specialist video consultations, and 24/7 emergency response designed for India.',
  manifest: '/manifest.json',
  icons: {
    apple: '/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#6366f1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn('min-h-screen font-sans antialiased')}
        style={{ background: 'var(--bg-root)', color: 'var(--text-primary)' }}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
