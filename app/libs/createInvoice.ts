import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import type { Invoice } from '../db/entities';

const CREATE_INVOICE = gql`
  mutation CreateInvoice($data: CreateInvoiceInput!) {
    createInvoice(data: $data) {
      id
      invoiceNumber
    }
  }
`;

interface CreateInvoiceInput {
  clientId: string;
  orderId?: string;
  amount: number;
  paymentStatus?: string;
  issuedDate: string;
  dueDate?: string;
  notes?: string;
}

interface CreateInvoiceResult {
  createInvoice: Pick<Invoice, 'id' | 'invoiceNumber'>;
}

export default function useCreateInvoice(): ReturnType<
  typeof useMutation<CreateInvoiceResult, { data: CreateInvoiceInput }>
> {
  return useMutation<CreateInvoiceResult, { data: CreateInvoiceInput }>(
    CREATE_INVOICE,
  );
}
