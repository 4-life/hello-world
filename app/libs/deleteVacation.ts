import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

const DELETE_VACATION = gql`
  mutation DeleteVacation($id: String!) {
    deleteVacation(id: $id)
  }
`;

export default function useDeleteVacation(): ReturnType<
  typeof useMutation<Record<'deleteVacation', boolean>, { id: string }>
> {
  return useMutation<Record<'deleteVacation', boolean>, { id: string }>(
    DELETE_VACATION,
  );
}
