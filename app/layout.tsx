import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './global.css';
import { Providers } from './providers';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import AppShell from '@/components/AppShell';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'ERP/CMMS',
  description: 'Maintenance management for installation and service teams',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  const pathname = (await headers()).get('x-pathname') ?? '';
  const isPaymentPage = pathname.startsWith('/pay');

  return (
    <html lang="en" className={cn('h-full font-sans', inter.variable)}>
      <body className="h-full">
        <Providers>
          {isPaymentPage ? children : <AppShell>{children}</AppShell>}
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
