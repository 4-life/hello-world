import { notFound } from 'next/navigation';
import Link from 'next/link';
import getClient from '@/app/libs/getClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatLabel, paymentStatusVariant } from '@/app/orders/statusBadge';
import { formatDate } from '@/app/orders/format';
import BackButton from '@/components/BackButton';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({
  params,
}: Props): Promise<React.JSX.Element> {
  const { id } = await params;
  const { data, error } = await getClient(id);

  if (error) {
    return <p className="p-6 text-destructive">{error.message}</p>;
  }

  if (!data?.client) {
    notFound();
  }

  const client = data.client;

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <BackButton href="/clients" label="Back to clients" />

      <h1 className="text-2xl font-semibold">{client.name}</h1>

      <div className="rounded-lg border p-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground text-xs">Email</span>
          <p>{client.email ?? '—'}</p>
        </div>

        <div>
          <span className="text-muted-foreground text-xs">Phone</span>
          <p>{client.phone ?? '—'}</p>
        </div>

        <div className="col-span-2">
          <span className="text-muted-foreground text-xs">Address</span>
          <p>{client.address ?? '—'}</p>
        </div>

        <div>
          <span className="text-muted-foreground text-xs">Created</span>
          <p>{formatDate(client.createdDate)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Invoices</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {client.invoices.length ? (
              client.invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="underline underline-offset-4 hover:text-foreground text-muted-foreground"
                    >
                      #{invoice.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {invoice.order ? (
                      <Link
                        href={`/orders/${invoice.order.id}`}
                        className="underline underline-offset-4 hover:text-foreground text-muted-foreground"
                      >
                        #{invoice.order.orderNumber}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={paymentStatusVariant(invoice.paymentStatus)}
                    >
                      {formatLabel(invoice.paymentStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(invoice.issuedDate)}</TableCell>
                  <TableCell>
                    {invoice.dueDate ? formatDate(invoice.dueDate) : '—'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No invoices yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
