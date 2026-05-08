import type { Metadata } from 'next';
import './global.css';
import { Providers } from './providers';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Company Vacations',
  description: 'Company Vacations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en" className={cn('h-full font-sans', inter.variable)}>
      <body className="h-full">
        <Providers>
          <div className="flex min-h-full flex-col">
            <Header />
            <main className="flex flex-1 flex-col">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
