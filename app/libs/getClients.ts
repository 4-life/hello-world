import { getClient } from '@/server/getServerApolloClient';
import { gql } from '@apollo/client';
import {
  Client,
  ClientsFilter,
  ClientsSortInput,
  PaginationInput,
} from '../db/entities';
import { cache } from 'react';

export interface ClientsQuery {
  clients: {
    items: {
      id: Client['id'];
      name: Client['name'];
      email?: Client['email'] | null;
      phone?: Client['phone'] | null;
      createdDate: Client['createdDate'];
      invoices: { id: string }[];
    }[];
    total: number;
  };
}

const GET_CLIENTS = gql`
  query GetClients(
    $filter: ClientsFilter
    $pagination: PaginationInput
    $sort: ClientsSortInput
  ) {
    clients(filter: $filter, pagination: $pagination, sort: $sort) {
      items {
        id
        name
        email
        phone
        createdDate
        invoices {
          id
        }
      }
      total
    }
  }
`;

export default cache(
  async (
    filter?: ClientsFilter,
    pagination?: PaginationInput,
    sort?: ClientsSortInput,
  ) => {
    const client = getClient();
    const { data, error } = await client.query<ClientsQuery>({
      query: GET_CLIENTS,
      variables: { filter, pagination, sort },
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    });
    return { data, error };
  },
);
