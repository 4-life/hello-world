import { ObjectType, Field, Int } from 'type-graphql';
import { OrderStatus } from './OrderStatus';

@ObjectType('OrderStatusCount')
export class OrderStatusCount {
  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => Int)
  count: number;
}

@ObjectType('DashboardStats')
export class DashboardStats {
  @Field(() => Int)
  totalOrders: number;

  @Field(() => [OrderStatusCount])
  ordersByStatus: OrderStatusCount[];

  @Field(() => Int)
  unpaidInvoices: number;

  @Field(() => Int)
  totalEngineers: number;

  @Field(() => Int)
  activeEngineers: number;

  @Field(() => Int)
  totalParts: number;

  @Field(() => Int, { nullable: true })
  lowStockParts?: number;
}
