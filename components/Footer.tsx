export default function Footer(): React.JSX.Element {
  return (
    <footer className="py-4 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} Company Vacations
    </footer>
  );
}
