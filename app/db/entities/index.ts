import { User } from './user/User.entity';
import { Vacation } from './vacation/Vacation.entity';
import { Notification } from './notification/Notification.entity';
import './PaginationInput';
import './SortOrder';
import './UserRole';

export * from './user/User.entity';
export * from './user/User.inputs';
export * from './user/User.response';
export * from './vacation/Vacation.entity';
export * from './vacation/Vacation.inputs';
export * from './notification/Notification.entity';
export * from './PaginationInput';
export * from './SortOrder';

const entities = [User, Vacation, Notification];

export default entities;
