import { AuthChecker, buildSchema } from 'type-graphql';
import { type GraphQLSchema } from 'graphql';
import { UserResolver } from './resolvers/UserResolver';
import { NotificationResolver } from './resolvers/NotificationResolver';
import { OrderResolver } from './resolvers/OrderResolver';
import { EngineerResolver } from './resolvers/EngineerResolver';
import { StoreResolver } from './resolvers/StoreResolver';
import { DashboardResolver } from './resolvers/DashboardResolver';
import { ClientResolver } from './resolvers/ClientResolver';
import { InvoiceResolver } from './resolvers/InvoiceResolver';
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
} from '@/app/db/entities';

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
