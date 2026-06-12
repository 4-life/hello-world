'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { OrderType } from '@/app/db/entities/OrderType';
import { OrderStatus } from '@/app/db/entities/OrderStatus';
import { formatLabel } from '@/app/orders/statusBadge';

interface EngineerOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface Props {
  engineers: EngineerOption[];
}

export default function OrdersFilters({ engineers }: Props): React.JSX.Element {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={searchParams.get('type') ?? ''}
        onChange={(e) => update('type', e.target.value)}
        className="h-8 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">All types</option>
        {Object.keys(OrderType).map((key) => (
          <option key={key} value={key}>
            {formatLabel(key)}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get('status') ?? ''}
        onChange={(e) => update('status', e.target.value)}
        className="h-8 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">All statuses</option>
        {Object.keys(OrderStatus).map((key) => (
          <option key={key} value={key}>
            {formatLabel(key)}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get('engineerId') ?? ''}
        onChange={(e) => update('engineerId', e.target.value)}
        className="h-8 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">All engineers</option>
        {engineers.map((engineer) => (
          <option key={engineer.id} value={engineer.id}>
            {engineer.firstName} {engineer.lastName}
          </option>
        ))}
      </select>
    </div>
  );
}
