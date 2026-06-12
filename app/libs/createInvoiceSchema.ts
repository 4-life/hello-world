export interface CreateInvoiceFormValues {
  clientId: string;
  orderId: string;
  amount: string;
  paymentStatus: string;
  issuedDate: string;
  dueDate: string;
  notes: string;
}

export const INITIAL_VALUES: CreateInvoiceFormValues = {
  clientId: '',
  orderId: '',
  amount: '',
  paymentStatus: 'UNPAID',
  issuedDate: '',
  dueDate: '',
  notes: '',
};
