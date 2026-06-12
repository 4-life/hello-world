import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import type { User } from '../db/entities';

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($data: UpdateUserInput!) {
    updateProfile(data: $data) {
      id
      firstName
      lastName
      email
      phone
      role
    }
  }
`;

interface UpdateProfileInput {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
}

interface UpdateProfileResult {
  updateProfile: Pick<
    User,
    'id' | 'firstName' | 'lastName' | 'email' | 'phone' | 'role'
  >;
}

export default function useUpdateProfile(): ReturnType<
  typeof useMutation<UpdateProfileResult, { data: UpdateProfileInput }>
> {
  return useMutation<UpdateProfileResult, { data: UpdateProfileInput }>(
    UPDATE_PROFILE,
  );
}
