import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ProfileView from './ProfileView';

export default async function ProfilePage(): Promise<React.JSX.Element> {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/');

  const userId = (session.user as { userId?: string }).userId;
  if (!userId) redirect('/');

  return <ProfileView userId={userId} />;
}
