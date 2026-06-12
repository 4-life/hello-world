'use client';

import { JSX } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Link as LinkIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { InvoicesQuery } from '@/app/libs/getInvoices';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatLabel, paymentStatusVariant } from '@/app/orders/statusBadge';
import { formatDate } from '@/app/orders/format';

async function copyPaymentLink(invoiceId: string): Promise<void> {
  const url = `${window.location.origin}/pay/${invoiceId}`;
  try {
    await navigator.clipboard.writeText(url);
    toast.success('Payment link copied');
  } catch {
    toast.error('Failed to copy payment link');
  }
}

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

type InvoiceRow = InvoicesQuery['invoices']['items'][number];

export const columns: ColumnDef<InvoiceRow>[] = [
  {
    accessorKey: 'invoiceNumber',
    header: () => <SortableHeader field="invoiceNumber" label="Invoice #" />,
    cell: ({ row }) => (
      <Link
        href={`/invoices/${row.original.id}`}
        className="underline underline-offset-4 hover:text-foreground text-muted-foreground"
      >
        #{row.original.invoiceNumber}
      </Link>
    ),
  },
  {
    accessorKey: 'client',
    header: 'Client',
    cell: ({ row }) => (
      <Link
        href={`/clients/${row.original.client.id}`}
        className="underline underline-offset-4 hover:text-foreground text-muted-foreground"
      >
        {row.original.client.name}
      </Link>
    ),
  },
  {
    accessorKey: 'order',
    header: 'Order',
    cell: ({ row }) => {
      const { order } = row.original;
      if (!order) return '—';
      return (
        <Link
          href={`/orders/${order.id}`}
          className="underline underline-offset-4 hover:text-foreground text-muted-foreground"
        >
          #{order.orderNumber}
        </Link>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => row.original.amount,
  },
  {
    accessorKey: 'paymentStatus',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={paymentStatusVariant(row.original.paymentStatus)}>
        {formatLabel(row.original.paymentStatus)}
      </Badge>
    ),
  },
  {
    accessorKey: 'issuedDate',
    header: () => <SortableHeader field="issuedDate" label="Issued" />,
    cell: ({ row }) => formatDate(row.original.issuedDate),
  },
  {
    accessorKey: 'dueDate',
    header: () => <SortableHeader field="dueDate" label="Due" />,
    cell: ({ row }) =>
      row.original.dueDate ? formatDate(row.original.dueDate) : '—',
  },
  {
    id: 'paymentLink',
    header: '',
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        title="Copy payment link"
        aria-label="Copy payment link"
        onClick={() => copyPaymentLink(row.original.id)}
      >
        <LinkIcon className="size-4" />
      </Button>
    ),
  },
];
