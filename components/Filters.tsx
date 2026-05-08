'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { UserRole } from '@/app/db/entities/UserRole';
import { useCallback } from 'react';

export default function Filters(): React.JSX.Element {
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
      <input
        type="text"
        placeholder="Filter by email…"
        defaultValue={searchParams.get('email') ?? ''}
        onChange={(e) => update('email', e.target.value.trim())}
        className="h-8 rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
      />

      <select
        value={searchParams.get('role') ?? ''}
        onChange={(e) => update('role', e.target.value)}
        className="h-8 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">All roles</option>
        {Object.keys(UserRole).map((key) => (
          <option key={key} value={key}>
            {key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
