import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import type { Part } from '../db/entities';

const CREATE_PART = gql`
  mutation CreatePart($data: CreatePartInput!) {
    createPart(data: $data) {
      id
      name
      sku
    }
  }
`;

interface CreatePartInput {
  name: string;
  sku: string;
  unit?: string;
  description?: string;
}

interface CreatePartResult {
  createPart: Pick<Part, 'id' | 'name' | 'sku'>;
}

export default function useCreatePart(): ReturnType<
  typeof useMutation<CreatePartResult, { data: CreatePartInput }>
> {
  return useMutation<CreatePartResult, { data: CreatePartInput }>(CREATE_PART);
}
