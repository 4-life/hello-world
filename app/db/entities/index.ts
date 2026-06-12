import { User } from './User';
import { Notification } from './Notification';
import { Engineer } from './Engineer';
import { Order } from './Order';
import { Part } from './Part';
import { EngineerStock } from './EngineerStock';
import { Client } from './Client';
import { Invoice } from './Invoice';
import './PaginationInput';
import './SortOrder';

export * from './User';
export * from './Notification';
export * from './Engineer';
export * from './Order';
export * from './Part';
export * from './EngineerStock';
export * from './Client';
export * from './Invoice';
export * from './OrderType';
export * from './OrderStatus';
export * from './PaymentStatus';
export * from './PaginationInput';
export * from './SortOrder';
export * from './DashboardStats';

const entities = [
  User,
  Notification,
  Engineer,
  Order,
  Part,
  EngineerStock,
  Client,
  Invoice,
];

export default entities;
