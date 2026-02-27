import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { getApolloServer } from '@/server/apollo';
import { createContext } from '@/server/context';
import { NextRequest } from 'next/server';

let handler: ReturnType<typeof startServerAndCreateNextHandler> | null = null;

async function getHandler(): Promise<
  ReturnType<typeof startServerAndCreateNextHandler>
> {
  if (!handler) {
    const server = await getApolloServer();
    handler = startServerAndCreateNextHandler<NextRequest>(server, {
      context: async (req) => await createContext(req),
    });
  }
  return handler;
}

export async function GET(request: Request): Promise<Response> {
  const resolvedHandler = await getHandler();
  return resolvedHandler(request);
}

export const POST = GET;
