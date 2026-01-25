import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from '@apollo/client-integration-nextjs';
import { HttpLink } from '@apollo/client';
import { cookies } from 'next/headers';

export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: `${process.env.NEXT_PUBLIC_API_URL}/api/graphql`,

      fetch: async (uri, options) => {
        return fetch(uri, {
          ...options,
          credentials: 'include',
          headers: {
            ...options?.headers,
            cookie: (await cookies()).toString(),
          },
        });
      },
    }),
  });
});
