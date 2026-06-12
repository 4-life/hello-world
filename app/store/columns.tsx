'use client';

import { ColumnDef } from '@tanstack/react-table';
import { PartsQuery } from '@/app/libs/getParts';

type PartRow = PartsQuery['parts']['items'][number];

export const columns: ColumnDef<PartRow>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
  },
  {
    accessorKey: 'unit',
    header: 'Unit',
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => row.original.description ?? '—',
  },
];
