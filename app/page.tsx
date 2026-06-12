import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import SignInButton from '@/components/SignInButton';
import LoginForm from '@/components/LoginForm';
import Image from 'next/image';

export default async function Home(): Promise<React.JSX.Element> {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/home');
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8">
      <Image src="/logo.png" alt="ERP/CMMS" width={200} height={80} priority />
      <LoginForm />
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="h-px w-24 bg-border" />
        or
        <div className="h-px w-24 bg-border" />
      </div>
      <SignInButton />
    </div>
  );
}
