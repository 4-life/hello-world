'use client';

import { JSX } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { OrderStatus } from '@/app/db/entities/OrderStatus';
import { EngineersQuery } from '@/app/libs/getEngineers';

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

const OPEN_STATUSES: string[] = [
  OrderStatus.NEW,
  OrderStatus.SCHEDULED,
  OrderStatus.IN_PROGRESS,
];

type EngineerRow = EngineersQuery['engineers']['items'][number];

export const columns: ColumnDef<EngineerRow>[] = [
  {
    accessorKey: 'firstName',
    header: () => <SortableHeader field="firstName" label="First name" />,
    cell: ({ row }) => (
      <Link
        href={`/engineers/${row.original.id}`}
        className="underline underline-offset-4 hover:text-foreground text-muted-foreground"
      >
        {row.original.firstName}
      </Link>
    ),
  },
  {
    accessorKey: 'lastName',
    header: () => <SortableHeader field="lastName" label="Last name" />,
    cell: ({ row }) => row.original.lastName,
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => row.original.phone ?? '—',
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.original.email ?? '—',
  },
  {
    accessorKey: 'specialization',
    header: 'Specialization',
    cell: ({ row }) => row.original.specialization ?? '—',
  },
  {
    accessorKey: 'isActive',
    header: 'Active',
    cell: ({ row }) => (row.original.isActive ? 'Yes' : 'No'),
  },
  {
    id: 'openOrders',
    header: 'Open orders',
    cell: ({ row }) =>
      row.original.orders.filter((o) => OPEN_STATUSES.includes(o.status))
        .length,
  },
];
