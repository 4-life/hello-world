'use client';

import { JSX } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { OrdersQuery } from '@/app/libs/getOrders';
import { Badge } from '@/components/ui/badge';
import {
  formatLabel,
  orderStatusVariant,
  paymentStatusVariant,
} from '@/app/orders/statusBadge';
import { formatDate, formatTime } from '@/app/orders/format';

function SortableHeader({
  field,
  label,
}: {
  field: string;
  label: string;
}): JSX.Element {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentField = searchParams.get('sortField');
  const currentOrder = searchParams.get('sortOrder') ?? 'ASC';
  const isActive = currentField === field;
  const nextOrder = isActive && currentOrder === 'ASC' ? 'DESC' : 'ASC';

  const handleSort = (): void => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortField', field);
    params.set('sortOrder', nextOrder);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <button
      onClick={handleSort}
      className="flex items-center gap-1 hover:text-foreground"
    >
      {label}
      {isActive ? (
        currentOrder === 'ASC' ? (
          <ArrowUp size={14} />
        ) : (
          <ArrowDown size={14} />
        )
      ) : (
        <ArrowUpDown size={14} className="text-muted-foreground" />
      )}
    </button>
  );
}

type OrderRow = OrdersQuery['orders']['items'][number];

export const columns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: 'orderNumber',
    header: () => <SortableHeader field="orderNumber" label="Order #" />,
    cell: ({ row }) => (
      <Link
        href={`/orders/${row.original.id}`}
        className="underline underline-offset-4 hover:text-foreground text-muted-foreground"
      >
        #{row.original.orderNumber}
      </Link>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => formatLabel(row.original.type),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={orderStatusVariant(row.original.status)}>
        {formatLabel(row.original.status)}
      </Badge>
    ),
  },
  {
    id: 'client',
    header: 'Client',
    cell: ({ row }) => {
      const { invoice } = row.original;
      if (!invoice) return <span className="text-muted-foreground">—</span>;
      return (
        <Link
          href={`/clients/${invoice.client.id}`}
          className="underline underline-offset-4 hover:text-foreground text-muted-foreground"
        >
          {invoice.client.name}
        </Link>
      );
    },
  },
  {
    accessorKey: 'invoice',
    header: 'Payment',
    cell: ({ row }) => {
      const { invoice } = row.original;
      if (!invoice) return <span className="text-muted-foreground">—</span>;
      return (
        <Link
          href={`/invoices/${invoice.id}`}
          className="underline-offset-4 hover:underline"
        >
          <Badge variant={paymentStatusVariant(invoice.paymentStatus)}>
            {formatLabel(invoice.paymentStatus)}
          </Badge>
        </Link>
      );
    },
  },
  {
    accessorKey: 'scheduledDate',
    header: () => <SortableHeader field="scheduledDate" label="Scheduled" />,
    cell: ({ row }) => {
      const { scheduledDate, timeWindowStart, timeWindowEnd } = row.original;
      if (!scheduledDate) return '—';
      const date = formatDate(scheduledDate);
      if (timeWindowStart && timeWindowEnd) {
        return `${date}, ${formatTime(timeWindowStart)}–${formatTime(timeWindowEnd)}`;
      }
      return date;
    },
  },
  {
    accessorKey: 'engineer',
    header: 'Engineer',
    cell: ({ row }) => {
      const { engineer } = row.original;
      if (!engineer)
        return <span className="text-muted-foreground">Unassigned</span>;
      return (
        <Link
          href={`/engineers/${engineer.id}`}
          className="underline underline-offset-4 hover:text-foreground text-muted-foreground"
        >
          {engineer.firstName} {engineer.lastName}
        </Link>
      );
    },
  },
  {
    accessorKey: 'createdDate',
    header: () => <SortableHeader field="createdDate" label="Created date" />,
    cell: ({ row }) => formatDate(row.original.createdDate),
  },
];
