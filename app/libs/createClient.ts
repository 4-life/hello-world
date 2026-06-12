import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import type { Client } from '../db/entities';

const CREATE_CLIENT = gql`
  mutation CreateClient($data: CreateClientInput!) {
    createClient(data: $data) {
      id
      name
    }
  }
`;

interface CreateClientInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface CreateClientResult {
  createClient: Pick<Client, 'id' | 'name'>;
}

export default function useCreateClient(): ReturnType<
  typeof useMutation<CreateClientResult, { data: CreateClientInput }>
> {
  return useMutation<CreateClientResult, { data: CreateClientInput }>(
    CREATE_CLIENT,
  );
}
