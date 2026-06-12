import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import type { Invoice } from '../db/entities';

const UPDATE_INVOICE = gql`
  mutation UpdateInvoice($data: UpdateInvoiceInput!) {
    updateInvoice(data: $data) {
      id
      paymentStatus
      amount
      dueDate
      notes
    }
  }
`;

interface UpdateInvoiceInput {
  id: string;
  paymentStatus?: string;
  amount?: number;
  dueDate?: string;
  notes?: string;
}

interface UpdateInvoiceResult {
  updateInvoice: Pick<
    Invoice,
    'id' | 'paymentStatus' | 'amount' | 'dueDate' | 'notes'
  >;
}

export default function useUpdateInvoice(): ReturnType<
  typeof useMutation<UpdateInvoiceResult, { data: UpdateInvoiceInput }>
> {
  return useMutation<UpdateInvoiceResult, { data: UpdateInvoiceInput }>(
    UPDATE_INVOICE,
  );
}
