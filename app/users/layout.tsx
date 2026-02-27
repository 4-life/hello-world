import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import getUsers from '@/app/libs/getUsers';
import SignInButton from '@/components/SignInButton';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function Layout({
  children,
}: Readonly<{
  children: ReactNode;
}>): Promise<React.JSX.Element> {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }
  const { data } = await getUsers({}, { limit: 0 });
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          justifyContent: 'space-between',
        }}
      >
        <h1>
          Users <span style={{ fontSize: '0.5em' }}>{data?.users.total}</span>
        </h1>
        <SignInButton />
      </div>
      {children}
    </div>
  );
}
