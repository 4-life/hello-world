import { AuthChecker, buildSchema, registerEnumType } from 'type-graphql';
import { type GraphQLSchema } from 'graphql';
import { UserResolver } from '@/app/db/entities/user/User.resolver';
import { NotificationResolver } from '@/app/db/entities/notification/Notification.resolver';
import { OrderResolver } from '@/app/db/entities/order/Order.resolver';
import { EngineerResolver } from '@/app/db/entities/engineer/Engineer.resolver';
import { StoreResolver } from '@/app/db/entities/store/Store.resolver';
import { DashboardResolver } from '@/app/db/entities/dashboard/Dashboard.resolver';
import { ClientResolver } from '@/app/db/entities/client/Client.resolver';
import { InvoiceResolver } from '@/app/db/entities/invoice/Invoice.resolver';
import { Context } from '@/server/context';
import {
  UsersFilter,
  PaginationInput,
  UpdateUserInput,
  PaginatedUsersResponse,
  OrdersFilter,
  OrdersSortInput,
  UpdateOrderInput,
  PaginatedOrdersResponse,
  EngineersFilter,
  EngineersSortInput,
  UpdateEngineerInput,
  PaginatedEngineersResponse,
  PartsFilter,
  UpdatePartInput,
  PaginatedPartsResponse,
  SetStockInput,
  ClientsFilter,
  ClientsSortInput,
  UpdateClientInput,
  PaginatedClientsResponse,
  InvoicesFilter,
  InvoicesSortInput,
  UpdateInvoiceInput,
  PaginatedInvoicesResponse,
  SortOrder,
} from '@/app/db/entities';

registerEnumType(SortOrder, { name: 'SortOrder' });

export const authChecker: AuthChecker<Context> = ({ context }, roles) => {
  if (!context.userId) return false;
  if (roles.length === 0) return true;
  return roles.includes(context.role ?? '');
};

export async function buildGqlSchema(): Promise<GraphQLSchema> {
  return buildSchema({
    resolvers: [
      UserResolver,
      NotificationResolver,
      OrderResolver,
      EngineerResolver,
      StoreResolver,
      DashboardResolver,
      ClientResolver,
      InvoiceResolver,
    ],
    orphanedTypes: [
      UsersFilter,
      PaginationInput,
      UpdateUserInput,
      PaginatedUsersResponse,
      OrdersFilter,
      OrdersSortInput,
      UpdateOrderInput,
      PaginatedOrdersResponse,
      EngineersFilter,
      EngineersSortInput,
      UpdateEngineerInput,
      PaginatedEngineersResponse,
      PartsFilter,
      UpdatePartInput,
      PaginatedPartsResponse,
      SetStockInput,
      ClientsFilter,
      ClientsSortInput,
      UpdateClientInput,
      PaginatedClientsResponse,
      InvoicesFilter,
      InvoicesSortInput,
      UpdateInvoiceInput,
      PaginatedInvoicesResponse,
    ],
    validate: { forbidUnknownValues: false },
    authChecker,
  });
}
