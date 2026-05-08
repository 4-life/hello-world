import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

const CREATE_VACATION = gql`
  mutation CreateVacation($data: CreateVacationInput!) {
    createVacation(data: $data) {
      id
      startDate
      endDate
      info
    }
  }
`;

interface CreateVacationInput {
  userId: string;
  startDate: string;
  endDate: string;
  info?: string;
}

interface CreateVacationResult {
  createVacation: {
    id: string;
    startDate: string;
    endDate: string;
    info?: string;
  };
}

export default function useCreateVacation(): ReturnType<
  typeof useMutation<CreateVacationResult, { data: CreateVacationInput }>
> {
  return useMutation<CreateVacationResult, { data: CreateVacationInput }>(
    CREATE_VACATION,
  );
}
