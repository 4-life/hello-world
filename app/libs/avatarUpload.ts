import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

const REQUEST_AVATAR_UPLOAD_URL = gql`
  mutation RequestAvatarUploadUrl(
    $contentType: String!
    $targetUserId: String
  ) {
    requestAvatarUploadUrl(
      contentType: $contentType
      targetUserId: $targetUserId
    ) {
      uploadUrl
      key
    }
  }
`;

const CONFIRM_AVATAR_UPLOAD = gql`
  mutation ConfirmAvatarUpload($key: String!, $targetUserId: String) {
    confirmAvatarUpload(key: $key, targetUserId: $targetUserId) {
      avatar
    }
  }
`;

export function useRequestAvatarUploadUrl(): useMutation.ResultTuple<
  { requestAvatarUploadUrl: { uploadUrl: string; key: string } },
  { contentType: string; targetUserId?: string }
> {
  return useMutation<
    { requestAvatarUploadUrl: { uploadUrl: string; key: string } },
    { contentType: string; targetUserId?: string }
  >(REQUEST_AVATAR_UPLOAD_URL);
}

export function useConfirmAvatarUpload(): useMutation.ResultTuple<
  { confirmAvatarUpload: { avatar: string | null } },
  { key: string; targetUserId?: string }
> {
  return useMutation<
    { confirmAvatarUpload: { avatar: string | null } },
    { key: string; targetUserId?: string }
  >(CONFIRM_AVATAR_UPLOAD);
}
