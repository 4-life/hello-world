import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import type { User } from '../db/entities';

const CREATE_USER = gql`
  mutation CreateUser($data: CreateUserInput!) {
    createUser(data: $data) {
      id
      login
      email
      role
    }
  }
`;

interface CreateUserInput {
  login: string;
  email: string;
  password: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface CreateUserResult {
  createUser: Pick<User, 'id' | 'login' | 'email' | 'role'>;
}

export default function useCreateUser(): ReturnType<
  typeof useMutation<CreateUserResult, { data: CreateUserInput }>
> {
  return useMutation<CreateUserResult, { data: CreateUserInput }>(CREATE_USER);
}
