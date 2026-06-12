import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import type { InvoicePayment } from '../db/entities';

const PAY_INVOICE = gql`
  mutation PayInvoice($id: String!) {
    payInvoice(id: $id) {
      id
      paymentStatus
    }
  }
`;

interface PayInvoiceResult {
  payInvoice: Pick<InvoicePayment, 'id' | 'paymentStatus'>;
}

export default function usePayInvoice(): ReturnType<
  typeof useMutation<PayInvoiceResult, { id: string }>
> {
  return useMutation<PayInvoiceResult, { id: string }>(PAY_INVOICE);
}
