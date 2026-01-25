import { AuthChecker, buildSchema } from 'type-graphql';
import { UserResolver } from './resolvers/UserResolver';
import { PostResolver } from './resolvers/PostResolver';
import { Context } from '@/server/context';

export const authChecker: AuthChecker<Context> = ({ context }) => {
  return !!context.userId;
};

export async function buildGqlSchema() {
  return buildSchema({
    resolvers: [UserResolver, PostResolver],
    validate: false,
    authChecker,
  });
}
