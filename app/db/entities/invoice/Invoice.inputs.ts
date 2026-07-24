import { InputType, Field, Float, registerEnumType } from 'type-graphql';
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { GraphQLDate } from 'graphql-scalars';
import { PaymentStatus } from './Invoice.types';
import { SortOrder } from '../SortOrder';

@InputType('CreateInvoiceInput')
export class CreateInvoiceInput {
  @Field(() => String)
  clientId: string;

  @Field(() => String, { nullable: true })
  orderId?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount: number;

  @Field(() => PaymentStatus, { nullable: true })
  paymentStatus?: PaymentStatus;

  @Field(() => GraphQLDate)
  issuedDate: Date;

  @Field(() => GraphQLDate, { nullable: true })
  dueDate?: Date;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;
}

@InputType('UpdateInvoiceInput')
export class UpdateInvoiceInput {
  @Field(() => String)
  id: string;

  @Field(() => PaymentStatus, { nullable: true })
  paymentStatus?: PaymentStatus;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @Field(() => GraphQLDate, { nullable: true })
  dueDate?: Date;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;
}

@InputType('InvoicesFilter')
export class InvoicesFilter {
  @Field(() => String, { nullable: true })
  clientId?: string;

  @Field(() => String, { nullable: true })
  orderId?: string;

  @Field(() => PaymentStatus, { nullable: true })
  paymentStatus?: PaymentStatus;
}

export enum InvoiceSortField {
  invoiceNumber = 'invoiceNumber',
  issuedDate = 'issuedDate',
  dueDate = 'dueDate',
  createdDate = 'createdDate',
}

registerEnumType(InvoiceSortField, { name: 'InvoiceSortField' });

@InputType('InvoicesSortInput')
export class InvoicesSortInput {
  @Field(() => InvoiceSortField)
  field: InvoiceSortField = InvoiceSortField.createdDate;

  @Field(() => SortOrder)
  order: SortOrder = SortOrder.ASC;
}
