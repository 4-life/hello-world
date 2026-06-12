import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import type { Engineer } from '../db/entities';

const CREATE_ENGINEER = gql`
  mutation CreateEngineer($data: CreateEngineerInput!) {
    createEngineer(data: $data) {
      id
      firstName
      lastName
    }
  }
`;

interface CreateEngineerInput {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  specialization?: string;
}

interface CreateEngineerResult {
  createEngineer: Pick<Engineer, 'id' | 'firstName' | 'lastName'>;
}

export default function useCreateEngineer(): ReturnType<
  typeof useMutation<CreateEngineerResult, { data: CreateEngineerInput }>
> {
  return useMutation<CreateEngineerResult, { data: CreateEngineerInput }>(
    CREATE_ENGINEER,
  );
}
