import { getClient } from '@/server/getServerApolloClient';
import { gql } from '@apollo/client';
import {
  Order,
  OrdersFilter,
  OrdersSortInput,
  PaginationInput,
} from '../db/entities';
import { cache } from 'react';

export interface OrdersQuery {
  orders: {
    items: {
      id: Order['id'];
      orderNumber: Order['orderNumber'];
      type: Order['type'];
      status: Order['status'];
      scheduledDate?: Order['scheduledDate'] | null;
      timeWindowStart?: Order['timeWindowStart'] | null;
      timeWindowEnd?: Order['timeWindowEnd'] | null;
      createdDate: Order['createdDate'];
      engineer?: { id: string; firstName: string; lastName: string } | null;
      invoice?: {
        id: string;
        invoiceNumber: number;
        paymentStatus: string;
        client: { id: string; name: string };
      } | null;
    }[];
    total: number;
  };
}

const GET_ORDERS = gql`
  query GetOrders(
    $filter: OrdersFilter
    $pagination: PaginationInput
    $sort: OrdersSortInput
  ) {
    orders(filter: $filter, pagination: $pagination, sort: $sort) {
      items {
        id
        orderNumber
        type
        status
        scheduledDate
        timeWindowStart
        timeWindowEnd
        createdDate
        engineer {
          id
          firstName
          lastName
        }
        invoice {
          id
          invoiceNumber
          paymentStatus
          client {
            id
            name
          }
        }
      }
      total
    }
  }
`;

export default cache(
  async (
    filter?: OrdersFilter,
    pagination?: PaginationInput,
    sort?: OrdersSortInput,
  ) => {
    const client = getClient();
    const { data, error } = await client.query<OrdersQuery>({
      query: GET_ORDERS,
      variables: { filter, pagination, sort },
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    });
    return { data, error };
  },
);
