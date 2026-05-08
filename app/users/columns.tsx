'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { UsersQuery } from '@/app/libs/getUsers';
import { calcAvailableDays } from '@/app/libs/vacationDays';

type UserRow = UsersQuery['users']['items'][number];

export const columns: ColumnDef<UserRow>[] = [
  {
    accessorKey: 'login',
    header: 'Login',
    cell: ({ row }) => (
      <Link
        href={`/users/profile/${row.original.id}`}
        className="underline underline-offset-4 hover:text-foreground text-muted-foreground"
      >
        {row.original.login}
      </Link>
    ),
  },
  {
    accessorKey: 'firstName',
    header: 'First name',
    cell: ({ row }) => row.original.firstName ?? '—',
  },
  {
    accessorKey: 'lastName',
    header: 'Last name',
    cell: ({ row }) => row.original.lastName ?? '—',
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.original.email ?? '—',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => <span className="capitalize">{row.original.role}</span>,
  },
  {
    id: 'availableVacationDays',
    header: 'Available vacation days',
    cell: ({ row }) => {
      const days = calcAvailableDays(
        row.original.startWorkDate,
        row.original.vacations,
      );
      return days ?? '—';
    },
  },
];
