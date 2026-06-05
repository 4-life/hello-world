import { getApolloServer } from '@/server/apollo';
import type { Context } from '@/server/context';

let started = false;

export async function gql<T = Record<string, unknown>>(
  query: string,
  variables?: Record<string, unknown>,
  ctx: Context = { userId: null, role: null, ip: null },
): Promise<{ data?: T; errors?: { message: string; extensions?: Record<string, unknown> }[] }> {
  const server = await getApolloServer();

  if (!started) {
    await server.start();
    started = true;
  }

  const res = await server.executeOperation(
    { query, variables },
    { contextValue: ctx },
  );

  if (res.body.kind !== 'single') throw new Error('Unexpected incremental response');
  return res.body.singleResult as { data?: T; errors?: { message: string; extensions?: Record<string, unknown> }[] };
}
