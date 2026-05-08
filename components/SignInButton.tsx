'use client';

import { signIn, useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function SignInButton(): React.JSX.Element {
  const { data, status } = useSession();

  if (status === 'loading') {
    return (
      <Button variant="outline" disabled size="lg">
        Loading...
      </Button>
    );
  }

  if (status === 'authenticated') {
    const name = data.user?.name ?? data.user?.email ?? '';
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div className="flex items-center gap-3">
        <Avatar title={`${data.user?.name} (${data.user?.email})`}>
          {data.user?.image && <AvatarImage src={data.user.image} alt={name} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <Button variant="outline" size="lg" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={() => signIn('google')}
      className="gap-3"
    >
      <Image
        src="https://yt3.ggpht.com/wjb1KjcaSgzXnqLUMTafDqgppr_LS7-A8sGf9DP1JJThg_Npp4EsiByYk9IPCkofvvD_3hy6dg=s68-c-k-c0x00ffffff-no-rj"
        alt="Google"
        width={18}
        height={18}
        className="shrink-0"
      />
      Sign in with Google
    </Button>
  );
}
