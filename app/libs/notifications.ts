import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';

const NOTIFICATIONS_QUERY = gql`
  query Notifications {
    notifications {
      id
      message
      createdAt
    }
  }
`;

const MARK_READ_MUTATION = gql`
  mutation MarkNotificationsRead {
    markNotificationsRead
  }
`;

export type NotificationItem = {
  id: string;
  message: string;
  createdAt: string;
};

type NotificationsData = { notifications: NotificationItem[] };
type Query = typeof useQuery<NotificationsData>;

export function useNotifications(): ReturnType<Query> {
  return useQuery<NotificationsData>(NOTIFICATIONS_QUERY);
}

type Mutation = typeof useMutation<Record<'markNotificationsRead', boolean>>;

export function useMarkNotificationsRead(): ReturnType<Mutation> {
  return useMutation<Record<'markNotificationsRead', boolean>>(
    MARK_READ_MUTATION,
  );
}
