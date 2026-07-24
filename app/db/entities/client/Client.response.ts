import PaginatedResponse from '../PaginatedResponse';
import { Client } from './Client.entity';

export const PaginatedClientsResponse = PaginatedResponse(
  Client,
  'PaginatedClientsResponse',
);
export type PaginatedClientsResponse = InstanceType<
  typeof PaginatedClientsResponse
>;
