'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { PaymentStatus } from '@/app/db/entities/PaymentStatus';
import { formatLabel } from '@/app/orders/statusBadge';

interface ClientOption {
  id: string;
  name: string;
}

interface Props {
  clients: ClientOption[];
}

export default function InvoicesFilters({ clients }: Props): React.JSX.Element {
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
        value={searchParams.get('clientId') ?? ''}
        onChange={(e) => update('clientId', e.target.value)}
        className="h-8 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">All clients</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get('paymentStatus') ?? ''}
        onChange={(e) => update('paymentStatus', e.target.value)}
        className="h-8 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">All payment statuses</option>
        {Object.keys(PaymentStatus).map((key) => (
          <option key={key} value={key}>
            {formatLabel(key)}
          </option>
        ))}
      </select>
    </div>
  );
}
