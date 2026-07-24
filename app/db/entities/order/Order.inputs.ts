import { InputType, Field, Int, registerEnumType } from 'type-graphql';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { GraphQLDate } from 'graphql-scalars';
import { OrderType, OrderStatus } from './Order.types';
import { SortOrder } from '../SortOrder';

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
