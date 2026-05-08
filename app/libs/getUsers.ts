import { getClient } from '@/server/getServerApolloClient';
import { gql } from '@apollo/client';
import { PaginationInput, User, UsersFilter } from '../db/entities';
import { cache } from 'react';

export interface UsersQuery {
  users: {
    items: {
      id: User['id'];
      login: User['login'];
      firstName?: User['firstName'] | null;
      lastName?: User['lastName'] | null;
      email?: User['email'] | null;
      role: User['role'];
      startWorkDate?: User['startWorkDate'] | null;
      vacations: { startDate: Date; endDate: Date }[];
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
        firstName
        lastName
        email
        role
        startWorkDate
        vacations {
          startDate
          endDate
        }
      }
      total
    }
  }
`;

export default cache(
  async (filter: UsersFilter, pagination: PaginationInput) => {
    const client = getClient();
    const { data, error } = await client.query<UsersQuery>({
      query: GET_USERS,
      variables: { filter, pagination },
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    });
    return { data, error };
  },
);
