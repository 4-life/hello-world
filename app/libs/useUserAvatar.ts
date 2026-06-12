import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

const GET_USER_AVATAR = gql`
  query GetUserAvatar($id: String!) {
    user(id: $id) {
      id
      avatar
    }
  }
`;

interface UserAvatarResult {
  user: { id: string; avatar?: string | null } | null;
}

export default function useUserAvatar(
  userId: string | undefined,
): string | null | undefined {
  const { data } = useQuery<UserAvatarResult, { id: string }>(GET_USER_AVATAR, {
    variables: { id: userId! },
    skip: !userId,
  });

  return data?.user?.avatar;
}
