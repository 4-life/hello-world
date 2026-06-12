import { getClient as getApolloClient } from '@/server/getServerApolloClient';
import { gql } from '@apollo/client';
import { Client } from '../db/entities';
import { cache } from 'react';

export interface ClientQuery {
  client: {
    id: Client['id'];
    name: Client['name'];
    email?: Client['email'] | null;
    phone?: Client['phone'] | null;
    address?: Client['address'] | null;
    createdDate: Client['createdDate'];
    invoices: {
      id: string;
      invoiceNumber: number;
      amount: number;
      paymentStatus: string;
      issuedDate: string;
      dueDate?: string | null;
      order?: { id: string; orderNumber: number } | null;
    }[];
  } | null;
}

const GET_CLIENT = gql`
  query GetClient($id: String!) {
    client(id: $id) {
      id
      name
      email
      phone
      address
      createdDate
      invoices {
        id
        invoiceNumber
        amount
        paymentStatus
        issuedDate
        dueDate
        order {
          id
          orderNumber
        }
      }
    }
  }
`;

export default cache(async (id: string) => {
  const client = getApolloClient();
  const { data, error } = await client.query<ClientQuery>({
    query: GET_CLIENT,
    variables: { id },
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });
  return { data, error };
});
