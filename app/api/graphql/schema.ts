import { AuthChecker, buildSchema, type GraphQLSchema } from 'type-graphql';
import { UserResolver } from './resolvers/UserResolver';
import { PostResolver } from './resolvers/PostResolver';
import { Context } from '@/server/context';
import {
  UsersFilter,
  PaginationInput,
  UpdateUserInput,
  PaginatedUsersResponse,
} from '@/app/db/entities';

export const authChecker: AuthChecker<Context> = ({ context }) => {
  return !!context.userId;
};

export async function buildGqlSchema(): Promise<GraphQLSchema> {
  return buildSchema({
    resolvers: [UserResolver, PostResolver],
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
