import { AuthChecker, buildSchema } from 'type-graphql';
import { type GraphQLSchema } from 'graphql';
import { UserResolver } from './resolvers/UserResolver';
import { VacationResolver } from './resolvers/VacationResolver';
import { NotificationResolver } from './resolvers/NotificationResolver';
import { Context } from '@/server/context';
import {
  UsersFilter,
  PaginationInput,
  UpdateUserInput,
  PaginatedUsersResponse,
} from '@/app/db/entities';

export const authChecker: AuthChecker<Context> = ({ context }, roles) => {
  if (!context.userId) return false;
  if (roles.length === 0) return true;
  return roles.includes(context.role ?? '');
};

export async function buildGqlSchema(): Promise<GraphQLSchema> {
  return buildSchema({
    resolvers: [UserResolver, VacationResolver, NotificationResolver],
    orphanedTypes: [
      UsersFilter,
      PaginationInput,
      UpdateUserInput,
      PaginatedUsersResponse,
    ],
    validate: false,
    authChecker,
  });
}
