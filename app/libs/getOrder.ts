import { getClient } from '@/server/getServerApolloClient';
import { gql } from '@apollo/client';
import { Order } from '../db/entities';
import { cache } from 'react';

export interface OrderQuery {
  order: {
    id: Order['id'];
    orderNumber: Order['orderNumber'];
    type: Order['type'];
    status: Order['status'];
    scheduledDate?: Order['scheduledDate'] | null;
    timeWindowStart?: Order['timeWindowStart'] | null;
    timeWindowEnd?: Order['timeWindowEnd'] | null;
    notes?: Order['notes'] | null;
    createdDate: Order['createdDate'];
    engineer?: { id: string; firstName: string; lastName: string } | null;
    invoice?: {
      id: string;
      invoiceNumber: number;
      amount: number;
      paymentStatus: string;
    } | null;
  } | null;
}

const GET_ORDER = gql`
  query GetOrder($id: String!) {
    order(id: $id) {
      id
      orderNumber
      type
      status
      scheduledDate
      timeWindowStart
      timeWindowEnd
      notes
      createdDate
      engineer {
        id
        firstName
        lastName
      }
      invoice {
        id
        invoiceNumber
        amount
        paymentStatus
      }
    }
  }
`;

export default cache(async (id: string) => {
  const client = getClient();
  const { data, error } = await client.query<OrderQuery>({
    query: GET_ORDER,
    variables: { id },
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });
  return { data, error };
});
