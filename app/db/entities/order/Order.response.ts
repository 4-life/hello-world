import PaginatedResponse from '../PaginatedResponse';
import { Order } from './Order.entity';

export const PaginatedOrdersResponse = PaginatedResponse(
  Order,
  'PaginatedOrdersResponse',
);
export type PaginatedOrdersResponse = InstanceType<
  typeof PaginatedOrdersResponse
>;
