import { getClient } from '@/server/getServerApolloClient';
import { gql } from '@apollo/client';
import { Engineer } from '../db/entities';
import { cache } from 'react';

export interface EngineerQuery {
  engineer: {
    id: Engineer['id'];
    firstName: Engineer['firstName'];
    lastName: Engineer['lastName'];
    phone?: Engineer['phone'] | null;
    email?: Engineer['email'] | null;
    specialization?: Engineer['specialization'] | null;
    isActive: Engineer['isActive'];
    createdDate: Engineer['createdDate'];
    orders: {
      id: string;
      orderNumber: number;
      type: string;
      status: string;
      scheduledDate?: string | null;
    }[];
    stock: {
      id: string;
      quantity: number;
      minQuantity: number;
      isLowStock: boolean;
      part: { id: string; name: string; sku: string; unit: string };
    }[];
  } | null;
}

const GET_ENGINEER = gql`
  query GetEngineer($id: String!) {
    engineer(id: $id) {
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
        orderNumber
        type
        status
        scheduledDate
      }
      stock {
        id
        quantity
        minQuantity
        isLowStock
        part {
          id
          name
          sku
          unit
        }
      }
    }
  }
`;

export default cache(async (id: string) => {
  const client = getClient();
  const { data, error } = await client.query<EngineerQuery>({
    query: GET_ENGINEER,
    variables: { id },
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });
  return { data, error };
});
