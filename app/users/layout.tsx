import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>): Promise<React.JSX.Element> {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/');

  return <>{children}</>;
}
