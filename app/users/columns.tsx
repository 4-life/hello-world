'use client';

import { JSX } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { UsersQuery } from '@/app/libs/getUsers';
import { formatDate } from '@/app/orders/format';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

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

type UserRow = UsersQuery['users']['items'][number];

export const columns: ColumnDef<UserRow>[] = [
  {
    id: 'avatar',
    header: '',
    cell: ({ row }) => {
      const { firstName, lastName, login, avatar } = row.original;
      const initials = getInitials(firstName, lastName, login);

      return (
        <Avatar>
          {avatar && <AvatarImage src={avatar} alt={login} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      );
    },
  },
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
    accessorKey: 'createdDate',
    header: () => <SortableHeader field="createdDate" label="Created date" />,
    cell: ({ row }) => formatDate(row.original.createdDate),
  },
];
