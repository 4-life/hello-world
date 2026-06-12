import { notFound } from 'next/navigation';
import Link from 'next/link';
import getEngineer from '@/app/libs/getEngineer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatLabel, orderStatusVariant } from '@/app/orders/statusBadge';
import { formatDate } from '@/app/orders/format';
import BackButton from '@/components/BackButton';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EngineerDetailPage({
  params,
}: Props): Promise<React.JSX.Element> {
  const { id } = await params;
  const { data, error } = await getEngineer(id);

  if (error) {
    return <p className="p-6 text-destructive">{error.message}</p>;
  }

  if (!data?.engineer) {
    notFound();
  }

  const engineer = data.engineer;

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <BackButton href="/engineers" label="Back to engineers" />

      <h1 className="text-2xl font-semibold">
        {engineer.firstName} {engineer.lastName}
      </h1>

      <div className="rounded-lg border p-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground text-xs">Phone</span>
          <p>{engineer.phone ?? '—'}</p>
        </div>

        <div>
          <span className="text-muted-foreground text-xs">Email</span>
          <p>{engineer.email ?? '—'}</p>
        </div>

        <div>
          <span className="text-muted-foreground text-xs">Specialization</span>
          <p>{engineer.specialization ?? '—'}</p>
        </div>

        <div>
          <span className="text-muted-foreground text-xs">Active</span>
          <p>{engineer.isActive ? 'Yes' : 'No'}</p>
        </div>

        <div>
          <span className="text-muted-foreground text-xs">Created</span>
          <p>{new Date(engineer.createdDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Assigned orders</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {engineer.orders.length ? (
              engineer.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/orders/${order.id}`}
                      className="underline underline-offset-4 hover:text-foreground text-muted-foreground"
                    >
                      #{order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{formatLabel(order.type)}</TableCell>
                  <TableCell>
                    <Badge variant={orderStatusVariant(order.status)}>
                      {formatLabel(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.scheduledDate
                      ? formatDate(order.scheduledDate)
                      : '—'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No assigned orders.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Stock</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Min quantity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {engineer.stock.length ? (
              engineer.stock.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell>{stock.part.name}</TableCell>
                  <TableCell>{stock.part.sku}</TableCell>
                  <TableCell>
                    {stock.quantity} {stock.part.unit}
                  </TableCell>
                  <TableCell>{stock.minQuantity}</TableCell>
                  <TableCell>
                    {stock.isLowStock ? (
                      <span className="text-destructive">Low</span>
                    ) : (
                      'OK'
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No stock recorded.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
