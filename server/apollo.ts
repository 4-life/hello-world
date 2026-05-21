import { ApolloServer } from '@apollo/server';
import { buildGqlSchema } from '@/app/api/graphql/schema';
import { dbInit } from '@/app/db/db';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { getApolloCache } from './cache';

let server: ApolloServer;

export async function getApolloServer(): Promise<ApolloServer> {
  if (!server) {
    await dbInit;

    const schema = await buildGqlSchema();

    const plugins =
      process.env.NODE_ENV === 'development'
        ? [
            ApolloServerPluginLandingPageLocalDefault({
              embed: true,
            }),
          ]
        : [];

    server = new ApolloServer({
      schema,
      cache: getApolloCache(),
      plugins,
    });
  }
  return server;
}
