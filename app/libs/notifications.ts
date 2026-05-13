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

export function useNotifications(): ReturnType<typeof useQuery<NotificationsData>> {
  return useQuery<NotificationsData>(NOTIFICATIONS_QUERY);
}

export function useMarkNotificationsRead(): ReturnType<
  typeof useMutation<Record<'markNotificationsRead', boolean>>
> {
  return useMutation<Record<'markNotificationsRead', boolean>>(MARK_READ_MUTATION);
}
