import getInvoices from '@/app/libs/getInvoices';
import getClients from '@/app/libs/getClients';
import getOrders from '@/app/libs/getOrders';
import { PaymentStatus, InvoiceSortField, SortOrder } from '@/app/db/entities';
import { columns } from './columns';
import { DataTable } from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import InvoicesFilters from './InvoicesFilters';
import CreateInvoiceDialog from '@/components/CreateInvoiceDialog';

type Props = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    clientId?: string;
    paymentStatus?: PaymentStatus;
    sortField?: string;
    sortOrder?: string;
  }>;
};

export default async function InvoicesPage({
  searchParams,
}: Props): Promise<React.JSX.Element> {
  const params = await searchParams;
  const { clientId, paymentStatus } = params;
  const page = Number(params.page ?? 1);
  const limit = Number(params.limit ?? 10);
  const offset = (page - 1) * limit;

  const sortField =
    params.sortField && params.sortField in InvoiceSortField
      ? (params.sortField as InvoiceSortField)
      : undefined;
  const sortOrder =
    params.sortOrder === 'DESC' ? SortOrder.DESC : SortOrder.ASC;
  const sort = sortField ? { field: sortField, order: sortOrder } : undefined;

  const [{ data, error }, { data: clientsData }, { data: ordersData }] =
    await Promise.all([
      getInvoices({ clientId, paymentStatus }, { limit, offset }, sort),
      getClients({}, { limit: 100, offset: 0 }),
      getOrders({}, { limit: 100, offset: 0 }),
    ]);

  if (error) {
    return <p className="p-6 text-destructive">{error.message}</p>;
  }

  const invoices = data?.invoices.items ?? [];
  const clients = clientsData?.clients.items ?? [];
  const availableOrders = (ordersData?.orders.items ?? []).filter(
    (order) => !order.invoice,
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Invoices{' '}
          <span className="text-sm font-normal text-muted-foreground">
            ({data?.invoices.total ?? 0})
          </span>
        </h1>
        <CreateInvoiceDialog clients={clients} orders={availableOrders} />
      </div>

      <InvoicesFilters clients={clients} />

      <DataTable
        columns={columns}
        data={invoices}
        emptyMessage="No invoices found."
      />

      <Pagination limit={limit} page={page} total={data?.invoices.total ?? 0} />
    </div>
  );
}
