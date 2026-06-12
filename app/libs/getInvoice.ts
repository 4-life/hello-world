import { getClient as getApolloClient } from '@/server/getServerApolloClient';
import { gql } from '@apollo/client';
import { Invoice } from '../db/entities';
import { cache } from 'react';

export interface InvoiceQuery {
  invoice: {
    id: Invoice['id'];
    invoiceNumber: Invoice['invoiceNumber'];
    amount: Invoice['amount'];
    paymentStatus: Invoice['paymentStatus'];
    issuedDate: Invoice['issuedDate'];
    dueDate?: Invoice['dueDate'] | null;
    notes?: Invoice['notes'] | null;
    createdDate: Invoice['createdDate'];
    client: { id: string; name: string };
    order?: { id: string; orderNumber: number; status: string } | null;
  } | null;
}

const GET_INVOICE = gql`
  query GetInvoice($id: String!) {
    invoice(id: $id) {
      id
      invoiceNumber
      amount
      paymentStatus
      issuedDate
      dueDate
      notes
      createdDate
      client {
        id
        name
      }
      order {
        id
        orderNumber
        status
      }
    }
  }
`;

export default cache(async (id: string) => {
  const client = getApolloClient();
  const { data, error } = await client.query<InvoiceQuery>({
    query: GET_INVOICE,
    variables: { id },
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });
  return { data, error };
});
