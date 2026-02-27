import { ApolloServer } from '@apollo/server';
import { buildGqlSchema } from '@/app/api/graphql/schema';
import { db } from '@/app/db/db';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

let server: ApolloServer;

export async function getApolloServer(): Promise<ApolloServer> {
  if (!server) {
    if (!db.isInitialized) {
      await db.initialize();
    }

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
      plugins,
    });
  }
  return server;
}
