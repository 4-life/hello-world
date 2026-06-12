import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import type { Order } from '../db/entities';

const UPDATE_ORDER = gql`
  mutation UpdateOrder($data: UpdateOrderInput!) {
    updateOrder(data: $data) {
      id
      status
      notes
      engineer {
        id
        firstName
        lastName
      }
    }
  }
`;

interface UpdateOrderInput {
  id: string;
  type?: string;
  status?: string;
  scheduledDate?: string;
  timeWindowStart?: string;
  timeWindowEnd?: string;
  notes?: string;
  engineerId?: string | null;
}

interface UpdateOrderResult {
  updateOrder: Pick<Order, 'id' | 'status' | 'notes'> & {
    engineer?: { id: string; firstName: string; lastName: string } | null;
  };
}

export default function useUpdateOrder(): ReturnType<
  typeof useMutation<UpdateOrderResult, { data: UpdateOrderInput }>
> {
  return useMutation<UpdateOrderResult, { data: UpdateOrderInput }>(
    UPDATE_ORDER,
  );
}
