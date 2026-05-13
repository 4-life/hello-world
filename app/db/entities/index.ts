import { User } from './User';
import { Vacation } from './Vacation';
import { Notification } from './Notification';
import './PaginationInput';

export * from './User';
export * from './Vacation';
export * from './Notification';
export * from './PaginationInput';

const entities = [User, Vacation, Notification];

export default entities;
