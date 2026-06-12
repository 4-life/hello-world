import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import SignInButton from '@/components/SignInButton';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Footer from '@/components/Footer';

export default async function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="flex min-h-full flex-col">
        <header className="flex items-center justify-between border-b px-6 py-3">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="ERP/CMMS"
              width={120}
              height={40}
              priority
            />
          </Link>
          <SignInButton />
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </div>
    );
  }

  const role = (session.user as { role?: string } | undefined)?.role;
  const canSeeUsers = role === 'admin' || role === 'manager';

  return (
    <div className="flex min-h-full">
      <Sidebar canSeeUsers={canSeeUsers} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar canSeeUsers={canSeeUsers} />
        <main className="flex min-w-0 flex-1 flex-col  p-0 md:p-6">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
