import { getClient } from '@/server/getServerApolloClient';
import { gql } from '@apollo/client';
import {
  PaginationInput,
  User,
  UsersFilter,
  UsersSortInput,
} from '../db/entities';
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
      createdDate: User['createdDate'];
      vacations: { startDate: Date; endDate: Date }[];
    }[];
    total: number;
  };
}

const GET_USERS = gql`
  query GetUsers(
    $filter: UsersFilter
    $pagination: PaginationInput
    $sort: UsersSortInput
  ) {
    users(filter: $filter, pagination: $pagination, sort: $sort) {
      items {
        id
        login
        firstName
        lastName
        email
        role
        startWorkDate
        createdDate
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
  async (
    filter: UsersFilter,
    pagination: PaginationInput,
    sort?: UsersSortInput,
  ) => {
    const client = getClient();
    const { data, error } = await client.query<UsersQuery>({
      query: GET_USERS,
      variables: { filter, pagination, sort },
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    });
    return { data, error };
  },
);
