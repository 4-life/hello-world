import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import {
  ObjectType,
  Field,
  ID,
  InputType,
  Int,
  Float,
  registerEnumType,
} from 'type-graphql';
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { GraphQLDate } from 'graphql-scalars';
import { Client } from './Client';
import { Order } from './Order';
import { PaymentStatus } from './PaymentStatus';
import { SortOrder } from './SortOrder';

registerEnumType(PaymentStatus, { name: 'PaymentStatus' });

@ObjectType('Invoice', {
  description: 'A bill issued to a client, optionally linked to an order.',
})
@Entity({ name: 'invoices' })
export class Invoice {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Int)
  @Column({ type: 'int', generated: 'increment', unique: true })
  invoiceNumber: number;

  @Field(() => Client)
  @ManyToOne('Client', (client: Client) => client.invoices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'clientId' })
  client: Relation<Client>;

  @Field(() => Order, { nullable: true })
  @OneToOne('Order', (order: Order) => order.invoice, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'orderId' })
  order?: Relation<Order> | null;

  @Field(() => Float)
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (v: number) => v,
      from: (v: string) => parseFloat(v),
    },
  })
  amount: number;

  @Field(() => PaymentStatus)
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  paymentStatus: PaymentStatus;

  @Field(() => GraphQLDate)
  @Column({
    type: 'date',
    transformer: {
      to: (v: Date) => v,
      from: (v: string) => new Date(v),
    },
  })
  issuedDate: Date;

  @Field(() => GraphQLDate, { nullable: true })
  @Column({
    type: 'date',
    nullable: true,
    transformer: {
      to: (v: Date) => v,
      from: (v: string) => (v ? new Date(v) : null),
    },
  })
  dueDate?: Date;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Field()
  @Column({ type: 'timestamp' })
  createdDate: Date;

  @Field()
  @Column({ type: 'timestamp' })
  updatedDate: Date;

  @BeforeInsert()
  createDates(): void {
    this.createdDate = new Date();
    this.updatedDate = new Date();
  }

  @BeforeUpdate()
  updateDates(): void {
    this.updatedDate = new Date();
  }
}

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

@ObjectType('PaginatedInvoicesResponse')
export class PaginatedInvoicesResponse {
  @Field(() => [Invoice])
  items: Invoice[];

  @Field(() => Int)
  total: number;
}

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
