import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import type { EngineerStock } from '../db/entities';

const SET_STOCK = gql`
  mutation SetStock($data: SetStockInput!) {
    setStock(data: $data) {
      id
      quantity
      minQuantity
      isLowStock
    }
  }
`;

interface SetStockInput {
  engineerId: string;
  partId: string;
  quantity: number;
  minQuantity: number;
}

interface SetStockResult {
  setStock: Pick<EngineerStock, 'id' | 'quantity' | 'minQuantity'> & {
    isLowStock: boolean;
  };
}

export default function useSetStock(): ReturnType<
  typeof useMutation<SetStockResult, { data: SetStockInput }>
> {
  return useMutation<SetStockResult, { data: SetStockInput }>(SET_STOCK);
}
