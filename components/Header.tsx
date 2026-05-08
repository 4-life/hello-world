import Link from 'next/link';
import Image from 'next/image';
import SignInButton from '@/components/SignInButton';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function Header(): Promise<React.JSX.Element> {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  const canSeeUsers = role === 'admin' || role === 'manager';

  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <Link
        href={session ? '/users/profile' : '/'}
        className="flex items-center"
      >
        <Image
          src="/logo.png"
          alt="Company Vacations"
          width={120}
          height={40}
          priority
        />
      </Link>

      {session && (
        <nav className="flex items-center gap-4 text-sm">
          {canSeeUsers && (
            <Link
              href="/users"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Users
            </Link>
          )}
          <Link
            href="/users/profile"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Profile
          </Link>
        </nav>
      )}

      <SignInButton />
    </header>
  );
}
