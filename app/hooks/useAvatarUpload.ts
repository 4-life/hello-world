import { useState } from 'react';
import { toast } from 'sonner';
import {
  useConfirmAvatarUpload,
  useRequestAvatarUploadUrl,
} from '@/app/libs/avatarUpload';

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

export function useAvatarUpload(
  targetUserId: string,
  initialAvatarUrl?: string | null,
): {
  avatarUrl: string | null;
  upload: (file: File) => Promise<void>;
} {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialAvatarUrl ?? null,
  );
  const [requestUploadUrl] = useRequestAvatarUploadUrl();
  const [confirmUpload] = useConfirmAvatarUpload();

  async function upload(file: File): Promise<void> {
    try {
      const contentType = resolveContentType(file);
      const { data: urlData } = await requestUploadUrl({
        variables: { contentType, targetUserId },
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
        variables: { key, targetUserId },
      });
      const newUrl = confirmData?.confirmAvatarUpload.avatar;
      if (newUrl) setAvatarUrl(newUrl);

      toast.success('Avatar updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    }
  }

  return { avatarUrl, upload };
}
