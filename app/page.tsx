import SignInButton from '@/components/SignInButton';
import LoginForm from '@/components/LoginForm';
import Image from 'next/image';

export default async function Home(): Promise<React.JSX.Element> {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8">
      <Image
        src="/logo.png"
        alt="Company Vacations"
        width={200}
        height={80}
        priority
      />
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
