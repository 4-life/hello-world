import { getClient } from '@/server/getServerApolloClient';
import { gql } from '@apollo/client';
import {
  Engineer,
  EngineersFilter,
  EngineersSortInput,
  PaginationInput,
} from '../db/entities';
import { cache } from 'react';

export interface EngineersQuery {
  engineers: {
    items: {
      id: Engineer['id'];
      firstName: Engineer['firstName'];
      lastName: Engineer['lastName'];
      phone?: Engineer['phone'] | null;
      email?: Engineer['email'] | null;
      specialization?: Engineer['specialization'] | null;
      isActive: Engineer['isActive'];
      createdDate: Engineer['createdDate'];
      orders: { id: string; status: string }[];
    }[];
    total: number;
  };
}

const GET_ENGINEERS = gql`
  query GetEngineers(
    $filter: EngineersFilter
    $pagination: PaginationInput
    $sort: EngineersSortInput
  ) {
    engineers(filter: $filter, pagination: $pagination, sort: $sort) {
      items {
        id
        firstName
        lastName
        phone
        email
        specialization
        isActive
        createdDate
        orders {
          id
          status
        }
      }
      total
    }
  }
`;

export default cache(
  async (
    filter?: EngineersFilter,
    pagination?: PaginationInput,
    sort?: EngineersSortInput,
  ) => {
    const client = getClient();
    const { data, error } = await client.query<EngineersQuery>({
      query: GET_ENGINEERS,
      variables: { filter, pagination, sort },
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    });
    return { data, error };
  },
);
