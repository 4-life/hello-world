'use client';

import { signIn, useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { User as UserIcon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import useUserAvatar from '@/app/libs/useUserAvatar';
import { getInitials } from '@/lib/utils';

export default function SignInButton(): React.JSX.Element {
  const { data, status } = useSession();
  const userId = (data?.user as { userId?: string } | undefined)?.userId;
  const avatarUrl = useUserAvatar(userId);

  if (status === 'loading') {
    return (
      <Button variant="outline" disabled size="lg">
        Loading...
      </Button>
    );
  }

  if (status === 'authenticated') {
    const name = data.user?.name ?? data.user?.email ?? '';
    const sessionUser = data.user as
      | { firstName?: string | null; lastName?: string | null }
      | undefined;
    const initials = getInitials(
      sessionUser?.firstName,
      sessionUser?.lastName,
      name,
    );
    const profileHref = userId ? `/users/profile/${userId}` : '/users/profile';

    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="rounded-full outline-none cursor-pointer"
          >
            <Avatar title={`${data.user?.name} (${data.user?.email})`}>
              {(avatarUrl ?? data.user?.image) && (
                <AvatarImage src={avatarUrl ?? data.user!.image!} alt={name} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="truncate text-sm font-medium">{name}</p>
            {data.user?.email && (
              <p className="truncate text-xs text-muted-foreground">
                {data.user.email}
              </p>
            )}
          </div>
          <Separator />
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start gap-2"
          >
            <Link href={profileHref}>
              <UserIcon className="size-4" />
              Profile
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => signOut()}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </PopoverContent>
      </Popover>
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
