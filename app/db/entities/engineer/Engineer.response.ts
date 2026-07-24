import PaginatedResponse from '../PaginatedResponse';
import { Engineer } from './Engineer.entity';

export const PaginatedEngineersResponse = PaginatedResponse(
  Engineer,
  'PaginatedEngineersResponse',
);
export type PaginatedEngineersResponse = InstanceType<
  typeof PaginatedEngineersResponse
>;
