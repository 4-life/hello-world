'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { UserRole } from '@/app/db/entities/UserRole';

export default function Filters(): React.JSX.Element {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentRole = useMemo<UserRole | null>(() => {
    return searchParams.get('role') as UserRole | null;
  }, [searchParams]);

  const updateQuery = (role: UserRole): void => {
    const params = new URLSearchParams(searchParams.toString());

    if (!role) {
      params.delete('role');
    } else {
      params.set('role', role);
    }

    // reset page when changing filter
    params.delete('page');

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={currentRole || ''}
      onChange={(e) => updateQuery(e.target.value as UserRole)}
    >
      <option value={''}>All</option>
      {Object.keys(UserRole).map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  );
}
