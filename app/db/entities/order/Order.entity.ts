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
import { ObjectType, Field, ID, Int, registerEnumType } from 'type-graphql';
import { GraphQLDate } from 'graphql-scalars';
import { Engineer } from '../engineer/Engineer.entity';
import { Invoice } from '../invoice/Invoice.entity';
import { OrderType, OrderStatus } from './Order.types';

registerEnumType(OrderType, { name: 'OrderType' });
registerEnumType(OrderStatus, { name: 'OrderStatus' });

@ObjectType('Order', {
  description: 'A service order (installation, maintenance or repair job).',
})
@Entity({ name: 'orders' })
export class Order {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Int)
  @Column({ type: 'int', generated: 'increment', unique: true })
  orderNumber: number;

  @Field(() => OrderType)
  @Column({ type: 'enum', enum: OrderType })
  type: OrderType;

  @Field(() => OrderStatus)
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.NEW })
  status: OrderStatus;

  @Field(() => GraphQLDate, { nullable: true })
  @Column({
    type: 'date',
    nullable: true,
    transformer: {
      to: (v: Date) => v,
      from: (v: string) => (v ? new Date(v) : null),
    },
  })
  scheduledDate?: Date;

  @Field({ nullable: true })
  @Column({ type: 'time', nullable: true })
  timeWindowStart?: string;

  @Field({ nullable: true })
  @Column({ type: 'time', nullable: true })
  timeWindowEnd?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Field(() => Engineer, { nullable: true })
  @ManyToOne('engineers', (engineer: Engineer) => engineer.orders, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'engineerId' })
  engineer?: Relation<Engineer> | null;

  @Field(() => Invoice, { nullable: true })
  @OneToOne('invoices', (invoice: Invoice) => invoice.order)
  invoice?: Relation<Invoice> | null;

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
