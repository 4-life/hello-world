'use client';

import { JSX } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { ClientsQuery } from '@/app/libs/getClients';
import { formatDate } from '@/app/orders/format';

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

type ClientRow = ClientsQuery['clients']['items'][number];

export const columns: ColumnDef<ClientRow>[] = [
  {
    accessorKey: 'name',
    header: () => <SortableHeader field="name" label="Name" />,
    cell: ({ row }) => (
      <Link
        href={`/clients/${row.original.id}`}
        className="underline underline-offset-4 hover:text-foreground text-muted-foreground"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.original.email ?? '—',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => row.original.phone ?? '—',
  },
  {
    id: 'invoices',
    header: 'Invoices',
    cell: ({ row }) => row.original.invoices.length,
  },
  {
    accessorKey: 'createdDate',
    header: () => <SortableHeader field="createdDate" label="Created date" />,
    cell: ({ row }) => formatDate(row.original.createdDate),
  },
];
