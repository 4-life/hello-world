import Link from 'next/link';

export default function NotFound(): React.JSX.Element {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="text-lg text-muted-foreground">Page not found</p>
      <Link
        href="/"
        className="text-sm font-medium underline underline-offset-4 hover:text-primary"
      >
        Go to home
      </Link>
    </div>
  );
}
