import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import type { Order } from '../db/entities';

const CREATE_ORDER = gql`
  mutation CreateOrder($data: CreateOrderInput!) {
    createOrder(data: $data) {
      id
      orderNumber
    }
  }
`;

interface CreateOrderInput {
  type: string;
  status?: string;
  scheduledDate?: string;
  timeWindowStart?: string;
  timeWindowEnd?: string;
  notes?: string;
  engineerId?: string;
}

interface CreateOrderResult {
  createOrder: Pick<Order, 'id' | 'orderNumber'>;
}

export default function useCreateOrder(): ReturnType<
  typeof useMutation<CreateOrderResult, { data: CreateOrderInput }>
> {
  return useMutation<CreateOrderResult, { data: CreateOrderInput }>(
    CREATE_ORDER,
  );
}
