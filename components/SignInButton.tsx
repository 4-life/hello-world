'use client';

import { signIn, useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function SignInButton() {
  const { data, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'authenticated') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            overflow: 'hidden',
            borderRadius: '100%',
            width: '32px',
            height: '32px',
          }}
        >
          <Image
            src={data.user?.image as string}
            alt={data.user?.name as string}
            width={32}
            height={32}
            title={`${data.user?.name} (${data.user?.email})`}
          />
        </div>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <button
        onClick={() => signIn('github')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#000',
        }}
      >
        <Image
          src="https://avatars.githubusercontent.com/u/9919?s=200&v=4"
          alt="Github"
          width={32}
          height={32}
          style={{ margin: 0 }}
        />
        <p style={{ margin: 0 }}>Sign in by Github</p>
      </button>
      <button
        onClick={() => signIn('google')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#fff',
          border: '1px solid #000',
        }}
      >
        <Image
          src="https://yt3.ggpht.com/wjb1KjcaSgzXnqLUMTafDqgppr_LS7-A8sGf9DP1JJThg_Npp4EsiByYk9IPCkofvvD_3hy6dg=s68-c-k-c0x00ffffff-no-rj"
          alt="Google"
          width={32}
          height={32}
          style={{ margin: 0 }}
        />
        <p style={{ margin: 0, color: '#000' }}>Sign in by Google</p>
      </button>
    </div>
  );
}
