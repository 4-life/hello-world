import { getClient } from '@/server/getServerApolloClient';
import { gql } from '@apollo/client';
import { Part, PartsFilter, PaginationInput } from '../db/entities';
import { cache } from 'react';

export interface PartsQuery {
  parts: {
    items: {
      id: Part['id'];
      name: Part['name'];
      sku: Part['sku'];
      unit: Part['unit'];
      description?: Part['description'] | null;
    }[];
    total: number;
  };
}

const GET_PARTS = gql`
  query GetParts($filter: PartsFilter, $pagination: PaginationInput) {
    parts(filter: $filter, pagination: $pagination) {
      items {
        id
        name
        sku
        unit
        description
      }
      total
    }
  }
`;

export default cache(
  async (filter?: PartsFilter, pagination?: PaginationInput) => {
    const client = getClient();
    const { data, error } = await client.query<PartsQuery>({
      query: GET_PARTS,
      variables: { filter, pagination },
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    });
    return { data, error };
  },
);
