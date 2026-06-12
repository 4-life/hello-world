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
  registerEnumType,
} from 'type-graphql';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { GraphQLDate } from 'graphql-scalars';
import { Engineer } from './Engineer';
import { Invoice } from './Invoice';
import { OrderType } from './OrderType';
import { OrderStatus } from './OrderStatus';
import { SortOrder } from './SortOrder';

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
  @ManyToOne('Engineer', (engineer: Engineer) => engineer.orders, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'engineerId' })
  engineer?: Relation<Engineer> | null;

  @Field(() => Invoice, { nullable: true })
  @OneToOne('Invoice', (invoice: Invoice) => invoice.order)
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

@InputType('CreateOrderInput')
export class CreateOrderInput {
  @Field(() => OrderType)
  type: OrderType;

  @Field(() => OrderStatus, { nullable: true })
  status?: OrderStatus;

  @Field(() => GraphQLDate, { nullable: true })
  scheduledDate?: Date;

  @Field(() => String, { nullable: true })
  timeWindowStart?: string;

  @Field(() => String, { nullable: true })
  timeWindowEnd?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;

  @Field(() => String, { nullable: true })
  engineerId?: string;
}

@InputType('UpdateOrderInput')
export class UpdateOrderInput {
  @Field(() => String)
  id: string;

  @Field(() => OrderType, { nullable: true })
  type?: OrderType;

  @Field(() => OrderStatus, { nullable: true })
  status?: OrderStatus;

  @Field(() => GraphQLDate, { nullable: true })
  scheduledDate?: Date;

  @Field(() => String, { nullable: true })
  timeWindowStart?: string;

  @Field(() => String, { nullable: true })
  timeWindowEnd?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;

  @Field(() => String, { nullable: true })
  engineerId?: string;
}

@InputType('OrdersFilter')
export class OrdersFilter {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => OrderType, { nullable: true })
  type?: OrderType;

  @Field(() => OrderStatus, { nullable: true })
  status?: OrderStatus;

  @Field(() => String, { nullable: true })
  engineerId?: string;

  @Field(() => Int, { nullable: true })
  orderNumber?: number;
}

export enum OrderSortField {
  orderNumber = 'orderNumber',
  scheduledDate = 'scheduledDate',
  createdDate = 'createdDate',
}

registerEnumType(OrderSortField, { name: 'OrderSortField' });

@InputType('OrdersSortInput')
export class OrdersSortInput {
  @Field(() => OrderSortField)
  field: OrderSortField = OrderSortField.createdDate;

  @Field(() => SortOrder)
  order: SortOrder = SortOrder.ASC;
}

@ObjectType('PaginatedOrdersResponse')
export class PaginatedOrdersResponse {
  @Field(() => [Order])
  items: Order[];

  @Field(() => Int)
  total: number;
}
