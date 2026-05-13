import { ReadonlyURLSearchParams } from 'next/navigation';

export function buildQuery(
  searchParams: ReadonlyURLSearchParams,
  newParams: Record<string, string>,
): string {
  const params = new URLSearchParams(searchParams.toString());

  Object.entries(newParams).forEach(([key, value]) => {
    params.set(key, value);
  });

  return `?${params.toString()}`;
}
