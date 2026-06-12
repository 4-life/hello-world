import { getClient } from '@/server/getServerApolloClient';
import { gql } from '@apollo/client';
import { User } from '../db/entities';
import { cache } from 'react';

export interface UserQuery {
  user: {
    id: User['id'];
    login: User['login'];
    firstName?: User['firstName'];
    lastName?: User['lastName'];
    email?: User['email'];
    phone?: User['phone'];
    avatar?: User['avatar'];
    role: User['role'];
    createdDate: User['createdDate'];
  } | null;
}

const GET_USER = gql`
  query GetUser($id: String!) {
    user(id: $id) {
      id
      login
      firstName
      lastName
      email
      phone
      avatar
      role
      createdDate
    }
  }
`;

export default cache(async (id: string) => {
  const client = getClient();
  const { data, error } = await client.query<UserQuery>({
    query: GET_USER,
    variables: { id },
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });
  return { data, error };
});
