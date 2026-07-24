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
  Int,
  Float,
  registerEnumType,
} from 'type-graphql';
import { GraphQLDate } from 'graphql-scalars';
import { Client } from '../client/Client.entity';
import { Order } from '../order/Order.entity';
import { PaymentStatus } from './Invoice.types';

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
  @ManyToOne('clients', (client: Client) => client.invoices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'clientId' })
  client: Relation<Client>;

  @Field(() => Order, { nullable: true })
  @OneToOne('orders', (order: Order) => order.invoice, {
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
