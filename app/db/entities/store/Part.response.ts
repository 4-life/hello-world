import PaginatedResponse from '../PaginatedResponse';
import { Part } from './Part.entity';

export const PaginatedPartsResponse = PaginatedResponse(
  Part,
  'PaginatedPartsResponse',
);
export type PaginatedPartsResponse = InstanceType<
  typeof PaginatedPartsResponse
>;
