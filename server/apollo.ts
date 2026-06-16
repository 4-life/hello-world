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
      formatError(formatted) {
        const raw = formatted.extensions?.validationErrors as
          | { property: string; constraints: Record<string, string> }[]
          | undefined;

        if (!raw?.length) return formatted;

        const fields = Object.fromEntries(
          raw.map(({ property, constraints }) => [
            property,
            Object.values(constraints)[0],
          ]),
        );

        return {
          ...formatted,
          message: 'Validation failed',
          extensions: { code: 'VALIDATION_ERROR', fields },
        };
      },
    });
  }
  return server;
}
