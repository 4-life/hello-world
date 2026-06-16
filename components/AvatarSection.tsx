'use client';

import { useState, type JSX } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { CameraIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import UploadDialog from '@/components/UploadDialog';
import {
  useConfirmAvatarUpload,
  useRequestAvatarUploadUrl,
} from '@/app/libs/avatarUpload';
import { getInitials } from '@/lib/utils';

interface Props {
  userId: string;
  initialAvatarUrl?: string | null;
  login: string;
  firstName?: string | null;
  lastName?: string | null;
}

function resolveContentType(file: File): string {
  if (file.type === 'image/jpg') return 'image/jpeg';
  if (file.type) return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    default:
      return '';
  }
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

  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialAvatarUrl ?? null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const [requestUploadUrl] = useRequestAvatarUploadUrl();
  const [confirmUpload] = useConfirmAvatarUpload();

  async function handleUpload(file: File): Promise<void> {
    try {
      const contentType = resolveContentType(file);
      const { data: urlData } = await requestUploadUrl({
        variables: { contentType, targetUserId: userId },
      });
      if (!urlData) throw new Error('Failed to get upload URL');

      const { uploadUrl, key } = urlData.requestAvatarUploadUrl;

      const res = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': contentType },
      });
      if (!res.ok) throw new Error('Upload to storage failed');

      const { data: confirmData } = await confirmUpload({
        variables: { key, targetUserId: userId },
      });
      const newUrl = confirmData?.confirmAvatarUpload.avatar;
      if (newUrl) setAvatarUrl(newUrl);

      toast.success('Avatar updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    }
  }

  const initials = getInitials(firstName, lastName, login);

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
        onUpload={handleUpload}
      />
    </>
  );
}
