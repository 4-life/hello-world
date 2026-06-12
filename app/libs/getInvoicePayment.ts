import { getClient as getApolloClient } from '@/server/getServerApolloClient';
import { gql } from '@apollo/client';
import { InvoicePayment } from '../db/entities';
import { cache } from 'react';

export interface InvoicePaymentQuery {
  invoicePayment: Pick<
    InvoicePayment,
    'id' | 'amount' | 'paymentStatus'
  > | null;
}

const GET_INVOICE_PAYMENT = gql`
  query GetInvoicePayment($id: String!) {
    invoicePayment(id: $id) {
      id
      amount
      paymentStatus
    }
  }
`;

export default cache(async (id: string) => {
  const client = getApolloClient();
  const { data, error } = await client.query<InvoicePaymentQuery>({
    query: GET_INVOICE_PAYMENT,
    variables: { id },
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });
  return { data, error };
});
