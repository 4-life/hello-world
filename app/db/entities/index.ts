import { User } from './User';
import { Vacation } from './Vacation';
import { Notification } from './Notification';
import './PaginationInput';
import './SortOrder';

export * from './User';
export * from './Vacation';
export * from './Notification';
export * from './PaginationInput';
export * from './SortOrder';

const entities = [User, Vacation, Notification];

export default entities;
