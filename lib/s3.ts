import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;
export type AvatarContentType = (typeof ALLOWED_CONTENT_TYPES)[number];

function extFromContentType(contentType: AvatarContentType): string {
  switch (contentType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
  }
}

// Magic bytes that must appear at the start of each image format.
// Checked server-side after upload — Content-Type alone is not sufficient.
function checkMagicBytes(contentType: AvatarContentType, b: Buffer): boolean {
  switch (contentType) {
    case 'image/jpeg':
      return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    case 'image/png':
      return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
    // RIFF....WEBP
    case 'image/webp':
      return (
        b[0] === 0x52 &&
        b[1] === 0x49 &&
        b[2] === 0x46 &&
        b[3] === 0x46 &&
        b[8] === 0x57 &&
        b[9] === 0x45 &&
        b[10] === 0x42 &&
        b[11] === 0x50
      );
  }
}

const UPLOAD_EXPIRES_IN = 300; // 5 minutes
const READ_EXPIRES_IN = 3600; // 1 hour

function createClient(): S3Client {
  return new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

function bucket(): string {
  return process.env.S3_BUCKET_NAME!;
}

export function isAllowedAvatarContentType(
  ct: string,
): ct is AvatarContentType {
  return ALLOWED_CONTENT_TYPES.includes(ct as AvatarContentType);
}

export function buildAvatarKey(
  userId: string,
  contentType: AvatarContentType,
): string {
  return `avatars/${userId}/${Date.now()}.${extFromContentType(contentType)}`;
}

export function contentTypeFromKey(key: string): AvatarContentType | null {
  const ext = key.split('.').pop();
  switch (ext) {
    case 'jpg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    default:
      return null;
  }
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: AvatarContentType,
): Promise<string> {
  const cmd = new PutObjectCommand({
    Bucket: bucket(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(createClient(), cmd, { expiresIn: UPLOAD_EXPIRES_IN });
}

export async function getPresignedReadUrl(key: string): Promise<string> {
  const contentType = contentTypeFromKey(key);
  const cmd = new GetObjectCommand({
    Bucket: bucket(),
    Key: key,
    // Lock the response content type so the browser cannot be tricked into
    // executing content that was stored with a mismatched extension.
    ...(contentType ? { ResponseContentType: contentType } : {}),
  });
  return getSignedUrl(createClient(), cmd, { expiresIn: READ_EXPIRES_IN });
}

/**
 * Fetches only the first 12 bytes of the uploaded object and checks
 * them against the expected magic bytes for the declared content type.
 * Returns false (and deletes the object) if validation fails.
 */
export async function validateAndCleanup(
  key: string,
  contentType: AvatarContentType,
): Promise<boolean> {
  const client = createClient();

  const result = await client.send(
    new GetObjectCommand({ Bucket: bucket(), Key: key, Range: 'bytes=0-11' }),
  );

  const bytes = await result.Body?.transformToByteArray();
  if (!bytes || bytes.length < 4) {
    await deleteObject(key);
    return false;
  }

  const isValid = checkMagicBytes(contentType, Buffer.from(bytes));
  if (!isValid) {
    await deleteObject(key);
  }
  return isValid;
}

export async function deleteObject(key: string): Promise<void> {
  await createClient().send(
    new DeleteObjectCommand({ Bucket: bucket(), Key: key }),
  );
}
