import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

export const DELETE_USER = gql`
  mutation DeleteUser($id: String!) {
    deleteUser(id: $id)
  }
`;

export default function useDeleteUser(): useMutation.ResultTuple<
  Record<'deleteUser', boolean>,
  Record<string, unknown>
> {
  return useMutation<Record<'deleteUser', boolean>>(DELETE_USER);
}
