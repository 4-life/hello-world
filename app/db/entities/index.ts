import { User } from './user/User.entity';
import { Notification } from './notification/Notification.entity';
import { Engineer } from './engineer/Engineer.entity';
import { Order } from './order/Order.entity';
import { Part } from './store/Part.entity';
import { EngineerStock } from './store/EngineerStock.entity';
import { Client } from './client/Client.entity';
import { Invoice } from './invoice/Invoice.entity';
import './PaginationInput';
import './SortOrder';

export * from './user/User.entity';
export * from './user/User.types';
export * from './user/User.inputs';
export * from './user/User.response';
export * from './notification/Notification.entity';
export * from './engineer/Engineer.entity';
export * from './engineer/Engineer.inputs';
export * from './engineer/Engineer.response';
export * from './order/Order.entity';
export * from './order/Order.types';
export * from './order/Order.inputs';
export * from './order/Order.response';
export * from './store/Part.entity';
export * from './store/Part.inputs';
export * from './store/Part.response';
export * from './store/EngineerStock.entity';
export * from './store/EngineerStock.inputs';
export * from './client/Client.entity';
export * from './client/Client.inputs';
export * from './client/Client.response';
export * from './invoice/Invoice.entity';
export * from './invoice/Invoice.types';
export * from './invoice/Invoice.inputs';
export * from './invoice/Invoice.response';
export * from './dashboard/Dashboard.response';
export * from './PaginationInput';
export * from './SortOrder';

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
