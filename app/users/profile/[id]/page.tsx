import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ProfileView from '../ProfileView';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserProfilePage({
  params,
}: Props): Promise<React.JSX.Element> {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/');

  const role = (session.user as { role?: string }).role;
  if (role === 'user') redirect('/users/profile');

  const { id } = await params;

  return <ProfileView userId={id} />;
}
