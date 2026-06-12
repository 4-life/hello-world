import { getClient } from '@/server/getServerApolloClient';
import { gql } from '@apollo/client';
import { cache } from 'react';
import { DashboardStats } from '../db/entities';

export interface DashboardStatsQuery {
  dashboardStats: DashboardStats;
}

const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalOrders
      ordersByStatus {
        status
        count
      }
      unpaidInvoices
      totalEngineers
      activeEngineers
      totalParts
      lowStockParts
    }
  }
`;

export default cache(async () => {
  const client = getClient();
  const { data, error } = await client.query<DashboardStatsQuery>({
    query: GET_DASHBOARD_STATS,
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });
  return { data, error };
});
