import { ObjectType, Field, ID, Float } from 'type-graphql';
import PaginatedResponse from '../PaginatedResponse';
import { Invoice } from './Invoice.entity';
import { PaymentStatus } from './Invoice.types';

export const PaginatedInvoicesResponse = PaginatedResponse(
  Invoice,
  'PaginatedInvoicesResponse',
);
export type PaginatedInvoicesResponse = InstanceType<
  typeof PaginatedInvoicesResponse
>;

@ObjectType('InvoicePayment', {
  description: 'Public-facing invoice details for the payment page.',
})
export class InvoicePayment {
  @Field(() => ID)
  id: string;

  @Field(() => Float)
  amount: number;

  @Field(() => PaymentStatus)
  paymentStatus: PaymentStatus;
}
