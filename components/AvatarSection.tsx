'use client';

import { useState, type JSX } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { CameraIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import UploadDialog from '@/components/UploadDialog';
import { useAvatarUpload } from '@/app/hooks/useAvatarUpload';

interface Props {
  userId: string;
  initialAvatarUrl?: string | null;
  login: string;
  firstName?: string | null;
  lastName?: string | null;
}

function AvatarDisplay({
  avatarUrl,
  login,
  initials,
}: {
  avatarUrl: string | null;
  login: string;
  initials: string;
}): JSX.Element {
  return (
    <Avatar className="size-20">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={login}
          width={80}
          height={80}
          className="aspect-square size-full rounded-full object-cover"
        />
      ) : (
        <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
      )}
    </Avatar>
  );
}

export default function AvatarSection({
  userId,
  initialAvatarUrl,
  login,
  firstName,
  lastName,
}: Props): JSX.Element {
  const { data: session } = useSession();
  const isOwner =
    (session?.user as { userId?: string } | undefined)?.userId === userId;

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { avatarUrl, upload } = useAvatarUpload(userId, initialAvatarUrl);

  const initials =
    [firstName, lastName]
      .filter(Boolean)
      .map((n) => n![0])
      .join('')
      .toUpperCase() || login[0].toUpperCase();

  return (
    <>
      {isOwner ? (
        <button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="group relative w-fit rounded-full"
          aria-label="Upload avatar"
        >
          <AvatarDisplay
            avatarUrl={avatarUrl}
            login={login}
            initials={initials}
          />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <CameraIcon className="size-6 text-white" />
          </span>
        </button>
      ) : (
        <AvatarDisplay
          avatarUrl={avatarUrl}
          login={login}
          initials={initials}
        />
      )}

      <UploadDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Upload avatar"
        description="JPG, PNG or WebP · max 5 MB"
        accept="image/jpeg,image/png,image/webp"
        preview="image"
        onUpload={upload}
      />
    </>
  );
}
