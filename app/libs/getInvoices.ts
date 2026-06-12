import { getClient } from '@/server/getServerApolloClient';
import { gql } from '@apollo/client';
import {
  Invoice,
  InvoicesFilter,
  InvoicesSortInput,
  PaginationInput,
} from '../db/entities';
import { cache } from 'react';

export interface InvoicesQuery {
  invoices: {
    items: {
      id: Invoice['id'];
      invoiceNumber: Invoice['invoiceNumber'];
      amount: Invoice['amount'];
      paymentStatus: Invoice['paymentStatus'];
      issuedDate: Invoice['issuedDate'];
      dueDate?: Invoice['dueDate'] | null;
      client: { id: string; name: string };
      order?: { id: string; orderNumber: number } | null;
    }[];
    total: number;
  };
}

const GET_INVOICES = gql`
  query GetInvoices(
    $filter: InvoicesFilter
    $pagination: PaginationInput
    $sort: InvoicesSortInput
  ) {
    invoices(filter: $filter, pagination: $pagination, sort: $sort) {
      items {
        id
        invoiceNumber
        amount
        paymentStatus
        issuedDate
        dueDate
        client {
          id
          name
        }
        order {
          id
          orderNumber
        }
      }
      total
    }
  }
`;

export default cache(
  async (
    filter?: InvoicesFilter,
    pagination?: PaginationInput,
    sort?: InvoicesSortInput,
  ) => {
    const client = getClient();
    const { data, error } = await client.query<InvoicesQuery>({
      query: GET_INVOICES,
      variables: { filter, pagination, sort },
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    });
    return { data, error };
  },
);
