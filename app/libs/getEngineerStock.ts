import { getClient } from '@/server/getServerApolloClient';
import { gql } from '@apollo/client';
import { cache } from 'react';

export interface EngineerStockQuery {
  engineerStock: {
    id: string;
    quantity: number;
    minQuantity: number;
    isLowStock: boolean;
    engineer: { id: string; firstName: string; lastName: string };
    part: { id: string; name: string; sku: string; unit: string };
  }[];
}

const GET_ENGINEER_STOCK = gql`
  query GetEngineerStock($engineerId: String) {
    engineerStock(engineerId: $engineerId) {
      id
      quantity
      minQuantity
      isLowStock
      engineer {
        id
        firstName
        lastName
      }
      part {
        id
        name
        sku
        unit
      }
    }
  }
`;

export default cache(async (engineerId?: string) => {
  const client = getClient();
  const { data, error } = await client.query<EngineerStockQuery>({
    query: GET_ENGINEER_STOCK,
    variables: { engineerId },
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });
  return { data, error };
});
