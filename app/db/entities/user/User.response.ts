import PaginatedResponse from '../PaginatedResponse';
import { User } from './User.entity';

export const PaginatedUsersResponse = PaginatedResponse(
  User,
  'PaginatedUsersResponse',
);
export type PaginatedUsersResponse = InstanceType<
  typeof PaginatedUsersResponse
>;
