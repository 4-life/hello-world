import getOrders from '@/app/libs/getOrders';
import getEngineers from '@/app/libs/getEngineers';
import {
  OrderType,
  OrderStatus,
  OrderSortField,
  SortOrder,
} from '@/app/db/entities';
import { columns } from './columns';
import { DataTable } from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import OrdersFilters from './OrdersFilters';
import CreateOrderDialog from '@/components/CreateOrderDialog';

type Props = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    type?: OrderType;
    status?: OrderStatus;
    engineerId?: string;
    sortField?: string;
    sortOrder?: string;
  }>;
};

export default async function OrdersPage({
  searchParams,
}: Props): Promise<React.JSX.Element> {
  const params = await searchParams;
  const { type, status, engineerId } = params;
  const page = Number(params.page ?? 1);
  const limit = Number(params.limit ?? 10);
  const offset = (page - 1) * limit;

  const sortField =
    params.sortField && params.sortField in OrderSortField
      ? (params.sortField as OrderSortField)
      : undefined;
  const sortOrder =
    params.sortOrder === 'DESC' ? SortOrder.DESC : SortOrder.ASC;
  const sort = sortField ? { field: sortField, order: sortOrder } : undefined;

  const [{ data, error }, { data: engineersData }] = await Promise.all([
    getOrders({ type, status, engineerId }, { limit, offset }, sort),
    getEngineers({ isActive: true }, { limit: 100, offset: 0 }),
  ]);

  if (error) {
    return <p className="p-6 text-destructive">{error.message}</p>;
  }

  const orders = data?.orders.items ?? [];
  const engineers = engineersData?.engineers.items ?? [];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Orders{' '}
          <span className="text-sm font-normal text-muted-foreground">
            ({data?.orders.total ?? 0})
          </span>
        </h1>
        <CreateOrderDialog engineers={engineers} />
      </div>

      <OrdersFilters engineers={engineers} />

      <DataTable
        columns={columns}
        data={orders}
        emptyMessage="No orders found."
      />

      <Pagination limit={limit} page={page} total={data?.orders.total ?? 0} />
    </div>
  );
}
