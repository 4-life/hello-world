import { getClient } from '@/server/getServerApolloClient';
import { gql } from '@apollo/client';
import { PaginationInput, Post, User, UsersFilter } from '../db/entities';
import { cache } from 'react';

export interface UsersQuery {
  users: {
    items: {
      id: User['id'];
      login: User['login'];
      pinnedPost?: {
        id: Post['id'];
        title: Post['title'];
        content?: Post['content'];
      } | null;
    }[];
    total: number;
  };
}

const GET_USERS = gql`
  query GetUsers($filter: UsersFilter, $pagination: PaginationInput) {
    users(filter: $filter, pagination: $pagination) {
      items {
        id
        login
        pinnedPost {
          id
          title
          content
        }
      }
      total
    }
  }
`;


export default cache(async (filter: UsersFilter, pagination: PaginationInput) => {
  const client = getClient();
  const { data, error } = await client.query<UsersQuery>({
    query: GET_USERS,
    variables: { filter, pagination },
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });
  return { data, error };
});
