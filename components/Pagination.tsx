'use client';

import Link from 'next/link';
import { buildQuery } from '@/utils';
import { useSearchParams } from 'next/navigation';

interface Props {
  limit: number;
  page: number;
  total: number;
}

export default function Pagination({
  page,
  total,
  limit,
}: Props): React.JSX.Element {
  const searchParams = useSearchParams();
  return (
    <div>
      {page > 1 && (
        <Link href={buildQuery(searchParams, { page: String(page - 1) })}>
          ← Prev{' '}
        </Link>
      )}

      <span>
        Page {page} of {Math.ceil(total / limit)}{' '}
      </span>

      {page < total && (
        <Link href={buildQuery(searchParams, { page: String(page + 1) })}>
          Next →
        </Link>
      )}
    </div>
  );
}
