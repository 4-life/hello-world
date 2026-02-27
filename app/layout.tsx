import type { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: '🚀🚀🚀 App example',
  description: 'This is hosted on Ubuntu Linux with Nginx as a reverse proxy.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
