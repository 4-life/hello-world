'use client';

import Link from 'next/link';
import { buildQuery } from '@/utils';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

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
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex items-center gap-3 text-sm">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        asChild={page > 1}
      >
        {page > 1 ? (
          <Link href={buildQuery(searchParams, { page: String(page - 1) })}>
            ← Prev
          </Link>
        ) : (
          <span>← Prev</span>
        )}
      </Button>

      <span className="text-muted-foreground">
        Page {page} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        asChild={page < totalPages}
      >
        {page < totalPages ? (
          <Link href={buildQuery(searchParams, { page: String(page + 1) })}>
            Next →
          </Link>
        ) : (
          <span>Next →</span>
        )}
      </Button>
    </div>
  );
}
