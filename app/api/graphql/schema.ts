import { AuthChecker, buildSchema } from 'type-graphql';
import { type GraphQLSchema } from 'graphql';
import { UserResolver } from '@/app/db/entities/user/User.resolver';
import { VacationResolver } from '@/app/db/entities/vacation/Vacation.resolver';
import { NotificationResolver } from '@/app/db/entities/notification/Notification.resolver';
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
    validate: { forbidUnknownValues: false },
    authChecker,
  });
}
