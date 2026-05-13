const appEnv =
  process.env.NEXT_PUBLIC_APP_ENV ??
  (process.env.NODE_ENV === 'development' ? 'development' : null);

export default function Footer(): React.JSX.Element {
  return (
    <footer className="py-4 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} Company Vacations
      {appEnv && <span className="ml-2 opacity-50">[{appEnv}]</span>}
    </footer>
  );
}
